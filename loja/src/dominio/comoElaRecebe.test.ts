import { describe, it, expect } from 'vitest'

import {
  PADRAO,
  frasePix,
  frasePorParcelas,
  problemas,
  valorNoPix,
  type ComoElaRecebe,
} from './comoElaRecebe'

/**
 * Como ela recebe.
 *
 * Cada teste descreve uma consequência para ela ou para a cliente. O
 * pedido típico é R$ 137: dez lousas de R$ 13,70.
 */

const como = (mudancas: Partial<ComoElaRecebe> = {}): ComoElaRecebe => ({
  ...PADRAO,
  ...mudancas,
})

describe('o que vale antes de ela decidir', () => {
  it('nasce à vista e sem desconto', () => {
    /* Um padrão que parcelasse sozinho estaria decidindo por ela o que
       sai do bolso dela. */
    expect(PADRAO.parcelas_max).toBe(1)
    expect(PADRAO.desconto_pix).toBe(0)
    expect(PADRAO.juros_por_conta_da_loja).toBe(false)
  })

  it('aceita as três formas até ela dizer o contrário', () => {
    expect(PADRAO.aceita_pix && PADRAO.aceita_credito && PADRAO.aceita_debito).toBe(true)
  })
})

describe('o que impede de salvar', () => {
  it('deixa salvar o que faz sentido', () => {
    expect(problemas(como({ parcelas_max: 3, desconto_pix: 5 }))).toEqual([])
  })

  it('não deixa desligar tudo', () => {
    // Loja sem forma de pagamento é loja fechada.
    const nada = como({ aceita_credito: false, aceita_debito: false, aceita_pix: false })
    expect(problemas(nada).join(' ')).toContain('pelo menos uma')
  })

  it('avisa que parcelar depende do crédito', () => {
    const sem = como({ parcelas_max: 3, aceita_credito: false })
    expect(problemas(sem).join(' ')).toContain('crédito')
  })

  it('avisa quando sobrou desconto de Pix desligado', () => {
    /* Sem isto, ela desliga o Pix, o desconto fica guardado, e meses
       depois religa e a loja passa a dar 10% sem ela lembrar por quê. */
    const sobrou = como({ aceita_pix: false, desconto_pix: 10 })
    expect(problemas(sobrou).join(' ')).toContain('Pix')
  })

  it('recusa desconto fora do que faz sentido', () => {
    expect(problemas(como({ desconto_pix: 50 })).join(' ')).toContain('0% a 30%')
  })
})

describe('quanto a cliente paga no Pix', () => {
  it('sem desconto, paga o mesmo', () => {
    expect(valorNoPix(137, como())).toBe(137)
  })

  it('com 5%, paga menos', () => {
    expect(valorNoPix(137, como({ desconto_pix: 5 }))).toBe(130.15)
  })

  it('arredonda no centavo', () => {
    /* Dinheiro em ponto flutuante gera diferença que não fecha, e quem
       descobre é a cliente no extrato. */
    const valor = valorNoPix(13.7, como({ desconto_pix: 7 }))
    expect(Number.isInteger(valor * 100)).toBe(true)
  })

  it('ignora o desconto se o Pix estiver desligado', () => {
    expect(valorNoPix(137, como({ aceita_pix: false, desconto_pix: 10 }))).toBe(137)
  })
})

describe('o que a página do produto diz', () => {
  it('não fala de parcela quando é à vista', () => {
    // "Em até 1x" é ruído, e ruído tira atenção do que faz comprar.
    expect(frasePorParcelas(137, como())).toBe('')
  })

  it('diz "sem juros" quando ela é quem paga os juros', () => {
    const frase = frasePorParcelas(137, como({ parcelas_max: 3, juros_por_conta_da_loja: true }))
    expect(frase).toContain('3x')
    expect(frase).toContain('sem juros')
    expect(frase).toContain('45,67')
  })

  it('não inventa o valor da parcela quando a cliente paga os juros', () => {
    /* Quem calcula o acréscimo é o Mercado Pago, com a taxa do dia.
       Chutar aqui seria anunciar uma parcela que não vai bater na hora
       de pagar. */
    const frase = frasePorParcelas(137, como({ parcelas_max: 3 }))
    expect(frase).toContain('3x')
    expect(frase).not.toContain('sem juros')
    expect(frase).not.toMatch(/R\$/)
  })

  it('não fala de parcela sem crédito', () => {
    expect(frasePorParcelas(137, como({ parcelas_max: 3, aceita_credito: false }))).toBe('')
  })

  it('só fala do Pix quando há desconto', () => {
    expect(frasePix(137, como())).toBe('')
    expect(frasePix(137, como({ desconto_pix: 5 }))).toContain('130,15')
  })

  it('escreve a porcentagem como gente escreve', () => {
    // "5% de desconto", e não "5,00%".
    expect(frasePix(137, como({ desconto_pix: 5 }))).toContain('5% de desconto')
  })
})
