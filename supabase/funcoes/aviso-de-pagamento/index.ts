/**
 * O endereço que o Mercado Pago chama quando uma compra muda de estado.
 *
 * Este arquivo é só a casca: fala HTTP, fala com o banco, confere
 * assinatura. Toda decisão sobre o que fazer com o aviso mora em
 * `loja/src/dominio/avisoDePagamento.ts`, que é regra pura e tem teste.
 * Aqui não há `if` de negócio nenhum, de propósito: o que roda em produção
 * sem teste automático precisa ser pequeno o bastante para caber na
 * cabeça.
 *
 * Três coisas que este arquivo nunca faz, e cada uma tem motivo:
 *
 *   1. **Não confia no corpo do aviso.** Ele diz "o pagamento 123 mudou",
 *      e nada além disso. O valor e o estado vêm de uma consulta à API do
 *      Mercado Pago, com a nossa credencial.
 *   2. **Não responde erro para aviso que ele entendeu.** O Mercado Pago
 *      reenvia enquanto não receber 200, e reenvio eterno de um aviso que
 *      já foi tratado é ruído que esconde problema de verdade.
 *   3. **Não cria pedido.** Se o aviso aponta para pedido que não existe,
 *      isso fica registrado para alguém olhar.
 *
 * Variáveis necessárias (nenhuma delas vai para o navegador):
 *   MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET,
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

import {
  decidirSobreAviso,
  montarManifesto,
  partesDaAssinatura,
  type Estado,
} from '../../../loja/src/dominio/avisoDePagamento.ts'

const variavel = (nome: string): string => {
  const valor = Deno.env.get(nome)
  if (!valor) throw new Error(`falta a variável ${nome}`)
  return valor
}

/**
 * Compara duas assinaturas sem entregar de brinde onde elas divergem.
 *
 * Comparar com `===` termina no primeiro caractere diferente, e o tempo
 * dessa comparação conta quantos caracteres bateram. Com paciência isso
 * permite adivinhar a assinatura correta, um caractere por vez.
 */
const iguaisEmTempoConstante = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false

  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)

  return diferenca === 0
}

const emHexa = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const assinaturaConfere = async (
  manifesto: string,
  esperada: string,
  segredo: string,
): Promise<boolean> => {
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const resumo = await crypto.subtle.sign(
    'HMAC',
    chave,
    new TextEncoder().encode(manifesto),
  )

  return iguaisEmTempoConstante(emHexa(resumo), esperada.toLowerCase())
}

interface PagamentoDoMercadoPago {
  id: number | string
  status: string
  transaction_amount: number
  external_reference: string | null
}

const buscarPagamento = async (id: string): Promise<PagamentoDoMercadoPago> => {
  const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${variavel('MERCADOPAGO_ACCESS_TOKEN')}` },
  })

  if (!resposta.ok) {
    throw new Error(`o Mercado Pago respondeu ${resposta.status} ao consultar ${id}`)
  }

  return await resposta.json()
}

Deno.serve(async (requisicao: Request): Promise<Response> => {
  if (requisicao.method !== 'POST') {
    return new Response('só POST', { status: 405 })
  }

  const assinatura = partesDaAssinatura(requisicao.headers.get('x-signature'))
  const requestId = requisicao.headers.get('x-request-id') ?? ''

  const corpo = await requisicao.json().catch(() => null)
  const idDoPagamento = String(corpo?.data?.id ?? '')

  // Sem id não há o que consultar. 200 mesmo assim: reenviar não vai fazer
  // aparecer um id que nunca veio.
  if (!idDoPagamento) return new Response('sem id de pagamento', { status: 200 })

  if (!assinatura) return new Response('sem assinatura', { status: 401 })

  const confere = await assinaturaConfere(
    montarManifesto({ id: idDoPagamento, requestId, ts: assinatura.ts }),
    assinatura.v1,
    variavel('MERCADOPAGO_WEBHOOK_SECRET'),
  )

  // 401 aqui é de propósito: aviso não assinado não é aviso do Mercado
  // Pago, e não deve virar 200 silencioso.
  if (!confere) return new Response('assinatura não confere', { status: 401 })

  const banco = createClient(variavel('SUPABASE_URL'), variavel('SUPABASE_SERVICE_ROLE_KEY'))

  const pagamento = await buscarPagamento(idDoPagamento)
  const referencia = pagamento.external_reference ?? ''

  const { data: pedido } = await banco
    .from('pedidos')
    .select('id, numero, total, estado_pagamento')
    .eq('numero', referencia)
    .maybeSingle()

  // O registro do evento é o que decide se já processamos: a restrição de
  // unicidade no banco resolve a corrida entre dois avisos iguais que
  // cheguem ao mesmo tempo, coisa que um "select antes de inserir" não
  // resolveria.
  const { error: erroDoEvento } = await banco.from('eventos_de_pagamento').insert({
    externo_id: String(pagamento.id),
    status_externo: pagamento.status,
    pedido_id: pedido?.id ?? null,
    corpo,
  })

  const jaProcessado = erroDoEvento?.code === '23505'
  if (erroDoEvento && !jaProcessado) throw erroDoEvento

  const decisao = decidirSobreAviso({
    pagamento: {
      id: String(pagamento.id),
      status: pagamento.status,
      valor: pagamento.transaction_amount,
      referencia,
    },
    pedido: pedido
      ? {
          numero: pedido.numero,
          total: Number(pedido.total),
          estadoPagamento: pedido.estado_pagamento as Estado,
        }
      : null,
    jaProcessado,
  })

  if (decisao.acao === 'atualizar' && pedido) {
    await banco
      .from('pedidos')
      .update({ estado_pagamento: decisao.estado, pagamento_externo_id: String(pagamento.id) })
      .eq('id', pedido.id)
  }

  if (decisao.acao === 'conferir' && pedido) {
    await banco.from('pedidos').update({ precisa_conferir: decisao.motivo }).eq('id', pedido.id)
  }

  await banco
    .from('eventos_de_pagamento')
    .update({ decisao: decisao.acao })
    .eq('externo_id', String(pagamento.id))
    .eq('status_externo', pagamento.status)

  // Sempre 200 daqui para baixo: o aviso foi entendido, mesmo quando a
  // decisão foi não mexer em nada.
  return new Response(JSON.stringify(decisao), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
})
