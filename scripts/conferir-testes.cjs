/**
 * Confere que todo arquivo de teste está na bateria.
 *
 *     node scripts/conferir-testes.cjs
 *
 * ── Por que existe ────────────────────────────────────────────────────
 *
 * Em 01/09 a bateria reportou "43 passed (43)" numa execução e
 * "50 passed (50)" em outra, sem falha nenhuma. O vitest conta só os
 * arquivos que **reportaram**: arquivo que nunca rodou não aparece nem
 * como pulado, então execução interrompida imprime verde e é
 * indistinguível de sucesso.
 *
 * Havia também um buraco no `include`: os padrões pegavam `.ts` e `.tsx`,
 * e as telas deste projeto são `.jsx`. Um teste chamado
 * `FormularioDeProduto.test.jsx` sumiria sem erro.
 *
 * Teste que não roda não reprova nada, e é pior que teste inexistente:
 * ele dá a sensação de cobertura que não existe.
 */

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const LOJA = path.join(__dirname, '..', 'loja')

const noDisco = []
const andar = (pasta) => {
  for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
    const caminho = path.join(pasta, item.name)
    if (item.isDirectory()) andar(caminho)
    else if (/\.test\.[cm]?[jt]sx?$/.test(item.name)) noDisco.push(item.name)
  }
}
andar(path.join(LOJA, 'src'))

const saida = execFileSync('npx', ['vitest', 'list', '--filesOnly'], {
  cwd: LOJA,
  encoding: 'utf8',
  shell: true,
})

const naBateria = saida
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /\.test\.[cm]?[jt]sx?$/.test(l))
  .map((l) => path.basename(l))

const faltando = noDisco.filter((f) => !naBateria.includes(f))

console.log(`  ${naBateria.length} de ${noDisco.length} arquivos de teste na bateria`)

if (faltando.length) {
  console.log('\nFora da bateria, e ninguém avisaria:')
  faltando.forEach((f) => console.log(`  ${f}`))
  console.log('\nConfira os padrões `include` em loja/vitest.config.mts.')
  process.exit(1)
}
