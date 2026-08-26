'use client'

import { bancoDoNavegador, temBanco } from '@/servicos/autenticacao'

/**
 * As avaliações, lidas e escritas.
 *
 * Quem escreve passa pela função `avaliar`, que confere a chave do pedido:
 * a tabela não aceita insert de ninguém. Quem lê pela tabela só enxerga o
 * que ela publicou, e é a política do banco que garante isso, não este
 * arquivo.
 */

export interface AvaliacaoPublicada {
  id: string
  nome: string
  nota: number
  texto: string
  quando: string
  resposta?: string
  produto?: { nome: string; slug: string }
}

const COLUNAS =
  'id, primeiro_nome, nota, texto, criado_em, resposta_da_loja, produtos(nome, slug)'

interface Linha {
  id: string
  primeiro_nome: string
  nota: number
  texto: string
  criado_em: string
  resposta_da_loja: string | null
  publicada?: boolean
  produtos: { nome: string; slug: string } | null
}

const paraTela = (linha: Linha): AvaliacaoPublicada => ({
  id: linha.id,
  nome: linha.primeiro_nome,
  nota: linha.nota,
  texto: linha.texto,
  quando: linha.criado_em,
  ...(linha.resposta_da_loja ? { resposta: linha.resposta_da_loja } : {}),
  ...(linha.produtos ? { produto: linha.produtos } : {}),
})

/**
 * O que a loja mostra.
 *
 * Devolve lista vazia quando não há banco ou a consulta falha: uma página
 * de produto que não abre porque as avaliações não responderam é pior do
 * que uma página sem avaliação.
 */
export const avaliacoesPublicadas = async (
  produtoId?: string,
): Promise<AvaliacaoPublicada[]> => {
  if (!temBanco()) return []

  try {
    let consulta = bancoDoNavegador()
      .from('avaliacoes')
      .select(COLUNAS)
      .order('criado_em', { ascending: false })

    if (produtoId) consulta = consulta.eq('produto_id', produtoId)

    const { data, error } = await consulta
    if (error || !data) return []

    return (data as unknown as Linha[]).map(paraTela)
  } catch {
    return []
  }
}

/** Os produtos daquele pedido, para a tela do convite. */
export const produtosParaAvaliar = async (chave: string) => {
  const { data, error } = await bancoDoNavegador().rpc('produtos_para_avaliar', {
    p_chave: chave,
  })

  if (error) throw new Error(error.message)

  return (data ?? []) as {
    produto_id: string
    nome: string
    imagem: string | null
    ja_avaliado: boolean
  }[]
}

export const avaliar = async (
  chave: string,
  produtoId: string,
  nota: number,
  texto: string,
): Promise<void> => {
  const { error } = await bancoDoNavegador().rpc('avaliar', {
    p_chave: chave,
    p_produto_id: produtoId,
    p_nota: nota,
    p_texto: texto,
  })

  if (error) throw new Error(error.message)
}

/* ── O lado dela ────────────────────────────────────────────────────── */

export interface AvaliacaoNoPainel extends AvaliacaoPublicada {
  publicada: boolean
}

/** Todas, publicadas ou não. A política só devolve isto para a dona. */
export const todasAsAvaliacoes = async (): Promise<AvaliacaoNoPainel[]> => {
  const { data, error } = await bancoDoNavegador()
    .from('avaliacoes')
    .select(`${COLUNAS}, publicada`)
    .order('criado_em', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as unknown as Linha[]).map((linha) => ({
    ...paraTela(linha),
    publicada: Boolean(linha.publicada),
  }))
}

export const publicarAvaliacao = async (id: string, publicada: boolean): Promise<void> => {
  const { error } = await bancoDoNavegador()
    .from('avaliacoes')
    .update({ publicada })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const responderAvaliacao = async (id: string, resposta: string): Promise<void> => {
  const { error } = await bancoDoNavegador()
    .from('avaliacoes')
    .update({ resposta_da_loja: resposta.trim() || null })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
