'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { ShoppingCart, Search, User, Truck, MessageCircle, MessageSquare, Check, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Nav, Navbar, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import ProductCard from './landing/ProductCard';
import CartModal from './landing/CartModal';
import {
  PERSONALIZADA,
  PEDAGOGICA,
  } from '../catalogo';
import { Facebook } from './icones-marca';
import { PUBLICADOS, temasDaVitrine } from './catalogo';
import { QUANTOS_DE_CARA, quantosProdutos } from '@/dominio/vitrineDeTemas';
import { paraAHome } from '@/dominio/vitrineDeProdutos';
import RodapeConfianca from './RodapeConfianca';
import Avaliacoes from './landing/Avaliacoes';
import { paraAVitrine } from '@/dominio/avaliacoes';
import avaliacoesCruas from '@/dados/avaliacoes.json';
import './landing/avaliacoes.css';
import { useCarrinho } from './CarrinhoContexto';
import { BASE } from '../base'

/**
 * Catálogo de exemplo, só para mostrar o formato das telas.
 * Nada aqui é produto real: os itens, preços e fotos entram quando a
 * cliente enviar o catálogo dela.
 */
const products = PUBLICADOS;

/* Só as linhas que têm produto no ar.

   O catálogo dela veio da Elojinha, que recebeu apenas a papelaria
   personalizada: o material pedagógico ficou no Projeto Educar e nunca
   migrou. Mostrar o filtro assim mesmo é oferecer um botão que só leva a
   uma tela vazia, e quem clica conclui que a loja está quebrada.

   Quando ela cadastrar o material pedagógico, o filtro volta sozinho. */
const LINHAS_COM_PRODUTO = ['Todas', PERSONALIZADA, PEDAGOGICA].filter(
  (linha) => linha === 'Todas' || products.some((p) => p.category === linha),
);

/* A mais recente com uma frase inteira, e não só a mais recente: a de
   26/02 diz "Adorai", que é sincera e curta demais para carregar o
   primeiro cartão que a pessoa lê. */
const TEMAS_DA_VITRINE = temasDaVitrine();

/* A home mostrava os 342 produtos de uma vez. Ninguém rola 342 cartões, e
   loja nenhuma faz isso: aqui fica uma seleção variada por tipo, e o
   catálogo inteiro com filtro mora em /produtos/. */
const DESTAQUES = paraAHome(PUBLICADOS);

const DEPOIMENTO = paraAVitrine(avaliacoesCruas).find((a) => a.texto.length > 40) ?? null;

