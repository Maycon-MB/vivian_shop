import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ product, addToCart }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="premium-card bg-white border-0 h-100 rounded-5 overflow-hidden">
        <div className="product-image-container mb-0">
          <div className="position-absolute top-0 start-0 m-3 z-10">
            {/* Verde-água identifica a linha de papelaria; amarelo, a
                pedagógica. Ver spec de identidade visual. */}
            <span className="glass-pill" style={{
              backgroundColor: product.category === 'Feito para Você'
                ? 'rgba(46, 155, 150, 0.85)'
                : 'rgba(255, 212, 0, 0.9)',
              color: product.category === 'Feito para Você' ? '#FFFFFF' : '#12305B'
            }}>
              {product.category}
            </span>
          </div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-100" 
            style={{ height: '300px', objectFit: 'cover' }} 
          />
          <div className="hover-overlay position-absolute inset-0 bg-dark bg-opacity-20 d-flex align-items-center justify-content-center opacity-0 hover:opacity-100 transition-opacity">
            <Button 
              variant="light" 
              className="rounded-circle p-3 shadow-lg"
              onClick={() => addToCart(product)}
            >
              <Plus size={24} />
            </Button>
          </div>
        </div>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h3 className="fs-5 fw-black mb-0">{product.name}</h3>
            <span className="fw-black text-dark fs-5">R$ {product.price.toFixed(2)}</span>
          </div>
          <p className="text-muted small mb-4">{product.description}</p>
          <div className="d-flex gap-1 text-warning mb-4">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
            <span className="text-muted small ms-2">(Avaliações)</span>
          </div>
          <Button 
            onClick={() => addToCart(product)}
            variant="outline-dark" 
            className="w-100 py-3 rounded-pill fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2" 
            style={{ fontSize: '11px', letterSpacing: '1px' }}
          >
            <ShoppingCart size={16}/> Comprar
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
