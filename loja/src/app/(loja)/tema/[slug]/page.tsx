import { notFound } from 'next/navigation'
import PaginaTema from '@/telas/PaginaTema'
import { TEMAS, acharTema } from '@/telas/catalogo'
import '@/telas/produto.css'
import '@/telas/tema.css'

/** Uma página por tema, geradas no build — como as de produto. */
export function generateStaticParams() {
  return TEMAS.map((tema) => ({ slug: tema.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tema = acharTema(slug)

  if (!tema) return {}

  return {
    title: `${tema.nome} · Feito para você! Personalizados`,
    description: tema.descricao,
  }
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!acharTema(slug)) notFound()

  return <PaginaTema slug={slug} />
}
