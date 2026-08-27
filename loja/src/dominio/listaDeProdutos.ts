/**
 * A lista de produtos do painel: procurar e agrupar.
 *
 * São 343 produtos, e esse número muda o que a tela precisa ser. Com
 * vinte, rolar resolve. Com 343, rolar é procurar nome em lista
 * telefônica — e ela vem do Elo7, onde a tela era tabela com busca.
 *
 * O agrupamento por tipo existe por outra razão, e é a que mais economiza
 * tempo dela: são 58 Lousas Mágicas iguais, variando só o tema impresso.
 * Publicar uma a uma são 58 toques no celular; por tipo, é um.
 */

export interface ProdutoDaLista {
  id: string
  slug: string
  nome: string
  preco: number
  ativo: boolean
  /** No topo da vitrine, por escolha dela. */
  fixado?: boolean
  tema?: string
  imagem_mini?: string | null
}

/** Sem acento, sem caixa, sem pontuação: o jeito que ela digita com pressa. */
const comparavel = (texto: string): string =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Procura por nome, tema ou endereço.
 *
 * O texto do produto é achatado antes de comparar, o que resolve de
 * graça o "P.e.p.p.a P.i.g": sem pontuação, ele vira "p e p p a p i g",
 * e a busca por "peppa" precisa achar isso. Por isso os espaços do termo
 * também somem na comparação.
 */
export const buscar = <T extends ProdutoDaLista>(produtos: T[], termo: string): T[] => {
  const procurado = comparavel(termo).replace(/\s+/g, '')
  if (!procurado) return produtos

  return produtos.filter((produto) => {
    const alvo = comparavel(`${produto.nome} ${produto.tema ?? ''} ${produto.slug}`).replace(
      /\s+/g,
      '',
    )

    return alvo.includes(procurado)
  })
}

export interface GrupoDeTipo<T> {
  tipo: string
  produtos: T[]
  publicados: number
}

/**
 * Agrupa pelo tipo, que é o pedaço do nome antes do hífen.
 *
 * "Lousa Mágica - Frozen" e "Lousa Mágica - Mickey" são o mesmo produto
 * com arte diferente: mesmo preço, mesmo peso, mesma caixa. O que muda é
 * o tema, e é assim que a cliente dela procura.
 */
export const agruparPorTipo = <T extends ProdutoDaLista>(produtos: T[]): GrupoDeTipo<T>[] => {
  const grupos = new Map<string, T[]>()

  for (const produto of produtos) {
    const tipo = produto.nome.split(' - ')[0].trim()
    grupos.set(tipo, [...(grupos.get(tipo) ?? []), produto])
  }

  return [...grupos]
    .map(([tipo, doGrupo]) => ({
      tipo,
      produtos: doGrupo,
      publicados: doGrupo.filter((p) => p.ativo).length,
    }))
    // Maior grupo primeiro: é onde publicar de uma vez economiza mais.
    .sort((a, b) => b.produtos.length - a.produtos.length)
}

export const resumo = (produtos: ProdutoDaLista[]) => {
  const publicados = produtos.filter((p) => p.ativo).length

  return {
    total: produtos.length,
    publicados,
    rascunhos: produtos.length - publicados,
  }
}
