'use client'

import React, { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';

import { PADRAO, frasePix, frasePorParcelas, problemas } from '@/dominio/comoElaRecebe';
import { comoElaRecebe, salvarComoElaRecebe } from '@/dados/comoElaRecebeNoBanco';

/**
 * Como eu recebo.
 *
 * O Maycon pediu em 25/08 que estas escolhas ficassem com ela, e não no
 * código. Está certo: são decisões de negócio, e cada uma mexe direto no
 * quanto entra no bolso dela. A taxa do Mercado Pago muda, a temporada de
 * festa chega, e ela não pode depender de eu estar disponível.
 *
 * A tela mostra o efeito enquanto ela mexe, com o pedido típico dela. Uma
 * porcentagem sozinha não diz nada; "R$ 130,15 no Pix" diz.
 */

/* Dez lousas de R$ 13,70. É o pedido que mais aparece nas avaliações
   dela, e por isso é o exemplo que faz sentido para ela. */
const PEDIDO_TIPICO = 137;

const emReais = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para mudar isto. Entre de novo, ou me chame.';
  }

  return 'Não consegui salvar agora. Tente de novo em instantes.';
};

const ComoEuRecebo = () => {
  const [config, setConfig] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    let valendo = true;

    comoElaRecebe()
      .then((atual) => { if (valendo) setConfig(atual); })
      .catch(() => { if (valendo) setConfig(PADRAO); });

    return () => { valendo = false; };
  }, []);

  const mudar = (campo, valor) => {
    setSalvo(false);
    setConfig((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvar = async () => {
    const achados = problemas(config);
    setAvisos(achados);
    if (achados.length) return;

    setErro('');
    setSalvando(true);

    try {
      await salvarComoElaRecebe(config);
      setSalvo(true);
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(false);
    }
  };

  if (!config) {
    return (
      <p className="produtos-carregando">
        <Loader2 size={18} className="girando" aria-hidden="true" /> Buscando…
      </p>
    );
  }

  const parcelas = frasePorParcelas(PEDIDO_TIPICO, config);
  const pix = frasePix(PEDIDO_TIPICO, config);

  return (
    <section className="recebo">
      <header className="produtos-topo">
        <div>
          <h2>Como eu recebo</h2>
          <p className="produtos-conta">
            Você escolhe, e a loja passa a mostrar isso na hora.
          </p>
        </div>
      </header>

      {erro && <p className="produtos-erro" role="alert">{erro}</p>}

      {avisos.length > 0 && (
        <div className="produtos-erro" role="alert">
          <ul>{avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}</ul>
        </div>
      )}

      <fieldset className="recebo-bloco">
        <legend>O que você aceita</legend>

        {[
          ['aceita_pix', 'Pix', 'Taxa menor e o dinheiro cai na hora.'],
          ['aceita_credito', 'Cartão de crédito', 'Taxa maior, e o dinheiro leva de 14 a 30 dias.'],
          ['aceita_debito', 'Cartão de débito', 'Taxa baixa, dinheiro em um dia útil.'],
        ].map(([campo, nome, porque]) => (
          <label key={campo} className="recebo-opcao">
            <input
              type="checkbox"
              checked={config[campo]}
              onChange={(e) => mudar(campo, e.target.checked)}
            />
            <span>
              <strong>{nome}</strong>
              <small>{porque}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="recebo-bloco">
        <legend>Parcelamento</legend>

        <label className="produto-campo">
          <span className="produto-campo-rotulo">Em até quantas vezes</span>
          <select
            value={config.parcelas_max}
            onChange={(e) => mudar('parcelas_max', Number(e.target.value))}
          >
            <option value={1}>Só à vista</option>
            {[2, 3, 4, 5, 6, 10, 12].map((n) => (
              <option key={n} value={n}>{n} vezes</option>
            ))}
          </select>
        </label>

        {config.parcelas_max > 1 && (
          <label className="recebo-opcao">
            <input
              type="checkbox"
              checked={config.juros_por_conta_da_loja}
              onChange={(e) => mudar('juros_por_conta_da_loja', e.target.checked)}
            />
            <span>
              <strong>Eu pago os juros (a cliente vê &quot;sem juros&quot;)</strong>
              <small>
                Vende mais, e a diferença sai do seu bolso. Desmarcado, a cliente paga os
                juros e você recebe o valor cheio.
              </small>
            </span>
          </label>
        )}
      </fieldset>

      <fieldset className="recebo-bloco">
        <legend>Desconto no Pix</legend>

        <label className="produto-campo">
          <span className="produto-campo-rotulo">Desconto para quem paga no Pix</span>
          <select
            value={config.desconto_pix}
            onChange={(e) => mudar('desconto_pix', Number(e.target.value))}
          >
            <option value={0}>Sem desconto</option>
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>{n}%</option>
            ))}
          </select>
          <small className="produto-campo-ajuda">
            É o que mais muda a sua conta: no Pix a taxa é menor e o dinheiro cai na hora,
            em vez de 30 dias.
          </small>
        </label>
      </fieldset>

      {/* O efeito no pedido dela, e não uma porcentagem solta. Uma
          porcentagem não diz nada; "R$ 130,15 no Pix" diz. */}
      <div className="recebo-exemplo">
        <h3>Num pedido de {emReais(PEDIDO_TIPICO)}</h3>
        <p className="recebo-exemplo-nota">
          Dez lousas de R$ 13,70, que é o seu pedido mais comum.
        </p>

        <ul>
          {config.aceita_pix && (
            <li>{pix || `${emReais(PEDIDO_TIPICO)} no Pix`}</li>
          )}
          {config.aceita_credito && (
            <li>{parcelas || `${emReais(PEDIDO_TIPICO)} no crédito, à vista`}</li>
          )}
          {config.aceita_debito && <li>{emReais(PEDIDO_TIPICO)} no débito</li>}
          {!config.aceita_pix && !config.aceita_credito && !config.aceita_debito && (
            <li>Nenhuma forma ligada: ninguém consegue comprar.</li>
          )}
        </ul>
      </div>

      <div className="produto-acoes-formulario">
        <button type="button" className="produtos-publicar" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>

        {salvo && (
          <span className="recebo-salvo">
            <Check size={16} aria-hidden="true" /> A loja já está mostrando assim.
          </span>
        )}
      </div>
    </section>
  );
};

export default ComoEuRecebo;
