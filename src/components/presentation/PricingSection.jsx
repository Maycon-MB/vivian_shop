import React from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Package, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import LocalInfoIcon from './LocalInfoIcon';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const plans = [
  {
    name: 'Boutique Start',
    price: '1.000',
    pix: '12x de R$ 99,90',
    maint: '59,90',
    desc: 'O essencial para sair do Elo7 hoje, com site próprio e gestão de envios.',
    features: [
      { text: 'Site Próprio (2 Lojas em 1)', info: 'Sua marca unificada. Mais profissionalismo que uma página de marketplace.' },
      { text: 'Etiquetas e Declarações', info: 'Gere os documentos de envio sem precisar preencher nada à mão.' },
      { text: 'Chat Interno com Cliente', info: 'O cliente tira dúvidas e negocia com você diretamente no painel do seu site.' },
      { text: 'Economia Imediata', info: 'A mensalidade fixa é menor que a comissão de uma única venda grande no Elo7.' }
    ]
  },
  {
    name: 'Loja Autônoma',
    price: '2.800',
    pix: '12x de R$ 279',
    maint: '99,90',
    desc: 'Para quem quer ganhar tempo e profissionalizar a vitrine no Instagram.',
    features: [
      { text: 'Tudo do plano Start', info: 'Todas as vantagens da loja básica incluídas.' },
      { text: 'Etiquetas em 1 Clique', info: 'Economize horas por semana na preparação dos pacotes para envio.' },
      { text: 'Instagram Shopping', info: 'Transforme seu perfil numa vitrine onde o cliente clica e já vai para o checkout.' },
      { text: 'Design Sob Medida', info: 'Identidade visual de luxo que permite cobrar mais caro pelos seus produtos.' }
    ]
  },
  {
    name: 'Projeto Autônomo',
    price: '4.800',
    pix: '12x de R$ 479',
    maint: '149,90',
    desc: 'A solução definitiva para total liberdade e crescimento acelerado.',
    features: [
      { text: 'Tudo da Loja Autônoma', info: 'Todas as facilidades do plano anterior incluídas.' },
      { text: 'Gestão Inteligente', info: 'Controle total das suas duas marcas em um só lugar, de forma simples.' },
      { text: 'Autoatendimento com IA', info: 'Uma inteligência que responde dúvidas básicas 24h por dia no seu chat (Opcional).' },
      { text: 'Consultoria e Treinamento', info: 'Eu te ensino a usar as ferramentas para que a tecnologia trabalhe para você.' }
    ],
    recommended: true
  }
];

const PricingSection = () => {
  return (
    <section id="planos" style={{ padding: 'clamp(60px, 10vw, 120px) 0', backgroundColor: colors.bg }}>
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3" style={{ color: colors.primary, fontFamily: fonts.heading, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Investimento <span style={{ color: colors.cta }}>Estratégico</span>
          </h2>
          <p className="lead mx-auto" style={{ color: colors.textMuted, maxWidth: '700px', fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            Construa seu patrimônio digital. Escolha o escopo ideal para decolar a sua marca e se livrar das taxas abusivas.
          </p>
        </div>

        <Row className="g-4 justify-content-center">
          {plans.map((plan, index) => (
            <Col lg={4} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-100"
              >
                <Card 
                  className="h-100 transition-all"
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: '32px',
                    boxShadow: pTheme.shadows.card,
                    border: '2px solid #2E9B96',
                    transform: 'translateY(0)',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = pTheme.shadows.elevated;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = pTheme.shadows.card;
                  }}
                >
                  <Card.Body className="p-4 p-md-5 d-flex flex-column position-relative">
                    
                    <div className="text-center mb-4 mt-3">
                      <h3 className="h5 fw-bold text-uppercase mb-3" style={{ color: colors.primary, letterSpacing: '1px' }}>
                        {plan.name}
                      </h3>
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                        <span className="fs-4 fw-bold" style={{ color: colors.primary }}>R$</span>
                        <span className="display-4 fw-black" style={{ color: colors.primary, letterSpacing: '-2px', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
                          {plan.price}
                        </span>
                      </div>
                      <div className="text-success fw-bold mb-2">
                        ou {plan.pix} no Pix parcelado
                      </div>
                      <p className="small mb-0" style={{ color: colors.textMuted }}>
                        + R$ {plan.maint}/mês (Hospedagem e Manutenção)
                      </p>
                    </div>

                    <div className="mb-4 text-center px-2">
                      <p className="mb-0" style={{ color: colors.textDark, fontSize: '0.95rem' }}>
                        {plan.desc}
                      </p>
                    </div>

                    <ul className="list-unstyled mb-0 flex-grow-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="mb-3 d-flex align-items-center">
                          <CheckCircle2 size={20} style={{ color: colors.cta }} className="me-3 flex-shrink-0" />
                          <span className="fw-semibold" style={{ color: colors.textDark }}>
                            {feature.text}
                          </span>
                          <LocalInfoIcon text={feature.info} />
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <div className="mt-5 text-center">
          <p className="text-muted small mb-0 d-flex align-items-center justify-content-center gap-2">
            <ShieldCheck size={16} /> Todos os planos incluem treinamento e suporte para transição segura do Elo7.
          </p>
        </div>
      </Container>
    </section>
  );
};

export default PricingSection;
