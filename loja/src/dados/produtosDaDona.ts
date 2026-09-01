'use client'

import { bancoDoNavegador } from '@/servicos/autenticacao'
import type { ProdutoDaLista } from '@/dominio/listaDeProdutos'
import { estaFixado, posicaoPara } from '@/dominio/ordemDaVitrine'
import type { ProdutoComMedida } from '@/dominio/medidasDoTipo'

/**
 * O catálogo como a dona da loja o vê: tudo, inclusive o que não está no
 * ar.
 *
 * A vitrine lê a mesma tabela e enxerga só o que está `ativo`. Não é uma
 * escolha desta consulta: é a política do banco, que responde diferente
 * conforme quem pergunta. Por isso não há um "filtro de segurança" aqui —
 * ele estaria no lugar errado, e seria contornável.
 */

const COLUNAS = 'id, slug, nome, preco_reais, ativo, posicao, imagem_mini, temas(nome)'

interface LinhaDoBanco {
  id: string
  slug: string
  nome: string
  preco_reais: string | number
  ativo: boolean
  posicao: number | null
  imagem_mini: string | null
  temas: { nome: string } | null
}

const paraLista = (linha: LinhaDoBanco): ProdutoDaLista => ({
  id: linha.id,
  slug: linha.slug,
  nome: linha.nome,
  // `numeric` do Postgres chega como texto: sem converter, o preço soma
  // concatenando em vez de somar.
  preco: Number(linha.preco_reais),
  ativo: linha.ativo,
  fixado: estaFixado(linha.posicao),
  tema: linha.temas?.nome ?? '',
  imagem_mini: linha.imagem_mini,
})

export const listarTodos = async (): Promise<ProdutoDaLista[]> => {
  const { data, error } = await bancoDoNavegador()
    .from('produtos')
    .select(COLUNAS)
    .order('nome')

  if (error) throw new Error(error.message)

  return (data as unknown as LinhaDoBanco[]).map(paraLista)
}

/**
 * Publica ou tira do ar, em lote.
 *
 * Em lote porque ela tem 58 Lousas Mágicas iguais: uma a uma seriam 58
 * toques no celular, e ninguém faz isso duas vezes.
 *
 * O banco recusa publicar produto personalizado sem peso e medidas — a
 * restrição existe porque frete errado sai do bolso dela. Quando isso
 * acontece, o erro sobe para a tela dizer qual produto está incompleto,
 * em vez de falhar em silêncio.
 */
export const mudarPublicacao = async (ids: string[], ativo: boolean): Promise<void> => {
  if (!ids.length) return

  const { error } = await bancoDoNavegador()
    .from('produtos')
    .update({ ativo })
    .in('id', ids)

  if (error) throw new Error(error.message)
}

/**
 * Fixa no topo da vitrine, ou solta.
 *
 * Em lote, pelo mesmo motivo da publicação: ela tem 58 Lousas Mágicas, e
 * na época de volta às aulas o que ela quer é pôr o tipo inteiro na
 * frente, não um produto por vez.
 *
 * Só muda o site na publicação seguinte, porque o catálogo entra no build
 * e não no navegador. Quem chama avisa isso na tela.
 */
export const mudarDestaque = async (ids: string[], fixar: boolean): Promise<void> => {
  if (!ids.length) return

  const { error } = await bancoDoNavegador()
    .from('produtos')
    .update({ posicao: posicaoPara(fixar) })
    .in('id', ids)

  if (error) throw new Error(error.message)
}

/**
 * Nome e medidas de tudo que já tem caixa cadastrada.
 *
 * Serve para o formulário responder sozinho a pergunta que ela não sabe
 * responder: quanto pesa a caixa fechada com dez peças. Ver
 * `medidasDoTipo.ts`.
 *
 * Só o que interessa para essa conta, e não o produto inteiro: são 342
 * linhas, e ela abre o painel pelo 4G.
 */
export const medidasJaCadastradas = async (): Promise<ProdutoComMedida[]> => {
  const { data, error } = await bancoDoNavegador()
    .from('produtos')
    .select('nome, peso_g, alt_cm, larg_cm, comp_cm')
    .not('peso_g', 'is', null)

  if (error) throw new Error(error.message)

  return (data ?? []) as ProdutoComMedida[]
}

/* ── Cadastrar e editar ──────────────────────────────────────────────── */

const COLUNAS_DE_EDICAO =
  'id, slug, nome, descricao, preco_reais, preco_promocional_reais, linha, tema_id, ' +
  'minimo, prazo_producao, peso_g, alt_cm, larg_cm, comp_cm, pasta_drive, ' +
  'imagem, imagem_mini, galeria, ativo'

/** Um produto inteiro, para ela editar. */
export const buscarParaEditar = async (id: string): Promise<Record<string, unknown>> => {
  const { data, error } = await bancoDoNavegador()
    .from('produtos')
    .select(COLUNAS_DE_EDICAO)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  return data as unknown as Record<string, unknown>
}

/** Os temas dela, para escolher no formulário. */
export const listarTemas = async (): Promise<{ id: string; nome: string }[]> => {
  const { data, error } = await bancoDoNavegador()
    .from('temas')
    .select('id, nome')
    .order('nome')

  if (error) throw new Error(error.message)

  return (data ?? []) as { id: string; nome: string }[]
}

/**
 * Grava o produto: cria quando não tem id, atualiza quando tem.
 *
 * O `slug` não é atualizado ao editar — quem monta a linha já reaproveita
 * o antigo. Mudar o endereço de um produto no ar quebraria o link que a
 * cliente salvou e a página que o Google já indexou.
 */
export const salvarProduto = async (
  linha: Record<string, unknown>,
  id?: string,
): Promise<string> => {
  const banco = bancoDoNavegador()

  const { data, error } = id
    ? await banco.from('produtos').update(linha).eq('id', id).select('id').single()
    : await banco.from('produtos').insert(linha).select('id').single()

  if (error) throw new Error(error.message)

  return (data as { id: string }).id
}
