import { ehDigital } from './linhas'
import type { Produto } from './produto'

/**
 * Regras do carrinho.
 *
 * Módulo puro: sem React, sem banco, sem fetch. É o que permite testar as
 * regras de venda em milissegundos e reaproveitá-las no painel sem
 * arrastar a loja junto.
 *
 * A regra que mais surpreende quem lê: uma compra é de uma linha só. Veio
 * da cliente, e o motivo é bom — a declaração de conteúdo precisa bater
 * com o que está dentro da caixa, e um arquivo digital declarado seria um
 * item que não está na embalagem.
 */

export interface ItemCarrinho extends Produto {
  quantidade: number
}

export type Permissao = { ok: true } | { ok: false; motivo: string }

/** Digital é arquivo: uma unidade. Físico começa no mínimo do produto. */
export const quantidadeMinima = (produto: Produto): number =>
  ehDigital(produto.linha) ? 1 : produto.minimo

/** Arquivo digital não se compra em dobro. */
export const permiteVariasUnidades = (produto: Produto): boolean =>
  !ehDigital(produto.linha)

export const podeAdicionar = (carrinho: ItemCarrinho[], produto: Produto): Permissao => {
  if (carrinho.length === 0) return { ok: true }

  const carrinhoDigital = ehDigital(carrinho[0].linha)
  const produtoDigital = ehDigital(produto.linha)

  if (carrinhoDigital === produtoDigital) return { ok: true }

  return {
    ok: false,
    motivo: carrinhoDigital
      ? 'Material digital e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para os personalizados.'
      : 'Material digital e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para o material digital.',
  }
}

/**
 * Devolve um carrinho novo. Se o produto não pode entrar, devolve o
 * carrinho como estava — quem chama consulta `podeAdicionar` antes, para
 * mostrar o motivo ao comprador em vez de falhar em silêncio.
 */
export const adicionar = (carrinho: ItemCarrinho[], produto: Produto): ItemCarrinho[] => {
  if (!podeAdicionar(carrinho, produto).ok) return carrinho

  const existente = carrinho.find((item) => item.id === produto.id)

  if (!existente) {
    return [...carrinho, { ...produto, quantidade: quantidadeMinima(produto) }]
  }

  if (!permiteVariasUnidades(produto)) return carrinho

  return carrinho.map((item) =>
    item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
  )
}

/** Abaixo do mínimo do produto, a linha sai do carrinho. */
export const alterarQuantidade = (
  carrinho: ItemCarrinho[],
  produtoId: string,
  quantidade: number
): ItemCarrinho[] =>
  carrinho.flatMap((item) => {
    if (item.id !== produtoId) return [item]
    if (quantidade < quantidadeMinima(item)) return []
    return [{ ...item, quantidade }]
  })

export const remover = (carrinho: ItemCarrinho[], produtoId: string): ItemCarrinho[] =>
  carrinho.filter((item) => item.id !== produtoId)

export const subtotalItem = (item: ItemCarrinho): number => item.preco * item.quantidade

export const totalCarrinho = (carrinho: ItemCarrinho[]): number =>
  carrinho.reduce((soma, item) => soma + subtotalItem(item), 0)

/** Unidades no carrinho, para o contador do cabeçalho. */
export const totalUnidades = (carrinho: ItemCarrinho[]): number =>
  carrinho.reduce((soma, item) => soma + item.quantidade, 0)
