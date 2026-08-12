// src/styles/presentationTheme.js
// Tokens de design para a apresentação — Estética Boutique Premium (Clara)

export const pTheme = {
  colors: {
    bg:        '#FBFAF7',          // Off-white / Pearl background
    primary:   '#12305B',          // Roxo escuro para texto principal
    lavender:  '#2E9B96',          // Acento suave
    lavenderLight: 'rgba(46,155,150,0.1)',
    gold:      '#C4436B',          // Dourado para detalhes premium
    mint:      '#FFD400',
    white:     '#FFFFFF',
    glass:     'rgba(255,255,255,0.85)',
    border:    '#2E9B9633',        // Borda Lilás Suave (20% opacidade)
    borderStrong: '#2E9B9666',  // Borda Lilás mais forte
    textMuted: '#5A5266',
    textDark:  '#1A1523',
    cta:       '#E86A7A',          // Coral Rose Vibrante (Alta conversão)
    ctaHover:  '#D65A6A',
  },
  fonts: {
    heading: "'Fraunces', Georgia, serif",
    body:    "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif",
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
    card:     '0 15px 35px rgba(46,155,150,0.18)', // Opacidade aumentada
    elevated: '0 30px 60px rgba(46,155,150,0.25)', // Opacidade aumentada
    lavender: '0 10px 20px rgba(46,155,150,0.2)',
  },
};
