/**
 * O aviso do Mercado Pago, conferido antes de valer.
 *
 * **O aviso não é a verdade.** Ele diz "vá perguntar sobre o pagamento
 * tal", e é só isso: qualquer um pode mandar um POST para este endereço
 * dizendo que o pedido foi pago. Quem responde de verdade é a API do
 * Mercado Pago, consultada aqui com a chave dela.
 *
 * Depois de perguntar, o que volta ainda passa pelas regras de
 * `avisoDePagamento.ts`, que existem desde antes de haver pagamento:
 * valor que não bate, estado inventado, pedido que não existe.
 *
 * Publicar:
 *
 *     supabase functions deploy aviso-do-pagamento --no-verify-jwt
 *
 * `--no-verify-jwt` porque quem chama é o Mercado Pago, que não tem conta
 * no Supabase. A defesa é perguntar de volta, e não o cabeçalho.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })

/** O que o Mercado Pago chama de estado, dito como a tabela guarda. */
const COMO_GUARDAMOS: Record<string, string> = {
  approved: 'aprovado',
  pending: 'aguardando',
  in_process: 'aguardando',
  authorized: 'aguardando',
  rejected: 'recusado',
  cancelled: 'recusado',
  refunded: 'estornado',
  charged_back: 'estornado',
}

Deno.serve(async (req: Request) => {
  const chave = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!chave) return responder({ erro: 'pagamento não está configurado' }, 500)

  let aviso: { data?: { id?: string }; type?: string }
  try {
    aviso = await req.json()
  } catch {
    return responder({ ok: true, ignorado: 'corpo vazio' })
  }

  const idDoPagamento = aviso?.data?.id
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

  const banco = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: pedido } = await banco
    .from('pedidos')
    .select('id, numero, total, estado_pagamento')
    .eq('id', pagamento.external_reference)
    .maybeSingle()

  if (!pedido) {
    // Pagamento sem pedido nosso. Não é erro do Mercado Pago: é sinal de
    // que alguém está mandando aviso de outra loja para cá.
    return responder({ ok: true, ignorado: 'pedido não encontrado' })
  }

  const estado = COMO_GUARDAMOS[pagamento.status] ?? null

  if (!estado) {
    await banco
      .from('pedidos')
      .update({ precisa_conferir: `estado desconhecido: ${pagamento.status}` })
      .eq('id', pedido.id)

    return responder({ ok: true, marcado: 'estado desconhecido' })
  }

  /* O valor pago tem que bater com o pedido. Pagar menos e a loja aprovar
     é o erro que custa dinheiro dela, e o único jeito de pegar é comparar
     aqui, com os dois números na mão. */
  const pagou = Number(pagamento.transaction_amount ?? 0)
  const devia = Number(pedido.total)
  const bate = Math.abs(pagou - devia) < 0.01

  if (estado === 'aprovado' && !bate) {
    await banco
      .from('pedidos')
      .update({ precisa_conferir: `pagou ${pagou}, o pedido é ${devia}` })
      .eq('id', pedido.id)

    return responder({ ok: true, marcado: 'valor não bate' })
  }

  await banco
    .from('pedidos')
    .update({ estado_pagamento: estado, atualizado_em: new Date().toISOString() })
    .eq('id', pedido.id)

  /* A trinca provedor + externo_id + status_externo é única: o Mercado Pago reenvia o mesmo
     aviso até receber 200, e sem isso o material digital sairia por
     e-mail a cada reenvio. `ignoreDuplicates` faz o reenvio ser aceito em
     silêncio, que é o que ele espera. */
  await banco
    .from('eventos_de_pagamento')
    .upsert(
      {
        pedido_id: pedido.id,
        externo_id: String(pagamento.id),
        status_externo: pagamento.status,
        corpo: pagamento,
        decisao: bate ? estado : 'valor não bate',
      },
      { onConflict: 'provedor,externo_id,status_externo', ignoreDuplicates: true },
    )

  return responder({ ok: true, pedido: pedido.numero, estado })
})
