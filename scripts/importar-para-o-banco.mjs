/**
 * Leva o catálogo do CSV para o banco, e as fotos para o balde.
 *
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/importar-para-o-banco.mjs [catalogo.csv]
 *
 * As regras de conversão não moram aqui: moram em
 * `loja/src/dominio/importarElojinha.ts`, que tem 20 testes. Este arquivo
 * é encanamento — lê, chama a regra, grava, e conta o que fez.
 *
 * Roda com a credencial de serviço, que ignora as políticas de acesso.
 * É o único jeito de escrever produto sem estar logado como a dona, e é
 * por isso que essa chave nunca pode chegar ao navegador.
 *
 * Pode rodar de novo quantas vezes precisar: cada produto é atualizado
 * pelo `slug`, não duplicado. Quando o robô entregar os 343 completos, é
 * rodar isto outra vez.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from '../loja/node_modules/esbuild/lib/main.js'
import { createClient } from '../loja/node_modules/@supabase/supabase-js/dist/index.mjs'

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const url = process.env.SUPABASE_URL
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !chave) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

/* As regras são TypeScript e importam sem extensão, o que o Node puro não
   resolve. Compilar na hora evita duplicar a lógica aqui — e duplicada
   ela divergiria no primeiro ajuste. */
const compilar = async (entrada) => {
  const { outputFiles } = await build({
    entryPoints: [path.join(raiz, entrada)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  })

  const codigo = Buffer.from(outputFiles[0].contents).toString('utf8')
  return import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`)
}

const { lerCsv } = await compilar('loja/src/dominio/planilha.ts')
const { paraProduto } = await compilar('loja/src/dominio/importarElojinha.ts')

const arquivo = process.argv[2]
  ?? path.join(process.env.USERPROFILE, 'Documents', 'vivian-elojinha', 'catalogo-elojinha.csv')

const banco = createClient(url, chave)

const linhas = lerCsv(readFileSync(arquivo, 'utf8'))
console.log(`${linhas.length} linhas no CSV`)

const produtos = []
const recusados = []

for (const linha of linhas) {
  try {
    produtos.push(paraProduto(linha))
  } catch (erro) {
    recusados.push(`${linha.nome || linha.slug}: ${erro.message}`)
  }
}

/* Os temas nascem dos produtos: ela não precisa cadastrar antes de usar,
   e é assim que a cliente dela procura, pelo personagem. */
const temas = [...new Set(produtos.map((p) => p.tema).filter(Boolean))]

const enderecoDe = (nome) =>
  nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

if (temas.length) {
  const { error } = await banco.from('temas').upsert(
    temas.map((nome) => ({ slug: enderecoDe(nome), nome })),
    { onConflict: 'slug' },
  )
  if (error) throw error
}

const { data: temasSalvos } = await banco.from('temas').select('id, slug')
const idDoTema = new Map((temasSalvos ?? []).map((t) => [t.slug, t.id]))

const paraBanco = (p) => ({
  slug: p.slug,
  nome: p.nome,
  descricao: p.descricao,
  preco_reais: p.preco,
  preco_promocional_reais: p.precoPromocional ?? null,
  linha: p.linha === 'Papelaria personalizada' ? 'personalizada' : 'pedagogica',
  tema_id: p.tema ? idDoTema.get(enderecoDe(p.tema)) ?? null : null,
  minimo: p.minimo,
  prazo_producao: p.prazoProducao,
  peso_g: p.pesoG ?? null,
  alt_cm: p.altCm ?? null,
  larg_cm: p.largCm ?? null,
  comp_cm: p.compCm ?? null,
  // Nasce despublicado: peso e medida ainda não vieram, e sem eles o
  // frete sai errado. Quem decide publicar é ela, produto a produto.
  ativo: false,
})

const { error } = await banco.from('produtos').upsert(produtos.map(paraBanco), { onConflict: 'slug' })
if (error) throw error

console.log(`${produtos.length} produtos gravados, ${temas.length} temas`)
if (recusados.length) {
  console.log(`\n${recusados.length} recusados:`)
  for (const r of recusados) console.log('  ' + r)
}
