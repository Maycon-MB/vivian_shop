/**
 * Regras de catálogo confirmadas pela cliente em 2026-08-10.
 *
 * Ficam num módulo próprio para que loja, painel e a página "Como funciona"
 * leiam os mesmos valores — e para evitar o ciclo de importação que existiria
 * se cada tela puxasse do componente vizinho.
 */

/** Linha física: sob encomenda, com mínimo de peças e prazo de produção. */
export const PERSONALIZADA = 'Papelaria personalizada'

/** Linha digital: atividades e jogos, entregues por e-mail e WhatsApp. */
export const PEDAGOGICA = 'Papelaria pedagógica'

/**
 * Pedido mínimo da linha personalizada.
 *
 * A cliente ainda vai dizer se o mínimo vale por produto ou por pedido.
 * Até lá vale por produto, que é a leitura mais restritiva — afrouxar
 * depois não quebra pedido nenhum; apertar quebraria.
 */
export const MINIMO_PERSONALIZADO = 10

/** Dias úteis de produção, contados da confirmação do pagamento. */
export const PRAZO_PRODUCAO = 5

/**
 * CEP de origem dos envios, usado para cotar frete.
 *
 * Fica em variável de ambiente e não no código: este repositório é
 * público, e o endereço de origem é a casa da cliente. O endereço
 * completo nunca entra aqui — mora no banco de dados do painel.
 *
 * Definir em `.env.local` (ver .env.example). O guard existe porque
 * `import.meta.env` não existe quando os testes rodam no Node.
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

export const CEP_ORIGEM = env.VITE_CEP_ORIGEM || ''

/** Transportadoras que a cliente já usava no Elo7. */
export const TRANSPORTADORAS = ['Correios', 'Jadlog']

export const isDigital = (categoria) => categoria === PEDAGOGICA

/**
 * Quantidade mínima de um produto no carrinho.
 *
 * Confirmado pela cliente: o mínimo vale por produto, não por pedido —
 * não dá para comprar 1 caneca, o mínimo são 10 canecas. Quem quiser dois
 * modelos leva 10 de cada.
 *
 * Material digital é um arquivo: a quantidade é sempre 1.
 */
export const quantidadeMinima = (categoria) =>
  isDigital(categoria) ? 1 : MINIMO_PERSONALIZADO

/** Arquivo digital não se compra em dobro. */
export const permiteVariasUnidades = (categoria) => !isDigital(categoria)

/** Subtotal de uma linha do carrinho. */
export const subtotalItem = (item) => item.price * item.quantidade

/** Total do carrinho, já com as quantidades. */
export const totalCarrinho = (carrinho) =>
  carrinho.reduce((soma, item) => soma + subtotalItem(item), 0)

/**
 * Uma compra é só de uma linha: ou digital, ou personalizada.
 *
 * Decisão da cliente, por um motivo correto: a declaração de conteúdo
 * precisa bater com o que está dentro da caixa. Um arquivo digital listado
 * numa declaração de encomenda física é inconsistência com os Correios,
 * porque o item declarado não está na embalagem.
 *
 * Como efeito colateral, o checkout fica bem mais simples: frete é
 * tudo-ou-nada, o pedido tem um prazo só, e não existe pedido meio
 * entregue.
 */
export const podeAdicionarAoCarrinho = (carrinho, produto) => {
  if (carrinho.length === 0) return { ok: true }

  const carrinhoDigital = isDigital(carrinho[0].category)
  const produtoDigital = isDigital(produto.category)

  if (carrinhoDigital === produtoDigital) return { ok: true }

  return {
    ok: false,
    motivo: carrinhoDigital
      ? 'Materiais digitais e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para os personalizados.'
      : 'Materiais digitais e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para o material digital.',
  }
}
