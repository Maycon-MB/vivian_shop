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

/** De onde saem os envios. O endereço completo mora no painel, não aqui. */
export const CEP_ORIGEM = '[dado pessoal removido]'

/** Transportadoras que a cliente já usava no Elo7. */
export const TRANSPORTADORAS = ['Correios', 'Jadlog']

export const isDigital = (categoria) => categoria === PEDAGOGICA

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
