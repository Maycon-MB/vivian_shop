import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'

const contarEtapa = vi.fn()

vi.mock('@/dados/visitasNoBanco', () => ({
  contarEtapa: (etapa: string) => contarEtapa(etapa),
}))

const { default: PaginaProduto } = await import('./PaginaProduto')
const { ProvedorCarrinho } = await import('./CarrinhoContexto')
const { PRODUTOS } = await import('./catalogo')

describe('o funil conta a página de produto', () => {
  it('conta a etapa do produto quando a página abre', async () => {
    render(
      <ProvedorCarrinho>
        <PaginaProduto produto={PRODUTOS[0]} />
      </ProvedorCarrinho>,
    )

    await waitFor(() => expect(contarEtapa).toHaveBeenCalledWith('produto'))
  })
})

describe('mandar o produto no WhatsApp', () => {
  const abrir = () =>
    render(
      <ProvedorCarrinho>
        <PaginaProduto produto={PRODUTOS[0]} />
      </ProvedorCarrinho>,
    )

  it('mostra o link do wa.me com o nome do produto e a origem whatsapp', () => {
    const { getByRole } = abrir()
    const href = getByRole('link', { name: /mandar no whatsapp/i }).getAttribute('href') ?? ''
    expect(href.startsWith('https://wa.me/?text=')).toBe(true)
    const texto = decodeURIComponent(href.slice('https://wa.me/?text='.length))
    expect(texto).toContain(PRODUTOS[0].name)
    expect(texto).toContain('origem=whatsapp')
  })

  it('usa o compartilhar do celular quando ele existe', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    const { getByRole } = abrir()
    getByRole('link', { name: /mandar no whatsapp/i }).click()
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(share.mock.calls[0][0].text).toContain(PRODUTOS[0].name)
    delete (navigator as { share?: unknown }).share
  })
})
