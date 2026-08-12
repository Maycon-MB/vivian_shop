/**
 * As duas linhas de venda.
 *
 * Os nomes são os que a cliente usa e os que aparecem na loja — não são
 * códigos internos. Mudá-los muda o que o comprador lê.
 */

export const LINHA_PERSONALIZADA = 'Papelaria personalizada'
export const LINHA_PEDAGOGICA = 'Papelaria pedagógica'

export type Linha = typeof LINHA_PERSONALIZADA | typeof LINHA_PEDAGOGICA

export const LINHAS: Linha[] = [LINHA_PERSONALIZADA, LINHA_PEDAGOGICA]

/** Linha pedagógica é arquivo: sem frete, sem produção, sem mínimo. */
export const ehDigital = (linha: Linha): boolean => linha === LINHA_PEDAGOGICA
