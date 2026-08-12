'use client'

import React, { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Eye, EyeOff, Package, Download } from 'lucide-react';
import InfoBotao from './InfoBotao';
import { emReais } from './graficos';

/**
 * Meus produtos.
 *
 * A cliente pensa nos produtos como coisas que ela faz, não como linhas de
 * uma tabela — por isso é grade com foto, e não lista. A foto é o que ela
 * reconhece primeiro.
 *
 * Cada cartão mostra o que ela precisa decidir: quanto custa, quanto sai
 * o pacote fechado, e se está à venda. Produto pausado fica visivelmente
 * apagado, porque "sumiu da loja" é o tipo de coisa que se descobre tarde.
 */

const PRODUTOS = [
  {
    id: 1,
    nome: 'Caderno personalizado',
    linha: 'personalizada',
    preco: 32,
    minimo: 10,
    prazo: 5,
    vendidos: 180,
    ativo: true,
    imagem: null,
  },
  {
    id: 2,
    nome: 'Cartela de adesivos escolares',
    linha: 'personalizada',
    preco: 18,
    minimo: 10,
    prazo: 5,
    vendidos: 140,
    ativo: true,
    imagem: null,
  },
  {
    id: 3,
    nome: 'Caneca personalizada',
    linha: 'personalizada',
    preco: 34,
    minimo: 10,
    prazo: 7,
    vendidos: 62,
    ativo: true,
    imagem: null,
  },
  {
    id: 4,
    nome: 'Bloco de anotações',
    linha: 'personalizada',
    preco: 24,
    minimo: 10,
    prazo: 5,
    vendidos: 80,
    ativo: false,
    imagem: null,
  },
  {
    id: 5,
    nome: 'Apostila de alfabetização adaptada',
    linha: 'pedagogica',
    preco: 47,
    vendidos: 96,
    ativo: true,
    imagem: null,
  },
  {
    id: 6,
    nome: 'Kit rotina visual',
    linha: 'pedagogica',
    preco: 39,
    vendidos: 54,
    ativo: true,
    imagem: '/rotina_visual_premium_1778703012017.png',
  },
  {
    id: 7,
    nome: 'Jogo das emoções',
    linha: 'pedagogica',
    preco: 29,
    vendidos: 62,
    ativo: true,
    imagem: '/jogo_emocoes_premium_1778702950986.png',
  },
];

const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'personalizada', rotulo: 'Personalizada' },
  { id: 'pedagogica', rotulo: 'Pedagógica' },
  { id: 'pausados', rotulo: 'Fora do ar' },
];

const AbaProdutos = ({ onNovoProduto }) => {
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const porFiltro = PRODUTOS.filter((p) => {
      if (filtro === 'todos') return true;
      if (filtro === 'pausados') return !p.ativo;
      return p.linha === filtro;
    });

    const termo = busca.trim().toLowerCase();
    return termo ? porFiltro.filter((p) => p.nome.toLowerCase().includes(termo)) : porFiltro;
  }, [filtro, busca]);

  const contar = (id) =>
    id === 'todos'
      ? PRODUTOS.length
      : id === 'pausados'
        ? PRODUTOS.filter((p) => !p.ativo).length
        : PRODUTOS.filter((p) => p.linha === id).length;

  const fora = PRODUTOS.filter((p) => !p.ativo).length;

  return (
    <div className="d-flex flex-column gap-3">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="painel-titulo">Meus produtos</h1>
          <p className="painel-subtitulo">
            {PRODUTOS.length} cadastrados
            {fora > 0 && `, ${fora} fora do ar`}.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <label className="pedido-busca">
            <Search size={16} />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto"
              aria-label="Buscar produto"
            />
          </label>

          <button type="button" className="acao-principal" onClick={onNovoProduto}>
            <Plus size={16} /> Cadastrar produto
          </button>
        </div>
      </header>

      <nav className="filtros" aria-label="Filtrar produtos">
        {FILTROS.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            onClick={() => setFiltro(opcao.id)}
            aria-pressed={filtro === opcao.id}
            className={`filtro ${filtro === opcao.id ? 'ativo' : ''}`}
          >
            {opcao.rotulo}
            <span className="filtro-conta">{contar(opcao.id)}</span>
          </button>
        ))}
      </nav>

      <ul className="produtos-grade">
        {visiveis.map((produto) => {
          const digital = produto.linha === 'pedagogica';

          return (
            <li key={produto.id} className={`produto-card ${produto.ativo ? '' : 'pausado'}`}>
              <div className={`produto-foto ${digital ? 'digital' : 'fisico'}`}>
                {produto.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={produto.imagem} alt={produto.nome} />
                ) : (
                  <span>Aqui entra sua foto</span>
                )}

                <span className={`produto-linha ${digital ? 'digital' : 'fisico'}`}>
                  {digital ? <Download size={12} /> : <Package size={12} />}
                  {digital ? 'Digital' : 'Sob encomenda'}
                </span>

                {!produto.ativo && <span className="produto-pausado">Fora do ar</span>}
              </div>

              <div className="produto-corpo">
                <h3>{produto.nome}</h3>

                <p className="produto-preco">
                  {emReais(produto.preco)}
                  {!digital && <span> cada</span>}
                </p>

                {!digital && (
                  <p className="produto-regra">
                    Mínimo {produto.minimo} · {emReais(produto.preco * produto.minimo)} o pacote ·
                    pronto em {produto.prazo} dias
                  </p>
                )}

                <p className="produto-vendas">
                  {produto.vendidos} vendidos no mês
                  <InfoBotao
                    texto={
                      digital
                        ? 'Material digital não tem estoque: pode vender quantas vezes quiser sem produzir de novo.'
                        : 'Cada venda são pelo menos 10 peças para produzir. Use este número para se organizar.'
                    }
                  />
                </p>

                <div className="produto-acoes">
                  <button type="button" className="acao-secundaria">
                    <Pencil size={15} /> Editar
                  </button>
                  <button type="button" className="acao-fantasma">
                    {produto.ativo ? <EyeOff size={15} /> : <Eye size={15} />}
                    {produto.ativo ? 'Tirar do ar' : 'Voltar ao ar'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="aviso-exemplo">
        <strong>Estes produtos são de exemplo.</strong> Os seus entram no lugar deles quando
        você mandar as fotos e os preços — pode ser aos poucos, não precisa ser tudo de uma vez.
      </p>
    </div>
  );
};

export default AbaProdutos;
