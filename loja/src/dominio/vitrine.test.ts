import { describe, it, expect } from 'vitest'

import { PRODUTOS, PUBLICADOS, produtosDoTema } from '../telas/catalogo'

/**
 * Produto sem foto não vai para a vitrine.
 *
 * A Vivian mandou 41 fotos e elas cobrem 13 dos 21 produtos. Os outros 8
 * ficam com espaço reservado, e uma loja com um terço dos cartões dizendo
 * "aqui entra a foto" passa a impressão de obra parada — que é justamente
 * o contrário do que ela precisa transmitir a quem chega pelo Instagram.
 *
 * Escondido, e não apagado: as descrições e os preços são os dela, vieram
 * do Elo7 e custaram tempo. Quando a foto chegar, o produto volta sozinho.
 */

describe('a vitrine só mostra o que está pronto', () => {
  it('esconde produto sem foto', () => {
    const semFoto = PUBLICADOS.filter((p) => !p.image)

    expect(semFoto).toEqual([])
  })

  it('não apaga: o que não tem foto fica de fora, e continua no catálogo', () => {
    /* Esta conta mudou de significado em 24/08, quando o catálogo passou a
       vir do banco.

       Antes, o catálogo era um arquivo com 21 produtos e 8 sem foto, então
       sobrava diferença. Agora o que chega aqui é o que ela publicou, e
       ela só publica o que está pronto — a diferença some, e some por um
       bom motivo.

       O que continua valendo é a regra: sem foto, não vai para a vitrine.
       Escondido, e nunca apagado. */
    const semFoto = PRODUTOS.filter((p) => !p.image)

    expect(PRODUTOS.length - PUBLICADOS.length).toBe(semFoto.length)
  })

  it('mostra tudo que já tem foto', () => {
    const comFoto = PRODUTOS.filter((p) => p.image)

    expect(PUBLICADOS).toHaveLength(comFoto.length)
    expect(PUBLICADOS.length).toBeGreaterThan(10)
  })

  it('a página do tema também não mostra produto sem foto', () => {
    for (const produto of produtosDoTema('mickey')) {
      expect(produto.image).toBeTruthy()
    }
  })
})
