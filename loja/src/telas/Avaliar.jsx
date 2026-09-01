'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Star, Check } from 'lucide-react';

import { avaliar, produtosParaAvaliar } from '@/dados/avaliacoesNoBanco';
import { temBanco } from '@/servicos/autenticacao';

/**
 * Onde a cliente conta o que achou.
 *
 * O link chega por e-mail alguns dias depois da entrega, com uma chave que
 * vale só para aquele pedido. Sem conta: a maioria compra sem se
 * cadastrar, e exigir login para avaliar é perder a avaliação.
 *
 * Três coisas moldam a tela, e as três são sobre quem está do outro lado:
 *
 *   1. **Nada é obrigatório além da nota e de uma frase.** Formulário
 *      longo depois de a festa acabar não é respondido.
 *   2. **Ela vê o produto que comprou, com foto.** "Avalie sua compra" é
 *      abstrato; a foto da lousa que ela deu de lembrancinha, não.
 *   3. **A tela diz que a dona vai ler antes de publicar.** Descobrir
 *      depois que o texto não apareceu, sem saber por quê, é pior do que
 *      saber desde o começo.
 */

const NOTAS = [1, 2, 3, 4, 5];

/* Lidos fora do componente: são os mesmos para toda a montagem, e assim
   a decisão não vira estado marcado dentro do efeito. */
const CHAVE_DO_LINK =
  typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('pedido');

const Avaliar = () => {
  const [chave] = useState(CHAVE_DO_LINK);
  const [produtos, setProdutos] = useState(() =>
    CHAVE_DO_LINK && temBanco() ? null : [],
  );
  const [erro, setErro] = useState(
    CHAVE_DO_LINK
      ? ''
      : 'Este link não parece completo. Confira se você copiou ele inteiro do e-mail.',
  );

  const [escolhido, setEscolhido] = useState(null);
  const [nota, setNota] = useState(5);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!chave || !temBanco()) return;

    produtosParaAvaliar(chave)
      .then((lista) => {
        setProdutos(lista);
        if (lista.length === 1) setEscolhido(lista[0]);
        if (lista.length === 0) {
          setErro('Não achei esse pedido. O link vale depois que o pagamento é confirmado.');
        }
      })
      .catch(() => {
        setProdutos([]);
        setErro('Não consegui abrir agora. Tente de novo em instantes.');
      });
    /* `chave` sai de um `useState` sem setter: ela nunca muda depois da
       primeira montagem, então o efeito continua rodando uma vez só. A
       lista precisa dizer isso mesmo assim, senão ela mente sobre o que o
       efeito lê, e quem confiar nela um dia erra. */
  }, [chave]);

  const enviar = async (evento) => {
    evento.preventDefault();

    if (!escolhido) {
      setErro('Escolha qual produto você quer avaliar.');
      return;
    }

    if (texto.trim().length < 3) {
      setErro('Escreva ao menos uma frase sobre o produto.');
      return;
    }

    setErro('');
    setEnviando(true);

    try {
      await avaliar(chave, escolhido.produto_id, nota, texto);
      setPronto(true);
    } catch {
      setErro('Não consegui enviar agora. Tente de novo em instantes.');
    } finally {
      setEnviando(false);
    }
  };

  if (produtos === null) {
    return (
      <div className="avaliar">
        <p className="conta-carregando">
          <Loader2 size={18} className="girando" aria-hidden="true" /> Um instante…
        </p>
      </div>
    );
  }

  if (pronto) {
    return (
      <div className="avaliar">
        <div className="avaliar-caixa avaliar-pronto">
          <Check size={34} aria-hidden="true" />
          <h1>Obrigada!</h1>
          <p>
            A dona da loja vai ler antes de publicar. Se ela publicar, o seu primeiro nome
            aparece junto, e mais nada.
          </p>
          <Link href="/" prefetch={false} className="conta-botao">
            Ver a loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="avaliar">
      <div className="avaliar-caixa">
        <h1>O que você achou?</h1>
        <p className="avaliar-sub">
          Quem está pensando em comprar lê o que você escrever. Uma frase já ajuda muito.
        </p>

        {erro && <p className="conta-erro" role="alert">{erro}</p>}

        {produtos.length > 0 && (
          <form onSubmit={enviar}>
            {/* Com mais de um produto no pedido, ela escolhe qual. Com um
                só, já vem escolhido: uma pergunta a menos. */}
            {produtos.length > 1 && (
              <fieldset className="avaliar-produtos">
                <legend>Qual produto?</legend>

                {produtos.map((produto) => (
                  <label
                    key={produto.produto_id}
                    className={escolhido?.produto_id === produto.produto_id ? 'escolhido' : ''}
                  >
                    <input
                      type="radio"
                      name="produto"
                      checked={escolhido?.produto_id === produto.produto_id}
                      onChange={() => setEscolhido(produto)}
                    />
                    {produto.imagem && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={produto.imagem} alt="" />
                    )}
                    <span>
                      {produto.nome}
                      {produto.ja_avaliado && <small>você já avaliou, dá para trocar</small>}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

            {escolhido && produtos.length === 1 && (
              <div className="avaliar-unico">
                {escolhido.imagem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={escolhido.imagem} alt="" />
                )}
                <strong>{escolhido.nome}</strong>
              </div>
            )}

            <fieldset className="avaliar-notas">
              <legend>Quantas estrelas?</legend>

              <div className="avaliar-estrelas">
                {NOTAS.map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setNota(valor)}
                    aria-label={`${valor} ${valor === 1 ? 'estrela' : 'estrelas'}`}
                    aria-pressed={nota === valor}
                    className={valor <= nota ? 'cheia' : ''}
                  >
                    <Star size={28} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="avaliar-texto">
              <span>O que você quer contar?</span>
              <textarea
                rows={4}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={1000}
                placeholder="Chegou no prazo, a arte ficou linda, as crianças adoraram…"
              />
            </label>

            <button type="submit" className="conta-botao" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar'}
            </button>

            {/* Dito antes, e não descoberto depois. */}
            <p className="conta-nota">
              A dona da loja lê antes de publicar. Só o seu primeiro nome aparece.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Avaliar;
