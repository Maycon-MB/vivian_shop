'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { agruparPorTipo, buscar, resumo } from '@/dominio/listaDeProdutos';
import { listarTodos, mudarPublicacao } from '@/dados/produtosDaDona';

/**
 * Onde ela decide o que a loja vende.
 *
 * São 343 produtos vindos da Elojinha, todos fora do ar esperando decisão
 * dela. Duas coisas moldam esta tela, e nenhuma é estética:
 *
 *   1. Com 343 itens, rolar é procurar nome em lista telefônica. A busca
 *      não é recurso avançado, é o jeito normal de usar.
 *   2. São 58 Lousas Mágicas iguais, variando só o tema impresso.
 *      Publicar uma a uma são 58 toques no celular, e ninguém repete isso.
 *
 * Nada aqui apaga produto. O que ela quer ao "excluir" é parar de vender,
 * e isso é tirar do ar — apagar levaria junto o histórico de quem comprou.
 */

const emReais = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** O erro do banco dito na língua dela, com o que fazer a respeito. */
const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('publicado_tem_medidas')) {
    return 'Este produto está sem peso ou sem as medidas da caixa, e sem isso o frete sai errado. Preencha antes de colocar no ar.';
  }

  if (texto.includes('publicado_tem_pasta')) {
    return 'Este material digital está sem a pasta do Drive. Sem ela, a loja não tem o que entregar depois do pagamento.';
  }

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para mexer nos produtos. Entre de novo, ou me chame.';
  }

  return 'Não consegui salvar agora. Tente de novo em instantes.';
};

const MeusProdutos = () => {
  const [produtos, setProdutos] = useState(null);
  const [termo, setTermo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(null);

  useEffect(() => {
    let valendo = true;

    listarTodos()
      .then((lista) => { if (valendo) setProdutos(lista); })
      .catch((e) => { if (valendo) { setProdutos([]); setErro(recadoDoErro(e)); } });

    return () => { valendo = false; };
  }, []);

  const encontrados = useMemo(() => buscar(produtos ?? [], termo), [produtos, termo]);
  const grupos = useMemo(() => agruparPorTipo(encontrados), [encontrados]);
  const contagem = useMemo(() => resumo(produtos ?? []), [produtos]);

  const publicar = async (ids, ativo) => {
    setErro('');
    setSalvando(ids.join('|'));

    try {
      await mudarPublicacao(ids, ativo);
      setProdutos((atual) =>
        atual.map((p) => (ids.includes(p.id) ? { ...p, ativo } : p)),
      );
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(null);
    }
  };

  if (!produtos) {
    return (
      <p className="produtos-carregando">
        <Loader2 size={18} className="girando" aria-hidden="true" /> Buscando os seus produtos…
      </p>
    );
  }

  return (
    <section className="meus-produtos">
      <header className="produtos-topo" role="banner">
        <h2>Meus produtos</h2>
        <p className="produtos-conta">
          <strong>{contagem.publicados} no ar</strong>, {contagem.rascunhos} esperando você
        </p>
      </header>

      <label className="produtos-busca">
        <Search size={17} aria-hidden="true" />
        <span className="visualmente-oculto">Procurar produto</span>
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Procurar por nome ou tema"
        />
      </label>

      {erro && <p className="produtos-erro" role="alert">{erro}</p>}

      {encontrados.length === 0 && (
        <p className="produtos-vazio">
          Nenhum produto com esse nome. Tente parte do nome, ou o tema.
        </p>
      )}

      {grupos.map((grupo) => {
        const fora = grupo.produtos.filter((p) => !p.ativo);

        return (
          <div key={grupo.tipo} className="produtos-grupo">
            <div className="produtos-grupo-topo">
              <h3>{grupo.tipo}</h3>
              <span>{grupo.publicados} de {grupo.produtos.length} no ar</span>

              {/* Publicar o tipo inteiro: é o que transforma 58 toques em
                  um. Só aparece quando há o que publicar. */}
              {fora.length > 1 && (
                <button
                  type="button"
                  className="produtos-lote"
                  onClick={() => publicar(fora.map((p) => p.id), true)}
                  disabled={Boolean(salvando)}
                >
                  Publicar os {fora.length} de &quot;{grupo.tipo}&quot;
                </button>
              )}
            </div>

            <table className="produtos-tabela">
              <thead>
                <tr>
                  <th scope="col">Produto</th>
                  <th scope="col">Preço</th>
                  <th scope="col">No ar</th>
                </tr>
              </thead>
              <tbody>
                {grupo.produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{emReais(produto.preco)}</td>
                    <td>
                      <button
                        type="button"
                        className={produto.ativo ? 'produtos-tirar' : 'produtos-publicar'}
                        onClick={() => publicar([produto.id], !produto.ativo)}
                        disabled={Boolean(salvando)}
                      >
                        {produto.ativo ? 'Tirar do ar' : 'Publicar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </section>
  );
};

export default MeusProdutos;
