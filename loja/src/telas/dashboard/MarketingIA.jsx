'use client'

import React from 'react';
import { Button } from 'react-bootstrap';
import { Instagram } from '../icones-marca';

/**
 * Sugestão de post da semana.
 *
 * Conteúdo puro: a moldura, o título e a explicação vêm do CartaoPainel
 * que envolve isto — dois cards aninhados criariam borda dentro de borda.
 *
 * O botão diz "Aprovar e agendar", e não "publicar", porque nada vai para
 * o Instagram dela sem ela ler antes.
 */
const MarketingIA = ({ approving, onApprove }) => (
  <div className="marketing-bloco">
    <div className="marketing-post">
      <div className="d-flex gap-3 align-items-center mb-3">
        <div className="marketing-avatar">
          <Instagram size={22} className="text-white" />
        </div>
        <div>
          <p className="small fw-bold mb-0">Post: kit adaptado</p>
          <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
            Foco em educação inclusiva
          </p>
        </div>
      </div>

      <blockquote className="marketing-texto">
        “Novas atividades adaptadas para alfabetização. Desenvolvidas com carinho para
        acompanhar cada descoberta.”
      </blockquote>

      <Button
        onClick={onApprove}
        disabled={approving}
        className="w-100 py-3 rounded-pill fw-bold border-0"
        style={{ backgroundColor: '#12305B' }}
      >
        {approving ? 'Agendando...' : 'Aprovar e agendar'}
      </Button>

      <p className="marketing-nota">Nada é publicado sem você aprovar.</p>
    </div>
  </div>
);

export default MarketingIA;
