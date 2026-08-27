'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Hammer, AlertCircle, Info } from 'lucide-react';
import CartaoPainel from './CartaoPainel';
import InfoBotao from './InfoBotao';
import { emReais } from './graficos';
import { PEDIDOS, criadoEmDe } from './dadosPedidos';
import { carregarPedidosDaLoja } from './pedidosDaLoja';
import MovimentoDaLoja from './MovimentoDaLoja';
import {
  fecharOMes,
  oQueProduzir,
  compararComElo7,
  gerarCsvDoMes,
  TAXA_ELO7_ESTIMADA,
} from '@/dominio/relatorios';

/**
 * Relatórios.
 *
 * Responde três perguntas, nesta ordem, porque é a ordem em que ela
 * pergunta: quanto entrou, o que eu faço agora, e valeu a pena ter saído
 * do Elo7.
 *
 * O que esta tela mais evita é o número bonito e errado. Faturamento com
 * frete somado dentro é o exemplo clássico: parece maior, e é o jeito mais
 * comum de uma artesã achar que lucrou num mês em que empatou. Aqui o
 * frete aparece sempre separado e sempre nomeado como repasse.
 *
 * As contas moram em dominio/relatorios.ts, testadas. Aqui só se mostra.
 */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/* O que a loja custa por mês hoje. Hospedagem R$ 0 (GitHub Pages) e o
   domínio, que sai por volta de R$ 40 por ano. O valor da manutenção é o
   combinado com o Maycon. */
const CUSTO_MENSAL = 100;

/* "em 1 pedidos" é o tipo de descuido que faz a tela parecer amadora, e
   quem lê nota antes de notar qualquer outra coisa. */
const emPedidos = (quantos) => (quantos === 1 ? '1 pedido' : `${quantos} pedidos`);

