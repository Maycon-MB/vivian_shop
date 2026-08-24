import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Navegacao } from './Navegacao'

/**
 * A barra de cima é de quem compra, não de quem administra.
 *
 * Até 24/08 ela listava as sete áreas do projeto na mesma linha: a loja,
 * as vendas dela, as perguntas em aberto, quanto a loja custa, a
 * justificativa do design e o relatório de entregas. Quatro dos sete itens
 * eram conversa nossa com a Vivian, aparecendo para quem entrou querendo
 * comprar uma caneca.
 *
 * Isso é a maior causa da "cara de demonstração" — mais do que qualquer
 * cor ou fonte. Loja de verdade não tem "o que já fiz" no menu.
 *
 * O que é dela continua existindo, atrás do login. O que é nosso vira
 * documento. Aqui fica só o que serve a quem está comprando.
 */

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const textoDoMenu = () => screen.getByRole('navigation').textContent ?? ''

describe('a barra de cima', () => {
  it('leva para a loja, os temas e as informações de compra', () => {
    render(<Navegacao />)

    expect(screen.getByRole('link', { name: /a loja/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /como funciona/i })).toBeInTheDocument()
  })

  it('não mostra a área dela para quem está comprando', () => {
    render(<Navegacao />)

    // "Minhas vendas" e "Perguntas" são dela, e passam a viver atrás do
    // login. Quem compra não deve nem saber que existem.
    expect(textoDoMenu()).not.toMatch(/minhas vendas/i)
    expect(textoDoMenu()).not.toMatch(/perguntas/i)
  })

  it('não mostra os documentos do projeto', () => {
    render(<Navegacao />)

    // "Quanto custa" é o que a loja custa para ela, não o preço de um
    // produto. "O que já fiz" é relatório de entrega. Nada disso é página
    // de loja, e para a cliente dela chega a ser confuso.
    expect(textoDoMenu()).not.toMatch(/quanto custa/i)
    expect(textoDoMenu()).not.toMatch(/o que já fiz/i)
    expect(textoDoMenu()).not.toMatch(/minha marca/i)
  })

  it('marca onde a pessoa está, para ela não se perder', () => {
    render(<Navegacao />)

    expect(screen.getByRole('link', { name: /a loja/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('se chama pelo que é: navegação da loja', () => {
    render(<Navegacao />)

    // "Áreas do projeto" é vocabulário de quem construiu. Quem usa leitor
    // de tela ouve isso e não entende onde está.
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toMatch(/loja/i)
  })
})
