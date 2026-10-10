import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const movimentoDaLoja = vi.fn()
const funilDaLoja = vi.fn()

vi.mock('@/dados/visitasNoBanco', () => ({
  movimentoDaLoja: (dias: number) => movimentoDaLoja(dias),
  funilDaLoja: (dias: number) => funilDaLoja(dias),
}))

const { default: MovimentoDaLoja } = await import('./MovimentoDaLoja')

const MOVIMENTO = {
  porDia: [
    { dia: '2026-10-01', visitantes: 120, paginas: 300 },
    { dia: '2026-10-02', visitantes: 80, paginas: 200 },
  ],
  porOrigem: [{ origem: 'instagram', visitantes: 150, paginas: 400 }],
  maisVistas: [{ caminho: '/checkout', paginas: 30 }],
}

const FUNIL = [
  { etapa: 'produto', pessoas: 100 },
  { etapa: 'carrinho', pessoas: 20 },
  { etapa: 'checkout', pessoas: 10 },
  { etapa: 'pagamento', pessoas: 6 },
  { etapa: 'pago', pessoas: 3 },
]

beforeEach(() => {
  vi.clearAllMocks()
  movimentoDaLoja.mockResolvedValue(MOVIMENTO)
  funilDaLoja.mockResolvedValue(FUNIL)
})

describe('quem entrou na loja', () => {
  it('conta como venda só o que o servidor diz que foi pago', async () => {
    render(<MovimentoDaLoja />)

    const rotulo = await screen.findByText('Pagaram', { selector: '.col-6 *' })
    expect(rotulo.closest('.col-6')).toHaveTextContent('3')
    // 3 pagos de 200 pessoas.
    expect(screen.getByText('1,5%')).toBeInTheDocument()
    expect(screen.queryByText(/Viraram pedido/)).not.toBeInTheDocument()
  })

  it('mostra cada etapa do clique ao pagamento, com gente e porcentagem', async () => {
    render(<MovimentoDaLoja />)

    expect(await screen.findByText('Do clique ao pagamento')).toBeInTheDocument()
    const etapas = screen.getAllByTestId('passo-do-funil')
    expect(etapas).toHaveLength(6)
    expect(etapas[0]).toHaveTextContent('Entraram na loja')
    expect(etapas[0]).toHaveTextContent('200')
    expect(etapas[0]).toHaveTextContent('100,0% de quem entrou')
    expect(etapas[2]).toHaveTextContent('Puseram no carrinho')
    expect(etapas[2]).toHaveTextContent('10,0% de quem entrou')
    expect(etapas[5]).toHaveTextContent('Pagaram')
    expect(etapas[5]).toHaveTextContent('1,5% de quem entrou')
  })

  it('aponta onde a loja perde mais gente', async () => {
    render(<MovimentoDaLoja />)

    expect(
      await screen.findByText(
        'A maior perda está entre "Abriram um produto" e "Puseram no carrinho": ' +
          'de cada 100, 80 param ali.',
      ),
    ).toBeInTheDocument()
  })

  it('mostra o cartão mesmo quando o funil volta vazio', async () => {
    funilDaLoja.mockResolvedValue([])
    render(<MovimentoDaLoja />)

    const etapas = await screen.findAllByTestId('passo-do-funil')
    expect(etapas).toHaveLength(6)
    expect(etapas[5]).toHaveTextContent('0')
    expect(screen.getByText('0,0%')).toBeInTheDocument()
  })
})
