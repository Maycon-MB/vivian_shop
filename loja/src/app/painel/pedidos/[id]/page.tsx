import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listarPedidos, buscarPedido } from '@/dados/pedidosMemoria'
import { ESTADOS_PEDIDO } from '@/dominio/pedido'
import { SeloEstado } from '@/componentes/painel/SeloEstado'
import { AcoesPedido } from '@/componentes/painel/AcoesPedido'
import { moeda } from '@/formato'

export async function generateStaticParams() {
  const pedidos = await listarPedidos()
  return pedidos.map((pedido) => ({ id: pedido.id }))
}

export default async function DetalhePedido({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pedido = await buscarPedido(id)

  if (!pedido) notFound()

  const digital = !pedido.endereco

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/painel/pedidos" className="text-sm font-bold text-chalk hover:underline">
          ← Pedidos
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tabular-nums">Pedido #{pedido.numero}</h1>
          <SeloEstado estado={pedido.estado} />
        </div>

        <p className="mt-1 text-ink-soft">{ESTADOS_PEDIDO[pedido.estado].descricao}</p>
      </div>

      <AcoesPedido
        estado={pedido.estado}
        digital={digital}
        whatsapp={pedido.clienteWhatsapp}
        rastreio={pedido.rastreio}
      />

      <section className="rounded-xl border border-rule bg-surface p-5">
        <h2 className="mb-4 font-corpo text-sm font-bold uppercase tracking-wider text-ink-soft">
          O que foi pedido
        </h2>

        <ul className="flex flex-col gap-3">
          {pedido.itens.map((item) => (
            <li key={item.produtoId} className="flex items-start justify-between gap-4 text-sm">
              <span>
                <strong className="tabular-nums">{item.quantidade}x</strong> {item.nome}
                <span className="block text-ink-soft">{moeda(item.preco)} cada</span>
              </span>
              <span className="whitespace-nowrap font-bold tabular-nums">
                {moeda(item.preco * item.quantidade)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 flex flex-col gap-1 border-t border-rule-faint pt-4 text-sm">
          <Linha rotulo="Produtos" valor={moeda(pedido.subtotal)} />
          <Linha
            rotulo={digital ? 'Frete' : `Frete · ${pedido.transportadora ?? ''}`}
            valor={digital ? 'não tem' : moeda(pedido.frete)}
          />
          <div className="mt-1 flex items-center justify-between border-t border-rule-faint pt-2">
            <dt className="font-bold">Total</dt>
            <dd className="font-display text-xl font-semibold tabular-nums">
              {moeda(pedido.total)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-rule bg-surface p-5">
          <h2 className="mb-3 font-corpo text-sm font-bold uppercase tracking-wider text-ink-soft">
            Quem comprou
          </h2>
          <p className="font-bold">{pedido.clienteNome}</p>
          <p className="mt-1 text-sm text-ink-soft">{pedido.clienteEmail}</p>
          <p className="text-sm text-ink-soft">{pedido.clienteWhatsapp}</p>
        </section>

        <section className="rounded-xl border border-rule bg-surface p-5">
          <h2 className="mb-3 font-corpo text-sm font-bold uppercase tracking-wider text-ink-soft">
            {digital ? 'Entrega' : 'Endereço de entrega'}
          </h2>

          {digital ? (
            <p className="text-sm">
              Arquivo enviado por e-mail e WhatsApp assim que o pagamento foi aprovado.
              Sem etiqueta e sem declaração de conteúdo.
            </p>
          ) : (
            <address className="text-sm not-italic">
              {pedido.endereco!.logradouro}, {pedido.endereco!.numero}
              {pedido.endereco!.complemento && ` · ${pedido.endereco!.complemento}`}
              <br />
              {pedido.endereco!.bairro}
              <br />
              {pedido.endereco!.cidade} — {pedido.endereco!.uf}
              <br />
              <span className="tabular-nums">CEP {pedido.endereco!.cep}</span>
            </address>
          )}

          {pedido.rastreio && (
            <p className="mt-3 border-t border-rule-faint pt-3 text-sm">
              <span className="text-ink-soft">Rastreio: </span>
              <strong className="tabular-nums">{pedido.rastreio}</strong>
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{rotulo}</dt>
      <dd className="tabular-nums">{valor}</dd>
    </div>
  )
}
