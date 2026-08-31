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
      subtitulo="Escolha o que vale interromper o seu dia."
      cor="var(--color-heart)"
    >
      <div className="opcoes">
        <label className="opcao">
          <input type="checkbox" defaultChecked />
          <span>
            <strong>Pedido novo</strong>
            <small>Mensagem no WhatsApp assim que alguém compra.</small>
          </span>
        </label>

        <label className="opcao">
          <input type="checkbox" defaultChecked />
          <span>
            <strong>Prazo chegando</strong>
            <small>Um dia antes de um pedido vencer, para nada atrasar.</small>
          </span>
        </label>

        <label className="opcao">
          <input type="checkbox" />
          <span>
            <strong>Resumo da semana</strong>
            <small>Toda segunda, por e-mail: o que vendeu e o que ficou parado.</small>
          </span>
        </label>
      </div>
    </CartaoPainel>

    <div>
      <button type="button" className="acao-principal">
        Salvar alterações
      </button>
    </div>
  </div>
);

export default AbaConfiguracoes;
