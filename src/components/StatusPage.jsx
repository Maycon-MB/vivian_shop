import React, { useEffect, useRef } from 'react';
import '../styles/identity.css';
import {
  DECISOES,
  ESTADOS,
  ORDEM,
  QUEM,
  ATUALIZADO_EM,
  porEstado,
  ETAPAS,
  FASES,
  ORDEM_FASES,
  porFase,
} from '../decisoes';

/**
 * Página de acompanhamento, lida pela cliente e pelo Maycon no mesmo link.
 *
 * Duas partes: como está a construção, e o que já foi combinado. O que
 * depende de resposta dela vem primeiro nas duas — quem abre a página numa
 * pausa do dia precisa ver logo o que trava, não rolar por tudo que já
 * está resolvido.
 */

const useHighlightOnScroll = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const marks = root.querySelectorAll('[data-mark]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      marks.forEach((mark) => mark.classList.add('on'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.9 }
    );

    marks.forEach((mark) => observer.observe(mark));
    return () => observer.disconnect();
  }, []);

  return rootRef;
};

const Decisao = ({ item }) => (
  <article className={`decisao is-${item.estado}`}>
    <div className="decisao-topo">
      <h3>{item.assunto}</h3>
      <span className="decisao-meta">{QUEM[item.quem]} · {item.data}</span>
    </div>

    <p className="decisao-texto">{item.decisao}</p>

    {item.porque && (
      <p className="decisao-porque"><strong>Por quê:</strong> {item.porque}</p>
    )}

    {item.pergunta && (
      <p className="decisao-pergunta">{item.pergunta}</p>
    )}
  </article>
);

const StatusPage = () => {
  const rootRef = useHighlightOnScroll();

  const aguardando = porEstado('aguardando').length;
  const aprovado = porEstado('aprovado').length;
  const prontas = porFase('pronto').length;

  return (
    <div className="identity" ref={rootRef}>
      <header className="masthead">
        <div className="wrap">
          <h1>Onde o projeto está</h1>
          <span className="meta">Atualizado em {ATUALIZADO_EM}</span>
        </div>
      </header>

      <section className="ruled">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Para que serve esta página</p>
            <h2>
              Tudo que a gente combinar fica <span className="mark" data-mark>escrito aqui</span>.
            </h2>
            <p>
              Conversa de WhatsApp se perde. Aqui fica o que já foi decidido, o que está sendo
              construído e o que ainda depende de você — para nenhum de nós dois precisar lembrar
              de cabeça daqui a três meses.
            </p>
            <p>
              Se alguma coisa estiver diferente do que você quis dizer, me fala que eu corrijo.
              Mudar de ideia é normal, e quanto mais cedo, mais barato.
            </p>
          </div>

          <div className="placar">
            <div className="placar-item is-aguardando">
              <span className="placar-n">{aguardando}</span>
              <span className="placar-rotulo">esperando você</span>
            </div>
            <div className="placar-item is-aprovado">
              <span className="placar-n">{aprovado}</span>
              <span className="placar-rotulo">já combinados</span>
            </div>
            <div className="placar-item is-pronto">
              <span className="placar-n">{prontas}/{ETAPAS.length}</span>
              <span className="placar-rotulo">etapas prontas</span>
            </div>
          </div>

          <div className="note">
            <strong>Importante:</strong> o que você vê nas outras telas ainda é uma amostra, com
            produtos e valores de exemplo. A loja que vende de verdade está sendo construída — o
            que está pronto e o que falta você acompanha logo abaixo.
          </div>

          {/* A loja real vive num endereço próprio, fora do protótipo. Enquanto
              as duas coexistem, a cliente precisa de um caminho para chegar lá. */}
          <a className="chamada-loja" href={`${import.meta.env.BASE_URL}loja/`}>
            <span className="chamada-rotulo">Novo</span>
            <span className="chamada-texto">
              <strong>Espiar a loja de verdade sendo construída</strong>
              <span>
                Ainda com produtos de exemplo, mas já é o site que vai ao ar — não mais um
                desenho.
              </span>
            </span>
            <span className="chamada-seta" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">A construção</p>
            <h2>O que está <span className="mark" data-mark>pronto</span> e o que falta.</h2>
          </div>

          {ORDEM_FASES.map((fase) => {
            const etapas = porFase(fase);
            if (etapas.length === 0) return null;

            return (
              <div className="fase" key={fase}>
                <h3 className={`fase-titulo is-${fase}`}>{FASES[fase].rotulo}</h3>
                <ul className="etapas">
                  {etapas.map((etapa) => (
                    <li className={`etapa is-${fase}`} key={etapa.nome}>
                      <span className="etapa-marca" aria-hidden="true" />
                      <div>
                        <strong>{etapa.nome}</strong>
                        <span>{etapa.detalhe}</span>
                        {etapa.prototipo && (
                          <span className="etapa-nota">Feito como amostra, para você ver e opinar</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {ORDEM.map((estado) => {
        const itens = DECISOES.filter((d) => d.estado === estado);
        if (itens.length === 0) return null;

        return (
          <section key={estado}>
            <div className="wrap">
              <div className="sec-head">
                <p className="eyebrow">{ESTADOS[estado].rotulo}</p>
                <h2>{ESTADOS[estado].titulo}</h2>
                <p>{ESTADOS[estado].descricao}</p>
              </div>

              <div className="decisoes">
                {itens.map((item) => <Decisao item={item} key={item.id} />)}
              </div>
            </div>
          </section>
        );
      })}

      <footer>
        <div className="wrap">
          <p>
            Pode responder aos poucos, na ordem que quiser. Nada aqui é urgente a ponto de
            atrapalhar o seu dia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StatusPage;
