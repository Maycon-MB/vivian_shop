'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { WhatsApp } from './icones-marca';

/**
 * Botão flutuante de WhatsApp.
 *
 * A maior parte das dúvidas antes da compra ("cabe o nome da minha filha?",
 * "chega antes do dia 20?") não se resolve lendo página nenhuma: resolve
 * conversando. Esse botão existe para essa conversa estar sempre a um toque
 * de distância, em qualquer tela da loja.
 *
 * Duas decisões que valem o comentário:
 *
 * 1) Ele sobe. A barra de navegação fixa do rodapé ocupa a faixa de baixo
 *    (cerca de 70px). Se o botão ficasse colado no canto, no celular ele
 *    encostaria nela e o dedo acertaria a coisa errada. Por isso ele fica
 *    a ~96px do fim da tela — respirando acima da barra, no canto direito.
 *
 * 2) No celular ele vira só o ícone. Tela de celular é pequena e o texto
 *    "Falar no WhatsApp" cobriria produto. No computador sobra espaço, e
 *    aí o texto entra, porque um círculo verde sozinho nem todo mundo sabe
 *    o que é.
 *
 * As cores e o posicionamento estão em estilo inline de propósito: este
 * componente não deve depender de nenhum arquivo CSS que possa mudar por
 * baixo dele. As poucas regras que estilo inline não alcança (media query
 * e prefers-reduced-motion) vão numa tag <style> própria, com nomes de
 * classe prefixados para não colidir com nada.
 */

// PENDENTE-LANCAMENTO: número de exemplo. Trocar pelo da Vivian.
const NUMERO = '5521900000000';
const MENSAGEM = 'Oi! Vi a sua loja e queria tirar uma dúvida sobre um produto.';
const LINK = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAGEM)}`;

const cores = {
  aguaLinhaPersonalizada: '#1F736F', // versão escura: com texto branco, o #1F736F dá 3.36:1
  azulTinta: '#12305B',
  papel: '#FBFAF7',
  borda: '#DCE9F6',
};

// Regras que só existem em CSS: quebra por largura de tela e respeito a
// quem pediu menos movimento no sistema.
const cssDoBotao = `
.bt-whats {
  position: fixed;
  right: 16px;
  bottom: 24px; /* a barra de navegação saiu do rodapé no celular */
  z-index: 1040;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  min-width: 48px;
  padding: 0 14px;
  border-radius: 999px;
  background: #1F736F;
  color: #FBFAF7;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1;
  border: 1px solid #DCE9F6;
  box-shadow: 0 6px 20px rgba(18, 48, 91, 0.18);
  animation: bt-whats-entrada 240ms ease-out both;
}

.bt-whats:hover,
.bt-whats:focus-visible {
  color: #FBFAF7;
  filter: brightness(1.06);
}

.bt-whats:focus-visible {
  outline: 3px solid #12305B;
  outline-offset: 2px;
}

/* Rótulo some no celular: fica só o ícone, para não roubar tela. */
.bt-whats-rotulo { display: none; }

@media (min-width: 768px) {
  .bt-whats { right: 24px; bottom: 24px; padding: 0 18px; }
  .bt-whats-rotulo { display: inline; }
}

@keyframes bt-whats-entrada {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

/* Quem pediu menos movimento no sistema não recebe animação de entrada. */
@media (prefers-reduced-motion: reduce) {
  .bt-whats { animation: none; }
}
`;

/* Telas onde falar com a Vivian não é a saída. Na de perguntas, quem lê é
   a própria Vivian: um botão convidando ela a se chamar no WhatsApp é
   confuso, e ainda cobre o campo de resposta no celular. */
const SEM_BOTAO = ['/perguntas', '/painel'];

const BotaoWhatsApp = () => {
  const caminho = usePathname();

  if (SEM_BOTAO.some((tela) => caminho?.startsWith(tela))) return null;

  return (
  <>
    <style>{cssDoBotao}</style>

    <a
      className="bt-whats"
      href={LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      style={{
        // Repetidos aqui de propósito: se por qualquer motivo o <style>
        // acima não for aplicado, o botão ainda aparece no lugar certo,
        // com a cor certa e no tamanho de toque certo.
        position: 'fixed',
        right: 16,
        bottom: 24,
        zIndex: 1040,
        minHeight: 48,
        minWidth: 48,
        background: cores.aguaLinhaPersonalizada,
        color: cores.papel,
        border: `1px solid ${cores.borda}`,
        borderRadius: 999,
        textDecoration: 'none',
      }}
    >
      <WhatsApp size={22} />
      <span className="bt-whats-rotulo">Falar no WhatsApp</span>
    </a>
  </>
  );
};

export default BotaoWhatsApp;
