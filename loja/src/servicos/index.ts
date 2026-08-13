import type {
  ServicoDePagamento,
  ServicoDeFrete,
  ServicoDeAvisos,
  RepositorioDePedidos,
} from './contratos'

import { pagamentoSimulado } from './pagamentoSimulado'
import { freteSimulado } from './freteSimulado'
import { avisosSimulados } from './avisosSimulados'
import { pedidosLocais } from './pedidosLocais'

/**
 * Onde a loja decide com quem está falando.
 *
 * Hoje todos os serviços são simulados: rodam no navegador, não cobram
 * nada de ninguém e não dependem de conta contratada. A loja funciona de
 * ponta a ponta assim — dá para percorrer uma compra inteira, ver o pedido
 * aparecer no painel, gerar etiqueta e conferir o aviso que teria sido
 * enviado.
 *
 * Quando as contas existirem, cada serviço real entra aqui e em nenhum
 * outro lugar. As telas conversam com os contratos, não com o Mercado
 * Pago: trocar é apagar uma linha e escrever outra.
 *
 * A troca é por variável de ambiente, e não por edição de código, porque
 * é assim que dá para ter a loja de verdade no ar e a demonstração
 * rodando ao mesmo tempo, com o mesmo código.
 */

const temMercadoPago = Boolean(process.env.NEXT_PUBLIC_MERCADOPAGO_CHAVE)
const temMelhorEnvio = Boolean(process.env.NEXT_PUBLIC_MELHORENVIO_ATIVO)
const temEnvioDeEmail = Boolean(process.env.NEXT_PUBLIC_EMAIL_ATIVO)
const temBanco = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

export const pagamento: ServicoDePagamento = pagamentoSimulado
export const frete: ServicoDeFrete = freteSimulado
export const avisos: ServicoDeAvisos = avisosSimulados
export const pedidos: RepositorioDePedidos = pedidosLocais

/**
 * O que ainda é simulação.
 *
 * A interface usa isto para avisar quem está comprando — e é o que impede
 * a loja de dizer "pagamento aprovado" quando nada foi cobrado. Enquanto
 * qualquer um destes for falso, a loja mostra que é demonstração.
 */
export const estaTudoReal = temMercadoPago && temMelhorEnvio && temEnvioDeEmail && temBanco

export const situacaoDosServicos = {
  pagamento: temMercadoPago ? 'Mercado Pago' : 'simulado',
  frete: temMelhorEnvio ? 'Melhor Envio' : 'simulado',
  avisos: temEnvioDeEmail ? 'e-mail de verdade' : 'simulado',
  pedidos: temBanco ? 'banco de dados' : 'guardado no navegador',
} as const

export type { Pedido, ItemDoPedido, Comprador, EnderecoEntrega, OpcaoDeFrete } from './contratos'
