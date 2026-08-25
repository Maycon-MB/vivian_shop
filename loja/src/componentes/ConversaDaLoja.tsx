'use client'

import { usePathname } from 'next/navigation'
import Conversa from '@/telas/landing/Conversa'

/**
 * Decide em que telas a conversa aparece.
 *
 * Entrou no lugar do `WhatsAppDaLoja`, e herdou a lista dele: a dúvida
 * antes de comprar surge em qualquer página, principalmente na do produto
 * e no checkout, que é onde a pessoa hesita.
 *
 * Não aparece no painel, onde quem está é a própria Vivian. Nem nas telas
 * em que a conversa já terminou: depois de pagar, o que a cliente quer é
 * acompanhar o pedido, e uma bolha de dúvida ali só cobre a informação
 * que ela foi ver.
 */
const SEM_CONVERSA = ['/admin', '/baixar', '/pedido-confirmado', '/sobre']

export function ConversaDaLoja() {
  const caminho = usePathname()

  if (SEM_CONVERSA.some((rota) => caminho.startsWith(rota))) return null

  return <Conversa />
}
