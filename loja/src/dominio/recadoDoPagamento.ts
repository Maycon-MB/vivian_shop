/**
 * O resultado do Mercado Pago dito para a cliente, e não para o sistema.
 *
 * Os textos seguem a tabela de `status_detail` deles, reescrita na voz da
 * loja. A medição de qualidade cobra recusa explicada: com o motivo, a
 * cliente troca de cartão ou vai para o Pix em vez de desistir.
 */

export type TipoDoRecado = 'aprovado' | 'pendente' | 'recusado'

const OUTRO_MEIO = 'Tente outro cartão, ou pague no Pix.'

export const RECADOS_DE_RECUSA: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Confira o número do cartão.',
  cc_rejected_bad_filled_date: 'Confira a validade do cartão.',
  cc_rejected_bad_filled_other: 'Confira os dados do cartão.',
  cc_rejected_bad_filled_security_code: 'Confira o código de segurança do cartão.',
  cc_rejected_blacklist: `Não foi possível pagar com esse cartão. ${OUTRO_MEIO}`,
  cc_rejected_call_for_authorize:
    'O seu banco precisa autorizar essa compra. Ligue para eles, ou pague no Pix.',
  cc_rejected_card_disabled: 'O cartão está desativado. Ligue para o seu banco, ou pague no Pix.',
  cc_rejected_card_error: `Não foi possível pagar com esse cartão. ${OUTRO_MEIO}`,
  cc_rejected_duplicated_payment:
    'Você já fez um pagamento desse valor. Se precisa pagar de novo, use outro cartão ou o Pix.',
  cc_rejected_high_risk: `O pagamento foi recusado pelo banco. ${OUTRO_MEIO}`,
  cc_rejected_insufficient_amount: `O cartão não tem limite para esse valor. ${OUTRO_MEIO}`,
  cc_rejected_invalid_installments:
    'O cartão não aceita esse número de parcelas. Escolha outro número de parcelas.',
  cc_rejected_max_attempts: `Você chegou ao limite de tentativas com esse cartão. ${OUTRO_MEIO}`,
  cc_rejected_other_reason: `O banco não aprovou o pagamento. ${OUTRO_MEIO}`,
  cc_rejected_card_type_not_allowed:
    'Esse cartão não está liberado para crédito. Tente no débito, outro cartão, ou o Pix.',
  cc_rejected_3ds_mandatory: `O banco pediu uma confirmação que não foi feita. ${OUTRO_MEIO}`,
  cc_amount_rate_limit_exceeded: `O valor passou do limite desse cartão. ${OUTRO_MEIO}`,
  rejected_by_bank: `O banco não aprovou o pagamento. ${OUTRO_MEIO}`,
  rejected_insufficient_data: 'Faltou algum dado do pagamento. Confira os dados e tente de novo.',
  rejected_by_regulations: `Não foi possível pagar com esse cartão. ${OUTRO_MEIO}`,
  insufficient_amount: `Não há saldo para esse valor. ${OUTRO_MEIO}`,
  bank_error: 'O banco teve um problema ao processar. Tente de novo em alguns minutos.',
}

const RECUSA_SEM_MOTIVO = `O pagamento não passou. ${OUTRO_MEIO}`

const RECADOS_DE_ESPERA: Record<string, string> = {
  pending_contingency:
    'Estamos processando o pagamento. Em até 2 dias úteis ele aparece em Minha conta.',
  pending_review_manual:
    'O pagamento está em análise. Em até 2 dias úteis o resultado aparece em Minha conta.',
  pending_challenge: 'Falta confirmar o pagamento no aplicativo do seu banco.',
}

const ESPERA_SEM_MOTIVO =
  'O pagamento ficou pendente. Assim que o banco confirmar, o pedido aparece como pago em Minha conta.'

/** `estado` e `detalhe` são o `status` e o `status_detail` do pagamento. */
export const recadoDoPagamento = ({
  estado,
  detalhe,
}: {
  estado: string
  detalhe?: string | null
}): { tipo: TipoDoRecado; texto: string } => {
  if (estado === 'approved') return { tipo: 'aprovado', texto: 'Pagamento aprovado.' }

  if (estado === 'rejected' || estado === 'cancelled') {
    return { tipo: 'recusado', texto: RECADOS_DE_RECUSA[detalhe ?? ''] ?? RECUSA_SEM_MOTIVO }
  }

  return { tipo: 'pendente', texto: RECADOS_DE_ESPERA[detalhe ?? ''] ?? ESPERA_SEM_MOTIVO }
}
