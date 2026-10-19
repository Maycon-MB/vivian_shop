/**
 * A assinatura `x-signature` do aviso do Mercado Pago.
 *
 * Lido pelos testes e pela função `aviso-do-pagamento`, em Deno: por isso
 * não importa nada e usa o `crypto.subtle` que os dois têm.
 *
 * Modelo da documentação de webhooks deles: HMAC SHA256, em hexadecimal,
 * de `id:[data.id];request-id:[x-request-id];ts:[ts];`, com o id em
 * minúsculas e sem as partes que não vieram.
 */

export type ResultadoDaAssinatura = 'valida' | 'invalida' | 'ausente'

export const montarManifesto = ({
  dataId,
  requestId,
  ts,
}: {
  dataId: string | null
  requestId: string | null
  ts: string | null
}): string =>
  (dataId ? `id:${dataId.toLowerCase()};` : '') +
  (requestId ? `request-id:${requestId};` : '') +
  (ts ? `ts:${ts};` : '')

const lerCabecalho = (assinatura: string): { ts: string; v1: string } | null => {
  const partes = Object.fromEntries(
    assinatura.split(',').map((parte) => {
      const [chave, ...valor] = parte.split('=')
      return [chave.trim(), valor.join('=').trim()]
    }),
  )
  if (!partes.ts || !/^[0-9a-f]{64}$/i.test(partes.v1 ?? '')) return null
  return { ts: partes.ts, v1: partes.v1.toLowerCase() }
}

const hex = (bytes: ArrayBuffer) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')

/* Comparação em tempo constante: `===` para no primeiro caractere
   diferente, e o tempo de resposta diria quanto da assinatura acertou. */
const iguais = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diferenca === 0
}

export const conferirAssinatura = async ({
  assinatura,
  requestId,
  dataId,
  segredo,
}: {
  assinatura: string | null
  requestId: string | null
  dataId: string | null
  segredo: string
}): Promise<ResultadoDaAssinatura> => {
  if (!assinatura) return 'ausente'

  const cabecalho = lerCabecalho(assinatura)
  if (!cabecalho) return 'invalida'

  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const manifesto = montarManifesto({ dataId, requestId, ts: cabecalho.ts })
  const esperado = hex(await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(manifesto)))

  return iguais(esperado, cabecalho.v1) ? 'valida' : 'invalida'
}

/**
 * Assinatura falsa é sempre barrada. Sem assinatura só é barrado com
 * `exigir`, ligado quando o log provar que todo aviso de verdade vem assinado.
 */
export const decidirPelaAssinatura = ({
  resultado,
  exigir,
}: {
  resultado: ResultadoDaAssinatura
  exigir: boolean
}): 'seguir' | 'recusar' => {
  if (resultado === 'invalida') return 'recusar'
  if (resultado === 'ausente' && exigir) return 'recusar'
  return 'seguir'
}
