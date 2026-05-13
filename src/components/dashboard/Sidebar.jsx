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

const Sidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: <TrendingUp size={18}/>, label: 'Visão Geral' },
    { id: 'pedidos', icon: <ShoppingBag size={18}/>, label: 'Vendas & Pedidos' },
    { id: 'mensagens', icon: <MessageSquare size={18}/>, label: 'Mensagens' },
    { id: 'marketing', icon: <Mail size={18}/>, label: 'Marketing IA' },
    { id: 'catalogo', icon: <Package size={18}/>, label: 'Meus Produtos' },
    { id: 'config', icon: <Settings size={18}/>, label: 'Configurações' },
  ];

  return (
    <div className="p-4 d-flex flex-column gap-5 shadow-sm" style={{ 
      width: '300px', 
      backgroundColor: '#FFFFFF', 
      borderRight: '1px solid #9B89B333',
      zIndex: 100 
    }}>
      <div className="px-3 py-2">
        <h2 className="fw-black mb-0" style={{ fontFamily: 'Playfair Display', fontSize: '22px', color: '#2D2438' }}>
          Projeto<span style={{ color: '#9B89B3' }}> Autônomo</span>
        </h2>
        <small className="text-muted text-uppercase ls-wide fw-bold" style={{ fontSize: '9px', letterSpacing: '1.5px' }}>
          Gestão Multi-Marca
        </small>
      </div>

      <Nav className="flex-column gap-2 px-2">
        {menuItems.map((item, i) => (
          <Nav.Link 
            key={i} 
            onClick={() => onTabChange(item.id)}
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
  );
};

export default Sidebar;
