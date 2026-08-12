'use client'

import React, { useState } from 'react';
import { Send, MessageCircle, Package } from 'lucide-react';
import InfoBotao from './InfoBotao';

/**
 * Mensagens.
 *
 * A cliente atende pessoalmente pelo WhatsApp, e esse atendimento direto é
 * um diferencial que ela vende — a tela não tenta substituí-lo. Ela junta
 * a conversa ao pedido, que é o que o WhatsApp não faz: ali a pergunta
 * "qual o prazo?" chega sem que ela precise procurar de quem é.
 *
 * Por isso todo painel de conversa mostra o pedido ao lado, e existe o
 * botão de continuar no WhatsApp.
 */

const CONVERSAS = [
  {
    id: 1,
    nome: 'Exemplo — Ana Souza',
    pedido: '0007',
    resumo: 'Consegue mandar até sexta?',
    quando: '2 min',
    naoLidas: 1,
    mensagens: [
      { de: 'cliente', texto: 'Oi Vivian! Comprei os cadernos ontem. Consegue mandar até sexta?', quando: '09:12' },
      { de: 'vivian', texto: 'Oi Ana! Consigo sim, seu pedido está pronto e vou postar hoje.', quando: '09:20' },
      { de: 'cliente', texto: 'Que ótimo, obrigada!', quando: '09:21' },
    ],
  },
  {
    id: 2,
    nome: 'Exemplo — Beatriz Lima',
    pedido: '0006',
    resumo: 'Dá para trocar a cor da capa?',
    quando: '1 h',
    naoLidas: 0,
    mensagens: [
      { de: 'cliente', texto: 'Boa tarde! Dá para trocar a cor da capa para azul?', quando: '14:02' },
    ],
  },
  {
    id: 3,
    nome: 'Exemplo — Carla Menezes',
    pedido: null,
    resumo: 'Faz personalizado com o nome da turma?',
    quando: '3 h',
    naoLidas: 0,
    mensagens: [
      { de: 'cliente', texto: 'Oi! Faz personalizado com o nome da turma inteira?', quando: '11:30' },
    ],
  },
];

const AbaMensagens = () => {
  const [ativa, setAtiva] = useState(CONVERSAS[0]);

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <h1 className="painel-titulo">
          Mensagens
          <InfoBotao texto="Aqui chegam as perguntas feitas pela loja. O WhatsApp continua sendo seu — esta tela só junta a conversa ao pedido, para você não precisar procurar de quem é." />
        </h1>
        <p className="painel-subtitulo">Perguntas de quem está comprando, junto do pedido.</p>
      </header>

      <div className="conversa-tela">
        <aside className="conversa-lista">
          {CONVERSAS.map((conversa) => (
            <button
              key={conversa.id}
              type="button"
              onClick={() => setAtiva(conversa)}
              className={`conversa-item ${ativa.id === conversa.id ? 'ativa' : ''}`}
            >
              <span className="conversa-topo">
                <strong>{conversa.nome}</strong>
                <span className="conversa-quando">{conversa.quando}</span>
              </span>
              <span className="conversa-resumo">{conversa.resumo}</span>
              <span className="conversa-rodape">
                {conversa.pedido ? (
                  <span className="conversa-pedido">
                    <Package size={12} /> Pedido #{conversa.pedido}
                  </span>
                ) : (
                  <span className="conversa-pedido sem">Ainda não comprou</span>
                )}
                {conversa.naoLidas > 0 && <span className="conversa-nova">{conversa.naoLidas}</span>}
              </span>
            </button>
          ))}
        </aside>

        <section className="conversa-painel">
          <header className="conversa-cabecalho">
            <div>
              <strong>{ativa.nome}</strong>
              {ativa.pedido ? (
                <span>
                  Pedido #{ativa.pedido} · em produção
                </span>
              ) : (
                <span>Sem pedido ainda — é uma dúvida antes de comprar</span>
              )}
            </div>

            <a
              className="acao-secundaria"
              href="https://wa.me/5521900000000"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={15} /> Continuar no WhatsApp
            </a>
          </header>

          <div className="conversa-mensagens">
            {ativa.mensagens.map((mensagem, i) => (
              <div key={i} className={`balao ${mensagem.de}`}>
                <p>{mensagem.texto}</p>
                <span>{mensagem.quando}</span>
              </div>
            ))}
          </div>

          <form className="conversa-envio" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Escreva sua resposta" aria-label="Sua resposta" />
            <button type="submit" className="acao-principal" aria-label="Enviar">
              <Send size={16} />
            </button>
          </form>
        </section>
      </div>

      <p className="aviso-exemplo">
        <strong>Conversas de exemplo.</strong> Na loja pronta, cada pergunta chega junto do
        pedido de quem escreveu.
      </p>
    </div>
  );
};

export default AbaMensagens;
