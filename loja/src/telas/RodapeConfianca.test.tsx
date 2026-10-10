import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import RodapeConfianca from './RodapeConfianca'

describe('o rodapé da loja', () => {
  it('leva quem rola até o fim da página à política de privacidade', () => {
    render(<RodapeConfianca />)

    expect(screen.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute(
      'href',
      '/privacidade/',
    )
  })

  it('continua levando à política da loja, que é outro texto', () => {
    render(<RodapeConfianca />)

    expect(screen.getByRole('link', { name: 'Política da loja' })).toHaveAttribute(
      'href',
      '/politicas/',
    )
  })
})
