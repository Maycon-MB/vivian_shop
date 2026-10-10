import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LINHA_PEDAGOGICA } from '@/dominio/linhas'

const contarEtapa = vi.fn()

vi.mock('@/dados/visitasNoBanco', () => ({
  contarEtapa: (etapa: string) => contarEtapa(etapa),
}))

const { ProvedorCarrinho, useCarrinho } = await import('./CarrinhoContexto')

const APOSTILA = {
  id: 5,
  slug: 'apostila',
  name: 'Apostila de alfabetização adaptada',
  category: LINHA_PEDAGOGICA,
  price: 47,
}

const CADERNO = {
  id: 1,
  slug: 'caderno-personalizado',
  name: 'Caderno personalizado',
  category: 'Papelaria personalizada',
  price: 32,
}

const BotaoDePor = ({ produto, quantidade }: { produto: object; quantidade: number }) => {
  const { adicionar } = useCarrinho() as { adicionar: (p: object, q: number) => boolean }
  return (
    <button type="button" onClick={() => adicionar(produto, quantidade)}>
      Pôr no carrinho
    </button>
  )
}

const abrirCom = (produto: object, quantidade: number) =>
  render(
    <ProvedorCarrinho>
      <BotaoDePor produto={produto} quantidade={quantidade} />
    </ProvedorCarrinho>,
  )

const respiro = () => new Promise((resolve) => setTimeout(resolve, 30))

beforeEach(() => {
  contarEtapa.mockReset()
})

describe('o funil conta o carrinho', () => {
  it('conta a etapa do carrinho quando o produto entra', async () => {
    abrirCom(CADERNO, 10)

    await userEvent.click(screen.getByRole('button', { name: /Pôr no carrinho/ }))

    await waitFor(() => expect(contarEtapa).toHaveBeenCalledWith('carrinho'))
  })

  it('não conta o material repetido que o carrinho recusou', async () => {
    abrirCom(APOSTILA, 1)
    const botao = screen.getByRole('button', { name: /Pôr no carrinho/ })

    await userEvent.click(botao)
    await waitFor(() => expect(contarEtapa).toHaveBeenCalledTimes(1))

    await userEvent.click(botao)
    await respiro()

    expect(contarEtapa).toHaveBeenCalledTimes(1)
  })
})
