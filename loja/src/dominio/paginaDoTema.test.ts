import { describe, it, expect } from 'vitest'

import {
  tituloDoTema,
  descricaoDoTema,
  introducaoDoTema,
  enderecoDoTema,
  listaDoTemaParaOGoogle,
} from './paginaDoTema'
import { emJsonLd } from './dadosDoProdutoParaOGoogle.mjs'

const BASE = 'https://feitoparavocepapelaria.com.br'
const STITCH = { slug: 'stitch', nome: 'Stitch', descricao: '' }
const PRODUTOS = [
  { slug: 'caneca-stitch', name: 'Caneca Stitch' },
  { slug: 'caderno-stitch', name: 'Caderno Stitch' },
]

describe('a página de um tema no Google', () => {
  it('tem título próprio, com o nome do tema', () => {
    expect(tituloDoTema(STITCH)).toBe('Lembrancinhas personalizadas Stitch | Feito para você!')
    expect(tituloDoTema({ ...STITCH, nome: 'Chaves' })).not.toBe(tituloDoTema(STITCH))
  })

  it('tem descrição própria, com o tema e quantos produtos', () => {
    const descricao = descricaoDoTema(STITCH, 2)

    expect(descricao).toContain('Stitch')
    expect(descricao).toContain('2 produtos')
    expect(descricao.length).toBeLessThanOrEqual(160)
  })

  it('usa a descrição que ela escreveu, quando existe', () => {
    expect(descricaoDoTema({ ...STITCH, descricao: '  Do filme da Disney. ' }, 2)).toBe(
      'Do filme da Disney.',
    )
  })

  it('fala no singular quando o tema tem um produto só', () => {
    expect(descricaoDoTema(STITCH, 1)).toContain('1 produto ')
    expect(introducaoDoTema(STITCH, 1)).toContain('1 produto ')
  })

  it('apresenta o tema na tela sem travessão', () => {
    const intro = introducaoDoTema(STITCH, 2)

    expect(intro).toContain('Stitch')
    expect(intro).toContain('2 produtos')
    expect(intro).not.toMatch(/[—–]/)
    expect(descricaoDoTema(STITCH, 2)).not.toMatch(/[—–]/)
  })

  it('aponta para um endereço só, com barra no fim', () => {
    expect(enderecoDoTema(STITCH, `${BASE}/`)).toBe(`${BASE}/tema/stitch/`)
  })

  it('lista os produtos do tema, na ordem da página', () => {
    const lista = listaDoTemaParaOGoogle(STITCH, PRODUTOS, BASE)

    expect(lista['@type']).toBe('ItemList')
    expect(lista.url).toBe(`${BASE}/tema/stitch/`)
    expect(lista.numberOfItems).toBe(2)
    expect(lista.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, url: `${BASE}/produto/caneca-stitch/`, name: 'Caneca Stitch' },
      { '@type': 'ListItem', position: 2, url: `${BASE}/produto/caderno-stitch/`, name: 'Caderno Stitch' },
    ])
  })

  it('não deixa um nome digitado fechar a tag do script', () => {
    const perigoso = [{ slug: 'x', name: '</script><script>alert(1)</script>' }]
    const texto = emJsonLd(listaDoTemaParaOGoogle(STITCH, perigoso, BASE))

    expect(texto).not.toContain('<')
    expect(texto).toContain('\\u003c/script>')
  })
})
