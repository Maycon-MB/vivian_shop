/**
 * O mapa do site e o robots.txt, montados a partir do catálogo publicado.
 *
 * ── Por que existe ────────────────────────────────────────────────────
 *
 * A loja é estática de propósito: o catálogo entra no build para o Google
 * conseguir ler as 342 páginas de produto. Só que ler é uma coisa e achar
 * é outra. Sem sitemap, ele tem que descobrir as 342 navegando link a
 * link, e a loja saiu do Elo7 sem herdar nada: nenhum link de fora,
 * nenhum histórico de busca, ninguém procurando pelo nome dela ainda.
 *
 * ── Por que é `.mjs`, e não `.ts` como o resto de dominio/ ────────────
 *
 * Quem monta o arquivo é o `scripts/publicar.mjs`, que roda no Node cru,
 * sem passar por compilador nenhum. JavaScript puro é o que os dois lados
 * conseguem carregar: o script na publicação e o vitest no teste. Escrito
 * em `.ts`, ou o script perdia o teste, ou o teste perdia o script.
 *
 * ── O que não está aqui, de propósito ─────────────────────────────────
 *
 * Não há `<lastmod>`, `<changefreq>` nem `<priority>`. Os dois últimos o
 * Google ignora desde 2023 e diz isso na documentação. O `lastmod` seria
 * pior que ausente: o catálogo publicado não guarda data de alteração, e
 * a única data à mão é a da publicação, que carimbaria as 342 páginas com
 * o mesmo instante duas vezes ao dia. Sitemap que jura que tudo mudou
 * hoje é sitemap que o Google aprende a não acreditar.
 */

/** As páginas de quem compra que não dependem do catálogo. */
export const PAGINAS_FIXAS = ['/', '/produtos/', '/sobre/', '/como-funciona/', '/politicas/']

/**
 * O que nunca vira resultado de busca.
 *
 * `/admin/` é a área dela. O resto é meio de caminho de uma compra: quem
 * chega pelo Google direto no checkout chega num carrinho vazio, e
 * `/baixar/` e `/avaliar/` só fazem sentido com o código que foi enviado
 * por e-mail para uma cliente específica.
 */
export const FORA_DA_BUSCA = [
  '/admin/',
  '/checkout/',
  '/minha-conta/',
  '/pedido-confirmado/',
  '/avaliar/',
  '/baixar/',
]

/**
 * Endereço com barra no fim porque `trailingSlash: true` no next.config:
 * é assim que a página existe, e mandar o Google no endereço sem barra é
 * mandá-lo num redirecionamento a cada uma das 342.
 *
 * @param {string} caminho
 */
const comBarra = (caminho) => (caminho.endsWith('/') ? caminho : `${caminho}/`)

/* Os tipos vêm por JSDoc porque o arquivo é JavaScript de propósito, e o
   `tsc --noEmit` do CI confere os testes que o importam. Sem isto ele
   deduz `never[]` do valor padrão e reprova todo teste que passa produto. */
/**
 * @typedef {{ slug?: string }} ComEndereco
 * @typedef {{ produtos?: ComEndereco[], temas?: ComEndereco[] }} CatalogoPublicado
 */

/**
 * Os caminhos que entram no mapa, na ordem em que serão escritos.
 *
 * Recebe o catálogo já publicado, o mesmo objeto que gera as páginas. É o
 * que faz o produto despublicado no painel sumir do mapa na publicação
 * seguinte, sem ninguém precisar lembrar de tirá-lo daqui.
 *
 * @param {CatalogoPublicado} [catalogo]
 * @returns {string[]}
 */
export const caminhosDoMapa = ({ produtos = [], temas = [] } = {}) => {
  const caminhos = [
    ...PAGINAS_FIXAS,
    ...produtos.filter((p) => p?.slug).map((p) => `/produto/${comBarra(p.slug)}`),
    ...temas.filter((t) => t?.slug).map((t) => `/tema/${comBarra(t.slug)}`),
  ]

  /* Endereço repetido não é um aviso: o Google recusa o arquivo inteiro,
     e as 342 páginas somem juntas por causa de uma linha duplicada. */
  return [...new Set(caminhos)]
}

/**
 * Escapa o que o XML não aceita cru.
 *
 * O `&` é o que importa na prática: o slug sai do nome que ela digita no
 * painel, e um `&` solto derruba o documento todo, não só aquela linha.
 *
 * @param {string} texto
 */
const escaparXml = (texto) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * `base` é o endereço onde a loja mora, sem barra no fim: o domínio dela,
 * ou o do GitHub com o /vivian_shop, conforme DOMINIO_PRONTO.
 *
 * @param {string} base
 */
const semBarraFinal = (base) => base.replace(/\/$/, '')

/**
 * O sitemap.xml pronto para gravar.
 *
 * @param {{ base: string, catalogo?: CatalogoPublicado }} argumentos
 * @returns {string}
 */
export const montarMapaDoSite = ({ base, catalogo }) => {
  const raiz = semBarraFinal(base)

  const linhas = caminhosDoMapa(catalogo).map(
    (caminho) => `  <url><loc>${escaparXml(raiz + caminho)}</loc></url>`,
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...linhas,
    '</urlset>',
    '',
  ].join('\n')
}

/**
 * O robots.txt pronto para gravar.
 *
 * Os caminhos barrados são contados do alto do domínio, e não da pasta
 * onde a loja mora. Enquanto ela morar em github.io/vivian_shop, um
 * `Disallow: /admin/` estaria barrando o admin de outra pessoa.
 *
 * @param {{ base: string }} argumentos
 * @returns {string}
 */
export const montarRobots = ({ base }) => {
  const raiz = semBarraFinal(base)
  const prefixo = new URL(raiz).pathname.replace(/\/$/, '')

  return [
    'User-agent: *',
    'Allow: /',
    ...FORA_DA_BUSCA.map((caminho) => `Disallow: ${prefixo}${caminho}`),
    '',
    `Sitemap: ${raiz}/sitemap.xml`,
    '',
  ].join('\n')
}
