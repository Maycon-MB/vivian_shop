import { notFound } from 'next/navigation'
import PaginaProduto from '@/telas/PaginaProduto'
import { PRODUTOS, acharPorSlug } from '@/telas/catalogo'
import '@/telas/produto.css'

/** Uma página por produto, geradas no build. */
export function generateStaticParams() {
  return PRODUTOS.map((produto) => ({ slug: produto.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const produto = acharPorSlug(slug)

  if (!produto) return {}

  return {
    title: `${produto.name} · Feito para você! Personalizados`,
    description: produto.description,
  }
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const produto = acharPorSlug(slug)

  if (!produto) notFound()

  return <PaginaProduto produto={produto} />
}
