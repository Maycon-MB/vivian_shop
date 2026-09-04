import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Como ela recebe, lido e gravado.
 *
 * ── Por que este teste nasceu ─────────────────────────────────────────
 *
 * Em 04/09, ao consertar a aba de Configurações, apareceu uma armadilha do
 * Postgres que vale para toda tela de salvar deste projeto:
 *
 * **Quando a política de segurança barra um `update`, o banco não devolve
 * erro. Devolve zero linhas alteradas.**
 *
 * Um código que só olha `error` mostra o visto verde por cima de nada. E
 * aqui isso é pior do que na tela de Configurações, porque esta decide
 * **quanto sai do bolso de quem compra**: parcelas, juros e desconto no
 * Pix. Ela ajustaria o parcelamento, veria "salvo", e a loja continuaria
 * cobrando o de antes.
 *
 * O sintoma seria ela desconfiando da própria memória, e não do sistema.
 */

const update = vi.fn()
const select = vi.fn()
const eq = vi.fn()
const from = vi.fn()

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => true,
  bancoDoNavegador: () => ({ from }),
}))

const CONFIG = {
  parcelas_max: 3,
  juros_por_conta_da_loja: false,
  desconto_pix: 5,
  aceita_credito: true,
  aceita_debito: true,
  aceita_pix: true,
}

/** O encadeamento do supabase-js: from().update().eq().select() */
const responderComGravacao = (resposta: unknown) => {
  select.mockResolvedValue(resposta)
  eq.mockReturnValue({ select })
  update.mockReturnValue({ eq })
  from.mockReturnValue({ update })
}

describe('quando ela muda como recebe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reclama quando a política do banco barra, em vez de dizer que salvou', async () => {
    /* Este é o caso que motivou o teste. O banco responde sem erro e sem
       linha alterada, e é indistinguível de sucesso para quem só olha
       `error`. */
    responderComGravacao({ data: [], error: null })

    const { salvarComoElaRecebe } = await import('./comoElaRecebeNoBanco')

    await expect(salvarComoElaRecebe(CONFIG)).rejects.toThrow()
  })

  it('reclama quando o banco devolve erro', async () => {
    responderComGravacao({ data: null, error: { message: 'sem conexão' } })

    const { salvarComoElaRecebe } = await import('./comoElaRecebeNoBanco')

    await expect(salvarComoElaRecebe(CONFIG)).rejects.toThrow('sem conexão')
  })

  it('grava quando o banco altera a linha', async () => {
    responderComGravacao({ data: [{ id: true }], error: null })

    const { salvarComoElaRecebe } = await import('./comoElaRecebeNoBanco')

    await expect(salvarComoElaRecebe(CONFIG)).resolves.toBeUndefined()
    expect(from).toHaveBeenCalledWith('configuracoes_de_pagamento')
  })

  it('carimba a hora da mudança, para ela saber quando mexeu', async () => {
    responderComGravacao({ data: [{ id: true }], error: null })

    const { salvarComoElaRecebe } = await import('./comoElaRecebeNoBanco')
    await salvarComoElaRecebe(CONFIG)

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ atualizado_em: expect.any(String) }),
    )
  })
})
