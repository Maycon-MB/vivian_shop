'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'

/**
 * Decide onde a conversa aparece, e guarda a bolha fechada.
 *
 * Entrou no lugar do `WhatsAppDaLoja`, e herdou a lista dele: a dúvida
 * antes de comprar surge em qualquer página, principalmente na do produto
 * e no checkout, que é onde a pessoa hesita.
 *
 * Não aparece no painel, onde quem está é a própria Vivian. Nem nas telas
 * em que a conversa já terminou: depois de pagar, o que a cliente quer é
 * acompanhar o pedido, e uma bolha de dúvida ali só cobre a informação
 * que ela foi ver.
 *
 * **A conversa em si só é baixada quando alguém abre.** Ela levava 8 KB
 * para dentro de toda página da loja, e o checkout passou do limite de
 * peso por causa disso. Quem está preenchendo o cartão não precisa das
 * regras do chat carregadas, e é justamente a tela onde o carregamento
 * lento custa venda.
 */
const Conversa = dynamic(() => import('@/telas/landing/Conversa'), { ssr: false })

const SEM_CONVERSA = ['/admin', '/baixar', '/pedido-confirmado', '/sobre']

export function ConversaDaLoja() {
  const caminho = usePathname()

  const [abertaPorToque, setAberta] = useState(false)

  /* A página de endereço não encontrado manda para cá com ?conversa=1: de
     lá, "falar com a loja" é o caminho principal, e chegar na home com a
     bolha fechada faria a pessoa procurar de novo o que já tinha clicado.

     `useSyncExternalStore` porque a loja é gerada no build, onde `window`
     não existe. Ele recebe as duas respostas separadas: `false` no
     servidor, o endereço de verdade no navegador. Ler `window.location`
     direto no render fazia o servidor desenhar a bolha e o navegador
     desenhar a conversa, e o React derrubava a página com o erro 418.
     Passava em todo teste e só aparecia no site montado. */
  const pedidaPeloEndereco = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get('conversa') === '1',
    () => false,
  )

  const aberta = abertaPorToque || pedidaPeloEndereco

  if (SEM_CONVERSA.some((rota) => caminho.startsWith(rota))) return null

  if (aberta) return <Conversa aoFechar={() => setAberta(false)} />

  return (
    <button
      type="button"
      className="conversa-bolha"
      onClick={() => setAberta(true)}
      aria-label="Tirar uma dúvida com a loja"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="conversa-bolha-rotulo">Tirar uma dúvida</span>
    </button>
  )
}
