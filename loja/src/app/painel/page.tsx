import Link from 'next/link'
import { listarPedidos } from '@/dados/pedidosMemoria'
import { precisaDeAcao, ESTADOS_PEDIDO } from '@/dominio/pedido'
import { SeloEstado } from '@/componentes/painel/SeloEstado'
import { moeda } from '@/formato'
import { Seta } from '@/componentes/icones'

/**
 * Início do painel.
 *
 * Abre com o que exige ela hoje, não com faturamento. Loja nova tem
 * número baixo, e abrir o dia com um gráfico vazio desanima — abrir com
 * "2 pedidos esperando você" dá o que fazer.
 */
export default async function InicioPainel() {
  const pedidos = await listarPedidos()
  const pendentes = pedidos.filter(precisaDeAcao)
  const doMes = pedidos.filter((p) => p.estado !== 'cancelado')
  const faturamento = doMes.reduce((soma, p) => soma + p.subtotal, 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Bem-vinda, Vivian</h1>
        <p className="mt-1 text-ink-soft">
          {pendentes.length === 0
            ? 'Nenhum pedido esperando você agora.'
            : `${pendentes.length} ${pendentes.length === 1 ? 'pedido precisa' : 'pedidos precisam'} de você hoje.`}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Numero rotulo="Pedidos esperando você" valor={String(pendentes.length)} destaque />
        <Numero rotulo="Pedidos no total" valor={String(doMes.length)} />
        <Numero rotulo="Vendido" valor={moeda(faturamento)} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Precisa de você</h2>
          <Link href="/painel/pedidos" className="text-sm font-bold text-chalk hover:underline">
            Ver todos os pedidos
          </Link>
        </div>

        {pendentes.length === 0 ? (
          <p className="rounded-xl border border-rule bg-surface p-6 text-sm text-ink-soft">
            Tudo em dia. Quando entrar um pedido novo, ele aparece aqui.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pendentes.map((pedido) => (
              <li key={pedido.id}>
                <Link
                  href={`/painel/pedidos/${pedido.id}`}
                  className="flex items-center gap-4 rounded-xl border border-rule bg-surface p-4 transition hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold tabular-nums">#{pedido.numero}</span>
                      <SeloEstado estado={pedido.estado} />
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-soft">
                      {pedido.clienteNome} · {pedido.itens[0].nome}
                      {pedido.itens.length > 1 && ` e mais ${pedido.itens.length - 1}`}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {ESTADOS_PEDIDO[pedido.estado].descricao}
                    </p>
                  </div>

                  <span className="hidden text-right sm:block">
                    <span className="block font-bold tabular-nums">{moeda(pedido.total)}</span>
                  </span>

                  <span className="text-chalk">
                    <Seta />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Atalhos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Atalho
            href="/painel/produtos/novo"
            titulo="Cadastrar um produto"
            detalhe="Uns 3 minutos: foto, nome, preço e medidas do pacote."
          />
          <Atalho
            href="/painel/pedidos"
            titulo="Despachar um pedido"
            detalhe="Etiqueta e declaração de conteúdo saem juntas, prontas para imprimir."
          />
        </div>
      </section>
    </div>
  )
}

function Numero({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-surface p-5 ${
        destaque ? 'border-l-4 border-rule border-l-marker' : 'border-rule'
      }`}
    >
      <p className="font-display text-3xl font-semibold tabular-nums">{valor}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-soft">{rotulo}</p>
    </div>
  )
}

function Atalho({
  href,
  titulo,
  detalhe,
}: {
  href: string
  titulo: string
  detalhe: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-rule bg-surface p-4 transition hover:shadow-md"
    >
      <span className="min-w-0 flex-1">
        <strong className="block text-sm">{titulo}</strong>
        <span className="text-sm text-ink-soft">{detalhe}</span>
      </span>
      <span className="text-chalk">
        <Seta />
      </span>
    </Link>
  )
}
