/**
 * Como ela recebe: parcelas, juros e desconto no Pix.
 *
 * Decisões dela, e não do código. Cada uma mexe direto no quanto entra no
 * bolso dela, e por isso ficam na tela dela, editáveis sem passar por mim.
 *
 * O pedido típico é R$ 137 (10 lousas de R$ 13,70). Nesse valor:
 *
 *   - **parcelar ajuda a fechar venda**, e custa taxa maior
 *   - **quem paga os juros** muda quem sente: "3x de R$ 48" ou "3x de
 *     R$ 45,67 sem juros", e no segundo a diferença sai dela
 *   - **desconto no Pix** é o que mais muda a conta: taxa menor e dinheiro
 *     na hora, em vez de 30 dias
 */

export interface ComoElaRecebe {
  parcelas_max: number
  juros_por_conta_da_loja: boolean
  desconto_pix: number
  aceita_credito: boolean
  aceita_debito: boolean
  aceita_pix: boolean
}

/**
 * O que vale antes de ela decidir, e quando o banco não responde.
 *
 * À vista, sem desconto: é o que ela recebe inteiro. Um padrão que
 * parcelasse sozinho estaria decidindo por ela o que sai do bolso dela.
 */
export const PADRAO: ComoElaRecebe = {
  parcelas_max: 1,
  juros_por_conta_da_loja: false,
  desconto_pix: 0,
  aceita_credito: true,
  aceita_debito: true,
  aceita_pix: true,
}

/** O que impede de salvar, dito para ela. */
export const problemas = (config: ComoElaRecebe): string[] => {
  const achados: string[] = []

  if (!config.aceita_credito && !config.aceita_debito && !config.aceita_pix) {
    // Loja sem forma de pagamento não vende: é a loja fechada.
    achados.push('Deixe pelo menos uma forma de pagamento ligada, senão ninguém consegue comprar.')
  }

  if (config.parcelas_max < 1 || config.parcelas_max > 12) {
    achados.push('O parcelamento vai de 1 a 12 vezes.')
  }

  if (config.parcelas_max > 1 && !config.aceita_credito) {
    // Parcelar é do crédito. Sem ele, a escolha não existe.
    achados.push('Parcelar só funciona no cartão de crédito. Ligue o crédito ou deixe à vista.')
  }

  if (config.desconto_pix < 0 || config.desconto_pix > 30) {
    achados.push('O desconto no Pix vai de 0% a 30%.')
  }

  if (config.desconto_pix > 0 && !config.aceita_pix) {
    achados.push('Você desligou o Pix, mas deixou um desconto para ele. Ligue o Pix ou zere o desconto.')
  }

  return achados
}

/** Quanto a cliente paga no Pix, já com o desconto dela. */
export const valorNoPix = (total: number, config: ComoElaRecebe): number => {
  if (!config.aceita_pix || config.desconto_pix <= 0) return total

  // Centavos arredondados: dinheiro em ponto flutuante gera diferença que
  // não fecha, e quem descobre é a cliente no extrato.
  return Math.round(total * (1 - config.desconto_pix / 100) * 100) / 100
}

/**
 * O que a página do produto diz sobre parcelar.
 *
 * Vazio quando não há o que dizer: uma frase dizendo "em até 1x" é ruído,
 * e ruído na página de produto tira atenção do que faz comprar.
 *
 * O valor da parcela é o total dividido, e não uma simulação de juros: com
 * juros por conta dela é exatamente isso, e sem juros por conta dela é o
 * Mercado Pago quem calcula o acréscimo na hora, com a taxa do dia. Chutar
 * esse número aqui seria anunciar uma parcela que não vai bater.
 */
export const frasePorParcelas = (total: number, config: ComoElaRecebe): string => {
  if (!config.aceita_credito || config.parcelas_max < 2) return ''

  const parcela = total / config.parcelas_max
  const emReais = parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return config.juros_por_conta_da_loja
    ? `Em até ${config.parcelas_max}x de ${emReais} sem juros`
    : `Em até ${config.parcelas_max}x no cartão`
}

/** O que a página diz sobre o Pix. Vazio quando não há desconto. */
export const frasePix = (total: number, config: ComoElaRecebe): string => {
  if (!config.aceita_pix || config.desconto_pix <= 0) return ''

  const comDesconto = valorNoPix(total, config).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  // O número inteiro quando é inteiro: "5% de desconto" e não "5,00%".
  const porcento = Number.isInteger(config.desconto_pix)
    ? String(config.desconto_pix)
    : config.desconto_pix.toString().replace('.', ',')

  return `${comDesconto} no Pix, com ${porcento}% de desconto`
}
