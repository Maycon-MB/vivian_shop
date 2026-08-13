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
  /* Os nomes são os que a Vivian usaria, não os que eu usaria.
     "Painel" é palavra de quem programa; ela não vai ao painel, vai ver
     as vendas. "Andamento" e "Identidade" não dizem nada sozinhos. */
  { href: '/', rotulo: 'A loja', classe: 'landing' },
  { href: '/painel', rotulo: 'Minhas vendas', classe: 'admin' },
  { href: '/perguntas', rotulo: 'Perguntas', classe: 'ask' },
  { href: '/como-funciona', rotulo: 'Como funciona', classe: 'how' },
  { href: '/identidade', rotulo: 'Minha marca', classe: 'ident' },
  { href: '/andamento', rotulo: 'O que já fiz', classe: 'status' },
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
