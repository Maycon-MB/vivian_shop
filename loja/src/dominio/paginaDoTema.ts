/**
 * O que a página de um tema diz ao Google: título, descrição, endereço
 * único e a lista dos produtos dela.
 *
 * Quem procura "lembrancinha do Stitch" procura o tema, não um produto.
 * Com o mesmo título genérico em 140 páginas, o Google não sabe qual
 * mostrar e acaba não mostrando nenhuma.
 */

interface Tema {
  slug: string
  nome: string
  descricao?: string
}

interface ProdutoDoTema {
  slug: string
  name: string
}

const NOME_CURTO_DA_LOJA = 'Feito para você!'

/* O Google corta a descrição perto de 160 caracteres no resultado. */
const LIMITE_DA_DESCRICAO = 160

const contarProdutos = (quantos: number) => (quantos === 1 ? '1 produto' : `${quantos} produtos`)

const semBarraFinal = (base: string) => base.replace(/\/$/, '')

export const tituloDoTema = (tema: Tema): string =>
  `Lembrancinhas personalizadas ${tema.nome} | ${NOME_CURTO_DA_LOJA}`

/** A descrição que ela escreveu no painel; sem ela, uma montada do nome e da conta. */
export const descricaoDoTema = (tema: Tema, quantos: number): string => {
  const escrita = tema.descricao?.trim()
  if (escrita) return escrita.slice(0, LIMITE_DA_DESCRICAO)

  return `Lembrancinhas e papelaria personalizada do tema ${tema.nome}: ${contarProdutos(quantos)} para a sua festa, na ${NOME_CURTO_DA_LOJA}`.slice(
    0,
    LIMITE_DA_DESCRICAO,
  )
}

/** O parágrafo debaixo do título, para a página que ela deixou sem descrição. */
export const introducaoDoTema = (tema: Tema, quantos: number): string =>
  `Tudo do tema ${tema.nome} num lugar só: ${contarProdutos(quantos)} para escolher e personalizar.`

/* Com barra no fim por causa do `trailingSlash: true`: é o mesmo endereço do sitemap. */
export const enderecoDoTema = (tema: Pick<Tema, 'slug'>, base: string): string =>
  `${semBarraFinal(base)}/tema/${tema.slug}/`

/** O schema.org `ItemList` da página, para o JSON-LD; passa por `emJsonLd` antes de ir à tela. */
export const listaDoTemaParaOGoogle = (tema: Tema, produtos: ProdutoDoTema[], base: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: tituloDoTema(tema),
  url: enderecoDoTema(tema, base),
  numberOfItems: produtos.length,
  itemListElement: produtos.map((produto, indice) => ({
    '@type': 'ListItem',
    position: indice + 1,
    url: `${semBarraFinal(base)}/produto/${produto.slug}/`,
    name: produto.name,
  })),
})
