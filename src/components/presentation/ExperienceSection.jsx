import React from 'react';
import { motion } from 'framer-motion';
import { Store, Truck, MessageSquare, ShieldCheck } from 'lucide-react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const benefits = [
  {
    icon: <Store size={32} color={colors.lavender} />,
    title: 'Lojas Unificadas',
    desc: 'Suas duas lojas (Papelaria e Atividades Adaptadas) em um único ambiente, fortalecendo sua marca de forma profissional e coesa.'
  },
  {
    icon: <MessageSquare size={32} color={colors.gold} />,
    title: 'Mensagens Integradas',
    desc: 'O cliente tira dúvidas e negocia diretamente no seu site através de um chat exclusivo, sem precisar sair da página ou usar aplicativos externos.'
  },
  {
    icon: <Truck size={32} color={colors.mint} />,
    title: 'Logística Facilitada',
    desc: 'Gere etiquetas de envio e declarações de conteúdo diretamente pelo painel administrativo, poupando horas de trabalho.'
  },
  {
    icon: <ShieldCheck size={32} color={colors.primary} />,
    title: 'Zero Taxas Ocultas',
    desc: 'Livre-se das comissões abusivas de marketplaces. Todo o lucro das vendas vai diretamente para a sua conta.'
  }
];

const ExperienceSection = () => {
  return (
    <section style={{ padding: 'clamp(60px, 10vw, 160px) 20px', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: colors.primary,
            marginBottom: '24px',
          }}>
            A Visão do Novo Negócio
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: colors.textMuted,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Uma vitrine premium que agrupa todos os seus produtos e resolve a parte burocrática, garantindo liberdade total.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {benefits.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              style={{
                backgroundColor: colors.white,
                borderRadius: '32px',
                padding: 'clamp(24px, 4vw, 40px) 30px',
                border: '2px solid #9B89B3',
                boxShadow: pTheme.shadows.card,
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: `1px solid ${colors.border}`,
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily: fonts.heading,
                fontSize: '1.5rem',
                color: colors.textDark,
                marginBottom: '16px'
              }}>
                {item.title}
              </h3>
              <p style={{
                color: colors.textMuted,
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ExperienceSection;
