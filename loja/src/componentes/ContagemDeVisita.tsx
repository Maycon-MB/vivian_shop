'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

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
 *
 * ── Por que o `import` está dentro do efeito ───────────────────────────
 *
 * Contar visita usa o cliente do Supabase, que são 80 KB comprimidos.
 * Importado no topo, ele entrava no pacote inicial de **toda** página de
 * quem compra, e a medição passava a atrasar a loja que ela existe para
 * medir. A home é onde cai o tráfego do Instagram, e no 4G esses 80 KB
 * são meio segundo antes de aparecer qualquer coisa.
 *
 * Dentro do efeito, e ainda por cima na ociosidade, ele é baixado depois
 * de a página estar na tela. Uma visita não contada porque a pessoa saiu
 * antes disso é um número a menos num total aproximado; meio segundo a
 * mais é a própria visita.
 */

/* Espera a primeira folga do navegador. `requestIdleCallback` não existe
   no Safari antigo, e ali um tempo curto resolve: o que importa é não
   disputar com a pintura, e não a precisão da espera. */
const quandoDerFolga = (fazer: () => void): (() => void) => {
  const janela = window as Window & {
    requestIdleCallback?: (cb: () => void, opcoes?: { timeout: number }) => number
    cancelIdleCallback?: (id: number) => void
  }

  if (janela.requestIdleCallback) {
    const id = janela.requestIdleCallback(fazer, { timeout: 3000 })
    return () => janela.cancelIdleCallback?.(id)
  }

  const id = window.setTimeout(fazer, 1200)
  return () => window.clearTimeout(id)
}

export const ContagemDeVisita = () => {
  const caminho = usePathname()

  useEffect(() => {
    if (!caminho) return

    const cancelar = quandoDerFolga(() => {
      void import('@/dados/visitasNoBanco').then(({ contarVisita }) =>
        /* O `referrer` continua o de quem mandou a pessoa para a loja,
           mesmo depois de ela navegar por dentro. É o que se quer: a
           origem é da visita, e não de cada página dela. */
        contarVisita(caminho, document.referrer, window.location.search),
      )
    })

    return cancelar
  }, [caminho])

  return null
}
