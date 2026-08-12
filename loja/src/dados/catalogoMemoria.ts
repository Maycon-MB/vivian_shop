import type { RepositorioProdutos } from './repositorio'
import type { Produto } from '@/dominio/produto'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA, type Linha } from '@/dominio/linhas'

/**
 * Catálogo em memória, para desenvolver antes de existir banco.
 *
 * Os produtos são de exemplo, não são os reais — entram quando a cliente
 * mandar as fotos e os preços dela. As medidas são do pacote fechado de 10
 * unidades, que é o que ela despacha.
 *
 * Este arquivo sai do caminho sozinho: assim que `NEXT_PUBLIC_SUPABASE_URL`
 * existir, `obterCatalogo()` passa a devolver o repositório do Supabase e
 * ninguém precisa mudar uma linha de página.
 */

const EXEMPLOS: Produto[] = [
  {
    id: 'exemplo-1',
    slug: 'caderno-personalizado',
    nome: 'Caderno personalizado',
    descricao: 'Capa com o nome de quem vai usar.',
    preco: 32,
    linha: LINHA_PERSONALIZADA,
    minimo: 10,
    prazoProducao: 5,
    pesoG: 4000,
    altCm: 20,
    largCm: 30,
    compCm: 30,
  },
  {
    id: 'exemplo-2',
    slug: 'cartela-adesivos',
    nome: 'Cartela de adesivos escolares',
    descricao: 'Etiquetas para material escolar, com nome e turma.',
    preco: 18,
    linha: LINHA_PERSONALIZADA,
    minimo: 10,
    prazoProducao: 5,
    pesoG: 800,
    altCm: 5,
    largCm: 22,
    compCm: 32,
  },
  {
    id: 'exemplo-3',
    slug: 'bloco-anotacoes',
    nome: 'Bloco de anotações',
    descricao: 'Bloco personalizado, ideal para lembrancinha.',
    preco: 24,
    linha: LINHA_PERSONALIZADA,
    minimo: 10,
    prazoProducao: 5,
    pesoG: 2500,
    altCm: 12,
    largCm: 20,
    compCm: 28,
  },
  {
    id: 'exemplo-4',
    slug: 'apostila-alfabetizacao',
    nome: 'Apostila de alfabetização adaptada',
    descricao: 'Material estruturado com apoio visual, para imprimir em casa.',
    preco: 47,
    linha: LINHA_PEDAGOGICA,
    minimo: 1,
    prazoProducao: 0,
  },
  {
    id: 'exemplo-5',
    slug: 'kit-rotina-visual',
    nome: 'Kit rotina visual',
    descricao: 'Quadro de rotina para montar e usar no dia a dia.',
    preco: 39,
    linha: LINHA_PEDAGOGICA,
    minimo: 1,
    prazoProducao: 0,
  },
  {
    id: 'exemplo-6',
    slug: 'jogo-das-emocoes',
    nome: 'Jogo das emoções',
    descricao: 'Atividade lúdica para identificar sentimentos.',
    preco: 29,
    linha: LINHA_PEDAGOGICA,
    minimo: 1,
    prazoProducao: 0,
  },
]

export const catalogoMemoria: RepositorioProdutos = {
  async listar(linha?: Linha): Promise<Produto[]> {
    if (!linha) return EXEMPLOS
    return EXEMPLOS.filter((produto) => produto.linha === linha)
  },

  async buscarPorSlug(slug: string): Promise<Produto | null> {
    return EXEMPLOS.find((produto) => produto.slug === slug) ?? null
  },
}

/** Exportado para os testes; as páginas usam sempre o repositório. */
export const PRODUTOS_EXEMPLO = EXEMPLOS
