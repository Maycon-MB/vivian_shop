/** As etapas que o navegador conta, na ordem em que a cliente anda pela loja. */
export const ETAPAS = ['produto', 'carrinho', 'checkout', 'pagamento'] as const

export type Etapa = (typeof ETAPAS)[number]

export const eEtapa = (valor: string): valor is Etapa =>
  (ETAPAS as readonly string[]).includes(valor)

export interface PessoasNaEtapa {
  etapa: string
  pessoas: number
}

export interface PassoDoFunil {
  rotulo: string
  pessoas: number
  /** Porcentagem de quem entrou na loja; `null` enquanto ninguém entrou. */
  deCadaCem: number | null
}

/* "pago" vem dos pedidos aprovados, e não do navegador: só o servidor sabe que o dinheiro entrou. */
const PASSOS: { chave: string; rotulo: string }[] = [
  { chave: 'produto', rotulo: 'Abriram um produto' },
  { chave: 'carrinho', rotulo: 'Puseram no carrinho' },
  { chave: 'checkout', rotulo: 'Foram finalizar a compra' },
  { chave: 'pagamento', rotulo: 'Chegaram ao pagamento' },
  { chave: 'pago', rotulo: 'Pagaram' },
]

/**
 * As seis etapas do painel, de quem entrou até quem pagou.
 *
 * `entraram` é o total de pessoas do período (o mesmo número do cartão de visitas).
 * Etapa sem registro vem com zero; etapa desconhecida é ignorada.
 */
export const passosDoFunil = (entraram: number, porEtapa: PessoasNaEtapa[]): PassoDoFunil[] => {
  const base = Number(entraram) || 0
  const pessoasDa = (chave: string) =>
    porEtapa
      .filter((linha) => linha.etapa === chave)
      .reduce((soma, linha) => soma + (Number(linha.pessoas) || 0), 0)

  const passos = [
    { rotulo: 'Entraram na loja', pessoas: base },
    ...PASSOS.map(({ chave, rotulo }) => ({ rotulo, pessoas: pessoasDa(chave) })),
  ]

  return passos.map((passo) => ({
    ...passo,
    deCadaCem: base > 0 ? (passo.pessoas / base) * 100 : null,
  }))
}

export interface Perda {
  de: string
  para: string
  /** De cada 100 que chegaram em `de`, quantos não chegaram em `para`. */
  param: number
}

/**
 * A passagem em que a loja perde mais gente, ou `null` sem dado para dizer.
 *
 * Passagem com mais gente que a anterior fica de fora: quem põe no carrinho pela
 * vitrine pula a página do produto.
 */
export const maiorPerda = (passos: PassoDoFunil[]): Perda | null => {
  let pior: Perda | null = null

  for (let i = 1; i < passos.length; i++) {
    const anterior = passos[i - 1]
    const atual = passos[i]
    if (anterior.pessoas <= 0 || atual.pessoas >= anterior.pessoas) continue

    const param = Math.round((1 - atual.pessoas / anterior.pessoas) * 100)
    if (!pior || param > pior.param) {
      pior = { de: anterior.rotulo, para: atual.rotulo, param }
    }
  }

  return pior
}
