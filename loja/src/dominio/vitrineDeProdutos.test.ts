import { describe, it, expect } from 'vitest'

import {
  QUANTOS_NA_HOME,
  filtrar,
  paraAHome,
  tipoDoProduto,
  tiposDoCatalogo,
  type ProdutoDaVitrine,
} from './vitrineDeProdutos'

/**
 * O que a página inicial mostra, e o que fica no catálogo.
 *
 * Até 25/08 a home renderizava os 342 produtos de uma vez.
 */

const produto = (name: string, tema = 'peppa-pig', mini = 'foto.webp'): ProdutoDaVitrine => ({
  slug: name.toLowerCase().replace(/[^a-z]+/g, '-'),
  name,
  tema,
  mini,
})

describe('a seleção da página inicial', () => {
  it('não mostra o catálogo inteiro', () => {
    // Ninguém rola 342 cartões, e loja nenhuma faz isso.
    const catalogo = Array.from({ length: 342 }, (_, i) => produto(`Lousa Mágica - Tema ${i}`))
    expect(paraAHome(catalogo).length).toBe(QUANTOS_NA_HOME)
  })

  it('varia o tipo antes de repetir', () => {
    /* Ela tem 58 Lousas Mágicas. Mostrar seis lousas mudando só o
       personagem faz a loja parecer ter um produto só, e ela tem 104
       tipos diferentes. */
    const catalogo = [
      produto('Lousa Mágica - Peppa'),
      produto('Lousa Mágica - Frozen'),
      produto('Lousa Mágica - Mickey'),
      produto('Álbum de Figurinhas - Peppa'),
      produto('Caneca - Peppa'),
    ]

    const tipos = paraAHome(catalogo, 3).map((p) => tipoDoProduto(p.name))

    expect(new Set(tipos).size).toBe(3)
  })

  it('completa com repetição quando não há tipo suficiente', () => {
    // Melhor mostrar duas lousas do que uma vitrine pela metade.
    const catalogo = [
      produto('Lousa Mágica - Peppa'),
      produto('Lousa Mágica - Frozen'),
      produto('Caneca - Peppa'),
    ]

    expect(paraAHome(catalogo, 3)).toHaveLength(3)
  })

  it('deixa de fora produto sem foto', () => {
    // Cartão sem imagem no meio dos outros lê como defeito.
    const catalogo = [produto('Lousa Mágica - Peppa', 'peppa-pig', ''), produto('Caneca - Peppa')]
    expect(paraAHome(catalogo).map((p) => p.name)).toEqual(['Caneca - Peppa'])
  })

  it('dá sempre a mesma home para o mesmo catálogo', () => {
    /* Sem isto a vitrine muda sozinha a cada build, e ela abre a loja
       achando que mexeram em alguma coisa. */
    const catalogo = [
      produto('Lousa Mágica - Peppa'),
      produto('Álbum - Frozen'),
      produto('Caneca - Mickey'),
    ]

    expect(paraAHome(catalogo)).toEqual(paraAHome(catalogo))
  })
})

describe('procurar no catálogo', () => {
  const catalogo = [
    produto('Lousa Mágica - Peppa Pig'),
    produto('Lousa Mágica - Frozen', 'frozen'),
    produto('Álbum de Figurinhas - Peppa Pig'),
    produto('Caneca Personalizada - Mickey', 'mickey'),
  ]

  it('acha por parte do nome', () => {
    expect(filtrar(catalogo, { procura: 'caneca' })).toHaveLength(1)
  })

  it('acha com as palavras separadas, em qualquer ordem', () => {
    /* Quem digita "lousa peppa" está procurando as duas coisas, e não uma
       frase exata. */
    expect(filtrar(catalogo, { procura: 'lousa peppa' })).toHaveLength(1)
    expect(filtrar(catalogo, { procura: 'peppa lousa' })).toHaveLength(1)
  })

  it('acha sem acento', () => {
    // Ninguém digita "mágica" com acento no celular.
    expect(filtrar(catalogo, { procura: 'magica' })).toHaveLength(2)
  })

  it('filtra por tipo', () => {
    expect(filtrar(catalogo, { tipo: 'Lousa Mágica' })).toHaveLength(2)
  })

  it('filtra por tema', () => {
    expect(filtrar(catalogo, { tema: 'frozen' })).toHaveLength(1)
  })

  it('junta os filtros', () => {
    expect(filtrar(catalogo, { tipo: 'Lousa Mágica', tema: 'frozen' })).toHaveLength(1)
  })

  it('sem filtro, devolve tudo', () => {
    expect(filtrar(catalogo, {})).toHaveLength(4)
  })
})

describe('os tipos que ela tem', () => {
  it('conta e ordena do maior para o menor', () => {
    const catalogo = [
      produto('Lousa Mágica - Peppa'),
      produto('Lousa Mágica - Frozen'),
      produto('Caneca - Mickey'),
    ]

    expect(tiposDoCatalogo(catalogo)).toEqual([
      { tipo: 'Lousa Mágica', quantos: 2 },
      { tipo: 'Caneca', quantos: 1 },
    ])
  })

  it('desempata pelo nome, para a ordem não mudar sozinha', () => {
    const catalogo = [produto('Zebra - A'), produto('Abelha - B')]
    expect(tiposDoCatalogo(catalogo).map((t) => t.tipo)).toEqual(['Abelha', 'Zebra'])
  })
})
