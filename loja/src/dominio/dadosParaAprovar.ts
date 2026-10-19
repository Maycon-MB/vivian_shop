/**
 * O que vai junto da cobrança para o antifraude do Mercado Pago.
 *
 * Lido pelos testes e pela função `cobrar`, em Deno: por isso não importa
 * nada. Só usa o que o pedido já tem gravado; nenhum dado novo da cliente.
 *
 * Campos da medição de qualidade deles: `additional_info.items`,
 * `payer.first_name` e `last_name`, `statement_descriptor`.
 */

export interface PedidoParaAprovar {
  numero: string
  linha: 'personalizada' | 'pedagogica'
  comprador_nome: string
}

export interface ItemParaAprovar {
  produto_id: string | null
  nome: string
  preco_unitario: number | string
  quantidade: number
  produtos?: { descricao?: string | null } | null
}

/* Da lista pública de categorias do Mercado Pago (`/item_categories`).
   O pedagógico é PDF entregue pelo Drive, que é "virtual_goods" lá. */
const CATEGORIA: Record<PedidoParaAprovar['linha'], string> = {
  personalizada: 'others',
  pedagogica: 'virtual_goods',
}

const DESCRICAO_MAXIMA = 256

export const nomeESobrenome = (
  nome: string,
): { first_name: string; last_name?: string } => {
  const [primeiro, ...resto] = nome.trim().split(/\s+/)
  return resto.length ? { first_name: primeiro, last_name: resto.join(' ') } : { first_name: primeiro }
}

/* O id vem do navegador e vira cabeçalho HTTP: só passa o formato que o
   SDK gera, para quebra de linha nenhuma virar cabeçalho a mais. */
const PARECE_DISPOSITIVO = /^[A-Za-z0-9._:-]{1,200}$/

export const dispositivoDaCompra = (id: unknown): string | undefined =>
  typeof id === 'string' && PARECE_DISPOSITIVO.test(id) ? id : undefined

/* Sem acento e curto porque o texto passa pela bandeira do cartão, e
   texto recusado ali derruba a cobrança inteira. */
const FATURA_ACEITA = /^[A-Z0-9 ]{1,13}$/

export const descricaoNaFatura = (texto: string | undefined): string | undefined => {
  const limpo = texto?.trim().toUpperCase()
  return limpo && FATURA_ACEITA.test(limpo) ? limpo : undefined
}

export const dadosParaAprovar = ({
  pedido,
  itens,
  fatura,
}: {
  pedido: PedidoParaAprovar
  itens: ItemParaAprovar[]
  fatura?: string
}) => {
  const comprador = nomeESobrenome(pedido.comprador_nome)
  const statement_descriptor = descricaoNaFatura(fatura)

  return {
    payer: comprador,
    additional_info: {
      payer: comprador,
      items: itens.map((item, indice) => ({
        // Produto apagado do catálogo zera `produto_id`; o número do pedido
        // mantém o item identificável na conciliação.
        id: item.produto_id ?? `${pedido.numero}-${indice + 1}`,
        title: item.nome,
        description: (item.produtos?.descricao?.trim() || item.nome).slice(0, DESCRICAO_MAXIMA),
        category_id: CATEGORIA[pedido.linha] ?? 'others',
        quantity: item.quantidade,
        unit_price: Number(item.preco_unitario),
      })),
    },
    ...(statement_descriptor ? { statement_descriptor } : {}),
  }
}
