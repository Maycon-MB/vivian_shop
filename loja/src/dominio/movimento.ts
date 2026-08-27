/**
 * O que os números de visita querem dizer.
 *
 * Contar visita não serve para nada sozinho. O que decide se um anúncio
 * continua é a comparação: entraram cem pessoas e compraram duas, ou
 * entraram cem e não comprou ninguém. A primeira é uma loja que funciona
 * e precisa de mais gente; a segunda é uma loja que precisa de foto, preço
 * ou texto melhor, e onde pagar por mais gente é jogar dinheiro fora.
 */

export interface DiaDeMovimento {
  dia: string
  visitantes: number
  paginas: number
}

/**
 * Quantos de cada cem que entraram compraram.
 *
 * Devolve `null`, e não zero, quando ninguém entrou. São coisas
 * diferentes: zero por cento é "veio gente e não comprou", que é um
 * problema; sem visita é "ainda não sei", que não é problema nenhum e não
 * pode aparecer na tela como se fosse.
 */
export const taxaDeConversao = (
  visitantes: number,
  pedidos: number,
): number | null => {
  if (!visitantes || visitantes <= 0) return null
  return (pedidos / visitantes) * 100
}

/**
 * A taxa em palavra, do jeito que ela lê.
 *
 * Uma casa decimal. Duas dão falsa precisão num número que vem de uma
 * contagem aproximada, e ela tomaria decisão em cima de ruído.
 */
export const conversaoEmTexto = (taxa: number | null): string =>
  taxa === null ? 'ainda sem visita' : `${taxa.toFixed(1).replace('.', ',')}%`

/**
 * O que uma taxa de conversão está dizendo.
 *
 * Os cortes vêm do que se considera normal em loja pequena de artesanato:
 * abaixo de meio por cento a loja perde quem chega, e entre meio e dois
 * está no esperado. São referência de mercado, e não medida da loja dela:
 * quando houver três meses de número próprio, o certo é comparar com ela
 * mesma.
 */
export const leituraDaConversao = (taxa: number | null): string => {
  if (taxa === null) return 'Ainda não entrou gente suficiente para dizer.'
  if (taxa <= 0) return 'Entrou gente e ninguém comprou. O problema não é falta de visita.'
  if (taxa < 0.5) return 'Abaixo do normal. Vale olhar foto, preço e descrição antes de anunciar.'
  if (taxa < 2) return 'Dentro do normal para loja pequena.'
  return 'Acima do normal. Trazer mais gente tende a virar mais venda.'
}

/**
 * A soma do período.
 *
 * Existe porque a tela precisa de um número só no alto, e somar no meio do
 * desenho é onde erro de conta se esconde.
 */
export const totalDoPeriodo = (
  dias: DiaDeMovimento[],
): { visitantes: number; paginas: number } =>
  dias.reduce(
    (soma, dia) => ({
      visitantes: soma.visitantes + (Number(dia.visitantes) || 0),
      paginas: soma.paginas + (Number(dia.paginas) || 0),
    }),
    { visitantes: 0, paginas: 0 },
  )

/**
 * Quantas páginas cada visita abriu.
 *
 * Diz se quem chega olha a loja ou vai embora na primeira tela. Uma visita
 * por página é gente que entrou e saiu.
 */
export const paginasPorVisita = (
  visitantes: number,
  paginas: number,
): number | null => {
  if (!visitantes || visitantes <= 0) return null
  return paginas / visitantes
}

const NOME_DA_ORIGEM: Record<string, string> = {
  direto: 'Digitou o endereço',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  google: 'Busca do Google',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  anuncio: 'Anúncio pago',
  outro: 'Outros sites',
}

/** A origem com o nome que ela reconhece, e não a palavra do banco. */
export const nomeDaOrigem = (origem: string): string =>
  NOME_DA_ORIGEM[origem] ?? 'Outros sites'

/**
 * Quantos pedidos caíram na mesma janela de dias das visitas.
 *
 * Precisa ser a mesma janela, senão a conta compara visitas de sete dias
 * com pedidos de um mês e a taxa sai errada por um fator de quatro. Erro
 * silencioso, e do tipo que faz ela desligar um anúncio que estava dando
 * certo.
 */
export const pedidosNosUltimosDias = (
  pedidos: { criadoEm?: string }[],
  dias: number,
  hoje: Date = new Date(),
): number => {
  const corte = new Date(hoje)
  corte.setDate(corte.getDate() - dias)

  return pedidos.filter((pedido) => {
    if (!pedido?.criadoEm) return false
    const quando = new Date(pedido.criadoEm)
    return !Number.isNaN(quando.getTime()) && quando >= corte
  }).length
}
