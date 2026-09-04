import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * A aba de Configurações.
 *
 * Até 04/09 esta tela era uma maquete: os campos tinham `defaultValue`, o
 * botão "Salvar alterações" era um `<button type="button">` sem `onClick`,
 * e nada disso tocava o banco. Ela digitava, clicava, e o próximo
 * carregamento devolvia tudo como antes, sem uma linha dizendo que não
 * salvou.
 *
 * O pior campo era o CEP de envio, embaixo de um subtítulo que dizia
 * "usado para calcular o frete de quem compra". Ela ia sair da tela
 * acreditando que tinha configurado o frete da loja.
 *
 * Estes testes descrevem o que acontece com ela, e não como o componente
 * está escrito por dentro.
 */

const configuracoesDaLoja = vi.fn()
const salvarConfiguracoesDaLoja = vi.fn()

vi.mock('@/dados/configuracoesNoBanco', () => ({
  configuracoesDaLoja: () => configuracoesDaLoja(),
  salvarConfiguracoesDaLoja: (...args: unknown[]) => salvarConfiguracoesDaLoja(...args),
}))

/* O cartão "Sua senha" mora dentro desta aba e fala com o Supabase assim
   que monta. Sem isto, todo teste daqui falharia por causa do vizinho. */
vi.mock('@/servicos/autenticacao', () => ({
  donaDaVez: async () => ({ id: '1', nome: 'Vivian', email: 'ela@exemplo.com' }),
  entrar: async () => null,
  trocarSenha: async () => null,
  temBanco: () => true,
}))

const { default: AbaConfiguracoes } = await import('./AbaConfiguracoes')

const SALVAS = {
  nome_da_loja: 'Feito para você! Personalizados',
  frase_da_loja: 'Papelaria personalizada para quem ensina.',
  email_de_contato: 'contato@exemplo.com',
  cep_de_origem: '21000-000',
  cidade_de_origem: 'Rio de Janeiro',
  endereco_de_origem: 'Rua das Flores, 10',
  minimo_padrao: 10,
  prazo_padrao: 5,
}

beforeEach(() => {
  configuracoesDaLoja.mockReset().mockResolvedValue(SALVAS)
  salvarConfiguracoesDaLoja.mockReset().mockResolvedValue(undefined)
})

const botaoSalvar = () => screen.getByRole('button', { name: /salvar altera/i })

/* Pelo papel, e não por `getByLabelText`: o "i" que explica o campo é um
   `<button>` dentro do mesmo rótulo, e um rótulo que casa com dois
   elementos faz a busca reclamar em vez de achar o campo. */
const campo = (nome: RegExp) => screen.getByRole('textbox', { name: nome })
const acharCampo = (nome: RegExp) => screen.findByRole('textbox', { name: nome })

