/**
 * Monta o diretório de publicação do GitHub Pages.
 *
 *     node scripts/publicar.mjs
 *
 * Publica a loja em Next na raiz de feitoparavocepapelaria.com.br.
 *
 * O protótipo em Vite saiu do ar quando a loja passou a ter tudo que ele
 * tinha. Ele continua no repositório, em src/, como referência do que foi
 * validado com a cliente — mas não é mais servido: duas versões no ar
 * divergem, e a cliente acabaria opinando sobre a errada.
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.dirname(fileURLToPath(new URL('.', import.meta.url)))
const dist = path.join(raiz, 'dist')
const loja = path.join(raiz, 'loja')
const saida = path.join(loja, 'out')

const rodar = (comando, cwd, env = {}) => {
  console.log(`\n> ${comando}`)
  // A variável vai pelo ambiente, e não como prefixo do comando: prefixo
  // `VAR=x comando` não funciona no cmd do Windows.
  execSync(comando, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
}

console.log('1/2 · construindo a loja')
rodar('npm run build', loja)

if (!existsSync(saida)) {
  console.error(`\nA exportação não gerou ${saida}. Confira output: "export" em next.config.ts.`)
  process.exit(1)
}

console.log('\n2/2 · preparando a publicação')
rmSync(dist, { recursive: true, force: true })
cpSync(saida, dist, { recursive: true })

/**
 * Sem este arquivo o GitHub Pages processa o site com Jekyll, que descarta
 * tudo começando com underscore — e o Next põe os scripts, o CSS e as
 * fontes em `_next/`. O resultado é um 404 silencioso.
 *
 * Precisa vir junto de `gh-pages --dotfiles`, senão o publicador ignora
 * arquivos que começam com ponto e este some no caminho.
 */
writeFileSync(path.join(dist, '.nojekyll'), '')

/**
 * O domínio próprio, no nome da Vivian.
 *
 * Este arquivo é o que diz ao GitHub Pages qual endereço serve este site.
 * Sem ele, o site volta a responder só em maycon-mb.github.io/vivian_shop
 * na próxima publicação — e o domínio, que já está pago, passa a responder
 * "There isn't a GitHub Pages site here".
 *
 * Escrito aqui, e não commitado à mão na branch de publicação, porque o
 * gh-pages apaga o que não está em dist/. Já aconteceu com muita gente:
 * o domínio "se desconfigura sozinho" a cada deploy, e ninguém entende.
 */
writeFileSync(path.join(dist, 'CNAME'), 'feitoparavocepapelaria.com.br\n')

/**
 * Endereços antigos continuam funcionando.
 *
 * Enquanto a loja morava em /vivian_shop/loja/, esses links foram mandados
 * por WhatsApp. Link que um dia funcionou e depois responde 404 é pior que
 * link que nunca existiu: quem recebeu acha que o site saiu do ar.
 *
 * Os endereços /vivian_shop/... não precisam de redirecionamento nosso: o
 * GitHub redireciona sozinho para o domínio quando ele está configurado.
 */
const REDIRECIONAR = ['', 'painel', 'como-funciona', 'andamento', 'identidade']

for (const rota of REDIRECIONAR) {
  const pasta = path.join(dist, 'loja', rota)
  const destino = `/${rota ? `${rota}/` : ''}`

  mkdirSync(pasta, { recursive: true })
  writeFileSync(
    path.join(pasta, 'index.html'),
    `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Redirecionando…</title>
    <link rel="canonical" href="${destino}" />
    <meta http-equiv="refresh" content="0; url=${destino}" />
    <script>window.location.replace('${destino}')</script>
  </head>
  <body>
    <p>Esta página mudou de endereço. <a href="${destino}">Continuar</a>.</p>
  </body>
</html>
`
  )
}

console.log(`  ${REDIRECIONAR.length} endereços antigos redirecionados`)

console.log('\nPronto. Publicar com:\n  npx gh-pages -d dist --dotfiles\n')
