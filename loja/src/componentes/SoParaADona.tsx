'use client'

import { useEffect, useState } from 'react'

import { situacaoDaDona, temBanco } from '@/servicos/autenticacao'

/**
 * Envolve o que só a Vivian pode ver dentro da loja.
 *
 * Nasceu de um defeito encontrado em 31/08: a página "Quem faz" mostrava
 * uma tarja amarela escrita "Vivian, este texto é um esboço, me manda do
 * seu jeito". Recado meu para ela, à vista de toda cliente, numa loja com
 * 342 produtos no ar.
 *
 * Quem chega pelo Instagram e lê isso entende, com razão, que entrou num
 * site inacabado. É exatamente o mesmo estrago do recado das perguntas,
 * que foi escondido em 26/08 pelo mesmo motivo. Duas vezes a mesma falha
 * significa que o conserto tem que virar peça, e não remendo.
 *
 * Sem banco configurado, mostra: aí é a loja de demonstração, que é dela
 * e de mais ninguém.
 */
export const SoParaADona = ({ children }: { children: React.ReactNode }) => {
  /* `null` enquanto não se sabe. Mostrar durante a dúvida entregaria o
     recado para quem passasse rápido pela página, que é o defeito que
     este componente existe para fechar. */
  const [ehADona, setEhADona] = useState<boolean | null>(temBanco() ? null : true)

  useEffect(() => {
    if (!temBanco()) return
    let valendo = true

    situacaoDaDona()
      .then((situacao) => {
        if (valendo) setEhADona(situacao.estado === 'dentro')
      })
      .catch(() => {
        if (valendo) setEhADona(false)
      })

    return () => {
      valendo = false
    }
  }, [])

  if (ehADona !== true) return null

  return <>{children}</>
}
