/**
 * Recupera as descrições que a reconstrução do catálogo perdeu.
 *
 *     node scripts/recuperar-descricoes.mjs [pasta] [saida.sql]
 *
 * ── O estrago ──────────────────────────────────────────────────────────
 *
 * Oitenta dos 342 produtos foram para o banco com a descrição gravada
 * como o texto literal `$2f`. Não é descrição ruim: é descrição nenhuma.
 * Cinquenta e oito deles são Lousa Mágica, que é o produto que ela mais
 * vende, e ficaram assim no ar.
 *
 * A causa foi minha. O `reconstruir-catalogo.mjs` procura cada campo
 * dentro de uma janela de 8.000 caracteres antes da âncora do produto, e
 * nesses arquivos a descrição cai fora da janela. O que sobrou foi um
 * pedaço de outro campo.
 *
 * ── Por que dá para recuperar ──────────────────────────────────────────
 *
 * As 753 páginas salvas da Elojinha continuam no disco, e cada
 * `admin_<slug>.html` tem a descrição inteira, uma única vez. É a mesma
 * fonte de onde saíram peso e medidas, e por isso ela foi guardada.
 *
 * Ler o HTML salvo, e não raspar a loja de novo, é o que permite
 * consertar parser errado sem depender de um site que já fechou.
 *
 * ── Por que gera SQL em vez de escrever no banco ───────────────────────
 *
 * São 80 `update` numa tabela de produção com loja no ar. Quem aperta o
 * botão é o Maycon, olhando o arquivo antes: script que escreve sozinho
 * em banco de cliente é como os onze pedidos falsos de 25/08 aconteceram.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const pasta = process.argv[2] ?? path.join(process.env.USERPROFILE, 'Documents', 'vivian-elojinha')
const saida = process.argv[3] ?? path.join(process.cwd(), 'recuperar-descricoes.sql')

const pastaHtml = path.join(pasta, 'html')

if (!existsSync(pastaHtml)) {
  console.error(`Não achei ${pastaHtml}.`)
  console.error('As páginas salvas da Elojinha não estão nesta máquina. Ver docs/como-continuar.md.')
  process.exit(1)
}

/* UTF-8, e conferido palavra por palavra antes de gravar.
 *
 * O terminal do Windows desenha acento errado nos dois casos, e olhando a
 * tela eu conclui que era ISO-8859-1. Estava errado: procurando por
 * "ATENÇÃO", "PRODUÇÃO" e "Mágica" dentro do arquivo, só a leitura em
 * UTF-8 acha as três.
 *
 * A diferença não é detalhe: em latin-1 as 72 descrições entrariam no
 * banco dela com o acento quebrado de uma vez só, e o estrago apareceria
 * na página de cada produto. */
const ENCODING = 'utf8'

const catalogo = JSON.parse(
  readFileSync(path.join(process.cwd(), 'loja', 'src', 'dados', 'catalogo-publicado.json'), 'utf8'),
)

/* O que conta como perdido: o `$2f` que o parser gravou, e qualquer coisa
   curta demais para ser uma descrição de verdade. O limite é generoso
   para baixo de propósito: se aparecer uma descrição legítima de 40
   caracteres, ela entra na lista e eu vejo no arquivo antes de rodar. */
const perdida = (texto) => !texto || texto.trim() === '$2f' || texto.trim().length < 30

const quebradas = (catalogo.produtos ?? []).filter((p) => perdida(p.description))

console.log(`produtos com a descrição perdida: ${quebradas.length}`)

/**
 * A descrição de dentro da página salva.
 *
 * O valor está num JSON embutido no HTML. Em vez de recortar na mão, o
 * trecho é devolvido ao `JSON.parse`, que é quem sabe desfazer as barras
 * invertidas sem eu inventar regra de escape.
 *
 * ── Por que a mais longa, e não a primeira ─────────────────────────────
 *
 * A página traz `"description"` mais de uma vez. A primeira é o resumo de
 * busca, cortado em duzentos caracteres: pegando ela, a Lousa Mágica
 * entrava no banco terminando em "TAMANHO DA LOUSA: 24 x 18", sem o "cm"
 * e sem o prazo de produção.
 *
 * Foi assim que a reconstrução original errou, e eu ia repetir o mesmo
 * erro com outra cara. A de verdade é a mais longa, e a diferença entre
 * elas é grande demais para haver empate.
 */
/* Entidade HTML que aparece no texto dela: a seta `-->` que o editor da
   Elojinha usava como marcador vira `--&gt;` no parágrafo renderizado. */
const semEntidades = (texto) =>
  texto
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

/**
 * A descrição inteira, do parágrafo que a página do painel desenha.
 *
 * É aqui que está o texto completo. O campo JSON de `description` traz o
 * resumo de busca, cortado em duzentos caracteres: por ele, a Lousa
 * Mágica terminava em "TAMANHO DA LOUSA: 24 x 18", sem o "cm", sem o tipo
 * da base, sem a caneta e sem o prazo.
 *
 * Foi assim que a reconstrução original errou, e eu quase repeti o erro
 * com outra cara.
 */
