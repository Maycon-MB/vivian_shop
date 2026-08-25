'use client'

import React, { useEffect, useState } from 'react';
import { Loader2, Send, Mail } from 'lucide-react';

import { listarConversas, responderConversa } from '@/dados/conversasDaDona';

/**
 * As conversas, do lado dela.
 *
 * Substitui a caixa de mensagens de exemplo. Duas decisões, e as duas
 * vieram do que ela reclamou do WhatsApp em 24/08:
 *
 *   1. **Só o que precisa dela aparece.** As conversas resolvidas pelos
 *      botões não entram aqui. Caixa de entrada cheia de conversa
 *      resolvida é caixa que ela para de abrir, e aí a que importava
 *      passa batida.
 *   2. **Quem ainda espera vem primeiro.** Não é a mais recente no topo,
 *      é a que está sem resposta. A dúvida antes da compra tem prazo de
 *      validade curto: a cliente está montando a festa hoje.
 */

const quando = (iso) => {
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para ver as conversas. Entre de novo, ou me chame.';
  }

  return 'Não consegui carregar as conversas agora. Tente de novo em instantes.';
};

const MinhasConversas = () => {
  const [conversas, setConversas] = useState(null);
  const [erro, setErro] = useState('');
  const [respostas, setRespostas] = useState({});
  const [enviando, setEnviando] = useState(null);

  const carregar = () =>
    listarConversas()
      .then(setConversas)
      .catch((e) => { setConversas([]); setErro(recadoDoErro(e)); });

  useEffect(() => {
    let valendo = true;

    listarConversas()
      .then((lista) => { if (valendo) setConversas(lista); })
      .catch((e) => { if (valendo) { setConversas([]); setErro(recadoDoErro(e)); } });

    return () => { valendo = false; };
  }, []);

  const responder = async (id) => {
    const texto = (respostas[id] ?? '').trim();
    if (!texto) return;

    setErro('');
    setEnviando(id);

    try {
      await responderConversa(id, texto);
      setRespostas((atuais) => ({ ...atuais, [id]: '' }));
      await carregar();
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setEnviando(null);
    }
  };

  if (!conversas) {
    return (
      <p className="produtos-carregando">
        <Loader2 size={18} className="girando" aria-hidden="true" /> Buscando as conversas…
      </p>
    );
  }

  /* Quem ainda espera vem primeiro. Dentro de cada grupo, a mais recente
     no topo. */
  const ordenadas = [...conversas].sort((a, b) => {
    if (a.respondida !== b.respondida) return a.respondida ? 1 : -1;
    return b.quando.localeCompare(a.quando);
  });

  const esperando = conversas.filter((c) => !c.respondida).length;

  return (
    <section className="conversas-painel">
      <header className="produtos-topo">
        <div>
          <h2>Mensagens</h2>
          <p className="produtos-conta">
            {esperando > 0
              ? <><strong>{esperando} esperando você</strong>, de {conversas.length}</>
              : <>Nenhuma esperando você</>}
          </p>
        </div>
      </header>

      {erro && <p className="produtos-erro" role="alert">{erro}</p>}

      {conversas.length === 0 && (
        <p className="produtos-vazio">
          Nenhuma cliente pediu para falar com você ainda. As dúvidas de prazo, frete e
          pagamento a loja responde sozinha, com o texto que combinamos.
        </p>
      )}

      {ordenadas.map((conversa) => (
        <article
          key={conversa.id}
          className={`conversa-item ${conversa.respondida ? 'respondida' : 'esperando'}`}
        >
          <header>
            <div>
              <h3>{conversa.nome}</h3>
              <a href={`mailto:${conversa.email}`} className="conversa-item-email">
                <Mail size={13} aria-hidden="true" /> {conversa.email}
              </a>
            </div>
            <span className="conversa-item-quando">{quando(conversa.quando)}</span>
          </header>

          <div className="conversa-item-falas">
            {conversa.mensagens.map((mensagem, i) => (
              <p key={i} className={`conversa-fala ${mensagem.quem}`}>
                {mensagem.texto}
              </p>
            ))}
          </div>

          <div className="conversa-item-resposta">
            <label>
              <span className="visualmente-oculto">Responder para {conversa.nome}</span>
              <textarea
                rows={2}
                value={respostas[conversa.id] ?? ''}
                onChange={(e) =>
                  setRespostas((atuais) => ({ ...atuais, [conversa.id]: e.target.value }))
                }
                placeholder="Escreva a sua resposta"
              />
            </label>

            <button
              type="button"
              className="conversa-enviar"
              onClick={() => responder(conversa.id)}
              disabled={enviando === conversa.id || !(respostas[conversa.id] ?? '').trim()}
            >
              <Send size={15} aria-hidden="true" />
              {enviando === conversa.id ? 'Enviando…' : 'Responder'}
            </button>
          </div>

          {/* A cliente lê a resposta voltando à loja. Enquanto o envio de
              e-mail não existe, ela precisa saber disso para não esperar
              uma mensagem que não vai chegar. */}
          <p className="conversa-item-aviso">
            A resposta aparece na loja quando a cliente voltar. O aviso por e-mail entra
            quando o serviço de envio estiver contratado.
          </p>
        </article>
      ))}
    </section>
  );
};

export default MinhasConversas;
