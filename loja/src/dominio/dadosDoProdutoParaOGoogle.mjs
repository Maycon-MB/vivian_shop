import { camposParaOGoogle } from './listaDoGoogleShopping.mjs'

/**
 * Os dados estruturados (schema.org `Product`) de uma página de produto.
 *
 * Entra o produto e o endereço da loja; sai o objeto para o JSON-LD, com o
 * mesmo título, código e preço da lista do Google Shopping, ou `null` para
 * o produto que fica fora da lista.
 *
 * @param {import('./listaDoGoogleShopping.mjs').ProdutoPublicado} produto
 * @param {string} base
 */
export const dadosDoProdutoParaOGoogle = (produto, base) => {
  const campos = camposParaOGoogle(produto, base.replace(/\/$/, ''))
  if (!campos) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: campos.titulo,
    image: campos.imagem,
    description: campos.descricao,
    sku: campos.id,
    brand: { '@type': 'Brand', name: campos.marca },
    offers: {
      '@type': 'Offer',
      url: campos.link,
      priceCurrency: 'BRL',
      // O Google compara com o preço efetivo da lista: o promocional, quando há.
      price: (campos.precoPromocional ?? campos.preco).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}

/**
 * O texto para dentro de `<script type="application/ld+json">`.
 *
 * O `<` vira `<` porque o nome e a descrição são digitados no painel, e
 * um `</script>` ali fecharia a tag e rodaria o que viesse depois.
 *
 * @param {unknown} dados
 * @returns {string}
 */
export const emJsonLd = (dados) => JSON.stringify(dados).replace(/</g, '\\u003c')
