'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Box, CheckCircle } from 'lucide-react';
import { pTheme } from '../../estilos-proposta';

const { colors, fonts } = pTheme;

const LogisticsAutomation = () => {
  return (
    <section style={{ padding: 'clamp(60px, 10vw, 160px) 20px', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 6vw, 80px)' }}>
        
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
            <Box size={16} /> Gestão Simplificada
          </div>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: colors.primary,
            marginBottom: '24px',
          }}>
            Logística Sem Elo7
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: colors.textMuted,
            lineHeight: '1.6'
          }}>
            Eu acredito que o seu tempo deve ser gasto criando produtos incríveis, não preenchendo papéis nos Correios.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{
              backgroundColor: colors.white,
              padding: 'clamp(24px, 4vw, 40px)',
              borderRadius: '32px',
              border: '2px solid #2E9B96',
              boxShadow: pTheme.shadows.card,
            }}
          >
            <Printer size={40} color={colors.lavender} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.5rem', color: colors.textDark, marginBottom: '16px' }}>
              Impressão em 1 Clique
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6', marginBottom: '24px' }}>
              O sistema gera automaticamente a etiqueta de postagem (Correios, Jadlog, etc) com os dados preenchidos pelo cliente no momento da compra.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: colors.textMuted, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={colors.mint} /> Adeus preenchimento manual
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={colors.mint} /> Formato padrão Correios
              </li>
            </ul>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{
              backgroundColor: colors.white,
              padding: 'clamp(24px, 4vw, 40px)',
              borderRadius: '32px',
              border: '2px solid #2E9B96',
              boxShadow: pTheme.shadows.card,
            }}
          >
            <Box size={40} color={colors.gold} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.5rem', color: colors.textDark, marginBottom: '16px' }}>
              Declaração de Conteúdo
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6', marginBottom: '24px' }}>
              A declaração de conteúdo obrigatória é gerada na mesma página que a etiqueta, já listando os itens (Papelaria ou Atividades) exatos do pedido.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: colors.textMuted, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={colors.mint} /> Cumpre regras fiscais
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={colors.mint} /> Menos risco de devolução
              </li>
            </ul>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default LogisticsAutomation;
