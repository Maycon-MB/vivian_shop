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
const enviarFoto = vi.fn()
const buscarParaEditar = vi.fn()
const listarTemas = vi.fn()
const medidasJaCadastradas = vi.fn()

vi.mock('@/dados/fotosDaDona', () => ({
  enviarFoto: (...args: unknown[]) => enviarFoto(...args),
}))

vi.mock('@/dados/produtosDaDona', () => ({
  salvarProduto: (...args: unknown[]) => salvarProduto(...args),
  buscarParaEditar: (...args: unknown[]) => buscarParaEditar(...args),
  listarTemas: (...args: unknown[]) => listarTemas(...args),
  medidasJaCadastradas: () => medidasJaCadastradas(),
}))

const { default: FormularioDeProduto } = await import('./FormularioDeProduto')

beforeEach(() => {
  salvarProduto.mockReset().mockResolvedValue('id-novo')
  buscarParaEditar.mockReset()
  listarTemas.mockReset().mockResolvedValue([{ id: 'tema-1', nome: 'Peppa Pig' }])
  /* Catálogo vazio por padrão: cada teste que quiser a sugestão de
     medidas monta a própria lista. */
  medidasJaCadastradas.mockReset().mockResolvedValue([])
  enviarFoto.mockReset().mockResolvedValue({
    cheia: 'https://balde/lousa/0-cheia.webp',
    mini: 'https://balde/lousa/0-mini.webp',
  })
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

describe('a foto do produto', () => {
  const foto = () =>
    new File([new Uint8Array([1, 2, 3])], 'lousa.jpg', { type: 'image/jpeg' })

  it('sobe na hora de escolher, e não junto com o resto', async () => {
    /* Se esperasse o "salvar", ela ficaria olhando a tela parada sem
       saber se a foto foi, e um erro de rede levaria junto tudo o que ela
       já tinha digitado. */
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.upload(screen.getByLabelText(/escolher a foto/i), foto())

    await waitFor(() => expect(enviarFoto).toHaveBeenCalled())
    expect(enviarFoto.mock.calls[0][1]).toBe('lousa-magica')
    expect(salvarProduto).not.toHaveBeenCalled()
  })

  it('guarda os dois endereços no produto', async () => {
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.type(screen.getByLabelText(/preço de cada peça/i), '13,70')
    await usuario.upload(screen.getByLabelText(/escolher a foto/i), foto())
    await waitFor(() => expect(enviarFoto).toHaveBeenCalled())

    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    expect(salvarProduto.mock.calls[0][0]).toMatchObject({
      imagem: 'https://balde/lousa/0-cheia.webp',
      imagem_mini: 'https://balde/lousa/0-mini.webp',
    })
  })

  it('cobra o nome antes da foto, e diz por quê', async () => {
    /* O nome vira o endereço do produto, que é a pasta onde a foto mora.
       Sem ele, o arquivo não teria onde ficar. */
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.upload(screen.getByLabelText(/escolher a foto/i), foto())

    expect(await screen.findByRole('alert')).toHaveTextContent(/nome ao produto antes/i)
    expect(enviarFoto).not.toHaveBeenCalled()
  })

  it('diz o que houve quando a foto não sobe', async () => {
    // O recado da regra chega inteiro: "Isso não é uma foto" ajuda; "erro
    // 400" não.
    enviarFoto.mockRejectedValue(new Error('Isso não é uma foto. Mande uma imagem do produto.'))

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.upload(screen.getByLabelText(/escolher a foto/i), foto())

    expect(await screen.findByRole('alert')).toHaveTextContent(/não é uma foto/i)
  })
})

describe('as outras fotos do produto', () => {
  const foto = () =>
    new File([new Uint8Array([1, 2, 3])], 'lado.jpg', { type: 'image/jpeg' })

  it('a segunda foto não sobrescreve a capa', async () => {
    /* A ordem é o nome do arquivo no balde. Sem ela, a foto do ângulo
       ficaria por cima da capa e ela veria a mesma imagem duas vezes. */
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.upload(screen.getByLabelText(/adicionar outra foto/i), foto())

    await waitFor(() => expect(enviarFoto).toHaveBeenCalled())
    expect(enviarFoto.mock.calls[0][2]).toBe(1)
  })

  it('guarda as outras fotos separadas da capa', async () => {
    enviarFoto
      .mockResolvedValueOnce({ cheia: 'capa-cheia', mini: 'capa-mini' })
      .mockResolvedValueOnce({ cheia: 'lado-cheia', mini: 'lado-mini' })

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.type(screen.getByLabelText(/preço de cada peça/i), '13,70')

    await usuario.upload(screen.getByLabelText(/escolher a foto/i), foto())
    await waitFor(() => expect(enviarFoto).toHaveBeenCalledTimes(1))

    await usuario.upload(screen.getByLabelText(/adicionar outra foto/i), foto())
    await waitFor(() => expect(enviarFoto).toHaveBeenCalledTimes(2))

    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    expect(salvarProduto.mock.calls[0][0]).toMatchObject({
      imagem: 'capa-cheia',
      galeria: ['lado-cheia'],
    })
  })

  it('tirar uma foto não apaga o arquivo, só some da loja', async () => {
    /* Um toque errado no celular dela não pode custar a foto: o arquivo
       fica no balde, e volta se for preciso. */
    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica')
    await usuario.type(screen.getByLabelText(/preço de cada peça/i), '13,70')
    await usuario.upload(screen.getByLabelText(/adicionar outra foto/i), foto())
    await waitFor(() => expect(enviarFoto).toHaveBeenCalled())

    await usuario.click(screen.getByRole('button', { name: /tirar esta foto/i }))
    await usuario.click(screen.getByRole('button', { name: /salvar produto/i }))

    await waitFor(() => expect(salvarProduto).toHaveBeenCalled())
    expect(salvarProduto.mock.calls[0][0].galeria).toEqual([])
  })
})

describe('a caixa que ela não sabe de cabeça', () => {
  /* O formulário pede peso e medidas da caixa fechada, e o banco recusa
     publicar produto personalizado sem isso. É a mesma pergunta que a
     gente decidiu não fazer a ela quando discutiu frete, em 27/08: "ela
     também não sabe de cabeça".

     Sem esta ajuda, o primeiro produto que ela cadastrar sozinha leva uma
     recusa que ela não sabe resolver, e a impressão que fica é de que o
     painel não funciona. */

  const LOUSAS = [
    { nome: 'Lousa Mágica - Peppa Pig', peso_g: 100, alt_cm: 1.5, larg_cm: 19, comp_cm: 30 },
    { nome: 'Lousa Mágica - Chaves', peso_g: 100, alt_cm: 1.5, larg_cm: 19, comp_cm: 30 },
  ]

  it('preenche a caixa a partir dos produtos do mesmo tipo', async () => {
    medidasJaCadastradas.mockResolvedValue(LOUSAS)

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica - Homem Aranha')
    await usuario.tab()

    await waitFor(() => expect(screen.getByLabelText(/peso/i)).toHaveValue('100'))
    expect(screen.getByLabelText(/altura/i)).toHaveValue('1.5')
  })

  it('diz de onde tirou os números', async () => {
    /* Preencher em silêncio é pior que não preencher: ela não saberia se
       pode confiar num campo que ela mesma não sabe responder. */
    medidasJaCadastradas.mockResolvedValue(LOUSAS)

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica - Homem Aranha')
    await usuario.tab()

    /* O recado inteiro, e não só o nome do tipo: "Lousa Mágica" aparece
       em mais de um lugar da tela, inclusive na ajuda do campo de nome. */
    const recado = await screen.findByText(/é só corrigir/i)

    expect(recado).toHaveTextContent('Lousa Mágica')
    expect(recado).toHaveTextContent(/Peguei de outros 2/)
  })

  it('não mexe no que ela já digitou', async () => {
    medidasJaCadastradas.mockResolvedValue(LOUSAS)

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/peso/i), '250')
    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Lousa Mágica - Homem Aranha')
    await usuario.tab()

    expect(screen.getByLabelText(/peso/i)).toHaveValue('250')
  })

  it('fica quieto quando o produto é novo de verdade', async () => {
    // Sugerir o peso de outra coisa sai do bolso dela em toda venda.
    medidasJaCadastradas.mockResolvedValue(LOUSAS)

    const usuario = userEvent.setup()
    render(<FormularioDeProduto aoSair={() => {}} aoSalvar={() => {}} />)

    await usuario.type(screen.getByLabelText(/nome do produto/i), 'Camiseta Estampada')
    await usuario.tab()

    expect(screen.getByLabelText(/peso/i)).toHaveValue('')
    expect(screen.queryByText(/é só corrigir/i)).not.toBeInTheDocument()
  })
})