describe('as configurações que ela mesma muda', () => {
  it('abre mostrando o que já estava salvo, e não um exemplo qualquer', async () => {
    render(<AbaConfiguracoes />)

    expect(await acharCampo(/nome que aparece no site/i)).toHaveValue(
      'Feito para você! Personalizados',
    )
    expect(campo(/e-mail de contato/i)).toHaveValue('contato@exemplo.com')
    expect(campo(/cep/i)).toHaveValue('21000-000')
    expect(campo(/cidade/i)).toHaveValue('Rio de Janeiro')
    expect(campo(/endereço completo/i)).toHaveValue('Rua das Flores, 10')
    expect(campo(/mínimo de unidades/i)).toHaveValue('10')
    expect(campo(/prazo de produção/i)).toHaveValue('5')
  })

  it('leva ao banco o que ela digitou, e não o que estava na tela antes', async () => {
    const usuario = userEvent.setup()
    render(<AbaConfiguracoes />)

    const cep = await acharCampo(/cep/i)
    await usuario.clear(cep)
    await usuario.type(cep, '22000-111')

    const cidade = campo(/cidade/i)
    await usuario.clear(cidade)
    await usuario.type(cidade, 'Niterói')

    const minimo = campo(/mínimo de unidades/i)
    await usuario.clear(minimo)
    await usuario.type(minimo, '20')

    await usuario.click(botaoSalvar())

    await waitFor(() => expect(salvarConfiguracoesDaLoja).toHaveBeenCalledTimes(1))
    expect(salvarConfiguracoesDaLoja).toHaveBeenCalledWith(
      expect.objectContaining({
        cep_de_origem: '22000-111',
        cidade_de_origem: 'Niterói',
        // Número, e não o texto do campo: a coluna é inteira.
        minimo_padrao: 20,
      }),
    )
  })

  it('diz que salvou, em vez de deixar ela adivinhar', async () => {
    const usuario = userEvent.setup()
    render(<AbaConfiguracoes />)

    await usuario.click(await screen.findByRole('button', { name: /salvar altera/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/salv/i)
  })

  it('avisa quando não conseguiu salvar, para ela não sair achando que salvou', async () => {
    /* É o defeito que esta tela tinha em forma pior: silêncio depois do
       clique. Se o banco recusar, ela precisa ver, senão vai embora
       confiando numa configuração que não existe. */
    salvarConfiguracoesDaLoja.mockRejectedValue(new Error('row-level security'))

    const usuario = userEvent.setup()
    render(<AbaConfiguracoes />)

    await usuario.click(await screen.findByRole('button', { name: /salvar altera/i }))

    const aviso = await screen.findByRole('alert')
    expect(aviso).toHaveTextContent(/não/i)
    expect(screen.queryByRole('status')).toBeNull()
    // E sem despejar o inglês do Postgres na cara dela.
    expect(aviso).not.toHaveTextContent(/row-level|security/i)
  })

  it('não pede WhatsApp, porque a conversa acontece dentro da loja', async () => {
    /* A migração 0008 decidiu que a cliente fala com ela pelo site, e a
       loja inteira foi desenhada sem WhatsApp. Um campo aqui prometia um
       canal que nenhuma parte do sistema usa. */
    render(<AbaConfiguracoes />)

    await acharCampo(/nome que aparece no site/i)
    expect(screen.queryByRole('textbox', { name: /whatsapp/i })).toBeNull()
    expect(screen.queryByText(/whatsapp/i)).toBeNull()
  })

  it('o botão de salvar faz alguma coisa, e não fica parado', async () => {
    /* Ele era um `<button type="button">` sem `onClick`. Clicar não
       chamava nada, e nada na tela mudava. */
    let liberar: () => void = () => {}
    salvarConfiguracoesDaLoja.mockImplementation(
      () => new Promise<void>((ok) => { liberar = () => ok() }),
    )

    const usuario = userEvent.setup()
    render(<AbaConfiguracoes />)

    const botao = await screen.findByRole('button', { name: /salvar altera/i })
    await usuario.click(botao)

    expect(salvarConfiguracoesDaLoja).toHaveBeenCalledTimes(1)
    // E enquanto vai, ela vê que está indo, e não consegue mandar duas vezes.
    await waitFor(() => expect(botao).toBeDisabled())

    liberar()
    await waitFor(() => expect(botao).toBeEnabled())
  })

  it('não some com o que já funcionava nesta aba', async () => {
    /* O cartão dos avisos por e-mail acabou de ser corrigido, e a troca de
       senha é o caminho dela quando desconfia que alguém viu a dela. */
    render(<AbaConfiguracoes />)

    expect(await screen.findByText(/quando eu te aviso/i)).toBeInTheDocument()
    expect(screen.getByText(/venda paga/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trocar a senha/i })).toBeInTheDocument()
  })
})

describe('o que a tela promete que muda de verdade', () => {
  it('avisa que o nome e a frase não trocam o site na hora', async () => {
    /* Os dois são resolvidos quando o site é montado, em `layout.tsx`.
       Salvar aqui guarda a escolha dela; o que quem compra lê continua
       sendo o do último build. Sem esta linha, a tela troca um engano por
       outro. */
    render(<AbaConfiguracoes />)

    expect(await screen.findByText(/não muda o site na hora/i)).toBeInTheDocument()
  })

  it('não promete que o CEP daqui já calcula o frete de quem compra', async () => {
    /* O cálculo do frete sai da função `cotar-frete`, que lê o CEP de uma
       variável de ambiente dela, e não desta tabela. Enquanto for assim,
       dizer "usado para calcular o frete" é a mentira mais cara desta
       tela: ela sai daqui achando que configurou o frete da loja. */
    render(<AbaConfiguracoes />)

    await acharCampo(/cep/i)
    expect(screen.queryByText(/usado para calcular o frete/i)).toBeNull()
  })
})
