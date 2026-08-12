import Link from 'next/link'
import type { Produto } from '@/dominio/produto'
import { quantidadeMinima } from '@/dominio/carrinho'
import { ehDigital } from '@/dominio/linhas'
import { SeloLinha } from './SeloLinha'
import { moeda } from '@/formato'

/**
 * Card do catálogo.
 *
 * A regra de venda aparece antes do botão, de propósito: ninguém deve
 * descobrir o mínimo de 10 peças só no carrinho. Numa linha de R$ 32 a
 * unidade, o menor pedido possível é R$ 320 — quem só vê isso no fim
 * desiste ali, e a loja perde a venda sem saber por quê.
 */
export function CardProduto({ produto }: { produto: Produto }) {
  const digital = ehDigital(produto.linha)
  const minimo = quantidadeMinima(produto)

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-rule bg-surface transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
    >
      <div
        className={`flex aspect-[5/4] items-center justify-center text-[10px] uppercase tracking-wider text-ink-soft ${
          digital ? 'bg-marker/15' : 'bg-chalk/10'
        }`}
      >
        Aqui entra sua foto
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-rule p-4">
        <SeloLinha linha={produto.linha} />

        <h2 className="font-corpo text-base font-bold leading-snug">{produto.nome}</h2>

        <p className="text-sm text-ink-soft">{produto.descricao}</p>

        <p className="mt-auto pt-2 text-lg font-bold tabular-nums">
          {moeda(produto.preco)}
          {!digital && <span className="ml-1 text-sm font-normal text-ink-soft">cada</span>}
        </p>

        <p className="text-sm font-bold">
          {digital
            ? 'Arquivo digital · chega na hora do pagamento'
            : `Mínimo ${minimo} un. — ${moeda(produto.preco * minimo)} · pronto em ${produto.prazoProducao} dias úteis`}
        </p>
      </div>
    </Link>
  )
}
