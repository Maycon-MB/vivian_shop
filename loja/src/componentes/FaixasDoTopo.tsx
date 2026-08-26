'use client'

import { useEffect, useRef } from 'react'

import { AvisoDemonstracao } from './AvisoDemonstracao'
import { ChamadoDasPerguntas } from './ChamadoDasPerguntas'

/**
 * As duas faixas que ficam acima de tudo: o aviso de que a loja é uma
 * demonstração e o chamado da Vivian para as perguntas.
 *
 * Elas precisam existir juntas por um motivo prático. O cabeçalho da loja
 * é fixo no topo da tela, e as faixas estavam no fluxo normal da página —
 * então o cabeçalho passava por cima delas e cortava justamente a primeira
 * linha, que é a que diz o que é aquilo.
 *
 * A solução é as faixas também ficarem fixas, acima do cabeçalho, e o
 * resto da página descer o tanto que elas ocupam. Como esse tanto muda —
 * uma faixa ou duas, uma linha ou duas no celular —, a altura é medida de
 * verdade e publicada como a variável `--faixas`, que o CSS usa para
 * empurrar o cabeçalho fixo e o conteúdo. Chutar um valor aqui daria certo
 * numa largura de tela e erraria em todas as outras.
 *
 * A barra de navegação entrou aqui depois, e por um defeito que só
 * apareceu clicando: no celular ela fica no topo, logo abaixo das faixas,
 * e o cabeçalho fixo da loja passava por cima dela. Os sete itens ficavam
 * visíveis e nenhum funcionava — o pior tipo de defeito, porque a tela
 * parece certa. Medindo a barra junto, o cabeçalho começa abaixo dela.
 *
 * No computador a barra é fixa no rodapé e não ocupa espaço no fluxo, de
 * modo que a medida não muda.
 */
export function FaixasDoTopo() {
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elemento = caixa.current
    if (!elemento) return

    const publicarAltura = () => {
      const altura = elemento.getBoundingClientRect().height
      document.documentElement.style.setProperty('--faixas', `${Math.round(altura)}px`)
    }

    publicarAltura()

    /* A altura muda quando a tela gira, quando o texto quebra em mais
       linhas, e quando o chamado some depois de ela responder tudo. */
    const observador = new ResizeObserver(publicarAltura)
    observador.observe(elemento)
    window.addEventListener('resize', publicarAltura)

    return () => {
      observador.disconnect()
      window.removeEventListener('resize', publicarAltura)
      document.documentElement.style.removeProperty('--faixas')
    }
  }, [])

  return (
    <div className="faixas-topo" ref={caixa}>
      <AvisoDemonstracao />
      <ChamadoDasPerguntas />
    </div>
  )
}
