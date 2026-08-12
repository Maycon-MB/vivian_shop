import type { RepositorioProdutos } from './repositorio'
import { catalogoMemoria } from './catalogoMemoria'

/**
 * Escolhe de onde o catálogo vem.
 *
 * Sem banco configurado, usa o catálogo de exemplo em memória — a loja
 * roda inteira assim, o que permite construir e revisar as páginas antes
 * de contratar qualquer serviço.
 *
 * Com `NEXT_PUBLIC_SUPABASE_URL` definido, passa a ler do banco. A troca
 * acontece aqui e em nenhum outro lugar: nenhuma página sabe qual dos dois
 * está respondendo.
 */
export const obterCatalogo = async (): Promise<RepositorioProdutos> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return catalogoMemoria

  const { catalogoSupabase } = await import('./catalogoSupabase')
  return catalogoSupabase
}

export type { RepositorioProdutos }
