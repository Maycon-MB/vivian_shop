import React from 'react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const FinalFooter = () => {
  return (
    <footer style={{
      backgroundColor: colors.primary, // Rodapé mantido escuro para dar peso no final
      color: colors.white,
      padding: '80px 20px',
      textAlign: 'center',
      borderTop: `1px solid ${colors.border}`
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: fonts.heading,
          fontSize: '2rem',
          marginBottom: '20px',
          color: colors.white
        }}>
          Pronta para dar o próximo passo?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          Sua marca de papelaria e atividades merece um espaço próprio, profissional e livre de taxas abusivas. Vamos construir isso juntas.
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <button style={{
            backgroundColor: colors.cta,
            color: colors.white,
            border: 'none',
            padding: '18px 48px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(232,106,122,0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.ctaHover;
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.cta;
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={() => alert('Sistema de Chat Iniciado. Maycon responderá em instantes.')}
          >
            Tirar Dúvida via Chat Online
          </button>
        </div>

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Projeto Autônomo. Desenvolvido para marcas independentes.
        </div>
      </div>
    </footer>
  );
};

export default FinalFooter;
