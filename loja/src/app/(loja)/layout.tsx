import { FaixasDoTopo } from '@/componentes/FaixasDoTopo'
import { WhatsAppDaLoja } from '@/componentes/WhatsAppDaLoja'

/**
 * O que envolve as telas de quem compra.
 *
 * As faixas do topo e o botão de WhatsApp saíram do layout raiz e vieram
 * para cá em 24/08. Antes eles apareciam em tudo, inclusive no painel da
 * Vivian — e ali não fazem sentido nenhum: ela não precisa de um aviso
 * dizendo que a loja é uma demonstração, nem de um botão para chamar a si
 * mesma no WhatsApp.
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
      <WhatsAppDaLoja />
    </>
  )
}
