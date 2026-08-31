/**
 * Confere se as funções do Supabase estão publicadas.
 *
 *     node scripts/conferir-funcoes.cjs
 *
 * ── Por que existe ────────────────────────────────────────────────────
 *
 * Em 31/08 a Vivian clicou no link de autorização do Melhor Envio e
 * recebeu `{"code":"NOT_FOUND"}`. As funções estavam no repositório, no
 * GitHub, revisadas e com teste passando: **nunca tinham sido publicadas**,
 * porque o CLI procura em `supabase/functions/` e as nossas moram em
 * `supabase/funcoes/`.
 *
 * O código de autorização vale uma vez só, então o dela queimou.
 *
 * Nada disso aparece em teste de unidade nem em build: a função existe no
 * disco e o site publica normal. A única forma de saber é perguntar ao
 * servidor, e é isso que este script faz.
 *
 * ── O que conta como falha ────────────────────────────────────────────
 *
 * **404 é falha**: a função não existe lá. Qualquer outra resposta passa,
 * inclusive 400 e 401 — significam que ela existe e recusou a chamada por
 * falta de dado ou de credencial, que é o comportamento certo para quem
 * bate na porta sem nada nas mãos.
 *
 * Problema de rede vira aviso, e não falha: derrubar a publicação porque a
 * internet oscilou ensina a ignorar o vermelho.
 */

const fs = require('fs')
const path = require('path')

const PROJETO = process.env.SUPABASE_PROJECT_REF ?? 'kbvgdnrymwfavgkxqvjh'
const PASTA = path.join(__dirname, '..', 'supabase', 'funcoes')

const funcoes = fs
  .readdirSync(PASTA, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

const conferir = async (nome) => {
  const endereco = `https://${PROJETO}.supabase.co/functions/v1/${nome}`

  try {
    const r = await fetch(endereco, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(20000),
    })

    if (r.status === 404) return { nome, estado: 'falta', detalhe: 'não está publicada' }
    return { nome, estado: 'ok', detalhe: `HTTP ${r.status}` }
  } catch (erro) {
    return { nome, estado: 'aviso', detalhe: erro.message }
  }
}

;(async () => {
  const resultados = []
  for (const nome of funcoes) resultados.push(await conferir(nome))

  for (const r of resultados) {
    const marca = r.estado === 'ok' ? 'ok   ' : r.estado === 'falta' ? 'FALTA' : 'aviso'
    console.log(`  ${marca} ${r.nome.padEnd(22)} ${r.detalhe}`)
  }

  const faltando = resultados.filter((r) => r.estado === 'falta')
  const avisos = resultados.filter((r) => r.estado === 'aviso')

  console.log()

  if (faltando.length) {
    console.log(`${faltando.length} função(ões) no repositório e fora do ar.`)
    console.log('Publique com: node scripts/subir-funcoes.mjs')
    process.exit(1)
  }

  if (avisos.length) {
    console.log(`${resultados.length - avisos.length}/${resultados.length} conferidas.`)
    console.log('As outras não responderam, e isso não reprova: pode ser a rede.')
    return
  }

  console.log(`${resultados.length}/${resultados.length} funções publicadas.`)
})()
