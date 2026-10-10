import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  processarAviso,
  type BancoDoAviso,
  type Estado,
  type PagamentoConfirmado,
} from './avisoDePagamento'

/**
 * O caminho inteiro do aviso, do pagamento confirmado até o pedido gravado.
 *
 * `decidirSobreAviso` já dizia o certo, mas a função do servidor não a
 * chamava: gravava o estado que o Mercado Pago mandasse. Um "pending"
 * atrasado devolvia o pedido pago para "aguardando", e ele sumia da fila de
 * produção dela. Aqui o banco é de mentira, em memória, para provar o que
 * fica gravado sem tocar no banco dela.
 */

interface PedidoGuardado {
  id: string
  numero: string
  total: number
  estadoPagamento: Estado
  precisaConferir: string | null
}

const bancoEmMemoria = (pedidos: PedidoGuardado[] = []) => {
  const avisos: { pedidoId: string | null; externoId: string; statusExterno: string; decisao: string }[] = []

  const banco: BancoDoAviso = {
    lerPedido: async (id) => {
      const p = pedidos.find((x) => x.id === id)
      return p ? { id: p.id, numero: p.numero, total: p.total, estadoPagamento: p.estadoPagamento } : null
    },
    avisoJaProcessado: async (externoId, statusExterno) =>
      avisos.some((a) => a.externoId === externoId && a.statusExterno === statusExterno),
    mudarEstado: async (pedidoId, de, para) => {
      const p = pedidos.find((x) => x.id === pedidoId)
      if (!p || p.estadoPagamento !== de) return false
      p.estadoPagamento = para
      return true
    },
    marcarParaConferir: async (pedidoId, motivo) => {
      const p = pedidos.find((x) => x.id === pedidoId)
      if (p) p.precisaConferir = motivo
    },
    registrarAviso: async ({ pedidoId, externoId, statusExterno, decisao }) => {
      avisos.push({ pedidoId, externoId, statusExterno, decisao })
    },
  }

  return { banco, pedidos, avisos }
}

const pedidoDe320 = (estadoPagamento: Estado): PedidoGuardado => ({
  id: 'b7c1e2d4-0000-4000-8000-000000000007',
  numero: '0007',
  total: 320,
  estadoPagamento,
  precisaConferir: null,
})

const pagamento = (status: string, valor = 320): PagamentoConfirmado => ({
  id: 'mp-123',
  status,
  valor,
  referencia: 'b7c1e2d4-0000-4000-8000-000000000007',
})

describe('o aviso grava o pedido passando pelas regras', () => {
  it('não devolve para aguardando um pedido já pago quando o pending chega atrasado', async () => {
    // O Mercado Pago não garante ordem. Pedido pago que volta para
    // "aguardando" some da fila de produção dela.
    const { banco, pedidos } = bancoEmMemoria([pedidoDe320('aprovado')])

    await processarAviso({ pagamento: pagamento('pending'), corpo: {}, banco })

    expect(pedidos[0].estadoPagamento).toBe('aprovado')
  })

  it('aprova o pedido que aguardava quando o pagamento confere', async () => {
    const { banco, pedidos, avisos } = bancoEmMemoria([pedidoDe320('aguardando')])

    const r = await processarAviso({ pagamento: pagamento('approved'), corpo: {}, banco })

    expect(pedidos[0].estadoPagamento).toBe('aprovado')
    expect(r.tentarDeNovo).toBe(false)
    expect(avisos).toHaveLength(1)
  })

  it('não grava nada de novo quando o mesmo aviso chega outra vez', async () => {
    // Reenvio é o normal do Mercado Pago. Gravar de novo mandaria o
    // material digital por e-mail a cada reenvio.
    const { banco, avisos } = bancoEmMemoria([pedidoDe320('aguardando')])

    await processarAviso({ pagamento: pagamento('approved'), corpo: {}, banco })
    await processarAviso({ pagamento: pagamento('approved'), corpo: {}, banco })

    expect(avisos).toHaveLength(1)
  })

  it('pede para tentar de novo quando o pedido mudou entre ler e gravar', async () => {
    // Dois avisos ao mesmo tempo leem o mesmo estado. Só um pode gravar; o
    // outro devolve erro para o Mercado Pago reenviar e reler o pedido.
    const { banco, pedidos, avisos } = bancoEmMemoria([pedidoDe320('aguardando')])
    const lerAntes = banco.lerPedido
    banco.lerPedido = async (id) => {
      const lido = await lerAntes(id)
      pedidos[0].estadoPagamento = 'recusado'
      return lido
    }

    const r = await processarAviso({ pagamento: pagamento('approved'), corpo: {}, banco })

    expect(r.tentarDeNovo).toBe(true)
    expect(avisos).toHaveLength(0)
  })

  it('marca para ela conferir quando pagaram menos do que o pedido', async () => {
    const { banco, pedidos } = bancoEmMemoria([pedidoDe320('aguardando')])

    await processarAviso({ pagamento: pagamento('approved', 3), corpo: {}, banco })

    expect(pedidos[0].estadoPagamento).toBe('aguardando')
    expect(pedidos[0].precisaConferir).toMatch(/valor/i)
  })

  it('aceita pagamento em mediação como aguardando, sem marcar para conferir', async () => {
    // A tradução antiga do servidor não conhecia `in_mediation` e marcava o
    // pedido como estado desconhecido.
    const { banco, pedidos } = bancoEmMemoria([pedidoDe320('aguardando')])

    await processarAviso({ pagamento: pagamento('in_mediation'), corpo: {}, banco })

    expect(pedidos[0].precisaConferir).toBeNull()
  })

  it('registra o aviso de pedido que não existe, sem pedido ligado', async () => {
    const { banco, avisos } = bancoEmMemoria([])

    await processarAviso({ pagamento: pagamento('approved'), corpo: {}, banco })

    expect(avisos).toHaveLength(1)
    expect(avisos[0].pedidoId).toBeNull()
  })
})

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const webhook = readFileSync(
  join(RAIZ, 'supabase', 'funcoes', 'aviso-do-pagamento', 'index.ts'),
  'utf8',
)

describe('a função do servidor usa estas regras', () => {
  it('chama processarAviso em vez de gravar o estado direto', () => {
    expect(webhook).toMatch(/import\s*{[^}]*processarAviso[^}]*}\s*from\s*'[^']*dominio\/avisoDePagamento\.ts'/)
  })

  it('não tem uma tradução de estado própria', () => {
    // Duas traduções divergem: a do servidor já tinha esquecido `in_mediation`.
    expect(webhook).not.toContain('COMO_GUARDAMOS')
  })

  it('trava a gravação pelo estado que leu', () => {
    expect(webhook).toMatch(/\.eq\('estado_pagamento',/)
  })
})
