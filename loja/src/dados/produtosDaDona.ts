'use client'

import { bancoDoNavegador } from '@/servicos/autenticacao'
import type { ProdutoDaLista } from '@/dominio/listaDeProdutos'

/**
 * O catálogo como a dona da loja o vê: tudo, inclusive o que não está no
 * ar.
 *
 * A vitrine lê a mesma tabela e enxerga só o que está `ativo`. Não é uma
 * escolha desta consulta: é a política do banco, que responde diferente
 * conforme quem pergunta. Por isso não há um "filtro de segurança" aqui —
 * ele estaria no lugar errado, e seria contornável.
 */

const COLUNAS = 'id, slug, nome, preco_reais, ativo, imagem_mini, temas(nome)'

interface LinhaDoBanco {
  id: string
  slug: string
  nome: string
  preco_reais: string | number
  ativo: boolean
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
