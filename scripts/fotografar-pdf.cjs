/**
 * Fotografar as páginas do PDF que realmente saiu.
 *
 * A conferência anterior era falsa: eu tirava print da página HTML rolando
 * de 1123 em 1123 pixels, o que ignora as quebras de página do CSS. O
 * layout que eu olhava não era o layout do PDF — e é justamente na quebra
 * que o contrato estraga (assinatura rachada, anexo grudado no fim da
 * folha anterior).
 *
 * Aqui o PDF é aberto de verdade, com o pdf.js dentro do próprio Chromium,
 * e cada página vira uma imagem. O que eu vejo é o que a Vivian recebe.
 *
 *   node scripts/fotografar-pdf.cjs "caminho/do/arquivo.pdf"
 *
 * Sem argumento, fotografa todos os PDFs da pasta de entrega.
 */

const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')
const { chromium } = require('../loja/node_modules/playwright')

const PASTA = path.join(
  process.env.USERPROFILE || process.env.HOME,
  'Documents',
  'vivian-contrato',
)

const PDFJS = path.join(
  __dirname,
  '..',
  'loja',
  'node_modules',
  'pdfjs-dist',
  'build',
)

const urlDe = (p) => pathToFileURL(p).href

async function fotografar(navegador, caminhoPdf) {
  const nome = path.basename(caminhoPdf, '.pdf')
  const pasta = path.join(path.dirname(caminhoPdf), 'preview')
  fs.mkdirSync(pasta, { recursive: true })

  const pagina = await navegador.newPage()
  // A página precisa morar em file://, ao lado do pdf.js, para poder
  // importá-lo como módulo: `setContent` roda em about:blank e o import
  // de arquivo local é recusado por segurança.
  const anfitria = path.join(PDFJS, 'conferencia.html')
  fs.writeFileSync(anfitria, '<!doctype html><body style="margin:0"></body>')
  await pagina.goto(urlDe(anfitria))

  const base64 = fs.readFileSync(caminhoPdf).toString('base64')

  const imagens = await pagina.evaluate(
    async ({ base64, libUrl, workerUrl }) => {
      const pdfjs = await import(libUrl)
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const doc = await pdfjs.getDocument({ data: bytes }).promise

      const saida = []
      for (let n = 1; n <= doc.numPages; n++) {
        const p = await doc.getPage(n)
        // 1.5 dá uns 1240 px de largura numa A4: dá para ler o texto na
        // imagem sem gerar arquivo gigante.
        const viewport = p.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await p.render({ canvasContext: ctx, viewport, canvas }).promise
        saida.push(canvas.toDataURL('image/png'))
      }
      return saida
    },
    {
      base64,
      libUrl: urlDe(path.join(PDFJS, 'pdf.mjs')),
      workerUrl: urlDe(path.join(PDFJS, 'pdf.worker.mjs')),
    },
  )

  // Só apaga os prints antigos deste documento depois que os novos
  // existem: preview desatualizado engana mais do que preview ausente.
  for (const antigo of fs.readdirSync(pasta)) {
    if (antigo.startsWith(`${nome} - p`)) fs.rmSync(path.join(pasta, antigo))
  }

  imagens.forEach((dataUrl, i) => {
    const arquivo = path.join(pasta, `${nome} - p${String(i + 1).padStart(2, '0')}.png`)
    fs.writeFileSync(arquivo, Buffer.from(dataUrl.split(',')[1], 'base64'))
  })

  await pagina.close()
  console.log(`  ${nome}: ${imagens.length} página(s)`)
  return imagens.length
}

async function principal() {
  const alvo = process.argv[2]
  const lista = alvo
    ? [path.resolve(alvo)]
    : fs
        .readdirSync(PASTA)
        .filter((f) => f.endsWith('.pdf'))
        .map((f) => path.join(PASTA, f))

  // Sem esta permissão o Chrome recusa importar o pdf.js de file://:
  // módulo carregado de arquivo local cai em origem "null".
  const navegador = await chromium.launch({
    args: ['--allow-file-access-from-files'],
  })
  try {
    for (const pdf of lista) await fotografar(navegador, pdf)
  } finally {
    await navegador.close()
  }
}

module.exports = { fotografar, ARGS_DO_NAVEGADOR: ['--allow-file-access-from-files'] }

// Só roda sozinho quando chamado direto pela linha de comando; quando o
// gerar-pdf.cjs importa, ele reaproveita o navegador que já tem aberto.
if (require.main === module) {
  principal().catch((erro) => {
    console.error(erro)
    process.exit(1)
  })
}
