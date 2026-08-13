import { describe, it, expect } from 'vitest'

import { freteSimulado } from './freteSimulado'

/**
 * O frete é a conta que, se estiver errada, sai do bolso da Vivian: ela
 * cobra o que a loja disse e paga o que a transportadora cobrar. Por isso
 * o que se testa aqui não é "roda sem quebrar", e sim que a regra do peso
 * cubado e a diferença por região continuem valendo.
 */

const CAIXA_PEQUENA = { pesoG: 900, altCm: 10, largCm: 15, compCm: 20 }

describe('cotação de frete', () => {
  it('devolve as três opções, da mais barata para a mais cara', async () => {
    const opcoes = await freteSimulado.cotar({ cepDestino: '20040-020', ...CAIXA_PEQUENA })

    expect(opcoes).toHaveLength(3)
    expect(opcoes.map((o) => o.id)).toEqual(['pac', 'jadlog-package', 'sedex'])

    const valores = opcoes.map((o) => o.valor)
    expect(valores).toEqual([...valores].sort((a, b) => a - b))
  })

  it('cobra o peso cubado quando a caixa é grande e leve', async () => {
    // 40 × 40 × 40 ÷ 6000 = 10,67 kg cobráveis, contra 0,5 kg na balança.
    const grandeELeve = await freteSimulado.cotar({
      cepDestino: '20040-020',
      pesoG: 500,
      altCm: 40,
      largCm: 40,
      compCm: 40,
    })

    const pequenaEPesada = await freteSimulado.cotar({
      cepDestino: '20040-020',
      pesoG: 500,
      altCm: 10,
      largCm: 10,
      compCm: 10,
    })

    expect(grandeELeve[0].valor).toBeGreaterThan(pequenaEPesada[0].valor)
  })

  it('cobra mais caro e promete mais dias quanto mais longe da origem', async () => {
    const dentroDoRio = await freteSimulado.cotar({ cepDestino: '20040-020', ...CAIXA_PEQUENA })
    const paraOCeara = await freteSimulado.cotar({ cepDestino: '60000-000', ...CAIXA_PEQUENA })

    expect(paraOCeara[0].valor).toBeGreaterThan(dentroDoRio[0].valor)
    expect(paraOCeara[0].prazoDias).toBeGreaterThan(dentroDoRio[0].prazoDias)
  })

  it('nunca cobra abaixo do peso mínimo', async () => {
    const quaseNada = await freteSimulado.cotar({
      cepDestino: '20040-020',
      pesoG: 1,
      altCm: 1,
      largCm: 1,
      compCm: 1,
    })

    // 0,3 kg de piso × R$ 4,20 + R$ 18,90 de taxa = R$ 20,16.
    expect(quaseNada[0].valor).toBeCloseTo(20.16, 2)
  })

  it('aceita CEP escrito com traço, com ponto ou só com números', async () => {
    const comTraco = await freteSimulado.cotar({ cepDestino: '20040-020', ...CAIXA_PEQUENA })
    const semNada = await freteSimulado.cotar({ cepDestino: '20040020', ...CAIXA_PEQUENA })
    const comEspaco = await freteSimulado.cotar({ cepDestino: '20040 020', ...CAIXA_PEQUENA })

    expect(comTraco[0].valor).toBe(semNada[0].valor)
    expect(comEspaco[0].valor).toBe(semNada[0].valor)
  })

  it('explica o que fazer quando o CEP está incompleto', async () => {
    await expect(
      freteSimulado.cotar({ cepDestino: '2004', ...CAIXA_PEQUENA }),
    ).rejects.toThrow(/8 números/)
  })

  it('não se apresenta como serviço de verdade', () => {
    expect(freteSimulado.real).toBe(false)
  })
})
