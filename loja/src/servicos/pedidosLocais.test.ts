import { describe, it, expect, beforeEach, afterAll } from 'vitest'

import { pedidosLocais, limparPedidos } from './pedidosLocais'
import type { Pedido } from './contratos'
import { LINHA_PERSONALIZADA } from '@/dominio/linhas'

/**
 * O repositório é onde uma falha some sem avisar: o pedido "some", e a
 * pessoa que comprou é que descobre. Os testes cobrem os dois casos que
 * fariam isso acontecer — numeração repetida e pedido sobrescrito.
 *
 * Os testes rodam em Node, onde não existe `localStorage`. Em vez de trocar
 * o ambiente inteiro por um navegador de mentira, monta-se aqui o mínimo
 * que o repositório usa: guardar, ler e apagar.
 */

const armazenamentoDeMentira = () => {
  const conteudo = new Map<string, string>()
  return {
    getItem: (chave: string) => conteudo.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void conteudo.set(chave, valor),
    removeItem: (chave: string) => void conteudo.delete(chave),
    clear: () => conteudo.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage
}

const globalComJanela = globalThis as { window?: { localStorage: Storage } }
const janelaOriginal = globalComJanela.window

const pedidoDe = (nome: string): Pedido => ({
  id: '',
  numero: '',
  linha: LINHA_PERSONALIZADA,
  criadoEm: new Date().toISOString(),
  comprador: { nome, email: 'ana@exemplo.com.br', whatsapp: '(21) 99999-0000' },
  itens: [{ produtoId: 1, nome: 'Caderno personalizado', precoUnitario: 32, quantidade: 10 }],
  subtotal: 320,
  frete: 28.9,
  desconto: 0,
  total: 348.9,
  meioDePagamento: 'pix',
  estadoPagamento: 'aprovado',
})

beforeEach(() => {
  globalComJanela.window = { localStorage: armazenamentoDeMentira() }
  limparPedidos()
})

afterAll(() => {
  globalComJanela.window = janelaOriginal
})

describe('pedidos guardados', () => {
  it('numera o primeiro pedido como 0001', async () => {
    const guardado = await pedidosLocais.salvar(pedidoDe('Ana'))
    expect(guardado.numero).toBe('0001')
  })

  it('dá um número e um identificador diferentes a cada pedido', async () => {
    const primeiro = await pedidosLocais.salvar(pedidoDe('Ana'))
    const segundo = await pedidosLocais.salvar(pedidoDe('Beatriz'))

    expect(segundo.numero).toBe('0002')
    expect(segundo.id).not.toBe(primeiro.id)
  })

  it('guarda os dois pedidos, sem um apagar o outro', async () => {
    await pedidosLocais.salvar(pedidoDe('Ana'))
    await pedidosLocais.salvar(pedidoDe('Beatriz'))

    const todos = await pedidosLocais.listar()
    expect(todos).toHaveLength(2)
    expect(todos.map((p) => p.comprador.nome).sort()).toEqual(['Ana', 'Beatriz'])
  })

  it('encontra o pedido pelo identificador que devolveu', async () => {
    const guardado = await pedidosLocais.salvar(pedidoDe('Ana'))
    const achado = await pedidosLocais.buscar(guardado.id)

    expect(achado?.numero).toBe(guardado.numero)
    expect(achado?.total).toBe(348.9)
  })

  it('não repete número depois de um pedido ser apagado', async () => {
    await pedidosLocais.salvar(pedidoDe('Ana'))
    await pedidosLocais.salvar(pedidoDe('Beatriz'))

    // Alguém apaga o registro sem zerar o contador — o cenário que faria
    // dois pedidos diferentes atenderem pelo mesmo número no WhatsApp.
    globalComJanela.window!.localStorage.removeItem('feito-para-voce:pedidos')

    const novo = await pedidosLocais.salvar(pedidoDe('Carla'))
    expect(novo.numero).toBe('0003')
  })

  it('não troca o número ao reescrever um pedido que já existe', async () => {
    const guardado = await pedidosLocais.salvar(pedidoDe('Ana'))
    const reescrito = await pedidosLocais.salvar({ ...guardado, rastreio: 'BR123456789BR' })

    expect(reescrito.numero).toBe(guardado.numero)
    expect(await pedidosLocais.listar()).toHaveLength(1)
  })

  it('muda o estado do pagamento sem mexer no resto', async () => {
    const guardado = await pedidosLocais.salvar(pedidoDe('Ana'))
    await pedidosLocais.atualizarEstado(guardado.id, 'estornado')

    const depois = await pedidosLocais.buscar(guardado.id)
    expect(depois?.estadoPagamento).toBe('estornado')
    expect(depois?.total).toBe(348.9)
  })

  it('devolve os mais recentes primeiro', async () => {
    const antigo = await pedidosLocais.salvar({
      ...pedidoDe('Ana'),
      criadoEm: '2026-08-01T10:00:00.000Z',
    })
    const novo = await pedidosLocais.salvar({
      ...pedidoDe('Beatriz'),
      criadoEm: '2026-08-12T10:00:00.000Z',
    })

    const lista = await pedidosLocais.listar()
    expect(lista[0].id).toBe(novo.id)
    expect(lista[1].id).toBe(antigo.id)
  })

  it('não quebra a loja quando o navegador não deixa guardar nada', async () => {
    delete globalComJanela.window

    const guardado = await pedidosLocais.salvar(pedidoDe('Ana'))

    // Sem onde guardar, a compra na tela ainda vale: ela só não sobrevive
    // ao recarregar. Melhor isso do que derrubar o checkout.
    expect(guardado.numero).toBe('0001')
    expect(await pedidosLocais.listar()).toEqual([])
  })

  it('descarta conteúdo corrompido em vez de propagar o erro', async () => {
    globalComJanela.window!.localStorage.setItem('feito-para-voce:pedidos', 'isto não é json')

    expect(await pedidosLocais.listar()).toEqual([])
  })
})
