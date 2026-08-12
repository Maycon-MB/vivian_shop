'use client'

import React from 'react';
import Contador from './Contador';
import InfoBotao from './InfoBotao';

/**
 * Número em destaque do painel.
 *
 * A faixa colorida no topo diz de que assunto é o número sem precisar ler:
 * verde-água é venda, amarelo é o que espera ela, azul é catálogo, rosa é
 * dinheiro economizado. Mesma leitura da lista de pedidos, para a cor
 * significar sempre a mesma coisa no sistema inteiro.
 */
const CartaoKpi = ({ rotulo, valor, prefixo, sufixo, casas, icone, cor, nota, info, atraso }) => (
  <div className="kpi-card" style={{ '--kpi-cor': cor }}>
    <span className="kpi-faixa" aria-hidden="true" />

    <div className="kpi-topo">
      <span className="kpi-icone">{icone}</span>
      {info && <InfoBotao texto={info} />}
    </div>

    <p className="kpi-rotulo">{rotulo}</p>

    <p className="kpi-valor">
      <Contador valor={valor} prefixo={prefixo} sufixo={sufixo} casas={casas} atraso={atraso} />
    </p>

    {nota && <p className="kpi-nota">{nota}</p>}
  </div>
);

export default CartaoKpi;
