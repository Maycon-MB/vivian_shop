import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Checkout from './Checkout'
import { ProvedorCarrinho } from './CarrinhoContexto'
import { navegacaoFalsa } from '../../vitest.setup'

/**
 * O checkout é a tela onde o erro custa dinheiro.
 *
 * Os testes de domínio provam que a conta está certa; o teste de navegador
 * prova que a compra inteira funciona. Falta o meio, que é isto: apertar
 * botão nesta tela sozinha, rápido o bastante para rodar a cada save.
 *
 * O que se cobre aqui é o que já quebrou de verdade neste projeto — total
 * como "R$ NaN", desconto do Pix incidindo sobre o frete, botão que deixa
 * pagar sem dados — mais os caminhos de erro, que ninguém percorre à mão
 * porque dão trabalho de reproduzir.
 */

const CHAVE_CARRINHO = 'feito-para-voce:carrinho'

const CADERNO = {
  id: 1,
  slug: 'caderno-personalizado',
  name: 'Caderno personalizado',
  category: 'Papelaria personalizada',
  price: 32,
  quantidade: 10,
}

const APOSTILA = {
  id: 5,
  slug: 'apostila',
  name: 'Apostila de alfabetização adaptada',
  category: 'Papelaria pedagógica',
  price: 47,
  quantidade: 1,
}

const comCarrinho = (itens: unknown[]) => {
  window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens))
}

const abrir = () =>
  render(
    <ProvedorCarrinho>
      <Checkout />
    </ProvedorCarrinho>,
  )

/** O resumo do pedido, para não confundir "Frete" do resumo com o do formulário. */
const resumo = () => within(screen.getByRole('complementary'))

beforeEach(() => {
  navegacaoFalsa.push.mockClear()
})

describe('checkout com carrinho vazio', () => {
  it('manda a pessoa de volta para a loja em vez de mostrar formulário', async () => {
    comCarrinho([])
    abrir()

    expect(await screen.findByText(/carrinho está vazio/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Nome completo/i)).not.toBeInTheDocument()
  })
})

