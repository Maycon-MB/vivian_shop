/**
 * Onde os pedidos ficam guardados enquanto não existe banco.
 *
 * A loja precisa funcionar de ponta a ponta hoje — comprar, confirmar,
 * aparecer no painel da Vivian — e ainda não há Supabase contratado. Esta
 * implementação cumpre o contrato `RepositorioDePedidos` usando o
 * `localStorage` do navegador: nada sai da máquina de quem está vendo.
 *
 * É simulação, e por isso tem limites honestos: o pedido vive no navegador
 * onde foi feito, e quem abrir a loja de outro aparelho não vê nada. Serve
 * para demonstrar, não para vender de verdade.
 *
 * Quando o banco entrar, entra como outro objeto que implementa o mesmo
 * contrato — as telas importam a interface, não este arquivo, então nenhuma
 * delas muda. O que muda aqui dentro: a numeração passa a ser uma sequência
 * do banco (hoje é um contador local) e `listar` passa a ser uma consulta.
 */

import type {
  EstadoPagamento,
  Pedido,
  RepositorioDePedidos,
} from './contratos'

const CHAVE_PEDIDOS = 'feito-para-voce:pedidos'
const CHAVE_CONTADOR = 'feito-para-voce:ultimo-numero'

/**
 * O site é exportado como estático: este módulo é avaliado no build, onde
 * não existe `window`. E mesmo no navegador o armazenamento pode estar
 * bloqueado (aba anônima, cookies de terceiros travados). Nos dois casos a
 * loja segue de pé com lista vazia — não vale derrubar a página por isso.
 */
const armazenamento = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

/** Conteúdo corrompido ou de uma versão antiga é descartado, não propagado. */
const lerPedidos = (): Pedido[] => {
  const guarda = armazenamento()
  if (!guarda) return []

  try {
    const bruto = guarda.getItem(CHAVE_PEDIDOS)
    if (!bruto) return []

    const conteudo: unknown = JSON.parse(bruto)
    if (!Array.isArray(conteudo)) return []

    return conteudo.filter(
      (item): item is Pedido =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Pedido).id === 'string',
    )
  } catch {
    return []
  }
}

const gravarPedidos = (pedidos: Pedido[]): void => {
  const guarda = armazenamento()
  if (!guarda) return

  try {
    guarda.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch {
    // Cota estourada ou escrita negada: a compra na tela continua válida,
    // só não sobrevive ao recarregar. Silenciar aqui é melhor que quebrar
    // o checkout na frente de quem está comprando.
  }
}

/**
 * Número de pedido curto, sequencial e legível: "0001", "0002".
 *
 * Não é enfeite. A Vivian atende no WhatsApp e a cliente vai digitar esse
 * número na conversa — "oi, é sobre o pedido 0007". Um UUID não se dita nem
 * se lê em voz alta. O `id` continua sendo o identificador técnico; o
 * `numero` é o que as duas pessoas usam para falar do mesmo pedido.
 *
 * O contador fica numa chave própria, e não é calculado a partir da lista:
 * assim um pedido apagado nunca faz o número seguinte repetir um antigo.
 */
const proximoNumero = (): string => {
  const guarda = armazenamento()
  if (!guarda) return '0001'

  let ultimo = 0
  try {
    const bruto = guarda.getItem(CHAVE_CONTADOR)
    const lido = bruto === null ? Number.NaN : Number.parseInt(bruto, 10)
    if (Number.isFinite(lido) && lido > 0) ultimo = lido
  } catch {
    ultimo = 0
  }

  const atual = ultimo + 1
  try {
    guarda.setItem(CHAVE_CONTADOR, String(atual))
  } catch {
    // Sem persistir o contador o número pode repetir na próxima sessão.
    // Ainda assim é melhor devolver um número do que impedir a compra.
  }

  // Quatro dígitos cobrem o volume de uma artesã com folga; passando disso,
  // o número cresce em vez de truncar.
  return String(atual).padStart(4, '0')
}

/**
 * O identificador técnico, derivado do número já atribuído.
 *
 * Precisa existir aqui porque quem chama entrega o pedido com `id` vazio —
 * e dois pedidos com `id` vazio se reconheceriam como o mesmo, fazendo a
 * segunda compra apagar a primeira. Quem cria a identidade é quem guarda.
 */
const identificadorPara = (numero: string): string => `pedido-${numero}`

export const pedidosLocais: RepositorioDePedidos = {
  async salvar(pedido: Pedido): Promise<Pedido> {
    // O número é atribuído aqui, e não por quem chama: é o repositório que
    // sabe qual foi o último. Um número já preenchido é respeitado, para
    // reescrever um pedido existente não trocar o número que a cliente tem.
    const numero = pedido.numero || proximoNumero()
    const numerado: Pedido = {
      ...pedido,
      numero,
      id: pedido.id || identificadorPara(numero),
    }

    const pedidos = lerPedidos()
    const posicao = pedidos.findIndex((existente) => existente.id === numerado.id)

    if (posicao >= 0) pedidos[posicao] = numerado
    else pedidos.push(numerado)

    gravarPedidos(pedidos)
    return numerado
  },

  async listar(): Promise<Pedido[]> {
    // Mais recentes primeiro: o painel da Vivian abre no que chegou agora,
    // que é o que precisa de ação. A ordenação é por data de criação, e não
    // pela ordem de gravação, porque um pedido reescrito volta ao fim.
    return lerPedidos().sort(
      (a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm),
    )
  },

  async buscar(id: string): Promise<Pedido | null> {
    return lerPedidos().find((pedido) => pedido.id === id) ?? null
  },

  async atualizarEstado(id: string, estado: EstadoPagamento): Promise<void> {
    const pedidos = lerPedidos()
    const posicao = pedidos.findIndex((pedido) => pedido.id === id)
    if (posicao < 0) return

    pedidos[posicao] = { ...pedidos[posicao], estadoPagamento: estado }
    gravarPedidos(pedidos)
  },
}

/**
 * Zera a demonstração: apaga os pedidos e devolve a numeração ao "0001".
 * O contador vai junto de propósito — depois de limpar tudo, ver o próximo
 * pedido nascer como 0001 é o comportamento que faz sentido numa
 * demonstração e num teste. Fora daí, ninguém chama isto.
 */
export const limparPedidos = (): void => {
  const guarda = armazenamento()
  if (!guarda) return

  try {
    guarda.removeItem(CHAVE_PEDIDOS)
    guarda.removeItem(CHAVE_CONTADOR)
  } catch {
    // Sem armazenamento não há o que limpar.
  }
}
