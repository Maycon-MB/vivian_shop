'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShoppingCart, User } from 'lucide-react'

import { useCarrinho } from '@/telas/CarrinhoContexto'

/**
 * A barra de cima de toda página de quem compra, menos a inicial.
 *
 * Quem vem de anúncio ou de link compartilhado cai direto num produto ou
 * num tema. Sem ela, essa pessoa não tinha como chegar ao resto da loja.
 * A inicial fica de fora porque tem a barra dela, com os filtros por linha.
 */
export function BarraDaLoja() {
  const caminho = usePathname()
  const { unidades } = useCarrinho()

  if (caminho === '/' || caminho === '') return null

  return (
    <nav className="barra-da-loja" aria-label="Navegação da loja">
      <div className="barra-da-loja-conteudo">
        <Link href="/" prefetch={false} className="barra-da-loja-marca">
          Feito para você!<span> Personalizados</span>
        </Link>

        <div className="barra-da-loja-acoes">
          <Link href="/produtos/" prefetch={false} aria-label="Procurar produtos">
            <Search size={20} aria-hidden="true" />
            <span className="barra-da-loja-rotulo">Todos os produtos</span>
          </Link>
          <Link href="/minha-conta/" prefetch={false} aria-label="Meus pedidos">
            <User size={20} aria-hidden="true" />
          </Link>
          <Link
            href="/checkout/"
            prefetch={false}
            aria-label={unidades > 0 ? `Ver o carrinho, ${unidades} itens` : 'Ver o carrinho'}
            className="barra-da-loja-carrinho"
          >
            <ShoppingCart size={22} aria-hidden="true" />
            {unidades > 0 && <span className="carrinho-conta">{unidades}</span>}
          </Link>
        </div>
      </div>
    </nav>
  )
}
