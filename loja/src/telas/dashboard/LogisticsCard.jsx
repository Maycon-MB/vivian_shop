'use client'

import React from 'react';
import { Button } from 'react-bootstrap';
import { Printer, FileText, ArrowRight } from 'lucide-react';

/**
 * Atalhos de postagem.
 *
 * Conteúdo puro: a moldura e o título vêm do CartaoPainel que envolve
 * isto. Os dois documentos ficam lado a lado porque saem sempre juntos —
 * separá-los sugeriria que dá para levar um sem o outro.
 */
const LogisticsCard = ({ onShowLabel }) => (
  <div className="logistica-bloco">
    <Button onClick={onShowLabel} variant="light" className="logistica-acao">
      <span className="logistica-icone">
        <Printer size={20} />
      </span>
      <span className="logistica-texto">
        <strong>Gerar 12 etiquetas</strong>
        <span>Pedidos prontos para postar</span>
      </span>
      <ArrowRight size={18} className="logistica-seta" />
    </Button>

    <Button onClick={onShowLabel} variant="light" className="logistica-acao">
      <span className="logistica-icone">
        <FileText size={20} />
      </span>
      <span className="logistica-texto">
        <strong>Declaração de conteúdo</strong>
        <span>Sai preenchida, você só assina</span>
      </span>
      <ArrowRight size={18} className="logistica-seta" />
    </Button>
  </div>
);

export default LogisticsCard;
