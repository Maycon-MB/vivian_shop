import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * A tela de cadastrar e editar produto.
 *
 * Ela pediu isso em 24/08: "como faço para editar produtos, incluir um
 * produto, modificar preços". Estes testes descrevem o que acontece com
 * ela na tela, e não como o componente está escrito por dentro.
 */

const salvarProduto = vi.fn()
const buscarParaEditar = vi.fn()
const listarTemas = vi.fn()

vi.mock('@/dados/produtosDaDona', () => ({
  salvarProduto: (...args: unknown[]) => salvarProduto(...args),
  buscarParaEditar: (...args: unknown[]) => buscarParaEditar(...args),
  listarTemas: (...args: unknown[]) => listarTemas(...args),
}))

const { default: FormularioDeProduto } = await import('./FormularioDeProduto')

beforeEach(() => {
  salvarProduto.mockReset().mockResolvedValue('id-novo')
  buscarParaEditar.mockReset()
  listarTemas.mockReset().mockResolvedValue([{ id: 'tema-1', nome: 'Peppa Pig' }])
})

const preencher = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica - Peppa Pig')
  await usuario.type(screen.getByLabelText(/preço de cada peça/i), '13,70')
}

describe('cadastrar um produto', () => {
  it('grava o preço que ela digitou com vírgula', async () => {
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    expect(salvarProduto.mock.calls[0][0]).toMatchObject({
      nome: 'Lousa Mágica - Peppa Pig',
      preco_reais: 13.7,
      slug: 'lousa-magica-peppa-pig',
    })
  })

  it('nasce fora do ar, para ela conferir antes', async () => {
    /* Produto que se publica sozinho ao salvar aparece na loja com preço
       pela metade enquanto ela ainda está digitando. */
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    expect(salvarProduto.mock.calls[0][0].ativo).toBe(false)
  })

  it('salva rascunho sem peso nem medidas', async () => {
    // Ela cadastra entre uma encomenda e outra; o peso da caixa ela só
    // sabe depois de embalar.
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
  })

  it('não salva sem preço, e diz o que falta', async () => {
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/preço/i)
    expect(salvarProduto).not.toHaveBeenCalled()
  })

  it('avisa antes de publicar sem as medidas da caixa', async () => {
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await preencher(usuario)
    await usuario.click(screen.getByLabelText(/deixar no ar/i))
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    const aviso = await screen.findByRole('alert')
    // O motivo junto da regra: sem ele, ela lê como burocracia.
    expect(aviso).toHaveTextContent(/do seu bolso/i)
    expect(salvarProduto).not.toHaveBeenCalled()
  })

  it('esconde peso e caixa quando o produto é digital', async () => {
    // Material digital não vai pelos Correios.
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    expect(screen.getByLabelText(/peso/i)).toBeInTheDocument()

    await usuario.selectOptions(screen.getByLabelText(/^tipo$/i), 'pedagogica')

    expect(screen.queryByLabelText(/peso/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/pasta do drive/i)).toBeInTheDocument()
  })
})

describe('editar um produto que já existe', () => {
  const existente = {
    id: 'p-1',
    slug: 'lousa-magica-peppa-pig',
    nome: 'Lousa Mágica - Peppa Pig',
    descricao: 'Com caneta.',
    preco_reais: '13.70',
    preco_promocional_reais: null,
    linha: 'personalizada',
    tema_id: 'tema-1',
    minimo: 10,
    prazo_producao: 5,
    peso_g: 900,
    alt_cm: '5.00',
    larg_cm: '22.00',
    comp_cm: '30.00',
    pasta_drive: null,
    ativo: true,
  }

  it('abre com o que já está gravado', async () => {
    buscarParaEditar.mockResolvedValue(existente)
    render(<FormularioDeProduto id="p-1" aoSair={() => {}} aoSalvar={() => {}} />)

    expect(await screen.findByDisplayValue('Lousa Mágica - Peppa Pig')).toBeInTheDocument()
    expect(screen.getByLabelText(/preço de cada peça/i)).toHaveValue('13.70')
  })

  it('nunca mostra a palavra null num campo vazio', async () => {
    buscarParaEditar.mockResolvedValue(existente)
    render(<FormularioDeProduto id="p-1" aoSair={() => {}} aoSalvar={() => {}} />)

    await screen.findByDisplayValue('Lousa Mágica - Peppa Pig')
    expect(screen.getByLabelText(/preço promocional/i)).toHaveValue('')
  })

  it('muda o preço sem mudar o endereço do produto', async () => {
    /* O endereço é o link que a cliente salvou e a página que o Google já
       indexou. Trocar o preço não pode quebrar os dois. */
    buscarParaEditar.mockResolvedValue({ ...existente, nome: 'Lousa Mágica - Peppa Pigg' })

    const usuario = userEvent.setup()
    render(<FormularioDeProduto id="p-1" aoSair={() => {}} aoSalvar={() => {}} />)

    const preco = await screen.findByLabelText(/preço de cada peça/i)
    await usuario.clear(preco)
    await usuario.type(preco, '15,90')
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    const [linha, id] = salvarProduto.mock.calls[0]
    expect(linha.preco_reais).toBe(15.9)
    expect(linha.slug).toBe('lousa-magica-peppa-pig')
    expect(id).toBe('p-1')
  })

  it('explica o erro do banco na língua dela', async () => {
    buscarParaEditar.mockResolvedValue(existente)
    salvarProduto.mockRejectedValue(
      new Error('duplicate key value violates unique constraint "produtos_slug_key"'),
    )

    const usuario = userEvent.setup()
    render(<FormularioDeProduto id="p-1" aoSair={() => {}} aoSalvar={() => {}} />)

    await screen.findByDisplayValue('Lousa Mágica - Peppa Pig')
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/já existe um produto com esse nome/i)
  })
})
