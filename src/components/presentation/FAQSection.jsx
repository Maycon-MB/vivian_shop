import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const faqs = [
  {
    q: "E se meus clientes não confiarem em comprar fora do Elo7?",
    a: "Eu crio sua loja integrada a sistemas de pagamento que o seu cliente já confia, como Mercado Pago. Além disso, o visual profissional e o sistema de chat interno passam muito mais segurança do que uma página genérica de marketplace."
  },
  {
    q: "Como vou gerar as etiquetas de envio sem o Elo7?",
    a: "O painel administrativo que eu configuro permite gerar as etiquetas de frete (Correios/Jadlog etc.) e a declaração de conteúdo com poucos cliques, tudo integrado, sem dor de cabeça."
  },
  {
    q: "Vou conseguir juntar as duas lojas (Feito para Você e Projeto Educar)?",
    a: "Sim! Eu crio categorias bem definidas no menu principal do site, separando 'Feito para Você' e 'Projeto Educar', mantendo tudo organizado em um único endereço web."
  },
  {
    q: "É muito difícil gerenciar o site?",
    a: "De forma alguma. O painel é feito para ser simples. Você receberá um treinamento em vídeo gravado por mim de como adicionar produtos, editar preços e despachar pedidos. Se precisar de algo complexo, eu mesmo estarei à disposição."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section style={{ padding: 'clamp(60px, 10vw, 100px) 20px', backgroundColor: colors.white }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: colors.primary,
            marginBottom: '24px',
          }}>
            Perguntas Frequentes
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: colors.textMuted,
            lineHeight: '1.6'
          }}>
            Respostas claras para as principais dúvidas sobre a transição.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              style={{
                backgroundColor: colors.bg,
                border: '2px solid #2E9B96',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: pTheme.shadows.card
              }}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(16px, 3vw, 24px)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: colors.textDark,
                  fontFamily: fonts.heading,
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  fontWeight: '600'
                }}
              >
                {faq.q}
                <motion.div
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} color={colors.lavender} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{
                      padding: '0 24px 24px 24px',
                      color: colors.textMuted,
                      lineHeight: '1.7',
                      fontSize: '1rem'
                    }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
