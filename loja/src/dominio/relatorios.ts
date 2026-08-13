/**
 * As contas que a Vivian precisa ver.
 *
 * Não é gráfico bonito: é o que ela responderia se o contador, o marido ou
 * ela mesma perguntasse "quanto isso deu esse mês?". Três perguntas, nesta
 * ordem de importância:
 *
 *   1. Quanto entrou, e quanto disso é meu de verdade
 *   2. O que eu preciso produzir agora
 *   3. Valeu a pena sair do Elo7
 *
 * Fica aqui, longe do React, por dois motivos. O primeiro é que conta de
 * dinheiro precisa de teste, e testar tela é caro e frágil. O segundo é que
 * a mesma conta vai ser usada em mais de um lugar — tela, arquivo do
 * contador e, um dia, mensagem automática de fim de mês.
 *
 * Uma regra atravessa o arquivo inteiro: **frete não é receita**. Ele entra
 * na conta e sai inteiro para os Correios ou para a Jadlog. Somar frete ao
 * faturamento faria a Vivian achar que ganhou o que só passou pela mão
 * dela — e é assim que artesã fecha o mês no vermelho achando que lucrou.
 */

export interface ItemVendido {
  nome: string
  quantidade: number
  preco: number
}

export type LinhaDoPedido = 'personalizada' | 'pedagogica'

export interface PedidoParaRelatorio {
  id: string
  criadoEm: string
  linha: LinhaDoPedido
  estado: string
  itens: ItemVendido[]
  subtotal: number
  frete: number
  /** Desconto concedido, como o do Pix. Zero quando não houve. */
  desconto?: number
}

/* Pedido cancelado ou esperando pagamento não é venda. Contar os dois
   infla o mês e some no mês seguinte, quando o dinheiro não aparece. */
const NAO_CONTAM = ['cancelado', 'aguardando']

export const ehVenda = (pedido: PedidoParaRelatorio): boolean =>
  !NAO_CONTAM.includes(pedido.estado)

/** Só os que ainda estão com ela para fazer. */
const PRECISA_PRODUZIR = ['producao', 'pronto']

/* ── Fechamento do mês ────────────────────────────────────────────────── */

export interface FechamentoDoMes {
  /** Quanto a cliente pagou no total, frete incluído. */
  movimentado: number
  /** O que é dela: produtos, já descontado o desconto dado. */
  receita: number
  /** O que passou pela mão dela e vai para a transportadora. */
  freteRepassado: number
  descontosDados: number
  pedidos: number
  pecas: number
  ticketMedio: number
  porLinha: Record<LinhaDoPedido, { receita: number; pedidos: number }>
}

const MES_VAZIO: FechamentoDoMes = {
  movimentado: 0,
  receita: 0,
  freteRepassado: 0,
  descontosDados: 0,
  pedidos: 0,
  pecas: 0,
  ticketMedio: 0,
  porLinha: {
    personalizada: { receita: 0, pedidos: 0 },
    pedagogica: { receita: 0, pedidos: 0 },
  },
}

/** Arredonda para centavo. Somar float sem isto faz sobrar 0,000000001. */
const emCentavos = (valor: number): number => Math.round(valor * 100) / 100

/**
 * O mês de referência é o da data informada, no fuso de quem abre. Usar
 * UTC faria uma venda das 22h do dia 31 cair no mês seguinte.
 */
export const mesmoMes = (dataISO: string, referencia: Date): boolean => {
  const data = new Date(dataISO)
  if (Number.isNaN(data.getTime())) return false

  return (
    data.getFullYear() === referencia.getFullYear() &&
    data.getMonth() === referencia.getMonth()
  )
}

export const fecharOMes = (
  pedidos: PedidoParaRelatorio[],
  referencia: Date,
): FechamentoDoMes => {
  const doMes = pedidos.filter((p) => ehVenda(p) && mesmoMes(p.criadoEm, referencia))

  if (doMes.length === 0) return MES_VAZIO

  const somar = (fn: (p: PedidoParaRelatorio) => number) =>
    emCentavos(doMes.reduce((soma, p) => soma + fn(p), 0))

  const descontosDados = somar((p) => p.desconto ?? 0)
  const receita = emCentavos(somar((p) => p.subtotal) - descontosDados)
  const freteRepassado = somar((p) => p.frete)

  const porLinha = { ...MES_VAZIO.porLinha }
  for (const linha of ['personalizada', 'pedagogica'] as const) {
    const daLinha = doMes.filter((p) => p.linha === linha)
    porLinha[linha] = {
      receita: emCentavos(
        daLinha.reduce((soma, p) => soma + p.subtotal - (p.desconto ?? 0), 0),
      ),
      pedidos: daLinha.length,
    }
  }

  return {
    movimentado: emCentavos(receita + freteRepassado),
    receita,
    freteRepassado,
    descontosDados,
    pedidos: doMes.length,
    pecas: doMes.reduce(
      (soma, p) => soma + p.itens.reduce((q, i) => q + i.quantidade, 0),
      0,
    ),
    // Ticket médio sobre a receita, não sobre o movimentado: senão um
    // pedido para o Acre parece uma venda maior do que foi.
    ticketMedio: emCentavos(receita / doMes.length),
    porLinha,
  }
}

