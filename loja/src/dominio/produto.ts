import type { Linha } from './linhas'

/**
 * Produto como o resto do sistema enxerga.
 *
 * `preco` é em reais, com centavos. As medidas são do pacote fechado de
 * `minimo` unidades — é o que a cliente realmente despacha — e só existem
 * na linha personalizada.
 */
export interface Produto {
  id: string
  slug: string
  nome: string
  descricao: string
  preco: number
  linha: Linha
  minimo: number
  prazoProducao: number
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}
