import Link from 'next/link'
import { obterCatalogo } from '@/dados'
import { ehDigital } from '@/dominio/linhas'
import { SeloLinha } from '@/componentes/SeloLinha'
import { moeda } from '@/formato'

export default async function Produtos() {
  const catalogo = await obterCatalogo()
  const produtos = await catalogo.listar()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Meus produtos</h1>
          <p className="mt-1 text-ink-soft">
            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'} na loja.
          </p>
        </div>

        <Link
          href="/painel/produtos/novo"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Cadastrar produto
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {produtos.map((produto) => {
          const digital = ehDigital(produto.linha)

          return (
            <li
              key={produto.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-rule bg-surface p-4"
            >
              <div
                className={`h-14 w-14 shrink-0 rounded-lg ${
                  digital ? 'bg-marker/20' : 'bg-chalk/15'
                }`}
              />

              <div className="min-w-0 flex-1">
                <SeloLinha linha={produto.linha} />
                <p className="mt-1 font-bold">{produto.nome}</p>
                <p className="text-sm text-ink-soft">
                  {moeda(produto.preco)}
                  {!digital && ` cada · mínimo ${produto.minimo} · ${moeda(produto.preco * produto.minimo)} o pacote`}
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-rule px-4 py-2 text-sm font-bold transition hover:bg-paper"
              >
                Editar
              </button>
            </li>
          )
        })}
      </ul>

      <p className="rounded-xl border border-rule bg-surface p-4 text-sm text-ink-soft">
        <strong className="text-ink">Estes são produtos de exemplo.</strong> Os seus entram no
        lugar deles quando você mandar as fotos e os preços.
      </p>
    </div>
  )
}
