import Link from 'next/link'
import { ShoppingBag } from './icones'

/**
 * Cabeçalho fixo.
 *
 * A marca aparece do jeito que a cliente escreveu — "Feito para você!
 * Personalizados" — porque é assim que o público dela reconhece a loja
 * desde o Elo7.
 */
export function Cabecalho() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold leading-tight sm:text-xl"
        >
          Feito para você!
          <span className="text-chalk"> Personalizados</span>
        </Link>

        <Link
          href="/carrinho"
          className="flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-sm font-bold transition hover:bg-surface"
        >
          <ShoppingBag />
          <span className="hidden sm:inline">Carrinho</span>
        </Link>
      </div>
    </header>
  )
}
