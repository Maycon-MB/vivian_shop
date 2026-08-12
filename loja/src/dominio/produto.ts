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
  /** Caminho da foto dentro de /public. Vazio enquanto a cliente não manda. */
  imagem?: string
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}