const AbaRelatorios = () => {
  const [daLoja, setDaLoja] = useState([]);
  const [taxaElo7, setTaxaElo7] = useState(TAXA_ELO7_ESTIMADA * 100);
  const [hoje, setHoje] = useState(null);

  useEffect(() => {
    // A data entra depois de montar: o HTML sai do build, e calcular o mês
    // durante a renderização faria a página entregue mostrar um mês e a
    // tela outro assim que virasse a meia-noite.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoje(new Date());
    carregarPedidosDaLoja().then(setDaLoja);
  }, []);

  const pedidos = useMemo(
    () => [
      ...daLoja.map((p) => ({ ...p, criadoEm: p.criadoEmISO ?? new Date().toISOString() })),
      ...PEDIDOS.map((p) => ({ ...p, criadoEm: criadoEmDe(p) })),
    ],
    [daLoja],
  );

  /* Só os pedidos de verdade, e não os de demonstração.
     A taxa de conversão compara com quem entrou na loja de verdade;
     misturar pedido inventado ali faria a loja parecer converter bem
     enquanto ninguém compra, que é o erro mais caro que este bloco pode
     cometer: ela manteria um anúncio que não devolve nada. */
  const pedidosReais = useMemo(
    () => daLoja.map((pedido) => ({ criadoEm: pedido.criadoEmISO })),
    [daLoja],
  );

  const mes = useMemo(() => (hoje ? fecharOMes(pedidos, hoje) : null), [pedidos, hoje]);
  const fila = useMemo(() => oQueProduzir(pedidos), [pedidos]);

  const comparacao = useMemo(
    () => (mes ? compararComElo7(mes.receita, CUSTO_MENSAL, taxaElo7 / 100) : null),
    [mes, taxaElo7],
  );

  const baixarCsv = () => {
    const csv = gerarCsvDoMes(pedidos, hoje);
    // BOM na frente: sem ele o Excel abre "Pedagógica" como "PedagÃ³gica".
    const arquivo = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(arquivo);
    link.download = `vendas-${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!mes) return null;

  const nomeDoMes = `${MESES[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  const semVenda = mes.pedidos === 0;

  return (
    <div className="d-flex flex-column gap-3">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="painel-titulo">Relatórios</h1>
          <p className="painel-subtitulo">Como foi {nomeDoMes}, até agora.</p>
        </div>

        <button type="button" className="acao-principal" onClick={baixarCsv} disabled={semVenda}>
          <Download size={16} /> Baixar para o contador
        </button>
      </header>

      {/* Antes do fechamento, e fora do `semVenda`: mês sem venda é
          exatamente quando ela precisa saber se entrou gente. */}
      <MovimentoDaLoja pedidos={pedidosReais} />

      {semVenda ? (
        <CartaoPainel titulo="Nenhuma venda este mês" subtitulo="Ainda.">
          <p className="text-muted mb-0">
            Quando a primeira venda entrar, o fechamento aparece aqui sozinho.
          </p>
        </CartaoPainel>
      ) : (
        <>
          {/* ── Quanto entrou ─────────────────────────────────────────── */}
          <section className="relatorio-bloco">
            <h2>
              <TrendingUp size={18} /> Quanto entrou
            </h2>

            <div className="relatorio-numeros">
              <div className="relatorio-numero destaque">
                <span className="rotulo">
                  O que é seu
                  <InfoBotao texto="O valor dos produtos, já com o desconto do Pix descontado. É desta linha que sai o seu ganho." />
                </span>
                <strong>{emReais(mes.receita)}</strong>
                <span className="detalhe">{mes.pedidos} pedidos · {mes.pecas} peças</span>
              </div>

              <div className="relatorio-numero">
                <span className="rotulo">
                  Frete (não é seu)
                  <InfoBotao texto="A cliente pagou, mas este dinheiro vai inteiro para os Correios ou para a Jadlog. Não conte como ganho." />
                </span>
                <strong>{emReais(mes.freteRepassado)}</strong>
                <span className="detalhe">passa pela sua conta e sai</span>
              </div>

              <div className="relatorio-numero">
                <span className="rotulo">Ticket médio</span>
                <strong>{emReais(mes.ticketMedio)}</strong>
                <span className="detalhe">por pedido, sem o frete</span>
              </div>

              <div className="relatorio-numero">
                <span className="rotulo">Desconto do Pix</span>
                <strong>{emReais(mes.descontosDados)}</strong>
                <span className="detalhe">o que você abriu mão para receber na hora</span>
              </div>
            </div>

            <p className="relatorio-conta">
              A cliente pagou <strong>{emReais(mes.movimentado)}</strong> no total.
              Tirando {emReais(mes.freteRepassado)} de frete, ficaram{' '}
              <strong>{emReais(mes.receita)}</strong> com você.
            </p>

            <div className="relatorio-linhas">
              <div>
                <span className="ponto personalizada" aria-hidden="true" />
                Personalizada: {emReais(mes.porLinha.personalizada.receita)} em{' '}
                {emPedidos(mes.porLinha.personalizada.pedidos)}
              </div>
              <div>
                <span className="ponto pedagogica" aria-hidden="true" />
                Pedagógica: {emReais(mes.porLinha.pedagogica.receita)} em{' '}
                {emPedidos(mes.porLinha.pedagogica.pedidos)}
                <InfoBotao texto="O material digital não tem frete nem produção: o que vende aqui é ganho quase inteiro." />
              </div>
            </div>
          </section>

          {/* ── O que produzir ────────────────────────────────────────── */}
          <section className="relatorio-bloco">
            <h2>
              <Hammer size={18} /> O que produzir agora
            </h2>

            {fila.length === 0 ? (
              <p className="text-muted mb-0">Nada na fila. Tudo que estava pago já saiu.</p>
            ) : (
              <>
                <p className="relatorio-explica">
                  Somando os pedidos que ainda estão com você. Fazer tudo de uma peça de uma vez
                  economiza o dia inteiro de quem faz à mão.
                </p>

                <ul className="produzir-lista">
                  {fila.map((item) => (
                    <li key={item.nome}>
                      <strong>{item.quantidade}</strong>
                      <span>
                        {item.nome}
                        <em>
                          {item.emQuantosPedidos === 1
                            ? 'de 1 pedido'
                            : `de ${item.emQuantosPedidos} pedidos`}
                        </em>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ── Elo7 ──────────────────────────────────────────────────── */}
          <section className="relatorio-bloco">
            <h2>Comparando com o Elo7</h2>

            {!comparacao.confirmada && (
              <p className="relatorio-aviso">
                <AlertCircle size={15} /> A porcentagem abaixo é um chute meu, não um número
                seu. Me diga quanto o Elo7 tirava de cada venda e esta conta passa a valer.
              </p>
            )}

            <label className="relatorio-taxa">
              O Elo7 ficava com
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={taxaElo7}
                onChange={(e) => setTaxaElo7(Number(e.target.value) || 0)}
                aria-label="Porcentagem que o Elo7 cobrava por venda"
              />
              % de cada venda
            </label>

            <div className="relatorio-numeros">
              <div className="relatorio-numero">
                <span className="rotulo">Lá, você pagaria</span>
                <strong>{emReais(comparacao.ficariaComOElo7)}</strong>
                <span className="detalhe">sobre {emReais(mes.receita)} vendidos</span>
              </div>

              <div className="relatorio-numero">
                <span className="rotulo">Aqui você paga</span>
                <strong>{emReais(comparacao.custoDaquiPorMes)}</strong>
                <span className="detalhe">fixo, vendendo muito ou pouco</span>
              </div>

              <div
                className={`relatorio-numero ${comparacao.economia >= 0 ? 'destaque' : 'atencao'}`}
              >
                <span className="rotulo">
                  {comparacao.economia >= 0 ? 'Você economizou' : 'Este mês saiu mais caro'}
                </span>
                <strong>{emReais(Math.abs(comparacao.economia))}</strong>
                <span className="detalhe">
                  {comparacao.economia >= 0
                    ? 'a mais no seu bolso este mês'
                    : 'o fixo só compensa vendendo mais'}
                </span>
              </div>
            </div>

            {comparacao.economia < 0 && (
              <p className="relatorio-explica">
                Isso não quer dizer que foi um mau negócio. A mensalidade é fixa: num mês de{' '}
                {emReais(comparacao.custoDaquiPorMes / (taxaElo7 / 100 || 1))} vendidos ela
                empata, e daí para cima tudo que você vende a mais fica com você.
              </p>
            )}
          </section>

          <p className="aviso-exemplo">
            <Info size={15} />{' '}
            <strong>Estes números incluem os pedidos de exemplo.</strong> Quando a loja abrir de
            verdade, só as suas vendas entram na conta.
          </p>
        </>
      )}
    </div>
  );
};

export default AbaRelatorios;
