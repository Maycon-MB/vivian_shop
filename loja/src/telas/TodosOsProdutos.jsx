'use client'

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

import { PUBLICADOS, temasDaVitrine } from './catalogo';
import ProductCard from './landing/ProductCard';
import { useCarrinho } from './CarrinhoContexto';
import { filtrar, tiposDoCatalogo } from '@/dominio/vitrineDeProdutos';

/**
 * O catálogo inteiro, com filtro.
 *
 * O arquivo não se chama `Catalogo` porque `catalogo.js`, que guarda os
 * dados, já existe: dois nomes que só diferem na caixa quebram no Windows
 * e em qualquer sistema que não distingue maiúscula de minúscula.
 *
 * Existe desde 25/08, e nasceu de duas coisas que estavam erradas juntas:
 * a página inicial renderizava **os 342 produtos de uma vez**, e a loja
 * não tinha busca nenhuma. Quem chegava procurando "peppa" rolava até
 * desistir.
 *
 * A cliente dela procura por duas coisas, e a tela oferece as duas:
 *
 *   - **pelo tema**, que é o personagem da festa. É como ela pensa: está
 *     montando o aniversário da Peppa, e não comprando uma revista.
 *   - **pelo tipo**, quando já sabe o que quer: lousa, álbum, caneca.
 *
 * A procura por texto acha as duas de uma vez, porque o nome do produto
 * traz tipo e tema juntos.
 *
 * Tudo acontece aqui no navegador, sem ir ao servidor: o catálogo já veio
 * inteiro no build, e uma busca que espera resposta em 4G perde para o
 * botão de voltar.
 */

const TIPOS = tiposDoCatalogo(PUBLICADOS);
const TEMAS = temasDaVitrine();

/* Quantos filtros aparecem antes de "ver todos". São 104 tipos e 140
   temas: mostrar todos de uma vez é a parede que a vitrine acabou de
   deixar de ser. */
const FILTROS_DE_CARA = 8;

const TodosOsProdutos = () => {
  const { adicionar } = useCarrinho();

  const [procura, setProcura] = useState('');
  const [tipo, setTipo] = useState('');
  const [tema, setTema] = useState('');
  const [todosOsTipos, setTodosOsTipos] = useState(false);
  const [todosOsTemas, setTodosOsTemas] = useState(false);

  const achados = useMemo(
    () => filtrar(PUBLICADOS, { procura, tipo, tema }),
    [procura, tipo, tema],
  );

  const filtrando = Boolean(procura || tipo || tema);

  const limpar = () => {
    setProcura('');
    setTipo('');
    setTema('');
  };

  return (
    <div className="catalogo">
      <header className="catalogo-topo">
        <h1>Todos os produtos</h1>
        <p>
          {PUBLICADOS.length} produtos, {TEMAS.length} temas. Tudo feito por encomenda, com o
          nome de quem vai ganhar.
        </p>

        <label className="catalogo-busca">
          <Search size={18} aria-hidden="true" />
          <span className="visualmente-oculto">Procurar produto</span>
          <input
            type="search"
            value={procura}
            onChange={(e) => setProcura(e.target.value)}
            placeholder="Procure por tema ou produto: peppa, lousa, caneca"
          />
        </label>
      </header>

      <div className="catalogo-filtros">
        <div className="catalogo-grupo">
          <h2>Por tipo</h2>
          <div className="catalogo-fichas">
            {(todosOsTipos ? TIPOS : TIPOS.slice(0, FILTROS_DE_CARA)).map((t) => (
              <button
                key={t.tipo}
                type="button"
                aria-pressed={tipo === t.tipo}
                className={`catalogo-ficha ${tipo === t.tipo ? 'escolhida' : ''}`}
                onClick={() => setTipo(tipo === t.tipo ? '' : t.tipo)}
              >
                {t.tipo} <span>{t.quantos}</span>
              </button>
            ))}

            {TIPOS.length > FILTROS_DE_CARA && (
              <button
                type="button"
                className="catalogo-mais"
                onClick={() => setTodosOsTipos((antes) => !antes)}
              >
                {todosOsTipos ? 'menos' : `mais ${TIPOS.length - FILTROS_DE_CARA}`}
              </button>
            )}
          </div>
        </div>

        <div className="catalogo-grupo">
          <h2>Por tema</h2>
          <div className="catalogo-fichas">
            {(todosOsTemas ? TEMAS : TEMAS.slice(0, FILTROS_DE_CARA)).map((t) => (
              <button
                key={t.slug}
                type="button"
                aria-pressed={tema === t.slug}
                className={`catalogo-ficha ${tema === t.slug ? 'escolhida' : ''}`}
                onClick={() => setTema(tema === t.slug ? '' : t.slug)}
              >
                {t.nome} <span>{t.quantos}</span>
              </button>
            ))}

            {TEMAS.length > FILTROS_DE_CARA && (
              <button
                type="button"
                className="catalogo-mais"
                onClick={() => setTodosOsTemas((antes) => !antes)}
              >
                {todosOsTemas ? 'menos' : `mais ${TEMAS.length - FILTROS_DE_CARA}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="catalogo-conta">
        <p>
          {achados.length === PUBLICADOS.length
            ? `${achados.length} produtos`
            : `${achados.length} de ${PUBLICADOS.length} produtos`}
        </p>

        {filtrando && (
          <button type="button" className="catalogo-limpar" onClick={limpar}>
            <X size={14} aria-hidden="true" /> Limpar o filtro
          </button>
        )}
      </div>

      {achados.length === 0 ? (
        /* Beco sem saída é onde a pessoa fecha a aba. Aqui ela tem o que
           tocar: limpar o filtro, ou falar com a loja, que é o caminho
           para o que existe e ela não achou. */
        <div className="catalogo-vazio">
          <p>Não achei nada com esse filtro.</p>
          <p>
            Tente só uma palavra, como <strong>peppa</strong> ou <strong>lousa</strong>. Se você
            procura algo que não está aqui,{' '}
            <Link href="/?conversa=1" prefetch={false}>fale com a loja</Link>: quase tudo é
            feito por encomenda.
          </p>
        </div>
      ) : (
        <ul className="catalogo-grade">
          {achados.map((produto) => (
            <li key={produto.id ?? produto.slug}>
              <ProductCard product={produto} addToCart={adicionar} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodosOsProdutos;
