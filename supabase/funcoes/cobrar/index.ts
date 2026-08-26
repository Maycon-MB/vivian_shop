/**
 * Cobra o pedido no Mercado Pago.
 *
 * O cartão nunca passa por aqui. Quem digita os números é a cliente, nos
 * campos do próprio Mercado Pago desenhados dentro da loja pelo Checkout
 * Bricks, e o que chega nesta função é um **token** que representa aquele
 * cartão naquela compra.
 *
 * É a diferença entre a loja dela precisar de certificação PCI-DSS e não
 * precisar. Se um campo de número de cartão fosse nosso, o dado passaria
 * pelo nosso código, e o risco ficaria no CPF dela.
 *
 * ── O valor não vem do navegador ────────────────────────────────────────
 *
 * O que chega é o **id do pedido**, e nunca quanto cobrar. A função lê o
 * total na tabela `pedidos`, que por sua vez foi calculado pelo banco a
 * partir do preço dos produtos. Aceitar o valor de fora seria deixar
 * escolher quanto pagar, e isso não melhora por estar num servidor.
 *
 * Publicar:
 *
 *     supabase functions deploy cobrar
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // A loja é servida do domínio dela, e é de lá que a chamada vem.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  })

interface Cobranca {
  pedido_id: string
  /** O cartão tokenizado pelo Mercado Pago, no navegador dela. */
  token?: string
  /** "pix", "master", "visa"… vem do Bricks. */
  meio: string
  parcelas?: number
  /** O e-mail de quem está pagando, exigido pelo Mercado Pago. */
  email: string
  documento?: { tipo: string; numero: string }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return responder({}, 200)

  const chave = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!chave) return responder({ erro: 'pagamento não está configurado' }, 500)

  let cobranca: Cobranca
  try {
    cobranca = await req.json()
  } catch {
    return responder({ erro: 'corpo inválido' }, 400)
  }

  if (!cobranca?.pedido_id) return responder({ erro: 'falta o pedido' }, 400)

  /* A chave de serviço lê o pedido apesar das políticas, e é por isso que
     ela nunca sai do servidor: com ela, qualquer um leria os pedidos de
     todas as clientes dela. */
  const banco = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: pedido, error } = await banco
    .from('pedidos')
    .select('id, numero, total, estado_pagamento, comprador_nome, comprador_email')
    .eq('id', cobranca.pedido_id)
    .maybeSingle()

  if (error || !pedido) return responder({ erro: 'pedido não encontrado' }, 404)

  /* Pedido já pago não é cobrado de novo. Sem isto, recarregar a página de
     pagamento cobraria a cliente duas vezes, e quem descobre é ela no
     extrato. */
  if (pedido.estado_pagamento === 'aprovado') {
    return responder({ estado: 'aprovado', ja_estava: true })
  }

  const resposta = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
      /* Se a mesma cobrança for mandada duas vezes, o Mercado Pago
         reconhece pela chave e devolve o mesmo pagamento, em vez de criar
         outro. É a rede contra o toque duplo e contra a internet oscilando
         no meio. */
      'X-Idempotency-Key': `pedido-${pedido.id}`,
    },
    body: JSON.stringify({
      // O valor lido do banco, e nunca o que veio na chamada.
      transaction_amount: Number(pedido.total),
      description: `Pedido ${pedido.numero} - Feito para Você! Personalizados`,
      payment_method_id: cobranca.meio,
      ...(cobranca.token ? { token: cobranca.token } : {}),
      ...(cobranca.parcelas ? { installments: cobranca.parcelas } : {}),
      payer: {
        email: cobranca.email || pedido.comprador_email,
        ...(cobranca.documento
          ? { identification: { type: cobranca.documento.tipo, number: cobranca.documento.numero } }
          : {}),
      },
      external_reference: pedido.id,
    }),
  })

  const pago = await resposta.json()

  if (!resposta.ok) {
    // O motivo do Mercado Pago vai junto: "saldo insuficiente" ajuda a
    // cliente a resolver; "erro 400" não.
    return responder({ erro: pago?.message ?? 'o pagamento não passou', detalhe: pago }, 502)
  }

  /* Guarda o id do pagamento para o aviso saber a qual pedido pertence.
     O estado ainda NÃO é gravado como aprovado aqui: quem decide isso é o
     aviso conferido, e não a resposta desta chamada. */
  await banco
    .from('pedidos')
    .update({ pagamento_externo_id: String(pago.id), atualizado_em: new Date().toISOString() })
    .eq('id', pedido.id)

  return responder({
    id: pago.id,
    estado: pago.status,
    detalhe: pago.status_detail,
    // Só no Pix: o QR code que a cliente vê na própria tela.
    qr: pago.point_of_interaction?.transaction_data?.qr_code ?? null,
    qr_imagem: pago.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
  })
})
