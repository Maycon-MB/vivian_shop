'use client'

import { pedidos as repositorio } from '@/servicos'
import { LINHA_PEDAGOGICA } from '@/dominio/linhas'

/**
 * A ponte entre o pedido que a loja cria e o pedido que o painel mostra.
 *
 * As duas formas são diferentes de propósito. O pedido guardado é um
 * registro: tem endereço completo, meio de pagamento, token de download. O
 * pedido do painel é uma tarefa: tem "o que fazer", "para quando" e "de
 * quem". Traduzir aqui evita que a tela precise saber das duas.
 *
 * Quando o banco entrar, este arquivo continua igual — ele fala com o
 * contrato do repositório, não com o `localStorage`.
 */

/** Dias úteis entre hoje e a data prometida. Negativo quer dizer atrasado. */
const diasUteisAte = (dataISO) => {
  if (!dataISO) return undefined

  const alvo = new Date(`${dataISO}T12:00:00`)
  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)

  if (Number.isNaN(alvo.getTime())) return undefined

  const adiante = alvo >= hoje
  const inicio = adiante ? hoje : alvo
  const fim = adiante ? alvo : hoje

  let dias = 0
  const cursor = new Date(inicio)
  while (cursor < fim) {
    cursor.setDate(cursor.getDate() + 1)
    const diaDaSemana = cursor.getDay()
    if (diaDaSemana !== 0 && diaDaSemana !== 6) dias += 1
  }

  return adiante ? dias : -dias
}

/** "hoje, 09:12" / "há 3 dias" — como a Vivian falaria, não data cheia. */
const quandoFoi = (criadoEm) => {
  const criado = new Date(criadoEm)
  if (Number.isNaN(criado.getTime())) return 'agora'

  const horas = (Date.now() - criado.getTime()) / 36e5

  if (horas < 24) {
    const relogio = criado.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `hoje, ${relogio}`
  }

  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}

/**
 * O estado de trabalho vem do que já aconteceu com o pedido, e não é um
 * campo à parte: material digital sai sozinho ao aprovar o pagamento;
 * pedido com rastreio já saiu daqui; o resto está na mão dela.
 */
const estadoDe = (pedido) => {
  if (pedido.estadoPagamento === 'aguardando') return 'aguardando'
  if (pedido.estadoPagamento === 'recusado' || pedido.estadoPagamento === 'estornado')
    return 'cancelado'
  if (pedido.linha === LINHA_PEDAGOGICA) return 'digital'
  if (pedido.rastreio) return 'enviado'
  return 'producao'
}

const cidadeDe = (pedido) =>
  pedido.endereco ? `${pedido.endereco.cidade}, ${pedido.endereco.uf}` : 'entrega digital'

export const paraOPainel = (pedido) => ({
  id: pedido.numero,
  estado: estadoDe(pedido),
  linha: pedido.linha === LINHA_PEDAGOGICA ? 'pedagogica' : 'personalizada',
  cliente: pedido.comprador.nome,
  whatsapp: pedido.comprador.whatsapp,
  itens: pedido.itens.map((item) => ({
    nome: item.nome,
    quantidade: item.quantidade,
    preco: item.precoUnitario,
  })),
  subtotal: pedido.subtotal,
  frete: pedido.frete,
  quando: quandoFoi(pedido.criadoEm),
  /* A data crua vai junto com o texto: a tela mostra "há 3 dias", mas o
     relatório precisa saber em que mês a venda caiu. */
  criadoEmISO: pedido.criadoEm,
  desconto: pedido.desconto,
  prazoDias: diasUteisAte(pedido.prometidoPara),
  cidade: cidadeDe(pedido),
  transportadora: pedido.transportadora,
  /* Marca o que veio de uma compra feita agora na loja, para a tela poder
     separar do que é exemplo. Sem isso, a Vivian não saberia dizer qual
     pedido é dela e qual é ilustração — e essa confusão é justamente o que
     faz alguém desconfiar do painel inteiro. */
  daLoja: true,
})

/** Os pedidos criados por compras feitas nesta demonstração, do mais novo ao mais antigo. */
export const carregarPedidosDaLoja = async () => {
  try {
    const guardados = await repositorio.listar()
    return guardados.map(paraOPainel)
  } catch {
    // O painel tem pedidos de exemplo para mostrar de qualquer jeito: uma
    // falha ao ler não deve deixar a tela em branco.
    return []
  }
}
