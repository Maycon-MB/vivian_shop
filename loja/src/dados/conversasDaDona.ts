'use client'

import { bancoDoNavegador } from '@/servicos/autenticacao'

/**
 * As conversas, do lado dela.
 *
 * Aqui a consulta é direta à tabela, e não pelas funções: quem lê é a
 * dona, e a política do banco já responde "só a dona lê as conversas". A
 * chave anônima, mesmo apontando para cá, recebe lista vazia.
 *
 * Só as escaladas aparecem. As outras se resolveram nos botões e não
 * precisam da atenção dela: uma caixa de entrada cheia de conversa
 * resolvida é uma caixa que ela para de abrir.
 */

export interface ConversaDaLista {
  id: string
  nome: string
  email: string
  respondida: boolean
  quando: string
  mensagens: { quem: 'cliente' | 'loja'; texto: string; quando: string }[]
}

interface LinhaDoBanco {
  id: string
  nome: string | null
  email: string | null
  respondida_em: string | null
  atualizado_em: string
  mensagens: { quem: string; texto: string; criado_em: string }[]
}

export const listarConversas = async (): Promise<ConversaDaLista[]> => {
  const { data, error } = await bancoDoNavegador()
    .from('conversas')
    .select('id, nome, email, respondida_em, atualizado_em, mensagens(quem, texto, criado_em)')
    .eq('escalada', true)
    .order('atualizado_em', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as unknown as LinhaDoBanco[]).map((linha) => ({
    id: linha.id,
    nome: linha.nome ?? '',
    email: linha.email ?? '',
    respondida: Boolean(linha.respondida_em),
    quando: linha.atualizado_em,
    mensagens: [...(linha.mensagens ?? [])]
      .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
      .map((m) => ({
        quem: m.quem === 'loja' ? 'loja' : 'cliente',
        texto: m.texto,
        quando: m.criado_em,
      })),
  }))
}

/**
 * Ela responde.
 *
 * A resposta aparece na loja quando a cliente voltar, e o `respondida_em`
 * é o que tira a conversa da fila do que precisa dela.
 */
export const responderConversa = async (id: string, texto: string): Promise<void> => {
  const banco = bancoDoNavegador()

  const { error } = await banco
    .from('mensagens')
    .insert({ conversa_id: id, quem: 'loja', texto })

  if (error) throw new Error(error.message)

  const agora = new Date().toISOString()
  const { error: erroDaMarca } = await banco
    .from('conversas')
    .update({ respondida_em: agora, atualizado_em: agora })
    .eq('id', id)

  if (erroDaMarca) throw new Error(erroDaMarca.message)
}
