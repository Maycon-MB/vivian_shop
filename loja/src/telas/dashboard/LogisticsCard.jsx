'use client'

import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Printer, FileText, ArrowRight } from 'lucide-react';

const LogisticsCard = ({ onShowLabel }) => (
  <Card className="border-0 rounded-5 p-5 bg-white flex-grow-1" style={{ 
    border: '1px solid #2E9B9666', 
    boxShadow: '0 15px 35px rgba(46,155,150,0.12)',
    color: '#12305B'
  }}>
    <div className="mb-5">
        <h3 className="fw-black fs-5 mb-1" style={{ color: '#12305B' }}>Logística Vivian</h3>
        <p className="text-muted small">Imprima documentos para postagem.</p>
    </div>
    <div className="d-flex flex-column gap-3">
      <Button 
        onClick={onShowLabel}
        variant="outline-dark" 
        className="text-start border-opacity-25 py-3 px-4 rounded-4 d-flex align-items-center justify-content-between gap-2 transition-all"
        style={{ borderColor: '#2E9B9666', color: '#12305B' }}
      >
        <div className="d-flex align-items-center gap-3">
            <Printer size={20} style={{ color: '#2E9B96' }}/> 
            <span className="fw-bold">Gerar 12 Etiquetas</span>
        </div>
        <ArrowRight size={18} className="opacity-50"/>
      </Button>
      <Button 
        onClick={onShowLabel}
        variant="outline-dark" 
        className="text-start border-opacity-25 py-3 px-4 rounded-4 d-flex align-items-center justify-content-between gap-2 transition-all"
        style={{ borderColor: '#2E9B9666', color: '#12305B' }}
      >
        <div className="d-flex align-items-center gap-3">
            <FileText size={20} style={{ color: '#2E9B96' }}/> 
            <span className="fw-bold">Declaração de Conteúdo</span>
        </div>
        <ArrowRight size={18} className="opacity-50"/>
      </Button>
    </div>
  </Card>
);

export default LogisticsCard;
