'use client'

import React, { useEffect, useState } from 'react';
import { Loader2, Star, Eye, EyeOff, Send } from 'lucide-react';

import {
  publicarAvaliacao,
  responderAvaliacao,
  todasAsAvaliacoes,
} from '@/dados/avaliacoesNoBanco';

/**
 * As avaliações, do lado dela.
 *
 * Ficou decidido em 26/08 que **ela decide o que vai ao ar, uma a uma**.
 * A loja é dela, e a vitrine também.
 *
 * As que esperam vêm primeiro, e não as mais recentes: uma avaliação
 * parada é uma cliente esperando ver o que escreveu, e prova social que a
 * loja não está usando.
 *
 * A tela não esconde nota baixa dela. Esconder faria a lista parecer menor
 * do que é, e o que ela precisa decidir é justamente sobre essas.
 */

const quando = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para mexer nas avaliações. Entre de novo, ou me chame.';
  }

  return 'Não consegui salvar agora. Tente de novo em instantes.';
};

const MinhasAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [erro, setErro] = useState('');
  const [respostas, setRespostas] = useState({});
  const [salvando, setSalvando] = useState(null);

  const carregar = () =>
    todasAsAvaliacoes()
      .then(setAvaliacoes)
      .catch((e) => { setAvaliacoes([]); setErro(recadoDoErro(e)); });

  useEffect(() => {
    let valendo = true;

    todasAsAvaliacoes()
      .then((lista) => { if (valendo) setAvaliacoes(lista); })
      .catch((e) => { if (valendo) { setAvaliacoes([]); setErro(recadoDoErro(e)); } });

    return () => { valendo = false; };
  }, []);

  const alternar = async (avaliacao) => {
    setErro('');
    setSalvando(avaliacao.id);

    try {
      await publicarAvaliacao(avaliacao.id, !avaliacao.publicada);
      await carregar();
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(null);
    }
  };

  const responder = async (id) => {
    const texto = (respostas[id] ?? '').trim();
    if (!texto) return;

    setErro('');
    setSalvando(id);

    try {
      await responderAvaliacao(id, texto);
      setRespostas((atuais) => ({ ...atuais, [id]: '' }));
      await carregar();
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(null);
    }
  };

  if (!avaliacoes) {
    return (
      <p className="produtos-carregando">
        <Loader2 size={18} className="girando" aria-hidden="true" /> Buscando as avaliações…
      </p>
    );
  }

  /* As que esperam primeiro. Dentro de cada grupo, a mais recente no topo. */
  const ordenadas = [...avaliacoes].sort((a, b) => {
    if (a.publicada !== b.publicada) return a.publicada ? 1 : -1;
    return b.quando.localeCompare(a.quando);
  });

  const esperando = avaliacoes.filter((a) => !a.publicada).length;

  return (
    <section className="conversas-painel">
      <header className="produtos-topo">
        <div>
          <h2>Avaliações</h2>
          <p className="produtos-conta">
            {esperando > 0
              ? <><strong>{esperando} esperando você</strong>, de {avaliacoes.length}</>
              : <>{avaliacoes.length} no ar, nenhuma esperando</>}
          </p>
        </div>
      </header>

      {erro && <p className="produtos-erro" role="alert">{erro}</p>}

      {avaliacoes.length === 0 && (
        <p className="produtos-vazio">
          Nenhuma avaliação ainda. Elas chegam quando as clientes responderem o convite que
          a loja manda depois da entrega.
        </p>
      )}

      {ordenadas.map((avaliacao) => (
        <article
          key={avaliacao.id}
          className={`conversa-item ${avaliacao.publicada ? 'respondida' : 'esperando'}`}
        >
          <header>
            <div>
              <h3>{avaliacao.nome}</h3>
              <p className="avaliacao-produto">
                {avaliacao.produto?.nome ?? 'Sobre a loja'}
              </p>
            </div>
            <span className="conversa-item-quando">{quando(avaliacao.quando)}</span>
          </header>

          <p className="avaliacao-nota" aria-label={`${avaliacao.nota} de 5 estrelas`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={15}
                aria-hidden="true"
                className={n <= avaliacao.nota ? 'cheia' : ''}
              />
            ))}
          </p>

          <blockquote className="avaliacao-texto">{avaliacao.texto}</blockquote>

          {avaliacao.resposta && (
            <p className="conversa-item-aviso">
              <strong>Você respondeu:</strong> {avaliacao.resposta}
            </p>
          )}

          <div className="conversa-item-principal">
            <button
              type="button"
              className={avaliacao.publicada ? 'produtos-tirar' : 'produtos-publicar'}
              onClick={() => alternar(avaliacao)}
              disabled={salvando === avaliacao.id}
            >
              {avaliacao.publicada
                ? <><EyeOff size={15} aria-hidden="true" /> Tirar do ar</>
                : <><Eye size={15} aria-hidden="true" /> Publicar na loja</>}
            </button>
          </div>

          <details className="conversa-item-aqui">
            <summary>{avaliacao.resposta ? 'Mudar a sua resposta' : 'Responder'}</summary>

            <div className="conversa-item-resposta">
              <label>
                <span className="visualmente-oculto">Responder a {avaliacao.nome}</span>
                <textarea
                  rows={2}
                  value={respostas[avaliacao.id] ?? ''}
                  onChange={(e) =>
                    setRespostas((atuais) => ({ ...atuais, [avaliacao.id]: e.target.value }))
                  }
                  placeholder="Obrigada pela sua compra!"
                />
              </label>

              <button
                type="button"
                className="conversa-enviar"
                onClick={() => responder(avaliacao.id)}
                disabled={salvando === avaliacao.id || !(respostas[avaliacao.id] ?? '').trim()}
              >
                <Send size={15} aria-hidden="true" /> Salvar
              </button>
            </div>

            {/* A resposta aparece junto da avaliação na loja, e é o que
                transforma uma reclamação em prova de que ela resolve. */}
            <p className="conversa-item-aviso">
              A sua resposta aparece embaixo da avaliação, na loja.
            </p>
          </details>
        </article>
      ))}
    </section>
  );
};

export default MinhasAvaliacoes;
