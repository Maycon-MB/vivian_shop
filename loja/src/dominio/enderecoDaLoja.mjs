/**
 * O endereço absoluto da loja, sem barra no fim, conforme DOMINIO_PRONTO.
 *
 * O `publicar.mjs` e a página de produto leem daqui: a lista do Google e os
 * dados da página precisam apontar para o mesmo endereço.
 *
 * @param {{ DOMINIO_PRONTO?: string }} [ambiente]
 * @returns {string}
 */
export const enderecoDaLoja = (ambiente = process.env) =>
  ambiente.DOMINIO_PRONTO === 'true'
    ? 'https://feitoparavocepapelaria.com.br'
    : 'https://maycon-mb.github.io/vivian_shop'
