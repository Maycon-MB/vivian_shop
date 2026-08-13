'use client'

import React from 'react'
import dynamic from 'next/dynamic'

/**
 * O gráfico, carregado só quando alguém vai vê-lo.
 *
 * A biblioteca de gráficos pesa 1,2 MB — sozinha, mais que o resto do
 * painel inteiro somado. Enquanto ela vinha no pacote principal, abrir o
 * painel no 4G custava dez segundos de tela branca, inclusive para quem
 * ia direto conferir um pedido e nunca olhava um gráfico.
 *
 * Com o carregamento adiado, o painel abre com o que importa e o gráfico
 * chega depois, no lugar dele. Quem abre em "Pedidos" nunca baixa 1,2 MB.
 *
 * `ssr: false` porque a biblioteca mede o tamanho do elemento na tela para
 * desenhar, e no momento do build não existe tela para medir.
 */
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="grafico-carregando" role="status">
      <span>Montando o gráfico…</span>
    </div>
  ),
})

export default function Grafico({ option, height = 288, ...resto }) {
  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      {...resto}
    />
  )
}
