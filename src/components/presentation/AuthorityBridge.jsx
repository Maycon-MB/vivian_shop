import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Search, HeartHandshake } from 'lucide-react';
import { pTheme } from '../../styles/presentationTheme';

const { colors, fonts } = pTheme;

const AuthorityBridge = () => {
  return (
    <section style={{
      padding: 'clamp(60px, 10vw, 160px) 20px',
      backgroundColor: colors.white, // Bloco branco para separar visualmente do BG Off-white
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 6vw, 80px)' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: colors.primary,
            marginBottom: '24px',
          }}>
            O Medo do "Site Próprio Não Passar Confiança"
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: colors.textMuted,
            lineHeight: '1.7'
          }}>
            Muitos lojistas temem sair de plataformas como o Elo7 e perder a confiança do cliente final. Minha estratégia contorna essa objeção construindo uma autoridade blindada para a sua marca.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px'
        }}>
          {/* Pilar 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{ padding: 'clamp(24px, 4vw, 32px)', backgroundColor: colors.bg, borderRadius: '32px', border: '2px solid #2E9B96', boxShadow: pTheme.shadows.card }}
          >
            <Lock size={32} color={colors.lavender} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.4rem', color: colors.textDark, marginBottom: '12px' }}>
              Checkouts de Renome
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6' }}>
              Ao usar provedores de pagamento confiáveis (Mercado Pago, Stripe), o cliente insere os dados em um ambiente seguro e que ele já conhece, derrubando o medo de fraudes.
            </p>
          </motion.div>

          {/* Pilar 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{ padding: 'clamp(24px, 4vw, 32px)', backgroundColor: colors.bg, borderRadius: '32px', border: '2px solid #2E9B96', boxShadow: pTheme.shadows.card }}
          >
            <HeartHandshake size={32} color={colors.gold} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.4rem', color: colors.textDark, marginBottom: '12px' }}>
              Atendimento Dedicado
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6' }}>
              Um canal de mensagens profissional integrado a cada produto. O cliente sente que está em uma boutique de alto nível onde o atendimento é personalizado e seguro, direto por lá.
            </p>
          </motion.div>

          {/* Pilar 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{ padding: 'clamp(24px, 4vw, 32px)', backgroundColor: colors.bg, borderRadius: '32px', border: '2px solid #2E9B96', boxShadow: pTheme.shadows.card }}
          >
            <ShieldCheck size={32} color={colors.mint} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.4rem', color: colors.textDark, marginBottom: '12px' }}>
              Identidade Profissional
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6' }}>
              O design premium, responsivo e sem propagandas da concorrência gera percepção instantânea de valor. Uma marca bonita e estruturada é naturalmente vista como segura.
            </p>
          </motion.div>

          {/* Pilar 4 */}
          <motion.div
            whileHover={{ y: -5 }}
            style={{ padding: 'clamp(24px, 4vw, 32px)', backgroundColor: colors.bg, borderRadius: '32px', border: '2px solid #2E9B96', boxShadow: pTheme.shadows.card }}
          >
            <Search size={32} color={colors.primary} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.4rem', color: colors.textDark, marginBottom: '12px' }}>
              Presença no Google
            </h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6' }}>
              Configuramos as ferramentas para indexação no Google. Aparecer nas buscas (SEO) consolida a empresa como uma autoridade estabelecida no segmento de atividades e papelaria.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AuthorityBridge;
