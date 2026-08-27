import { createClient } from '@supabase/supabase-js'
import type { RepositorioProdutos } from './repositorio'
import type { Produto } from '@/dominio/produto'
import type { Linha } from '@/dominio/linhas'
import { limparDescricao } from '@/dominio/limparDescricao'

/**
 * Catálogo lido do Supabase.
 *
 * Só é carregado quando `NEXT_PUBLIC_SUPABASE_URL` existe — ver
 * `obterCatalogo()` em index.ts. Enquanto o banco não existir, este
 * arquivo nem é importado, e a loja roda com o catálogo de exemplo.
 *
 * Usa a chave anônima, que só enxerga produto ativo, porque é o que a
 * política de acesso da tabela permite. Escrita não passa por aqui: vai
 * pelo painel, com credencial de serviço que nunca chega ao navegador.
 */

/** Formato cru da tabela. `numeric` chega como string no driver do Postgres. */
export interface LinhaBanco {
  id: string
  slug: string
  nome: string
  descricao: string
  preco_reais: string | number
  linha: string
  minimo: number
  prazo_producao: number
  peso_g: number | null
  alt_cm: number | null
  larg_cm: number | null
  comp_cm: number | null
}

const COLUNAS =
  'id, slug, nome, descricao, preco_reais, linha, minimo, prazo_producao, peso_g, alt_cm, larg_cm, comp_cm'

/**
 * Converte o formato do banco para `Produto`.
 *
 * O `Number()` no preço não é decorativo: `numeric` do Postgres chega como
 * string, e sem a conversão o total do carrinho concatenaria texto em vez
 * de somar.
 */
export const paraProduto = (linha: LinhaBanco): Produto => ({
  id: linha.id,
  slug: linha.slug,
  nome: linha.nome,
  /* Limpa na leitura, e não na importação.
     O texto cru fica no banco: se um dia a limpeza estiver errada, o
     original ainda está lá para consertar. Apagando na importação, o que
     ela escreveu no Elo7 ao longo de anos existiria só no que eu deixei
     passar. */
  descricao: limparDescricao(linha.descricao),
  preco: Number(linha.preco_reais),
  linha: linha.linha as Linha,
  minimo: linha.minimo,
  prazoProducao: linha.prazo_producao,
  pesoG: linha.peso_g ?? undefined,
  altCm: linha.alt_cm ?? undefined,
  largCm: linha.larg_cm ?? undefined,
  compCm: linha.comp_cm ?? undefined,
})

const cliente = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !chave) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Copie .env.example para .env.local e preencha.'
    )
  }

  return createClient(url, chave)
}

export const catalogoSupabase: RepositorioProdutos = {
  async listar(linha?: Linha): Promise<Produto[]> {
    let consulta = cliente().from('produtos').select(COLUNAS).eq('ativo', true)

    if (linha) consulta = consulta.eq('linha', linha)

    /* Fixados na frente, e dentro de cada grupo o mais recente antes. É
       a ordem que o índice `produtos_por_posicao` atende, e a mesma que
       `ordemDaVitrine` descreve para poder ser conferida sem banco. */
    const { data, error } = await consulta
      .order('posicao', { ascending: true })
      .order('criado_em', { ascending: false })

    if (error) throw new Error(`Não foi possível ler o catálogo: ${error.message}`)

    return (data as unknown as LinhaBanco[]).map(paraProduto)
  },

  async buscarPorSlug(slug: string): Promise<Produto | null> {
    const { data, error } = await cliente()
      .from('produtos')
      .select(COLUNAS)
      .eq('slug', slug)
      .eq('ativo', true)
      .maybeSingle()

    if (error) throw new Error(`Não foi possível ler o produto: ${error.message}`)

    return data ? paraProduto(data as unknown as LinhaBanco) : null
  },
}
