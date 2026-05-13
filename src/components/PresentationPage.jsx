import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pTheme } from '../styles/presentationTheme';

// Seções modulares
import HeroSection from './presentation/HeroSection';
import ExperienceSection from './presentation/ExperienceSection';
import AuthorityBridge from './presentation/AuthorityBridge';
import InstagramStrategy from './presentation/InstagramStrategy';
import ComparisonSection from './presentation/ComparisonSection';
import LogisticsAutomation from './presentation/LogisticsAutomation';
import PricingSection from './presentation/PricingSection';
import FAQSection from './presentation/FAQSection';
import FinalFooter from './presentation/FinalFooter';

const navLinks = [
  { id: 'inicio', label: 'Início' },
  { id: 'experiencia', label: 'A Visão' },
  { id: 'confianca', label: 'Confiança' },
  { id: 'instagram', label: 'Marketing' },
  { id: 'comparacao', label: 'Comparação' },
  { id: 'logistica', label: 'Logística' },
  { id: 'investimento', label: 'Planos' },
  { id: 'faq', label: 'FAQ' },
];

const { colors, fonts } = pTheme;

const PresentationPage = () => {
  const [activeNav, setActiveNav] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      const sections = navLinks
        .map(l => document.getElementById(l.id))
        .filter(Boolean);
      let current = 'inicio';
      sections.forEach(s => {
        if (s.offsetTop <= scrollY) current = s.id;
      });
      setActiveNav(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.primary,
      minHeight: '100vh',
      fontFamily: fonts.body,
      overflowX: 'hidden',
      backgroundImage: `
        radial-gradient(circle at 20% 0%,  rgba(155,137,179,0.12), transparent 50%),
        radial-gradient(circle at 80% 60%, rgba(184,226,212,0.06), transparent 40%)
      `,
      backgroundAttachment: 'fixed',
    }}>

      {/* ── Navbar flutuante pill ── */}
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        backgroundColor: 'rgba(13,10,20,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '10px 28px',
        borderRadius: '50px',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        gap: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}>
        {navLinks.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            style={{
              textDecoration: 'none',
              color: activeNav === link.id ? colors.lavender : 'rgba(255,255,255,0.55)',
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              transition: 'all 0.3s ease',
              borderBottom: activeNav === link.id ? `2px solid ${colors.lavender}` : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* ── Hero ── */}
      <div id="inicio">
        <HeroSection />
      </div>

      {/* ── Seções ── */}
      <div id="experiencia">
        <ExperienceSection />
      </div>

      <div id="confianca">
        <AuthorityBridge />
      </div>

      <div id="instagram" style={{ backgroundColor: '#FAF9F6', padding: '40px 0' }}>
        <InstagramStrategy />
      </div>

      <div id="comparacao" style={{ backgroundColor: '#FFFFFF', padding: '40px 0' }}>
        <ComparisonSection />
      </div>

      <div id="logistica" style={{ backgroundColor: '#FAF9F6', padding: '40px 0' }}>
        <LogisticsAutomation />
      </div>

      <div id="investimento" style={{ backgroundColor: '#FFFFFF', padding: '40px 0' }}>
        <PricingSection />
      </div>

      <div id="faq" style={{ backgroundColor: '#FAF9F6', padding: '40px 0' }}>
        <FAQSection />
      </div>

      <FinalFooter />
    </div>
  );
};

export default PresentationPage;
