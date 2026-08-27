'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Search } from 'lucide-react';

import { agruparPorTipo, buscar, resumo } from '@/dominio/listaDeProdutos';
import { listarTodos, mudarPublicacao, mudarDestaque } from '@/dados/produtosDaDona';
import FormularioDeProduto from './FormularioDeProduto';

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
 * e isso é tirar do ar: apagar levaria junto o histórico de quem comprou.
 *
 * Cadastrar e editar abrem no lugar da lista, e não num modal. Ela mexe
 * nisso pelo celular, e em tela pequena o modal fica atrás do teclado.
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
  /* null = mostrando a lista. '' = cadastrando um novo. Um id = editando
     aquele produto. */
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    let valendo = true;

    listarTodos()
      .then((lista) => { if (valendo) setProdutos(lista); })
      .catch((e) => { if (valendo) { setProdutos([]); setErro(recadoDoErro(e)); } });

    return () => { valendo = false; };
  }, []);

  /* Depois de salvar, a lista é buscada de novo em vez de remendada na
     memória: o produto novo precisa aparecer no grupo certo, e o banco é
     quem sabe o tipo e o tema depois de gravar. */
  const recarregar = () => {
    setEditando(null);
    listarTodos()
      .then(setProdutos)
      .catch((e) => setErro(recadoDoErro(e)));
  };

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

  /**
   * Põe no topo da vitrine, ou solta.
   *
   * Em lote pelo mesmo motivo da publicação: na volta às aulas ela quer o
   * tipo inteiro na frente, e não um produto por vez.
   */
  const destacar = async (ids, fixar) => {
    setErro('');
    setSalvando(ids.join('|'));

    try {
      await mudarDestaque(ids, fixar);
      setProdutos((atual) =>
        atual.map((p) => (ids.includes(p.id) ? { ...p, fixado: fixar } : p)),
      );
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(null);
    }
  };

  if (editando !== null) {
    return (
      <FormularioDeProduto
        id={editando || undefined}
        aoSair={() => setEditando(null)}
        aoSalvar={recarregar}
      />
    );
  }

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
        <div>
          <h2>Meus produtos</h2>
          <p className="produtos-conta">
            <strong>{contagem.publicados} no ar</strong>, {contagem.rascunhos} esperando você
          </p>
          {/* Sem esta linha ela publica, abre a loja, não vê mudança e me
              manda mensagem achando que quebrou. O catálogo entra no site
              na hora de montar, e não no navegador de quem visita: é o que
              faz a loja abrir rápida no 4G e o Google ler as páginas. */}
          <p className="produtos-aviso">
            O que você mudar aqui aparece na loja na próxima publicação, e não na hora.
          </p>
        </div>

        <button type="button" className="produtos-cadastrar" onClick={() => setEditando('')}>
          <Plus size={16} aria-hidden="true" /> Cadastrar produto
        </button>
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
                  <th scope="col">No topo</th>
                  <th scope="col"><span className="visualmente-oculto">Editar</span></th>
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
                    <td>
                      <button
                        type="button"
                        className={produto.fixado ? 'produtos-fixado' : 'produtos-fixar'}
                        onClick={() => destacar([produto.id], !produto.fixado)}
                        disabled={Boolean(salvando)}
                        title={
                          produto.fixado
                            ? 'Volta para a ordem normal da vitrine'
                            : 'Aparece antes dos outros na loja'
                        }
                      >
                        {produto.fixado ? 'Tirar do topo' : 'Pôr no topo'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="produtos-editar"
                        onClick={() => setEditando(produto.id)}
                      >
                        <Pencil size={15} aria-hidden="true" /> Editar
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
