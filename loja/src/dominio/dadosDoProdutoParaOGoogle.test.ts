import { describe, it, expect } from 'vitest'

import { montarListaDoGoogleShopping } from './listaDoGoogleShopping.mjs'
import { dadosDoProdutoParaOGoogle, emJsonLd } from './dadosDoProdutoParaOGoogle.mjs'
import { enderecoDaLoja } from './enderecoDaLoja.mjs'
import catalogoPublicado from '../dados/catalogo-publicado.json'
import { PRODUTOS } from '@/telas/catalogo'

/**
 * Os dados do produto que o Google lê dentro da página.
 *
 * O Google confere o preço da lista do Shopping contra a página, e a página
 * mostra "R$ 13,50 cada unidade" em destaque. Os dados estruturados dizem a
 * ele, sem margem para leitura errada, que o preço é o mesmo da lista.
 */

const BASE = 'https://feitoparavocepapelaria.com.br'

const ALBUM = {
  id: '495d7f6c',
  slug: 'album-de-figurinhas-chaves',
  name: 'Álbum de Figurinhas - Chaves',
  description: 'Álbum personalizado com o nome & idade.',
  price: 13.5,
  minimo: 10,
  prazoProducao: 5,
  pesoG: 70,
  image: 'https://exemplo.supabase.co/produtos/album/1-cheia.webp',
  galeria: [],
}

const AVULSO = { ...ALBUM, id: 'avulso-1', slug: 'topo-de-bolo-chaves', minimo: 1, price: 25 }
const EM_PROMOCAO = { ...ALBUM, id: 'promo', slug: 'album-promo', precoPromocional: 12 }

type Produto = { id?: string; slug?: string }

/* O que a lista manda ao Google para um produto, lido do próprio XML. */
const daLista = (produto: Produto) => {
  const xml = montarListaDoGoogleShopping({ base: BASE, catalogo: { produtos: [produto] } })
  const campo = (nome: string) => xml.match(new RegExp(`<${nome}>([^<]*)</${nome}>`))?.[1]
  const titulo = xml.match(/<item>[\s\S]*?<title>([^<]*)<\/title>/)?.[1]
  const desfazer = (texto?: string) =>
    texto?.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

  return {
    id: desfazer(campo('g:id')),
    titulo: desfazer(titulo),
    preco: (campo('g:sale_price') ?? campo('g:price'))?.replace(' BRL', ''),
    link: desfazer(xml.match(/<item>[\s\S]*?<link>([^<]*)<\/link>/)?.[1]),
  }
}

describe('os dados do produto para o Google', () => {
  it.each([ALBUM, AVULSO, EM_PROMOCAO])('dizem o mesmo preço e nome da lista do Shopping: %s', (produto) => {
    const dados = dadosDoProdutoParaOGoogle(produto, BASE)
    const lista = daLista(produto)

    expect(dados?.name).toBe(lista.titulo)
    expect(dados?.offers.price).toBe(lista.preco)
    expect(dados?.sku).toBe(lista.id)
    expect(dados?.offers.url).toBe(lista.link)
  })

  it('mostram o preço do pedido mínimo, e não o da unidade que a página destaca', () => {
    expect(dadosDoProdutoParaOGoogle(ALBUM, BASE)?.offers).toEqual({
      '@type': 'Offer',
      url: `${BASE}/produto/album-de-figurinhas-chaves/`,
      priceCurrency: 'BRL',
      price: '135.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    })
  })

  it('cobram o preço da promoção, que é o que a cliente paga', () => {
    expect(dadosDoProdutoParaOGoogle(EM_PROMOCAO, BASE)?.offers.price).toBe('120.00')
  })

  it('apresentam a peça como produto da loja, com foto e descrição', () => {
    expect(dadosDoProdutoParaOGoogle(ALBUM, BASE)).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      image: ALBUM.image,
      description: ALBUM.description,
      brand: { '@type': 'Brand', name: 'Feito para você' },
    })
  })

  it.each([
    ['sem foto', { ...ALBUM, image: '' }],
    ['sem nome', { ...ALBUM, name: '' }],
    ['sem endereço', { ...ALBUM, slug: '' }],
    ['sem preço', { ...ALBUM, price: 0 }],
  ])('não existem para o produto %s, que fica fora da lista', (_, produto) => {
    expect(dadosDoProdutoParaOGoogle(produto, BASE)).toBeNull()
  })

  it('batem com a lista nos 342 produtos que estão no ar', () => {
    /* A página usa o produto já limpo para a vitrine; a lista, o catálogo
       cru. Preço, nome e endereço não podem mudar entre os dois. */
    const diferentes = catalogoPublicado.produtos.filter((cru) => {
      const daPagina = PRODUTOS.find((produto) => produto.slug === cru.slug)
      const dados = daPagina && dadosDoProdutoParaOGoogle(daPagina, BASE)
      const lista = daLista(cru)

      return (
        dados?.name !== lista.titulo ||
        dados?.offers.price !== lista.preco ||
        dados?.sku !== lista.id ||
        dados?.offers.url !== lista.link
      )
    })

    expect(catalogoPublicado.produtos.length).toBeGreaterThan(0)
    expect(diferentes.map((produto) => produto.slug)).toEqual([])
  })
})

describe('o texto que vai dentro da página', () => {
  it('não deixa um nome com </script> fechar a tag antes da hora', () => {
    const texto = emJsonLd({ name: 'Caneca </script><script>alert(1)</script>' })

    expect(texto).not.toContain('<')
    expect(texto).toContain('\\u003c/script>')
    expect(JSON.parse(texto).name).toBe('Caneca </script><script>alert(1)</script>')
  })
})

describe('o endereço da loja', () => {
  it('é o domínio dela quando o domínio está pronto', () => {
    expect(enderecoDaLoja({ DOMINIO_PRONTO: 'true' })).toBe(BASE)
  })

  it('é o do GitHub enquanto o domínio não está pronto', () => {
    expect(enderecoDaLoja({})).toBe('https://maycon-mb.github.io/vivian_shop')
  })
})
