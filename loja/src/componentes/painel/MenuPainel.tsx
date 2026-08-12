'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Menu do painel.
 *
 * Rótulos são verbos do dia dela, não nomes de módulo: "Meus produtos",
 * não "Catálogo"; "Pedidos para enviar", não "Gestão de pedidos". Quem usa
 * isto entre uma encomenda e outra não deve precisar traduzir nada.
 */

const ITENS = [
  { href: '/painel', rotulo: 'Início', exato: true },
  { href: '/painel/pedidos', rotulo: 'Pedidos' },
  { href: '/painel/produtos', rotulo: 'Meus produtos' },
  { href: '/painel/configuracoes', rotulo: 'Configurações' },
]

export function MenuPainel() {
  const caminho = usePathname()

  const ativo = (href: string, exato?: boolean) =>
    exato ? caminho === href : caminho.startsWith(href)

  return (
    <nav aria-label="Áreas do painel" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITENS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={ativo(item.href, item.exato) ? 'page' : undefined}
          className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition ${
            ativo(item.href, item.exato)
              ? 'bg-ink text-white'
              : 'text-ink hover:bg-rule-faint'
          }`}
        >
          {item.rotulo}
        </Link>
      ))}
    </nav>
  )
}
