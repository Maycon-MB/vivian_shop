'use client'

import React, { useEffect, useState } from 'react';

/**
 * Número que sobe de zero até o valor.
 *
 * O movimento diz onde olhar sem precisar de seta nem cor, num painel que
 * abre várias vezes por dia.
 *
 * O estado começa no valor final, e a animação só desce e sobe a partir
 * dele. Se ela não rodar — aba em segundo plano, captura de tela, quem
 * pediu menos animação — o número certo já está na tela. Começar em zero e
 * depender da animação para chegar ao valor é como um painel mostra
 * R$ 0,00 tendo vendido dezesseis mil.
 */
const Contador = ({ valor, prefixo = '', sufixo = '', casas = 0, atraso = 0 }) => {
  const [atual, setAtual] = useState(valor);

  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sem animação, o estado inicial já é o valor: nada a fazer.
    if (reduzido || valor === 0) return undefined;

    let inicio;
    let quadro;
    let cancelado = false;

    // Rede de segurança: se a animação não terminar, o valor certo entra.
    const garantia = setTimeout(() => {
      if (!cancelado) setAtual(valor);
    }, atraso + 1100);

    const tempo = setTimeout(() => {
      const passo = (agora) => {
        if (cancelado) return;
        if (!inicio) inicio = agora;

        const progresso = Math.min((agora - inicio) / 750, 1);
        const suave = 1 - (1 - progresso) ** 3;

        setAtual(parseFloat((suave * valor).toFixed(casas)));

        if (progresso < 1) quadro = requestAnimationFrame(passo);
        else setAtual(valor);
      };

      quadro = requestAnimationFrame(passo);
    }, atraso);

    return () => {
      cancelado = true;
      clearTimeout(tempo);
      clearTimeout(garantia);
      if (quadro) cancelAnimationFrame(quadro);
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
