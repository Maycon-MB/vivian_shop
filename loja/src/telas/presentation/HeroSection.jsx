'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { pTheme } from '../../estilos-proposta';

const { colors, fonts } = pTheme;

const HeroSection = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(80px, 15vw, 160px) 20px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.lavenderLight,
            border: `1px solid ${colors.border}`,
            color: colors.primary,
            padding: '8px 20px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '32px'
          }}>
            <Sparkles size={14} color={colors.gold} />
            Projeto Autônomo
          </div>

          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            color: colors.primary,
            lineHeight: '1.1',
            marginBottom: '32px',
            fontWeight: '600',
          }}>
            Autonomia Total Para o Seu <span style={{ color: colors.lavender, fontStyle: 'italic' }}>Negócio</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: colors.textMuted,
            lineHeight: '1.7',
            marginBottom: '50px',
            maxWidth: '700px',
            margin: '0 auto 50px',
            fontWeight: '300'
          }}>
            Vou unificar suas lojas Feito para Você e Projeto Educar em um site exclusivo, livre das taxas do Elo7. Eu cuido da tecnologia para você vender com autonomia e aparência profissional.
          </p>


        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
