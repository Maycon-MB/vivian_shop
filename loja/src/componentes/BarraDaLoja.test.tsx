import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { BarraDaLoja } from './BarraDaLoja'

/**
 * A barra de cima, em toda página de quem compra.
 *
 * Quem chega por um link de produto (anúncio, Instagram, Google) cai direto
 * na página dele. Sem esta barra, não havia como ir ao resto da loja, buscar
 * outro tema ou achar o carrinho: só um "voltar" que depende de ter vindo de
 * algum lugar.
 */

const caminho = vi.hoisted(() => ({ atual: '/produtos/' }))
const carrinho = vi.hoisted(() => ({ unidades: 0 }))

vi.mock('next/navigation', () => ({ usePathname: () => caminho.atual }))
vi.mock('@/telas/CarrinhoContexto', () => ({ useCarrinho: () => carrinho }))

beforeEach(() => {
  caminho.atual = '/produtos/'
  carrinho.unidades = 0
})

const textoDaBarra = () => screen.getByRole('navigation').textContent ?? ''

describe('a barra de cima', () => {
  it('leva de volta ao começo da loja pelo nome dela', () => {
    render(<BarraDaLoja />)

    expect(screen.getByRole('link', { name: /feito para você/i })).toHaveAttribute('href', '/')
  })

  it('leva ao catálogo inteiro, onde está a busca', () => {
    render(<BarraDaLoja />)

    expect(screen.getByRole('link', { name: /procurar/i })).toHaveAttribute('href', '/produtos/')
  })

  it('leva aos pedidos de quem já comprou', () => {
    render(<BarraDaLoja />)

    expect(screen.getByRole('link', { name: /meus pedidos/i })).toHaveAttribute(
      'href',
      '/minha-conta/',
    )
  })

  it('mostra quantos itens estão no carrinho e leva a fechar a compra', () => {
    carrinho.unidades = 20
    render(<BarraDaLoja />)

    const link = screen.getByRole('link', { name: /carrinho, 20 itens/i })
    expect(link).toHaveAttribute('href', '/checkout/')
    expect(link.textContent).toContain('20')
  })

  it('não mostra contagem quando o carrinho está vazio', () => {
    render(<BarraDaLoja />)

    expect(screen.getByRole('link', { name: /^ver o carrinho$/i }).textContent).toBe('')
  })

  it('some na página inicial, que já tem a barra dela com os filtros', () => {
    caminho.atual = '/'
    const { container } = render(<BarraDaLoja />)

    expect(container).toBeEmptyDOMElement()
  })

  it('não mostra a área dela para quem está comprando', () => {
    render(<BarraDaLoja />)

    expect(textoDaBarra()).not.toMatch(/minhas vendas|perguntas|painel/i)
  })

  it('se chama pelo que é: navegação da loja', () => {
    render(<BarraDaLoja />)

    expect(screen.getByRole('navigation').getAttribute('aria-label')).toMatch(/loja/i)
  })
})