const LandingPage = () => {
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [mostrarTodosOsTemas, setMostrarTodosOsTemas] = useState(false);

  /* O carrinho vem do contexto: precisa sobreviver à ida e volta da página
     de cada produto, e some se ficar dentro desta tela. */
  const {
    itens: cart,
    adicionar,
    alterarQuantidade,
    remover: removeFromCart,
    total: cartTotal,
    unidades: cartCount,
    aviso,
    setAviso,
  } = useCarrinho();

  const addToCart = (product) => adicionar(product);

  /* A seleção variada por tipo, e não o catálogo inteiro. O filtro por
     linha continua valendo dentro dela. */
  const filteredProducts = activeCategory === 'Todas'
    ? DESTAQUES
    : DESTAQUES.filter((p) => p.category === activeCategory);

  return (
    <div className="landing-page" style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh' }}>
      {/* Navbar Premium */}
      <Navbar expand="lg" fixed="top" className="bg-white bg-opacity-90 backdrop-blur border-bottom py-3 shadow-sm" style={{ zIndex: 1050 }}>
        <Container>
          {/* Sem href: o hash pertence ao roteador do App, e escrever '#'
              aqui trocaria a view ao recarregar. */}
          <Navbar.Brand
            as="button"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="marca-loja"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 900, background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            Feito para você!<span style={{ color: "var(--color-chalk)" }}> Personalizados</span>
          </Navbar.Brand>
          {/* O carrinho ficava dentro do menu recolhido, e no celular
              sumia atrás do hambúrguer: quem põe produto no carrinho não
              acha onde fechar a compra. Achado numa auditoria em 26/08.

              Aqui fora ele fica sempre visível no celular, ao lado do
              botão do menu. No computador some, porque lá o de dentro do
              menu aparece na barra. */}
          <button
            type="button"
            className="carrinho-no-celular d-lg-none"
            onClick={() => setShowCart(true)}
            aria-label={cartCount > 0 ? `Ver o carrinho, ${cartCount} itens` : 'Ver o carrinho'}
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && <span className="carrinho-conta">{cartCount}</span>}
          </button>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto gap-lg-4 text-uppercase fw-bold py-4 py-lg-0" style={{ fontSize: '11px', letterSpacing: '2px' }}>
              {LINHAS_COM_PRODUTO.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 mb-2 mb-lg-0 rounded-pill fw-bold border-0 transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-light text-muted hover:bg-white'}`}
                    style={activeCategory === cat ? { backgroundColor: 'var(--color-chalk)' } : {}}
                >
                    {cat}
                </button>
              ))}
            </Nav>
            <div className="d-flex align-items-center justify-content-center justify-content-lg-end gap-4 pb-4 pb-lg-0">
              {/* A lupa não fazia nada: era ícone de enfeite numa loja
                  sem busca. Agora leva ao catálogo, que tem. */}
              <Link href="/produtos/" prefetch={false} aria-label="Procurar produtos" className="text-muted">
                <Search size={20} />
              </Link>

              <Link href="/minha-conta/" prefetch={false} aria-label="Meus pedidos" className="text-muted">
                <User size={20} />
              </Link>
              <div className="position-relative cursor-pointer d-none d-lg-block" onClick={() => setShowCart(true)}>
                <ShoppingCart size={22} className="text-dark" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="position-absolute top-0 start-100 translate-middle"
                    >
                        <Badge pill bg="primary" style={{ backgroundColor: 'var(--color-chalk)', fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <section className="section-padding" /* O azul-claro é o fundo do círculo da logo dela, e é a primeira
           cor que a cliente vê. O gradiente antigo era um lilás
           acinzentado que não existe na marca. */
        style={{ paddingTop: '140px', background: 'linear-gradient(170deg, var(--color-ceu-veu) 0%, var(--color-surface) 60%)' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0 text-center text-lg-start">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="d-inline-block px-3 py-1 mb-4 rounded-pill" style={{ backgroundColor: 'var(--color-agua-veu)', color: 'var(--color-chalk)', fontSize: '12px', fontWeight: 800, letterSpacing: '2px' }}>
                    PERSONALIZADOS SOB ENCOMENDA & MATERIAL PEDAGÓGICO DIGITAL
                </div>
                <h1 className="display-2 fw-black mb-4" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: 'var(--color-ink)', lineHeight: 1.1 }}>
                  Detalhes que encantam, <br/>
                  <span style={{ color: 'var(--color-chalk)' }}>personalizados</span> para você.
                </h1>
                <p className="lead text-muted mb-5 pe-lg-5" style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>
                  Unimos a delicadeza da papelaria artesanal com a funcionalidade de materiais educativos adaptados para neurodiversidade.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                  <Button className="rounded-pill px-5 py-3 fw-bold border-0 shadow-lg" style={{ backgroundColor: 'var(--color-ink)' }} onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                    Ver Coleções
                  </Button>
                  <Button
                    as="a"
                    href="?conversa=1"
                    variant="outline-dark"
                    className="rounded-pill px-5 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    {/* Ia para o WhatsApp, com um número de exemplo que não
                        existe: quem clicava caía numa conversa com ninguém.
                        Agora abre a conversa da própria loja. */}
                    <MessageSquare size={18}/> Tirar uma dúvida
                  </Button>
                </div>
                
                {/* Prova social entra quando a cliente passar os números
                    reais dela do Elo7. Nada inventado aqui: número de
                    pedido falso numa loja de material inclusivo custa caro
                    se alguém confere. */}
                <div className="mt-5 pt-4 border-top border-light d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-3 small">
                    <span className="d-inline-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--color-ink)' }}>
                        <Truck size={18} /> Envio para todo o Brasil
                    </span>
                    <span className="d-inline-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--color-ink)' }}>
                        <MessageCircle size={18} /> Atendimento direto com a loja
                    </span>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                {/* A logo dela, e não foto de banco de imagem.

                    O que estava aqui era uma papelaria genérica de
                    catálogo: bonita, e de outra pessoa. A Vivian pediu a
                    troca em 21/08, e tem razão — a loja é dela e quem
                    chega precisa reconhecer a marca que já viu no
                    Instagram e no Elo7.

                    O fundo acompanha o azul-claro do próprio arquivo, para
                    a faixa não parecer recortada dentro do cartão. */}
                <div
                  className="rounded-5 overflow-hidden shadow-2xl d-flex align-items-center justify-content-center p-4 p-lg-5"
                  style={{ boxShadow: '0 50px 100px -20px rgba(0,0,0,0.15)', backgroundColor: 'var(--color-ceu)' }}
                >
                  {/* A logo nova, que ela mandou em 30/08 às 16:31.
                      Nome de arquivo novo de propósito: reaproveitando o
                      antigo, quem já visitou a loja continuaria vendo a
                      marca velha por causa do cache do navegador, e ela
                      abriria o site achando que eu não troquei. */}
                  <img
                    src={`${BASE}marca-feito-para-voce.webp`}
                    alt="Feito para você! Papelaria personalizada e atividades pedagógicas"
                    className="w-100"
                    style={{ maxWidth: '420px' }}
                  />
                </div>
                {/* O cartão ficou vazio de propósito por quatro meses, dizendo
                    "aqui entra um depoimento de verdade". Agora tem um: as 13
                    avaliações reais dela foram recuperadas da Elojinha em
                    25/08, e esta é a mais recente com uma frase inteira.

                    Sem estrela: o marketplace guardava "Positiva" ou
                    "Negativa", e não nota. Cinco estrelas onde o dado não
                    existe seria número inventado. */}
                {DEPOIMENTO && (
                  <div className="mt-4 p-4 glass rounded-4 border border-white border-opacity-50 shadow-lg animate-fade-in" style={{ maxWidth: '320px' }}>
                    <p className="small fw-bold mb-2" style={{ color: 'var(--color-ink)' }}>
                      &ldquo;{DEPOIMENTO.texto}&rdquo;
                    </p>
                    <span className="small text-muted">
                      {DEPOIMENTO.nome}, sobre {DEPOIMENTO.produto}
                    </span>
                  </div>
                )}
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>


      {/* Featured Catalog */}
      <section id="catalog" className="section-padding">
        <Container>
          {/* Os temas vêm antes dos produtos porque é assim que a cliente
              procura: ela está montando a festa do Mickey, não comprando
              uma caneca. Era o funcionamento da loja no Elo7, onde há 86
              coleções, e é o raciocínio que ela e as clientes dela já têm. */}
          <div className="temas-vitrine">
            <div className="temas-vitrine-topo">
              <h2>Escolha por tema</h2>
              <p>Tudo do mesmo tema junto, caneca, revista, álbum e lembrancinha.</p>
            </div>

            {/* Com foto, e os maiores primeiro. O que estava aqui eram 140
                caixas de texto em ordem alfabética quebrada, antes de a
                pessoa ver a primeira foto de produto: 88 dos 140 temas têm
                um produto só, e "Arca de Noé 1" vinha na frente da Peppa
                Pig, que é o campeão de vendas dela. */}
            <ul className="temas-lista">
              {(mostrarTodosOsTemas ? TEMAS_DA_VITRINE : TEMAS_DA_VITRINE.slice(0, QUANTOS_DE_CARA)).map((tema) => (
                <li key={tema.slug}>
                  <Link href={`/tema/${tema.slug}/`} prefetch={false}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tema.foto} alt="" loading="lazy" />
                    <strong>{tema.nome}</strong>
                    <span>{quantosProdutos(tema.quantos)}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {TEMAS_DA_VITRINE.length > QUANTOS_DE_CARA && (
              <button
                type="button"
                className="temas-ver-todos"
                onClick={() => setMostrarTodosOsTemas((antes) => !antes)}
              >
                {mostrarTodosOsTemas
                  ? 'Mostrar menos'
                  : `Ver os ${TEMAS_DA_VITRINE.length} temas`}
              </button>
            )}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-5 text-center text-md-start">
            <div className="mb-4 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2" style={{ color: 'var(--color-chalk)' }}>
                <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-chalk)' }}></div>
                <span className="small fw-black text-uppercase ls-widest">Todos os produtos</span>
              </div>
              <h2 className="display-4 fw-black mb-0" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>Nosso Catálogo</h2>
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {LINHAS_COM_PRODUTO.map(cat => (
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

          {/* O caminho para o catálogo inteiro. Sem ele, a seleção da home
              seria tudo o que a loja parece ter. */}
          <div className="text-center mt-5">
            <Link href="/produtos/" prefetch={false} className="ver-catalogo">
              Ver os {PUBLICADOS.length} produtos
            </Link>
          </div>
        </Container>
      </section>

      {/* Trust & Authority Section */}
      {/* Rosa véu, e não o mesmo creme do resto.
          A Vivian disse em 30/08 que o site estava "mortinho, pálido". O
          que faltava era ritmo: rolando a página, tudo tinha o mesmo
          fundo, e seção sem troca de fundo não se separa da anterior.
          O rosa é o anel de dentro da logo dela. */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-rosa-veu)' }}>
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="display-5 fw-black mb-4" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>Compra <span style={{ color: 'var(--color-chalk)' }}>segura</span></h2>
              <p className="text-muted fs-5 mb-3">
                Comprar pela internet de uma loja que você ainda não conhece pode gerar algumas
                dúvidas, e nós entendemos! Por isso, buscamos oferecer uma experiência de compra
                segura e tranquila.
              </p>
              <p className="text-muted fs-5 mb-0">
                Os pagamentos são processados pelo Mercado Pago, uma plataforma especializada em
                pagamentos online. Os dados do seu cartão são tratados diretamente pela
                plataforma, e a Feito para Você Papelaria Personalizada não tem acesso nem
                armazena os dados completos do seu cartão.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {/* "Pagamento seguro" saiu a pedido dela em 30/08: a abertura
                da seção passou a dizer a mesma coisa, com mais detalhe, e
                repetir enfraquece as duas. Os dois cartões que sobraram
                ocupam metade cada, senão fica um buraco à direita. */}
            <Col md={6}>
              <div className="p-5 bg-white rounded-5 shadow-sm h-100 border border-light transition-all hover-lift">
                <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-4 mb-4"><MessageCircle size={32} color="var(--color-chalk)" /></div>
                <h4 className="fw-black fs-5 mb-3">Atendimento de verdade</h4>
                <p className="small text-muted mb-0">
                  Aqui, você fala diretamente com a nossa equipe, sem respostas automáticas ou
                  robôs. Estamos à disposição para esclarecer suas dúvidas, orientar sua escolha
                  e ajudar no que for necessário antes e depois da sua compra.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-5 bg-white rounded-5 shadow-sm h-100 border border-light transition-all hover-lift">
                <div className="bg-warning bg-opacity-10 d-inline-flex p-3 rounded-4 mb-4"><CheckCircle size={32} color="var(--color-heart)" /></div>
                <h4 className="fw-black fs-5 mb-3">Antes de finalizar sua compra</h4>
                {/* O texto que ela mandou tem seis parágrafos e não cabe num
                    cartão. Aqui fica o primeiro, palavra por palavra, e o
                    resto na página de políticas: cortar seria eu reescrever
                    o que ela decidiu dizer. */}
                <p className="small text-muted mb-3">
                  Para garantir que seu pedido seja produzido exatamente como você deseja,
                  pedimos que todas as dúvidas sejam esclarecidas antes da finalização da
                  compra.
                </p>
                {/* Tinta, e não coral: coral em texto pequeno sobre branco não
                    alcança contraste, e o teste de acessibilidade pegou. A
                    regra está escrita nos tokens e eu furei na linha
                    seguinte. */}
                <Link href="/politicas/" className="small fw-bold" style={{ color: 'var(--color-ink)' }}>
                  Ler antes de comprar
                </Link>
              </div>
            </Col>
          </Row>
          {/* Eram três imagens puxadas da Wikipédia e de um site de logos.
              Uma delas já não carregava, e as outras duas dependem de
              servidores de terceiros que não devem nada a esta loja: no
              dia em que saírem do ar, some o selo que diz à cliente que o
              pagamento é confiável, justo na seção sobre confiança.

              Escrito, não some, e diz a mesma coisa. */}
          <ul className="selos-de-confianca">
            <li>Pagamento pelo <strong>Mercado Pago</strong></li>
            <li><strong>Pix</strong> e cartão</li>
            <li>Envio pelos <strong>Correios</strong> e Jadlog</li>
          </ul>
        </Container>
      </section>

      {/* As 13 avaliações reais, recuperadas da Elojinha em 25/08. Ficam
          depois do catálogo e antes do rodapé: quem rolou até aqui já viu
          o que ela vende, e a pergunta que sobra é se chega e se chega
          bom. Quem responde isso é quem já comprou. */}
      <Avaliacoes />

      {/* Modals & Cart */}
      <CartModal 
        show={showCart} 
        onHide={() => setShowCart(false)} 
        cart={cart}
        removeFromCart={removeFromCart}
        onChangeQuantity={alterarQuantidade}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onCheckout={() => { setShowCart(false); window.location.assign(`${BASE}checkout/`); }}
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
            backgroundColor: aviso?.tipo === 'bloqueio' ? 'var(--color-marker)' : 'var(--color-ink)',
            maxWidth: '460px',
          }}
        >
          <Toast.Body
            className="py-3 px-4 d-flex align-items-center gap-3 fw-bold"
            style={{ color: aviso?.tipo === 'bloqueio' ? 'var(--color-ink)' : '#FFFFFF' }}
          >
            {aviso?.tipo === 'bloqueio'
              ? <Package size={20} style={{ flexShrink: 0 }} />
              : <Check size={18} style={{ flexShrink: 0 }} />}
            <span>{aviso?.texto}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <RodapeConfianca />
    </div>
  );
};

export default LandingPage;
