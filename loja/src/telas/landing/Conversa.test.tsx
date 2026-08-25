import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * A conversa, do lado de quem compra.
 *
 * Substituiu o botão de WhatsApp em 25/08, a pedido da Vivian. Estes
 * testes descrevem o que acontece com a cliente dela na tela.
 */

const chaveDaConversa = vi.fn()
const enviarMensagem = vi.fn()
const falarComALoja = vi.fn()
const lerConversa = vi.fn()

vi.mock('@/dados/conversaDaLoja', () => ({
  chaveDaConversa: () => chaveDaConversa(),
  enviarMensagem: (...args: unknown[]) => enviarMensagem(...args),
  falarComALoja: (...args: unknown[]) => falarComALoja(...args),
  lerConversa: (...args: unknown[]) => lerConversa(...args),
}))

const { default: Conversa } = await import('./Conversa')

beforeEach(() => {
  chaveDaConversa.mockReset().mockResolvedValue('chave-de-teste')
  enviarMensagem.mockReset().mockResolvedValue(undefined)
  falarComALoja.mockReset().mockResolvedValue(undefined)
  lerConversa.mockReset().mockResolvedValue([])
})

/* A bolha fechada mora no `ConversaDaLoja`, que decide em que telas ela
   aparece e só baixa este arquivo quando alguém abre. Aqui a conversa já
   entra aberta, que é o único estado que este componente tem. */
const abrir = async (_usuario: ReturnType<typeof userEvent.setup>) => {
  render(<Conversa aoFechar={() => {}} />)
}

describe('as perguntas prontas', () => {
  it('responde na hora, sem pedir nada a ninguém', async () => {
    /* A cliente pergunta o prazo e recebe a resposta. Não cria conta, não
       digita e-mail, não espera a Vivian estar online. */
    const usuario = userEvent.setup()
    await abrir(usuario)

    await usuario.click(screen.getByRole('button', { name: /quanto tempo demora/i }))

    expect(await screen.findByText(/5 dias úteis de produção/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/seu e-mail/i)).not.toBeInTheDocument()
  })

  it('oferece outras perguntas depois de responder', async () => {
    // Conversa que termina sem botão é beco sem saída.
    const usuario = userEvent.setup()
    await abrir(usuario)

    await usuario.click(screen.getByRole('button', { name: /quanto tempo demora/i }))

    expect(screen.getByRole('button', { name: /quanto custa o frete/i })).toBeInTheDocument()
  })

  it('nunca leva a cliente para o WhatsApp', async () => {
    /* Foi o pedido dela em 24/08: a conversa acontece dentro da loja, do
       início ao fim. */
    const usuario = userEvent.setup()
    await abrir(usuario)

    expect(document.body.innerHTML).not.toMatch(/wa\.me|whatsapp/i)
  })
})

describe('quando ela quer falar com a loja', () => {
  const preencher = async (usuario: ReturnType<typeof userEvent.setup>) => {
    await usuario.click(screen.getByRole('button', { name: /falar com a loja/i }))
    await usuario.type(screen.getByLabelText(/seu nome/i), 'Ana')
    await usuario.type(screen.getByLabelText(/seu e-mail/i), 'ana@exemplo.com')
    await usuario.type(screen.getByLabelText(/sua dúvida/i), 'Chega antes do dia 20?')
  }

  it('a saída para um humano está sempre à mão', async () => {
    const usuario = userEvent.setup()
    await abrir(usuario)

    expect(screen.getByRole('button', { name: /falar com a loja/i })).toBeInTheDocument()
  })

  it('só aí pede nome e e-mail', async () => {
    const usuario = userEvent.setup()
    await abrir(usuario)

    expect(screen.queryByLabelText(/seu nome/i)).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /falar com a loja/i }))

    expect(screen.getByLabelText(/seu nome/i)).toBeInTheDocument()
  })

  it('explica por que o e-mail é pedido', async () => {
    // Pedir dado sem dizer para quê é o que faz a pessoa desistir ali.
    const usuario = userEvent.setup()
    await abrir(usuario)

    await usuario.click(screen.getByRole('button', { name: /falar com a loja/i }))

    expect(screen.getByText(/responde por e-mail/i)).toBeInTheDocument()
  })

  it('manda a dúvida e diz que recebeu', async () => {
    const usuario = userEvent.setup()
    await abrir(usuario)
    await preencher(usuario)

    await usuario.click(screen.getByRole('button', { name: /^enviar$/i }))

    await waitFor(() => expect(falarComALoja).toHaveBeenCalled())
    expect(enviarMensagem).toHaveBeenCalledWith('chave-de-teste', 'Chega antes do dia 20?')
    expect(await screen.findByText(/recebi, ana/i)).toBeInTheDocument()
  })

  it('não manda sem e-mail, e diz o que falta', async () => {
    const usuario = userEvent.setup()
    await abrir(usuario)

    await usuario.click(screen.getByRole('button', { name: /falar com a loja/i }))
    await usuario.type(screen.getByLabelText(/seu nome/i), 'Ana')
    await usuario.type(screen.getByLabelText(/sua dúvida/i), 'Chega antes do dia 20?')
    await usuario.click(screen.getByRole('button', { name: /^enviar$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail/i)
    expect(falarComALoja).not.toHaveBeenCalled()
  })

  it('avisa quando não conseguiu enviar, em vez de fingir que deu certo', async () => {
    /* Cliente que acha que mandou e não mandou espera resposta que nunca
       vem, e conclui que a loja não responde. */
    falarComALoja.mockRejectedValue(new Error('sem rede'))

    const usuario = userEvent.setup()
    await abrir(usuario)
    await preencher(usuario)

    await usuario.click(screen.getByRole('button', { name: /^enviar$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/não consegui enviar/i)
  })
})

describe('quando ela volta depois', () => {
  it('mostra a resposta que a Vivian deixou', async () => {
    /* É o que faz isto ser conversa, e não formulário: a cliente volta e
       a resposta está lá. */
    lerConversa.mockResolvedValue([
      { quem: 'cliente', texto: 'Chega antes do dia 20?', criado_em: '2026-08-25T10:00:00Z' },
      { quem: 'loja', texto: 'Chega sim, posto amanhã.', criado_em: '2026-08-25T12:00:00Z' },
    ])

    const usuario = userEvent.setup()
    await abrir(usuario)

    expect(await screen.findByText('Chega sim, posto amanhã.')).toBeInTheDocument()
  })

  it('funciona só com os botões quando o banco não responde', async () => {
    // Sem banco, a maior parte das dúvidas continua sendo resolvida.
    chaveDaConversa.mockRejectedValue(new Error('sem banco'))

    const usuario = userEvent.setup()
    await abrir(usuario)

    await usuario.click(screen.getByRole('button', { name: /quanto tempo demora/i }))

    expect(await screen.findByText(/5 dias úteis de produção/i)).toBeInTheDocument()
  })
})
