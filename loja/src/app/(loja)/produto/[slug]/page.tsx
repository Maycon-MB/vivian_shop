import { notFound } from 'next/navigation'
import PaginaProduto from '@/telas/PaginaProduto'
import { PRODUTOS, acharPorSlug } from '@/telas/catalogo'
import { paraMetaDescricao } from '@/dominio/descricaoEmLinhas'
import '@/telas/produto.css'

/** Uma página por produto, geradas no build. */
export function generateStaticParams() {
  return PRODUTOS.map((produto) => ({ slug: produto.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const produto = acharPorSlug(slug)

  if (!produto) return {}

  /* A chave `description` some do objeto, e não só o valor: o Next só
     herda a frase genérica do layout raiz quando a chave está ausente.
     Um `description: undefined` explícito conta como "sem descrição" e
     tira a tag inteira da página, em vez de cair para o layout. */
  const descricao = paraMetaDescricao(produto.description)

  return {
    title: `${produto.name} · Feito para você! Personalizados`,
    ...(descricao ? { description: descricao } : {}),
  }
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const produto = acharPorSlug(slug)

  if (!produto) notFound()

  return <PaginaProduto produto={produto} />
}
