/**
 * O que cada serviço externo precisa saber fazer.
 *
 * Aqui só existem as promessas — nenhuma implementação. Hoje quem cumpre
 * essas promessas são versões simuladas, que rodam no navegador e não
 * cobram nada de ninguém. Quando o Mercado Pago, o Melhor Envio e o envio
 * de e-mail entrarem de verdade, entram como outra implementação destes
 * mesmos contratos, e nenhuma tela muda.
 *
 * É o mesmo desenho que já vale para o catálogo, e foi o que permitiu
 * construir a loja inteira antes de existir banco.
 */

import type { Linha } from '@/dominio/linhas'

/* ── Pedido ───────────────────────────────────────────────────────────── */

export type EstadoPagamento =
  | 'aguardando'
  | 'aprovado'
  | 'recusado'
  | 'estornado'

export type MeioDePagamento = 'pix' | 'cartao'

export interface ItemDoPedido {
  produtoId: string | number
  /** Cópia do nome no momento da compra: reajuste não reescreve histórico. */
  nome: string
  precoUnitario: number
  quantidade: number
}

export interface Comprador {
  nome: string
  email: string
  whatsapp: string
}

export interface EnderecoEntrega {
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
  criadoEm: string

  comprador: Comprador
  itens: ItemDoPedido[]

  subtotal: number
  frete: number
  desconto: number
  total: number

  meioDePagamento: MeioDePagamento
  estadoPagamento: EstadoPagamento

  /** Só em pedido físico. */
  endereco?: EnderecoEntrega
  transportadora?: string
  rastreio?: string
  prometidoPara?: string

  /** Só em pedido digital. */
  tokenDownload?: string
  expiraEm?: string
}

/* ── Pagamento ────────────────────────────────────────────────────────── */

export interface PedidoDePagamento {
  valor: number
  meio: MeioDePagamento
  comprador: Comprador
  /** Só no cartão, e só o token: o número nunca chega ao servidor. */
  tokenDoCartao?: string
}

export type ResultadoPagamento =
  | { aprovado: true; identificador: string; meio: MeioDePagamento }
  | { aprovado: false; motivo: string; comoResolver: string }

export interface ServicoDePagamento {
  cobrar(pedido: PedidoDePagamento): Promise<ResultadoPagamento>
  /** Nome de quem processa, para a loja poder dizer à pessoa. */
  readonly nome: string
  /** Falso enquanto for simulação — a interface avisa quem está comprando. */
  readonly real: boolean
}

/* ── Frete ────────────────────────────────────────────────────────────── */

export interface OpcaoDeFrete {
  id: string
  transportadora: string
  servico: string
  valor: number
  prazoDias: number
}

export interface ConsultaDeFrete {
  cepDestino: string
  pesoG: number
  altCm: number
  largCm: number
  compCm: number
}

export interface ServicoDeFrete {
  cotar(consulta: ConsultaDeFrete): Promise<OpcaoDeFrete[]>
  readonly real: boolean
}

/* ── Avisos ───────────────────────────────────────────────────────────── */

export type TipoDeAviso =
  | 'pedido-confirmado'
  | 'material-digital'
  | 'pedido-postado'

export interface Aviso {
  tipo: TipoDeAviso
  para: Comprador
  pedido: Pedido
}

export interface ServicoDeAvisos {
  enviar(aviso: Aviso): Promise<{ enviado: boolean; canal: string }>
  readonly real: boolean
}

/* ── Guarda de pedidos ────────────────────────────────────────────────── */

export interface RepositorioDePedidos {
  salvar(pedido: Pedido): Promise<Pedido>
  listar(): Promise<Pedido[]>
  buscar(id: string): Promise<Pedido | null>
  atualizarEstado(id: string, estado: EstadoPagamento): Promise<void>
}
