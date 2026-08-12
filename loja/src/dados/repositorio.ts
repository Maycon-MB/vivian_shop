import type { Produto } from '@/dominio/produto'
import type { Linha } from '@/dominio/linhas'

/**
 * Contrato de leitura do catálogo.
 *
 * As páginas dependem desta interface, nunca de um banco específico. É o
 * que permite rodar a loja inteira antes de existir Supabase, e trocar
 * Supabase por Postgres em VPS depois sem tocar em nenhuma página.
 *
 * Quem escolhe a implementação é `obterCatalogo()`, em `index.ts`.
 */
export interface RepositorioProdutos {
  listar(linha?: Linha): Promise<Produto[]>
  buscarPorSlug(slug: string): Promise<Produto | null>
}
