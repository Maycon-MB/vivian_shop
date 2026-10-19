import { describe, it, expect } from 'vitest'

import { recadoDoPagamento, RECADOS_DE_RECUSA } from './recadoDoPagamento'

/**
 * O que a cliente lê quando o pagamento não aprova na hora.
 *
 * A medição de qualidade do Mercado Pago conta isto: recusa explicada com
 * o motivo e com o que a pessoa pode fazer. "O pagamento não passou" para
 * tudo faz a cliente tentar o mesmo cartão três vezes e desistir.
 */

describe('o recado de quando o pagamento não aprova na hora', () => {
  it('diz para conferir o código quando ela errou o código de segurança', () => {
    const recado = recadoDoPagamento({
      estado: 'rejected',
      detalhe: 'cc_rejected_bad_filled_security_code',
    })

    expect(recado.tipo).toBe('recusado')
    expect(recado.texto).toMatch(/código de segurança/)
  })

  it('não diz "pendente" para um cartão recusado por motivo que não conhecemos', () => {
    /* Recusa com detalhe novo caía no texto de pendente: a cliente
       fechava a página achando que tinha pago, e o pedido nunca saía. */
    const recado = recadoDoPagamento({ estado: 'rejected', detalhe: 'motivo_novo_do_mp' })

    expect(recado.tipo).toBe('recusado')
    expect(recado.texto).not.toMatch(/pendente/i)
    expect(recado.texto).toMatch(/não passou/)
  })

  it('avisa que está em análise, sem pedir para pagar de novo', () => {
    const recado = recadoDoPagamento({ estado: 'in_process', detalhe: 'pending_review_manual' })

    expect(recado.tipo).toBe('pendente')
    expect(recado.texto).toMatch(/análise/)
    expect(recado.texto).not.toMatch(/tente outro cartão/i)
  })

  it('não oferece outro cartão para quem já pagou o mesmo valor', () => {
    const recado = recadoDoPagamento({
      estado: 'rejected',
      detalhe: 'cc_rejected_duplicated_payment',
    })

    expect(recado.texto).toMatch(/já fez um pagamento/)
  })

  it('tem recado para cada recusa de cartão da tabela do Mercado Pago', () => {
    const daTabela = [
      'cc_rejected_bad_filled_card_number',
      'cc_rejected_bad_filled_date',
      'cc_rejected_bad_filled_other',
      'cc_rejected_bad_filled_security_code',
      'cc_rejected_blacklist',
      'cc_rejected_call_for_authorize',
      'cc_rejected_card_disabled',
      'cc_rejected_card_error',
      'cc_rejected_duplicated_payment',
      'cc_rejected_high_risk',
      'cc_rejected_insufficient_amount',
      'cc_rejected_invalid_installments',
      'cc_rejected_max_attempts',
      'cc_rejected_other_reason',
      'cc_rejected_card_type_not_allowed',
      'cc_rejected_3ds_mandatory',
      'cc_amount_rate_limit_exceeded',
      'rejected_by_bank',
      'rejected_insufficient_data',
      'rejected_by_regulations',
      'insufficient_amount',
      'bank_error',
    ]

    for (const detalhe of daTabela) expect(RECADOS_DE_RECUSA[detalhe], detalhe).toBeTruthy()
  })

  it('não promete e-mail da loja nem usa travessão', () => {
    /* Nenhum e-mail de pedido sai da loja, e o travessão é regra do
       projeto para tudo que a cliente lê. */
    const todos = [
      ...Object.values(RECADOS_DE_RECUSA),
      recadoDoPagamento({ estado: 'in_process', detalhe: 'pending_contingency' }).texto,
      recadoDoPagamento({ estado: 'pending', detalhe: 'pending_challenge' }).texto,
      recadoDoPagamento({ estado: 'rejected', detalhe: '' }).texto,
    ]

    for (const texto of todos) {
      expect(texto).not.toContain('—')
      expect(texto).not.toMatch(/e-mail/i)
    }
  })
})
