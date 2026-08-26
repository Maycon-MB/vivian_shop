'use client'

import React from 'react';
import Link from 'next/link';

import { sair, temBanco } from '@/servicos/autenticacao';
import { Nav, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  ClipboardList,
  HelpCircle,
  Palette,
  Store,
  Wallet,
  TrendingUp,
  ShoppingBag,
  Mail,
  Settings,
  LogOut,
  Package,
  MessageSquare,
  FileBarChart,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

/**
 * Menu lateral do painel.
 *
 * Recolhe para faixa de ícones no computador, liberando largura para as
 * tabelas e gráficos — que é onde a cliente realmente olha. Recolhido, o
 * nome de cada área aparece ao passar o mouse, para ninguém precisar
 * decorar ícone.
 *
 * No celular vira gaveta sobre o conteúdo, porque faixa de ícone numa tela
 * estreita rouba espaço sem entregar navegação.
 *
 * Os rótulos são as tarefas dela, não nomes de módulo.
 */
const ITENS = [
  { id: 'dashboard', icone: <TrendingUp size={18} />, rotulo: 'Visão geral' },
  { id: 'pedidos', icone: <ShoppingBag size={18} />, rotulo: 'Pedidos' },
  { id: 'catalogo', icone: <Package size={18} />, rotulo: 'Meus produtos' },
  { id: 'relatorios', icone: <FileBarChart size={18} />, rotulo: 'Relatórios' },
  { id: 'mensagens', icone: <MessageSquare size={18} />, rotulo: 'Mensagens' },
  { id: 'marketing', icone: <Mail size={18} />, rotulo: 'Marketing' },
  /* "Como eu recebo", e não "Pagamentos": o rótulo é a pergunta dela, e a
     resposta muda o quanto entra no bolso dela. */
  { id: 'avaliacoes', icone: <Star size={18} />, rotulo: 'Avaliações' },
  { id: 'recebo', icone: <Wallet size={18} />, rotulo: 'Como eu recebo' },
  { id: 'config', icone: <Settings size={18} />, rotulo: 'Configurações' },
];

/* O que não é aba do painel, e sim página com endereço próprio.

   Entraram aqui em 24/08, quando a área da Vivian saiu de dentro da loja.
   Antes ela chegava às perguntas por uma faixa azul no meio da vitrine, um
   remendo que aparecia para quem estava comprando.

   Ficam separados das abas por uma linha, porque são coisas de natureza
   diferente: aba é parte do painel, isto sai dele. */
const PAGINAS = [
  { href: '/admin/perguntas/', icone: <HelpCircle size={18} />, rotulo: 'Perguntas para você' },
  { href: '/admin/sobre-o-site/custos/', icone: <Wallet size={18} />, rotulo: 'O que a loja custa' },
  { href: '/admin/sobre-o-site/marca/', icone: <Palette size={18} />, rotulo: 'A sua marca' },
  { href: '/admin/sobre-o-site/entregas/', icone: <ClipboardList size={18} />, rotulo: 'O que já foi feito' },
];

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, recolhida, onAlternarRecolhida }) => {
  const sairDaConta = async () => {
    if (temBanco()) await sair();
    // Recarrega em vez de navegar: assim nada do que estava na tela
    // sobrevive em memória depois de sair.
    window.location.href = '/admin/entrar/';
  };

  const selecionar = (id) => {
    onTabChange(id);
    if (typeof window !== 'undefined' && window.innerWidth < 992) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 mobile-only"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <div className={`sidebar-nav ${isOpen ? 'open' : ''} ${recolhida ? 'recolhida' : ''}`}>
        <div className="sidebar-topo">
          {!recolhida && (
            <div className="sidebar-marca">
              <h2>
                Feito para você!<span> Personalizados</span>
              </h2>
              <small>Minhas vendas</small>
            </div>
          )}

          <Button
            variant="link"
            className="sidebar-alternar desktop-only"
            onClick={onAlternarRecolhida}
            aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!recolhida}
          >
            {recolhida ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </Button>

          <Button
            variant="link"
            className="mobile-only p-0 text-muted"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <PanelLeftClose size={20} />
          </Button>
        </div>

        <Nav className="sidebar-itens">
          {ITENS.map((item) => {
            const ativo = activeTab === item.id;

            const link = (
              <Nav.Link
                key={item.id}
                as="button"
                type="button"
                onClick={() => selecionar(item.id)}
                className={`sidebar-item ${ativo ? 'ativo' : ''}`}
                aria-current={ativo ? 'page' : undefined}
              >
                <span className="sidebar-item-icone">{item.icone}</span>
                {!recolhida && <span className="sidebar-item-rotulo">{item.rotulo}</span>}
              </Nav.Link>
            );

            if (!recolhida) return link;

            return (
              <OverlayTrigger
                key={item.id}
                placement="right"
                overlay={<Tooltip id={`dica-${item.id}`}>{item.rotulo}</Tooltip>}
              >
                {link}
              </OverlayTrigger>
            );
          })}
        </Nav>

        <Nav className="sidebar-itens sidebar-paginas">
          {PAGINAS.map((pagina) => (
            <Link
              key={pagina.href}
              href={pagina.href}
              prefetch={false}
              className="sidebar-item"
              title={recolhida ? pagina.rotulo : undefined}
            >
              <span className="sidebar-item-icone">{pagina.icone}</span>
              {!recolhida && <span className="sidebar-item-rotulo">{pagina.rotulo}</span>}
            </Link>
          ))}

          <Link href="/" prefetch={false} className="sidebar-item" title={recolhida ? 'Ver a loja' : undefined}>
            <span className="sidebar-item-icone"><Store size={18} /></span>
            {!recolhida && <span className="sidebar-item-rotulo">Ver a loja</span>}
          </Link>
        </Nav>

        <div className="sidebar-rodape">
          {/* Sair de verdade: até 24/08 este botão não fazia nada, e a
              sessão continuava aberta no aparelho. Num celular que ela
              empresta para a filha, isso é o painel inteiro exposto. */}
          <Button variant="link" className="sidebar-item sair" onClick={sairDaConta}>
            <span className="sidebar-item-icone">
              <LogOut size={16} />
            </span>
            {!recolhida && <span className="sidebar-item-rotulo">Sair</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
