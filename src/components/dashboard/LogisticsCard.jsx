import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Printer, FileText, ArrowRight } from 'lucide-react';

const LogisticsCard = ({ onShowLabel }) => (
  <Card className="border-0 rounded-5 p-5 bg-white flex-grow-1" style={{ 
    border: '1px solid #9B89B366', 
    boxShadow: '0 15px 35px rgba(155,137,179,0.12)',
    color: '#2D2438'
  }}>
    <div className="mb-5">
        <h3 className="fw-black fs-5 mb-1" style={{ color: '#2D2438' }}>Logística Vivian</h3>
        <p className="text-muted small">Imprima documentos para postagem.</p>
    </div>
    <div className="d-flex flex-column gap-3">
      <Button 
        onClick={onShowLabel}
        variant="outline-dark" 
        className="text-start border-opacity-25 py-3 px-4 rounded-4 d-flex align-items-center justify-content-between gap-2 transition-all"
        style={{ borderColor: '#9B89B366', color: '#2D2438' }}
      >
        <div className="d-flex align-items-center gap-3">
            <Printer size={20} style={{ color: '#9B89B3' }}/> 
            <span className="fw-bold">Gerar 12 Etiquetas</span>
        </div>
        <ArrowRight size={18} className="opacity-50"/>
      </Button>
      <Button 
        onClick={onShowLabel}
        variant="outline-dark" 
        className="text-start border-opacity-25 py-3 px-4 rounded-4 d-flex align-items-center justify-content-between gap-2 transition-all"
        style={{ borderColor: '#9B89B366', color: '#2D2438' }}
      >
        <div className="d-flex align-items-center gap-3">
            <FileText size={20} style={{ color: '#9B89B3' }}/> 
            <span className="fw-bold">Declaração de Conteúdo</span>
        </div>
        <ArrowRight size={18} className="opacity-50"/>
      </Button>
    </div>
  </Card>
);

export default LogisticsCard;
