import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { ExigirDona } from './ExigirDona'

/**
 * O guarda da área dela.
 *
 * Até 24/08 o painel era público: quem digitasse o endereço via os pedidos
 * das clientes, com nome, telefone e endereço de entrega. As políticas do
 * banco já barravam a leitura dos dados, mas a tela abria — e tela de
 * administração aberta é convite.
 *
 * A regra é uma só e não é "estar logado": é **estar na tabela de donas**.
 * Qualquer pessoa pode criar conta se o cadastro estiver aberto, e isso
 * não pode dar acesso a nada.
 */

const quemEsta = vi.fn()
const foiPara = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: foiPara }),
  usePathname: () => '/admin',
}))

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => true,
  situacaoDaDona: () => quemEsta(),
}))

beforeEach(() => {
  quemEsta.mockReset()
  foiPara.mockReset()
})

describe('quem entra na área da loja', () => {
  it('mostra o painel para quem é dona', async () => {
    quemEsta.mockResolvedValue({
      estado: 'dentro',
      dona: { id: '1', nome: 'Vivian', email: 'v@e.com' },
    })

    render(<ExigirDona><p>os pedidos</p></ExigirDona>)

    expect(await screen.findByText('os pedidos')).toBeInTheDocument()
  })

  it('manda para a entrada quem não está logada', async () => {
    quemEsta.mockResolvedValue({ estado: 'fora' })

    render(<ExigirDona><p>os pedidos</p></ExigirDona>)

    await waitFor(() => expect(foiPara).toHaveBeenCalledWith('/admin/entrar/'))
  })

  it('não expulsa quem tem sessão quando o servidor não responde', async () => {
    /* Com o celular dela na oficina, internet oscilando é o normal.
       Expulsar para o login a cada oscilação transforma isso em "fui
       deslogada de novo", e ela para de entrar.

       Deixar passar não abre nada: sem resposta do banco não há dado para
       mostrar, e quem segura os dados é a política, não esta tela. */
    quemEsta.mockResolvedValue({ estado: 'sem-resposta' })

    render(<ExigirDona><p>os pedidos</p></ExigirDona>)

    expect(await screen.findByText('os pedidos')).toBeInTheDocument()
    expect(foiPara).not.toHaveBeenCalled()
  })

  it('não mostra nada enquanto não sabe quem é', async () => {
    // O intervalo entre carregar a página e a resposta do servidor é
    // curto, mas existe. Mostrar o painel nesse intervalo entregaria a
    // tela a quem não deveria vê-la, mesmo que por um segundo.
    quemEsta.mockImplementation(() => new Promise(() => {}))

    render(<ExigirDona><p>os pedidos</p></ExigirDona>)

    expect(screen.queryByText('os pedidos')).not.toBeInTheDocument()
  })

  it('barra quem está logada mas não é dona', async () => {
    // Estar logado não é ser dona: qualquer um pode criar conta enquanto
    // o cadastro estiver aberto.
    quemEsta.mockResolvedValue({ estado: 'fora' })

    render(<ExigirDona><p>os pedidos</p></ExigirDona>)

    await waitFor(() => expect(foiPara).toHaveBeenCalled())
    expect(screen.queryByText('os pedidos')).not.toBeInTheDocument()
  })
})
