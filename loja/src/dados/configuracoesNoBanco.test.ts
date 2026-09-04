import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * As configurações da loja, lidas e gravadas.
 *
 * O que estes testes protegem é a diferença entre "salvou" e "achou que
 * salvou". O Postgres, quando a política de segurança barra um `update`,
 * **não devolve erro**: devolve zero linhas alteradas. Sem conferir isso,
 * a tela mostraria o visto verde e ela iria embora confiando numa
 * configuração que o banco recusou.
 */

const estado: {
  leitura: { data: unknown; error: unknown }
  gravacao: { data: unknown; error: unknown }
  gravado: Record<string, unknown> | null
  tabela: string | null
} = {
  leitura: { data: null, error: null },
  gravacao: { data: [{ id: true }], error: null },
  gravado: null,
  tabela: null,
}

const bancoFalso = {
  from(tabela: string) {
    estado.tabela = tabela
    return {
      select: () => ({
        maybeSingle: async () => estado.leitura,
      }),
      update(valores: Record<string, unknown>) {
        estado.gravado = valores
        return {
          eq: () => ({
            select: async () => estado.gravacao,
          }),
        }
      },
    }
  },
}

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => true,
  bancoDoNavegador: () => bancoFalso,
}))

const { PADRAO, configuracoesDaLoja, salvarConfiguracoesDaLoja } = await import(
  './configuracoesNoBanco'
)

beforeEach(() => {
  estado.leitura = { data: null, error: null }
  estado.gravacao = { data: [{ id: true }], error: null }
  estado.gravado = null
  estado.tabela = null
})

describe('o que a tela dela lê', () => {
  it('traz o que está salvo no banco', async () => {
    estado.leitura = {
      data: {
        nome_da_loja: 'Feito para você! Personalizados',
        frase_da_loja: 'Papelaria personalizada.',
        email_de_contato: 'contato@exemplo.com',
        cep_de_origem: '21000-000',
        cidade_de_origem: 'Rio de Janeiro',
        endereco_de_origem: 'Rua das Flores, 10',
        minimo_padrao: 12,
        prazo_padrao: 7,
      },
      error: null,
    }

    const salvas = await configuracoesDaLoja()

    expect(estado.tabela).toBe('configuracoes_da_loja')
    expect(salvas.cidade_de_origem).toBe('Rio de Janeiro')
    expect(salvas.minimo_padrao).toBe(12)
  })

  it('abre a tela mesmo quando o banco não responde', async () => {
    /* Painel que não abre porque uma configuração falhou é pior do que
       painel abrindo com os valores de hoje: ela precisa chegar nos
       pedidos. */
    estado.leitura = { data: null, error: { message: 'timeout' } }

    expect(await configuracoesDaLoja()).toEqual(PADRAO)
  })

  it('não devolve nulo do banco no lugar de um campo em branco', async () => {
    /* Coluna vazia chega como `null`, e `null` dentro de um `<input>` faz
       o React reclamar e o campo virar não controlado no meio da digitação
       dela. */
    estado.leitura = { data: { nome_da_loja: null, cep_de_origem: null }, error: null }

    const salvas = await configuracoesDaLoja()

    expect(salvas.cep_de_origem).toBe('')
    expect(salvas.endereco_de_origem).toBe('')
  })
})

describe('o que ela salva', () => {
  it('grava na linha única, com a hora da mudança', async () => {
    await salvarConfiguracoesDaLoja({ ...PADRAO, cidade_de_origem: 'Niterói' })

    expect(estado.tabela).toBe('configuracoes_da_loja')
    expect(estado.gravado?.cidade_de_origem).toBe('Niterói')
    expect(estado.gravado?.atualizado_em).toEqual(expect.any(String))
  })

  it('reclama quando a política do banco barra, em vez de dizer que salvou', async () => {
    /* Este é o caso que não dá erro: `update` barrado por RLS volta com
       `error: null` e nenhuma linha. Se passar batido, a tela mostra o
       visto verde por cima de nada. */
    estado.gravacao = { data: [], error: null }

    await expect(salvarConfiguracoesDaLoja(PADRAO)).rejects.toThrow()
  })

  it('reclama quando o banco recusa com erro', async () => {
    estado.gravacao = { data: null, error: { message: 'permission denied' } }

    await expect(salvarConfiguracoesDaLoja(PADRAO)).rejects.toThrow()
  })
})
