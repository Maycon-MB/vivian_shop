'use client'

import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

import CartaoPainel from './CartaoPainel';
import MinhaSenha from './MinhaSenha';
import InfoBotao from './InfoBotao';
import { configuracoesDaLoja, salvarConfiguracoesDaLoja } from '@/dados/configuracoesNoBanco';

/**
 * Configurações.
 *
 * Só o que ela mesma muda com segurança. Chave de pagamento, endereço de
 * banco e integração não aparecem: são coisas que, editadas por engano,
 * derrubam a loja sem ela entender por quê, e recuperar exigiria eu.
 *
 * Os campos vêm agrupados pelo assunto do dia dela, não pela tabela onde
 * o dado mora.
 *
 * ── Por que esta tela foi refeita em 04/09 ─────────────────────────────
 *
 * Ela era maquete. Os campos tinham `defaultValue`, não tinham estado, e
 * "Salvar alterações" era um `<button type="button">` sem `onClick`. Ela
 * digitava, clicava, e nada acontecia, nem um aviso dizendo que não
 * salvou. Na recarga seguinte estava tudo como antes.
 *
 * O campo mais caro era o CEP de onde ela envia, embaixo de um subtítulo
 * que dizia "usado para calcular o frete de quem compra". Ela sairia da
 * tela acreditando que tinha configurado o frete da loja.
 *
 * ── O que ainda não muda sozinho, e a tela diz ─────────────────────────
 *
 * O nome e a frase da loja são resolvidos quando o site é montado, em
 * `app/layout.tsx`. Salvar aqui guarda a escolha dela; quem compra
 * continua lendo o do último build. Enquanto o `publicar.mjs` não ler esta
 * tabela, quem troca aquilo sou eu, e a tela fala isso com todas as letras.
 *
 * O mesmo vale para o CEP: o cálculo do frete sai da função `cotar-frete`,
 * que lê o CEP de uma variável de ambiente dela, e não desta tabela. O
 * endereço daqui é o que ela quer como remetente, e o registro do que
 * combinamos.
 */

const entrada = 'form-control';

const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para mudar isto. Entre de novo, ou me chame.';
  }

  return 'Não consegui salvar agora. Tente de novo em instantes, ou me chame.';
};

