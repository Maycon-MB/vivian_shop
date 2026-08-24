'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * A barra de cima, para quem está comprando.
 *
 * Até 24/08 ela listava as sete áreas do projeto na mesma linha: a loja,
 * as vendas da Vivian, as perguntas em aberto, quanto a loja custa a ela,
 * a justificativa do design e o relatório de entregas. Quatro dos sete
 * itens eram conversa nossa, aparecendo para quem entrou querendo comprar
 * uma caneca.
 *
 * Era a maior causa da "cara de demonstração", mais do que qualquer cor
 * ou fonte: loja de verdade não tem "o que já fiz" no menu.
 *
 * O que é dela continua existindo, atrás do login. O que é nosso vira
 * documento. Aqui fica só o que serve a quem está comprando.
 */

const AREAS = [
  { href: '/', rotulo: 'A loja', classe: 'landing' },
  { href: '/como-funciona', rotulo: 'Como funciona', classe: 'how' },
]

export function Navegacao() {
  const caminho = usePathname()

  return (
    <nav className="view-switcher" aria-label="Navegação da loja">
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
