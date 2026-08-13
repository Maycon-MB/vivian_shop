'use client'

import { usePathname } from 'next/navigation'
import BotaoWhatsApp from '@/telas/BotaoWhatsApp'

/**
 * Decide em que telas o botão flutuante de WhatsApp aparece.
 *
 * Fica em toda a loja, porque a dúvida antes de comprar surge em qualquer
 * página — principalmente na do produto e no checkout, que é onde a pessoa
 * hesita.
 *
 * Não aparece no painel: ali quem está é a própria Vivian, e um botão para
 * ela falar consigo mesma não faz sentido.
 *
 * Também não aparece onde já existe um botão de WhatsApp em destaque. Dois
 * botões para a mesma coisa na mesma tela fazem a pessoa parar para
 * escolher entre eles, e nenhum dos dois é a escolha que importa ali.
 */
const SEM_BOTAO = ['/painel', '/entrar', '/baixar', '/pedido-confirmado', '/sobre']

export function WhatsAppDaLoja() {
  const caminho = usePathname()

  if (SEM_BOTAO.some((rota) => caminho.startsWith(rota))) return null

  return <BotaoWhatsApp />
}
