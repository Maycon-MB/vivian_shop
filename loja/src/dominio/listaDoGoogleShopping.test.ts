import { describe, it, expect } from 'vitest'

import { montarListaDoGoogleShopping, precoDoPedidoMinimo } from './listaDoGoogleShopping.mjs'

/**
 * A lista de produtos que o Google Shopping lê, de graça.
 *
 * Ela não tem verba para anúncio nem tempo para alimentar o Instagram. A
 * aba Shopping do Google mostra os produtos com foto e preço sem custo, e
 * trabalha sozinha depois de ligada. Mas o Google recusa o produto cujo
 * preço não bate com a página, e com pedido mínimo o preço que vale é o do
 * mínimo inteiro, não o da unidade.
 */

const ALBUM = {
  id: '495d7f6c',
  slug: 'album-de-figurinhas-chaves',
  name: 'Álbum de Figurinhas - Chaves',
  description: 'Álbum personalizado com o nome & idade.\nTamanho: 14 x 20 cm',
  price: 13.5,
  minimo: 10,
  prazoProducao: 5,
  pesoG: 70,
  image: 'https://exemplo.supabase.co/produtos/album/1-cheia.webp',
  galeria: ['https://exemplo.supabase.co/produtos/album/2-cheia.webp'],
}

const AVULSO = { ...ALBUM, id: 'avulso-1', slug: 'topo-de-bolo-chaves', minimo: 1, price: 25 }

const BASE = 'https://feitoparavocepapelaria.com.br'

const lista = (produtos: object[]) =>
  montarListaDoGoogleShopping({ base: BASE, catalogo: { produtos } })

describe('o preço do pedido mínimo', () => {
  it('é a unidade vezes o mínimo, que é o menor pedido que ela aceita', () => {
    expect(precoDoPedidoMinimo(ALBUM)).toBe(135)
  })

  it('é o preço da unidade quando o produto sai avulso', () => {
    expect(precoDoPedidoMinimo(AVULSO)).toBe(25)
  })

  it('usa o preço promocional quando ela pôs o produto em promoção', () => {
    expect(precoDoPedidoMinimo({ ...ALBUM, precoPromocional: 12 })).toBe(120)
  })

  it('não carrega erro de centavo de conta com vírgula', () => {
    expect(precoDoPedidoMinimo({ ...ALBUM, price: 13.7 })).toBe(137)
  })
})

describe('a lista do Google Shopping', () => {
  it('mostra no Google o preço do pedido mínimo, e não o da unidade', () => {
    /* O Google manda enviar o preço da quantidade mínima. Mandando R$ 13,50
       num produto que só sai de 10 em 10, a cliente chega esperando pagar
       isso, e o Google reprova o produto por preço enganoso. */
    const xml = lista([ALBUM])

    expect(xml).toContain('<g:price>135.00 BRL</g:price>')
    expect(xml).not.toContain('13.50 BRL')
  })

  it('avisa no título que o preço é de um pedido de 10', () => {
    expect(lista([ALBUM])).toContain(
      '<title>Álbum de Figurinhas - Chaves (pedido mínimo de 10 unidades)</title>',
    )
  })

  it('não inventa pedido mínimo no produto que sai avulso', () => {
    const xml = lista([AVULSO])

    expect(xml).toContain('<g:price>25.00 BRL</g:price>')
    expect(xml).not.toContain('pedido mínimo')
  })

  it('mostra o preço cheio riscado quando há promoção', () => {
    const xml = lista([{ ...ALBUM, precoPromocional: 12 }])

    expect(xml).toContain('<g:price>135.00 BRL</g:price>')
    expect(xml).toContain('<g:sale_price>120.00 BRL</g:sale_price>')
  })

  it('leva a cliente direto à página do produto, na loja dela', () => {
    expect(lista([ALBUM])).toContain(
      '<link>https://feitoparavocepapelaria.com.br/produto/album-de-figurinhas-chaves/</link>',
    )
  })

  it('mostra a foto da capa e as da galeria', () => {
    const xml = lista([ALBUM])

    expect(xml).toContain(`<g:image_link>${ALBUM.image}</g:image_link>`)
    expect(xml).toContain(`<g:additional_image_link>${ALBUM.galeria[0]}</g:additional_image_link>`)
  })

  it('diz ao Google que é peça feita à mão, sem código de barras', () => {
    /* Sem isto, o Google cobra GTIN, o código de barras de fábrica, que
       peça personalizada não tem, e segura o produto como incompleto. */
    const xml = lista([ALBUM])

    expect(xml).toContain('<g:identifier_exists>no</g:identifier_exists>')
    expect(xml).toContain('<g:condition>new</g:condition>')
  })

  it('conta o prazo de produção como tempo de preparo', () => {
    const xml = lista([ALBUM])

    expect(xml).toContain('<g:min_handling_time>5</g:min_handling_time>')
    expect(xml).toContain('<g:max_handling_time>5</g:max_handling_time>')
  })

  it('manda o peso do pedido mínimo, para o frete sair certo', () => {
    expect(lista([ALBUM])).toContain('<g:shipping_weight>700 g</g:shipping_weight>')
  })

  it('não quebra o arquivo inteiro por causa de um & na descrição', () => {
    const xml = lista([ALBUM])

    expect(xml).toContain('nome &amp; idade')
    expect(xml).not.toMatch(/nome & idade/)
  })

  it('deixa de fora o produto sem foto, que o Google reprovaria', () => {
    const xml = lista([ALBUM, { ...AVULSO, image: '' }])

    expect(xml.match(/<item>/g)).toHaveLength(1)
  })

  it('não repete produto, que o Google trataria como dois', () => {
    expect(lista([ALBUM, ALBUM]).match(/<item>/g)).toHaveLength(1)
  })
})
