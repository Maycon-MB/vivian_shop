/**
 * Traz o catálogo publicado do banco para dentro do site, antes do build.
 *
 *     node scripts/baixar-catalogo.mjs
 *
 * A loja é um site estático: as páginas são geradas uma vez e servidas
 * prontas. Isso é o que a deixa rápida no 4G e o que faz o Google
 * enxergar o conteúdo — mas significa que o catálogo precisa estar em
 * mãos na hora de gerar, e não quando alguém abre a página.
 *
 * Busca com a chave anônima de propósito, a mesma que vai no navegador.
 * Assim o que entra no site é exatamente o que a política do banco deixa
 * qualquer pessoa ver: o que ela publicou, e nada além.
 *
 * Sem banco configurado, ou com nenhum produto publicado, o arquivo sai
 * vazio e a loja continua mostrando o catálogo de exemplo. É o que roda
 * na demonstração, e é melhor do que uma vitrine em branco.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const destino = path.join(raiz, 'loja', 'src', 'dados', 'catalogo-publicado.json')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const gravar = (produtos, temas) => {
  mkdirSync(path.dirname(destino), { recursive: true })
  writeFileSync(destino, JSON.stringify({ produtos, temas }, null, 2) + '\n', 'utf8')
}

if (!url || !chave) {
  /* Sem credencial o arquivo NÃO é reescrito.
     Ele é versionado de propósito, com os 342 produtos dela, para quem
     clonar sem chave nenhuma construir uma loja de demonstração em vez de
     uma loja vazia. Gravar `[]` aqui apagava esses 342 do repositório em
     qualquer build local sem `.env.local` — e o estrago só apareceria
     depois, num commit feito sem olhar o diff. Descoberto assim, em
     25/08. */
  console.log('sem banco configurado: o catálogo do repositório fica como está')
  process.exit(0)
}

const buscar = async (caminho) => {
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}` },
  })

  if (!resposta.ok) {
    throw new Error(`o banco respondeu ${resposta.status} em ${caminho}`)
  }

  return resposta.json()
}

const linhas = await buscar(
  'produtos?select=id,slug,nome,descricao,preco_reais,preco_promocional_reais,linha,minimo,prazo_producao,peso_g,alt_cm,larg_cm,comp_cm,imagem,imagem_mini,temas(slug,nome,descricao)&order=nome',
)

const produtos = linhas.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.nome,
  description: p.descricao,
  // `numeric` do Postgres chega como texto: sem converter, o total do
  // carrinho concatena em vez de somar.
  price: Number(p.preco_reais),
  ...(p.preco_promocional_reais !== null
    ? { precoPromocional: Number(p.preco_promocional_reais) }
    : {}),
  category: p.linha === 'personalizada' ? 'Papelaria personalizada' : 'Papelaria pedagógica',
  tema: p.temas?.slug ?? 'sem-tema',
  minimo: p.minimo,
  prazoProducao: p.prazo_producao,
  pesoG: p.peso_g,
  altCm: p.alt_cm === null ? undefined : Number(p.alt_cm),
  largCm: p.larg_cm === null ? undefined : Number(p.larg_cm),
  compCm: p.comp_cm === null ? undefined : Number(p.comp_cm),
  image: p.imagem ?? '',
  mini: p.imagem_mini ?? '',
  tag: 'Sob encomenda',
  detalhes: [],
}))

/* Só os temas que têm produto publicado. Tema vazio na vitrine é link que
   não leva a lugar nenhum, e com 140 temas isso seria a maior parte. */
const usados = new Map()
for (const p of linhas) {
  if (p.temas?.slug) usados.set(p.temas.slug, p.temas)
}

const temas = [...usados.values()].map((t) => ({
  slug: t.slug,
  nome: t.nome,
  descricao: t.descricao ?? '',
}))

gravar(produtos, temas)

console.log(`${produtos.length} produtos publicados, ${temas.length} temas`)
if (!produtos.length) {
  console.log('nenhum produto publicado ainda: a loja segue com o catálogo de exemplo')
}
