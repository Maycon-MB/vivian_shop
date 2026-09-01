import { describe, it, expect } from 'vitest'

import { familiaDoNome, medidasParecidas } from './medidasDoTipo'

const CATALOGO = [
  { nome: 'Lousa Mágica - Peppa Pig', peso_g: 100, alt_cm: 1.5, larg_cm: 19, comp_cm: 30 },
  { nome: 'Lousa Mágica - Chaves', peso_g: 100, alt_cm: 1.5, larg_cm: 19, comp_cm: 30 },
  { nome: 'Caneca Personalizada - Frozen', peso_g: 100, alt_cm: 10.5, larg_cm: 11, comp_cm: 11 },
  { nome: 'Tubolata Ursinho Pooh', peso_g: 40, alt_cm: 7, larg_cm: 6, comp_cm: 6 },
]

describe('a família do produto, tirada do nome', () => {
  it('separa no travessão que ela usa', () => {
    // É como os 342 produtos vieram da Elojinha: tipo, traço, tema.
    expect(familiaDoNome('Lousa Mágica - Homem Aranha')).toBe('Lousa Mágica')
  })

  it('aceita nome sem traço', () => {
    expect(familiaDoNome('Tubolata Ursinho Pooh')).toBe('Tubolata Ursinho Pooh')
  })

  it('não quebra com nome vazio', () => {
    expect(familiaDoNome('')).toBe('')
    expect(familiaDoNome(null as never)).toBe('')
  })
})

describe('as medidas que já existem em produtos parecidos', () => {
  it('acha pelo nome da família', () => {
    /* Ela vai cadastrar a Lousa Mágica número 59. As 58 anteriores têm o
       mesmo peso e a mesma caixa: o peso é do tipo, não do tema. */
    const achou = medidasParecidas('Lousa Mágica - Homem Aranha', CATALOGO)

    expect(achou).toEqual({
      familia: 'Lousa Mágica',
      quantos: 2,
      peso_g: 100,
      alt_cm: 1.5,
      larg_cm: 19,
      comp_cm: 30,
    })
  })

  it('acha mesmo quando ela escreve sem traço e sem acento', () => {
    /* Ela digita com pressa, do celular. "Lousa Magica Homem Aranha" tem
       que achar as Lousas Mágicas do mesmo jeito, senão a ajuda só
       funciona para quem digita igual ao que já está no banco. */
    const achou = medidasParecidas('lousa magica homem aranha', CATALOGO)

    expect(achou?.familia).toBe('Lousa Mágica')
  })

  it('devolve nada quando é produto novo de verdade', () => {
    /* Sem produto parecido, não há o que sugerir. Melhor não preencher do
       que preencher com o peso de outra coisa: frete errado sai do bolso
       dela em toda venda. */
    expect(medidasParecidas('Camiseta Estampada', CATALOGO)).toBeNull()
  })

  it('ignora produto sem medida guardada', () => {
    const semMedida = [{ nome: 'Lousa Mágica - X', peso_g: null, alt_cm: null, larg_cm: null, comp_cm: null }]

    expect(medidasParecidas('Lousa Mágica - Y', semMedida as never)).toBeNull()
  })

  it('não sugere quando os parecidos discordam', () => {
    /* Hoje os 96 tipos do catálogo têm medida única dentro do tipo. Se um
       dia deixarem de ter, sugerir uma das duas é escolher por ela sem
       ela saber que houve escolha. */
    const discordam = [
      { nome: 'Bloco - A', peso_g: 70, alt_cm: 1, larg_cm: 11, comp_cm: 16 },
      { nome: 'Bloco - B', peso_g: 90, alt_cm: 1, larg_cm: 11, comp_cm: 16 },
    ]

    expect(medidasParecidas('Bloco - C', discordam)).toBeNull()
  })
})
