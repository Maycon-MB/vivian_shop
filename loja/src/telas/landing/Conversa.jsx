'use client'

import React, { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';

import {
  ABERTURA,
  NAO_SEI,
  acharOpcao,
  acharPelaEscrita,
  PRIMEIRAS,
  problemasDoRecado,
  responder,
  seguintesDe,
} from '@/dominio/conversa';
import {
  chaveDaConversa,
  enviarMensagem,
  falarComALoja,
  lerConversa,
} from '@/dados/conversaDaLoja';

/**
 * A conversa, do lado de quem compra.
 *
 * Entrou no lugar do botão de WhatsApp, que era o único caminho até ela e
 * levava a cliente para fora da loja. A Vivian pediu a troca em 24/08.
 *
 * Três coisas moldam esta tela:
 *
 *   1. **Botão, e não campo de texto.** A cliente escolhe entre perguntas
 *      prontas, e cada resposta foi escrita à mão a partir das políticas
 *      dela. Um robô que escreve sozinho promete prazo que ela é quem vai
 *      ter que cumprir.
 *   2. **Ninguém se identifica para perguntar o prazo.** Nome e e-mail só
 *      aparecem quando a cliente toca em "falar com a loja".
 *   3. **A saída para um humano está sempre visível.** A hora em que ela
 *      cansa dos botões é imprevisível, e esconder a saída é como se
 *      perde a venda.
 *
 * Quem decide se isto aparece é o `ConversaDaLoja`, que também guarda a
 * bolha fechada. Este arquivo só é baixado quando alguém abre a conversa:
 * ele levava 8 KB para dentro de toda página da loja, e o checkout passou
 * do limite de peso por causa disso. Quem está pagando não precisa das
 * regras do chat carregadas.
 */

const Conversa = ({ aoFechar = () => {} }) => {
  const [falas, setFalas] = useState([ABERTURA]);
  const [botoes, setBotoes] = useState(PRIMEIRAS);
  const [pedindoHumano, setPedindoHumano] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [texto, setTexto] = useState('');
  const [avisos, setAvisos] = useState([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [escrito, setEscrito] = useState('');
  const [digitando, setDigitando] = useState(false);

  const fim = useRef(null);

  /* Rola até a última fala. Sem isso, a resposta aparece abaixo da dobra
     e a cliente acha que o botão não fez nada. */
  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'nearest' });
  }, [falas, pedindoHumano]);

  /* Se ela já falou com a loja antes e a Vivian respondeu, a resposta
     aparece ao reabrir a conversa. É o que faz isto ser conversa, e não
     formulário. */
  useEffect(() => {
    let valendo = true;

    chaveDaConversa()
      .then((chave) => (chave ? lerConversa(chave) : []))
      .then((gravadas) => {
        if (!valendo || !gravadas.length) return;
        setFalas([ABERTURA, ...gravadas.map((g) => ({ quem: g.quem, texto: g.texto }))]);
        setEnviado(true);
      })
      .catch(() => { /* Sem banco, a conversa funciona só com os botões. */ });

    return () => { valendo = false; };
  }, []);

  /* A loja "digita" antes de responder.
     Resposta que aparece no mesmo instante em que a pessoa toca no botão
     lê como máquina; meio segundo de espera lê como alguém do outro lado.
     É pequeno e é o que mais muda a sensação. */
  const responderDevagar = (aplicar, seguintes) => {
    setDigitando(true);

    window.setTimeout(() => {
      setFalas(aplicar);
      if (seguintes) setBotoes(seguintes);
      setDigitando(false);
    }, 550);
  };

  const tocar = (id) => {
    responderDevagar((atuais) => responder(atuais, id), seguintesDe(id));
  };

  /* Ela escreve, e a loja acha a resposta pronta que combina.
     Continua sem gerar texto: o que muda é como se chega até a resposta
     escrita à mão. Quando não acha, diz que não sabe em vez de chutar. */
  const perguntar = (evento) => {
    evento.preventDefault();

    const texto = escrito.trim();
    if (!texto || digitando) return;

    const achada = acharPelaEscrita(texto);
    setEscrito('');

    responderDevagar(
      (atuais) => [
        ...atuais,
        { quem: 'cliente', texto },
        achada ? { quem: 'loja', texto: achada.resposta } : NAO_SEI(texto),
      ],
      achada ? seguintesDe(achada.id) : PRIMEIRAS,
    );

    /* Sem resposta pronta, o caminho é a loja. Abrir o formulário aqui
       com o que ela escreveu evita fazer a pessoa digitar duas vezes a
       mesma dúvida, que é onde ela desiste. */
    if (!achada) {
      setTexto(texto);
      window.setTimeout(() => setPedindoHumano(true), 900);
    }
  };

  const mandarRecado = async (evento) => {
    evento.preventDefault();
    setErro('');

    const achados = problemasDoRecado(nome, email, texto);
    setAvisos(achados);
    if (achados.length) return;

    setEnviando(true);

    try {
      const chave = await chaveDaConversa();
      if (!chave) throw new Error('sem banco');

      await enviarMensagem(chave, texto.trim());
      await falarComALoja(chave, nome, email);

      setFalas((atuais) => [
        ...atuais,
        { quem: 'cliente', texto: texto.trim() },
        {
          quem: 'loja',
          /* A resposta vai pelo e-mail dela, do programa de e-mail dela.
             É o que o Maycon prometeu à Vivian em 24/08, e é o único
             caminho que alcança a cliente depois de ela fechar o site. */
          texto:
            `Recebi, ${nome.trim().split(' ')[0]}. A loja responde no seu e-mail. ` +
            'Se você voltar aqui, a resposta também aparece nesta conversa.',
        },
      ]);

      setPedindoHumano(false);
      setEnviado(true);
      setTexto('');
    } catch {
      setErro('Não consegui enviar agora. Tente de novo em instantes.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="conversa" aria-label="Conversa com a loja">
      <header className="conversa-topo">
        <h2>Tire sua dúvida</h2>
        <button type="button" onClick={aoFechar} aria-label="Fechar a conversa">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="conversa-falas">
        {falas.map((fala, i) => (
          <p key={`${fala.quem}-${i}`} className={`conversa-fala ${fala.quem}`}>
            {fala.texto}
          </p>
        ))}
        {digitando && (
          <p className="conversa-fala loja digitando" aria-live="polite">
            <span /><span /><span />
            <span className="visualmente-oculto">Escrevendo a resposta</span>
          </p>
        )}

        <span ref={fim} />
      </div>

      {pedindoHumano ? (
        <form className="conversa-recado" onSubmit={mandarRecado}>
          <p className="conversa-recado-motivo">
            A loja responde por e-mail. É por isso que o endereço é pedido aqui, e só aqui.
          </p>

          {avisos.length > 0 && (
            <ul className="conversa-avisos" role="alert">
              {avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}
            </ul>
          )}

          {erro && <p className="conversa-avisos" role="alert">{erro}</p>}

          <label>
            <span>Seu nome</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>

          <label>
            <span>Seu e-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            <span>Sua dúvida</span>
            <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
          </label>

          <div className="conversa-recado-acoes">
            <button type="submit" className="conversa-enviar" disabled={enviando}>
              <Send size={15} aria-hidden="true" /> {enviando ? 'Enviando…' : 'Enviar'}
            </button>
            <button
              type="button"
              className="conversa-voltar"
              onClick={() => setPedindoHumano(false)}
              disabled={enviando}
            >
              Voltar às perguntas
            </button>
          </div>
        </form>
      ) : (
        <div className="conversa-botoes">
          {/* O campo de escrever vem antes dos botões: é o que a pessoa
              faria naturalmente, e os botões viram atalho para quem
              prefere tocar. */}
          <form className="conversa-escrever" onSubmit={perguntar}>
            <label className="visualmente-oculto" htmlFor="conversa-escrito">
              Escreva a sua pergunta
            </label>
            <input
              id="conversa-escrito"
              type="text"
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              placeholder="Escreva a sua pergunta"
              disabled={digitando}
            />
            <button type="submit" aria-label="Perguntar" disabled={digitando || !escrito.trim()}>
              <Send size={16} aria-hidden="true" />
            </button>
          </form>

          {botoes.map((id) => (
            <button key={id} type="button" onClick={() => tocar(id)}>
              {acharOpcao(id)?.pergunta}
            </button>
          ))}

          {/* Sempre visível, e nunca escondida atrás de "não achei minha
              resposta": a hora em que ela cansa dos botões é imprevisível. */}
          <button
            type="button"
            className="conversa-humano"
            onClick={() => setPedindoHumano(true)}
          >
            {enviado ? 'Perguntar outra coisa à loja' : 'Falar com a loja'}
          </button>
        </div>
      )}
    </section>
  );
};

export default Conversa;
