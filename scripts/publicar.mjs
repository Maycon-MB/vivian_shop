/**
 * Monta o diretório de publicação do GitHub Pages.
 *
 *     node scripts/publicar.mjs
 *
 * Publica a loja em Next. Onde ela mora depende de DOMINIO_PRONTO: com a
 * variável ligada, na raiz de feitoparavocepapelaria.com.br; sem ela, em
 * maycon-mb.github.io/vivian_shop, que é onde está hoje.
 *
 * O protótipo em Vite saiu do ar quando a loja passou a ter tudo que ele
 * tinha. Ele continua no repositório, em src/, como referência do que foi
 * validado com a cliente — mas não é mais servido: duas versões no ar
 * divergem, e a cliente acabaria opinando sobre a errada.
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.dirname(fileURLToPath(new URL('.', import.meta.url)))
const dist = path.join(raiz, 'dist')
const loja = path.join(raiz, 'loja')
const saida = path.join(loja, 'out')

/* A mesma chave que o next.config.ts lê. Ligada, a loja vai para a raiz do
   domínio; desligada, continua sob /vivian_shop. */
const dominioProprio = process.env.DOMINIO_PRONTO === 'true'
const prefixo = dominioProprio ? '' : '/vivian_shop'

const rodar = (comando, cwd, env = {}) => {
  console.log(`\n> ${comando}`)
  // A variável vai pelo ambiente, e não como prefixo do comando: prefixo
  // `VAR=x comando` não funciona no cmd do Windows.
  execSync(comando, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
}

/* O catálogo dela entra antes do build: a loja é estática, e as páginas
   precisam do produto em mãos na hora de gerar. */
/* `PULAR_CATALOGO=true` reaproveita o `catalogo-publicado.json` que já
   está no disco.
 *
 * Serve para quando se está mexendo em tela e o catálogo não mudou: baixar
 * os 342 produtos do banco leva quase um minuto, e repetir isso a cada
 * ajuste de CSS é um minuto jogado fora por vez.
 *
 * Nunca no CI, e nunca ao publicar de verdade: ali o catálogo precisa ser
 * o do banco, senão a loja vai ao ar com o que estava no disco de alguém. */
if (process.env.PULAR_CATALOGO === 'true') {
  console.log('1/3 · catálogo: reaproveitando o que já está no disco')
} else {
  console.log('1/3 · buscando o catálogo publicado')
  rodar('node scripts/baixar-catalogo.mjs', raiz)
}

console.log('\n2/3 · construindo a loja')
rodar('npm run build', loja, { PUBLICAR_GITHUB_PAGES: 'true' })

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
 * Este arquivo é o que diz ao GitHub Pages qual endereço serve este site, e
 * escrevê-lo é o que efetiva a troca. Por isso ele só aparece com
 * DOMINIO_PRONTO ligado: publicar o CNAME antes de o DNS resolver faz o
 * GitHub redirecionar o endereço antigo para um domínio que ainda não
 * existe, e a loja some do ar até a propagação terminar.
 *
 * Escrito aqui, e não commitado à mão na branch de publicação, porque o
 * gh-pages apaga o que não está em dist/. É assim que um domínio "se
 * desconfigura sozinho" a cada deploy, e ninguém entende por quê.
 */
if (dominioProprio) {
  writeFileSync(path.join(dist, 'CNAME'), 'feitoparavocepapelaria.com.br\n')
  console.log('  CNAME escrito: feitoparavocepapelaria.com.br')
}

/**
 * O atalho que o Next pede e não exporta.
 *
 * Quando a loja e a área da Vivian ganharam layouts separados, em 24/08, a
 * loja passou a viver num grupo de rota — `(loja)`. A exportação estática
 * grava o dado dessa rota como pasta, `__next.!KGxvamEp/__PAGE__.txt`, mas
 * o navegador o pede como arquivo, `__next.!KGxvamEp.__PAGE__.txt`.
 *
 * O resultado é um 404 em toda navegação. A página funciona, porque isso é
 * só a busca antecipada do conteúdo, mas o erro aparece no console de quem
 * abre a loja — e o nosso teste de navegação reprova console sujo, com
 * razão: é assim que defeito de verdade se esconde.
 *
 * Aqui a pasta vira também arquivo, com o nome que o navegador pede.
 */
for (const nome of readdirSync(dist)) {
  const caminho = path.join(dist, nome)
  if (!nome.startsWith('__next.') || !statSync(caminho).isDirectory()) continue

  for (const dentro of readdirSync(caminho)) {
    writeFileSync(path.join(dist, `${nome}.${dentro}`), readFileSync(path.join(caminho, dentro)))
  }
}

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

/* Os endereços que mudaram quando a área da Vivian ganhou lugar próprio,
   em 24/08. O /perguntas foi mandado para ela por WhatsApp e continua
   circulando; link que um dia funcionou e depois responde 404 é pior do
   que link que nunca existiu. */
const MUDARAM = {
  'perguntas': '/admin/perguntas/',
  'painel': '/admin/',
  'custos': '/admin/sobre-o-site/custos/',
  'identidade': '/admin/sobre-o-site/marca/',
  'andamento': '/admin/sobre-o-site/entregas/',
  'entrar': '/admin/entrar/',
}

for (const rota of REDIRECIONAR) {
  const pasta = path.join(dist, 'loja', rota)
  const destino = `${prefixo}/${rota ? `${rota}/` : ''}`

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

/* Os 28 produtos que iam ao ar com o nome ofuscado, corrigidos em 25/08.
   O endereço mudou de /produto/album-de-figurinhas-p-e-p-p-a/ para
   .../album-de-figurinhas-peppa/, e o antigo continua respondendo: a loja
   está no ar desde 21/08 e esses links podem ter sido mandados ou
   indexados. Link que um dia funcionou e depois responde 404 é pior do
   que link que nunca existiu. */
const PRODUTOS_QUE_MUDARAM = JSON.parse(
  readFileSync(path.join(raiz, 'loja', 'src', 'dados', 'enderecos-que-mudaram.json'), 'utf8'),
)

for (const [antigo, novo] of Object.entries(PRODUTOS_QUE_MUDARAM)) {
  MUDARAM[`produto/${antigo}`] = `/produto/${novo}/`
}

for (const [de, para] of Object.entries(MUDARAM)) {
  const pasta = path.join(dist, de)
  const destino = `${prefixo}${para}`

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

console.log(`  ${REDIRECIONAR.length + Object.keys(MUDARAM).length} endereços antigos redirecionados`)

console.log('\nPronto. Publicar com:\n  npx gh-pages -d dist --dotfiles\n')