describe('checkout de produto físico', () => {
  it('mostra o total dos produtos sem nunca escrever NaN', async () => {
    comCarrinho([CADERNO])
    abrir()

    // Este teste existe por causa de um erro real: o domínio usava `preco`
    // e a tela usava `price`, e o total saiu como "R$ NaN" no ar.
    //
    // O valor aparece duas vezes de propósito — na linha do item e na
    // soma dos produtos — então a conferência é sobre as duas.
    expect(await resumo().findAllByText('R$ 320,00')).toHaveLength(2)
    // 320 menos os 5% do Pix, ainda sem frete escolhido.
    expect(resumo().getByText('R$ 304,00')).toBeInTheDocument()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })

  it('aplica o desconto do Pix só sobre os produtos', async () => {
    comCarrinho([CADERNO])
    abrir()

    // 5% de 320 são 16,00. Se um dia alguém aplicar o desconto sobre o
    // frete também, este número muda e o teste reprova — que é o ponto:
    // desconto sobre frete sai do bolso da Vivian.
    expect(await resumo().findByText('− R$ 16,00')).toBeInTheDocument()
  })

  it('não deixa pagar sem os dados, e diz o que falta em cada campo', async () => {
    comCarrinho([CADERNO])
    abrir()

    await userEvent.click(await screen.findByRole('button', { name: /^Pagar$/ }))

    expect(await screen.findByText(/nome e sobrenome/i)).toBeInTheDocument()
    expect(screen.getByText(/Confira o e-mail/i)).toBeInTheDocument()
    expect(screen.getByText(/WhatsApp com DDD/i)).toBeInTheDocument()
    expect(screen.getByText(/CEP tem 8 números/i)).toBeInTheDocument()

    // Nada foi cobrado nem navegou: o erro parou a compra de verdade.
    expect(navegacaoFalsa.push).not.toHaveBeenCalled()
  })

  it('apaga o erro do campo assim que a pessoa começa a corrigir', async () => {
    comCarrinho([CADERNO])
    abrir()

    await userEvent.click(await screen.findByRole('button', { name: /^Pagar$/ }))
    expect(await screen.findByText(/nome e sobrenome/i)).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'Ana')

    // Erro que fica na tela enquanto a pessoa digita faz ela achar que
    // ainda está errado depois de já ter corrigido.
    await waitFor(() => {
      expect(screen.queryByText(/nome e sobrenome/i)).not.toBeInTheDocument()
    })
  })

  it('cota o frete sozinho quando o CEP fica completo', async () => {
    comCarrinho([CADERNO])
    abrir()

    await userEvent.type(await screen.findByLabelText('CEP'), '01310100')

    expect(await screen.findByText(/Correios PAC/, {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByText(/Correios SEDEX/)).toBeInTheDocument()
    expect(screen.getByText(/Jadlog/)).toBeInTheDocument()
  })

  it('já deixa marcada a opção mais barata', async () => {
    comCarrinho([CADERNO])
    abrir()

    await userEvent.type(await screen.findByLabelText('CEP'), '01310100')
    await screen.findByText(/Correios PAC/, {}, { timeout: 5000 })

    // Sem nada marcado, o botão de pagar trava e a pessoa não descobre por quê.
    const escolhidos = document.querySelectorAll<HTMLInputElement>(
      'input[name="frete"]:checked',
    )
    expect(escolhidos).toHaveLength(1)
  })

  it('esquece o frete cotado quando o CEP muda', async () => {
    comCarrinho([CADERNO])
    abrir()

    const cep = await screen.findByLabelText('CEP')
    await userEvent.type(cep, '01310100')
    await screen.findByText(/Correios PAC/, {}, { timeout: 5000 })

    await userEvent.type(cep, '9')

    // Preço de frete que sobrevive à troca do CEP é o erro que só aparece
    // depois de a pessoa já ter pago pelo valor errado.
    await waitFor(() => {
      expect(screen.queryByText(/Correios PAC/)).not.toBeInTheDocument()
    })
  })

  it('conclui a compra e leva para a confirmação com o número do pedido', async () => {
    comCarrinho([CADERNO])
    abrir()

    await userEvent.type(await screen.findByLabelText(/Nome completo/i), 'Ana Paula Souza')
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'ana@exemplo.com.br')
    await userEvent.type(screen.getByLabelText(/WhatsApp/i), '21988887777')
    await userEvent.type(screen.getByLabelText('CEP'), '01310100')

    await screen.findByText(/Correios PAC/, {}, { timeout: 5000 })
    await userEvent.type(screen.getByLabelText('Rua'), 'Avenida Paulista')
    await userEvent.type(screen.getByLabelText('Número'), '1000')
    /* Bairro, cidade e estado entraram na tela em 25/08. Faltavam, e
       ficavam vazios sem ninguém perceber: o pedido era guardado no
       navegador, que aceita qualquer coisa. Os Correios não. */
    await userEvent.type(screen.getByLabelText('Bairro'), 'Bela Vista')
    await userEvent.type(screen.getByLabelText('Cidade'), 'São Paulo')
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'SP')

    await userEvent.click(screen.getByRole('button', { name: /^Pagar$/ }))

    await waitFor(
      () => expect(navegacaoFalsa.push).toHaveBeenCalledWith(
        expect.stringContaining('/pedido-confirmado/?pedido='),
      ),
      { timeout: 8000 },
    )
  })

  it('mostra a recusa com o motivo e a saída, sem sair da tela', async () => {
    // O e-mail com "recusa" faz o pagamento simulado negar de propósito.
    comCarrinho([CADERNO])
    abrir()

    await userEvent.type(await screen.findByLabelText(/Nome completo/i), 'Ana Paula Souza')
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'recusa@exemplo.com.br')
    await userEvent.type(screen.getByLabelText(/WhatsApp/i), '21988887777')
    await userEvent.type(screen.getByLabelText('CEP'), '01310100')

    await screen.findByText(/Correios PAC/, {}, { timeout: 5000 })
    await userEvent.type(screen.getByLabelText('Rua'), 'Avenida Paulista')
    await userEvent.type(screen.getByLabelText('Número'), '1000')
    /* Bairro, cidade e estado entraram na tela em 25/08. Faltavam, e
       ficavam vazios sem ninguém perceber: o pedido era guardado no
       navegador, que aceita qualquer coisa. Os Correios não. */
    await userEvent.type(screen.getByLabelText('Bairro'), 'Bela Vista')
    await userEvent.type(screen.getByLabelText('Cidade'), 'São Paulo')
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'SP')

    await userEvent.click(screen.getByRole('button', { name: /^Pagar$/ }))

    const aviso = await screen.findByRole('alert', {}, { timeout: 8000 })
    expect(aviso).toHaveTextContent(/não foi concluído/i)
    // Recusa sem caminho é beco sem saída: tem que oferecer o que fazer.
    expect(aviso).toHaveTextContent(/pix|cartão|whatsapp/i)

    expect(navegacaoFalsa.push).not.toHaveBeenCalled()
  })

  it('avisa que nada é cobrado enquanto a loja for demonstração', async () => {
    comCarrinho([CADERNO])
    abrir()

    expect(await screen.findByText(/nenhuma cobrança é feita/i)).toBeInTheDocument()
  })
})

