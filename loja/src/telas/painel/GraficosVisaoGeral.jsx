'use client'

import React, { useState } from 'react';
import Grafico from './Grafico';
import {
  base,
  eixoCategoria,
  eixoValor,
  degradeBarra,
  degradeColuna,
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
  { nome: 'Kit rotina visual', unidades: 54, cor: CORES.pedagogica },
  { nome: 'Marcador de página', unidades: 40, cor: CORES.personalizada },
];

const somar = (lista) => lista.reduce((a, b) => a + b, 0);

/**
 * Períodos que ela pode olhar.
 *
 * A granularidade muda junto: trinta barras de dia cabem na tela, trezentas
 * e sessenta não. Em três meses agrupa por semana; no ano, por mês. Barra
 * por dia num período longo vira serrilhado ilegível.
 */
const PERIODOS = [
  { id: '7d', rotulo: '7 dias', dias: 7, agrupar: 'dia' },
  { id: '30d', rotulo: '30 dias', dias: 30, agrupar: 'dia' },
  { id: '90d', rotulo: '3 meses', dias: 90, agrupar: 'semana' },
  { id: '12m', rotulo: '12 meses', dias: 360, agrupar: 'mes' },
];

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Repete a base de exemplo até cobrir o período pedido. */
const esticar = (base, tamanho) =>
  Array.from({ length: tamanho }, (_, i) => base[i % base.length]);

const agrupar = (valores, tamanhoGrupo) => {
  const grupos = [];
  for (let i = 0; i < valores.length; i += tamanhoGrupo) {
    grupos.push(somar(valores.slice(i, i + tamanhoGrupo)));
  }
  return grupos;
};

const montarPeriodo = (periodo) => {
  const p = esticar(VENDAS_PERSONALIZADA, periodo.dias);
  const e = esticar(VENDAS_PEDAGOGICA, periodo.dias);

  if (periodo.agrupar === 'dia') {
    return {
      rotulos: Array.from({ length: periodo.dias }, (_, i) => `${String((i % 30) + 1).padStart(2, '0')}/07`),
      personalizada: p,
      pedagogica: e,
      intervalo: periodo.dias > 14 ? 2 : 0,
    };
  }

  if (periodo.agrupar === 'semana') {
    return {
      rotulos: Array.from({ length: Math.ceil(periodo.dias / 7) }, (_, i) => `sem ${i + 1}`),
      personalizada: agrupar(p, 7),
      pedagogica: agrupar(e, 7),
      intervalo: 1,
    };
  }

  return {
    rotulos: MESES,
    personalizada: agrupar(p, 30),
    pedagogica: agrupar(e, 30),
    intervalo: 0,
  };
};

/**
 * Mapa de calendário.
 *
 * Responde uma pergunta que a barra não responde: em que dia da semana ela
 * vende mais. Quem descobre que vende às segundas passa a postar no
 * domingo — é a informação que vira decisão de marketing.
 *
 * A barra continua servindo para "quanto entrou e de que linha". São
 * perguntas diferentes, por isso as duas convivem no mesmo bloco.
 */
