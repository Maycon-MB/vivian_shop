'use client'

import { PADRAO, type ComoElaRecebe } from '@/dominio/comoElaRecebe'
import { bancoDoNavegador, temBanco } from '@/servicos/autenticacao'

/**
 * Como ela recebe, lido e gravado.
 *
 * A leitura é pública de propósito: a página do produto diz "em até 3x sem
 * juros" antes de qualquer login, e é isso que ajuda a fechar a venda. A
 * escrita é só dela, e quem garante isso é a política do banco.
 */

const COLUNAS =
  'parcelas_max, juros_por_conta_da_loja, desconto_pix, aceita_credito, aceita_debito, aceita_pix'

/**
 * O que a loja mostra sobre pagamento.
 *
 * Devolve o padrão quando não há banco ou quando a consulta falha: uma
 * página de produto que não abre porque a configuração de parcelas não
 * respondeu é pior do que uma que diz só o preço à vista.
 */
export const comoElaRecebe = async (): Promise<ComoElaRecebe> => {
  if (!temBanco()) return PADRAO

  try {
    const { data, error } = await bancoDoNavegador()
      .from('configuracoes_de_pagamento')
      .select(COLUNAS)
      .maybeSingle()

    if (error || !data) return PADRAO

    const linha = data as unknown as Record<string, unknown>

    return {
      parcelas_max: Number(linha.parcelas_max) || 1,
      juros_por_conta_da_loja: Boolean(linha.juros_por_conta_da_loja),
      // `numeric` do Postgres chega como texto.
      desconto_pix: Number(linha.desconto_pix) || 0,
      aceita_credito: Boolean(linha.aceita_credito),
      aceita_debito: Boolean(linha.aceita_debito),
      aceita_pix: Boolean(linha.aceita_pix),
    }
  } catch {
    return PADRAO
  }
}

export const salvarComoElaRecebe = async (config: ComoElaRecebe): Promise<void> => {
  const { error } = await bancoDoNavegador()
    .from('configuracoes_de_pagamento')
    .update({ ...config, atualizado_em: new Date().toISOString() })
    .eq('id', true)

  if (error) throw new Error(error.message)
}
