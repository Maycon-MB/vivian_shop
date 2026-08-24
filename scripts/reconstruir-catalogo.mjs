/**
 * Reconstrói o catálogo a partir das páginas salvas da Elojinha.
 *
 *     node scripts/reconstruir-catalogo.mjs [pasta] [saida.csv]
 *
 * A extração salvou, para cada produto, a página da vitrine e a página de
 * edição do painel. É da página de edição que sai o que importa e não
 * aparece em lugar nenhum público: peso, medidas da embalagem, estoque e
 * o mínimo por pedido.
 *
 * Ler o HTML salvo, e não raspar a loja de novo, foi o que salvou o
 * trabalho quando o CSV do robô foi truncado no meio. Parser errado se
 * conserta relendo o arquivo.
 *
 * Uma descoberta que muda o frete: o painel chama os campos de "Peso do
 * lote" e "Altura do lote", e o dado traz `shipping_dimensions_per_unit:
 * false`. As medidas são do pacote fechado, e não de uma peça — que é
 * exatamente como ela despacha, de dez em dez.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const pasta = process.argv[2] ?? path.join(process.env.USERPROFILE, 'Documents', 'vivian-elojinha')
const saida = process.argv[3] ?? path.join(pasta, 'catalogo-reconstruido.csv')

const COLUNAS = [
  'slug', 'nome', 'preco', 'preco_promocional', 'descricao',
  'prazo_producao', 'minimo', 'peso_g', 'alt_cm', 'larg_cm', 'comp_cm',
  'estoque', 'fotos',
]

/** Campo no formato RFC 4180: tudo entre aspas, aspas internas dobradas. */
const campo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`

const BARRA = String.fromCharCode(92)

/* O payload do Next chega com as aspas escapadas dentro de uma string.
   Sem desfazer isso, nenhuma busca encontra os campos. */
const desescapar = (html) => html.split(BARRA + '"').join('"')

const numero = (texto, chave) => {
  const marca = `"${chave}":`
  const inicio = texto.indexOf(marca)
  if (inicio < 0) return ''

  const resto = texto.slice(inicio + marca.length, inicio + marca.length + 24)
  const achado = resto.match(/^-?[\d.]+/)

  return achado ? Number(achado[0]) : ''
}

/**
 * O valor de um campo de texto do JSON.
 *
 * Percorre caractere a caractere em vez de montar uma expressão regular:
 * a descrição dela tem aspas, quebras de linha e barras invertidas, e
 * toda tentativa de escrever isso como regex dentro de template literal
 * virou barra escapando barra escapando barra. Mais longo, e sem como
 * interpretar errado.
 */
const texto = (bruto, chave, deTras = false) => {
  const marca = `"${chave}":"`
  /* De trás para frente quando o mesmo nome de campo aparece mais de uma
     vez no bloco. É o caso de "name": o nome da loja vem antes do nome do
     produto, e ler o primeiro trouxe "Feito para Você!" em 343 linhas. */
  const inicio = deTras ? bruto.lastIndexOf(marca) : bruto.indexOf(marca)
  if (inicio < 0) return ''

  let i = inicio + marca.length
  let saida = ''

  while (i < bruto.length) {
    const c = bruto[i]

    if (c === BARRA) {
      const seguinte = bruto[i + 1]

      /* O texto vem escapado duas vezes: uma pelo JSON do produto, outra
         pelo payload do Next que o embrulha. Sem tratar a barra dupla, a
         descrição dela chegava na loja com "\n" e "\u003e" escritos por
         extenso, no meio da frase, para a cliente ler. */
      if (seguinte === BARRA) { saida += BARRA; i += 2; continue }
      if (seguinte === 'n') { saida += String.fromCharCode(10); i += 2; continue }
      if (seguinte === 'r') { i += 2; continue }
      if (seguinte === 't') { saida += String.fromCharCode(9); i += 2; continue }
      if (seguinte === 'u') {
        const codigo = bruto.slice(i + 2, i + 6)
        if (/^[0-9a-fA-F]{4}$/.test(codigo)) {
          saida += String.fromCharCode(parseInt(codigo, 16))
          i += 6
          continue
        }
      }

      saida += seguinte
      i += 2
      continue
    }

    if (c === '"') break

    saida += c
    i++
  }

  /* Segunda passada: o payload escapa o que já vinha escapado, e o que
     sobra é a sequência "barra n" escrita por extenso no meio da frase.
     Texto de produto não tem barra invertida de verdade, então trocar é
     seguro — e sem isso a cliente dela lê "\n" no meio da descrição. */
  return saida
    .split(BARRA + 'n').join(String.fromCharCode(10))
    .split(BARRA + 't').join(String.fromCharCode(9))
}

const produtoDoAdmin = (html) => {
  const cru = desescapar(html)

  // O bloco do formulário de edição é o único que traz shipping_weight.
  const i = cru.indexOf('"shipping_weight"')
  if (i < 0) return null

  const bloco = cru.slice(Math.max(0, i - 8000), i + 600)

  const slug = texto(bloco, 'slug') || texto(cru, 'slug')
  if (!slug) return null

  return {
    slug,
    nome: texto(bloco, 'name', true),
    preco: numero(bloco, 'price'),
    preco_promocional: numero(bloco, 'promotional_price'),
    descricao: texto(bloco, 'description'),
    prazo_producao: numero(bloco, 'production_time_days'),
    minimo: numero(bloco, 'min_quantity'),
    peso_g: numero(bloco, 'shipping_weight'),
    alt_cm: numero(bloco, 'shipping_height'),
    larg_cm: numero(bloco, 'shipping_width'),
    comp_cm: numero(bloco, 'shipping_length'),
    estoque: numero(bloco, 'stock'),
    fotos: '',
  }
}

const arquivos = readdirSync(path.join(pasta, 'html')).filter((a) => a.endsWith('.html'))
const doPainel = arquivos.filter((a) => a.startsWith('admin'))

const produtos = new Map()
const semDado = []

for (const arquivo of doPainel) {
  const html = readFileSync(path.join(pasta, 'html', arquivo), 'utf8')
  const produto = produtoDoAdmin(html)

  if (produto) produtos.set(produto.slug, produto)
  else semDado.push(arquivo)
}

/* As fotos vêm da pasta local, e não do endereço do CDN deles: o Elo7
   fechou e levou tudo junto, e loja que pode fechar amanhã não é lugar de
   guardar o acervo dela. */
for (const produto of produtos.values()) {
  const dela = path.join(pasta, 'fotos', produto.slug)
  if (!existsSync(dela)) continue

  produto.fotos = readdirSync(dela)
    .filter((a) => /\.(jpe?g|png|webp)$/i.test(a))
    .sort()
    .join(';')
}

const linhas = [
  COLUNAS.join(','),
  ...[...produtos.values()].map((p) => COLUNAS.map((c) => campo(p[c])).join(',')),
]

writeFileSync(saida, linhas.join('\n') + '\n', 'utf8')

const todos = [...produtos.values()]
const comPeso = todos.filter((p) => p.peso_g).length
const comFoto = todos.filter((p) => p.fotos).length

console.log(`${produtos.size} produtos reconstruídos de ${doPainel.length} páginas do painel`)
console.log(`  ${comPeso} com peso e medidas`)
console.log(`  ${comFoto} com foto`)
if (semDado.length) console.log(`  ${semDado.length} páginas sem dado de produto`)
console.log(`escrito em ${saida}`)
