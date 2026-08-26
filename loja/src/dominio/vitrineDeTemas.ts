/**
 * A vitrine de temas.
 *
 * O que estava no ar até 25/08 era um despejo de catálogo: **140 caixas de
 * texto, sem foto nenhuma**, em ordem alfabética quebrada, antes de a
 * pessoa ver a primeira foto de produto. Um tema com 1 produto ocupava o
 * mesmo espaço de um com 6.
 *
 * Três decisões, e as três vêm dos números dela:
 *
 *   1. **Foto em cada tema.** As 342 fotos já existem no banco; os
 *      cartões é que não usavam. Quem procura "peppa" reconhece a Peppa,
 *      não a palavra.
 *   2. **Ordem por tamanho, e não alfabética.** 88 dos 140 temas têm um
 *      produto só. Alfabético põe "Arca de Noé 1" na frente de "Peppa
 *      Pig", que é o campeão de vendas dela nas avaliações.
 *   3. **Poucos na tela, o resto atrás de um toque.** Uma parede de 140
 *      links não é escolha, é desistência.
 */

export interface ProdutoDoTema {
  tema: string
  mini?: string
  image?: string
  name?: string
}

export interface TemaCru {
  slug: string
  nome: string
  quantos: number
}

export interface TemaNaVitrine extends TemaCru {
  /** A foto do primeiro produto do tema, para o cartão parar de ser texto. */
  foto: string
}

/** Quantos cabem antes de virar parede. */
export const QUANTOS_DE_CARA = 12

/**
 * Os temas prontos para a tela: com foto, e os maiores primeiro.
 *
 * Tema sem foto fica de fora. Um cartão vazio no meio dos outros lê como
 * defeito, e é pior do que o tema não aparecer: quem procura por ele ainda
 * acha pela busca e pela página do produto.
 */
export const paraAVitrine = (
  temas: TemaCru[],
  produtos: ProdutoDoTema[],
): TemaNaVitrine[] => {
  const primeiraFoto = new Map<string, string>()

  for (const produto of produtos) {
    const foto = produto.mini || produto.image
    if (!foto || primeiraFoto.has(produto.tema)) continue
    primeiraFoto.set(produto.tema, foto)
  }

  return temas
    .filter((tema) => tema.quantos > 0 && primeiraFoto.has(tema.slug))
    .map((tema) => ({ ...tema, foto: primeiraFoto.get(tema.slug) as string }))
    .sort((a, b) => {
      // Mais produtos primeiro; empate desempata pelo nome, para a ordem
      // não mudar sozinha a cada build.
      if (b.quantos !== a.quantos) return b.quantos - a.quantos
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
}

/** Quantos produtos aquele tema tem, escrito como gente escreve. */
export const quantosProdutos = (quantos: number): string =>
  quantos === 1 ? '1 produto' : `${quantos} produtos`
