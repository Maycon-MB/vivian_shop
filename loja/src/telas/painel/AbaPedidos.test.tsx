import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * Os pedidos de exemplo somem quando a loja passa a vender de verdade.
 *
 * Até 12/09 esta tela somava os sete pedidos fictícios de `dadosPedidos`
 * a tudo que viesse do banco, sem olhar se a loja estava no ar. A conta
 * do filtro, a fila de produção e o relatório saíam todos inflados.
 *
 * O estrago não é estético. Ela abre o painel no dia da primeira venda,
 * vê oito pedidos, e ou acredita (e vai produzir encomenda de gente que
 * não existe) ou desconfia da tela inteira, inclusive da venda que é
 * dela. As duas saídas são ruins, e a segunda é pior: painel em que não
 * se confia não se usa.
 *
 * O que decide é o mesmo `temBanco()` que já governa Mensagens e
 * Produtos. Com banco ligado, exemplo nenhum aparece.
 */

const temBanco = vi.fn()

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => temBanco(),
}))

/* A tela lê o repositório de pedidos assim que monta. Sem isto, cada
   teste daqui dependeria da rede. */
const carregarPedidosDaLoja = vi.fn()

vi.mock('./pedidosDaLoja', () => ({
  carregarPedidosDaLoja: () => carregarPedidosDaLoja(),
}))

const { default: AbaPedidos } = await import('./AbaPedidos')

const PEDIDO_DE_VERDADE = {
  id: '0012',
  estado: 'producao',
  linha: 'personalizada',
  cliente: 'Marina Alves',
  /* `comprador_whatsapp` é `not null` desde a migração 0002, e o checkout
     reprova sem DDD: pedido do banco sempre traz este campo. */
  whatsapp: '(21) 99999-0000',
  itens: [{ nome: 'Caderno personalizado', quantidade: 10, preco: 32 }],
  subtotal: 320,
  frete: 28.9,
  quando: 'hoje, 09:12',
  prazoDias: 4,
  cidade: 'Niterói, RJ',
  transportadora: 'Correios PAC',
  daLoja: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  carregarPedidosDaLoja.mockResolvedValue([])
})

describe('aba de pedidos, com a loja no ar', () => {
  beforeEach(() => {
    temBanco.mockReturnValue(true)
  })

  it('não mostra nenhum pedido de exemplo', async () => {
    carregarPedidosDaLoja.mockResolvedValue([PEDIDO_DE_VERDADE])

    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    expect(await screen.findByText(/Marina Alves/)).toBeInTheDocument()
    expect(screen.queryByText(/Exemplo:/)).toBeNull()
  })

  it('não conta pedido inventado no filtro', async () => {
    carregarPedidosDaLoja.mockResolvedValue([PEDIDO_DE_VERDADE])

    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    await screen.findByText(/Marina Alves/)

    const todos = screen.getByRole('button', { name: /Todos/ })
    expect(todos).toHaveTextContent('1')
  })

  it('não diz que nada foi cobrado, porque agora é cobrado', async () => {
    carregarPedidosDaLoja.mockResolvedValue([PEDIDO_DE_VERDADE])

    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    await screen.findByText(/Marina Alves/)

    // A frase antiga dizia que o pedido ficava "só neste navegador" e que
    // nada tinha sido cobrado. Com o Mercado Pago no ar, o dinheiro entrou
    // de verdade, e ela precisa produzir.
    expect(screen.queryByText(/Nada foi cobrado/)).toBeNull()
    expect(screen.queryByText(/são de exemplo/)).toBeNull()
  })

  it('diz que ainda não houve venda, em vez de culpar o filtro', async () => {
    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    expect(await screen.findByText(/Nenhuma venda ainda/)).toBeInTheDocument()
  })
})

describe('aba de pedidos, na demonstração', () => {
  beforeEach(() => {
    temBanco.mockReturnValue(false)
  })

  it('mostra os exemplos, que é para o que eles servem', async () => {
    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    expect(await screen.findAllByText(/Exemplo:/)).not.toHaveLength(0)
  })

  it('avisa que os pedidos são de exemplo', async () => {
    render(<AbaPedidos onAbrirEtiqueta={() => {}} />)

    expect(await screen.findByText(/são de exemplo/)).toBeInTheDocument()
  })
})
