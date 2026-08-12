import { notFound } from 'next/navigation'
import Link from 'next/link'
import { obterCatalogo } from '@/dados'
import { quantidadeMinima } from '@/dominio/carrinho'
import { ehDigital } from '@/dominio/linhas'
import { SeloLinha } from '@/componentes/SeloLinha'
import { moeda } from '@/formato'

export async function generateStaticParams() {
  const catalogo = await obterCatalogo()
  const produtos = await catalogo.listar()
  return produtos.map((produto) => ({ slug: produto.slug }))
}

export default async function PaginaProduto({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const catalogo = await obterCatalogo()
  const produto = await catalogo.buscarPorSlug(slug)

  if (!produto) notFound()

  const digital = ehDigital(produto.linha)
  const minimo = quantidadeMinima(produto)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="text-sm font-bold text-chalk hover:underline">
        ← Voltar para a loja
      </Link>

      <div className="mt-6 flex flex-col gap-4">
        <SeloLinha linha={produto.linha} />

        <h1 className="text-3xl font-semibold">{produto.nome}</h1>

        <div
          className={`flex aspect-[16/9] items-center justify-center rounded-xl border border-rule text-xs uppercase tracking-wider text-ink-soft ${
            digital ? 'bg-marker/15' : 'bg-chalk/10'
          }`}
        >
          Aqui entra sua foto
        </div>

        <p className="text-ink-soft">{produto.descricao}</p>

        <div className="rounded-xl border border-rule bg-surface p-5">
          <p className="text-2xl font-bold tabular-nums">
            {moeda(produto.preco)}
            {!digital && (
              <span className="ml-1 text-base font-normal text-ink-soft">cada</span>
            )}
          </p>

          {digital ? (
            <p className="mt-2 text-sm">
              Arquivo digital. Chega no seu e-mail assim que o pagamento for aprovado,
              sem frete e sem espera.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm font-bold">
                Mínimo de {minimo} unidades — {moeda(produto.preco * minimo)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Feito sob encomenda, pronto em {produto.prazoProducao} dias úteis depois
                do pagamento. O frete é calculado pelo seu CEP na hora da compra.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
