/**
 * Monta o diretório de publicação do GitHub Pages.
 *
 *     node scripts/publicar.mjs
 *
 * Junta duas coisas que precisam conviver enquanto o projeto está no meio:
 *
 *   /vivian_shop/        protótipo em Vite — é o que a cliente acompanha
 *   /vivian_shop/loja/   loja real em Next, ainda com produtos de exemplo
 *
 * Roda os dois builds e copia o resultado do Next para dentro do resultado
 * do Vite, que é o que o `gh-pages` publica.
 *
 * O protótipo sai do ar quando a loja real tiver catálogo, carrinho e
 * checkout — até lá, apagar seria tirar da cliente a única coisa que ela
 * consegue abrir e opinar.
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.dirname(fileURLToPath(new URL('.', import.meta.url)))
const dist = path.join(raiz, 'dist')
const loja = path.join(raiz, 'loja')
const saidaLoja = path.join(loja, 'out')
const destinoLoja = path.join(dist, 'loja')

const rodar = (comando, cwd, env = {}) => {
  console.log(`\n> ${comando}`)
  // A variável vai pelo ambiente, e não como prefixo do comando: prefixo
  // `VAR=x comando` não funciona no cmd do Windows.
  execSync(comando, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  })
}

console.log('1/3 · protótipo (Vite)')
rodar('npm run build', raiz)

console.log('\n2/3 · loja real (Next, exportação estática)')
rodar('npm run build', loja, { PUBLICAR_GITHUB_PAGES: 'true' })

if (!existsSync(saidaLoja)) {
  console.error(
    `\nA exportação do Next não gerou ${saidaLoja}.\n` +
      'Confira se next.config.ts está com output: "export".'
  )
  process.exit(1)
}

console.log('\n3/3 · juntando os dois')
rmSync(destinoLoja, { recursive: true, force: true })
cpSync(saidaLoja, destinoLoja, { recursive: true })

/**
 * Sem este arquivo o GitHub Pages processa o site com Jekyll, que descarta
 * tudo começando com underscore — e o Next põe os scripts, o CSS e as
 * fontes em `_next/`. O resultado é um 404 silencioso: o HTML carrega, mas
 * a página fica em branco ou nem abre.
 *
 * Precisa vir junto de `gh-pages --dotfiles`, senão o publicador ignora
 * arquivos que começam com ponto e este some no caminho.
 */
writeFileSync(path.join(dist, '.nojekyll'), '')

console.log(`\nPronto. Publicar com:\n  npx gh-pages -d dist --dotfiles\n`)
console.log('  /            protótipo')
console.log('  /loja/       loja real\n')
