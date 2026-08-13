import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AbaRelatorios from './AbaRelatorios'

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
