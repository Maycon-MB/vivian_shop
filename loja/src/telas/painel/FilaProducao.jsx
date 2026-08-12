'use client'

import React from 'react';

/**
 * Fila de produção.
 *
 * Não é gráfico de propósito: aqui a pergunta não é "quanto", é "o que eu
 * faço primeiro". Uma lista ordenada por urgência responde melhor que
 * qualquer barra, e cabe no celular sem rolar para o lado.
 *
 * A barra mostra quanto do prazo já passou, não quanto do trabalho está
 * feito — o sistema não tem como saber o segundo, e fingir que sabe seria
 * mentir para quem depende disso para se organizar.
 */

const FILA = [
  { pedido: '0003', item: '10x Cartela de adesivos e 10x Bloco', diasPassados: 5, prazo: 5 },
  { pedido: '0005', item: '20x Caderno personalizado', diasPassados: 3, prazo: 5 },
  { pedido: '0006', item: '10x Caneca personalizada', diasPassados: 1, prazo: 5 },
];

const cor = (restantes) => {
  if (restantes <= 0) return '#C4436B';
  if (restantes <= 1) return '#FFD400';
  return '#2E9B96';
};

const legenda = (restantes) => {
  if (restantes < 0) return `${Math.abs(restantes)} dias atrasado`;
  if (restantes === 0) return 'vence hoje';
  if (restantes === 1) return 'falta 1 dia';
  return `faltam ${restantes} dias`;
};

const FilaProducao = () => (
  <div>
    {FILA.map((linha) => {
      const restantes = linha.prazo - linha.diasPassados;
      const proporcao = Math.min((linha.diasPassados / linha.prazo) * 100, 100);

      return (
        <div className="fila-item" key={linha.pedido} style={{ '--fila-cor': cor(restantes) }}>
          <div className="fila-topo">
            <span className="fila-nome">
              #{linha.pedido} · {linha.item}
            </span>
            <span className="fila-prazo" style={{ color: cor(restantes), fontWeight: 700 }}>
              {legenda(restantes)}
            </span>
          </div>

          <div
            className="fila-barra"
            role="img"
            aria-label={`Pedido ${linha.pedido}: ${legenda(restantes)}`}
          >
            <div className="fila-progresso" style={{ width: `${proporcao}%` }} />
          </div>
        </div>
      );
    })}
  </div>
);

export default FilaProducao;
