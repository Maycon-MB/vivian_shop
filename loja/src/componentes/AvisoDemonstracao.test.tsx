import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * O que a loja afirma sobre cobrança.
 *
 * Este arquivo existe por uma combinação que ia acontecer em dias:
 * pagamento de verdade ligado e frete ainda simulado. Nela, a loja
 * cobraria a cliente enquanto a faixa amarela dizia "nada é cobrado de
 * verdade".
 *
 * Frase falsa sobre cobrança é pior do que aviso nenhum: a cliente lê que
 * não paga, e paga.
 */

const servicos = { pagamento: 'simulado', frete: 'simulado', avisos: 'simulado', pedidos: 'simulado' }

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

vi.mock('@/servicos', () => ({
  get estaTudoReal() {
    return Object.values(servicos).every((s) => s !== 'simulado')
  },
  situacaoDosServicos: servicos,
}))

const { AvisoDemonstracao } = await import('./AvisoDemonstracao')

const comServicos = (mudancas: Partial<typeof servicos>) => Object.assign(servicos, mudancas)

beforeEach(() => {
  comServicos({ pagamento: 'simulado', frete: 'simulado', avisos: 'simulado', pedidos: 'simulado' })
})

describe('enquanto nada cobra', () => {
  it('diz que nada é cobrado', () => {
    render(<AvisoDemonstracao />)
    expect(screen.getByRole('status')).toHaveTextContent(/nada é cobrado de verdade/i)
  })
})

describe('quando o pagamento passa a cobrar', () => {
  it('nunca diz que nada é cobrado', () => {
    /* A cliente lendo "nada é cobrado" e sendo cobrada é o pior resultado
       possível desta faixa. */
    comServicos({ pagamento: 'Mercado Pago' })
    render(<AvisoDemonstracao />)

    expect(screen.getByRole('status')).not.toHaveTextContent(/nada é cobrado/i)
    expect(screen.getByRole('status')).not.toHaveTextContent(/nenhuma cobrança/i)
  })

  it('avisa que o frete ainda é estimativa', () => {
    /* Cotar R$ 23 num envio de R$ 40 tira a diferença do bolso da Vivian
       em todo pedido, e ela só descobre no balcão dos Correios. */
    comServicos({ pagamento: 'Mercado Pago' })
    render(<AvisoDemonstracao />)

    expect(screen.getByRole('status')).toHaveTextContent(/frete ainda é uma estimativa/i)
  })

  it('some quando tudo é de verdade', () => {
    comServicos({
      pagamento: 'Mercado Pago',
      frete: 'Melhor Envio',
      avisos: 'e-mail de verdade',
      pedidos: 'banco de dados',
    })

    const { container } = render(<AvisoDemonstracao />)
    expect(container).toBeEmptyDOMElement()
  })
})
