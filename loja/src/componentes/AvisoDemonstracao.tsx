'use client'

import { usePathname } from 'next/navigation'

import { estaTudoReal, situacaoDosServicos } from '@/servicos'

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
 *
 * Em 26/08 entrou a segunda condição, e ela é a que vale hoje: **a chave
 * do Mercado Pago começa com `TEST-`.** Com credencial de teste o cartão
 * não é cobrado de verdade, e a loja pareceria estar vendendo sem estar.
 * Trocando pela chave de produção, o aviso desaparece sozinho, sem
 * ninguém precisar lembrar de vir aqui.
 *
 * ── O texto diz o que está simulado, e não uma frase só ────────────────
 *
 * Em 27/08 o aviso passou a olhar cada serviço em separado, e o motivo é
 * dinheiro dela. Havia uma combinação que ia acontecer em dias: pagamento
 * de verdade ligado e frete ainda simulado. Nela, a loja **cobraria** a
 * cliente enquanto a faixa amarela dizia "nada é cobrado de verdade".
 *
 * Uma frase falsa sobre cobrança é pior do que aviso nenhum: a cliente lê
 * que não paga e paga, e o frete inventado sai do bolso da Vivian em todo
 * pedido. O aviso agora nomeia o que está de mentira.
 */

/** Credencial de teste do Mercado Pago não cobra ninguém. */
const PAGAMENTO_DE_MENTIRA = String(
  process.env.NEXT_PUBLIC_MERCADOPAGO_CHAVE ?? '',
).startsWith('TEST-')
/**
 * O que está de mentira, dito com o nome.
 *
 * Nunca afirma que nada é cobrado quando o pagamento está ligado: essa
 * frase, errada, faz a cliente pagar achando que não paga.
 */
function recado(forte: boolean) {
  const cobrando = situacaoDosServicos.pagamento !== 'simulado' && !PAGAMENTO_DE_MENTIRA
  const freteDeMentira = situacaoDosServicos.frete === 'simulado'

  if (cobrando && freteDeMentira) {
    return (
      <>
        O pagamento já é real, mas <strong>o valor do frete ainda é uma estimativa</strong>.
        O valor final da entrega pode mudar.
      </>
    )
  }

  if (cobrando) {
    return <>Alguns avisos por e-mail ainda não são enviados.</>
  }

  if (forte) {
    return (
      <>
        Esta loja ainda está em construção: <strong>nenhuma cobrança é feita</strong> e
        nenhum pedido chega de verdade. Dá para percorrer a compra inteira à vontade.
      </>
    )
  }

  return <>Loja em construção: os produtos e preços são exemplos, e nada é cobrado de verdade.</>
}

export function AvisoDemonstracao({ onde = 'loja' }: { onde?: 'loja' | 'checkout' }) {
  const caminho = usePathname()

  if (estaTudoReal && !PAGAMENTO_DE_MENTIRA) return null

  const forte = onde === 'checkout'

  if (!forte && TELAS_QUE_JA_AVISAM.some((tela) => caminho?.startsWith(tela))) {
    return null
  }

  return (
    <div
      role="status"
      style={{
        background: forte ? '#FFD400' : '#FDF3C7',
        color: '#12305B',
        borderBottom: '1px solid rgba(18, 48, 91, .12)',
        padding: forte ? '12px 16px' : '9px 16px',
        fontSize: forte ? 14 : 13,
        lineHeight: 1.45,
        textAlign: 'center',
        fontWeight: forte ? 700 : 400,
      }}
    >
      <div className="container">{recado(forte)}</div>
    </div>
  )
}
