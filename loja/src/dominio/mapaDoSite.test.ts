import { describe, it, expect } from 'vitest'

import {
  caminhosDoMapa,
  montarMapaDoSite,
  montarRobots,
  FORA_DA_BUSCA,
} from './mapaDoSite.mjs'

/**
 * O mapa do site é o que o Google recebe pronto em vez de descobrir
 * navegando. A loja saiu do Elo7 em maio e não herdou histórico de busca
 * nenhum: são 342 páginas de produto que ninguém procurou ainda.
 *
 * Por isso os testes aqui falam do que ela ganha ou perde, e não do
 * formato do XML: produto publicado aparece, produto despublicado some,
 * e nada que seja da conta da cliente ou dela vira resultado de busca.
 */

const CATALOGO = {
  produtos: [
    { slug: 'album-de-figurinhas-chaves', tema: 'chaves' },
    { slug: 'caderno-de-desenho-stitch', tema: 'stitch' },
  ],
  temas: [{ slug: 'chaves' }, { slug: 'stitch' }],
}

const BASE = 'https://feitoparavocepapelaria.com.br'

describe('o mapa do site', () => {
  it('leva o Google a cada produto que ela publicou', () => {
    const caminhos = caminhosDoMapa(CATALOGO)

    expect(caminhos).toContain('/produto/album-de-figurinhas-chaves/')
    expect(caminhos).toContain('/produto/caderno-de-desenho-stitch/')
  })

  it('esquece o produto que ela despublicou no painel', () => {
    /* O mapa nasce do mesmo catálogo que gera as páginas, e esse catálogo
       vem do banco a cada publicação. Produto que saiu de lá não tem como
       sobrar aqui, e é isso que este teste amarra: se um dia o mapa passar
       a ler outra fonte, ele quebra. */
    const semOStitch = {
      produtos: CATALOGO.produtos.filter((p) => p.slug !== 'caderno-de-desenho-stitch'),
      temas: [{ slug: 'chaves' }],
    }

    const caminhos = caminhosDoMapa(semOStitch)

    expect(caminhos).toContain('/produto/album-de-figurinhas-chaves/')
    expect(caminhos).not.toContain('/produto/caderno-de-desenho-stitch/')
    expect(caminhos).not.toContain('/tema/stitch/')
  })

  it('leva o Google a cada tema que tem produto', () => {
    const caminhos = caminhosDoMapa(CATALOGO)

    expect(caminhos).toContain('/tema/chaves/')
    expect(caminhos).toContain('/tema/stitch/')
  })

  it('leva o Google às páginas que qualquer pessoa pode abrir', () => {
    const caminhos = caminhosDoMapa(CATALOGO)

    expect(caminhos).toContain('/')
    expect(caminhos).toContain('/produtos/')
    expect(caminhos).toContain('/sobre/')
    expect(caminhos).toContain('/como-funciona/')
    expect(caminhos).toContain('/politicas/')
  })

  it('não manda o painel dela, o checkout nem a conta da cliente para a busca', () => {
    /* Uma dessas páginas indexada é a cliente chegando pelo Google direto
       num carrinho vazio, ou o painel dela aparecendo na busca pelo nome
       da loja. */
    const caminhos = caminhosDoMapa(CATALOGO)

    for (const proibido of FORA_DA_BUSCA) {
      expect(caminhos.some((c) => c.startsWith(proibido))).toBe(false)
    }
  })

  it('não repete endereço, porque o Google recusa o arquivo inteiro quando repete', () => {
    const comProdutoRepetido = {
      produtos: [...CATALOGO.produtos, CATALOGO.produtos[0]],
      temas: [...CATALOGO.temas, CATALOGO.temas[0]],
    }

    const caminhos = caminhosDoMapa(comProdutoRepetido)

    expect(new Set(caminhos).size).toBe(caminhos.length)
  })

  it('aguenta o catálogo vazio sem gerar arquivo quebrado', () => {
    /* Acontece de verdade: quem clona o repositório sem chave nenhuma
       constrói a loja com o catálogo de exemplo, e o CI monta o site antes
       de o banco responder. */
    const caminhos = caminhosDoMapa({ produtos: [], temas: [] })

    expect(caminhos).toContain('/')
    expect(montarMapaDoSite({ base: BASE, catalogo: { produtos: [], temas: [] } })).toContain(
      `<loc>${BASE}/</loc>`,
    )
  })

  it('escreve os endereços no domínio dela', () => {
    const xml = montarMapaDoSite({ base: BASE, catalogo: CATALOGO })

    expect(xml).toContain(`<loc>${BASE}/produto/album-de-figurinhas-chaves/</loc>`)
    expect(xml).not.toContain('<loc>/produto/')
  })

  it('escreve os endereços sob /vivian_shop enquanto a loja morar no GitHub', () => {
    const xml = montarMapaDoSite({
      base: 'https://maycon-mb.github.io/vivian_shop',
      catalogo: CATALOGO,
    })

    expect(xml).toContain('<loc>https://maycon-mb.github.io/vivian_shop/</loc>')
    expect(xml).toContain(
      '<loc>https://maycon-mb.github.io/vivian_shop/tema/chaves/</loc>',
    )
  })

  it('escapa o e comercial, senão o Google descarta o arquivo todo', () => {
    /* Um slug com `&` derruba o XML inteiro, não só aquela linha. Ela
       digita o nome do produto no painel, e o slug sai do nome. */
    const xml = montarMapaDoSite({
      base: BASE,
      catalogo: { produtos: [{ slug: 'lapis-p&b' }], temas: [] },
    })

    expect(xml).toContain('/produto/lapis-p&amp;b/')
    expect(xml).not.toContain('/produto/lapis-p&b/')
  })

  it('sai como XML de sitemap que o Google reconhece', () => {
    const xml = montarMapaDoSite({ base: BASE, catalogo: CATALOGO })

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })

  it('tem uma linha de endereço para cada página que entrou no mapa', () => {
    const caminhos = caminhosDoMapa(CATALOGO)
    const xml = montarMapaDoSite({ base: BASE, catalogo: CATALOGO })

    expect([...xml.matchAll(/<loc>/g)].length).toBe(caminhos.length)
  })
})

describe('o robots.txt', () => {
  it('diz ao buscador onde está o mapa, senão ele precisa adivinhar', () => {
    expect(montarRobots({ base: BASE })).toContain(`Sitemap: ${BASE}/sitemap.xml`)
  })

  it('deixa a loja ser lida', () => {
    const robots = montarRobots({ base: BASE })

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
  })

  it('barra o painel dela, o checkout e a conta da cliente', () => {
    const robots = montarRobots({ base: BASE })

    for (const proibido of FORA_DA_BUSCA) {
      expect(robots).toContain(`Disallow: ${proibido}`)
    }
  })

  it('barra o caminho certo enquanto a loja morar sob /vivian_shop', () => {
    /* O robots.txt vale do alto do domínio para baixo. Escrever
       `Disallow: /admin/` num site servido em /vivian_shop/ barraria o
       admin de outro site, e não o dela. */
    const robots = montarRobots({ base: 'https://maycon-mb.github.io/vivian_shop' })

    expect(robots).toContain('Disallow: /vivian_shop/admin/')
    expect(robots).toContain('Sitemap: https://maycon-mb.github.io/vivian_shop/sitemap.xml')
  })
})
