import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MinhaConta from './MinhaConta'

describe('criar a conta de quem compra', () => {
  it('diz para que servem os dados perto do botão e abre a política em outra aba', async () => {
    render(<MinhaConta />)

    await userEvent.click(screen.getByRole('button', { name: /criar agora/i }))

    expect(screen.getByText(/servem só para mostrar os seus pedidos/i)).toBeInTheDocument()
    const politica = screen.getByRole('link', { name: /política de privacidade/i })
    expect(politica).toHaveAttribute('href', '/privacidade/')
    // Em outra aba, para o que ela já digitou não se perder.
    expect(politica).toHaveAttribute('target', '_blank')
  })
})
