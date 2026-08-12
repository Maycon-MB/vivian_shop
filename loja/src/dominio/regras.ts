/**
 * Números que a cliente definiu e que valem para toda a linha.
 *
 * Ficam separados das funções porque são valores de negócio, não lógica:
 * mudam quando ela mudar de ideia, e mudar aqui muda a loja inteira.
 *
 * O produto guarda o próprio mínimo e prazo — estes são só o padrão de
 * quem ainda não definiu o seu.
 */

/** Confirmado pela cliente: não dá para comprar 1 caneca, o mínimo são 10. */
export const MINIMO_PERSONALIZADO = 10

/** Dias úteis de produção, contados da confirmação do pagamento. */
export const PRAZO_PRODUCAO = 5
