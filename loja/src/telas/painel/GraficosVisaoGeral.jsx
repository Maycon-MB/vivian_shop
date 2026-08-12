'use client'

import React from 'react';
import ReactECharts from 'echarts-for-react';
import {
  base,
  eixoCategoria,
  eixoValor,
  degradeBarra,
  CORES,
  emReais,
  compacto,
} from './graficos';

/**
 * Gráficos da visão geral.
 *
 * Cada um responde uma pergunta que a cliente realmente faz. Gráfico que
 * não responde pergunta é enfeite que atrasa o carregamento.
 *
 *   barra empilhada → "em que dias eu vendo, e quanto de cada linha?"
 *   rosca           → "qual das duas linhas puxa o faturamento?"
 *   barra deitada   → "o que mais sai, e o que produzir primeiro?"
 *
 * A primeira era um gráfico de linha e estava errada. Linha sugere
 * variável contínua, e venda de loja pequena é evento solto: tem dia com
 * pedido e dia sem. O resultado era um dente de serra que não dizia nada.
 * Barra mostra o dia que vendeu, o dia que não vendeu, e a composição
 * entre as duas linhas de uma vez.
 *
 * Descartei dispersão, radar e mapa de calor: bonitos, mas nenhum responde
 * pergunta que ela tenha às sete da manhã.
 *
 * Os dados são de exemplo enquanto a loja não vende — e estão marcados
 * como tal na tela, para ela não confundir com venda real.
 */

const DIAS = Array.from({ length: 30 }, (_, i) => `${String(i + 1).padStart(2, '0')}/07`);

const VENDAS_PERSONALIZADA = [
  0, 320, 0, 0, 480, 320, 640, 0, 320, 960, 640, 0, 320, 480, 800, 320, 0, 640,
  960, 480, 320, 0, 640, 800, 1120, 640, 320, 480, 960, 800,
];

const VENDAS_PEDAGOGICA = [
  47, 0, 94, 47, 0, 141, 47, 94, 0, 188, 94, 47, 141, 0, 94, 235, 47, 94,
  141, 0, 188, 94, 47, 141, 94, 282, 141, 47, 188, 235,
];

const MAIS_VENDIDOS = [
  { nome: 'Caderno personalizado', unidades: 180, cor: CORES.personalizada },
  { nome: 'Cartela de adesivos', unidades: 140, cor: CORES.personalizada },
  { nome: 'Apostila de alfabetização', unidades: 96, cor: CORES.pedagogica },
  { nome: 'Bloco de anotações', unidades: 80, cor: CORES.personalizada },
  { nome: 'Jogo das emoções', unidades: 62, cor: CORES.pedagogica },
];

const somar = (lista) => lista.reduce((a, b) => a + b, 0);

export const VendasPorDia = () => {
  const opcao = base({
    grid: { left: 8, right: 12, top: 16, bottom: 20, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: CORES.superficie,
      borderColor: CORES.linha,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: CORES.tinta, fontSize: 12.5 },
      extraCssText: 'box-shadow: 0 14px 34px -20px rgba(18,48,91,0.45); border-radius: 12px;',
      valueFormatter: (v) => (v ? emReais(v) : 'sem venda'),
    },
    xAxis: {
      ...eixoCategoria(DIAS),
      boundaryGap: true,
      axisLabel: {
        color: CORES.tintaSuave,
        fontSize: 10.5,
        // Trinta rótulos não cabem: um a cada três basta para situar a data.
        interval: 2,
      },
    },
    yAxis: eixoValor({
      axisLabel: { color: CORES.tintaSuave, fontSize: 11, formatter: (v) => `R$ ${compacto(v)}` },
    }),
    series: [
      {
        name: 'Personalizada',
        type: 'bar',
        stack: 'dia',
        data: VENDAS_PERSONALIZADA,
        itemStyle: { color: CORES.personalizada },
        barMaxWidth: 18,
        emphasis: { focus: 'series' },
      },
      {
        name: 'Pedagógica',
        type: 'bar',
        stack: 'dia',
        data: VENDAS_PEDAGOGICA,
        // O arredondamento vai só na última série da pilha, senão cada
        // pedaço vira uma cápsula solta.
        itemStyle: { color: CORES.pedagogica, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 18,
        emphasis: { focus: 'series' },
      },
    ],
  });

  return <ReactECharts option={opcao} style={{ height: 300, width: '100%' }} notMerge />;
};

