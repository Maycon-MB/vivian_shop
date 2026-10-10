import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import Pagina from './page'
import { ProvedorCarrinho } from '@/telas/CarrinhoContexto'
import { PRODUTOS } from '@/telas/catalogo'

/**
 * A página de produto leva para o Google o mesmo preço da lista do Shopping.
 *
 * Renderizada como o build estático a gera: é esse HTML que o robô lê.
 */

const htmlDaPagina = async (slug: string) => {
  const conteudo = await Pagina({ params: Promise.resolve({ slug }) })
  return renderToStaticMarkup(<ProvedorCarrinho>{conteudo}</ProvedorCarrinho>)
}

describe('a página do produto', () => {
  it('traz os dados do produto em JSON-LD, com o preço do pedido mínimo', async () => {
    const produto = PRODUTOS.find((p) => (p.minimo ?? 1) > 1 && p.image)!
    const html = await htmlDaPagina(produto.slug)

    const bloco = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    const dados = JSON.parse(bloco ?? 'null')

    expect(dados['@type']).toBe('Product')
    expect(dados.offers.price).toBe((produto.price * (produto.minimo ?? 1)).toFixed(2))
    expect(dados.name).toContain(`(pedido mínimo de ${produto.minimo} unidades)`)
  })
})
