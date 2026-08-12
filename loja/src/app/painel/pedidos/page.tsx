import Link from 'next/link'
import { listarPedidos } from '@/dados/pedidosMemoria'
import { precisaDeAcao } from '@/dominio/pedido'
import { SeloEstado } from '@/componentes/painel/SeloEstado'
import { moeda } from '@/formato'
import { Seta } from '@/componentes/icones'

/** Pedidos que exigem ação vêm primeiro. O resto é histórico. */
export default async function Pedidos() {
  const pedidos = await listarPedidos()
  const ordenados = [...pedidos].sort((a, b) => {
    const pesoA = precisaDeAcao(a) ? 0 : 1
    const pesoB = precisaDeAcao(b) ? 0 : 1
    if (pesoA !== pesoB) return pesoA - pesoB
    return b.criadoEm.localeCompare(a.criadoEm)
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="mt-1 text-ink-soft">
          O que precisa de você aparece primeiro.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {ordenados.map((pedido) => (
          <li key={pedido.id}>
            <Link
              href={`/painel/pedidos/${pedido.id}`}
              className={`flex items-center gap-4 rounded-xl border bg-surface p-4 transition hover:shadow-md ${
                precisaDeAcao(pedido) ? 'border-rule border-l-4 border-l-marker' : 'border-rule'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold tabular-nums">#{pedido.numero}</span>
                  <SeloEstado estado={pedido.estado} />
                </div>

                <p className="mt-1 truncate text-sm">{pedido.clienteNome}</p>

                <p className="mt-0.5 truncate text-sm text-ink-soft">
                  {pedido.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(' · ')}
                </p>

                {pedido.prometidoPara && pedido.estado === 'em_producao' && (
                  <p className="mt-1 text-xs font-bold text-ink">
                    Prometido para {formatarData(pedido.prometidoPara)}
                  </p>
                )}
              </div>

              <span className="hidden text-right sm:block">
                <span className="block font-bold tabular-nums">{moeda(pedido.total)}</span>
                <span className="text-xs text-ink-soft">{formatarData(pedido.criadoEm)}</span>
              </span>

              <span className="text-chalk">
                <Seta />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="rounded-xl border border-rule bg-surface p-4 text-sm text-ink-soft">
        <strong className="text-ink">Estes pedidos são de exemplo</strong>, para mostrar como a
        tela se comporta. Os nomes não são de pessoas reais.
      </p>
    </div>
  )
}

const formatarData = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
