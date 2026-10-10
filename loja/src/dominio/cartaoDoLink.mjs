import { precoDoPedidoMinimo } from './listaDoGoogleShopping.mjs'

const NOME_DA_LOJA = 'Feito para você! Personalizados'
const FRASE_DA_LOJA = 'Papelaria personalizada e material pedagógico para quem ensina.'
const IMAGEM_DA_MARCA = 'marca-feito-para-voce.webp'

/**
 * O endereço completo de uma foto. O WhatsApp e o Instagram ignoram a
 * imagem do cartão quando o endereço não traz o domínio.
 *
 * @param {string} caminho relativo à loja, absoluto no domínio, ou já completo
 * @param {string} base o endereço da loja, sem barra no fim
 */
export const enderecoAbsoluto = (caminho, base) => new URL(caminho, `${base.replace(/\/$/, '')}/`).href

/** @param {number} valor */
const emReais = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ')

/**
 * @param {{ titulo: string, descricao: string, link?: string, foto: string }} dados
 */
const cartao = ({ titulo, descricao, link, foto }) => ({
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: NOME_DA_LOJA,
    title: titulo,
    description: descricao,
    ...(link ? { url: link } : {}),
    images: [{ url: foto, alt: titulo }],
  },
  twitter: { card: 'summary_large_image', title: titulo, description: descricao, images: [foto] },
})

/**
 * O cartão do link de um produto: foto, nome e o preço do pedido mínimo,
 * o mesmo que o botão da página mostra.
 *
 * @param {import('./listaDoGoogleShopping.mjs').ProdutoPublicado} produto
 * @param {string} base
 */
export const cartaoDoProduto = (produto, base) => {
  const raiz = base.replace(/\/$/, '')
  const preco = precoDoPedidoMinimo(produto)
  return cartao({
    titulo: preco > 0 ? `${produto.name} · ${emReais(preco)}` : String(produto.name ?? NOME_DA_LOJA),
    descricao: produto.description?.trim() || FRASE_DA_LOJA,
    link: `${raiz}/produto/${produto.slug}/`,
    foto: enderecoAbsoluto(produto.image || IMAGEM_DA_MARCA, raiz),
  })
}

/**
 * O cartão do link de um tema, com a foto do primeiro produto dele.
 *
 * @param {{ slug: string, nome: string, descricao?: string }} tema
 * @param {{ image?: string } | undefined} primeiroProduto
 * @param {string} base
 */
export const cartaoDoTema = (tema, primeiroProduto, base) => {
  const raiz = base.replace(/\/$/, '')
  return cartao({
    titulo: `${tema.nome} · ${NOME_DA_LOJA}`,
    descricao: tema.descricao || FRASE_DA_LOJA,
    link: `${raiz}/tema/${tema.slug}/`,
    foto: enderecoAbsoluto(primeiroProduto?.image || IMAGEM_DA_MARCA, raiz),
  })
}

/**
 * O cartão do link da loja, com a imagem da marca. Sem `url`: ele vale de
 * herança para toda página sem cartão próprio, e apontaria todas para o início.
 *
 * @param {string} base
 */
export const cartaoDaLoja = (base) => {
  const raiz = base.replace(/\/$/, '')
  return cartao({
    titulo: NOME_DA_LOJA,
    descricao: FRASE_DA_LOJA,
    foto: enderecoAbsoluto(IMAGEM_DA_MARCA, raiz),
  })
}
