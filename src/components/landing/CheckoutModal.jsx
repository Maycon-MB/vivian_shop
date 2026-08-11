import React from 'react';
import { Modal, Row, Col, Form, Button } from 'react-bootstrap';
import { ShieldCheck } from 'lucide-react';
import { subtotalItem } from '../../catalogo';

const CheckoutModal = ({ show, onHide, cart, cartTotal, onComplete }) => {
  const [step, setStep] = React.useState('checkout'); // 'checkout', 'processing', 'success'

  const handleComplete = () => {
    setStep('processing');
    setTimeout(() => {
        setStep('success');
    }, 2000);
  };

  if (step === 'processing') {
      return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Body className="p-5 text-center">
                <div className="spinner-border text-primary mb-4" role="status" style={{ color: '#2E9B96' }}></div>
                <h4 className="fw-black mb-2">Processando Pagamento...</h4>
                <p className="text-muted">Estamos validando os dados com segurança.</p>
            </Modal.Body>
        </Modal>
      );
  }

  if (step === 'success') {
      return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Body className="p-5 text-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-4 mb-4">
                    <ShieldCheck size={64} />
                </div>
                <h2 className="fw-black mb-3" style={{ fontFamily: 'Fraunces' }}>Pagamento Aprovado!</h2>
                <p className="text-muted mb-5">Obrigado pela sua compra. Vivian, agora você pode ver este pedido em tempo real no seu Dashboard!</p>
                <Button variant="dark" className="w-100 py-3 rounded-pill fw-bold" onClick={onComplete}>
                    Concluir Simulação
                </Button>
            </Modal.Body>
        </Modal>
      );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-black fs-3" style={{ fontFamily: 'Fraunces' }}>Finalizar Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 p-md-5">
          <Row className="g-5">
              <Col lg={7}>
                  <div className="checkout-section mb-5">
                      <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#2E9B96', color: 'white' }}>1</div>
                          Entrega e Contato
                      </h5>
                      <Form className="d-flex flex-column gap-3">
                          <Form.Control placeholder="Nome Completo" className="py-3 rounded-3 border-light shadow-sm" defaultValue="Mariana Silva" />
                          <Row className="g-3">
                              <Col md={6}><Form.Control placeholder="CEP" className="py-3 rounded-3 border-light shadow-sm" defaultValue="01234-567" /></Col>
                              <Col md={6}><Form.Control placeholder="WhatsApp" className="py-3 rounded-3 border-light shadow-sm" defaultValue="(11) 98765-4321" /></Col>
                          </Row>
                          <Form.Control placeholder="Endereço, Número e Complemento" className="py-3 rounded-3 border-light shadow-sm" defaultValue="Rua das Flores, 123" />
                      </Form>
                  </div>

                  <div className="checkout-section mb-5">
                      <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#2E9B96', color: 'white' }}>2</div>
                          Escolha o Frete
                      </h5>
                      <div className="d-flex flex-column gap-3">
                          {[
                              { id: 'pac', name: 'Correios PAC', time: '8-10 dias', price: 18.90 },
                              { id: 'sedex', name: 'Correios SEDEX', time: '2-4 dias', price: 34.50 }
                          ].map(opt => (
                              <div key={opt.id} className="p-3 border rounded-4 bg-light bg-opacity-50 d-flex justify-content-between align-items-center cursor-pointer hover:bg-white transition-all">
                                  <Form.Check type="radio" name="frete" id={opt.id} label={
                                      <div className="ms-2">
                                          <span className="fw-bold d-block">{opt.name}</span>
                                          <small className="text-muted">Chega em até {opt.time}</small>
                                      </div>
                                  } defaultChecked={opt.id === 'pac'} />
                                  <span className="fw-bold text-success">R$ {opt.price.toFixed(2)}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="checkout-section">
                      <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px', backgroundColor: '#2E9B96', color: 'white' }}>3</div>
                          Pagamento
                      </h5>
                      <div className="p-4 border rounded-4 mb-3">
                          <Form.Check type="radio" name="pay" id="card" label={<span className="fw-bold">Cartão de Crédito</span>} defaultChecked className="mb-3" />
                          <Row className="g-3 ms-1">
                              <Col md={12}><Form.Control placeholder="0000 0000 0000 0000" className="py-2" defaultValue="4532 1123 5542 9988" /></Col>
                              <Col md={12}>
                                  <Form.Select className="py-2">
                                      <option>Parcelar compra...</option>
                                      {[1,2,3,4,5,6,10,12].map(n => (
                                          <option key={n}>{n}x de R$ {((cartTotal + 18.90)/n).toFixed(2)} {n <= 3 ? 'sem juros' : ''}</option>
                                      ))}
                                  </Form.Select>
                              </Col>
                          </Row>
                      </div>
                      <div className="p-4 border rounded-4 bg-light bg-opacity-50">
                          <Form.Check type="radio" name="pay" id="pix_pay" label={<span className="fw-bold">Pix (Desconto de 5%)</span>} />
                      </div>
                  </div>
              </Col>
              <Col lg={5}>
                  <div className="p-4 p-md-5 bg-light rounded-5 h-100 shadow-sm border border-white">
                      <h5 className="fw-bold mb-4">Resumo do Pedido</h5>
                      <div className="d-flex flex-column gap-3 mb-4">
                          {cart.map(item => (
                              <div key={item.id} className="d-flex justify-content-between align-items-center gap-2 small">
                                  <span className="text-muted">
                                      {item.quantidade > 1 && <strong>{item.quantidade}x </strong>}
                                      {item.name}
                                  </span>
                                  <span className="fw-bold text-nowrap" style={{ color: '#12305B', fontVariantNumeric: 'tabular-nums' }}>
                                      R$ {subtotalItem(item).toFixed(2).replace('.', ',')}
                                  </span>
                              </div>
                          ))}
                      </div>
                      <div className="border-top border-bottom py-3 mb-4">
                          <div className="d-flex justify-content-between small mb-2">
                               <span className="text-muted">Subtotal</span>
                               <span className="fw-bold">R$ {cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between small mb-2">
                               <span className="text-muted">Frete (PAC)</span>
                               <span className="fw-bold text-success">R$ 18.90</span>
                          </div>
                      </div>
                      <div className="d-flex justify-content-between fs-4 fw-black mb-5">
                          <span>Total</span>
                          <span className="text-primary" style={{ color: '#2E9B96' }}>R$ {(cartTotal + 18.90).toFixed(2)}</span>
                      </div>
                      <Button 
                          className="w-100 py-3 rounded-pill fw-bold border-0 shadow-lg mb-3" 
                          style={{ backgroundColor: '#2E9B96' }}
                          onClick={handleComplete}
                      >
                          Finalizar Pedido
                      </Button>
                      <div className="text-center text-muted" style={{ fontSize: '10px' }}>
                          <ShieldCheck size={12} className="me-1 mb-1" /> PAGAMENTO 100% SEGURO VIA MERCADO PAGO
                      </div>
                  </div>
              </Col>
          </Row>
      </Modal.Body>
    </Modal>

  );
};

export default CheckoutModal;
