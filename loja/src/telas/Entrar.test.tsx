import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Entrar from './Entrar'

/**
 * A porta da área dela.
 *
 * Quem usa são a Vivian e a Lilian, no celular, poucas vezes por semana.
 * O que este teste protege não é o caminho feliz — é o que acontece
 * quando dá errado, que é quando alguém desiste e me liga.
 */

const entrou = vi.fn()
const foiPara = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: foiPara, push: foiPara }),
  usePathname: () => '/admin/entrar',
}))

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => true,
  entrar: (...args: unknown[]) => entrou(...args),
  donaDaVez: async () => null,
}))

beforeEach(() => {
  entrou.mockReset()
  foiPara.mockReset()
})

describe('entrar na área da loja', () => {
  it('não deixa mandar sem e-mail, e diz o que fazer', async () => {
    render(<Entrar />)

    await userEvent.click(await screen.findByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/escreva o seu e-mail/i)
    // E não gastou a internet dela para ouvir isso.
    expect(entrou).not.toHaveBeenCalled()
  })

  it('avisa do @ que falta, em vez de "e-mail inválido"', async () => {
    render(<Entrar />)

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'vivian.exemplo.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'uma senha boa')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/@/)
  })

  it('leva para o painel quando dá certo', async () => {
    entrou.mockResolvedValue(null)
    render(<Entrar />)

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'vivian@exemplo.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'uma senha boa')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(foiPara).toHaveBeenCalledWith('/admin/'))
  })

  it('traduz o erro do servidor, sem inglês e sem entregar a conta', async () => {
    entrou.mockResolvedValue('Invalid login credentials')
    render(<Entrar />)

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'vivian@exemplo.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'errada demais')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    const aviso = await screen.findByRole('alert')
    expect(aviso).toHaveTextContent(/e-mail ou senha/i)
    expect(aviso).not.toHaveTextContent(/Invalid|credentials/)
  })

  it('não deixa apertar duas vezes enquanto tenta', async () => {
    // Internet ruim é o caso normal dela. Dois envios criam duas
    // tentativas, e o servidor começa a barrar por excesso.
    entrou.mockImplementation(() => new Promise(() => {}))
    render(<Entrar />)

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'vivian@exemplo.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'uma senha boa')

    const botao = screen.getByRole('button', { name: /entrar/i })
    await userEvent.click(botao)

    await waitFor(() => expect(botao).toBeDisabled())
    expect(entrou).toHaveBeenCalledTimes(1)
  })

  it('não oferece criar conta, porque a loja já tem dona', async () => {
    /* Quem se cadastrasse aqui saía com uma conta que não enxerga nada:
       desde a 0004, só a primeira conta da loja vira dona. O link não
       ajudava ninguém e enchia o Supabase de conta sobrando. */
    render(<Entrar />)

    expect(await screen.findByRole('link', { name: /esqueci/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /criar/i })).toBeNull()
  })
})
