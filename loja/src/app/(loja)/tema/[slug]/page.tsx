import { notFound } from 'next/navigation'
import PaginaTema from '@/telas/PaginaTema'
import { TEMAS, acharTema, produtosDoTema } from '@/telas/catalogo'
import { cartaoDoTema } from '@/dominio/cartaoDoLink.mjs'
import { enderecoDaLoja } from '@/dominio/enderecoDaLoja.mjs'
import { emJsonLd } from '@/dominio/dadosDoProdutoParaOGoogle.mjs'
import {
  tituloDoTema,
  descricaoDoTema,
  enderecoDoTema,
  listaDoTemaParaOGoogle,
} from '@/dominio/paginaDoTema'
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

  const produtos = produtosDoTema(tema.slug)

  return {
    title: tituloDoTema(tema),
    description: descricaoDoTema(tema, produtos.length),
    alternates: { canonical: enderecoDoTema(tema, enderecoDaLoja()) },
    ...cartaoDoTema(tema, produtos[0], enderecoDaLoja()),
  }
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tema = acharTema(slug)

  if (!tema) notFound()

  const lista = listaDoTemaParaOGoogle(tema, produtosDoTema(slug), enderecoDaLoja())

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: emJsonLd(lista) }} />
      <PaginaTema slug={slug} />
    </>
  )
}
