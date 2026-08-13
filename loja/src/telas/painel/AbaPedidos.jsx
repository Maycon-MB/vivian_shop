'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Printer, MessageCircle, Package, Download, Eye } from 'lucide-react';
import CartaoPainel from './CartaoPainel';
import InfoBotao from './InfoBotao';
import { PEDIDOS, ESTADOS, PRECISA_DE_ACAO, totalDe } from './dadosPedidos';
import { emReais } from './graficos';
import { carregarPedidosDaLoja } from './pedidosDaLoja';

/**
 * Pedidos.
 *
 * É a tela de trabalho: ela abre para descobrir o que fazer agora, não
 * para admirar. Por isso o que precisa dela vem primeiro, o filtro já
 * abre em "Precisa de você", e cada pedido carrega o próprio botão de
 * ação — obrigar a entrar no pedido para descobrir o que fazer custaria
 * um toque a mais em cada um, todo dia.
 *
 * Pedido atrasado sobe para o topo e ganha borda vermelha: é o único caso
 * em que a tela grita.
 */

const FILTROS = [
  { id: 'acao', rotulo: 'Precisa de você' },
  { id: 'todos', rotulo: 'Todos' },
  { id: 'producao', rotulo: 'Em produção' },
  { id: 'pronto', rotulo: 'Prontos' },
  { id: 'enviado', rotulo: 'A caminho' },
  { id: 'digital', rotulo: 'Digitais' },
];

const prazoTexto = (dias) => {
  if (dias === undefined) return null;
  if (dias < 0) return { texto: `${Math.abs(dias)} dia${Math.abs(dias) > 1 ? 's' : ''} atrasado`, urgente: true };
  if (dias === 0) return { texto: 'vence hoje', urgente: true };
  if (dias === 1) return { texto: 'falta 1 dia', urgente: false };
  return { texto: `faltam ${dias} dias`, urgente: false };
};

