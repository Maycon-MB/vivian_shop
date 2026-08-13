import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Perguntas from './Perguntas'

/**
 * O formulário só serve se o que ela escreve sobrevive.
 *
 * Ela vai responder no celular, entre uma coisa e outra, e vai fechar a
 * aba no meio. Se o texto se perder uma vez, ela não volta a preencher —
 * e aí o formulário inteiro não serviu para nada. É isso que estes testes
 * protegem, mais do que a aparência da tela.
 */

const CHAVE = 'feito-para-voce:respostas-vivian'

describe('formulário de perguntas', () => {
  it('abre sem nada respondido', async () => {
    render(<Perguntas />)

    expect(await screen.findByText(/0 de \d+ respondidas/)).toBeInTheDocument()
  })

  it('conta as respostas conforme ela escreve', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/Quais produtos você quer vender/),
      'caderno e caneca',
    )

    expect(await screen.findByText(/1 de \d+ respondidas/)).toBeInTheDocument()
  })

  it('guarda o que ela escreveu, para não perder ao fechar a aba', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/Quais produtos você quer vender/),
      'caderno e caneca',
    )

    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem(CHAVE) ?? '{}')
      expect(guardado.catalogo).toBe('caderno e caneca')
    })
  })

  it('devolve o que ela já tinha escrito quando volta', async () => {
    window.localStorage.setItem(CHAVE, JSON.stringify({ catalogo: 'resposta de ontem' }))

    render(<Perguntas />)

    expect(await screen.findByDisplayValue('resposta de ontem')).toBeInTheDocument()
    expect(screen.getByText(/1 de \d+ respondidas/)).toBeInTheDocument()
  })

  it('não deixa mandar antes de responder alguma coisa', async () => {
    render(<Perguntas />)

    const botao = await screen.findByRole('link', { name: /Responda alguma coisa primeiro/ })
    expect(botao).toHaveAttribute('aria-disabled', 'true')
  })

  it('monta o link do WhatsApp só com o que ela respondeu', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/Quais produtos você quer vender/),
      'caderno e caneca',
    )

    const botao = await screen.findByRole('link', { name: /Mandar pelo WhatsApp/ })
    const link = decodeURIComponent(botao.getAttribute('href') ?? '')

    expect(link).toContain('caderno e caneca')
    // O que ela não respondeu não pode entrar como pergunta vazia.
    expect(link).not.toContain('Qual endereço você quer')
    // E o texto avisa quantas ficaram para depois.
    expect(link).toMatch(/faltam \d+/)
  })

  it('explica por que cada pergunta está sendo feita', async () => {
    render(<Perguntas />)

    // Pergunta sem motivo parece burocracia; com motivo, ela responde melhor.
    expect(
      await screen.findByText(/Não precisa ser tudo. Cinco ou seis já dão uma loja cheia/),
    ).toBeInTheDocument()
  })

  it('não pede chave nem senha do Pix', async () => {
    render(<Perguntas />)

    // Pedir credencial por formulário é o começo de um vazamento. O texto
    // diz explicitamente para ela não mandar.
    expect(await screen.findByText(/Não me mande a chave nem a senha/)).toBeInTheDocument()
  })
})