export const ProporcaoLinhas = () => {
  const totalP = somar(VENDAS_PERSONALIZADA);
  const totalE = somar(VENDAS_PEDAGOGICA);
  const total = totalP + totalE;

  const fatias = [
    { nome: 'Personalizada', valor: totalP, cor: CORES.personalizada, obs: 'com frete e produção' },
    { nome: 'Pedagógica', valor: totalE, cor: CORES.pedagogica, obs: 'sem custo de envio' },
  ];

  const opcao = {
    ...base({ grid: undefined }),
    tooltip: {
      trigger: 'item',
      backgroundColor: CORES.superficie,
      borderColor: CORES.linha,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: CORES.tinta, fontSize: 12.5 },
      extraCssText: 'box-shadow: 0 14px 34px -20px rgba(18,48,91,0.45); border-radius: 12px;',
      formatter: (p) => `${p.name}<br/><strong>${emReais(p.value)}</strong> · ${p.percent}%`,
    },
    /* O total vai no meio do buraco: é o número que ela procura primeiro,
       e assim não precisa somar as duas fatias de cabeça. */
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: `${emReais(total)}\nno mês`,
        textAlign: 'center',
        fill: CORES.tinta,
        fontSize: 15,
        fontWeight: 700,
        lineHeight: 20,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['62%', '86%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        data: [
          { value: totalP, name: 'Personalizada', itemStyle: { color: CORES.personalizada } },
          { value: totalE, name: 'Pedagógica', itemStyle: { color: CORES.pedagogica } },
        ],
      },
    ],
  };

  /* A legenda embaixo carrega o valor e a proporção de cada linha: quem
     olha a rosca quer saber quanto, não só qual pedaço é maior. */
  return (
    <div>
      <ReactECharts option={opcao} style={{ height: 210, width: '100%' }} notMerge />

      <ul className="rosca-legenda">
        {fatias.map((fatia) => (
          <li key={fatia.nome}>
            <span className="rosca-bolinha" style={{ background: fatia.cor }} />
            <span className="rosca-nome">
              <strong>{fatia.nome}</strong>
              <span>{fatia.obs}</span>
            </span>
            <span className="rosca-valor">
              <strong>{emReais(fatia.valor)}</strong>
              <span>{Math.round((fatia.valor / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const MaisVendidos = () => {
  const ordenados = [...MAIS_VENDIDOS].sort((a, b) => a.unidades - b.unidades);

  const opcao = {
    ...base({ grid: { left: 8, right: 46, top: 8, bottom: 8, containLabel: true } }),
    tooltip: {
      trigger: 'item',
      backgroundColor: CORES.superficie,
      borderColor: CORES.linha,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: CORES.tinta, fontSize: 12.5 },
      extraCssText: 'box-shadow: 0 14px 34px -20px rgba(18,48,91,0.45); border-radius: 12px;',
      formatter: (p) => `${p.name}<br/><strong>${p.value} unidades</strong>`,
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: ordenados.map((p) => p.nome),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: CORES.tinta, fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        data: ordenados.map((p) => ({
          value: p.unidades,
          itemStyle: { color: degradeBarra(p.cor), borderRadius: [0, 6, 6, 0] },
        })),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          color: CORES.tintaSuave,
          fontSize: 12,
          fontWeight: 700,
          formatter: '{c}',
        },
      },
    ],
  };

  return <ReactECharts option={opcao} style={{ height: 240, width: '100%' }} notMerge />;
};
