import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * O envio direto, quando o endereço de recebimento está configurado.
 *
 * Fica num arquivo separado do resto porque precisa fingir que a variável
 * de ambiente existe — e com ela existindo a tela muda: o botão principal
 * deixa de ser o do WhatsApp. Misturar os dois estados no mesmo arquivo
 * faria cada teste depender da ordem em que roda.
 *
 * O que se prova aqui é o que a Vivian precisa saber em cada desfecho: que
 * chegou, ou que não chegou e o texto dela não se perdeu.
 */

const enviarRespostas = vi.fn()

vi.mock('@/servicos/enviarRespostas', () => ({
  podeEnviar: true,
  enviarRespostas: (...args: unknown[]) => enviarRespostas(...args),
}))

const { default: Perguntas } = await import('./Perguntas')

beforeEach(() => {
  enviarRespostas.mockReset()
})

const responderUma = async () => {
  await userEvent.type(
    await screen.findByLabelText(/endereço da sua loja no Elo7/),
    'elo7.com.br/loja/feitoparavoce',
  )
}

describe('envio direto', () => {
  it('manda as respostas e confirma que chegaram', async () => {
    enviarRespostas.mockResolvedValue({ ok: true })

    render(<Perguntas />)
    await responderUma()

    await userEvent.click(screen.getByRole('button', { name: /Enviar minhas respostas/ }))

    expect(await screen.findByText(/Recebi, obrigado/)).toBeInTheDocument()
    expect(enviarRespostas).toHaveBeenCalledWith(
      expect.objectContaining({ linkelo7: 'elo7.com.br/loja/feitoparavoce' }),
    )
  })

  it('para de cobrar depois que o envio deu certo', async () => {
    enviarRespostas.mockResolvedValue({ ok: true })

    render(<Perguntas />)
    await responderUma()
    await screen.findByText(/ainda não me chegou/)

    await userEvent.click(screen.getByRole('button', { name: /Enviar minhas respostas/ }))

    await waitFor(() => {
      expect(screen.queryByText(/ainda não me chegou/)).not.toBeInTheDocument()
    })
  })

  it('avisa quando não conseguiu enviar, sem fingir que deu certo', async () => {
    enviarRespostas.mockResolvedValue({
      ok: false,
      motivo: 'Não consegui enviar agora — pode ser a internet.',
    })

    render(<Perguntas />)
    await responderUma()

    await userEvent.click(screen.getByRole('button', { name: /Enviar minhas respostas/ }))

    const aviso = await screen.findByRole('alert')
    expect(aviso).toHaveTextContent(/Não consegui enviar agora/)
    expect(screen.queryByText(/Recebi, obrigado/)).not.toBeInTheDocument()
  })

  it('continua cobrando quando o envio falhou, para ela tentar de novo', async () => {
    enviarRespostas.mockResolvedValue({ ok: false, motivo: 'falhou' })

    render(<Perguntas />)
    await responderUma()

    await userEvent.click(screen.getByRole('button', { name: /Enviar minhas respostas/ }))
    await screen.findByRole('alert')

    // O texto continua guardado e ainda não chegou em ninguém: a tarja
    // some só quando alguma coisa de fato sai daqui.
    expect(screen.getByText(/ainda não me chegou/)).toBeInTheDocument()
  })

  it('avisa quando enviou mas não deu para confirmar', async () => {
    enviarRespostas.mockResolvedValue({ ok: true, semConfirmacao: true })

    render(<Perguntas />)
    await responderUma()

    await userEvent.click(screen.getByRole('button', { name: /Enviar minhas respostas/ }))

    // Prometer "recebi" sem ter lido a resposta do servidor seria mentir
    // por conveniência. A tela diz o que sabe e dá uma saída.
    expect(await screen.findByText(/me chama no WhatsApp/)).toBeInTheDocument()
  })

  it('mantém o WhatsApp como segunda opção', async () => {
    enviarRespostas.mockResolvedValue({ ok: true })

    render(<Perguntas />)
    await responderUma()

    expect(screen.getByRole('link', { name: /Mandar pelo WhatsApp/ })).toBeInTheDocument()
  })

  it('não deixa enviar sem nenhuma resposta', async () => {
    render(<Perguntas />)

    const botao = await screen.findByRole('button', { name: /Responda alguma coisa primeiro/ })
    expect(botao).toBeDisabled()
    expect(enviarRespostas).not.toHaveBeenCalled()
  })
})
