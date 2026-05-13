import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const CatalogSection = ({ onNewProduct }) => {
  const products = [
    { id: 1, name: "Planner Luxury 2026", category: "Papelaria", price: 189.90, stock: 45, sales: 128 },
    { id: 2, name: "Kit Stickers Minimalistas", category: "Papelaria", price: 45.00, stock: 150, sales: 84 },
    { id: 3, name: "Apostila Alfabetização Autista", category: "Ativ. Adaptadas", price: 97.00, stock: 'Digital', sales: 256 },
    { id: 4, name: "Jogo das Emoções", category: "Ativ. Adaptadas", price: 58.00, stock: 20, sales: 92 },
  ];

  return (
    <Card className="border-0 rounded-5 shadow-sm p-5 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-black fs-4 mb-1">Gestão de Catálogo</h3>
          <p className="text-muted small mb-0">Gerencie seus produtos nas duas lojas de forma centralizada.</p>
        </div>
        <Button onClick={onNewProduct} variant="dark" className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2">
          <Plus size={18} /> Novo Produto
        </Button>
      </div>

      <Table responsive hover className="align-middle">
        <thead>
          <tr className="text-muted small text-uppercase fw-bold border-bottom">
            <th className="pb-3 border-0">Produto</th>
            <th className="pb-3 border-0">Categoria</th>
            <th className="pb-3 border-0">Preço</th>
            <th className="pb-3 border-0">Estoque</th>
            <th className="pb-3 border-0">Vendas</th>
            <th className="pb-3 border-0 text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-bottom border-light">
              <td className="py-4 border-0">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light rounded-3" style={{ width: '40px', height: '40px' }}></div>
                  <span className="fw-bold">{product.name}</span>
                </div>
              </td>
              <td className="border-0">
                <Badge bg="light" className="text-dark rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '10px' }}>
                  {product.category}
                </Badge>
              </td>
              <td className="border-0 fw-bold">R$ {product.price.toFixed(2)}</td>
              <td className="border-0 text-muted">{product.stock}</td>
              <td className="border-0">
                <span className="fw-bold text-primary" style={{ color: '#9B89B3' }}>{product.sales}</span> un.
              </td>
              <td className="border-0 text-end">
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="link" className="p-0 text-muted hover:text-dark"><Edit size={18} /></Button>
                  <Button variant="link" className="p-0 text-muted hover:text-danger"><Trash2 size={18} /></Button>
                  <Button variant="link" className="p-0 text-primary" style={{ color: '#9B89B3' }}><ExternalLink size={18} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default CatalogSection;
