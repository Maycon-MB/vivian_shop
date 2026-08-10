import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ShoppingCart, X } from 'lucide-react';

const CartModal = ({ show, onHide, cart, removeFromCart, cartTotal, onCheckout }) => {
  return (
    <Modal show={show} onHide={onHide} placement="end" className="p-0">
      <Modal.Header closeButton className="border-0 p-4">
          <Modal.Title className="fw-black fs-4">Seu Carrinho</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
          {cart.length === 0 ? (
              <div className="text-center py-5">
                  <ShoppingCart size={64} className="text-light mb-3" />
                  <p className="text-muted">Seu carrinho está vazio.</p>
              </div>
          ) : (
              <div className="d-flex flex-column gap-3">
                  {cart.map((item) => (
                      <div key={item.cartId} className="d-flex gap-3 bg-light p-3 rounded-4 border">
                          <img src={item.image} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px' }} />
                          <div className="flex-grow-1">
                              <p className="fw-bold mb-0 small">{item.name}</p>
                              <p className="text-primary small mb-0 fw-black">R$ {item.price.toFixed(2)}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.cartId)} className="btn btn-sm btn-link text-danger p-0"><X size={18}/></button>
                      </div>
                  ))}
                  <div className="mt-4 pt-4 border-top">
                      <div className="d-flex justify-content-between mb-4">
                          <span className="fw-bold text-muted">Subtotal:</span>
                          <span className="fw-black fs-4">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <Button 
                          onClick={onCheckout}
                          className="w-100 py-3 rounded-pill fw-bold" 
                          style={{ backgroundColor: '#12305B' }}
                      >
                          Finalizar Compra
                      </Button>
                  </div>
              </div>
          )}
      </Modal.Body>
    </Modal>
  );
};

export default CartModal;
