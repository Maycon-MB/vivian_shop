'use client'

import React, { useState } from 'react';

/**
 * O "i" que explica o bloco.
 *
 * A cliente não é técnica, e um painel cheio de número sem explicação vira
 * enfeite: ela olha, não entende, e volta a controlar tudo no caderno. Cada
 * bloco carrega o próprio significado, na linguagem dela.
 *
 * Abre no clique e não no passar do mouse, porque no celular não existe
 * passar o mouse.
 */
const InfoBotao = ({ texto }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <span className="info-wrap">
      <button
        type="button"
        className={`info-btn ${aberto ? 'open' : ''}`}
        onClick={() => setAberto((v) => !v)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        aria-expanded={aberto}
        aria-label="O que este número significa?"
      >
        i
      </button>
      {aberto && <span className="info-pop">{texto}</span>}
    </span>
  );
};

export default InfoBotao;
