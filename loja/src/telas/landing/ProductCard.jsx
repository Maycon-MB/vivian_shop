'use client'

import React from 'react';
import Link from 'next/link';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, Download, Package } from 'lucide-react';
import { PERSONALIZADA, MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from '../../catalogo';

/**
 * Card de produto.
 *
 * As duas linhas se comportam de formas diferentes e o card precisa dizer
 * isso antes da compra: a personalizada é feita sob encomenda, com mínimo
 * de peças e prazo de produção; a pedagógica é digital e chega na hora.
 */
const ProductCard = ({ product, addToCart }) => {
  const isPersonalizada = product.category === PERSONALIZADA;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="premium-card bg-white border-0 h-100 rounded-4 overflow-hidden">
        <div className="product-image-container mb-0">
          <div className="position-absolute top-0 start-0 m-3 z-10">
            {/* Verde-água identifica a linha personalizada; amarelo, a
                pedagógica. Ver spec de identidade visual. */}
            <span className="glass-pill" style={{
              backgroundColor: isPersonalizada
                ? 'rgba(46, 155, 150, 0.85)'
                : 'rgba(255, 212, 0, 0.9)',
              color: isPersonalizada ? '#FFFFFF' : '#12305B'
            }}>
              {product.category}
            </span>
          </div>

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-100"
              style={{ height: '300px', objectFit: 'cover' }}
            />
          ) : (
            /* Sem foto de banco de imagem: produto que a cliente ainda não
               fotografou fica marcado como espaço reservado, não disfarçado
               com a foto de outra pessoa. */
            <div
              className="w-100 d-flex flex-column align-items-center justify-content-center gap-2"
              style={{
                height: '300px',
                backgroundColor: isPersonalizada ? 'rgba(46, 155, 150, 0.08)' : 'rgba(255, 212, 0, 0.12)',
                color: '#6B7C8F',
              }}
            >
              <Package size={28} />
              <span className="small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                Aqui entra sua foto
              </span>
            </div>
          )}
        </div>

        <Card.Body className="p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h3 className="fs-5 fw-black mb-0"><Link href={`/produto/${product.slug}`} prefetch={false} className="text-reset text-decoration-none link-produto">{product.name}</Link></h3>
            <div className="text-end">
              <span className="fw-black fs-5 text-nowrap d-block" style={{ color: '#12305B' }}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {isPersonalizada && (
                <span className="small text-muted text-nowrap">cada</span>
              )}
            </div>
          </div>

          <p className="text-muted small mb-3">{product.description}</p>

          {/* A regra de venda vem antes do botão: ninguém deve descobrir o
              mínimo de 10 peças só no carrinho. */}
          <div className="d-flex align-items-center gap-2 small fw-bold mb-4" style={{ color: '#12305B' }}>
            {isPersonalizada ? (
              <>
                <Package size={15} style={{ flexShrink: 0 }} />
                <span>
                  Mínimo {MINIMO_PERSONALIZADO} un. — R$ {(product.price * MINIMO_PERSONALIZADO).toFixed(2).replace('.', ',')} ·
                  pronto em {PRAZO_PRODUCAO} dias úteis
                </span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Arquivo digital · chega na hora do pagamento</span>
              </>
            )}
          </div>

          <Button
            onClick={() => addToCart(product)}
            variant="outline-dark"
            className="w-100 py-3 rounded-pill fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 mt-auto"
            style={{ fontSize: '11px', letterSpacing: '1px' }}
          >
            <ShoppingCart size={16} /> Comprar
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
