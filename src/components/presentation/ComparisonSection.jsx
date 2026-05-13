import React from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { XCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const ComparisonSection = () => {
  return (
    <section style={{ padding: '160px 20px', backgroundColor: colors.bg }}>
      <Container>
        <div className="text-center mb-5">
          <h2 style={{ fontFamily: fonts.heading, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: colors.primary }}>
            Por que sair da <span style={{ color: colors.cta }}>Dependência?</span>
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Veja a diferença entre ser apenas um inquilino em um marketplace e ser dono do seu próprio terreno.
          </p>
        </div>

        <Row className="g-4">
          <Col md={6}>
            <Card style={{ 
              borderRadius: '32px', 
              border: '2px solid #9B89B3', 
              padding: '40px',
              backgroundColor: colors.white,
              boxShadow: pTheme.shadows.card,
              height: '100%'
            }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <XCircle color={colors.cta} size={32} />
                <h3 className="h4 fw-bold mb-0">Vendendo no Marketplace</h3>
              </div>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li className="d-flex align-items-start gap-3">
                  <TrendingDown size={20} color={colors.cta} className="mt-1" />
                  <span><strong>Taxas Abusivas:</strong> Você paga entre 12% a 18% de cada venda que faz.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingDown size={20} color={colors.cta} className="mt-1" />
                  <span><strong>Sem Marca Própria:</strong> O cliente diz "comprei no Elo7", ele nem lembra o seu nome.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingDown size={20} color={colors.cta} className="mt-1" />
                  <span><strong>Anúncios Rivais:</strong> No pé da sua página, aparecem produtos de concorrentes mais baratos.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingDown size={20} color={colors.cta} className="mt-1" />
                  <span><strong>Barreiras no Contato:</strong> Você é proibida de passar seu WhatsApp ou falar direto com o cliente.</span>
                </li>
              </ul>
            </Card>
          </Col>

          <Col md={6}>
            <Card style={{ 
              borderRadius: '32px', 
              border: '2px solid #9B89B3', 
              padding: '40px',
              backgroundColor: colors.white,
              boxShadow: pTheme.shadows.card,
              height: '100%'
            }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <CheckCircle2 color={colors.mint} size={32} />
                <h3 className="h4 fw-bold mb-0">Seu Projeto Autônomo</h3>
              </div>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li className="d-flex align-items-start gap-3">
                  <TrendingUp size={20} color={colors.mint} className="mt-1" />
                  <span><strong>Lucro 100% Seu:</strong> Você paga apenas a mensalidade fixa, sem tirar pedaço das suas vendas.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingUp size={20} color={colors.mint} className="mt-1" />
                  <span><strong>Autoridade Máxima:</strong> O site é seu, as cores são suas e a marca Vivian é o centro de tudo.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingUp size={20} color={colors.mint} className="mt-1" />
                  <span><strong>Fidelização Real:</strong> Você tem os dados do cliente para fazer novas vendas pelo WhatsApp.</span>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <TrendingUp size={20} color={colors.mint} className="mt-1" />
                  <span><strong>Liberdade Logística:</strong> Gere suas próprias etiquetas e declarações sem burocracia externa.</span>
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ComparisonSection;
