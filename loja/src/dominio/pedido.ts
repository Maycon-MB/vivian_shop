import type { Linha } from './linhas'

/**
 * Pedido e seus estados.
 *
 * Os estados são diferentes por linha, e isso não é detalhe: pedido
 * personalizado passa por produção e envio, pedido digital já nasce
 * entregue. Misturar os dois num fluxo só faria a cliente procurar
 * etiqueta para um arquivo que foi por e-mail.
 */

export const ESTADOS_PEDIDO = {
  aguardando_pagamento: {
    rotulo: 'Aguardando pagamento',
    descricao: 'O pedido foi feito, o pagamento ainda não foi aprovado.',
    cor: 'neutro',
  },
  em_producao: {
    rotulo: 'Em produção',
    descricao: 'Pago. Está sendo feito.',
    cor: 'atencao',
  },
  pronto_para_envio: {
    rotulo: 'Pronto para envio',
    descricao: 'Produzido. Falta gerar a etiqueta e postar.',
    cor: 'acao',
  },
  enviado: {
    rotulo: 'Enviado',
    descricao: 'Postado. O código de rastreio já foi para quem comprou.',
    cor: 'ok',
  },
  entregue_digital: {
    rotulo: 'Entregue',
    descricao: 'O arquivo foi enviado por e-mail na aprovação do pagamento.',
    cor: 'ok',
  },
  cancelado: {
    rotulo: 'Cancelado',
    descricao: 'O pedido não seguiu.',
    cor: 'problema',
  },
} as const

export type EstadoPedido = keyof typeof ESTADOS_PEDIDO

export interface ItemPedido {
  produtoId: string
  /** Cópia do nome no momento da compra: mudar o produto não reescreve o histórico. */
  nome: string
  /** Cópia do preço no momento da compra, pelo mesmo motivo. */
  preco: number
  quantidade: number
}

export interface Endereco {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
}

export interface Pedido {
  id: string
  numero: string
  linha: Linha
  estado: EstadoPedido
  criadoEm: string
  /** Data prometida de postagem, nos pedidos que passam por produção. */
  prometidoPara?: string

  clienteNome: string
  clienteEmail: string
  clienteWhatsapp: string

  itens: ItemPedido[]
  subtotal: number
  frete: number
  total: number

  endereco?: Endereco
  transportadora?: string
  rastreio?: string
}

export const ehPedidoDigital = (pedido: Pedido): boolean =>
  pedido.estado === 'entregue_digital' || !pedido.endereco

/** Pedidos que exigem alguma ação da cliente hoje. */
export const precisaDeAcao = (pedido: Pedido): boolean =>
  pedido.estado === 'em_producao' || pedido.estado === 'pronto_para_envio'

export const totalPedido = (pedido: Pedido): number => pedido.subtotal + pedido.frete
