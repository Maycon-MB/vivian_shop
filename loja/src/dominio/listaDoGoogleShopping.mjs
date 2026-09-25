/**
 * A lista de produtos para o Google Shopping gratuito, montada a partir do
 * catálogo publicado.
 *
 * Ela não tem verba para anúncio nem tempo para alimentar o Instagram. A
 * aba Shopping do Google mostra produto com foto e preço sem custo, e o
 * Merchant Center busca este arquivo sozinho todo dia: é divulgação que não
 * pede nada dela depois de ligada.
 *
 * É `.mjs` pelo mesmo motivo do `mapaDoSite.mjs`: o `publicar.mjs` roda no
 * Node cru, e a página do produto e o vitest carregam o mesmo arquivo.
 *
 * O frete não vai aqui. Os Correios não estão entre as transportadoras que
 * o Google calcula, então a regra de frete fica na conta dela no Merchant
 * Center; daqui sai só o peso, que essa regra usa.
 */

/* Aparece como marca no Google. Peça personalizada não tem fabricante, e
   para o Google a marca de produto feito à mão é a loja que o faz. */
const MARCA = 'Feito para você'

/* Limites do Google: acima disso ele corta o texto ou recusa o produto. */
const TAMANHO_DO_TITULO = 150
const TAMANHO_DA_DESCRICAO = 5000
const FOTOS_EXTRAS = 10

/**
 * @typedef {{
 *   id?: string, slug?: string, name?: string, description?: string,
 *   price?: number, precoPromocional?: number, minimo?: number,
 *   prazoProducao?: number, pesoG?: number, image?: string, galeria?: string[]
 * }} ProdutoPublicado
 */

/** @param {number} valor */
const emCentavos = (valor) => Math.round(valor * 100) / 100

/** @param {ProdutoPublicado} produto */
const quantidadeMinima = (produto) => Math.max(1, produto.minimo ?? 1)

/** @param {ProdutoPublicado} produto */
const temPromocao = (produto) =>
  typeof produto.precoPromocional === 'number' && produto.precoPromocional < (produto.price ?? 0)

/**
 * O menor pedido que ela aceita, em reais: a unidade vezes o mínimo.
 *
 * A página do produto mostra este mesmo valor. O Google compara o preço da
 * lista com o da página e reprova o produto quando não batem.
 *
 * @param {ProdutoPublicado} produto
 * @returns {number}
 */
export const precoDoPedidoMinimo = (produto) =>
  emCentavos((produto.precoPromocional ?? produto.price ?? 0) * quantidadeMinima(produto))

/** @param {number} valor */
const emReaisDoGoogle = (valor) => `${valor.toFixed(2)} BRL`

/** @param {string} texto */
const escaparXml = (texto) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * @param {string} texto
 * @param {number} limite
 */
const cortar = (texto, limite) => (texto.length <= limite ? texto : `${texto.slice(0, limite - 1)}…`)

/** @param {ProdutoPublicado} produto */
const tituloDoProduto = (produto) => {
  const minimo = quantidadeMinima(produto)
  const aviso = minimo > 1 ? ` (pedido mínimo de ${minimo} unidades)` : ''
  return cortar(`${produto.name ?? ''}${aviso}`, TAMANHO_DO_TITULO)
}

/**
 * @param {string} nome
 * @param {string | number} valor
 */
const campo = (nome, valor) => `      <${nome}>${escaparXml(String(valor))}</${nome}>`

/**
 * @param {ProdutoPublicado} produto
 * @param {string} raiz
 */
const itemDoProduto = (produto, raiz) => {
  const minimo = quantidadeMinima(produto)
  const linhas = [
    campo('g:id', produto.id ?? produto.slug ?? ''),
    campo('title', tituloDoProduto(produto)),
    campo('description', cortar(produto.description?.trim() || produto.name || '', TAMANHO_DA_DESCRICAO)),
    campo('link', `${raiz}/produto/${produto.slug}/`),
    campo('g:image_link', produto.image ?? ''),
    ...(produto.galeria ?? []).slice(0, FOTOS_EXTRAS).map((foto) => campo('g:additional_image_link', foto)),
    campo('g:availability', 'in_stock'),
    campo('g:condition', 'new'),
    campo('g:price', emReaisDoGoogle(emCentavos((produto.price ?? 0) * minimo))),
  ]

  if (temPromocao(produto)) linhas.push(campo('g:sale_price', emReaisDoGoogle(precoDoPedidoMinimo(produto))))

  linhas.push(campo('g:brand', MARCA), campo('g:identifier_exists', 'no'))

  /* Sob encomenda: o prazo de produção é, para o Google, tempo de preparo
     antes do envio. Sem ele a cliente vê um prazo de entrega curto demais. */
  if (produto.prazoProducao) {
    linhas.push(
      campo('g:min_handling_time', produto.prazoProducao),
      campo('g:max_handling_time', produto.prazoProducao),
    )
  }

  if (produto.pesoG) linhas.push(campo('g:shipping_weight', `${produto.pesoG * minimo} g`))

  return ['    <item>', ...linhas, '    </item>'].join('\n')
}

/**
 * Produto sem foto, sem preço ou sem página o Google reprova; um só não
 * derruba a lista, mas aparece como erro na conta dela sem ela saber o
 * porquê. Fica de fora até ter o que falta.
 *
 * @param {ProdutoPublicado} produto
 */
const podeIrAoGoogle = (produto) =>
  Boolean(produto?.slug && produto.image && produto.name && (produto.price ?? 0) > 0)

/**
 * O arquivo pronto para gravar, no formato RSS que o Merchant Center lê.
 *
 * @param {{ base: string, catalogo?: { produtos?: ProdutoPublicado[] } }} argumentos
 * @returns {string}
 */
export const montarListaDoGoogleShopping = ({ base, catalogo }) => {
  const raiz = base.replace(/\/$/, '')
  const vistos = new Set()

  const itens = (catalogo?.produtos ?? []).filter(podeIrAoGoogle).filter((produto) => {
    const chave = produto.id ?? produto.slug
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    `    <title>${MARCA}</title>`,
    `    <link>${escaparXml(raiz)}/</link>`,
    '    <description>Papelaria personalizada feita sob encomenda</description>',
    ...itens.map((produto) => itemDoProduto(produto, raiz)),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
