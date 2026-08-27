/**
 * O pacote que vai ser postado: peso e medidas.
 *
 * Isto existe por um erro que custava dinheiro dela em todo pedido.
 *
 * ── O que estava errado ────────────────────────────────────────────────
 *
 * A cotação somava `pesoG * quantidade / minimo`. A divisão vinha de uma
 * crença: a de que `peso_g` era o peso do **lote de dez**, porque o campo
 * na Elojinha se chamava "Peso do lote" e o dado trazia
 * `shipping_dimensions_per_unit: false`.
 *
 * Os números do catálogo dela dizem outra coisa. A Lousa Mágica está
 * registrada com 100 g e caixa de **1,5 × 19 × 30 cm**: 1,5 cm é a
 * espessura de uma lousa, e dez empilhadas dão quinze centímetros. A
 * caneca está com caixa de 10,5 × 11 × 11 cm, que é uma caneca.
 *
 * Ela preencheu o valor de uma peça num campo rotulado como lote.
 *
 * O resultado: a loja cotava frete de 100 g e postava um quilo. A
 * diferença sai do bolso dela, e ela só descobre no balcão dos Correios.
 *
 * ── Por que tratar como peça, e não esperar a resposta dela ────────────
 *
 * Os dois erros custam, e não custam a mesma coisa. Cotar a menos tira
 * dinheiro dela em toda venda, em silêncio. Cotar a mais afasta a cliente
 * antes de comprar, e aparece na hora.
 *
 * Entre errar barato e errar caro, o código erra do lado que ela consegue
 * ver. **Continua sendo pergunta para ela**, e a resposta é uma só: pesar
 * um pacote fechado de dez e medir a caixa.
 */

export interface ItemNoCarrinho {
  quantidade: number
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}

export interface Pacote {
  pesoG: number
  altCm: number
  largCm: number
  compCm: number
}

/** Quando o produto não traz medida, algo plausível e não minúsculo. */
const PADRAO = { pesoG: 100, altCm: 2, largCm: 20, compCm: 30 }

/** Os Correios não cobram menos que isto, por menor que seja a caixa. */
const PESO_MINIMO_G = 300

/**
 * O pacote fechado do pedido.
 *
 * O peso é a soma de cada peça. As medidas empilham pela **menor
 * dimensão**, que é como ela embala de verdade: dez lousas viram uma pilha
 * mais alta, e não uma caixa dez vezes mais larga.
 *
 * Com produtos diferentes no mesmo pedido, a caixa fica do tamanho da
 * maior largura e do maior comprimento, e a altura soma. É aproximação, e
 * é a aproximação que erra para cima.
 */
export const pacoteDoPedido = (itens: ItemNoCarrinho[]): Pacote => {
  if (!itens.length) return { ...PADRAO, pesoG: PESO_MINIMO_G }

  let pesoG = 0
  let altura = 0
  let largura = 0
  let comprimento = 0

  for (const item of itens) {
    const quantos = Math.max(1, item.quantidade ?? 1)

    // Cada peça pesa o que pesa. Sem dividir por nada.
    pesoG += (item.pesoG ?? PADRAO.pesoG) * quantos

    const medidas = [
      item.altCm ?? PADRAO.altCm,
      item.largCm ?? PADRAO.largCm,
      item.compCm ?? PADRAO.compCm,
    ].sort((a, b) => a - b)

    // A menor é a espessura: é ela que cresce quando se empilha.
    altura += medidas[0] * quantos
    largura = Math.max(largura, medidas[1])
    comprimento = Math.max(comprimento, medidas[2])
  }

  return {
    pesoG: Math.max(Math.round(pesoG), PESO_MINIMO_G),
    altCm: Math.round(altura * 10) / 10,
    largCm: Math.round(largura * 10) / 10,
    compCm: Math.round(comprimento * 10) / 10,
  }
}
