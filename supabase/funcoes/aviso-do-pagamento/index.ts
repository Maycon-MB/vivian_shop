/**
 * O aviso do Mercado Pago, conferido antes de valer.
 *
 * **O aviso não é a verdade.** Ele diz "vá perguntar sobre o pagamento
 * tal", e é só isso: qualquer um pode mandar um POST para este endereço
 * dizendo que o pedido foi pago. Quem responde de verdade é a API do
 * Mercado Pago, consultada aqui com a chave dela.
 *
 * Depois de perguntar, o que volta passa por `processarAviso`, de
 * `avisoDePagamento.ts`: aviso repetido, aviso fora de ordem, valor que não
 * bate, estado inventado, pedido que não existe.
 *
 * Publicar:
 *
 *     node scripts/subir-funcoes.mjs aviso-do-pagamento
 *
 * Sem verificação de JWT porque quem chama é o Mercado Pago, que não tem
 * conta no Supabase. A defesa é perguntar de volta; a `x-signature`, quando
 * `MERCADOPAGO_SEGREDO_DO_AVISO` existe, barra o aviso falso antes disso.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

import {
  processarAviso,
  type BancoDoAviso,
  type Estado,
} from '../../../loja/src/dominio/avisoDePagamento.ts'
import { conferirAssinatura, decidirPelaAssinatura } from '../../../loja/src/dominio/assinaturaDoAviso.ts'

const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })

/* `pedidos.id` é uuid: referência de outro formato faria o Postgres
   responder erro, e erro aqui vira reenvio sem fim do Mercado Pago. */
const PARECE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req: Request) => {
  const chave = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!chave) return responder({ erro: 'pagamento não está configurado' }, 500)

  /* O Mercado Pago assina o `data.id` do endereço, e não o do corpo: é o
     do endereço que vale quando os dois vêm. */
  const idDaUrl = new URL(req.url).searchParams.get('data.id')

  const segredo = Deno.env.get('MERCADOPAGO_SEGREDO_DO_AVISO')
  if (segredo) {
    const resultado = await conferirAssinatura({
      assinatura: req.headers.get('x-signature'),
      requestId: req.headers.get('x-request-id'),
      dataId: idDaUrl,
      segredo,
    })
    const exigir = Deno.env.get('MERCADOPAGO_EXIGIR_ASSINATURA') === 'true'
    if (decidirPelaAssinatura({ resultado, exigir }) === 'recusar') {
      console.warn('aviso-do-pagamento: assinatura', resultado, 'pagamento', idDaUrl)
      return responder({ erro: 'assinatura inválida' }, 401)
    }
    if (resultado === 'ausente') console.warn('aviso-do-pagamento: aviso sem assinatura', idDaUrl)
  }

  let aviso: { data?: { id?: string }; type?: string }
  try {
    aviso = await req.json()
  } catch {
    aviso = {}
  }

  /* Aviso de outro tipo (`chargebacks`, `merchant_order`) com o id indo
     para /v1/payments daria 404, 502 e reenvio sem fim. */
  const tipo = aviso?.type ?? new URL(req.url).searchParams.get('type')
  if (tipo && tipo !== 'payment') return responder({ ok: true, ignorado: `tipo ${tipo}` })

  const idDoCorpo = aviso?.data?.id ? String(aviso.data.id) : null
  if (idDaUrl && idDoCorpo && idDaUrl !== idDoCorpo) {
    return responder({ erro: 'o id do endereço e o do corpo não batem' }, 400)
  }

  const idDoPagamento = idDaUrl ?? idDoCorpo
  if (!idDoPagamento) return responder({ ok: true, ignorado: 'sem id' })

  /* Aqui está a parte que importa: o que o aviso disse é ignorado, e o
     estado vem de perguntar ao Mercado Pago. */
  const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${idDoPagamento}`, {
    headers: { Authorization: `Bearer ${chave}` },
  })

  if (!resposta.ok) {
    /* Devolver 200 faria o Mercado Pago parar de tentar. Devolvendo erro,
       ele reenvia, e um problema de rede momentâneo não vira pedido pago
       que ninguém marcou. */
    return responder({ erro: 'não consegui confirmar com o Mercado Pago' }, 502)
  }

  const pagamento = await resposta.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const banco: BancoDoAviso = {
    lerPedido: async (id) => {
      if (!PARECE_UUID.test(id)) return null
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, numero, total, estado_pagamento')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return {
        id: data.id,
        numero: data.numero,
        total: Number(data.total),
        estadoPagamento: data.estado_pagamento as Estado,
      }
    },

    avisoJaProcessado: async (externoId, statusExterno) => {
      const { count, error } = await supabase
        .from('eventos_de_pagamento')
        .select('id', { count: 'exact', head: true })
        .eq('provedor', 'mercadopago')
        .eq('externo_id', externoId)
        .eq('status_externo', statusExterno)
      if (error) throw error
      return (count ?? 0) > 0
    },

    /* A trava pelo estado lido é o que impede dois avisos simultâneos de
       gravarem os dois: o segundo encontra zero linhas. */
    mudarEstado: async (pedidoId, de, para) => {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ estado_pagamento: para, atualizado_em: new Date().toISOString() })
        .eq('id', pedidoId)
        .eq('estado_pagamento', de)
        .select('id')
      if (error) throw error
      return (data ?? []).length === 1
    },

    marcarParaConferir: async (pedidoId, motivo) => {
      const { error } = await supabase
        .from('pedidos')
        .update({ precisa_conferir: motivo })
        .eq('id', pedidoId)
      if (error) throw error
    },

    /* `ignoreDuplicates` porque dois reenvios podem passar juntos pela
       conferência de "já processado"; a restrição única decide. */
    registrarAviso: async ({ pedidoId, externoId, statusExterno, corpo, decisao }) => {
      const { error } = await supabase.from('eventos_de_pagamento').upsert(
        {
          pedido_id: pedidoId,
          externo_id: externoId,
          status_externo: statusExterno,
          corpo,
          decisao,
        },
        { onConflict: 'provedor,externo_id,status_externo', ignoreDuplicates: true },
      )
      if (error) throw error
    },
  }

  try {
    const { decisao, tentarDeNovo } = await processarAviso({
      pagamento: {
        id: String(pagamento.id),
        status: String(pagamento.status ?? ''),
        valor: Number(pagamento.transaction_amount ?? 0),
        referencia: String(pagamento.external_reference ?? ''),
      },
      corpo: pagamento,
      banco,
    })

    /* 409 em vez de 200: o Mercado Pago só reenvia o que não recebeu 200. */
    if (tentarDeNovo) return responder({ erro: 'o pedido mudou durante o aviso' }, 409)

    return responder({ ok: true, decisao })
  } catch (erro) {
    /* Erro de banco com 200 perderia o pagamento em silêncio; com 500 o
       Mercado Pago reenvia. */
    console.error('aviso-do-pagamento falhou:', erro, 'pagamento', idDoPagamento)
    return responder({ erro: 'não consegui gravar o aviso' }, 500)
  }
})
