import Link from 'next/link'
import { MenuPainel } from '@/componentes/painel/MenuPainel'

/**
 * Layout do painel da Vivian.
 *
 * Menu em coluna no computador e em linha rolável no celular — ela vai
 * despachar pedido do celular, entre uma encomenda e outra, e menu
 * escondido atrás de um botão custa um toque a mais em cada tarefa.
 */
export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              Painel · Feito para você!
            </p>
            <p className="text-xs text-ink-soft">Você está administrando a sua loja</p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-rule px-4 py-2 text-sm font-bold transition hover:bg-paper"
          >
            Ver a loja
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 md:flex-row md:gap-10 md:py-10">
        <aside className="md:w-52 md:shrink-0">
          <MenuPainel />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