/* ── O que produzir ───────────────────────────────────────────────────── */

export interface ProduzirItem {
  nome: string
  quantidade: number
  emQuantosPedidos: number
}

/**
 * Junta as peças de todos os pedidos que ainda estão com ela.
 *
 * Serve para uma coisa concreta: ela faz 30 canecas de uma vez em vez de
 * ligar o forno três vezes para 10. É a diferença entre trabalhar um dia e
 * trabalhar três.
 *
 * Ordena pela quantidade porque o que rende mais é o que vale começar.
 */
export const oQueProduzir = (pedidos: PedidoParaRelatorio[]): ProduzirItem[] => {
  const porProduto = new Map<string, ProduzirItem>()

  for (const pedido of pedidos) {
    if (!PRECISA_PRODUZIR.includes(pedido.estado)) continue

    for (const item of pedido.itens) {
      const atual = porProduto.get(item.nome)
      if (atual) {
        atual.quantidade += item.quantidade
        atual.emQuantosPedidos += 1
      } else {
        porProduto.set(item.nome, {
          nome: item.nome,
          quantidade: item.quantidade,
          emQuantosPedidos: 1,
        })
      }
    }
  }

  return [...porProduto.values()].sort(
    (a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}

/* ── Comparação com o Elo7 ────────────────────────────────────────────── */

/**
 * PENDENTE-VIVIAN: a taxa que o Elo7 cobrava dela.
 *
 * Este número está no formulário de perguntas porque eu não sei, e chutar
 * um número que vira "você economizou R$ X" seria inventar economia. Até
 * ela responder, a tela mostra o valor como ajustável e diz que é uma
 * estimativa — nunca como fato.
 */
export const TAXA_ELO7_ESTIMADA = 0.12

export interface ComparacaoComElo7 {
  taxaUsada: number
  ficariaComOElo7: number
  custoDaquiPorMes: number
  economia: number
  /** Falso quando a taxa ainda é a estimada, e não a que ela informou. */
  confirmada: boolean
}

/**
 * O que ela pagaria de comissão sobre a mesma receita, contra o que paga
 * aqui por mês.
 *
 * A comissão do Elo7 incide sobre a venda; a mensalidade daqui é fixa. Por
 * isso a comparação só faz sentido em cima de um mês real de vendas — num
 * mês fraco, o fixo perde, e a tela precisa poder dizer isso.
 */
export const compararComElo7 = (
  receitaDoMes: number,
  custoDaquiPorMes: number,
  taxa: number = TAXA_ELO7_ESTIMADA,
  confirmada = false,
): ComparacaoComElo7 => {
  const ficariaComOElo7 = emCentavos(receitaDoMes * taxa)

  return {
    taxaUsada: taxa,
    ficariaComOElo7,
    custoDaquiPorMes,
    economia: emCentavos(ficariaComOElo7 - custoDaquiPorMes),
    confirmada,
  }
}

/* ── Arquivo para o contador ──────────────────────────────────────────── */

/** Ponto e vírgula, e não vírgula: é o que o Excel em português entende. */
const SEPARADOR = ';'

const escapar = (campo: string | number): string => {
  const texto = String(campo)
  return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

const emReaisBR = (valor: number): string => valor.toFixed(2).replace('.', ',')

/**
 * Uma linha por pedido, com as colunas que um contador pede.
 *
 * Frete numa coluna separada de propósito: é o que ele vai querer tirar da
 * receita, e deixar tudo somado obrigaria a abrir pedido por pedido.
 */
export const gerarCsvDoMes = (
  pedidos: PedidoParaRelatorio[],
  referencia: Date,
): string => {
  const cabecalho = [
    'Pedido',
    'Data',
    'Linha',
    'Produtos (R$)',
    'Desconto (R$)',
    'Frete repassado (R$)',
    'Total pago (R$)',
    'Peças',
  ]

  const linhas = pedidos
    .filter((p) => ehVenda(p) && mesmoMes(p.criadoEm, referencia))
    .sort((a, b) => Date.parse(a.criadoEm) - Date.parse(b.criadoEm))
    .map((p) => {
      const desconto = p.desconto ?? 0
      const pecas = p.itens.reduce((soma, i) => soma + i.quantidade, 0)

      return [
        p.id,
        new Date(p.criadoEm).toLocaleDateString('pt-BR'),
        p.linha === 'pedagogica' ? 'Pedagógica (digital)' : 'Personalizada',
        emReaisBR(p.subtotal),
        emReaisBR(desconto),
        emReaisBR(p.frete),
        emReaisBR(p.subtotal - desconto + p.frete),
        pecas,
      ]
        .map(escapar)
        .join(SEPARADOR)
    })

  return [cabecalho.join(SEPARADOR), ...linhas].join('\r\n')
}
