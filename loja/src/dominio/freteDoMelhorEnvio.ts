import type { ConsultaDeFrete, OpcaoDeFrete } from '@/servicos/contratos'

/**
 * A tradução entre o pacote da Vivian e a API do Melhor Envio.
 *
 * Fica no domínio, e não dentro da função que chama a API, porque é a
 * parte que erra silencioso: peso na unidade errada não dá erro nenhum,
 * dá um frete absurdo na tela de quem ia comprar. Aqui dá para conferir
 * sem subir nada e sem gastar chamada.
 *
 * ── O que esta camada não faz ──────────────────────────────────────────
 *
 * Não fala com a internet. A chamada mora numa função do Supabase, porque
 * o segredo do aplicativo não pode encostar no navegador: quem tem ele
 * cota, compra etiqueta e gasta o saldo da conta dela.
 */

/** O que o Melhor Envio espera receber. */
export interface PacoteDoMelhorEnvio {
  from: { postal_code: string }
  to: { postal_code: string }
  products: {
    id: string
    width: number
    height: number
    length: number
    weight: number
    insurance_value: number
    quantity: number
  }[]
}

/* Eles recusam o traço do CEP. É um caractere, e derruba a integração
   inteira com uma mensagem que não diz isso. */
const soNumero = (cep: string): string => String(cep ?? '').replace(/\D/g, '')

export const pacoteParaMelhorEnvio = (
  consulta: ConsultaDeFrete,
  cepDeOrigem: string,
): PacoteDoMelhorEnvio => ({
  from: { postal_code: soNumero(cepDeOrigem) },
  to: { postal_code: soNumero(consulta.cepDestino) },
  products: [
    {
      /* Um produto só, que é o pacote fechado. A loja já somou as peças em
         `pacoteDoPedido`: mandar item por item faria eles cotarem dez
         caixas em vez de uma, e o frete sairia dez vezes maior. */
      id: 'pacote',
      width: consulta.largCm,
      height: consulta.altCm,
      length: consulta.compCm,
      /* Quilo, e não grama. Mandando 1150 onde se espera 1,15, a cotação
         sai como se o pacote tivesse mais de uma tonelada. */
      weight: consulta.pesoG / 1000,
      /* Zero de propósito: seguro encarece o frete e ela não segura pedido
         hoje. Quando decidir segurar, é aqui que o valor do carrinho
         entra, e a conta passa a depender do que a cliente comprou. */
      insurance_value: 0,
      quantity: 1,
    },
  ],
})

/** Uma linha da resposta deles. */
interface LinhaDaResposta {
  id?: number | string
  name?: string
  price?: string | number
  delivery_time?: number
  company?: { id?: number | string; name?: string }
  error?: string
}

/**
 * O que a cliente vê, a partir do que eles responderam.
 *
 * Duas armadilhas aqui, e as duas aparecem na tela de quem está comprando:
 *
 * **Eles respondem 200 com um `error` dentro do item** quando a
 * transportadora não atende aquele CEP. Passando isso adiante, a cliente
 * vê "Correios: R$ undefined" na hora de escolher o frete.
 *
 * **O preço vem como texto.** Somado ao subtotal sem converter, o total
 * concatena em vez de somar, e ela paga um número que ninguém escreveu.
 */
export const opcoesDoMelhorEnvio = (resposta: LinhaDaResposta[]): OpcaoDeFrete[] => {
  if (!Array.isArray(resposta)) return []

  return resposta
    .filter((linha) => !linha?.error)
    .map((linha) => ({
      id: String(linha.id ?? ''),
      transportadora: linha.company?.name ?? '',
      servico: linha.name ?? '',
      valor: Number(linha.price),
      prazoDias: Number(linha.delivery_time ?? 0),
    }))
    .filter((opcao) => Number.isFinite(opcao.valor) && opcao.valor > 0)
    /* Mais barato primeiro: é a ordem em que a cliente decide, e a que
       segura a venda. */
    .sort((a, b) => a.valor - b.valor)
}
