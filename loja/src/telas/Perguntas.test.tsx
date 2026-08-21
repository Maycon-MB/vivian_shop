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
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )

    expect(await screen.findByText(/1 de \d+ respondidas/)).toBeInTheDocument()
  })

  it('guarda o que ela escreveu, para não perder ao fechar a aba', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )

    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem(CHAVE) ?? '{}')
      expect(guardado.guardou).toBe('tenho os e-mails de venda')
    })
  })

  it('devolve o que ela já tinha escrito quando volta', async () => {
    window.localStorage.setItem(CHAVE, JSON.stringify({ guardou: 'resposta de ontem' }))

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
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )

    const botao = await screen.findByRole('link', { name: /Mandar pelo WhatsApp/ })
    const link = decodeURIComponent(botao.getAttribute('href') ?? '')

    expect(link).toContain('tenho os e-mails de venda')
    // O que ela não respondeu não pode entrar como pergunta vazia.
    expect(link).not.toContain('Qual endereço você quer')
    // E o texto avisa quantas ficaram para depois.
    expect(link).toMatch(/faltam \d+/)
  })

  it('avisa que a resposta escrita ainda não chegou em ninguém', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )

    // Sem servidor, resposta guardada e resposta inexistente são a mesma
    // coisa para quem espera do outro lado. Este aviso é o que separa as
    // duas — e a única defesa contra ela preencher tudo e nunca mandar.
    expect(await screen.findByText(/1 resposta que ainda não me chegou/)).toBeInTheDocument()
  })

  it('para de cobrar depois que ela usa o botão de mandar', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )
    await screen.findByText(/1 resposta que ainda não me chegou/)

    await userEvent.click(screen.getByRole('link', { name: /Mandar pelo WhatsApp/ }))

    await waitFor(() => {
      expect(screen.queryByText(/ainda não me chegou/)).not.toBeInTheDocument()
    })
  })

  it('volta a cobrar quando ela responde mais coisa depois de mandar', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/salvar alguma coisa antes do Elo7 fechar/),
      'tenho os e-mails de venda',
    )
    await userEvent.click(await screen.findByRole('link', { name: /Mandar pelo WhatsApp/ }))

    await userEvent.type(await screen.findByLabelText(/De quais produtos você já tem foto/), 'PDF')

    // O que ela escreveu depois do envio também precisa chegar.
    expect(await screen.findByText(/1 resposta que ainda não me chegou/)).toBeInTheDocument()
  })

  it('mostra o que ela já respondeu, em vez de perguntar de novo', async () => {
    render(<Perguntas />)

    expect(await screen.findByText('O que você já me contou')).toBeInTheDocument()
    expect(screen.getByText(/mínimo são 10 canecas/)).toBeInTheDocument()
    expect(screen.getByText(/CEP [dado pessoal removido]/)).toBeInTheDocument()

    // O que ela já disse não pode voltar como pergunta em branco.
    expect(screen.queryByLabelText(/prazo de 5 dias úteis vale para tudo/)).toBeNull()
    expect(screen.queryByLabelText(/declaração de conteúdo saindo junto/)).toBeNull()
  })

  it('deixa ela corrigir o que eu entendi errado', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/Tem alguma coisa errada/),
      'o prazo da caneca é 7 dias',
    )

    // A correção é a resposta mais valiosa da página: precisa chegar.
    const botao = await screen.findByRole('link', { name: /Mandar pelo WhatsApp/ })
    const link = decodeURIComponent(botao.getAttribute('href') ?? '')
    expect(link).toContain('o prazo da caneca é 7 dias')
  })

  it('não conta a correção como uma das perguntas', async () => {
    render(<Perguntas />)

    await userEvent.type(
      await screen.findByLabelText(/Tem alguma coisa errada/),
      'alguma coisa',
    )

    // Contá-la faria a barra dizer "16 de 15" e parecer defeito.
    expect(await screen.findByText(/0 de 21 respondidas/)).toBeInTheDocument()
    // Mas ela ainda precisa chegar até mim.
    expect(screen.getByText(/ainda não me chegou/)).toBeInTheDocument()
  })

  it('pergunta o que a loja ainda mostra como espaço reservado', async () => {
    render(<Perguntas />)

    // Cada uma destas corresponde a um lugar da loja que hoje exibe texto
    // provisório. Sem a resposta, o espaço reservado vai ao ar.
    expect(await screen.findByLabelText(/Como você começou a fazer isso/)).toBeInTheDocument()
    expect(screen.getByLabelText(/De quais produtos você já tem foto/)).toBeInTheDocument()

    // O que ela respondeu em 16/08 não pode voltar como pergunta em branco.
    expect(screen.queryByLabelText(/Qual é o seu Instagram/)).toBeNull()
    expect(screen.queryByLabelText(/arquivos das suas logos/)).toBeNull()
    expect(screen.queryByLabelText(/é PDF para imprimir em casa/)).toBeNull()
  })

  it('pergunta o peso e as medidas, que o frete precisa', async () => {
    render(<Perguntas />)

    // Nunca foi perguntado, e sem isso o frete sai errado — a diferença
    // sai do bolso dela em cada pedido.
    expect(await screen.findByLabelText(/Quanto pesa e qual o tamanho/)).toBeInTheDocument()
  })

  it('explica por que cada pergunta está sendo feita', async () => {
    render(<Perguntas />)

    // Pergunta sem motivo parece burocracia; com motivo, ela responde melhor.
    expect(
      await screen.findByText(/a plataforma saiu do ar de vez/),
    ).toBeInTheDocument()
  })

  it('não pede chave nem senha do Pix', async () => {
    render(<Perguntas />)

    // Pedir credencial por formulário é o começo de um vazamento. O texto
    // diz explicitamente para ela não mandar.
    expect(await screen.findByText(/Não me mande a chave nem a senha/)).toBeInTheDocument()
  })

  it('pergunta se a cliente sai da loja para pagar', async () => {
    render(<Perguntas />)

    // Decide o desenho inteiro do pagamento, e é escolha dela: sair leva a
    // tela conhecida do Mercado Pago, ficar mantém a loja com a cara dela.
    expect(await screen.findByLabelText(/sair da sua loja para pagar/i)).toBeInTheDocument()
  })

  it('pergunta até quantas vezes ela quer parcelar', async () => {
    render(<Perguntas />)

    // Parcelamento vende mais e custa mais. Quem decide quanto da margem
    // dela vai embora nisso é ela.
    expect(await screen.findByLabelText(/cart[ãa]o parcelado/i)).toBeInTheDocument()
  })

  it('pergunta se o desconto do Pix continua em 5%', async () => {
    render(<Perguntas />)

    // Se o Pix for mesmo 0% para ela, 5% de desconto custa mais caro que a
    // taxa do cartão. A loja está configurada com 5% até ela decidir.
    expect(await screen.findByLabelText(/desconto.*Pix/i)).toBeInTheDocument()
  })

  it('explica que a conta do banco não recebe as vendas', async () => {
    render(<Perguntas />)

    // No Elo7 bastava informar a conta porque quem recebia era o Elo7. Aqui
    // quem recebe é ela, e o banco só recebe o saque. Sem isso explicado,
    // ela responde a pergunta errada.
    expect(await screen.findByText(/quem recebia o dinheiro era o Elo7/i)).toBeInTheDocument()
  })
})
