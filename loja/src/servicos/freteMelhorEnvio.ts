'use client'

import type { ConsultaDeFrete, OpcaoDeFrete, ServicoDeFrete } from './contratos'
import { freteSimulado } from './freteSimulado'

/**
 * O frete de verdade, cotado no Melhor Envio.
 *
 * A loja não fala com o Melhor Envio: fala com uma função do Supabase, que
 * é quem guarda o token. A razão é direta, e é dinheiro dela: **quem tem
 * aquele token compra etiqueta e gasta o saldo da conta**. Num site
 * estático, tudo o que o navegador precisa saber está à vista de quem
 * abrir as ferramentas do navegador.
 *
 * O que sobe daqui é CEP e tamanho do pacote. O que volta é preço.
 *
 * ── Por que cai para a estimativa em vez de mostrar erro ───────────────
 *
 * A cotação acontece no checkout, que é a última tela em que a cliente
 * ainda pode desistir. "Não consegui calcular o frete" ali custa a venda,
 * e o motivo nunca é culpa dela: pode ser a autorização vencida, a API
 * deles fora do ar, ou a internet do celular.
 *
 * Então a loja volta para a estimativa e continua vendendo. A tela já
 * avisa que o valor é estimado enquanto o serviço de verdade não está
 * ligado, então a cliente não é enganada.
 *
 * O preço disso é que uma falha silenciosa não aparece na tela de
 * ninguém. Ela aparece no registro da função, e é lá que se olha.
 */

const ENDERECO = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cotar-frete`
  : ''

/* Cinco segundos. Passou disso, a estimativa entra: esperar mais é
   deixar a cliente olhando um botão que não responde. */
const PACIENCIA_MS = 5000

export const freteMelhorEnvio: ServicoDeFrete = {
  real: true,

  async cotar(consulta: ConsultaDeFrete): Promise<OpcaoDeFrete[]> {
    if (!ENDERECO) return freteSimulado.cotar(consulta)

    const desistir = new AbortController()
    const relogio = setTimeout(() => desistir.abort(), PACIENCIA_MS)

    try {
      const resposta = await fetch(ENDERECO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify(consulta),
        signal: desistir.signal,
      })

      if (!resposta.ok) return freteSimulado.cotar(consulta)

      const { opcoes } = await resposta.json()

      /* Lista vazia é resposta legítima: pode ser CEP que nenhuma
         transportadora atende. Mas mostrar "nenhuma opção" no checkout é
         o mesmo que dizer "não vendo para você", então a estimativa
         entra e a compra segue. */
      if (!Array.isArray(opcoes) || opcoes.length === 0) {
        return freteSimulado.cotar(consulta)
      }

      return opcoes
    } catch {
      return freteSimulado.cotar(consulta)
    } finally {
      clearTimeout(relogio)
    }
  },
}
