import { describe, it, expect } from 'vitest'

import {
  QUANTOS_DE_CARA,
  paraAVitrine,
  quantosProdutos,
  type ProdutoDoTema,
  type TemaCru,
} from './vitrineDeTemas'

/**
 * A vitrine de temas.
 *
 * O que estava no ar até 25/08 eram 140 caixas de texto sem foto, em
 * ordem alfabética quebrada, antes da primeira foto de produto.
 */

const tema = (slug: string, nome: string, quantos: number): TemaCru => ({ slug, nome, quantos })

const produto = (tema: string, mini?: string): ProdutoDoTema => ({ tema, mini, name: tema })

describe('a foto de cada tema', () => {
  it('pega a foto do primeiro produto do tema', () => {
    /* As 342 fotos já existiam no banco. Os cartões é que não usavam, e
       por isso a loja parecia planilha. */
    const vitrine = paraAVitrine(
      [tema('peppa-pig', 'Peppa Pig', 2)],
      [produto('peppa-pig', 'peppa-1.webp'), produto('peppa-pig', 'peppa-2.webp')],
    )

    expect(vitrine[0].foto).toBe('peppa-1.webp')
  })

  it('deixa de fora o tema sem foto', () => {
    /* Cartão vazio no meio dos outros lê como defeito. Quem procura por
       esse tema ainda acha pela página do produto. */
    const vitrine = paraAVitrine(
      [tema('sem-foto', 'Sem Foto', 1), tema('peppa-pig', 'Peppa Pig', 1)],
      [produto('sem-foto'), produto('peppa-pig', 'peppa.webp')],
    )

    expect(vitrine.map((t) => t.slug)).toEqual(['peppa-pig'])
  })

  it('deixa de fora o tema sem produto', () => {
    expect(paraAVitrine([tema('vazio', 'Vazio', 0)], [])).toEqual([])
  })
})

describe('a ordem', () => {
  it('mostra primeiro o tema com mais produtos', () => {
    /* Alfabético punha "Arca de Noé 1" na frente de "Peppa Pig", que é o
       campeão de vendas dela nas avaliações do Elo7. */
    const vitrine = paraAVitrine(
      [tema('arca', 'Arca de Noé', 1), tema('peppa-pig', 'Peppa Pig', 6)],
      [produto('arca', 'a.webp'), produto('peppa-pig', 'p.webp')],
    )

    expect(vitrine.map((t) => t.slug)).toEqual(['peppa-pig', 'arca'])
  })

  it('desempata pelo nome, para a ordem não mudar sozinha', () => {
    // Sem desempate, dois temas do mesmo tamanho trocam de lugar a cada
    // build e a página parece instável.
    const vitrine = paraAVitrine(
      [tema('zebra', 'Zebra', 2), tema('abelha', 'Abelha', 2)],
      [produto('zebra', 'z.webp'), produto('abelha', 'a.webp')],
    )

    expect(vitrine.map((t) => t.slug)).toEqual(['abelha', 'zebra'])
  })
})

describe('quantos aparecem de cara', () => {
  it('não é a lista inteira', () => {
    // Uma parede de 140 links não é escolha, é desistência.
    expect(QUANTOS_DE_CARA).toBeLessThan(20)
  })
})

describe('a conta escrita', () => {
  it('escreve no singular quando é um', () => {
    expect(quantosProdutos(1)).toBe('1 produto')
  })

  it('escreve no plural quando é mais', () => {
    expect(quantosProdutos(6)).toBe('6 produtos')
  })
})
