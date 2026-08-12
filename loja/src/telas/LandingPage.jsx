'use client'

import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, ArrowRight, Star, CreditCard, Truck, ShieldCheck, MessageCircle, MessageSquare, X, Plus, Minus, Check, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Nav, Navbar, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import ProductCard from './landing/ProductCard';
import CartModal from './landing/CartModal';
import CheckoutModal from './landing/CheckoutModal';
import {
  PERSONALIZADA,
  PEDAGOGICA,
  podeAdicionarAoCarrinho,
  quantidadeMinima,
  permiteVariasUnidades,
  totalCarrinho,
} from '../catalogo';
import { Instagram, Facebook } from './icones-marca';
import { PRODUTOS } from './catalogo';
import { BASE } from '../base'

/**
 * Catálogo de exemplo, só para mostrar o formato das telas.
 * Nada aqui é produto real: os itens, preços e fotos entram quando a
 * cliente enviar o catálogo dela.
 */
const products = PRODUTOS;

const LandingPage = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');

  /** null quando não há aviso; { tipo, texto } quando há. */
  const [aviso, setAviso] = useState(null);

  /**
   * O carrinho guarda uma linha por produto, com quantidade — e não um
   * item repetido por clique. Com mínimo de 10 unidades, repetir linha
   * deixaria o carrinho ilegível e a conta errada.
   */
  const addToCart = (product) => {
    const permissao = podeAdicionarAoCarrinho(cart, product);

    if (!permissao.ok) {
      setAviso({ tipo: 'bloqueio', texto: permissao.motivo });
      return;
    }

    const existente = cart.find((item) => item.id === product.id);

    if (existente) {
      if (!permiteVariasUnidades(product.category)) {
        setAviso({ tipo: 'bloqueio', texto: 'Este material já está no carrinho. É um arquivo digital, uma unidade basta.' });
        return;
      }

      alterarQuantidade(product.id, existente.quantidade + 1);
      return;
    }

    const minimo = quantidadeMinima(product.category);
    setCart([...cart, { ...product, quantidade: minimo }]);
    setAviso({
      tipo: 'ok',
      texto: minimo > 1
        ? `${minimo} unidades adicionadas — é o mínimo deste produto`
        : 'Material adicionado ao carrinho',
    });
  };

  /** Respeita o mínimo do produto: abaixo dele, a linha sai do carrinho. */
  const alterarQuantidade = (productId, novaQuantidade) => {
    setCart((atual) => atual.flatMap((item) => {
      if (item.id !== productId) return [item];
      if (novaQuantidade < quantidadeMinima(item.category)) return [];
      return [{ ...item, quantidade: novaQuantidade }];
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const cartTotal = totalCarrinho(cart);
  const cartCount = cart.reduce((soma, item) => soma + item.quantidade, 0);

  const filteredProducts = activeCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="landing-page" style={{ backgroundColor: '#FBFAF7', minHeight: '100vh' }}>
      {/* Navbar Premium */}
      <Navbar expand="lg" fixed="top" className="bg-white bg-opacity-90 backdrop-blur border-bottom py-3 shadow-sm" style={{ zIndex: 1050 }}>
        <Container>
          {/* Sem href: o hash pertence ao roteador do App, e escrever '#'
              aqui trocaria a view ao recarregar. */}
          <Navbar.Brand
            as="button"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ fontFamily: 'Fraunces', fontSize: '24px', fontWeight: 900, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            Feito para você!<span style={{ color: "#2E9B96" }}> Personalizados</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto gap-lg-4 text-uppercase fw-bold py-4 py-lg-0" style={{ fontSize: '11px', letterSpacing: '2px' }}>
              {['Todas', PERSONALIZADA, PEDAGOGICA].map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 mb-2 mb-lg-0 rounded-pill fw-bold border-0 transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-light text-muted hover:bg-white'}`}
                    style={activeCategory === cat ? { backgroundColor: '#2E9B96' } : {}}
                >
                    {cat}
                </button>
              ))}
            </Nav>
            <div className="d-flex align-items-center justify-content-center justify-content-lg-end gap-4 pb-4 pb-lg-0">
              <Search size={20} className="text-muted cursor-pointer" />
              <div className="position-relative cursor-pointer" onClick={() => setShowCart(true)}>
                <ShoppingCart size={22} className="text-dark" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="position-absolute top-0 start-100 translate-middle"
                    >
                        <Badge pill bg="primary" style={{ backgroundColor: '#2E9B96', fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cartCount}
                        </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="section-padding" style={{ paddingTop: '140px', background: 'radial-gradient(circle at top right, #F0EDF5, #FBFAF7)' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0 text-center text-lg-start">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="d-inline-block px-3 py-1 mb-4 rounded-pill" style={{ backgroundColor: 'rgba(46, 155, 150, 0.1)', color: '#2E9B96', fontSize: '12px', fontWeight: 800, letterSpacing: '2px' }}>
                    PERSONALIZADOS SOB ENCOMENDA & MATERIAL PEDAGÓGICO DIGITAL
                </div>
                <h1 className="display-2 fw-black mb-4" style={{ fontFamily: 'Fraunces', color: '#12305B', lineHeight: 1.1 }}>
                  Design que acolhe e <br/>
                  <span style={{ color: '#2E9B96' }}>organiza</span> vidas.
                </h1>
                <p className="lead text-muted mb-5 pe-lg-5" style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>
                  Unimos a delicadeza da papelaria artesanal com a funcionalidade de materiais educativos adaptados para neurodiversidade.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                  <Button className="rounded-pill px-5 py-3 fw-bold border-0 shadow-lg" style={{ backgroundColor: '#12305B' }} onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                    Ver Coleções
                  </Button>
                  <Button
                    as="a"
                    href="https://wa.me/5521900000000?text=Oi%20Vivian!%20Vi%20sua%20loja%20e%20queria%20tirar%20uma%20d%C3%BAvida."
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline-dark"
                    className="rounded-pill px-5 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    <MessageSquare size={18}/> Mensagem
                  </Button>
                </div>
                
                {/* Prova social entra quando a cliente passar os números
                    reais dela do Elo7. Nada inventado aqui: número de
                    pedido falso numa loja de material inclusivo custa caro
                    se alguém confere. */}
                <div className="mt-5 pt-4 border-top border-light d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-3 small">
                    <span className="d-inline-flex align-items-center gap-2 fw-bold" style={{ color: '#12305B' }}>
                        <Truck size={18} /> Envio para todo o Brasil
                    </span>
                    <span className="d-inline-flex align-items-center gap-2 fw-bold" style={{ color: '#12305B' }}>
                        <MessageCircle size={18} /> Atendimento direto com a Vivian
                    </span>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="position-relative"
              >
                <div className="rounded-5 overflow-hidden shadow-2xl" style={{ boxShadow: '0 50px 100px -20px rgba(0,0,0,0.15)' }}>
                  <img src={`${BASE}hero_boutique_vivian_1778705287616.png`} alt="Hero" className="w-100" />
                </div>
                {/* Espaço reservado para um depoimento real. Inventar a fala
                    de uma mãe atípica para vender material de inclusão é o
                    tipo de coisa que destrói a confiança que a loja depende
                    de construir. */}
                <div className="position-absolute bottom-0 start-0 m-4 p-4 glass rounded-4 border border-white border-opacity-50 shadow-lg animate-fade-in" style={{ maxWidth: '280px' }}>
                  <div className="d-flex gap-1 mb-2" style={{ color: '#A8C6E8' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} />)}
                  </div>
                  <p className="small fw-bold mb-1" style={{ color: '#12305B' }}>Aqui entra um depoimento de verdade de uma cliente sua.</p>
                  <span className="small text-muted">Me manda um print e eu coloco</span>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>


      {/* Featured Catalog */}
      <section id="catalog" className="section-padding">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-5 text-center text-md-start">
            <div className="mb-4 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2" style={{ color: '#2E9B96' }}>
                <div style={{ width: '40px', height: '1px', backgroundColor: '#2E9B96' }}></div>
                <span className="small fw-black text-uppercase ls-widest">Coleções 2026</span>
              </div>
              <h2 className="display-4 fw-black mb-0" style={{ fontFamily: 'Fraunces' }}>Nosso Catálogo</h2>
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {['Todas', PERSONALIZADA, PEDAGOGICA].map(cat => (
                <Button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  variant={activeCategory === cat ? 'dark' : 'outline-secondary'}
                  className="rounded-pill px-4 fw-bold small text-uppercase"
                  style={{ fontSize: '10px' }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <Row className="g-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <Col lg={4} sm={6} key={product.id}>
                  <ProductCard product={product} addToCart={addToCart} />
                </Col>
              ))}
            </AnimatePresence>
          </Row>
        </Container>
      </section>

      {/* Trust & Authority Section */}
      <section className="section-padding" style={{ backgroundColor: '#FBFAF7' }}>
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="display-5 fw-black mb-4" style={{ fontFamily: 'Fraunces' }}>Sua Compra é <span style={{ color: '#2E9B96' }}>Segura</span></h2>
              <p className="text-muted fs-5">
                Sabemos que confiança se conquista. Por isso, a loja utiliza as tecnologias de pagamento mais seguras do Brasil, garantindo a proteção total dos seus dados.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="p-5 bg-white rounded-5 shadow-sm h-100 border border-light transition-all hover-lift">
                <div className="bg-success bg-opacity-10 d-inline-flex p-3 rounded-4 mb-4"><ShieldCheck size={32} color="#198754" /></div>
                <h4 className="fw-black fs-5 mb-3">Segurança Bancária</h4>
                <p className="small text-muted mb-0">Pagamentos processados via Mercado Pago. Seus dados de cartão nunca são salvos em nosso sistema.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-5 bg-white rounded-5 shadow-sm h-100 border border-light transition-all hover-lift">
                <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-4 mb-4"><MessageCircle size={32} color="#2E9B96" /></div>
                <h4 className="fw-black fs-5 mb-3">Suporte Real</h4>
                <p className="small text-muted mb-0">Dúvidas sobre o material ou personalização? Vivian atende pessoalmente cada cliente no WhatsApp.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-5 bg-white rounded-5 shadow-sm h-100 border border-light transition-all hover-lift">
                <div className="bg-warning bg-opacity-10 d-inline-flex p-3 rounded-4 mb-4"><CheckCircle size={32} color="#C4436B" /></div>
                <h4 className="fw-black fs-5 mb-3">Qualidade Artesanal</h4>
                <p className="small text-muted mb-0">Cada peça é produzida com o carinho e o rigor técnico que sua família merece. Satisfação 100% garantida.</p>
              </div>
            </Col>
          </Row>
          <div className="mt-5 pt-4 d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Mercado_Pago.svg" style={{ height: '32px', maxWidth: '160px', objectFit: 'contain' }} alt="Mercado Pago" />
              <img src="https://logodownload.org/wp-content/uploads/2014/05/correios-logo-1.png" style={{ height: '28px', maxWidth: '120px', objectFit: 'contain' }} alt="Correios" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Pix_%28Brazil%29_logo.svg" style={{ height: '32px', maxWidth: '80px', objectFit: 'contain' }} alt="Pix" />
          </div>
        </Container>
      </section>

      {/* Modals & Cart */}
      <CartModal 
        show={showCart} 
        onHide={() => setShowCart(false)} 
        cart={cart}
        removeFromCart={removeFromCart}
        onChangeQuantity={alterarQuantidade}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
      />

      <CheckoutModal 
        show={showCheckout} 
        onHide={() => setShowCheckout(false)} 
        cart={cart} 
        cartTotal={cartTotal} 
        onComplete={() => {
            setShowCheckout(false);
            setCart([]);
            setAviso({
              tipo: 'ok',
              texto: 'Compra simulada. Numa loja no ar, este pedido já apareceria no painel da Vivian.',
            });
        }}
      />

      {/* Um aviso só, com duas caras: confirmação some rápido, bloqueio
          fica mais tempo e explica o que fazer em seguida. */}
      <ToastContainer position="bottom-center" className="p-4 p-md-5" style={{ zIndex: 2000 }}>
        <Toast
          show={!!aviso}
          onClose={() => setAviso(null)}
          delay={aviso?.tipo === 'bloqueio' ? 7000 : 2500}
          autohide
          className="border-0 shadow-lg"
          style={{
            borderRadius: aviso?.tipo === 'bloqueio' ? '12px' : '999px',
            backgroundColor: aviso?.tipo === 'bloqueio' ? '#FFD400' : '#12305B',
            maxWidth: '460px',
          }}
        >
          <Toast.Body
            className="py-3 px-4 d-flex align-items-center gap-3 fw-bold"
            style={{ color: aviso?.tipo === 'bloqueio' ? '#12305B' : '#FFFFFF' }}
          >
            {aviso?.tipo === 'bloqueio'
              ? <Package size={20} style={{ flexShrink: 0 }} />
              : <Check size={18} style={{ flexShrink: 0 }} />}
            <span>{aviso?.texto}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Footer Boutique */}
      <footer className="py-5 bg-dark text-white">
        <Container className="py-5 text-center">
          <div className="mb-4" style={{ fontFamily: 'Fraunces', fontSize: '32px', fontWeight: 900 }}>
            Feito para você!<span style={{ color: "#2E9B96" }}> Personalizados</span>
          </div>
          <p className="text-white-50 mb-5 mx-auto" style={{ maxWidth: '500px' }}>Transformando a rotina através do design inclusivo e da organização artesanal.</p>
          <div className="d-flex justify-content-center gap-4 mb-5">
            <Instagram size={24} className="cursor-pointer text-white-50 hover:text-white" />
            <Facebook size={24} className="cursor-pointer text-white-50 hover:text-white" />
            <MessageCircle size={24} className="cursor-pointer text-white-50 hover:text-white" />
          </div>
          <div className="pt-5 border-top border-secondary text-white-50 small">
            &copy; 2026 Feito para você! Personalizados &middot; Rio de Janeiro, RJ
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