const Calendario = ({ dias }) => {
  const inicio = new Date(2026, 6, 1);

  const dados = dias.map((valor, i) => {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + i);
    const iso = data.toISOString().slice(0, 10);
    return [iso, valor];
  });

  const maximo = Math.max(...dias, 1);

  const opcao = {
    tooltip: {
      backgroundColor: CORES.superficie,
      borderColor: CORES.linha,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: CORES.tinta, fontSize: 12.5 },
      extraCssText: 'box-shadow: 0 14px 34px -20px rgba(18,48,91,0.45); border-radius: 12px;',
      formatter: (p) => {
        const [iso, valor] = p.value;
        const [, mes, dia] = iso.split('-');
        return valor ? `${dia}/${mes}<br/><strong>${emReais(valor)}</strong>` : `${dia}/${mes}<br/>sem venda`;
      },
    },
    visualMap: {
      min: 0,
      max: maximo,
      show: false,
      /* Hex cru, e não `var()`: o gráfico desenha em canvas, e canvas não
         resolve variável de CSS. São os mesmos verdes da marca, escritos
         à mão só aqui. */
      inRange: { color: ['#EDF7F6', '#9AD5D1', '#237C79', '#1B6B67'] },
    },
    calendar: {
      top: 30,
      left: 40,
      right: 12,
      cellSize: ['auto', 34],
      range: '2026-07',
      splitLine: { show: false },
      itemStyle: { borderWidth: 3, borderColor: CORES.superficie, color: '#F4F7FB' },
      yearLabel: { show: false },
      monthLabel: { show: false },
      dayLabel: {
        firstDay: 1,
        nameMap: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        color: CORES.tintaSuave,
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: dados,
        itemStyle: { borderRadius: 6 },
      },
    ],
  };

  return <Grafico option={opcao} />;
};

const MODOS = [
  { id: 'barras', rotulo: 'Por dia' },
  { id: 'calendario', rotulo: 'Calendário' },
];

export const VendasPorDia = () => {
  const [periodo, setPeriodo] = useState(PERIODOS[1]);
  const [modo, setModo] = useState('barras');
  const dados = montarPeriodo(periodo);

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
      ...eixoCategoria(dados.rotulos),
      boundaryGap: true,
      axisLabel: { color: CORES.tintaSuave, fontSize: 10.5, interval: dados.intervalo },
    },
    yAxis: eixoValor({
      axisLabel: { color: CORES.tintaSuave, fontSize: 11, formatter: (v) => `R$ ${compacto(v)}` },
    }),
    series: [
      {
        name: 'Personalizada',
        type: 'bar',
        stack: 'periodo',
        data: dados.personalizada,
        itemStyle: { color: degradeColuna(CORES.personalizada) },
        barMaxWidth: 26,
        emphasis: { focus: 'series' },
      },
      {
        name: 'Pedagógica',
        type: 'bar',
        stack: 'periodo',
        data: dados.pedagogica,
        // O arredondamento vai só na série de cima da pilha, senão cada
        // pedaço vira uma cápsula solta.
        itemStyle: { color: degradeColuna(CORES.pedagogica), borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 26,
        emphasis: { focus: 'series' },
      },
    ],
  });

  const somaDias = esticar(VENDAS_PERSONALIZADA, 31).map(
    (v, i) => v + esticar(VENDAS_PEDAGOGICA, 31)[i]
  );

  return (
    <div>
      <div className="grafico-controles">
        <div className="periodo-seletor" role="group" aria-label="Modo de visualização">
          {MODOS.map((opcaoModo) => (
            <button
              key={opcaoModo.id}
              type="button"
              onClick={() => setModo(opcaoModo.id)}
              aria-pressed={modo === opcaoModo.id}
              className={modo === opcaoModo.id ? 'ativo' : ''}
            >
              {opcaoModo.rotulo}
            </button>
          ))}
        </div>

        {modo === 'barras' && (
          <div className="periodo-seletor" role="group" aria-label="Período">
            {PERIODOS.map((opcaoPeriodo) => (
              <button
                key={opcaoPeriodo.id}
                type="button"
                onClick={() => setPeriodo(opcaoPeriodo)}
                aria-pressed={periodo.id === opcaoPeriodo.id}
                className={periodo.id === opcaoPeriodo.id ? 'ativo' : ''}
              >
                {opcaoPeriodo.rotulo}
              </button>
            ))}
          </div>
        )}
      </div>

      {modo === 'barras' ? (
        <Grafico option={opcao} />
      ) : (
        <Calendario dias={somaDias} />
      )}
    </div>
  );
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
      <Grafico option={opcao} height={210} />

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

  return <Grafico option={opcao} height={300} />;
};