const doParagrafo = (html) => {
  const marca = 'whitespace-pre-line'
  const onde = html.indexOf(marca)
  if (onde < 0) return ''

  const abre = html.indexOf('>', onde)
  const fecha = html.indexOf('</p>', abre)
  if (abre < 0 || fecha < 0) return ''

  return semEntidades(html.slice(abre + 1, fecha))
    /* O texto guarda `\n` como dois caracteres, e não como quebra de
       linha de verdade. Sem isto, a descrição chega na loja com um "\n"
       impresso no meio da frase. */
    .replace(/\\n/g, String.fromCharCode(10))
    .trim()
}

const doJson = (html) => {
  const marca = '"description":"'
  const achadas = []

  let inicio = html.indexOf(marca)
  let fim = 0

  while (inicio >= 0) {
    let i = inicio + marca.length
    let bruto = ''

    while (i < html.length) {
      const c = html[i]
      if (c === '\\') {
        bruto += html[i] + html[i + 1]
        i += 2
        continue
      }
      if (c === '"') break
      bruto += c
      i += 1
    }

    try {
      achadas.push(JSON.parse(`"${bruto}"`))
    } catch {
      // Trecho que não fecha como JSON não serve; a próxima serve.
    }

    fim = i
    inicio = html.indexOf(marca, fim + 1)
  }

  if (!achadas.length) return ''

  return achadas.reduce((maior, atual) => (atual.length > maior.length ? atual : maior))
}

/* O parágrafo primeiro, porque é o texto inteiro. O JSON fica como rede
   para a página pública, que não tem esse parágrafo, e ali o resumo é
   melhor que nada. */
const descricaoDe = (html) => doParagrafo(html) || doJson(html)

const arquivos = readdirSync(pastaHtml)
const existe = new Set(arquivos)

/**
 * A página salva daquele produto.
 *
 * São três tentativas, e a ordem importa.
 *
 * A página do painel vem primeiro porque é a fonte de tudo o mais que foi
 * extraído dali. Quando ela não existe, a página pública do produto serve:
 * a descrição é a mesma, e é justamente o que a cliente lia.
 *
 * A terceira é para o slug que mudou entre a extração e o banco, como
 * `lousa-magica-minnie-rosa` contra `lousa-magica-minnie-rosa-modelo-1`.
 * **Só vale quando existe um candidato e um só.** Duas lousas parecidas
 * têm descrições quase iguais, e escolher a errada põe a medida de um
 * produto na página de outro, sem ninguém perceber.
 */
const paginaDe = (slug) => {
  if (existe.has(`admin_${slug}.html`)) return `admin_${slug}.html`
  if (existe.has(`${slug}.html`)) return `${slug}.html`

  const parecidos = arquivos.filter((a) => {
    const dele = a.replace(/^admin_/, '').replace(/\.html$/, '')
    return dele.startsWith(slug) || slug.startsWith(dele)
  })

  const unicos = new Set(parecidos.map((a) => a.replace(/^admin_/, '')))
  return unicos.size === 1 ? parecidos[0] : ''
}

const recuperadas = []
const semArquivo = []

for (const produto of quebradas) {
  const nome = paginaDe(produto.slug)

  if (!nome) {
    semArquivo.push(produto.slug)
    continue
  }

  const texto = descricaoDe(readFileSync(path.join(pastaHtml, nome), ENCODING)).trim()

  if (perdida(texto)) {
    semArquivo.push(produto.slug)
    continue
  }

  recuperadas.push({ slug: produto.slug, nome: produto.name, descricao: texto })
}

console.log(`recuperadas: ${recuperadas.length}`)
if (semArquivo.length) {
  console.log(`sem página salva, ficam como estão: ${semArquivo.length}`)
  semArquivo.forEach((s) => console.log(`  ${s}`))
}

/* Aspas simples dobradas: é como o Postgres escapa dentro de string, e
   descrição dela tem apóstrofo. */
const aspas = (texto) => texto.replace(/'/g, "''")

const linhas = [
  '-- Recupera as 80 descrições que a reconstrução do catálogo perdeu.',
  '--',
  '-- Gerado por scripts/recuperar-descricoes.mjs a partir das páginas',
  '-- salvas da Elojinha. Cada texto é o que estava no anúncio dela, sem',
  '-- nenhuma edição minha.',
  '--',
  '-- O `where` confere que a descrição continua perdida: rodando duas',
  '-- vezes, a segunda não faz nada, e se alguém já tiver corrigido um',
  '-- produto pelo painel, este arquivo não passa por cima.',
  '',
  'begin;',
  '',
  ...recuperadas.map(
    (p) =>
      `update produtos set descricao = '${aspas(p.descricao)}'\n` +
      ` where slug = '${aspas(p.slug)}'\n` +
      `   and (descricao is null or trim(descricao) = '$2f' or length(trim(descricao)) < 30);`,
  ),
  '',
  '-- Confira antes do commit: deve dizer 0.',
  "select count(*) as ainda_perdidas from produtos where trim(coalesce(descricao, '')) = '$2f';",
  '',
  'commit;',
  '',
]

writeFileSync(saida, linhas.join('\n'), 'utf8')

console.log(`\nSQL escrito em ${saida}`)
console.log('Confira o arquivo e rode no SQL Editor do Supabase.')
