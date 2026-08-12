/** Valores em reais, do jeito que se lê no Brasil. */
export const moeda = (valor: number): string =>
  valor
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
    // O Intl separa "R$" do valor com espaço não-quebrável (U+00A0).
    // Trocamos por espaço normal para bater com o que se digita e se testa.
    .replace(' ', ' ')
