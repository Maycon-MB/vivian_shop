/**
 * Ponte entre as telas trazidas do protótipo e o domínio testado.
 *
 * As telas foram escritas quando as regras de venda viviam num arquivo
 * solto. Agora elas vivem em `src/dominio`, em TypeScript e com testes —
 * e as telas passam a consumir de lá em vez de ter a própria cópia.
 *
 * Este arquivo existe para as telas não precisarem ser reescritas: mantém
 * os nomes que elas já usam, apontando para a implementação de verdade.
 * Conforme cada tela for revisada, ela passa a importar direto do domínio
 * e este arquivo encolhe.
 */

export {
  LINHA_PERSONALIZADA as PERSONALIZADA,
  LINHA_PEDAGOGICA as PEDAGOGICA,
  ehDigital as isDigital,
} from './dominio/linhas'

export { podeAdicionar } from './dominio/carrinho'

/**
 * Dívida conhecida: o domínio chama o campo de `preco` e as telas vindas do
 * protótipo chamam de `price`. Enquanto os dois nomes convivem, as contas
 * aceitam qualquer um dos dois — foi essa diferença que fez o total do
 * checkout aparecer como "R$ NaN" para quem ia pagar.
 *
 * Some quando as telas passarem a usar o tipo `Produto` do domínio.
 */
const precoDe = (item) => Number(item.preco ?? item.price) || 0

export const subtotalItem = (item) => precoDe(item) * (item.quantidade || 0)

export const totalCarrinho = (carrinho) =>
  carrinho.reduce((soma, item) => soma + subtotalItem(item), 0)

import { MINIMO_PERSONALIZADO as MINIMO, PRAZO_PRODUCAO as PRAZO } from './dominio/regras'

export const MINIMO_PERSONALIZADO = MINIMO
export const PRAZO_PRODUCAO = PRAZO

/**
 * As telas antigas chamam estas duas com a categoria (texto), não com o
 * produto inteiro. O domínio trabalha com o produto, porque o mínimo é por
 * produto e não por linha — então aqui montamos um produto mínimo só para
 * a consulta.
 */
import { ehDigital } from './dominio/linhas'

export const quantidadeMinima = (categoria) => (ehDigital(categoria) ? 1 : MINIMO)

export const permiteVariasUnidades = (categoria) => !ehDigital(categoria)

/** Mesma regra do domínio, na assinatura que as telas antigas esperam. */
export const podeAdicionarAoCarrinho = (carrinho, produto) => {
  if (carrinho.length === 0) return { ok: true }

  const carrinhoDigital = ehDigital(carrinho[0].category)
  const produtoDigital = ehDigital(produto.category)

  if (carrinhoDigital === produtoDigital) return { ok: true }

  return {
    ok: false,
    motivo: carrinhoDigital
      ? 'Materiais digitais e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para os personalizados.'
      : 'Materiais digitais e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para o material digital.',
  }
}

/** De onde saem os envios. O CEP vem de variável de ambiente. */
export const CEP_ORIGEM = process.env.NEXT_PUBLIC_CEP_ORIGEM || ''

/** Transportadoras que a cliente já usava no Elo7. */
export const TRANSPORTADORAS = ['Correios', 'Jadlog']