describe('checkout de material digital', () => {
  it('não pede endereço nem frete para entregar um arquivo', async () => {
    comCarrinho([APOSTILA])
    abrir()

    expect(await screen.findByLabelText(/Nome completo/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument()
    expect(resumo().getByText('não tem')).toBeInTheDocument()
  })

  it('pede um e-mail do Gmail, e explica por quê', async () => {
    comCarrinho([APOSTILA])
    abrir()

    /* O material fica no Drive da Vivian e o que se entrega é acesso. Com
       endereço do Google sai na hora; com outro provedor a compradora cai
       em "solicitar acesso" e volta a depender de a Vivian liberar na mão.
       O pedido precisa aparecer antes do pagamento — depois já não dá para
       trocar o e-mail. */
    expect(await screen.findByText(/use um e-mail do Gmail/i)).toBeInTheDocument()
    expect(screen.getByText(/acesso é liberado na hora/i)).toBeInTheDocument()
  })

  it('deixa concluir sem endereço', async () => {
    comCarrinho([APOSTILA])
    abrir()

    await userEvent.type(await screen.findByLabelText(/Nome completo/i), 'Ana Paula Souza')
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'ana@exemplo.com.br')
    await userEvent.type(screen.getByLabelText(/WhatsApp/i), '21988887777')

    await userEvent.click(screen.getByRole('button', { name: /^Pagar$/ }))

    await waitFor(
      () => expect(navegacaoFalsa.push).toHaveBeenCalled(),
      { timeout: 8000 },
    )
  })
})

describe('pagamento no cartão', () => {
  it('mostra os campos do cartão só quando o cartão é escolhido', async () => {
    comCarrinho([CADERNO])
    abrir()

    expect(screen.queryByLabelText(/Número do cartão/i)).not.toBeInTheDocument()

    await userEvent.click(await screen.findByText('Cartão de crédito'))

    expect(await screen.findByLabelText(/Número do cartão/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Validade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código de segurança/i)).toBeInTheDocument()
  })

  it('tira o desconto do Pix quando muda para cartão', async () => {
    comCarrinho([CADERNO])
    abrir()

    expect(await resumo().findByText('− R$ 16,00')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cartão de crédito'))

    await waitFor(() => {
      expect(resumo().queryByText('− R$ 16,00')).not.toBeInTheDocument()
    })
  })
})

vi.setConfig({ testTimeout: 20000 })
