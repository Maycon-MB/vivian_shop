/**
 * Tema dos gráficos do painel.
 *
 * Um lugar só para cor, fonte, tooltip e eixo — senão cada gráfico vira
 * um dialeto e o painel perde a unidade.
 *
 * As cores são as da identidade e significam sempre a mesma coisa:
 * verde-água é a linha personalizada, amarelo é a pedagógica, azul é
 * total, rosa é alerta.
 */

export const CORES = {
  tinta: '#12305B',
  tintaSuave: '#6B7C8F',
  linha: '#DCE9F6',
  linhaForte: '#A8C6E8',
  superficie: '#FFFFFF',
  personalizada: '#2E9B96',
  pedagogica: '#FFD400',
  rosa: '#C4436B',
}

export const PALETA = [CORES.personalizada, CORES.pedagogica, CORES.tinta, CORES.rosa]

const FONTE = 'var(--font-main), "Atkinson Hyperlegible", system-ui, sans-serif'

const nf = new Intl.NumberFormat('pt-BR')

export const emReais = (v) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const compacto = (v) => {
  if (v >= 1000) return `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}mil`
  return nf.format(v)
}

/** Converte hex em rgba, para montar os degradês. */
const rgba = (hex, alfa) => {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alfa})`
}

export const degrade = (hex, de = 0.28, ate = 0.02) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: rgba(hex, de) },
    { offset: 1, color: rgba(hex, ate) },
  ],
})

/** Degradê na vertical, para barra em pé. */
export const degradeColuna = (hex) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: hex },
    { offset: 1, color: rgba(hex, 0.55) },
  ],
})

/** Degradê na horizontal, para barra deitada. */
export const degradeBarra = (hex) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 1,
  y2: 0,
  colorStops: [
    { offset: 0, color: rgba(hex, 0.55) },
    { offset: 1, color: hex },
  ],
})

export const base = (extra = {}) => ({
  color: PALETA,
  textStyle: { fontFamily: FONTE, color: CORES.tinta, fontSize: 12 },
  grid: { left: 8, right: 18, top: 24, bottom: 20, containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: CORES.superficie,
    borderColor: CORES.linha,
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: CORES.tinta, fontFamily: FONTE, fontSize: 12.5 },
    extraCssText: 'box-shadow: 0 14px 34px -20px rgba(18,48,91,0.45); border-radius: 12px;',
    axisPointer: { lineStyle: { color: CORES.linhaForte, type: 'dashed' } },
  },
  ...extra,
})

export const serieArea = (nome, dados, cor) => ({
  name: nome,
  type: 'line',
  data: dados,
  smooth: 0.3,
  symbol: 'circle',
  symbolSize: 7,
  showSymbol: false,
  itemStyle: { color: cor, borderColor: CORES.superficie, borderWidth: 2 },
  lineStyle: { width: 2.5, color: cor },
  emphasis: { focus: 'series', scale: 1.3 },
  areaStyle: { color: degrade(cor) },
})

export const eixoCategoria = (dados) => ({
  type: 'category',
  data: dados,
  boundaryGap: false,
  axisLine: { lineStyle: { color: CORES.linhaForte } },
  axisTick: { show: false },
  axisLabel: { color: CORES.tintaSuave, fontFamily: FONTE, fontSize: 11 },
})

export const eixoValor = (extra = {}) => ({
  type: 'value',
  splitNumber: 4,
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: CORES.linha } },
  axisLabel: {
    color: CORES.tintaSuave,
    fontFamily: FONTE,
    fontSize: 11,
    formatter: (v) => compacto(v),
  },
  ...extra,
})
