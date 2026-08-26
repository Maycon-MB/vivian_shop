/**
 * O que a página inicial mostra, e o que fica no catálogo.
 *
 * Até 25/08 a home renderizava **os 342 produtos de uma vez**. Ninguém
 * rola 342 cartões, e loja nenhuma faz isso: o que a pessoa vê ao chegar
 * é uma seleção, e o catálogo inteiro fica a um toque, com filtro.
 *
 * A seleção não é aleatória nem "mais vendidos", que a loja ainda não
 * sabe medir. É por **variedade de tipo**: uma lousa, um álbum, uma
 * caneca, uma revista. Mostrar seis lousas iguais mudando só o personagem
 * faz a loja parecer ter um produto só, e ela tem 104 tipos diferentes.
 */

export interface ProdutoDaVitrine {
  id?: string
  slug: string
  name: string
  tema?: string
  mini?: string
  image?: string
  precoPromocional?: number
  price?: number
}

/** Quantos produtos a página inicial mostra. */
export const QUANTOS_NA_HOME = 12

/** O tipo é o pedaço do nome antes do hífen, como no painel dela. */
export const tipoDoProduto = (nome: string): string =>
  String(nome ?? '').split(' - ')[0].trim()

/**
 * A seleção da página inicial.
 *
 * Percorre os produtos pegando um de cada tipo antes de repetir qualquer
 * tipo. O resultado é uma vitrine variada mesmo quando um tipo domina o
 * catálogo, que é o caso dela: são 58 Lousas Mágicas.
 *
 * A ordem de entrada é respeitada dentro de cada rodada, e por isso a
 * seleção é estável: o mesmo catálogo dá sempre a mesma home, e a página
 * não muda sozinha a cada build.
 */
export const paraAHome = (
  produtos: ProdutoDaVitrine[],
  quantos = QUANTOS_NA_HOME,
): ProdutoDaVitrine[] => {
  const comFoto = produtos.filter((p) => p.mini || p.image)

  const porTipo = new Map<string, ProdutoDaVitrine[]>()
  for (const produto of comFoto) {
    const tipo = tipoDoProduto(produto.name)
    porTipo.set(tipo, [...(porTipo.get(tipo) ?? []), produto])
  }

  const escolhidos: ProdutoDaVitrine[] = []
  let rodada = 0

  // Uma volta por rodada, pegando o n-ésimo de cada tipo. Para quando
  // encher ou quando nenhuma fila tiver mais nada.
  while (escolhidos.length < quantos) {
    let achouAlgum = false

    for (const daquiTipo of porTipo.values()) {
      if (escolhidos.length >= quantos) break

      const produto = daquiTipo[rodada]
      if (!produto) continue

      escolhidos.push(produto)
      achouAlgum = true
    }

    if (!achouAlgum) break
    rodada++
  }

  return escolhidos
}

export interface FiltroDoCatalogo {
  tipo?: string
  tema?: string
  procura?: string
}

/** Sem acento e em minúscula, para "mágica" achar "magica". */
const comparavel = (texto: string): string =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/**
 * O catálogo filtrado.
 *
 * A procura olha o nome inteiro, que já traz o tipo e o tema: quem digita
 * "lousa peppa" está procurando as duas coisas, e não uma frase exata.
 * Por isso cada palavra é procurada em separado.
 */
export const filtrar = (
  produtos: ProdutoDaVitrine[],
  { tipo, tema, procura }: FiltroDoCatalogo,
): ProdutoDaVitrine[] => {
  let achados = produtos

  if (tipo) achados = achados.filter((p) => tipoDoProduto(p.name) === tipo)
  if (tema) achados = achados.filter((p) => p.tema === tema)

  const palavras = comparavel(procura ?? '').split(/\s+/).filter(Boolean)

  if (palavras.length) {
    achados = achados.filter((p) => {
      const nome = comparavel(p.name)
      return palavras.every((palavra) => nome.includes(palavra))
    })
  }

  return achados
}

export interface TipoNoCatalogo {
  tipo: string
  quantos: number
}

/** Os tipos que existem, com a conta, do maior para o menor. */
export const tiposDoCatalogo = (produtos: ProdutoDaVitrine[]): TipoNoCatalogo[] => {
  const contas = new Map<string, number>()

  for (const produto of produtos) {
    const tipo = tipoDoProduto(produto.name)
    contas.set(tipo, (contas.get(tipo) ?? 0) + 1)
  }

  return [...contas]
    .map(([tipo, quantos]) => ({ tipo, quantos }))
    .sort((a, b) => {
      if (b.quantos !== a.quantos) return b.quantos - a.quantos
      return a.tipo.localeCompare(b.tipo, 'pt-BR')
    })
}
