'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Users, Eye, ArrowRight } from 'lucide-react';
import CartaoPainel from './CartaoPainel';
import { movimentoDaLoja } from '@/dados/visitasNoBanco';
import {
  totalDoPeriodo,
  taxaDeConversao,
  conversaoEmTexto,
  leituraDaConversao,
  paginasPorVisita,
  nomeDaOrigem,
  pedidosNosUltimosDias,
} from '@/dominio/movimento';

/**
 * Quanta gente entrou na loja, e de onde veio.
 *
 * Existe por causa do anúncio pago. Sem este bloco ela paga o Instagram e
 * só descobre o resultado se alguém comprar; com ele vê a etapa do meio, e
 * consegue separar "o anúncio não trouxe ninguém" de "trouxe gente e a
 * loja não segurou". São problemas diferentes, com conserto diferente.
 *
 * A contagem não usa cookie e não identifica ninguém: o que existe no
 * banco é um contador por dia, página e origem. Isso é dito na tela, e não
 * só aqui, porque ela vai ser perguntada sobre isso por cliente.
 *
 * ── Por que a comparação, e não só o número ────────────────────────────
 *
 * "Entraram 240 pessoas" não decide nada sozinho. Ao lado dos pedidos do
 * mesmo período, decide: é a diferença entre gastar mais em anúncio e
 * gastar em foto melhor.
 */

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

/* A página como ela reconhece, e não como o endereço escreve.
   O endereço vem em minúscula e com traço no lugar do espaço; jogar isso
   na tela faz o relatório dela parecer log de servidor. */
const CONHECIDAS = {
  '/': 'Página inicial',
  '/produtos': 'Todos os produtos',
  '/como-funciona': 'Como funciona',
  '/sobre': 'Sobre a loja',
  '/carrinho': 'Carrinho',
  '/minha-conta': 'Minha conta',
};

const nomeDaPagina = (caminho) => {
  const conhecida = CONHECIDAS[caminho];
  if (conhecida) return conhecida;

  const legivel = caminho
    .replace(/^\/(produto|tema)\//, '')
    .replace(/^\//, '')
    .replace(/-/g, ' ');

  if (!legivel) return 'Página inicial';
  return legivel.charAt(0).toUpperCase() + legivel.slice(1);
};

const MovimentoDaLoja = ({ pedidos = [] }) => {
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    let valeu = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDados(null);
    movimentoDaLoja(dias).then((resposta) => {
      if (valeu) setDados(resposta);
    });
    return () => {
      valeu = false;
    };
  }, [dias]);

  const total = useMemo(() => totalDoPeriodo(dados?.porDia ?? []), [dados]);

  /* Da mesma janela que as visitas, e não do mês. Comparar visita de sete
     dias com pedido de trinta infla a taxa por quatro. */
  const quantosPedidos = useMemo(
    () => pedidosNosUltimosDias(pedidos, dias),
    [pedidos, dias],
  );
  const taxa = taxaDeConversao(total.visitantes, quantosPedidos);
  const porVisita = paginasPorVisita(total.visitantes, total.paginas);

  const seletor = (
    <div className="btn-group btn-group-sm" role="group" aria-label="Período">
      {PERIODOS.map((periodo) => (
        <button
          key={periodo.dias}
          type="button"
          className={`btn btn-sm ${dias === periodo.dias ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setDias(periodo.dias)}
        >
          {periodo.rotulo}
        </button>
      ))}
    </div>
  );

  return (
    <CartaoPainel
      titulo="Quem entrou na loja"
      subtitulo="Quanta gente chegou, de onde veio, e quanto disso virou pedido."
      info={
        'A loja conta quantas pessoas abriram cada página e de onde elas vieram. ' +
        'Não guarda nome, e-mail, telefone nem nada que identifique quem visitou: ' +
        'é só uma contagem. Por isso a loja não precisa daquele aviso de cookies ' +
        'que aparece em outros sites.'
      }
      acao={seletor}
    >
      {dados === null ? (
        <p className="text-secondary mb-0" role="status">
          Somando as visitas…
        </p>
      ) : total.visitantes === 0 && total.paginas === 0 ? (
        <p className="text-secondary mb-0">
          Ainda não há visita contada neste período. A contagem começou em 27/08:
          antes disso a loja não media nada, e o que passou não dá para recuperar.
        </p>
      ) : (
        <div className="d-flex flex-column gap-4">
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <Users size={16} aria-hidden="true" />
                Pessoas
              </div>
              <strong className="fs-4">{total.visitantes}</strong>
            </div>

            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <Eye size={16} aria-hidden="true" />
                Páginas abertas
              </div>
              <strong className="fs-4">{total.paginas}</strong>
              {porVisita !== null && (
                <div className="text-secondary small">
                  {porVisita.toFixed(1).replace('.', ',')} por pessoa
                </div>
              )}
            </div>

            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <ArrowRight size={16} aria-hidden="true" />
                Viraram pedido
              </div>
              <strong className="fs-4">{quantosPedidos}</strong>
            </div>

            <div className="col-6 col-lg-3">
              <div className="text-secondary small">De cada 100 que entram</div>
              <strong className="fs-4">{conversaoEmTexto(taxa)}</strong>
            </div>
          </div>

          <p className="text-secondary mb-0">{leituraDaConversao(taxa)}</p>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <h4 className="h6 mb-2">De onde vieram</h4>
              {dados.porOrigem.length === 0 ? (
                <p className="text-secondary small mb-0">Sem dado no período.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                  {dados.porOrigem.map((linha) => (
                    <li
                      key={linha.origem}
                      className="d-flex justify-content-between border-bottom py-1"
                    >
                      <span>{nomeDaOrigem(linha.origem)}</span>
                      <strong>{linha.visitantes}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-12 col-lg-6">
              <h4 className="h6 mb-2">O que mais olharam</h4>
              {dados.maisVistas.length === 0 ? (
                <p className="text-secondary small mb-0">Sem dado no período.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                  {dados.maisVistas.map((linha) => (
                    <li
                      key={linha.caminho}
                      className="d-flex justify-content-between border-bottom py-1"
                    >
                      <span className="text-truncate me-2">{nomeDaPagina(linha.caminho)}</span>
                      <strong>{linha.paginas}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </CartaoPainel>
  );
};

export default MovimentoDaLoja;