const AbaPedidos = ({ onAbrirEtiqueta }) => {
  const [filtro, setFiltro] = useState('acao');
  const [busca, setBusca] = useState('');
  const [daLoja, setDaLoja] = useState([]);

  /* Compras feitas na loja aparecem aqui junto com os exemplos. A leitura
     acontece depois da primeira renderização de propósito: o site é
     estático, e ler o navegador durante a montagem faria o HTML entregue
     divergir do que a tela desenha. */
  useEffect(() => {
    let vivo = true;
    carregarPedidosDaLoja().then((lista) => {
      if (vivo) setDaLoja(lista);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const todos = useMemo(() => [...daLoja, ...PEDIDOS], [daLoja]);

  /* A conta de cada filtro sai da mesma lista que a tela mostra. Contar só
     os exemplos faria o número no filtro discordar do que aparece embaixo
     dele assim que a primeira compra entrasse. */
  const contar = (id) =>
    todos.filter((pedido) => {
      if (id === 'todos') return true;
      if (id === 'acao') return PRECISA_DE_ACAO.includes(pedido.estado);
      return pedido.estado === id;
    }).length;

  const visiveis = useMemo(() => {
    const porFiltro = todos.filter((pedido) => {
      if (filtro === 'todos') return true;
      if (filtro === 'acao') return PRECISA_DE_ACAO.includes(pedido.estado);
      return pedido.estado === filtro;
    });

    const termo = busca.trim().toLowerCase();
    const porBusca = termo
      ? porFiltro.filter(
          (p) =>
            p.id.includes(termo) ||
            p.cliente.toLowerCase().includes(termo) ||
            p.itens.some((i) => i.nome.toLowerCase().includes(termo))
        )
      : porFiltro;

    // Atrasado primeiro: é o que custa caro deixar passar.
    return [...porBusca].sort((a, b) => (a.prazoDias ?? 99) - (b.prazoDias ?? 99));
  }, [filtro, busca, todos]);

  return (
    <div className="d-flex flex-column gap-3">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="painel-titulo">Pedidos</h1>
          <p className="painel-subtitulo">O que precisa de você aparece primeiro.</p>
        </div>

        <label className="pedido-busca">
          <Search size={16} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número, cliente ou produto"
            aria-label="Buscar pedido"
          />
        </label>
      </header>

      <nav className="filtros" aria-label="Filtrar pedidos">
        {FILTROS.map((opcao) => {
          const quantos = contar(opcao.id);

          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setFiltro(opcao.id)}
              aria-pressed={filtro === opcao.id}
              className={`filtro ${filtro === opcao.id ? 'ativo' : ''}`}
            >
              {opcao.rotulo}
              <span className="filtro-conta">{quantos}</span>
            </button>
          );
        })}
      </nav>

      {visiveis.length === 0 ? (
        <CartaoPainel titulo="Nada aqui" subtitulo="Nenhum pedido neste filtro.">
          <p className="text-muted mb-0">
            Experimente “Todos”, ou limpe a busca.
          </p>
        </CartaoPainel>
      ) : (
        <ul className="pedidos-lista">
          {visiveis.map((pedido) => {
            const estado = ESTADOS[pedido.estado];
            const prazo = prazoTexto(pedido.prazoDias);
            const digital = pedido.linha === 'pedagogica';

            return (
              <li
                key={`${pedido.daLoja ? 'loja' : 'exemplo'}-${pedido.id}`}
                className={`pedido ${prazo?.urgente ? 'urgente' : ''} cor-${estado.cor}`}
              >
                <div className="pedido-principal">
                  <div className="pedido-cabeca">
                    <span className="pedido-numero">#{pedido.id}</span>
                    {pedido.daLoja && <span className="pedido-daloja">feito agora na loja</span>}
                    <span className={`pedido-selo cor-${estado.cor}`}>{estado.rotulo}</span>
                    <InfoBotao texto={estado.explicacao} />
                    {prazo && (
                      <span className={`pedido-prazo ${prazo.urgente ? 'urgente' : ''}`}>
                        {prazo.texto}
                      </span>
                    )}
                  </div>

                  <p className="pedido-cliente">{pedido.cliente}</p>

                  <ul className="pedido-itens">
                    {pedido.itens.map((item) => (
                      <li key={item.nome}>
                        <strong>{item.quantidade}x</strong> {item.nome}
                      </li>
                    ))}
                  </ul>

                  <p className="pedido-meta">
                    {pedido.quando} · {pedido.cidade}
                    {pedido.transportadora && ` · ${pedido.transportadora}`}
                    {pedido.rastreio && ` · ${pedido.rastreio}`}
                  </p>
                </div>

                <div className="pedido-lado">
                  <span className="pedido-valor">{emReais(totalDe(pedido))}</span>
                  <span className="pedido-frete">
                    {digital ? 'sem frete' : `${emReais(pedido.frete)} de frete`}
                  </span>

                  <div className="pedido-acoes">
                    {pedido.estado === 'pronto' && (
                      <button type="button" className="acao-principal" onClick={onAbrirEtiqueta}>
                        <Printer size={16} /> Gerar etiqueta
                      </button>
                    )}

                    {pedido.estado === 'producao' && (
                      <button type="button" className="acao-secundaria">
                        <Package size={16} /> Marcar como pronto
                      </button>
                    )}

                    {pedido.estado === 'digital' && (
                      <button type="button" className="acao-secundaria">
                        <Download size={16} /> Reenviar arquivo
                      </button>
                    )}

                    {(pedido.estado === 'enviado' || pedido.estado === 'entregue') && (
                      <button type="button" className="acao-secundaria">
                        <Eye size={16} /> Ver pedido
                      </button>
                    )}

                    {pedido.estado !== 'aguardando' && (
                      <a
                        className="acao-whats"
                        href={`https://wa.me/55${pedido.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Falar com ${pedido.cliente} no WhatsApp`}
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* O texto muda quando entra pedido de verdade: dizer que está tudo
          errado — "são todos exemplo" — com uma venda real na lista faria a
          Vivian desconfiar da própria tela. */}
      <p className="aviso-exemplo">
        {daLoja.length > 0 ? (
          <>
            <strong>
              {daLoja.length === 1
                ? 'O pedido marcado como “feito agora na loja” veio de uma compra sua'
                : `Os ${daLoja.length} pedidos marcados como “feito agora na loja” vieram de compras suas`}
            </strong>{' '}
            nesta demonstração — nada foi cobrado, e eles ficam guardados só neste navegador. Os
            outros são exemplos, com nomes que não são de pessoas reais.
          </>
        ) : (
          <>
            <strong>Estes pedidos são de exemplo</strong>, para mostrar como a tela se comporta em
            cada situação. Os nomes não são de pessoas reais.
          </>
        )}
      </p>
    </div>
  );
};

export default AbaPedidos;