const AbaConfiguracoes = () => {
  const [config, setConfig] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    let valendo = true;

    configuracoesDaLoja()
      .then((atual) => { if (valendo) setConfig(atual); })
      .catch(() => { if (valendo) setErro('Não consegui buscar as suas configurações agora.'); });

    return () => { valendo = false; };
  }, []);

  /* O visto verde some assim que ela mexe de novo. Um "salvo" parado na
     tela ao lado de um campo já alterado é a mesma mentira de antes, só
     que mais convincente. */
  const mudar = (campo, valor) => {
    setSalvo(false);
    setConfig((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvar = async () => {
    if (salvando || !config) return;

    setErro('');
    setSalvando(true);

    try {
      await salvarConfiguracoesDaLoja({
        ...config,
        // As colunas são inteiras; os campos de texto entregam string.
        minimo_padrao: Number(config.minimo_padrao) || 1,
        prazo_padrao: Number(config.prazo_padrao) || 1,
      });
      setSalvo(true);
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <h1 className="painel-titulo">Configurações</h1>
        <p className="painel-subtitulo">O que você pode mudar sozinha, quando quiser.</p>
      </header>

      {/* Primeiro cartão de propósito. Quem abre Configurações procurando
          senha está com pressa, e normalmente porque desconfia que alguém
          viu a dela. */}
      <MinhaSenha />

      {!config ? (
        <p className="produtos-carregando">
          <Loader2 size={18} className="girando" aria-hidden="true" /> Buscando…
        </p>
      ) : (
        <>
          <CartaoPainel
            titulo="Sua loja"
            subtitulo="Como sua loja aparece para quem chega."
            cor="var(--color-chalk)"
          >
            <div className="form-grade">
              <label className="campo campo-largo" htmlFor="config-nome">
                <span>Nome que aparece no site</span>
                <input
                  className={entrada}
                  id="config-nome"
                  value={config.nome_da_loja}
                  onChange={(e) => mudar('nome_da_loja', e.target.value)}
                />
              </label>

              <label className="campo" htmlFor="config-email">
                <span>E-mail de contato</span>
                <input
                  className={entrada}
                  type="email"
                  placeholder="seu@email.com"
                  id="config-email"
                  value={config.email_de_contato}
                  onChange={(e) => mudar('email_de_contato', e.target.value)}
                />
              </label>

              {/* O campo de WhatsApp saiu em 04/09.

                  A migração 0008 decidiu que a conversa com a cliente
                  acontece dentro da loja, e a loja inteira foi desenhada
                  assim: não existe botão de WhatsApp em tela nenhuma, e o
                  aviso de mensagem nova vai para o e-mail dela. Um campo
                  aqui guardava um número que nada no sistema usaria, e
                  sugeria um canal de atendimento que não existe. */}

              <label className="campo campo-largo" htmlFor="config-frase">
                <span>
                  Uma frase sobre a loja
                  <InfoBotao texto="Aparece embaixo do nome, na primeira tela. Uma frase curta dizendo o que você faz e para quem." />
                </span>
                <input
                  className={entrada}
                  id="config-frase"
                  value={config.frase_da_loja}
                  onChange={(e) => mudar('frase_da_loja', e.target.value)}
                />
              </label>
            </div>

            {/* Sem esta linha a tela troca um engano por outro: ela salva o
                nome, abre a loja no celular, vê o nome antigo e acha que o
                painel está quebrado. */}
            <p className="aviso-adiado">
              Salvar aqui não muda o site na hora. O nome e a frase que quem compra lê
              são montados junto com o site, e por enquanto quem troca lá sou eu.
            </p>
          </CartaoPainel>

          <CartaoPainel
            titulo="De onde você envia"
            subtitulo="O endereço que sai como remetente nas suas etiquetas."
            cor="var(--color-marker)"
            info="Este endereço aparece como remetente em toda etiqueta. Quem compra consegue ver. Se preferir usar outro, me avise."
          >
            <div className="form-grade">
              <label className="campo" htmlFor="config-cep">
                <span>CEP</span>
                <input
                  className={entrada}
                  placeholder="00000-000"
                  inputMode="numeric"
                  id="config-cep"
                  value={config.cep_de_origem}
                  onChange={(e) => mudar('cep_de_origem', e.target.value)}
                />
              </label>

              <label className="campo" htmlFor="config-cidade">
                <span>Cidade</span>
                <input
                  className={entrada}
                  placeholder="Rio de Janeiro"
                  id="config-cidade"
                  value={config.cidade_de_origem}
                  onChange={(e) => mudar('cidade_de_origem', e.target.value)}
                />
              </label>

              <label className="campo campo-largo" htmlFor="config-endereco">
                <span>Endereço completo</span>
                <input
                  className={entrada}
                  placeholder="Rua, número e complemento"
                  id="config-endereco"
                  value={config.endereco_de_origem}
                  onChange={(e) => mudar('endereco_de_origem', e.target.value)}
                />
              </label>
            </div>

            {/* O cálculo do frete sai da função `cotar-frete`, que lê o CEP
                de uma variável de ambiente. O subtítulo antigo dizia "usado
                para calcular o frete de quem compra", e era a mentira mais
                cara desta tela. */}
            <p className="aviso-adiado">
              O preço do frete que a cliente vê ainda é calculado pelo endereço que
              ficou guardado na transportadora. Se você mudar de endereço, salve aqui
              e me avise, para eu trocar lá também.
            </p>
          </CartaoPainel>

          <CartaoPainel
            titulo="Como você trabalha"
            subtitulo="Vale para produto novo. Cada produto pode ter o seu."
            cor="var(--color-ink)"
          >
            <div className="form-grade">
              <label className="campo" htmlFor="config-minimo">
                <span>
                  Mínimo de unidades
                  <InfoBotao texto="Quantas peças no menor pedido de um produto personalizado. Hoje são 10." />
                </span>
                <input
                  className={entrada}
                  inputMode="numeric"
                  id="config-minimo"
                  value={config.minimo_padrao}
                  onChange={(e) => mudar('minimo_padrao', e.target.value)}
                />
              </label>

              <label className="campo" htmlFor="config-prazo">
                <span>Prazo de produção</span>
                <input
                  className={entrada}
                  inputMode="numeric"
                  id="config-prazo"
                  value={config.prazo_padrao}
                  onChange={(e) => mudar('prazo_padrao', e.target.value)}
                />
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

          {erro && (
            <p className="produtos-erro" role="alert">
              {erro}
            </p>
          )}

          <div className="config-acoes">
            <button
              type="button"
              className="acao-principal"
              onClick={salvar}
              disabled={salvando}
            >
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>

            {salvo && (
              <span className="recebo-salvo" role="status">
                <Check size={16} aria-hidden="true" /> Salvo.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AbaConfiguracoes;
