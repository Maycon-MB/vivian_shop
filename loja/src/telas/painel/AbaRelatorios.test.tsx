import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Quem decide se os pedidos de exemplo entram na conta. Começa desligado
   porque a maior parte deste arquivo descreve a demonstração, onde eles
   existem de propósito. */
const temBanco = vi.fn(() => false)

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => temBanco(),
}))

const carregarPedidosDaLoja = vi.fn()

vi.mock('./pedidosDaLoja', () => ({
  carregarPedidosDaLoja: () => carregarPedidosDaLoja(),
}))

/* O cartão de visitas mora dentro desta tela e fala com o Supabase assim
   que monta. Sem isto, todo teste daqui dependeria da rede, e com o banco
   ligado ele derrubava a suíte por um vizinho que não está sob teste. */
vi.mock('@/dados/visitasNoBanco', () => ({
  movimentoDaLoja: async () => null,
}))

const { default: AbaRelatorios } = await import('./AbaRelatorios')

beforeEach(() => {
  vi.clearAllMocks()
  temBanco.mockReturnValue(false)
  carregarPedidosDaLoja.mockResolvedValue([])
})

/**
 * O relatório é onde um número plausível e errado faz mais estrago.
 *
 * As contas já têm teste próprio, em dominio/relatorios.ts. O que se
 * verifica aqui é o outro risco, que nenhum teste de conta pega: o número
 * certo mostrado com o rótulo errado. Frete apresentado como faturamento
 * continua sendo um número correto — e continua fazendo a Vivian achar
 * que ganhou o que só passou pela mão dela.
 */

describe('aba de relatórios', () => {
  it('separa o que é dela do que é repasse da transportadora', async () => {
    render(<AbaRelatorios />)

    expect(await screen.findByText('O que é seu')).toBeInTheDocument()
    expect(screen.getByText('Frete (não é seu)')).toBeInTheDocument()
    expect(screen.getByText(/passa pela sua conta e sai/)).toBeInTheDocument()
  })

  it('soletra a conta em uma frase, e não só em números soltos', async () => {
    render(<AbaRelatorios />)

    // É a frase que ela vai repetir para o contador ou para o marido.
    expect(await screen.findByText(/Tirando/)).toBeInTheDocument()
    expect(screen.getByText(/ficaram/)).toBeInTheDocument()
  })

  it('mostra o que produzir somando os pedidos', async () => {
    render(<AbaRelatorios />)

    expect(await screen.findByText('O que produzir agora')).toBeInTheDocument()
  })

  it('admite que a taxa do Elo7 é estimativa, e não número dela', async () => {
    render(<AbaRelatorios />)

    // Enquanto ela não responder, apresentar isso como fato seria inventar
    // economia — e economia inventada é o que faz alguém tomar decisão ruim.
    expect(await screen.findByText(/chute meu, não um número seu/)).toBeInTheDocument()
  })

  it('recalcula a economia quando ela corrige a porcentagem', async () => {
    render(<AbaRelatorios />)

    const campo = await screen.findByLabelText(/Porcentagem que o Elo7 cobrava/)

    const antes = screen.getByText('Lá, você pagaria').parentElement?.textContent

    await userEvent.clear(campo)
    await userEvent.type(campo, '20')

    const depois = screen.getByText('Lá, você pagaria').parentElement?.textContent
    expect(depois).not.toBe(antes)
  })

  it('mostra prejuízo em vez de esconder quando o fixo sai mais caro', async () => {
    render(<AbaRelatorios />)

    const campo = await screen.findByLabelText(/Porcentagem que o Elo7 cobrava/)
    await userEvent.clear(campo)
    await userEvent.type(campo, '1')

    // Com 1% de comissão, os R$ 100 fixos perdem — e a tela precisa dizer.
    expect(await screen.findByText('Este mês saiu mais caro')).toBeInTheDocument()
    expect(screen.getByText(/o fixo só compensa vendendo mais/)).toBeInTheDocument()
  })

  it('deixa exportar o mês para o contador', async () => {
    render(<AbaRelatorios />)

    const botao = await screen.findByRole('button', { name: /Baixar para o contador/ })
    expect(botao).toBeEnabled()
  })

  it('avisa que os números incluem pedidos de exemplo', async () => {
    render(<AbaRelatorios />)

    expect(await screen.findByText(/incluem os pedidos de exemplo/)).toBeInTheDocument()
  })

  it('escreve "1 pedido" e não "1 pedidos"', async () => {
    render(<AbaRelatorios />)

    const linhas = await screen.findByText(/Pedagógica:/)
    expect(within(linhas.parentElement as HTMLElement).queryByText(/\b1 pedidos\b/)).toBeNull()
  })
})

/**
 * Com a loja vendendo de verdade, o relatório é dinheiro dela.
 *
 * Estes números não são decoração: é com eles que ela decide preço, se
 * continua pagando o fixo e se volta para um marketplace. Receita inflada
 * por pedido inventado empurra todas essas decisões para o lado errado, e
 * o erro só aparece meses depois, no extrato.
 */
describe('aba de relatórios, com a loja no ar', () => {
  beforeEach(() => {
    temBanco.mockReturnValue(true)
  })

  it('não soma pedido de exemplo no faturamento', async () => {
    carregarPedidosDaLoja.mockResolvedValue([
      {
        id: '0012',
        estado: 'producao',
        linha: 'personalizada',
        cliente: 'Marina Alves',
        itens: [{ nome: 'Caderno personalizado', quantidade: 10, preco: 32 }],
        subtotal: 320,
        frete: 28.9,
        criadoEmISO: new Date().toISOString(),
      },
    ])

    render(<AbaRelatorios />)

    const receita = await screen.findByText('O que é seu')
    const bloco = receita.parentElement as HTMLElement

    // Uma venda de R$ 320. Os sete exemplos somam milhares; se entrarem,
    // este número não é 320.
    expect(within(bloco).getByText(/320,00/)).toBeInTheDocument()
    expect(within(bloco).getByText(/1 pedido/)).toBeInTheDocument()
  })

  it('não avisa sobre exemplo, porque não há exemplo nenhum', async () => {
    carregarPedidosDaLoja.mockResolvedValue([])

    render(<AbaRelatorios />)

    await screen.findByText('Nenhuma venda este mês')
    expect(screen.queryByText(/incluem os pedidos de exemplo/)).toBeNull()
  })

  it('diz que não houve venda em vez de mostrar receita inventada', async () => {
    carregarPedidosDaLoja.mockResolvedValue([])

    render(<AbaRelatorios />)

    expect(await screen.findByText('Nenhuma venda este mês')).toBeInTheDocument()
  })
})
