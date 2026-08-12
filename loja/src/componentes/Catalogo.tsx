'use client'

import { useState } from 'react'
import type { Produto } from '@/dominio/produto'
import { LINHAS, type Linha } from '@/dominio/linhas'
import { CardProduto } from './CardProduto'

/**
 * Catálogo com filtro por linha.
 *
 * O filtro é estado do navegador, e não parâmetro de endereço, porque a
 * loja é publicada como páginas estáticas — não existe servidor para ler
 * a query string. Trocar de linha também não recarrega a página, que no
 * celular é a diferença entre instantâneo e "esperando".
 */
export function Catalogo({ produtos }: { produtos: Produto[] }) {
  const [filtro, setFiltro] = useState<Linha | null>(null)

  const visiveis = filtro ? produtos.filter((p) => p.linha === filtro) : produtos

  return (
    <>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Filtrar por linha">
        <BotaoFiltro ativo={filtro === null} onClick={() => setFiltro(null)}>
          Todos
        </BotaoFiltro>
        {LINHAS.map((linha) => (
          <BotaoFiltro
            key={linha}
            ativo={filtro === linha}
            onClick={() => setFiltro(linha)}
          >
            {linha}
          </BotaoFiltro>
        ))}
      </nav>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-rule bg-surface p-8 text-center text-ink-soft">
          Nenhum produto nesta linha ainda.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((produto) => (
            <CardProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </>
  )
}

function BotaoFiltro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk ${
        ativo
          ? 'border-ink bg-ink text-white'
          : 'border-rule text-ink hover:bg-surface'
      }`}
    >
      {children}
    </button>
  )
}
