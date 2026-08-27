import { describe, it, expect } from 'vitest'

import { pacoteDoPedido } from './pacoteDoPedido'

/**
 * O pacote que vai ser postado.
 *
 * Cada teste aqui é sobre dinheiro dela: cotar frete a menos tira a
 * diferença do bolso dela em toda venda, e ela só descobre no balcão dos
 * Correios.
 */

/* Os números são os do catálogo dela: a Lousa Mágica está registrada com
   100 g e caixa de 1,5 × 19 × 30 cm. */
const LOUSA = { pesoG: 100, altCm: 1.5, largCm: 19, compCm: 30 }

describe('o peso do pacote', () => {
  it('soma cada peça, sem dividir por nada', () => {
    /* A conta antiga era `pesoG * quantidade / minimo`, e dez lousas de
       100 g viravam 100 g na cotação. A loja cotava cem gramas e postava
       um quilo. */
    expect(pacoteDoPedido([{ ...LOUSA, quantidade: 10 }]).pesoG).toBe(1000)
  })

  it('soma produtos diferentes no mesmo pedido', () => {
    const pacote = pacoteDoPedido([
      { ...LOUSA, quantidade: 10 },
      { pesoG: 70, altCm: 1, largCm: 15, compCm: 25, quantidade: 10 },
    ])

    expect(pacote.pesoG).toBe(1700)
  })

  it('nunca cota abaixo do mínimo dos Correios', () => {
    // Caixa minúscula ainda ocupa lugar e dá trabalho.
    expect(pacoteDoPedido([{ pesoG: 20, quantidade: 1 }]).pesoG).toBe(300)
  })

  it('não quebra com carrinho vazio', () => {
    expect(pacoteDoPedido([]).pesoG).toBe(300)
  })
})

describe('as medidas da caixa', () => {
  it('empilha pela menor dimensão, que é a espessura', () => {
    /* Dez lousas viram uma pilha de quinze centímetros, e não uma caixa
       dez vezes mais larga. 1,5 cm é a espessura de uma. */
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])

    expect(pacote.altCm).toBe(15)
    expect(pacote.largCm).toBe(19)
    expect(pacote.compCm).toBe(30)
  })

  it('a caixa fica do tamanho do maior item', () => {
    const pacote = pacoteDoPedido([
      { pesoG: 50, altCm: 1, largCm: 15, compCm: 25, quantidade: 1 },
      { ...LOUSA, quantidade: 1 },
    ])

    expect(pacote.largCm).toBe(19)
    expect(pacote.compCm).toBe(30)
    expect(pacote.altCm).toBe(2.5)
  })

  it('o peso cubado de dez lousas passa do peso real', () => {
    /* 15 × 19 × 30 ÷ 6000 dá 1,425 kg, contra 1 kg de balança. A
       transportadora cobra pelo maior dos dois, e por isso a medida da
       caixa importa tanto quanto o peso. */
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])
    const cubado = (pacote.altCm * pacote.largCm * pacote.compCm) / 6000

    expect(cubado).toBeGreaterThan(pacote.pesoG / 1000)
  })
})
