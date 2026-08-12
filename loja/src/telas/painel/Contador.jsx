'use client'

import React, { useEffect, useState } from 'react';

/**
 * Número que sobe de zero até o valor.
 *
 * Vale para um painel que abre várias vezes por dia: o movimento diz onde
 * olhar sem precisar de seta nem cor. Quem pediu menos animação no sistema
 * recebe o valor final direto.
 */
const Contador = ({ valor, prefixo = '', sufixo = '', casas = 0, atraso = 0 }) => {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduzido || valor === 0) {
      setAtual(valor);
      return undefined;
    }

    let inicio;
    let quadro;

    const tempo = setTimeout(() => {
      const passo = (agora) => {
        if (!inicio) inicio = agora;
        const progresso = Math.min((agora - inicio) / 1100, 1);
        const suave = 1 - (1 - progresso) ** 3;
        setAtual(parseFloat((suave * valor).toFixed(casas)));
        if (progresso < 1) quadro = requestAnimationFrame(passo);
      };
      quadro = requestAnimationFrame(passo);
    }, atraso);

    return () => {
      clearTimeout(tempo);
      cancelAnimationFrame(quadro);
    };
  }, [valor, casas, atraso]);

  const formatado = atual.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

  return (
    <>
      {prefixo}
      {formatado}
      {sufixo}
    </>
  );
};

export default Contador;
