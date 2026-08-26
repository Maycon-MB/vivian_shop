'use client'

import React from 'react';

import { useEffect, useState } from 'react';

import { paraAVitrine } from '@/dominio/avaliacoes';
import cruas from '@/dados/avaliacoes.json';
import { avaliacoesPublicadas } from '@/dados/avaliacoesNoBanco';

/**
 * O que as clientes dela escreveram.
 *
 * São 13 avaliações reais, de março de 2025 a fevereiro de 2026. Foram
 * escritas no Elo7, migraram para a Elojinha junto com o catálogo, e
 * saíram de lá em 25/08/2026 antes que a segunda plataforma fechasse
 * também.
 *
 * É a peça mais valiosa desta página, e a única que não dá para
 * reconstruir: quem chega numa loja que não conhece está perguntando se o
 * produto chega e se chega bom. Quem responde isso é quem já comprou.
 *
 * Três regras, e as três são sobre honestidade:
 *
 *   - **nada é inventado.** O que estava aqui antes era um cartão vazio
 *     dizendo "aqui entra um depoimento de verdade", e ficou vazio de
 *     propósito por quatro meses.
 *   - **nada é corrigido.** "Adorai" tem erro de digitação e continua
 *     assim. Corrigir o depoimento de alguém é reescrever o que a pessoa
 *     disse.
 *   - **só o primeiro nome.** Quem escreveu avaliou uma loja em outra
 *     plataforma, e não autorizou aparecer nesta.
 *
 * Não há estrela em lugar nenhum: o marketplace guardava "Positiva" ou
 * "Negativa", e não nota. Cinco estrelas onde o dado não existe seria
 * número inventado justamente na parte da página que existe para provar
 * que ela cumpre o que promete.
 */

/* O arquivo é o que vai no build, para a loja abrir com prova social já
   na primeira pintura. O banco entra depois e substitui: é lá que estão
   as avaliações que as clientes escreveram desde 26/08.

   Sem o arquivo, quem chega veria a seção vazia por um instante, e prova
   social que pisca não convence ninguém. */
const DO_BUILD = paraAVitrine(cruas);

const quando = (data) =>
  data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState(DO_BUILD);

  useEffect(() => {
    let valendo = true;

    avaliacoesPublicadas()
      .then((doBanco) => {
        if (!valendo || !doBanco.length) return;
        setAvaliacoes(
          doBanco.map((a) => ({
            nome: a.nome,
            produto: a.produto?.nome ?? '',
            texto: a.texto,
            positiva: a.nota >= 4,
            quando: new Date(a.quando),
            ...(a.resposta ? { resposta: a.resposta } : {}),
          })),
        );
      })
      .catch(() => { /* Fica o que veio no build. */ });

    return () => { valendo = false; };
  }, []);

  if (!avaliacoes.length) return null;

  return (
    <section className="avaliacoes" aria-labelledby="avaliacoes-titulo">
      <div className="avaliacoes-topo">
        <h2 id="avaliacoes-titulo">O que as clientes dizem</h2>
        <p>
          {avaliacoes.length} avaliações de quem já comprou, do primeiro pedido em março de
          2025 até hoje.
        </p>
      </div>

      <ul className="avaliacoes-lista">
        {avaliacoes.map((avaliacao) => (
          <li key={`${avaliacao.nome}-${avaliacao.quando.getTime()}`} className="avaliacao">
            <blockquote>{avaliacao.texto}</blockquote>

            <p className="avaliacao-quem">
              <strong>{avaliacao.nome}</strong>
              <span>{avaliacao.produto}</span>
              <small>{quando(avaliacao.quando)}</small>
            </p>

            {avaliacao.resposta && (
              <p className="avaliacao-resposta">
                <strong>Resposta da loja:</strong> {avaliacao.resposta}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Avaliacoes;
