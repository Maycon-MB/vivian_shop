'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Barra que troca entre as áreas do projeto.
 *
 * Substitui o roteamento por hash do protótipo por rotas de verdade: cada
 * área ganha endereço próprio, que dá para mandar no WhatsApp e que o
 * Google consegue indexar.
 */

const AREAS = [
  { href: '/', rotulo: 'Loja', classe: 'landing' },
  { href: '/painel', rotulo: 'Painel', classe: 'admin' },
  { href: '/como-funciona', rotulo: 'Como funciona', classe: 'how' },
  { href: '/andamento', rotulo: 'Andamento', classe: 'status' },
  { href: '/perguntas', rotulo: 'Perguntas', classe: 'ask' },
  { href: '/identidade', rotulo: 'Identidade', classe: 'ident' },
]

export function Navegacao() {
  const caminho = usePathname()

  return (
    <nav className="view-switcher" aria-label="Áreas do projeto">
      {AREAS.map((area) => {
        const ativo = area.href === '/' ? caminho === '/' : caminho.startsWith(area.href)

        return (
          <Link
            key={area.href}
            href={area.href}
            prefetch={false}
            aria-current={ativo ? 'page' : undefined}
            className={`switcher-btn ${area.classe} ${ativo ? 'active' : ''}`}
          >
            {area.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
