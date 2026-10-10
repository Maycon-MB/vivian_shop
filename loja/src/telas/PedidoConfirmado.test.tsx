import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const buscar = vi.fn()

// Como no ar: pagamento, frete, e-mail e banco ligados.
vi.mock('@/servicos', () => ({
  pedidos: { buscar: (...args: unknown[]) => buscar(...args) },
  estaTudoReal: true,
}))

const { default: PedidoConfirmado } = await import('./PedidoConfirmado')
import { ProvedorCarrinho } from './CarrinhoContexto'

beforeEach(() => {
  buscar.mockReset().mockResolvedValue({ id: 'pedido-de-teste', numero: '0042', total: 320 })
  window.history.replaceState({}, '', '/pedido-confirmado/?pedido=pedido-de-teste')
})

const abrir = async () => {
  render(
    <ProvedorCarrinho>
      <PedidoConfirmado />
    </ProvedorCarrinho>,
  )
  await screen.findByText('#0042')
}

const textoDaTela = () => document.body.textContent ?? ''

describe('a confirmação de um pedido pago', () => {
  it('não diz que a confirmação foi por e-mail, porque a loja não manda esse e-mail', async () => {
    await abrir()

    expect(textoDaTela()).not.toMatch(/confirmação foi para o seu e-mail/i)
  })

  it('não promete o código de rastreio por e-mail nem por WhatsApp', async () => {
    await abrir()

    expect(textoDaTela()).not.toMatch(/chega no seu e-mail/i)
    expect(textoDaTela()).not.toMatch(/whatsapp/i)
  })

  it('não promete novidades por e-mail, que ela não pediu para receber', async () => {
    await abrir()

    expect(textoDaTela()).not.toMatch(/novidades/i)
  })

  it('diz onde acompanhar o pedido: em Minha conta ou na conversa da loja', async () => {
    await abrir()

    expect(screen.getByRole('link', { name: /minha conta/i })).toHaveAttribute(
      'href',
      '/minha-conta/',
    )
    expect(screen.getByRole('link', { name: /falar com a loja/i })).toHaveAttribute(
      'href',
      '/?conversa=1',
    )
  })
})
