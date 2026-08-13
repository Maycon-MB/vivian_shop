'use client'

import React from 'react';
import { Nav, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  TrendingUp,
  ShoppingBag,
  Mail,
  Settings,
  LogOut,
  Package,
  MessageSquare,
  FileBarChart,
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
  { id: 'config', icone: <Settings size={18} />, rotulo: 'Configurações' },
];

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, recolhida, onAlternarRecolhida }) => {
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
              <small>Painel da loja</small>
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

        <div className="sidebar-rodape">
          <Button variant="link" className="sidebar-item sair">
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
