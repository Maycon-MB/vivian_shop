/**
 * O que fazer quando o Mercado Pago avisa que uma compra mudou de estado.
 *
 * Este arquivo é lido em dois lugares: aqui, pelos testes, e pela função
 * que roda no servidor do Supabase, em Deno. Por isso ele não importa nada
 * — nem o atalho "@/", nem biblioteca, nem tipo de outro módulo. Regra
 * pura, que cabe na cabeça e roda em qualquer lugar.
 *
 * A ideia que atravessa tudo: **o aviso não é a verdade**. Ele chega por
 * HTTP, num endereço público, sem ordem garantida e sem garantia de vir
 * uma vez só. O que ele faz é dizer "vá perguntar sobre o pagamento tal".
 * Quem responde é a API do Mercado Pago, e o que volta de lá ainda passa
 * por estas regras antes de virar estado de pedido.
 */

/** Os mesmos estados de `ServicoDePagamento`, escritos sem depender dele. */
export type Estado = 'aguardando' | 'aprovado' | 'recusado' | 'estornado'

/**
 * O estado do Mercado Pago traduzido para o nosso.
 *
 * `null` quando é um estado que não conhecemos. Isso acontece de verdade:
 * eles acrescentam estado com meio de pagamento novo. Nesse caso o certo é
 * não mexer no pedido e deixar para uma pessoa olhar, e não chutar.
 *
 * `authorized` merece atenção: é cartão reservado e ainda não capturado. O
 * dinheiro não é dela. Tratar como aprovado liberaria o material digital
 * de uma compra que ainda pode não acontecer.
 */
export const estadoDoMercadoPago = (status: string): Estado | null => {
  switch (status) {
    case 'approved':
      return 'aprovado'
    case 'pending':
    case 'in_process':
    case 'in_mediation':
    case 'authorized':
      return 'aguardando'
    case 'rejected':
    case 'cancelled':
      return 'recusado'
    case 'refunded':
    case 'charged_back':
      return 'estornado'
    default:
      return null
  }
}

/**
 * Para onde um pedido pode ir, a partir de onde ele está.
 *
 * Existe porque aviso chega fora de ordem. Sem isto, um "aguardando"
 * atrasado sobrescreveria um "aprovado" que já chegou, o pedido voltaria
 * para a fila e ela pararia de produzir uma peça já vendida.
 *
 * O único caminho de volta é o estorno, que é real: a pessoa pede
 * reembolso depois de ter pago.
 */
const CAMINHOS: Record<Estado, Estado[]> = {
  aguardando: ['aprovado', 'recusado', 'estornado'],
  aprovado: ['estornado'],
  recusado: ['aprovado', 'estornado'],
  estornado: [],
}

export const podeAvancarPara = (atual: Estado, novo: Estado): boolean =>
  CAMINHOS[atual].includes(novo)

/**
 * As duas partes do cabeçalho `x-signature`.
 *
 * O Mercado Pago manda algo como `ts=1704908010,v1=618c8534...`: o carimbo
 * de hora e o resumo assinado. `null` quando falta qualquer uma das duas,
 * porque sem as duas não há o que conferir, e seguir em frente achando que
 * conferiu é pior do que recusar.
 */
export const partesDaAssinatura = (
  cabecalho: string | null | undefined,
): { ts: string; v1: string } | null => {
  if (!cabecalho) return null

  const partes: Record<string, string> = {}

  for (const pedaco of cabecalho.split(',')) {
    const [chave, ...resto] = pedaco.split('=')
    if (!chave || !resto.length) continue
    partes[chave.trim()] = resto.join('=').trim()
  }

  if (!partes.ts || !partes.v1) return null

  return { ts: partes.ts, v1: partes.v1 }
}

/**
 * O texto que o Mercado Pago assinou, montado igual ao deles.
 *
 * A ordem dos campos, os dois pontos e o ponto e vírgula final não são
 * estilo: qualquer diferença gera outro resumo, e aí toda notificação
 * legítima passa a ser recusada. O id vai em minúsculas porque é assim que
 * eles documentam.
 */
export const montarManifesto = ({
  id,
  requestId,
  ts,
}: {
  id: string
  requestId: string
  ts: string
}): string => `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`

export interface PagamentoConfirmado {
  /** O id no Mercado Pago, que é a chave para não processar duas vezes. */
  id: string
  status: string
  valor: number
  /** O número do pedido, que mandamos na criação da cobrança. */
  referencia: string
}

export interface PedidoParaConferir {
  numero: string
  total: number
  estadoPagamento: Estado
}

export type Decisao =
  | { acao: 'atualizar'; estado: Estado }
  | { acao: 'ignorar'; motivo: string }
  | { acao: 'conferir'; motivo: string }

/**
 * Diferença tolerada entre o que o pedido custa e o que foi pago.
 *
 * Um centavo, para arredondamento de parcela. Não é margem de negociação:
 * é a diferença que aparece quando o Mercado Pago divide R$ 320,00 em três
 * e soma de volta.
 */
const TOLERANCIA_EM_REAIS = 0.01

/**
 * A decisão inteira, em um lugar só e sem tocar em banco.
 *
 * Três saídas, e a diferença entre elas importa:
 *
 *   - `atualizar`: muda o estado do pedido
 *   - `ignorar`: não faz nada, e está tudo certo (aviso repetido, ou
 *     aviso velho chegando depois de um novo)
 *   - `conferir`: não faz nada, e alguém precisa olhar
 */
export const decidirSobreAviso = ({
  pagamento,
  pedido,
  jaProcessado,
}: {
  pagamento: PagamentoConfirmado
  pedido: PedidoParaConferir | null
  jaProcessado: boolean
}): Decisao => {
  // O Mercado Pago reenvia até receber 200. Sem esta linha, o material
  // digital sairia por e-mail a cada reenvio do mesmo aviso.
  if (jaProcessado) {
    return { acao: 'ignorar', motivo: `o aviso ${pagamento.id} já foi processado` }
  }

  // O endereço do webhook é público: aviso apontando para pedido que não
  // existe é engano, ou é gente testando o que responde. Registra e não
  // cria nada.
  if (!pedido) {
    return {
      acao: 'conferir',
      motivo: `o pedido ${pagamento.referencia} não existe`,
    }
  }

  const novo = estadoDoMercadoPago(pagamento.status)
  if (!novo) {
    return {
      acao: 'conferir',
      motivo: `estado desconhecido do Mercado Pago: ${pagamento.status}`,
    }
  }

  // O valor só é conferido quando o dinheiro está entrando. Reembolso
  // parcial devolve menos que o total, e isso não é motivo para deixar de
  // registrar o estorno.
  const entrandoDinheiro = novo === 'aprovado'
  if (entrandoDinheiro && pagamento.valor + TOLERANCIA_EM_REAIS < pedido.total) {
    return {
      acao: 'conferir',
      motivo: `valor pago (${pagamento.valor}) menor que o do pedido (${pedido.total})`,
    }
  }

  if (!podeAvancarPara(pedido.estadoPagamento, novo)) {
    return {
      acao: 'ignorar',
      motivo: `pedido já está em ${pedido.estadoPagamento}, aviso pedia ${novo}`,
    }
  }

  return { acao: 'atualizar', estado: novo }
}
