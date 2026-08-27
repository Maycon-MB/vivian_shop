import { describe, it, expect } from 'vitest'

import { FIXADO, NORMAL, estaFixado, posicaoPara, ordemDaVitrine } from './ordemDaVitrine'

const produto = (nome: string, posicao: number, criadoEm: string) => ({
  nome,
  posicao,
  criadoEm,
})

describe('a ordem da vitrine', () => {
  it('põe o que ela fixou na frente, mesmo sendo mais antigo', () => {
    /* É o ponto da funcionalidade: em janeiro o que precisa estar no alto
       é volta às aulas, e o mais recente pode ser justamente o que menos
       sai. */
    const ordenados = ordemDaVitrine([
      produto('Caneca nova', NORMAL, '2026-08-27T10:00:00Z'),
      produto('Kit escolar antigo', FIXADO, '2026-01-10T10:00:00Z'),
    ])

    expect(ordenados.map((p) => p.nome)).toEqual(['Kit escolar antigo', 'Caneca nova'])
  })

  it('entre iguais, mostra o mais recente antes', () => {
    const ordenados = ordemDaVitrine([
      produto('Antigo', NORMAL, '2026-01-01T10:00:00Z'),
      produto('Novo', NORMAL, '2026-08-01T10:00:00Z'),
    ])

    expect(ordenados.map((p) => p.nome)).toEqual(['Novo', 'Antigo'])
  })

  it('não muda a lista que recebeu', () => {
    // Ordenar no lugar quebraria a lista de quem chamou, e o defeito
    // apareceria numa tela que nem sabe que esta função existe.
    const original = [
      produto('Antigo', NORMAL, '2026-01-01T10:00:00Z'),
      produto('Novo', NORMAL, '2026-08-01T10:00:00Z'),
    ]
    const copia = [...original]

    ordemDaVitrine(original)

    expect(original).toEqual(copia)
  })

  it('manda para o fim o produto sem data', () => {
    // Dado faltando não merece o melhor lugar da loja.
    const ordenados = ordemDaVitrine([
      { nome: 'Sem data', posicao: NORMAL, criadoEm: null },
      produto('Com data', NORMAL, '2026-01-01T10:00:00Z'),
    ])

    expect(ordenados.map((p) => p.nome)).toEqual(['Com data', 'Sem data'])
  })

  it('trata produto sem posição como não fixado', () => {
    /* Os 342 produtos que vieram da Elojinha entraram com o valor padrão,
       e nenhum deles pode virar destaque por acidente. */
    expect(estaFixado(undefined)).toBe(false)
    expect(estaFixado(null)).toBe(false)
    expect(estaFixado(NORMAL)).toBe(false)
    expect(estaFixado(FIXADO)).toBe(true)
  })

  it('sabe o número de fixar e o de soltar', () => {
    expect(posicaoPara(true)).toBe(FIXADO)
    expect(posicaoPara(false)).toBe(NORMAL)
  })
})
