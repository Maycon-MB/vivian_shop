import { describe, it, expect } from 'vitest'
import { cartaoDoProduto, cartaoDoTema, cartaoDaLoja, enderecoAbsoluto } from './cartaoDoLink.mjs'

const BASE = 'https://feitoparavocepapelaria.com.br'

const album = {
  id: '3',
  slug: 'album-de-figurinhas',
  name: 'Álbum de Figurinhas',
  price: 22.9,
  image: '/produtos/album-de-figurinhas.webp',
  description: 'Álbum com o nome da criança.',
}

describe('link de produto colado no WhatsApp', () => {
  it('mostra a foto do produto com endereço completo, que o WhatsApp exige', () => {
    const cartao = cartaoDoProduto(album, BASE)
    expect(cartao.openGraph.images[0].url).toBe(`${BASE}/produtos/album-de-figurinhas.webp`)
    expect(cartao.twitter.images).toEqual([`${BASE}/produtos/album-de-figurinhas.webp`])
    expect(cartao.twitter.card).toBe('summary_large_image')
  })

  it('mostra o nome e o preço do pedido mínimo em reais', () => {
    const cartao = cartaoDoProduto({ ...album, minimo: 10, price: 2.5 }, BASE)
    expect(cartao.openGraph.title).toBe('Álbum de Figurinhas · R$ 25,00')
    expect(cartao.openGraph.description).toBe('Álbum com o nome da criança.')
    expect(cartao.openGraph.url).toBe(`${BASE}/produto/album-de-figurinhas/`)
  })

  it('usa o preço promocional quando há', () => {
    const cartao = cartaoDoProduto({ ...album, precoPromocional: 19.9 }, BASE)
    expect(cartao.openGraph.title).toContain('R$ 19,90')
  })

  it('não monta endereço errado quando a foto já vem completa do banco', () => {
    const foto = 'https://x.supabase.co/storage/v1/object/public/fotos/a.webp'
    expect(cartaoDoProduto({ ...album, image: foto }, BASE).openGraph.images[0].url).toBe(foto)
  })

  it('cai para a imagem da marca quando o produto não tem foto', () => {
    const cartao = cartaoDoProduto({ ...album, image: undefined }, BASE)
    expect(cartao.openGraph.images[0].url).toBe(`${BASE}/marca-feito-para-voce.webp`)
  })
})

describe('link de tema colado no WhatsApp', () => {
  it('mostra o nome do tema e a foto do primeiro produto dele', () => {
    const tema = { slug: 'mickey', nome: 'Mickey', descricao: 'Festa do Mickey.' }
    const cartao = cartaoDoTema(tema, album, BASE)
    expect(cartao.openGraph.title).toBe('Mickey · Feito para você! Personalizados')
    expect(cartao.openGraph.images[0].url).toBe(`${BASE}/produtos/album-de-figurinhas.webp`)
    expect(cartao.openGraph.url).toBe(`${BASE}/tema/mickey/`)
  })
})

describe('link da loja colado no WhatsApp', () => {
  it('mostra a imagem da marca', () => {
    const cartao = cartaoDaLoja(BASE)
    expect(cartao.openGraph.images[0].url).toBe(`${BASE}/marca-feito-para-voce.webp`)
    expect(cartao.openGraph.siteName).toBe('Feito para você! Personalizados')
    expect(cartao.openGraph.locale).toBe('pt_BR')
  })

  it('respeita a loja morando sob um caminho, como no GitHub Pages', () => {
    const base = 'https://maycon-mb.github.io/vivian_shop'
    expect(enderecoAbsoluto('/vivian_shop/produtos/a.webp', base)).toBe(
      'https://maycon-mb.github.io/vivian_shop/produtos/a.webp',
    )
    expect(enderecoAbsoluto('marca.webp', base)).toBe('https://maycon-mb.github.io/vivian_shop/marca.webp')
  })
})
