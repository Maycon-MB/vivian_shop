/**
 * Publica as funções do Supabase.
 *
 *     node scripts/subir-funcoes.mjs                 sobe todas
 *     node scripts/subir-funcoes.mjs cotar-frete     sobe uma
 *
 * ── Por que este script existe ─────────────────────────────────────────
 *
 * O CLI do Supabase procura as funções em `supabase/functions/`. As nossas
 * moram em `supabase/funcoes/`, porque neste projeto tudo é escrito em
 * português, inclusive nome de pasta.
 *
 * O resultado disso custou caro em 31/08: `frete-retorno` e `cotar-frete`
 * responderam 404 quando a Vivian clicou no link de autorização, o código
 * de uso único dela queimou, e ela viu uma página de erro no meio de uma
 * tarde em que já tinha ficado sem acesso ao painel. O comando de deploy
 * simplesmente não achava os arquivos e não reclamava disso.
 *
 * ── Por que copiar, e não renomear a pasta ─────────────────────────────
 *
 * Renomear resolveria numa linha e quebraria a regra do projeto. O nome em
 * português não é enfeite: é o que faz a Vivian conseguir ler a estrutura
 * quando eu não estiver por perto, e é o que mantém `pedido` sendo pedido
 * em vez de `order`.
 *
 * ── Por que a cópia é apagada no fim ───────────────────────────────────
 *
 * Porque duas pastas com o mesmo conteúdo é uma armadilha: alguém edita
 * uma, sobe a outra, e passa meia hora sem entender por que a mudança não
 * subiu. A cópia existe durante o comando e some depois, mesmo se der
 * erro no meio.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(new URL('.', import.meta.url)))

const NOSSA = path.join(raiz, 'supabase', 'funcoes')
const DO_CLI = path.join(raiz, 'supabase', 'functions')

const PROJETO = process.env.SUPABASE_PROJECT_REF ?? 'kbvgdnrymwfavgkxqvjh'

if (!existsSync(NOSSA)) {
  console.error(`Não achei ${NOSSA}.`)
  process.exit(1)
}

const pedidas = process.argv.slice(2)

const todas = readdirSync(NOSSA, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

const alvos = pedidas.length ? pedidas : todas

const desconhecidas = alvos.filter((f) => !todas.includes(f))
if (desconhecidas.length) {
  console.error(`Não existe função com esse nome: ${desconhecidas.join(', ')}`)
  console.error(`As que existem: ${todas.join(', ')}`)
  process.exit(1)
}

/* A pasta do CLI é sempre refeita do zero. Se sobrou alguma coisa de uma
   execução que morreu no meio, ela seria publicada sem ninguém pedir. */
rmSync(DO_CLI, { recursive: true, force: true })
mkdirSync(DO_CLI, { recursive: true })

let deuErro = false

try {
  for (const nome of alvos) {
    cpSync(path.join(NOSSA, nome), path.join(DO_CLI, nome), { recursive: true })
  }

  for (const nome of alvos) {
    console.log(`subindo ${nome}…`)
    execFileSync(
      'npx',
      [
        '--yes',
        'supabase',
        'functions',
        'deploy',
        nome,
        '--project-ref',
        PROJETO,
        /* Estas funções são chamadas pelo navegador de quem compra e pelo
           site do Melhor Envio, sem sessão nossa. Quem protege cada uma
           está escrito dentro dela: o `state` no retorno da autorização, e
           o fato de a cotação não devolver segredo nenhum. */
        '--no-verify-jwt',
      ],
      { stdio: 'inherit', shell: true },
    )
  }
} catch (erro) {
  deuErro = true
  console.error('\nfalhou:', erro.message)
} finally {
  rmSync(DO_CLI, { recursive: true, force: true })
}

if (deuErro) process.exit(1)

console.log('\nPronto. Confira que respondem:')
for (const nome of alvos) {
  console.log(`  https://${PROJETO}.supabase.co/functions/v1/${nome}`)
}
