'use client'

import React from 'react';
import CartaoPainel from './CartaoPainel';
import MinhaSenha from './MinhaSenha';
import InfoBotao from './InfoBotao';

/**
 * Configurações.
 *
 * Só o que ela mesma muda com segurança. Chave de pagamento, endereço de
 * banco e integração não aparecem: são coisas que, editadas por engano,
 * derrubam a loja sem ela entender por quê — e recuperar exigiria eu.
 *
 * Os campos vêm agrupados pelo assunto do dia dela, não pela tabela onde
 * o dado mora.
 */

const entrada =
  'form-control';

const AbaConfiguracoes = () => (
  <div className="d-flex flex-column gap-3">
    <header>
      <h1 className="painel-titulo">Configurações</h1>
      <p className="painel-subtitulo">O que você pode mudar sozinha, quando quiser.</p>
    </header>

    {/* Primeiro cartão de propósito. Quem abre Configurações procurando
        senha está com pressa, e normalmente porque desconfia que alguém
        viu a dela. */}
    <MinhaSenha />

    <CartaoPainel
      titulo="Sua loja"
      subtitulo="Como sua loja aparece para quem chega."
      cor="var(--color-chalk)"
    >
      <div className="form-grade">
        <label className="campo campo-largo">
          <span>Nome que aparece no site</span>
          <input className={entrada} defaultValue="Feito para você! Personalizados" />
        </label>

        <label className="campo">
          <span>E-mail de contato</span>
          <input className={entrada} type="email" placeholder="seu@email.com" />
        </label>

        <label className="campo">
          <span>WhatsApp</span>
          <input className={entrada} placeholder="(21) 90000-0000" />
        </label>

        <label className="campo campo-largo">
          <span>
            Uma frase sobre a loja
            <InfoBotao texto="Aparece embaixo do nome, na primeira tela. Uma frase curta dizendo o que você faz e para quem." />
          </span>
          <input
            className={entrada}
            defaultValue="Papelaria personalizada e material pedagógico para quem ensina."
          />
        </label>
      </div>
    </CartaoPainel>

    <CartaoPainel
      titulo="De onde você envia"
      subtitulo="Usado para calcular o frete de quem compra."
      cor="var(--color-marker)"
      info="Este endereço aparece como remetente em toda etiqueta. Quem compra consegue ver. Se preferir usar outro, me avise."
    >
      <div className="form-grade">
        <label className="campo">
          <span>CEP</span>
          <input className={entrada} placeholder="00000-000" inputMode="numeric" />
        </label>

        <label className="campo">
          <span>Cidade</span>
          <input className={entrada} placeholder="Rio de Janeiro" />
        </label>

        <label className="campo campo-largo">
          <span>Endereço completo</span>
          <input className={entrada} placeholder="Rua, número e complemento" />
        </label>
      </div>
    </CartaoPainel>

    <CartaoPainel
      titulo="Como você trabalha"
      subtitulo="Vale para produto novo. Cada produto pode ter o seu."
      cor="var(--color-ink)"
    >
      <div className="form-grade">
        <label className="campo">
          <span>
            Mínimo de unidades
            <InfoBotao texto="Quantas peças no menor pedido de um produto personalizado. Hoje são 10." />
          </span>
          <input className={entrada} defaultValue="10" inputMode="numeric" />
        </label>

        <label className="campo">
          <span>Prazo de produção</span>
          <input className={entrada} defaultValue="5" inputMode="numeric" />
          <small>Em dias úteis, contados do pagamento.</small>
        </label>
      </div>
    </CartaoPainel>

    <CartaoPainel
      titulo="Quando eu te aviso"
      subtitulo="O que a loja manda para o seu e-mail, sozinha."
      cor="var(--color-heart)"
    >
      {/* Isto descreve o que acontece, e não é uma escolha.

          Até 04/09 havia aqui tres caixas de selecao marcadas, sem estado
          e sem nada atras: "Pedido novo", que prometia mensagem no
          WhatsApp, "Prazo chegando" e "Resumo da semana". Nenhuma das tres
          existia, e a Vivian perguntou se era avisada de cada compra
          justamente olhando esta tela.

          Caixa que nao salva e pior que ausencia de caixa: ela promete e
          some no proximo carregamento. Enquanto o aviso nao for
          configuravel de verdade, esta tela diz a verdade do que ja
          funciona. */}
      <ul className="avisos-que-existem">
        <li>
          <strong>Venda paga</strong>
          <small>
            Assim que o pagamento de um pedido é confirmado, com o número e o
            valor no corpo do e-mail.
          </small>
        </li>
        <li>
          <strong>Mensagem de cliente</strong>
          <small>
            Quando alguém pede para falar com você pela loja, com a pergunta
            inteira no e-mail.
          </small>
        </li>
      </ul>

      <p className="aviso-onde">
        Os dois vão para o e-mail com que você entra aqui.
      </p>
    </CartaoPainel>

    <div>
      <button type="button" className="acao-principal">
        Salvar alterações
      </button>
    </div>
  </div>
);

export default AbaConfiguracoes;
