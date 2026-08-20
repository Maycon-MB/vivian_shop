/**
 * Gera os documentos que vão para a Vivian, em PDF.
 *
 *     node scripts/gerar-pdf.cjs <arquivo.md> "<Nome do arquivo>"
 *     node scripts/gerar-pdf.cjs --todos
 *
 * A primeira versão disto montava um .docx pelo python-docx e convertia
 * com o LibreOffice. Funcionava, mas o controle de layout era indireto:
 * eu pedia "espaço depois do parágrafo" e torcia. O resultado saiu com
 * uma cláusula por página e corredores brancos no meio do texto.
 *
 * Aqui o documento é HTML impresso pelo Chrome. Isso dá CSS de verdade —
 * `@page` para margem e numeração, `break-inside` para não rachar uma
 * cláusula ao meio, controle de viúvas e órfãs — e, principalmente, deixa
 * eu tirar foto de cada página e olhar antes de mandar.
 *
 * O Chrome vem do Playwright, que já estava instalado para os testes.
 */

const fs = require('fs')
const path = require('path')

const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))

const PASTA = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'vivian-contrato')

/* ── Markdown para HTML ───────────────────────────────────────────────────
   Um conversor pequeno, que entende só o que estes documentos usam. Trazer
   uma biblioteca inteira para converter oito arquivos de texto próprio
   seria mais dependência do que benefício. */

