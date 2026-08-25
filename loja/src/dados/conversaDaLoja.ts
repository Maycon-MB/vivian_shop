'use client'

import { bancoDoNavegador, temBanco } from '@/servicos/autenticacao'

/**
 * A conversa de quem compra, do lado de quem compra.
 *
 * Nada aqui consulta a tabela direto, e isso não é estilo: as tabelas
 * `conversas` e `mensagens` são fechadas para a chave anônima, porque
 * guardam nome e e-mail de clientes dela. O acesso passa pelas quatro
 * funções do banco, que recebem a chave da conversa e devolvem só aquela.
 *
 * A chave fica no navegador de quem abriu, e em lugar nenhum além dele.
 * É o que permite a cliente perguntar sem criar conta, que foi a decisão
 * tomada com o Maycon em 24/08.
 */

const CHAVE_NO_NAVEGADOR = 'conversa-da-loja'

/**
 * A chave desta pessoa, criada na primeira vez que ela abre a conversa.
 *
 * Guardada no navegador dela. Se ela limpar o navegador ou trocar de
 * aparelho, a conversa anterior fica para trás e uma nova começa: sem
 * conta, não há como ligar as duas, e inventar essa ligação seria
 * exatamente o que o cadastro obrigatório existe para fazer.
 */
export const chaveDaConversa = async (): Promise<string | null> => {
  if (!temBanco()) return null

  const guardada = window.localStorage.getItem(CHAVE_NO_NAVEGADOR)
  if (guardada) return guardada

  const { data, error } = await bancoDoNavegador().rpc('abrir_conversa')
  if (error) throw new Error(error.message)

  const nova = String(data)
  window.localStorage.setItem(CHAVE_NO_NAVEGADOR, nova)

  return nova
}

export interface FalaGravada {
  quem: 'cliente' | 'loja'
  texto: string
  criado_em: string
}

/** O que já foi dito nesta conversa, inclusive o que ela respondeu depois. */
export const lerConversa = async (chave: string): Promise<FalaGravada[]> => {
  const { data, error } = await bancoDoNavegador().rpc('ler_conversa', { p_token: chave })
  if (error) throw new Error(error.message)

  return (data ?? []) as FalaGravada[]
}

/** Grava a dúvida da cliente. */
export const enviarMensagem = async (chave: string, texto: string): Promise<void> => {
  const { error } = await bancoDoNavegador().rpc('enviar_mensagem', {
    p_token: chave,
    p_texto: texto,
  })
  if (error) throw new Error(error.message)
}

/**
 * A cliente pede resposta humana e deixa como ser achada.
 *
 * É o único momento em que nome e e-mail são pedidos. Enquanto os botões
 * resolvem, ninguém precisa se identificar para perguntar o prazo.
 */
export const falarComALoja = async (
  chave: string,
  nome: string,
  email: string,
): Promise<void> => {
  const { error } = await bancoDoNavegador().rpc('falar_com_a_loja', {
    p_token: chave,
    p_nome: nome,
    p_email: email,
  })
  if (error) throw new Error(error.message)
}
