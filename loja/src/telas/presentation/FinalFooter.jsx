import React from 'react';
import { pTheme } from '../../estilos-proposta';

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
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Projeto Autônomo. Desenvolvido para marcas independentes.
        </div>
      </div>
    </footer>
  );
};

export default FinalFooter;