const escapar = (t) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const inline = (t) =>
  escapar(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // Itálico por último, para não confundir com o negrito acima.
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')

function converter(markdown) {
  const linhas = markdown.split('\n')
  const saida = []

  let dentroDeLista = false
  let dentroDeTabela = false
  let paragrafo = []

  const fecharParagrafo = () => {
    if (paragrafo.length) {
      // As linhas do markdown quebram em 80 colunas para eu conseguir ler
      // o diff; no documento elas voltam a ser um parágrafo só.
      saida.push(`<p>${inline(paragrafo.join(' '))}</p>`)
      paragrafo = []
    }
  }
  const fecharLista = () => {
    if (dentroDeLista) {
      saida.push('</ul>')
      dentroDeLista = false
    }
  }
  const fecharTabela = () => {
    if (dentroDeTabela) {
      saida.push('</tbody></table>')
      dentroDeTabela = false
    }
  }
  const fecharTudo = () => {
    fecharParagrafo()
    fecharLista()
    fecharTabela()
  }

  let bloco = null
  let grupoAberto = false

  const fecharGrupo = () => {
    if (grupoAberto) {
      saida.push('</div>')
      grupoAberto = false
    }
  }

  for (const crua of linhas) {
    const linha = crua.trim()

    // Bloco delimitado: ":::assinaturas" ... ":::"
    if (linha.startsWith(':::')) {
      fecharTudo()
      const nome = linha.slice(3).trim()
      if (nome) {
        bloco = nome
        saida.push(`<div class="bloco-${nome}">`)
      } else {
        fecharGrupo()
        bloco = null
        saida.push('</div>')
      }
      continue
    }

    // Marca de linha para assinar. Cada uma abre um grupo, que se fecha
    // no próximo [assinatura] ou no fim do bloco — assim linha, nome e
    // CPF de uma mesma pessoa ficam juntos.
    if (linha === '[assinatura]') {
      fecharParagrafo()
      if (grupoAberto) saida.push('</div>')
      saida.push('<div class="grupo-assinatura"><div class="risco"></div>')
      grupoAberto = true
      continue
    }

    // Dentro de um bloco, cada linha vale por si: "Nome:" e "CPF:" não
    // podem virar um parágrafo só, como acontecia nas testemunhas.
    if (bloco && linha) {
      fecharParagrafo()
      saida.push(`<p class="linha-bloco">${inline(linha)}</p>`)
      continue
    }

    if (!linha) {
      fecharParagrafo()
      fecharLista()
      continue
    }

    // Tabela
    if (linha.startsWith('|')) {
      const celulas = linha.slice(1, -1).split('|').map((c) => c.trim())
      const separador = celulas.every((c) => /^:?-+:?$/.test(c))
      if (separador) continue

      if (!dentroDeTabela) {
        fecharParagrafo()
        fecharLista()
        dentroDeTabela = true
        saida.push('<table><thead><tr>')
        saida.push(celulas.map((c) => `<th>${inline(c)}</th>`).join(''))
        saida.push('</tr></thead><tbody>')
        continue
      }

      saida.push(`<tr>${celulas.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
      continue
    }
    fecharTabela()

    // Títulos
    const titulo = linha.match(/^(#{1,4})\s+(.*)$/)
    if (titulo) {
      fecharTudo()
      let nivel = titulo[1].length
      // O primeiro título do arquivo é o título do documento, mesmo que
      // no markdown ele seja "##" — assim o arquivo continua legível no
      // GitHub sem virar um h1 solto no meio de outros documentos.
      if (!saida.some((t) => t.startsWith('<h1'))) nivel = 1
      // O anexo é documento à parte: começa em folha própria.
      const classe = /ANEXO/i.test(titulo[2]) ? ' class="pagina-nova"' : ''
      saida.push(`<h${nivel}${classe}>${inline(titulo[2])}</h${nivel}>`)
      continue
    }

    // Citação
    if (linha.startsWith('> ')) {
      fecharTudo()
      saida.push(`<blockquote>${inline(linha.slice(2))}</blockquote>`)
      continue
    }

    // Lista
    if (/^[-*]\s+/.test(linha)) {
      fecharParagrafo()
      if (!dentroDeLista) {
        saida.push('<ul>')
        dentroDeLista = true
      }
      saida.push(`<li>${inline(linha.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }
    fecharLista()

    // Linha divisória
    if (/^---+$/.test(linha)) {
      fecharParagrafo()
      saida.push('<hr>')
      continue
    }

    // Alínea: "a) ...", "b) ..."
    if (/^[a-z]\)\s+/.test(linha)) {
      fecharParagrafo()
      saida.push(`<p class="alinea">${inline(linha)}</p>`)
      continue
    }

    // Linha de assinatura
    if (linha.includes('___')) {
      fecharParagrafo()
      saida.push(`<p class="assinatura">${inline(linha)}</p>`)
      continue
    }

    paragrafo.push(linha)
  }

  fecharTudo()
  return saida.join('\n')
}

/* ── O visual ─────────────────────────────────────────────────────────────
   Documento para ser lido e assinado, não para impressionar. Serifada no
   corpo porque texto longo se lê melhor com serifa no papel; sem serifa
   nos títulos, para separar. As cores são as da loja. */

const estilo = (rodape) => `
  @page {
    size: A4;
    margin: 22mm 20mm 20mm 20mm;
    @bottom-center {
      content: "${rodape} — página " counter(page) " de " counter(pages);
    }
  }

  * { box-sizing: border-box; }

  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 11.5pt;
    line-height: 1.5;
    color: #1B1B1B;
    margin: 0;
    /* Alinhado à esquerda de propósito: sem hifenização, o justificado
       abre corredores brancos no meio do parágrafo. */
    text-align: left;
    hyphens: none;
  }

  h1, h2, h3, h4 {
    font-family: "Times New Roman", Times, serif;
    color: #12305B;
    /* Título nunca fica sozinho no pé da página. */
    break-after: avoid;
    page-break-after: avoid;
  }

  h1 {
    font-size: 15pt;
    text-align: center;
    line-height: 1.35;
    margin: 0 0 4mm;
    text-transform: uppercase;
    letter-spacing: .01em;
  }

  h2 {
    font-size: 11.5pt;
    margin: 7mm 0 2.5mm;
    padding-bottom: 1.2mm;
    border-bottom: .6pt solid #C9D6E5;
    text-transform: uppercase;
    letter-spacing: .02em;
  }

  h3 {
    font-size: 10.5pt;
    margin: 5mm 0 2mm;
  }

  h4 { font-size: 10pt; margin: 4mm 0 1.5mm; }

  .pagina-nova {
    break-before: page;
    page-break-before: always;
    margin-top: 0;
  }

  p {
    margin: 0 0 2.6mm;
    /* Nunca deixar uma ou duas linhas soltas de um parágrafo virando a
       página: o contrato fica com aparência de rascunho. */
    orphans: 3;
    widows: 3;
  }

  strong { font-weight: 700; color: #0F1B2D; }

  ul { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }

  blockquote {
    margin: 3mm 0;
    padding: 2.5mm 4mm;
    background: #F4F7FA;
    border-left: 2pt solid #1F736F;
    font-size: 10pt;
    break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2.5mm 0 4mm;
    font-size: 9.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  th {
    text-align: left;
    background: #12305B;
    color: #FFFFFF;
    font-family: "Times New Roman", Times, serif;
    font-weight: 700;
    padding: 1.8mm 2.5mm;
  }

  td {
    padding: 1.8mm 2.5mm;
    border-bottom: .5pt solid #DCE4EC;
    vertical-align: top;
  }

  tr:nth-child(even) td { background: #F7F9FC; }

  hr {
    border: 0;
    border-top: .5pt solid #D8E0E9;
    margin: 5mm 0;
  }

  code {
    font-family: Consolas, monospace;
    font-size: 9.5pt;
    background: #F1F4F8;
    padding: 0 1mm;
  }

  a { color: #1F736F; text-decoration: none; }

  del { color: #7A7A7A; }

  .alinea {
    margin: 0 0 2mm 6mm;
    text-indent: -6mm;
  }

  /* ── Assinaturas ──────────────────────────────────────────────────────
     O bloco inteiro fica junto e nunca racha entre duas páginas: contrato
     com a linha de assinatura órfã no topo da folha seguinte parece
     rascunho, e é o primeiro lugar onde alguém repara. */
  .bloco-local { margin: 10mm 0 8mm; }

  .bloco-assinaturas,
  .bloco-testemunhas {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .bloco-assinaturas { margin-bottom: 10mm; }
  .bloco-testemunhas { margin-top: 6mm; }

  /* Duas colunas nas testemunhas, que assinam lado a lado. */
  .bloco-testemunhas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12mm;
    align-items: start;
  }
  .bloco-testemunhas > p { grid-column: 1 / -1; font-weight: 700; margin-bottom: 3mm; }
  .bloco-testemunhas .grupo-assinatura { grid-column: auto; }

  .risco {
    border-bottom: .8pt solid #2B2B2B;
    height: 12mm;
    margin-bottom: 1.5mm;
  }

  .linha-bloco { margin: 0 0 .8mm; }

  .grupo-assinatura {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 8mm;
  }

  /* O nome de quem assina, logo abaixo da linha, em destaque. */
  .grupo-assinatura .risco + .linha-bloco { font-weight: 700; }

  /* As assinaturas ficam juntas, e nunca separadas da linha de cima. */
  .assinatura {
    margin: 9mm 0 1mm;
    letter-spacing: .5pt;
    break-inside: avoid;
    break-before: avoid;
  }
`

async function gerar(navegador, caminhoMd, nome, { comPreview = false } = {}) {
  const markdown = fs.readFileSync(caminhoMd, 'utf8')
  const corpo = converter(markdown)

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>${nome}</title><style>${estilo(nome)}</style></head>
    <body>${corpo}</body></html>`

  const pagina = await navegador.newPage()
  await pagina.setContent(html, { waitUntil: 'load' })

  const destino = path.join(PASTA, `${nome}.pdf`)
  await pagina.pdf({
    path: destino,
    format: 'A4',
    printBackground: true,
    margin: { top: '22mm', bottom: '20mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width:100%;font-family:Calibri,sans-serif;font-size:7.5pt;
                  color:#8A94A0;padding:0 20mm;display:flex;
                  justify-content:space-between;">
        <span>${nome}</span>
        <span>página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>`,
  })

  /* Uma imagem de cada página, para eu conferir com os olhos antes de
     mandar. Foi olhando que apareceram os dois defeitos anteriores — o
     texto estava íntegro nas duas vezes, o layout é que não. */
  if (comPreview) {
    const pasta = path.join(PASTA, 'preview')
    fs.mkdirSync(pasta, { recursive: true })

    // Aplica as margens do papel no preview: sem isso eu conferia um
    // layout diferente do que sai no PDF.
    await pagina.addStyleTag({
      content: 'body { padding: 22mm 20mm 20mm 20mm; background: #FFF; }',
    })
    await pagina.setViewportSize({ width: 794, height: 1123 })
    const altura = await pagina.evaluate(() => document.body.scrollHeight)
    const paginas = Math.ceil(altura / 1123)

    for (let i = 0; i < Math.min(paginas, 12); i++) {
      await pagina.evaluate((y) => window.scrollTo(0, y), i * 1123)
      await pagina.waitForTimeout(120)
      await pagina.screenshot({
        path: path.join(pasta, `${nome} - p${String(i + 1).padStart(2, '0')}.png`),
      })
    }
    console.log(`  ${paginas} página(s) fotografadas`)
  }

  await pagina.close()

  const tamanho = Math.round(fs.statSync(destino).size / 1024)
  console.log(`  ${nome}.pdf — ${tamanho} KB`)
}

const DOCUMENTOS = [
  ['contrato-vivian.md', 'Contrato - Vivian Quintella Fernandes', PASTA],
  ['docs/quanto-custa-a-loja.md', 'Quanto custa a sua loja'],
  ['docs/como-vai-funcionar-de-verdade.md', 'Como a loja vai funcionar'],
  ['docs/hospedagem-e-banco-explicado.md', 'Hospedagem e banco de dados'],
  ['docs/a-planilha-do-catalogo.md', 'Como voce vai cadastrar seus produtos'],
  ['docs/entrega-do-material-digital.md', 'Como entregar o material digital'],
  ['docs/o-elo7-fechou.md', 'O Elo7 fechou - o que muda'],
  ['docs/o-cnpj-e-o-cnae.md', 'O CNPJ e o CNAE - o que verificar'],
]

;(async () => {
  const navegador = await chromium.launch()

  const [arg1, arg2] = process.argv.slice(2)

  if (arg1 === '--todos') {
    console.log('Gerando os documentos:')
    for (const [origem, nome, base] of DOCUMENTOS) {
      const caminho = base ? path.join(base, origem) : path.join(__dirname, '..', origem)
      if (!fs.existsSync(caminho)) {
        console.log(`  (pulado, não existe: ${origem})`)
        continue
      }
      await gerar(navegador, caminho, nome, { comPreview: nome.startsWith('Contrato') })
    }
  } else if (arg1) {
    const caminho = path.isAbsolute(arg1) ? arg1 : path.join(process.cwd(), arg1)
    await gerar(navegador, caminho, arg2 || path.basename(arg1, '.md'), { comPreview: true })
  } else {
    console.log('uso: node scripts/gerar-pdf.cjs <arquivo.md> "<nome>"   |   --todos')
  }

  await navegador.close()
})()
