/**
 * Reconstrói o catálogo a partir das páginas salvas da Elojinha.
 *
 *     node scripts/reconstruir-catalogo.mjs [pasta] [saida.csv]
 *
 * Existe porque o robô de extração truncou o CSV ao recomeçar, e os 60
 * produtos que já estavam lá sumiram. O HTML cru sobreviveu, e foi
 * justamente por isso que eu pedi para salvá-lo: parser errado se
 * conserta lendo o arquivo, sem raspar a loja de novo.
 *
 * Lê o `application/ld+json` de cada página, que é dado estruturado de
 * verdade — nome, descrição, preço e imagens. É mais confiável do que ler
 * o HTML renderizado, que muda quando eles mexem no layout.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const pasta = process.argv[2] ?? path.join(process.env.USERPROFILE, 'Documents', 'vivian-elojinha')
/* Nome próprio, e não o mesmo arquivo do robô de extração: os dois
   escrevendo no mesmo caminho já se sobrescreveram uma vez. */
const saida = process.argv[3] ?? path.join(pasta, 'catalogo-reconstruido.csv')

const COLUNAS = [
  'slug', 'nome', 'preco', 'preco_promocional', 'descricao',
  'prazo_producao', 'tema', 'peso_g', 'alt_cm', 'larg_cm', 'comp_cm',
  'fotos', 'estoque',
]

/** Campo no formato RFC 4180: tudo entre aspas, aspas internas dobradas. */
const campo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`

const produtoDoHtml = (html, slug) => {
  const blocos = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]

  for (const bloco of blocos) {
    let dado
    try {
      dado = JSON.parse(bloco[1])
    } catch {
      continue
    }
    if (dado['@type'] !== 'Product') continue

    const imagens = Array.isArray(dado.image) ? dado.image : [dado.image].filter(Boolean)

    /* O preço promocional não está no schema.org: ele vem no payload do
       Next, escapado. Ler de lá é o que evita confundir "sem promoção"
       com "não consegui achar". */
    const promo = html.match(/\\"promotional_price\\":(null|"[\d.]+")/)

    return {
      slug,
      nome: dado.name ?? '',
      preco: dado.offers?.price ?? '',
      preco_promocional: promo && promo[1] !== 'null' ? promo[1].replace(/"/g, '') : '',
      descricao: dado.description ?? '',
      // O prazo aparece no texto da página, não no dado estruturado.
      prazo_producao: (html.match(/Sob encomenda:\s*(\d+\s*dias?)/i) ?? [])[0] ?? '',
      tema: '',
      peso_g: '', alt_cm: '', larg_cm: '', comp_cm: '',
      fotos: imagens.join(';'),
      estoque: '',
    }
  }

  return null
}

/* As páginas do painel são as mesmas dos produtos, salvas com o prefixo
   "admin_" quando o robô entrou logado. Importar as duas criaria cada
   produto duas vezes, com endereços diferentes, e a loja mostraria tudo
   em dobro. Fica a pública, que é a que tem o dado estruturado. */
const arquivos = readdirSync(path.join(pasta, 'html'))
  .filter((a) => a.endsWith('.html'))
  .filter((a) => !a.startsWith('admin_') && !['login.html', 'store.html'].includes(a))

const produtos = []
const semDado = []

for (const arquivo of arquivos) {
  const html = readFileSync(path.join(pasta, 'html', arquivo), 'utf8')
  const produto = produtoDoHtml(html, arquivo.replace(/\.html$/, ''))

  if (produto) produtos.push(produto)
  else semDado.push(arquivo)
}

const linhas = [
  COLUNAS.join(','),
  ...produtos.map((p) => COLUNAS.map((c) => campo(p[c])).join(',')),
]

writeFileSync(saida, linhas.join('\n') + '\n', 'utf8')

console.log(`${produtos.length} produtos reconstruídos de ${arquivos.length} páginas`)
if (semDado.length) console.log(`sem dado estruturado: ${semDado.join(', ')}`)
console.log(`escrito em ${saida}`)
