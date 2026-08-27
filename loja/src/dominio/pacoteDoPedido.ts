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
 * ver.
 *
 * ── A margem que ela pediu ─────────────────────────────────────────────
 *
 * A Vivian pediu que o peso ficasse **um pouco acima** da multiplicação
 * exata, e ela tem razão por um motivo que eu não tinha considerado: o que
 * vai para a balança dos Correios não são as dez peças, é o pacote. A
 * caixa, o plástico bolha e a fita pesam, e não aparecem em lugar nenhum
 * do catálogo.
 *
 * O pedido dela também confirma o que os números sugeriam: **o peso
 * registrado é de uma peça**, e a conta é peça vezes quantidade.
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
 * O que a embalagem acrescenta, e que não está no catálogo.
 *
 * A caixa, o plástico bolha e a fita de um pacote do tamanho dos dela
 * ficam nessa ordem de grandeza. É estimativa, e é de propósito uma
 * estimativa **para cima**: cotar a menos tira dinheiro dela em silêncio.
 *
 * Quando ela pesar um pacote fechado de verdade, este número sai e o
 * medido entra.
 */
const EMBALAGEM_G = 120

/**
 * Uma folga por cima do que a conta dá.
 *
 * Pedido dela, e o motivo é que a soma exata é um piso, não um retrato: a
 * peça pode sair um pouco mais pesada, o papel pode ser mais grosso, a
 * fita pode ser mais generosa num dia corrido. Cinco por cento não afasta
 * cliente e cobre a variação.
 */
const FOLGA = 1.05

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
/**
 * A caixa que comporta o volume, sem virar tubo.
 *
 * Empilhar pela espessura funciona para coisa plana: dez lousas de 1,5 cm
 * viram uma pilha de 15 cm, que é o que ela embrulha de verdade.
 *
 * Para coisa cúbica, aquilo dava absurdo. Dez canecas de 10,5 × 11 × 11
 * empilhadas davam **105 × 11 × 11 cm**: um tubo de um metro. Ninguém
 * embala assim, e os Correios recusam pacote com lado acima de um metro.
 * Ela põe as canecas lado a lado, em duas camadas.
 *
 * Quando a pilha ficaria mais alta do que o lado maior da base, a caixa
 * vira uma quase-cúbica do mesmo volume, que é o que sai da mesa dela.
 */
const caixaQueCabe = (volumeCm3: number, largura: number, comprimento: number) => {
  const altura = volumeCm3 / (largura * comprimento)

  // Pilha proporcional: é assim que se embrulha coisa plana.
  if (altura <= comprimento) {
    return { altCm: altura, largCm: largura, compCm: comprimento }
  }

  /* Virou tubo. A caixa passa a ser quase cúbica, e nenhum lado fica
     menor do que a peça, senão ela não entra. */
  const lado = Math.cbrt(volumeCm3)

  return {
    altCm: Math.max(lado, largura),
    largCm: Math.max(lado, largura),
    compCm: Math.max(lado, comprimento),
  }
}

export const pacoteDoPedido = (itens: ItemNoCarrinho[]): Pacote => {
  if (!itens.length) return { ...PADRAO, pesoG: PESO_MINIMO_G }

  let pesoG = 0
  let volume = 0
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

    volume += medidas[0] * medidas[1] * medidas[2] * quantos

    // A base fica do tamanho da maior peça: nada pode ficar de fora.
    largura = Math.max(largura, medidas[1])
    comprimento = Math.max(comprimento, medidas[2])
  }

  /* Peça não encaixa em peça sem sobra: entre uma caneca e outra fica ar,
     e esse ar viaja no caminhão. Quinze por cento cobre a folga. */
  const caixa = caixaQueCabe(volume * 1.15, largura, comprimento)

  /* A embalagem entra uma vez por pacote, e não por peça: é uma caixa só.
     A folga vem depois, sobre o total. */
  const comEmbalagem = (pesoG + EMBALAGEM_G) * FOLGA

  const arredondar = (n: number) => Math.round(n * 10) / 10

  return {
    pesoG: Math.max(Math.round(comEmbalagem), PESO_MINIMO_G),
    altCm: arredondar(caixa.altCm),
    largCm: arredondar(caixa.largCm),
    compCm: arredondar(caixa.compCm),
  }
}
