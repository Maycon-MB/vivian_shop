import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MeusProdutos from './MeusProdutos'

/**
 * A tela onde ela decide o que a loja vende.
 *
 * São 343 produtos vindos da Elojinha, todos fora do ar esperando ela
 * decidir. O que esta tela precisa fazer bem não é mostrar 343 linhas
 * bonitas: é deixar ela achar um produto e colocá-lo no ar sem repetir o
 * mesmo toque 58 vezes.
 */

const listar = vi.fn()
const publicar = vi.fn()

vi.mock('@/dados/produtosDaDona', () => ({
  listarTodos: () => listar(),
  mudarPublicacao: (...args: unknown[]) => publicar(...args),
}))

vi.mock('@/servicos/autenticacao', () => ({ temBanco: () => true }))

const produto = (nome: string, ativo = false) => ({
  id: nome,
  slug: nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  nome,
  preco: 13.7,
  ativo,
  tema: nome.split(' - ')[1] ?? '',
  imagem_mini: null,
})

beforeEach(() => {
  listar.mockReset()
  publicar.mockReset()
  listar.mockResolvedValue([
    produto('Lousa Mágica - Frozen'),
    produto('Lousa Mágica - Mickey'),
    produto('Caneca Personalizada - Frozen', true),
  ])
})

describe('a lista de produtos dela', () => {
  it('mostra quantos estão no ar e quantos esperam', async () => {
    render(<MeusProdutos />)

    // O número é o recado principal da tela: 343 produtos cadastrados e
    // nenhum à venda é uma situação que precisa saltar aos olhos.
    //
    // A contagem é procurada no cabeçalho, e não na página inteira: cada
    // grupo mostra a própria conta, e "1 no ar" apareceria em vários
    // lugares ao mesmo tempo.
    const cabecalho = await screen.findByRole('banner')

    expect(within(cabecalho).getByText(/1 no ar/i)).toBeInTheDocument()
    expect(within(cabecalho).getByText(/2 esperando/i)).toBeInTheDocument()
  })

  it('lista os produtos com preço', async () => {
    render(<MeusProdutos />)

    expect(await screen.findByText('Lousa Mágica - Frozen')).toBeInTheDocument()
    expect(screen.getAllByText(/13,70/)).not.toHaveLength(0)
  })

  it('filtra enquanto ela digita', async () => {
    render(<MeusProdutos />)
    await screen.findByText('Lousa Mágica - Frozen')

    await userEvent.type(screen.getByLabelText(/procurar/i), 'caneca')

    await waitFor(() => {
      expect(screen.queryByText('Lousa Mágica - Frozen')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Caneca Personalizada - Frozen')).toBeInTheDocument()
  })

  it('avisa quando a busca não acha nada, em vez de mostrar tela vazia', async () => {
    render(<MeusProdutos />)
    await screen.findByText('Lousa Mágica - Frozen')

    await userEvent.type(screen.getByLabelText(/procurar/i), 'guarda-chuva')

    expect(await screen.findByText(/nenhum produto/i)).toBeInTheDocument()
  })

  it('publica um produto sozinho', async () => {
    publicar.mockResolvedValue(undefined)
    render(<MeusProdutos />)
    await screen.findByText('Lousa Mágica - Frozen')

    const linha = screen.getByText('Lousa Mágica - Frozen').closest('tr')!
    await userEvent.click(within(linha).getByRole('button', { name: /publicar/i }))

    await waitFor(() =>
      expect(publicar).toHaveBeenCalledWith(['Lousa Mágica - Frozen'], true),
    )
  })

  it('publica o tipo inteiro de uma vez', async () => {
    // São 58 Lousas Mágicas iguais, variando o tema. Uma a uma seriam 58
    // toques no celular, e ninguém faz isso duas vezes.
    publicar.mockResolvedValue(undefined)
    render(<MeusProdutos />)
    await screen.findByText('Lousa Mágica - Frozen')

    await userEvent.click(
      screen.getByRole('button', { name: /publicar os 2 de "Lousa Mágica"/i }),
    )

    await waitFor(() => {
      expect(publicar).toHaveBeenCalledWith(
        ['Lousa Mágica - Frozen', 'Lousa Mágica - Mickey'],
        true,
      )
    })
  })

  it('explica quando o banco recusa publicar', async () => {
    // O banco barra produto personalizado sem peso: frete errado sai do
    // bolso dela. A tela precisa dizer isso, e não "erro 400".
    publicar.mockRejectedValue(new Error('violates check constraint "publicado_tem_medidas"'))
    render(<MeusProdutos />)
    await screen.findByText('Lousa Mágica - Frozen')

    const linha = screen.getByText('Lousa Mágica - Frozen').closest('tr')!
    await userEvent.click(within(linha).getByRole('button', { name: /publicar/i }))

    const aviso = await screen.findByRole('alert')
    expect(aviso).toHaveTextContent(/peso|medida/i)
    expect(aviso).not.toHaveTextContent(/constraint|violates/)
  })
})
