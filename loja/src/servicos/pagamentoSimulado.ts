/**
 * Pagamento de mentira, para a loja funcionar inteira antes de existir conta.
 *
 * Não há conta no Mercado Pago contratada ainda, e mesmo assim a loja precisa
 * ir do carrinho até a tela de "pedido confirmado" numa demonstração. Então
 * este arquivo cumpre o contrato `ServicoDePagamento` sem cobrar nada de
 * ninguém: ele demora um pouco, aprova quase sempre, e recusa de propósito em
 * alguns valores combinados, para as telas de erro também poderem ser vistas.
 *
 * Duas escolhas que valem explicação:
 *
 * 1. Nada aqui é sorteado. Testes automatizados que dependem de `Math.random`
 *    passam num dia e falham no outro sem ninguém ter mexido em nada. Por isso
 *    o tempo de espera e o identificador saem de conta feita em cima do valor
 *    do pedido: mesmo pedido, mesma resposta, sempre.
 *
 * 2. As mensagens de recusa são escritas para a artesã e para quem compra dela,
 *    não para quem trabalha em banco. Ninguém precisa saber o que é "emissor"
 *    ou "transação negada" — precisa saber o que houve e o que fazer agora.
 *
 * Quando o Mercado Pago entrar de verdade, entra como outro arquivo que exporta
 * a mesma coisa com `real: true`, e o único lugar que muda é onde o serviço é
 * escolhido. Nenhuma tela é tocada. Os valores-armadilha (,01 / ,02 / ,03)
 * deixam de recusar sozinhos — quem recusa passa a ser o banco.
 */

import type {
  PedidoDePagamento,
  ResultadoPagamento,
  ServicoDePagamento,
} from '@/servicos/contratos'

/** Faixa de espera, em ms. Curta demais não mostra o "processando"; longa demais irrita. */
const ESPERA_MINIMA_MS = 900
const ESPERA_MAXIMA_MS = 1600

/**
 * Semente fixa no lugar do relógio. O identificador precisa parecer um número
 * de autorização de verdade (grande, com cara de data), mas se ele viesse de
 * `Date.now()` nenhum teste conseguiria comparar o resultado com um valor
 * esperado. Então a "hora" é congelada aqui e o que varia é o contador abaixo.
 */
const INSTANTE_BASE = 1_700_000_000

/** Cresce a cada cobrança, para dois pedidos iguais não saírem com o mesmo protocolo. */
let cobrancasFeitas = 0

interface Recusa {
  motivo: string
  comoResolver: string
}

/**
 * Valores combinados com a equipe para exercitar as telas de erro sem depender
 * de ambiente de teste do banco: quem quiser ver a tela de recusa fecha um
 * pedido terminado em ,01, ,02 ou ,03.
 */
const RECUSAS_POR_CENTAVO: Record<number, Recusa> = {
  1: {
    motivo: 'Não havia saldo suficiente na conta ligada a esse pagamento.',
    comoResolver:
      'Confira o saldo, tente outro cartão ou pague com Pix — no Pix o valor sai na hora.',
  },
  2: {
    motivo: 'Algum dado do cartão não bateu: número, validade ou código de trás.',
    comoResolver:
      'Confira os dados com o cartão na mão e tente de novo. Se continuar, use outro cartão ou pague com Pix.',
  },
  3: {
    motivo: 'O banco do cartão não liberou essa compra.',
    comoResolver:
      'Ligue para o banco pelo telefone que está atrás do cartão e peça para liberar, ou pague com Pix agora.',
  },
}

const RECUSA_POR_EMAIL: Recusa = {
  motivo: 'O pagamento não foi concluído.',
  comoResolver:
    'Tente outra vez em alguns minutos, use outro cartão ou pague com Pix. Se preferir, chame a gente no WhatsApp que a gente resolve junto.',
}

/** Espera um tempo antes de responder, imitando a ida e volta até o banco. */
function esperar(ms: number): Promise<void> {
  return new Promise((resolva) => setTimeout(resolva, ms))
}

/** O valor em centavos, já arredondado — nunca comparamos centavo com número quebrado. */
function emCentavos(valor: number): number {
  return Math.round(valor * 100)
}

/**
 * Tempo de espera derivado do próprio valor: espalha os pedidos pela faixa
 * combinada sem sortear nada, então o mesmo pedido sempre demora o mesmo tanto.
 */
function esperaPara(centavos: number): number {
  const faixa = ESPERA_MAXIMA_MS - ESPERA_MINIMA_MS
  return ESPERA_MINIMA_MS + (Math.abs(centavos) % (faixa + 1))
}

function motivoDaRecusa(pedido: PedidoDePagamento, centavos: number): Recusa | null {
  const finalDoValor = Math.abs(centavos) % 100
  const recusaPeloValor = RECUSAS_POR_CENTAVO[finalDoValor]
  if (recusaPeloValor) return recusaPeloValor

  if (pedido.comprador.email.toLowerCase().includes('recusa')) {
    return RECUSA_POR_EMAIL
  }

  return null
}

export const pagamentoSimulado: ServicoDePagamento = {
  nome: 'Pagamento simulado',
  real: false,

  async cobrar(pedido: PedidoDePagamento): Promise<ResultadoPagamento> {
    const centavos = emCentavos(pedido.valor)

    await esperar(esperaPara(centavos))

    const recusa = motivoDaRecusa(pedido, centavos)
    if (recusa) {
      return { aprovado: false, motivo: recusa.motivo, comoResolver: recusa.comoResolver }
    }

    cobrancasFeitas += 1
    const identificador = `SIM-${INSTANTE_BASE + Math.abs(centavos) * 1000 + cobrancasFeitas}`

    return { aprovado: true, identificador, meio: pedido.meio }
  },
}
