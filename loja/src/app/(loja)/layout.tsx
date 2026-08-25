import { FaixasDoTopo } from '@/componentes/FaixasDoTopo'
import { ConversaDaLoja } from '@/componentes/ConversaDaLoja'
import '@/telas/landing/conversa.css'

/**
 * O que envolve as telas de quem compra.
 *
 * As faixas do topo e a conversa saíram do layout raiz e vieram para cá
 * em 24/08. Antes elas apareciam em tudo, inclusive no painel da Vivian, e
 * ali não fazem sentido nenhum: ela não precisa de um aviso dizendo que a
 * loja é uma demonstração, nem de um botão para falar consigo mesma.
 *
 * Onde havia o botão de WhatsApp agora está a conversa. A Vivian pediu a
 * troca em 24/08: o WhatsApp tirava a cliente da loja e trazia a pergunta
 * para o telefone pessoal dela, solta, sem dizer de qual pedido era.
 *
 * A separação segue o desenho do athos-gg: a loja tem o layout dela, o
 * admin tem o dele, e o layout raiz fica só com o que é de verdade comum,
 * que é o documento HTML e as fontes.
 */
export default function LayoutDaLoja({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <FaixasDoTopo />
      <main>{children}</main>
      <ConversaDaLoja />
    </>
  )
}
