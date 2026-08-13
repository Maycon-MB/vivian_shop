'use client'

import React, { useState } from 'react';
import { Calendar, Check, RefreshCw } from 'lucide-react';
import CartaoPainel from './CartaoPainel';
import { Instagram } from '../icones-marca';

/**
 * Marketing.
 *
 * A sugestão sai do que já foi vendido, não de tema genérico: post sobre o
 * produto que mais sai converte melhor que post bonito sobre nada.
 *
 * Nada é publicado sem ela aprovar, e a tela repete isso onde a decisão
 * acontece. Automação que publica sozinha em nome de alguém quebra a
 * confiança na primeira vez que erra o tom.
 */

const SUGESTOES = [
  {
    id: 1,
    quando: 'Terça, 19h',
    tema: 'Caderno personalizado',
    porque: 'É o que mais vendeu no mês.',
    texto:
      'Cada caderno sai com o nome de quem vai usar. Simples assim — e faz toda diferença na hora de achar o material na mochila.',
  },
  {
    id: 2,
    quando: 'Quinta, 19h',
    tema: 'Apostila de alfabetização adaptada',
    porque: 'Material digital: quem compra recebe na hora.',
    texto:
      'Atividades pensadas para respeitar o ritmo de cada criança. Você recebe no e-mail e imprime quantas vezes precisar.',
  },
  {
    id: 3,
    quando: 'Sábado, 10h',
    tema: 'Bastidores da produção',
    porque: 'Sábado de manhã é quando seu perfil tem mais gente vendo.',
    texto:
      'Um pedido de 10 cadernos começando a tomar forma. É assim que cada encomenda passa pela minha mesa.',
  },
];

const AbaMarketing = () => {
  const [aprovados, setAprovados] = useState([]);

  const aprovar = (id) => setAprovados((atual) => [...atual, id]);

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <h1 className="painel-titulo">Marketing</h1>
        <p className="painel-subtitulo">
          Sugestões de post para esta semana, tiradas do que você já vendeu.
        </p>
      </header>

      <CartaoPainel
        titulo="Como isto funciona"
        subtitulo="Em três passos, sem surpresa."
        cor="#1F736F"
      >
        <ol className="passos">
          <li>
            <span>1</span>
            <div>
              <strong>Eu sugiro</strong>
              <p>A partir do que mais saiu e do que está parado na loja.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Você lê e ajusta</strong>
              <p>Muda o texto, troca a foto, ou descarta. É o seu perfil.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Agenda no horário sugerido</strong>
              <p>Nada vai ao ar sem você aprovar antes.</p>
            </div>
          </li>
        </ol>
      </CartaoPainel>

      <div className="posts-grade">
        {SUGESTOES.map((sugestao) => {
          const aprovado = aprovados.includes(sugestao.id);

          return (
            <article key={sugestao.id} className={`post-card ${aprovado ? 'aprovado' : ''}`}>
              <header>
                <span className="post-quando">
                  <Calendar size={13} /> {sugestao.quando}
                </span>
                {aprovado && (
                  <span className="post-agendado">
                    <Check size={13} /> Agendado
                  </span>
                )}
              </header>

              <div className="post-foto">
                <Instagram size={22} />
                <span>Sua foto do produto entra aqui</span>
              </div>

              <h3>{sugestao.tema}</h3>
              <p className="post-porque">{sugestao.porque}</p>
              <blockquote className="post-texto">{sugestao.texto}</blockquote>

              <div className="post-acoes">
                {aprovado ? (
                  <button type="button" className="acao-fantasma">
                    <RefreshCw size={15} /> Desfazer
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="acao-principal"
                      onClick={() => aprovar(sugestao.id)}
                    >
                      <Check size={15} /> Aprovar
                    </button>
                    <button type="button" className="acao-fantasma">
                      Editar texto
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="aviso-exemplo">
        <strong>Sugestões de exemplo.</strong> Na loja pronta elas saem dos seus produtos e das
        suas vendas — e continuam dependendo do seu sim.
      </p>
    </div>
  );
};

export default AbaMarketing;
