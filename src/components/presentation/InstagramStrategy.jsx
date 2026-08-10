import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Send, Bot, Sparkles, ChevronRight } from 'lucide-react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const InstagramStrategy = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: "Tráfego Automático", icon: <Send size={20} /> },
    { title: "Atendimento por IA", icon: <Bot size={20} /> },
    { title: "Funil de Vendas", icon: <Sparkles size={20} /> }
  ];

  return (
    <section style={{ padding: 'clamp(60px, 10vw, 160px) 20px', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.lavenderLight,
            color: colors.primary,
            padding: '8px 20px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '24px'
          }}>
            <Instagram size={16} /> Marketing Moderno
          </div>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: colors.primary,
            marginBottom: '24px',
          }}>
            O Instagram como Motor de Vendas
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: colors.textMuted,
            lineHeight: '1.6'
          }}>
            Não dependa apenas do tráfego orgânico. Eu transformo o seu Instagram numa máquina de levar visitantes qualificados para a sua loja própria, todos os dias.
          </p>
        </div>

        <div className="d-flex flex-column flex-lg-row gap-4 gap-lg-5 align-items-start">
          {/* Menu Lateral */}
          <div className="w-100" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  backgroundColor: activeTab === idx ? colors.primary : colors.white,
                  color: activeTab === idx ? colors.white : colors.textMuted,
                  border: `1px solid ${activeTab === idx ? colors.primary : colors.border}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  boxShadow: activeTab === idx ? pTheme.shadows.card : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: activeTab === idx ? colors.lavender : colors.primary }}>
                    {tab.icon}
                  </span>
                  <span style={{ fontFamily: fonts.heading, fontSize: '1.2rem', fontWeight: '600' }}>
                    {tab.title}
                  </span>
                </div>
                <ChevronRight size={20} opacity={activeTab === idx ? 1 : 0.3} />
              </button>
            ))}
          </div>

          {/* Conteúdo Dinâmico */}
          <div className="w-100" style={{
            backgroundColor: colors.white,
            borderRadius: '32px',
            padding: 'clamp(24px, 5vw, 60px) clamp(20px, 4vw, 40px)',
            minHeight: '400px',
            border: '2px solid #2E9B96',
            boxShadow: pTheme.shadows.card,
            display: 'flex',
            alignItems: 'center'
          }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontFamily: fonts.heading, fontSize: '2rem', color: colors.primary, marginBottom: '20px' }}>
                    Automação de Respostas e Engajamento
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '24px' }}>
                    Cada vez que alguém comentar "Eu quero" num Reel ou Post seu, nosso sistema enviará o link da sua loja nova diretamente no Direct da pessoa, de forma instantânea.
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '1.1rem', lineHeight: '1.7' }}>
                    Isso aumenta drasticamente a taxa de cliques para o seu site, sem você precisar responder dezenas de comentários manualmente.
                  </p>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div
                  key="1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontFamily: fonts.heading, fontSize: '2rem', color: colors.primary, marginBottom: '20px' }}>
                    Autoatendimento com IA (Opcional)
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '24px' }}>
                    Eu posso configurar uma inteligência artificial que conversa como você, treinada especificamente nos seus produtos de papelaria e atividades adaptadas.
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '1.1rem', lineHeight: '1.7' }}>
                    Ela tira dúvidas sobre frete, materiais e prazos 24 horas por dia, liberando você para focar apenas na produção e no atendimento de grandes encomendas.
                  </p>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div
                  key="2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontFamily: fonts.heading, fontSize: '2rem', color: colors.primary, marginBottom: '20px' }}>
                    O Ciclo de Venda Perfeito
                  </h3>
                  <ul style={{ color: colors.textMuted, fontSize: '1.1rem', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                      <span style={{ color: colors.lavender }}>1.</span> O cliente descobre seu produto no Instagram.
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                      <span style={{ color: colors.lavender }}>2.</span> Comenta e recebe o link automático.
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                      <span style={{ color: colors.lavender }}>3.</span> Acessa sua loja profissional e sente segurança.
                    </li>
                    <li style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ color: colors.lavender }}>4.</span> Compra, e o lucro vem integral para você, sem taxas do Elo7.
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InstagramStrategy;
