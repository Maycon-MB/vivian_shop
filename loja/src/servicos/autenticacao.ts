'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * A porta de entrada da área da Vivian.
 *
 * Quem guarda a senha é o Supabase, com hash. Nem eu nem ela vemos: o que
 * trafega daqui é o que a pessoa digitou, direto para eles, e o que volta
 * é uma sessão.
 *
 * A chave usada aqui é a anônima, que vai dentro da página e qualquer um
 * copia em dez segundos. Ela não dá poder nenhum: quem decide o que cada
 * conta enxerga são as políticas do banco, e elas perguntam se a pessoa
 * está na tabela `donas_da_loja`. Estar logado não é ser dona.
 */

let cliente: SupabaseClient | null = null

/** Verdadeiro quando o banco está configurado neste ambiente. */
export const temBanco = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const bancoDoNavegador = (): SupabaseClient => {
  if (cliente) return cliente

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !chave) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Copie .env.example para .env.local.',
    )
  }

  cliente = createClient(url, chave, {
    auth: {
      // A sessão sobrevive a fechar a aba: ela administra a loja do
      // celular, entre um pedido e outro, e pedir senha toda vez faria
      // ela parar de entrar.
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return cliente
}

export interface Dona {
  id: string
  nome: string
  email: string
}

/**
 * Quem está logada, e se ela é dona da loja.
 *
 * São duas perguntas, e a segunda é a que importa: qualquer pessoa pode
 * criar conta se o cadastro estiver aberto, e isso não dá acesso a nada.
 */
export type Situacao =
  | { estado: 'fora' }
  | { estado: 'dentro'; dona: Dona }
  | { estado: 'sem-resposta' }

/**
 * Quem está logada, e se ela é dona da loja.
 *
 * Três respostas, e a terceira é a que faltava: **não consegui perguntar**.
 * A primeira versão devolvia só "é dona" ou "não é", e tratava erro de
 * rede como "não é" — o que expulsava a Vivian para a tela de entrar toda
 * vez que a internet oscilasse. Com o celular dela na oficina, isso seria
 * o comportamento normal, não a exceção.
 *
 * A sessão é lida do próprio aparelho primeiro, sem rede: se não existe
 * sessão nenhuma, não há o que perguntar a ninguém.
 */
export const situacaoDaDona = async (): Promise<Situacao> => {
  const banco = bancoDoNavegador()

  // Local, sem rede: só diz se existe sessão guardada neste aparelho.
  const { data: guardada } = await banco.auth.getSession()
  if (!guardada?.session) return { estado: 'fora' }

  try {
    const { data, error } = await banco
      .from('donas_da_loja')
      .select('id, nome')
      .eq('id', guardada.session.user.id)
      .maybeSingle()

    if (error) return { estado: 'sem-resposta' }
    if (!data) return { estado: 'fora' }

    return {
      estado: 'dentro',
      dona: { id: data.id, nome: data.nome, email: guardada.session.user.email ?? '' },
    }
  } catch {
    return { estado: 'sem-resposta' }
  }
}

export const donaDaVez = async (): Promise<Dona | null> => {
  const banco = bancoDoNavegador()

  const { data: sessao } = await banco.auth.getUser()
  const usuario = sessao?.user
  if (!usuario) return null

  const { data } = await banco
    .from('donas_da_loja')
    .select('id, nome')
    .eq('id', usuario.id)
    .maybeSingle()

  if (!data) return null

  return { id: data.id, nome: data.nome, email: usuario.email ?? '' }
}

export const entrar = async (email: string, senha: string) => {
  const { error } = await bancoDoNavegador().auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  })

  return error?.message ?? null
}

export const criarConta = async (nome: string, email: string, senha: string) => {
  const { error } = await bancoDoNavegador().auth.signUp({
    email: email.trim(),
    password: senha,
    // O nome vai junto porque o gatilho do banco lê daqui para preencher
    // `donas_da_loja` no momento do cadastro.
    options: { data: { nome: nome.trim() } },
  })

  return error?.message ?? null
}

export const sair = async () => {
  await bancoDoNavegador().auth.signOut()
}

/**
 * Manda o e-mail de recuperar senha.
 *
 * Existe porque a escolha de ter senha obriga: com senha, "esqueci a
 * minha" deixa de ser conveniência e vira o caminho principal de quem
 * volta depois de meses. Sem isto, a Vivian esquecer a senha significa
 * perder o acesso à própria loja e depender de mim para voltar.
 *
 * **Nunca diz se a conta existe.** Quem digita um e-mail que não está
 * cadastrado recebe a mesma resposta de quem digita o certo. Dizer "esse
 * e-mail não existe aqui" entrega a lista de clientes dela para quem
 * quiser descobrir quem compra o quê.
 */
export const pedirNovaSenha = async (email: string) => {
  const { error } = await bancoDoNavegador().auth.resetPasswordForEmail(email.trim(), {
    // Para onde o link do e-mail leva. Precisa estar na lista de
    // endereços permitidos do Supabase, senão ele recusa e o e-mail
    // chega com um link que não abre.
    redirectTo: `${window.location.origin}/admin/nova-senha/`,
  })

  return error?.message ?? null
}

/**
 * Troca a senha de quem chegou pelo link do e-mail.
 *
 * O link do Supabase já deixa a pessoa com uma sessão de recuperação
 * quando a página abre; por isso aqui é só atualizar o usuário, sem pedir
 * a senha antiga, que é justamente a que ela não lembra.
 */
export const trocarSenha = async (senha: string) => {
  const { error } = await bancoDoNavegador().auth.updateUser({ password: senha })

  return error?.message ?? null
}
