import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Instagram } from 'lucide-react';

const MarketingIA = ({ approving, onApprove }) => (
  <Card className="border-0 rounded-5 p-4 bg-white" style={{ 
    border: '1px solid #2E9B9666', 
    boxShadow: '0 15px 35px rgba(46,155,150,0.12)' 
  }}>
    <div className="d-flex justify-content-between align-items-start mb-4">
        <h3 className="fw-black fs-5 mb-0">Marketing IA</h3>
        <Badge bg="info-subtle" className="text-info rounded-pill">Novo Draft</Badge>
    </div>
    <div className="p-4 bg-light rounded-5 border border-primary border-opacity-10 border-dashed">
      <div className="d-flex gap-3 align-items-center mb-4">
        <div className="bg-primary rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: '#2E9B96' }}>
            <Instagram size={24} className="text-white" />
        </div>
        <div>
          <p className="small fw-bold mb-0">Post: Kit Adaptado</p>
          <p className="text-muted" style={{ fontSize: '11px' }}>Foco em: Educação Inclusiva</p>
        </div>
      </div>
      <div className="mb-4 bg-white p-3 rounded-4 border">
        <p className="small text-muted mb-0 italic">"✨ Novas atividades adaptadas para alfabetização. Desenvolvidas com carinho..."</p>
      </div>
      <Button 
        disabled={approving} 
        onClick={onApprove} 
        variant="dark" 
        className="w-100 py-3 rounded-pill fw-bold shadow-sm"
      >
        {approving ? 'Agendando...' : 'Aprovar e Agendar'}
      </Button>
    </div>
  </Card>
);

export default MarketingIA;
