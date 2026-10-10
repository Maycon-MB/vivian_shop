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
