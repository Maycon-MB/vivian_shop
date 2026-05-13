// src/styles/presentationTheme.js
// Tokens de design para a apresentação — Estética Boutique Premium (Clara)

export const pTheme = {
  colors: {
    bg:        '#FAF9F6',          // Off-white / Pearl background
    primary:   '#2D2438',          // Roxo escuro para texto principal
    lavender:  '#9B89B3',          // Acento suave
    lavenderLight: 'rgba(155,137,179,0.1)',
    gold:      '#D4880A',          // Dourado para detalhes premium
    mint:      '#B8E2D4',
    white:     '#FFFFFF',
    glass:     'rgba(255,255,255,0.85)',
    border:    '#9B89B333',        // Borda Lilás Suave (20% opacidade)
    borderStrong: '#9B89B366',  // Borda Lilás mais forte
    textMuted: '#5A5266',
    textDark:  '#1A1523',
    cta:       '#E86A7A',          // Coral Rose Vibrante (Alta conversão)
    ctaHover:  '#D65A6A',
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body:    "'Inter', sans-serif",
  },
  radii: {
    sm:   '12px',
    md:   '16px',
    lg:   '24px',
    xl:   '32px',
    pill: '50px',
    card: '32px',
  },
  shadows: {
    card:     '0 15px 35px rgba(155,137,179,0.18)', // Opacidade aumentada
    elevated: '0 30px 60px rgba(155,137,179,0.25)', // Opacidade aumentada
    lavender: '0 10px 20px rgba(155,137,179,0.2)',
  },
};
