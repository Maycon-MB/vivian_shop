'use client'

import type { EstadoPagamento, Pedido, RepositorioDePedidos } from './contratos'
import { bancoDoNavegador } from './autenticacao'

/**
 * Os pedidos no banco, no lugar do `localStorage`.
 *
 * Até 25/08 a compra era gravada no navegador de quem comprava. Serviu
 * para desenhar as telas e não serve para vender: fechar a aba apagava a
 * compra, e a Vivian não via nada.
 *
 * **O preço não sai daqui.** A função `criar_pedido` no banco busca o
 * valor na tabela de produtos, soma e devolve o total. Este arquivo manda
 * o que a cliente quer comprar, e nunca quanto custa: quem edita o
 * JavaScript da própria página pagaria R$ 1 num pedido de R$ 137, e isso
 * é abrir as ferramentas do navegador e trocar um número.
 *
 * Por isso `salvar` devolve o pedido **com os valores que o banco
 * calculou**, e não com os que recebeu. Se os dois divergirem, o certo é o
 * do banco, e é ele que a cliente vê na tela seguinte.
 */

interface LinhaDePedido {
  id: string
  numero: string
  linha: string
  criado_em: string
  comprador_nome: string
  comprador_email: string
  comprador_whatsapp: string
  subtotal: string | number
  frete: string | number
  desconto: string | number
  total: string | number
  meio_pagamento: string
  estado_pagamento: string
  cep: string | null
  logradouro: string | null
  numero_endereco: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  transportadora: string | null
  rastreio: string | null
  prometido_para: string | null
  itens_do_pedido?: {
    produto_id: string
    nome: string
    preco_unitario: string | number
    quantidade: number
  }[]
}

const COLUNAS =
  'id, numero, linha, criado_em, comprador_nome, comprador_email, comprador_whatsapp, ' +
  'subtotal, frete, desconto, total, meio_pagamento, estado_pagamento, ' +
  'cep, logradouro, numero_endereco, complemento, bairro, cidade, uf, ' +
  'transportadora, rastreio, prometido_para, ' +
  'itens_do_pedido(produto_id, nome, preco_unitario, quantidade)'

/** `numeric` do Postgres chega como texto: sem converter, a soma concatena. */
const numero = (valor: string | number | null | undefined): number => Number(valor ?? 0)

const paraPedido = (linha: LinhaDePedido): Pedido => ({
  id: linha.id,
  numero: linha.numero,
  linha: linha.linha as Pedido['linha'],
  criadoEm: linha.criado_em,
  comprador: {
    nome: linha.comprador_nome,
    email: linha.comprador_email,
    whatsapp: linha.comprador_whatsapp,
  },
  itens: (linha.itens_do_pedido ?? []).map((item) => ({
    produtoId: item.produto_id,
    nome: item.nome,
    precoUnitario: numero(item.preco_unitario),
    quantidade: item.quantidade,
  })),
  subtotal: numero(linha.subtotal),
  frete: numero(linha.frete),
  desconto: numero(linha.desconto),
  total: numero(linha.total),
  meioDePagamento: linha.meio_pagamento as Pedido['meioDePagamento'],
  estadoPagamento: linha.estado_pagamento as Pedido['estadoPagamento'],
  ...(linha.cep
    ? {
        endereco: {
          cep: linha.cep,
          logradouro: linha.logradouro ?? '',
          numero: linha.numero_endereco ?? '',
          complemento: linha.complemento ?? '',
          bairro: linha.bairro ?? '',
          cidade: linha.cidade ?? '',
          uf: linha.uf ?? '',
        },
      }
    : {}),
  ...(linha.transportadora ? { transportadora: linha.transportadora } : {}),
  ...(linha.rastreio ? { rastreio: linha.rastreio } : {}),
  ...(linha.prometido_para ? { prometidoPara: linha.prometido_para } : {}),
})

export const pedidosSupabase: RepositorioDePedidos = {
  async salvar(pedido) {
    const { data, error } = await bancoDoNavegador().rpc('criar_pedido', {
      // Só o que ela quer comprar. O preço o banco descobre sozinho.
      p_itens: pedido.itens.map((item) => ({
        produto_id: item.produtoId,
        quantidade: item.quantidade,
      })),
      p_nome: pedido.comprador.nome,
      p_email: pedido.comprador.email,
      p_whatsapp: pedido.comprador.whatsapp,
      p_meio: pedido.meioDePagamento,
      p_frete: pedido.frete,
      p_endereco: pedido.endereco ?? null,
    })

    if (error) throw new Error(error.message)

    const criado = (data as { id: string; numero: string; subtotal: number; total: number }[])[0]

    return {
      ...pedido,
      id: criado.id,
      numero: criado.numero,
      // Os valores do banco, e não os que vieram da tela.
      subtotal: numero(criado.subtotal),
      total: numero(criado.total),
      estadoPagamento: 'aguardando',
    }
  },

  /**
   * Os pedidos de quem está logada.
   *
   * Sem conta devolve lista vazia, e não é falha: a política do banco
   * responde `[]` para quem não é dona do pedido, e é assim que o endereço
   * de casa de uma cliente não aparece para outra.
   */
  async listar() {
    const { data, error } = await bancoDoNavegador()
      .from('pedidos')
      .select(COLUNAS)
      .order('criado_em', { ascending: false })

    if (error) throw new Error(error.message)

    return (data as unknown as LinhaDePedido[]).map(paraPedido)
  },

  /**
   * O estado do pagamento, mudado por quem tem permissão.
   *
   * Só a dona: a política de update em `pedidos` responde a
   * `e_dona_da_loja()`. Quem compra não marca o próprio pedido como pago,
   * e quando o Mercado Pago entrar quem escreve aqui é a função do
   * servidor, com o aviso já conferido.
   */
  async atualizarEstado(id: string, estado: EstadoPagamento) {
    const { error } = await bancoDoNavegador()
      .from('pedidos')
      .update({ estado_pagamento: estado, atualizado_em: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async buscar(id) {
    const { data, error } = await bancoDoNavegador()
      .from('pedidos')
      .select(COLUNAS)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return data ? paraPedido(data as unknown as LinhaDePedido) : null
  },
}
