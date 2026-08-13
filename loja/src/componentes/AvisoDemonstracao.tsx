'use client'

import { usePathname } from 'next/navigation'

import { estaTudoReal } from '@/servicos'

/* Onde a própria tela já explica que é demonstração, com mais detalhe do
   que a tarja do topo. Repetir o mesmo aviso duas vezes na mesma tela faz
   as duas perderem força. */
const TELAS_QUE_JA_AVISAM = ['/checkout', '/pedido-confirmado']

/**
 * Diz, na cara, que a loja ainda é uma demonstração.
 *
 * Existe por um motivo específico e sério: até o Mercado Pago entrar, o
 * botão de pagar não cobra nada. Sem este aviso, alguém que receba o link
 * — uma amiga da Vivian, uma cliente curiosa — completaria uma compra,
 * veria "pagamento aprovado" e ficaria esperando um pacote que ninguém vai
 * postar. Isso é pior do que não ter loja.
 *
 * O aviso some sozinho quando os serviços de verdade forem ligados: ele
 * lê a mesma configuração que escolhe entre simulado e real, então não há
 * como esquecer de tirá-lo do ar.
 */
export function AvisoDemonstracao({ onde = 'loja' }: { onde?: 'loja' | 'checkout' }) {
  const caminho = usePathname()

  if (estaTudoReal) return null

  const forte = onde === 'checkout'

  if (!forte && TELAS_QUE_JA_AVISAM.some((tela) => caminho?.startsWith(tela))) {
    return null
  }

  return (
    <div
      role="status"
      style={{
        background: forte ? '#FFD400' : 'rgba(255, 212, 0, .22)',
        color: '#12305B',
        borderBottom: '1px solid rgba(18, 48, 91, .12)',
        padding: forte ? '12px 16px' : '9px 16px',
        fontSize: forte ? 14 : 13,
        lineHeight: 1.45,
        textAlign: 'center',
        fontWeight: forte ? 700 : 400,
      }}
    >
      <div className="container">
        {forte ? (
          <>
            Esta loja ainda está em construção: <strong>nenhuma cobrança é feita</strong> e
            nenhum pedido chega de verdade. Dá para percorrer a compra inteira à vontade.
          </>
        ) : (
          <>
            Loja em construção — os produtos e preços são exemplos, e nada é cobrado de verdade.
          </>
        )}
      </div>
    </div>
  )
}
