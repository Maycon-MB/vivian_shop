'use client'

import { bancoDoNavegador, temBanco } from '@/servicos/autenticacao'

/**
 * As configurações da loja, lidas e gravadas.
 *
 * A tabela é de linha única (`id boolean primary key default true`): não
 * existe "a configuração de qual loja", existe a loja. Por isso a leitura
 * é `maybeSingle` e a gravação é um `update` naquela linha, sem `insert`
 * em lugar nenhum.
 *
 * Até 04/09 nada disto existia. A aba de Configurações era maquete: campos
 * com `defaultValue` e um botão sem `onClick`. Ela digitava o CEP de onde
 * envia, clicava em "Salvar alterações", e o próximo carregamento devolvia
 * a tela em branco.
 */

export interface ConfiguracoesDaLoja {
  nome_da_loja: string
  frase_da_loja: string
  email_de_contato: string
  cep_de_origem: string
  cidade_de_origem: string
  endereco_de_origem: string
  minimo_padrao: number
  prazo_padrao: number
}

const COLUNAS =
  'nome_da_loja, frase_da_loja, email_de_contato, cep_de_origem, cidade_de_origem, endereco_de_origem, minimo_padrao, prazo_padrao'

/**
 * O que vale enquanto o banco não responde.
 *
 * O nome e a frase são os mesmos que estão em `app/layout.tsx`, e é de
 * propósito: são eles que quem compra lê hoje. Um padrão diferente faria a
 * tela mostrar para ela algo que a loja não mostra para ninguém.
 *
 * O mínimo de 10 e o prazo de 5 dias vêm do que ela pratica desde o Elo7.
 */
export const PADRAO: ConfiguracoesDaLoja = {
  nome_da_loja: 'Feito para você! Personalizados',
  frase_da_loja: 'Papelaria personalizada e material pedagógico para quem ensina.',
  email_de_contato: '',
  cep_de_origem: '',
  cidade_de_origem: '',
  endereco_de_origem: '',
  minimo_padrao: 10,
  prazo_padrao: 5,
}

/* Coluna em branco chega como `null`. Solto num `<input value=...>`, o
   React troca o campo de controlado para não controlado no meio da
   digitação dela e o texto some. */
const texto = (valor: unknown, padrao: string): string =>
  typeof valor === 'string' && valor.length > 0 ? valor : padrao

const inteiro = (valor: unknown, padrao: number): number => {
  const numero = Number(valor)
  return Number.isFinite(numero) && numero > 0 ? Math.round(numero) : padrao
}

/**
 * O que está configurado hoje.
 *
 * Devolve o padrão quando não há banco ou quando a consulta falha. O painel
 * inteiro mora numa aba só: se esta leitura derrubasse a tela, ela perderia
 * também o caminho até os pedidos por causa de uma configuração.
 */
export const configuracoesDaLoja = async (): Promise<ConfiguracoesDaLoja> => {
  if (!temBanco()) return PADRAO

  try {
    const { data, error } = await bancoDoNavegador()
      .from('configuracoes_da_loja')
      .select(COLUNAS)
      .maybeSingle()

    if (error || !data) return PADRAO

    const linha = data as unknown as Record<string, unknown>

    return {
      nome_da_loja: texto(linha.nome_da_loja, PADRAO.nome_da_loja),
      frase_da_loja: texto(linha.frase_da_loja, PADRAO.frase_da_loja),
      email_de_contato: texto(linha.email_de_contato, ''),
      cep_de_origem: texto(linha.cep_de_origem, ''),
      cidade_de_origem: texto(linha.cidade_de_origem, ''),
      endereco_de_origem: texto(linha.endereco_de_origem, ''),
      minimo_padrao: inteiro(linha.minimo_padrao, PADRAO.minimo_padrao),
      prazo_padrao: inteiro(linha.prazo_padrao, PADRAO.prazo_padrao),
    }
  } catch {
    return PADRAO
  }
}

/**
 * Grava o que ela mudou.
 *
 * O `.select()` no fim não é enfeite. Quando a política de segurança do
 * Postgres barra um `update`, ele **não devolve erro**: devolve zero linhas
 * alteradas, e um código que só olhasse `error` mostraria o visto verde por
 * cima de nada. Ela iria embora confiando numa configuração que o banco
 * recusou, que é exatamente o defeito que esta tela tinha em forma pior.
 */
export const salvarConfiguracoesDaLoja = async (
  config: ConfiguracoesDaLoja,
): Promise<void> => {
  const { data, error } = await bancoDoNavegador()
    .from('configuracoes_da_loja')
    .update({ ...config, atualizado_em: new Date().toISOString() })
    .eq('id', true)
    .select('id')

  if (error) throw new Error(error.message)

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('O banco não alterou nenhuma linha de configuracoes_da_loja.')
  }
}
