/**
 * A ordem em que os produtos aparecem na loja.
 *
 * Até 27/08 a vitrine mostrava o mais recente primeiro, e ela não tinha
 * como mudar isso. Para quem vende artesanato a ordem é sazonal: em
 * janeiro o que precisa estar no alto é volta às aulas, em novembro é
 * Natal, e o mais recente pode ser justamente o que menos sai.
 *
 * ── Por que fixar no topo, e não arrastar tudo ─────────────────────────
 *
 * São 342 produtos. Uma lista arrastável de 342 itens é bonita na tela do
 * programador e inútil no celular de quem tem dez minutos entre um pedido
 * e outro: para pôr um produto em primeiro, ela arrastaria por 341
 * posições.
 *
 * O que ela precisa é dizer "estes aqui na frente". O resto continua como
 * está, do mais novo para o mais antigo, e não exige decisão nenhuma.
 *
 * A coluna `posicao` já existia no banco desde a migração 3, com índice, e
 * nunca tinha sido usada. Aqui ela ganha significado.
 */

/** No topo da vitrine. Menor vem primeiro, e nada é menor que isto. */
export const FIXADO = -1

/** O lugar de todo produto que ela não escolheu destacar. */
export const NORMAL = 0

export const estaFixado = (posicao: number | null | undefined): boolean =>
  (posicao ?? NORMAL) < NORMAL

export const posicaoPara = (fixar: boolean): number => (fixar ? FIXADO : NORMAL)

/**
 * Ordena como a vitrine mostra.
 *
 * Fixados primeiro; dentro de cada grupo, o mais recente antes. É a mesma
 * ordem que o índice `produtos_por_posicao` no banco atende, e existe aqui
 * para a ordem poder ser conferida sem banco.
 */
export const ordemDaVitrine = <
  T extends { posicao?: number | null; criadoEm?: string | null },
>(
  produtos: T[],
): T[] =>
  [...produtos].sort((a, b) => {
    const posA = a.posicao ?? NORMAL
    const posB = b.posicao ?? NORMAL
    if (posA !== posB) return posA - posB

    /* Empate cai para o mais recente. Produto sem data vai para o fim: é
       dado faltando, e dado faltando não merece o melhor lugar da loja. */
    const quandoA = a.criadoEm ? Date.parse(a.criadoEm) : Number.NEGATIVE_INFINITY
    const quandoB = b.criadoEm ? Date.parse(b.criadoEm) : Number.NEGATIVE_INFINITY
    return quandoB - quandoA
  })
