import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const donaDaVez = vi.fn()
const entrar = vi.fn()
const trocarSenha = vi.fn()

vi.mock('@/servicos/autenticacao', () => ({
  donaDaVez: () => donaDaVez(),
  entrar: (email: string, senha: string) => entrar(email, senha),
  trocarSenha: (senha: string) => trocarSenha(senha),
  temBanco: () => true,
}))

import MinhaSenha from './MinhaSenha'

/**
 * A troca de senha dentro do painel.
 *
 * Nasceu de um problema real em 31/08. A Vivian ficou sem acesso, o único
 * caminho para trocar senha era o link do e-mail, e ela acabou destravada
 * por uma senha provisória que eu mandei pelo WhatsApp.
 *
 * Enquanto ela não trocar, aquela senha está numa conversa de WhatsApp.
 * Esta tela é o que faz a troca não depender de e-mail chegar.
 */

beforeEach(() => {
  vi.clearAllMocks()
  donaDaVez.mockResolvedValue({ id: '1', nome: 'V', email: 'ela@exemplo.com' })
  entrar.mockResolvedValue(null)
  trocarSenha.mockResolvedValue(null)
})

describe('trocar a senha sem depender de e-mail', () => {
  it('troca quando ela confirma a senha atual', async () => {
    const usuario = userEvent.setup()
    render(<MinhaSenha />)

    await usuario.type(await screen.findByLabelText(/senha de agora/i), 'AtualQueEuSei')
    await usuario.type(screen.getByLabelText(/^nova senha/i), 'MinhaSenhaNova1')
    await usuario.type(screen.getByLabelText(/repita/i), 'MinhaSenhaNova1')
    await usuario.click(screen.getByRole('button', { name: /trocar/i }))

    expect(await screen.findByText(/senha trocada/i)).toBeInTheDocument()
    expect(trocarSenha).toHaveBeenCalledWith('MinhaSenhaNova1')
  })

  it('não troca quando a senha de agora está errada', async () => {
    /* Sem esta conferência, qualquer pessoa que pegue o computador dela
       aberto troca a senha e toma a conta. */
    entrar.mockResolvedValue('Invalid login credentials')

    const usuario = userEvent.setup()
    render(<MinhaSenha />)

    await usuario.type(await screen.findByLabelText(/senha de agora/i), 'chutei')
    await usuario.type(screen.getByLabelText(/^nova senha/i), 'MinhaSenhaNova1')
    await usuario.type(screen.getByLabelText(/repita/i), 'MinhaSenhaNova1')
    await usuario.click(screen.getByRole('button', { name: /trocar/i }))

    expect(await screen.findByText(/não confere/i)).toBeInTheDocument()
    expect(trocarSenha).not.toHaveBeenCalled()
  })

  it('não troca quando as duas novas não batem', async () => {
    // Errar a nova senha duas vezes igual é difícil; errar uma vez é fácil,
    // e trancaria ela para fora de novo.
    const usuario = userEvent.setup()
    render(<MinhaSenha />)

    await usuario.type(await screen.findByLabelText(/senha de agora/i), 'AtualQueEuSei')
    await usuario.type(screen.getByLabelText(/^nova senha/i), 'MinhaSenhaNova1')
    await usuario.type(screen.getByLabelText(/repita/i), 'MinhaSenhaNov')
    await usuario.click(screen.getByRole('button', { name: /trocar/i }))

    expect(await screen.findByText(/não são iguais|não conferem|iguais/i)).toBeInTheDocument()
    expect(trocarSenha).not.toHaveBeenCalled()
  })

  it('recusa senha curta antes de falar com o banco', async () => {
    const usuario = userEvent.setup()
    render(<MinhaSenha />)

    await usuario.type(await screen.findByLabelText(/senha de agora/i), 'AtualQueEuSei')
    await usuario.type(screen.getByLabelText(/^nova senha/i), 'abc')
    await usuario.type(screen.getByLabelText(/repita/i), 'abc')
    await usuario.click(screen.getByRole('button', { name: /trocar/i }))

    expect(await screen.findByText(/pelo menos/i)).toBeInTheDocument()
    expect(entrar).not.toHaveBeenCalled()
  })

  it('não mostra o nome próprio dela na tela', async () => {
    /* Regra do projeto: o nome dela não aparece em tela nenhuma além das
       que são dela. Esta é dela, mas o hábito de não escrever o nome
       evita o vazamento no dia em que o componente for reaproveitado. */
    render(<MinhaSenha />)

    expect(await screen.findByLabelText(/senha de agora/i)).toBeInTheDocument()
    expect(screen.queryByText(/Vivian/)).not.toBeInTheDocument()
  })
})
