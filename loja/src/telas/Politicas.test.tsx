import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import Politicas from './Politicas'

const abrir = () => render(<Politicas />)

const blocoDeDados = () => {
  abrir()
  const titulo = screen.getByRole('heading', { level: 2, name: 'Seus dados pessoais' })
  return titulo.closest('section')?.textContent ?? ''
}

describe('o aviso de privacidade na política da loja', () => {
  it('fica depois do texto dela, como último bloco da página', () => {
    abrir()

    const titulos = screen.getAllByRole('heading', { level: 2 }).map((t) => t.textContent)

    expect(titulos.at(-1)).toBe('Seus dados pessoais')
  })

  it('diz o que é coletado e para quê', () => {
    const texto = blocoDeDados()

    expect(texto).toMatch(/nome, e-mail, WhatsApp, endereço de entrega e os\s+pedidos/)
    expect(texto).toMatch(/fazer, cobrar, enviar e acompanhar/)
  })

  it('cita as duas bases legais: contrato e obrigação fiscal', () => {
    const texto = blocoDeDados()

    expect(texto).toMatch(/execução de contrato/)
    expect(texto).toMatch(/art\. 7º, V\)/)
    expect(texto).toMatch(/obrigação legal, art\. 7º, II\)/)
  })

  it('lista quem recebe os dados e a ida para os Estados Unidos', () => {
    const texto = blocoDeDados()

    for (const servico of ['Supabase', 'Mercado Pago', 'Melhor Envio', 'Resend', 'GitHub Pages']) {
      expect(texto).toContain(servico)
    }
    expect(texto).toMatch(/Estados Unidos/)
  })

  it('separa a controladora, que é a loja, da operadora, que mantém o site', () => {
    const texto = blocoDeDados()

    expect(texto).toMatch(/Feito para você! Personalizados é a controladora/)
    expect(texto).toMatch(/Constancio Dev, que mantém o site, é a operadora/)
  })

  it('não inventa prazo em anos e não traz documento de ninguém', () => {
    const texto = blocoDeDados()

    expect(texto).toMatch(/pelo tempo que a lei exige/)
    expect(texto).not.toMatch(/\d+\s+anos/)
    expect(texto).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
  })

  it('leva à conversa da loja para pedir e à política de privacidade completa', () => {
    abrir()

    expect(screen.getByRole('link', { name: /conversa da loja/i })).toHaveAttribute(
      'href',
      '/?conversa=1',
    )
    expect(screen.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute(
      'href',
      '/privacidade/',
    )
  })
})
