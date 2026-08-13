'use client'

import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Eye } from 'lucide-react';

const OrderTable = ({ orders, onSelectOrder }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover border-0">
        <thead>
          <tr className="text-muted small text-uppercase ls-wide">
            <th className="border-0 pb-3">Pedido</th>
            <th className="border-0 pb-3">Cliente</th>
            <th className="border-0 pb-3">Nicho</th>
            <th className="border-0 pb-3">Valor</th>
            <th className="border-0 pb-3">Status</th>
            <th className="border-0 pb-3 text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr key={i} className="align-middle cursor-pointer" onClick={() => onSelectOrder(order)}>
              <td className="border-0 py-3 fw-bold">{order.id}</td>
              <td className="border-0 py-3">
                <div className="fw-bold">{order.customer}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>{order.date}</div>
              </td>
              <td className="border-0 py-3">
                <Badge bg={order.niche === 'Feito para Você' ? 'primary-subtle' : 'success-subtle'} className={`text-${order.niche === 'Feito para Você' ? 'primary' : 'success'} rounded-pill`}>
                  {order.niche}
                </Badge>
              </td>
              <td className="border-0 py-3 fw-black">R$ {order.total.toFixed(2)}</td>
              <td className="border-0 py-3">
                <span className="d-flex align-items-center gap-2 small">
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    backgroundColor: order.status === 'Pronto p/ Envio' ? '#27ae60' : '#f1c40f' 
                  }}></div>
                  {order.status}
                </span>
              </td>
              <td className="border-0 py-3 text-end">
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-circle p-2"
                  /* Botão só de ícone precisa dizer o que faz: sem isto o
                     leitor de tela anuncia apenas "botão", três vezes
                     seguidas, e quem ouve não sabe qual pedido é qual. */
                  aria-label={`Ver o pedido ${order.id}`}
                >
                  <Eye size={14} aria-hidden="true" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
