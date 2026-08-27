'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { contarVisita } from '@/dados/visitasNoBanco'

/**
 * Conta a página aberta, e não desenha nada.
 *
 * Fica no layout de quem compra, e não no layout raiz: o painel da Vivian
 * não entra na conta. Ela abrindo os próprios produtos vinte vezes por dia
 * para conferir foto inflaria o número que ela usa para decidir o anúncio,
 * e a decisão sairia errada.
 *
 * ── Por que conta a cada troca de página ───────────────────────────────
 *
 * O site é estático, mas a navegação entre páginas acontece dentro do
 * navegador, sem recarregar. Contando só no carregamento, uma visita que
 * olha oito produtos contaria uma página, e a pergunta "qual produto puxa
 * gente" ficaria sem resposta.
 */
export const ContagemDeVisita = () => {
  const caminho = usePathname()

  useEffect(() => {
    if (!caminho) return

    /* O `referrer` continua o de quem mandou a pessoa para a loja, mesmo
       depois de ela navegar por dentro. É o que se quer: a origem é da
       visita, e não de cada página dela. */
    void contarVisita(caminho, document.referrer, window.location.search)
  }, [caminho])

  return null
}
