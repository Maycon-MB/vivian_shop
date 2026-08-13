import { describe, it, expect } from 'vitest'

import { pagamentoSimulado } from './pagamentoSimulado'
import type { PedidoDePagamento } from './contratos'

/**
 * O que importa provar aqui é que a recusa existe e que ela é útil.
 *
 * Uma loja que só sabe aprovar não tem tela de erro testada — e a tela de
 * erro é justamente a que decide se a pessoa tenta de novo ou desiste. Por
 * isso todo teste de recusa confere as duas coisas: que houve motivo e que
 * há uma saída escrita para quem está do outro lado.
 */

const pedidoDe = (valor: number, email = 'ana@exemplo.com.br'): PedidoDePagamento => ({
  valor,
  meio: 'pix',
  comprador: { nome: 'Ana Souza', email, whatsapp: '(21) 99999-0000' },
})

describe('cobrança simulada', () => {
  it('aprova um pedido comum e devolve um identificador', async () => {
    const resultado = await pagamentoSimulado.cobrar(pedidoDe(348.9))

    expect(resultado.aprovado).toBe(true)
    if (resultado.aprovado) {
      expect(resultado.identificador).toMatch(/^SIM-/)
      expect(resultado.meio).toBe('pix')
    }
  })

  it('nunca repete o identificador de duas cobranças iguais', async () => {
    const primeira = await pagamentoSimulado.cobrar(pedidoDe(120))
    const segunda = await pagamentoSimulado.cobrar(pedidoDe(120))

    if (primeira.aprovado && segunda.aprovado) {
      expect(primeira.identificador).not.toBe(segunda.identificador)
    }
  })

  it.each([
    [100.01, /saldo/i],
    [100.02, /cartão/i],
    [100.03, /banco/i],
  ])('recusa o valor %s e diz o que fazer', async (valor, esperado) => {
    const resultado = await pagamentoSimulado.cobrar(pedidoDe(valor))

    expect(resultado.aprovado).toBe(false)
    if (!resultado.aprovado) {
      expect(resultado.motivo).toMatch(esperado)
      // A saída é obrigatória: recusa sem caminho é beco sem saída.
      expect(resultado.comoResolver.length).toBeGreaterThan(20)
      expect(resultado.comoResolver).toMatch(/pix|cartão|banco|whatsapp/i)
    }
  })

  it('recusa quando o e-mail pede recusa, para poder demonstrar o erro', async () => {
    const resultado = await pagamentoSimulado.cobrar(pedidoDe(200, 'recusa@exemplo.com.br'))
    expect(resultado.aprovado).toBe(false)
  })

  it('responde igual para o mesmo pedido, para o teste não depender do relógio', async () => {
    const primeira = await pagamentoSimulado.cobrar(pedidoDe(59.01))
    const segunda = await pagamentoSimulado.cobrar(pedidoDe(59.01))

    expect(primeira.aprovado).toBe(false)
    expect(segunda.aprovado).toBe(false)
    if (!primeira.aprovado && !segunda.aprovado) {
      expect(primeira.motivo).toBe(segunda.motivo)
    }
  })

  it('não fala jargão de banco com quem está comprando', async () => {
    const resultado = await pagamentoSimulado.cobrar(pedidoDe(70.02))

    if (!resultado.aprovado) {
      const texto = `${resultado.motivo} ${resultado.comoResolver}`.toLowerCase()
      for (const jargao of ['emissor', 'transação negada', 'antifraude', 'gateway', 'declined']) {
        expect(texto).not.toContain(jargao)
      }
    }
  })

  it('não se apresenta como serviço de verdade', () => {
    expect(pagamentoSimulado.real).toBe(false)
  })
})
