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
    expect(pacoteDoPedido([{ ...LOUSA, quantidade: 10 }]).pesoG).toBeGreaterThanOrEqual(1000)
  })

  it('soma 15% sobre a conta exata', () => {
    /* Decidido pelo Maycon em 27/08. Cobre caixa, plástico bolha e fita,
       que vão junto na balança e não estão no catálogo. Ficar no valor
       exato é cotar a menos em toda venda. */
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])

    expect(pacote.pesoG).toBe(1150)
  })

  it('não exagera na folga', () => {
    // Frete alto demais afasta a cliente antes de comprar.
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])
    expect(pacote.pesoG).toBeLessThan(1300)
  })

  it('soma produtos diferentes no mesmo pedido', () => {
    const pacote = pacoteDoPedido([
      { ...LOUSA, quantidade: 10 },
      { pesoG: 70, altCm: 1, largCm: 15, compCm: 25, quantidade: 10 },
    ])

    expect(pacote.pesoG).toBeGreaterThanOrEqual(1700)
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
  it('empilha coisa plana pela espessura', () => {
    /* Dez lousas viram uma pilha, e não uma caixa dez vezes mais larga.
       A base continua sendo o tamanho de uma lousa. */
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])

    expect(pacote.largCm).toBe(19)
    expect(pacote.compCm).toBe(30)
    expect(pacote.altCm).toBeGreaterThan(15)
    expect(pacote.altCm).toBeLessThan(20)
  })

  it('coisa cúbica não vira tubo de um metro', () => {
    /* Dez canecas de 10,5 x 11 x 11 empilhadas davam 105 x 11 x 11: um
       tubo de um metro. Ninguém embala assim, e os Correios recusam
       pacote com lado acima de um metro. Ela põe lado a lado. */
    const CANECA = { pesoG: 100, altCm: 10.5, largCm: 11, compCm: 11 }
    const pacote = pacoteDoPedido([{ ...CANECA, quantidade: 10 }])

    const maiorLado = Math.max(pacote.altCm, pacote.largCm, pacote.compCm)
    expect(maiorLado).toBeLessThan(100)
    // E cabe: nenhum lado menor do que a peça.
    expect(Math.min(pacote.altCm, pacote.largCm, pacote.compCm)).toBeGreaterThanOrEqual(11)
  })

  it('a caixa comporta o volume das peças', () => {
    // Caixa menor do que o que vai dentro não existe.
    const pacote = pacoteDoPedido([{ ...LOUSA, quantidade: 10 }])
    const daCaixa = pacote.altCm * pacote.largCm * pacote.compCm
    const dasPecas = 1.5 * 19 * 30 * 10

    expect(daCaixa).toBeGreaterThanOrEqual(dasPecas)
  })

  it('a caixa fica do tamanho do maior item', () => {
    const pacote = pacoteDoPedido([
      { pesoG: 50, altCm: 1, largCm: 15, compCm: 25, quantidade: 1 },
      { ...LOUSA, quantidade: 1 },
    ])

    expect(pacote.largCm).toBe(19)
    expect(pacote.compCm).toBe(30)
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
