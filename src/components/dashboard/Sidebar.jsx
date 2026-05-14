import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { 
  TrendingUp, 
  ShoppingBag, 
  Mail, 
  Settings, 
  LogOut,
  Package,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: <TrendingUp size={18}/>, label: 'Visão Geral' },
    { id: 'pedidos', icon: <ShoppingBag size={18}/>, label: 'Vendas & Pedidos' },
    { id: 'mensagens', icon: <MessageSquare size={18}/>, label: 'Mensagens' },
    { id: 'marketing', icon: <Mail size={18}/>, label: 'Marketing IA' },
    { id: 'catalogo', icon: <Package size={18}/>, label: 'Meus Produtos' },
    { id: 'config', icon: <Settings size={18}/>, label: 'Configurações' },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 mobile-only" 
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <div className={`p-4 d-flex flex-column gap-4 shadow-sm sidebar-nav ${isOpen ? 'open' : ''}`} style={{ 
        width: '280px', 
        backgroundColor: '#FFFFFF', 
        borderRight: '1px solid #9B89B333',
        zIndex: 1050,
        transition: 'all 0.3s ease-in-out'
      }}>
        <div className="px-3 py-2 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-black mb-0" style={{ fontFamily: 'Playfair Display', fontSize: '22px', color: '#2D2438' }}>
              Projeto<span style={{ color: '#9B89B3' }}> Autônomo</span>
            </h2>
            <small className="text-muted text-uppercase ls-wide fw-bold" style={{ fontSize: '9px', letterSpacing: '1.5px' }}>
              Gestão Multi-Marca
            </small>
          </div>
          <Button variant="link" className="mobile-only p-0 text-muted" onClick={onClose}>
            <LogOut size={20} />
          </Button>
        </div>

        <Nav className="flex-column gap-2 px-2 mt-4">
          {menuItems.map((item, i) => (
            <Nav.Link 
              key={i} 
              onClick={() => { onTabChange(item.id); if(window.innerWidth < 992) onClose(); }}
              className={`d-flex align-items-center gap-3 px-4 py-3 rounded-4 text-decoration-none transition-all ${activeTab === item.id ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'text-muted'}`}
              style={{ 
                cursor: 'pointer', 
                fontWeight: activeTab === item.id ? '700' : '500',
                backgroundColor: activeTab === item.id ? 'rgba(155, 137, 179, 0.08)' : 'transparent'
              }}
            >
              <span style={{ color: activeTab === item.id ? '#9B89B3' : '#A0AEC0' }}>
                {item.icon}
              </span>
              <span className="small">{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        <div className="mt-auto px-2 border-top pt-4">
            <Button variant="link" className="w-100 text-muted text-decoration-none text-start d-flex align-items-center gap-2 small fw-bold opacity-75 hover-opacity-100">
                <LogOut size={16} /> Sair do Painel
            </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
