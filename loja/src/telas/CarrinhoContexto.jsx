'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  podeAdicionarAoCarrinho,
  quantidadeMinima,
  permiteVariasUnidades,
  totalCarrinho,
} from '../catalogo';

/**
 * O carrinho, vivo entre as páginas.
 *
 * Enquanto ele morava dentro da vitrine, abrir a página de um produto
 * apagava tudo — o estado sumia junto com o componente. Agora ele fica
 * acima das páginas e é guardado no navegador, então também sobrevive a
 * fechar a aba: quem monta um pedido de dez cadernos e volta no dia
 * seguinte encontra o carrinho como deixou.
 *
 * As regras de venda continuam vindo do domínio testado. Aqui só existe o
 * que é de armazenamento.
 */

const Contexto = createContext(null);

const CHAVE = 'feito-para-voce:carrinho';

const ler = () => {
  if (typeof window === 'undefined') return [];
  try {
    const guardado = window.localStorage.getItem(CHAVE);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    // Armazenamento bloqueado ou conteúdo corrompido: começar vazio é
    // melhor que quebrar a loja inteira.
    return [];
  }
};

export const ProvedorCarrinho = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [aviso, setAviso] = useState(null);
  const [pronto, setPronto] = useState(false);

  /* A leitura acontece depois de montar: o HTML é gerado no build e não
     conhece o navegador de quem abre. Ler no estado inicial faria a
     primeira renderização divergir do HTML entregue. */
  useEffect(() => {
    setItens(ler());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      // Sem armazenamento, o carrinho vale só para esta visita.
    }
  }, [itens, pronto]);

  const adicionar = (produto, quantidade) => {
    const permissao = podeAdicionarAoCarrinho(itens, produto);

    if (!permissao.ok) {
      setAviso({ tipo: 'bloqueio', texto: permissao.motivo });
      return false;
    }

    const minimo = quantidadeMinima(produto.category);
    const quanto = Math.max(quantidade ?? minimo, minimo);
    const existente = itens.find((item) => item.id === produto.id);

    if (existente) {
      if (!permiteVariasUnidades(produto.category)) {
        setAviso({
          tipo: 'bloqueio',
          texto: 'Este material já está no carrinho. É um arquivo digital, uma unidade basta.',
        });
        return false;
      }

      alterarQuantidade(produto.id, existente.quantidade + quanto);
      setAviso({ tipo: 'ok', texto: 'Quantidade atualizada no carrinho' });
      return true;
    }

    setItens((atual) => [...atual, { ...produto, quantidade: quanto }]);
    setAviso({
      tipo: 'ok',
      texto: minimo > 1 ? `${quanto} unidades no carrinho` : 'Material adicionado ao carrinho',
    });
    return true;
  };

  const alterarQuantidade = (produtoId, novaQuantidade) => {
    setItens((atual) =>
      atual.flatMap((item) => {
        if (item.id !== produtoId) return [item];
        if (novaQuantidade < quantidadeMinima(item.category)) return [];
        return [{ ...item, quantidade: novaQuantidade }];
      })
    );
  };

  const remover = (produtoId) => setItens((atual) => atual.filter((i) => i.id !== produtoId));

  const esvaziar = () => setItens([]);

  const valor = useMemo(
    () => ({
      itens,
      pronto,
      aviso,
      setAviso,
      adicionar,
      alterarQuantidade,
      remover,
      esvaziar,
      total: totalCarrinho(itens),
      unidades: itens.reduce((soma, item) => soma + item.quantidade, 0),
      ehDigital: itens.length > 0 && itens[0].category === 'Papelaria pedagógica',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itens, aviso, pronto]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
};

export const useCarrinho = () => {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useCarrinho precisa estar dentro de ProvedorCarrinho');
  return contexto;
};
