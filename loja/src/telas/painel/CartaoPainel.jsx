'use client'

import React from 'react';
import InfoBotao from './InfoBotao';

/**
 * Bloco de conteúdo do painel.
 *
 * Título, subtítulo explicando o que o bloco mostra, e a ação no canto —
 * mesma estrutura em todos, para ela aprender uma vez e reconhecer sempre.
 */
const CartaoPainel = ({ titulo, subtitulo, info, acao, cor, children, semPadding }) => (
  <section className="painel-card" style={cor ? { '--card-cor': cor } : undefined}>
    {cor && <span className="painel-card-faixa" aria-hidden="true" />}

    <header className="painel-card-topo">
      <div className="painel-card-titulos">
        <h3>
          {titulo}
          {info && <InfoBotao texto={info} />}
        </h3>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {acao}
    </header>

    <div className={semPadding ? '' : 'painel-card-corpo'}>{children}</div>
  </section>
);

export default CartaoPainel;
