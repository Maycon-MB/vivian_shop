/**
 * Serve o site montado como o GitHub Pages serve.
 *
 *     node scripts/servir.cjs [porta]
 *
 * A diferença que importa é a compressão. Um servidor estático simples
 * entrega o CSS e o JavaScript crus; o GitHub Pages entrega comprimidos.
 * Medindo sem compressão, o Bootstrap parece pesar 225 KB quando na
 * prática trafega perto de 30 KB — e a conclusão vira "preciso arrancar o
 * Bootstrap", que é uma reforma enorme baseada num número errado.
 *
 * Serve no mesmo caminho que a publicação usa, para os testes não passarem
 * localmente e quebrarem no ar por causa de caminho diferente. Com
 * `DOMINIO_PRONTO=true` é a raiz; sem, é /vivian_shop.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const PORTA = Number(process.argv[2]) || 4173
const RAIZ = path.join(__dirname, '..', 'dist')
const PREFIXO = process.env.DOMINIO_PRONTO === 'true' ? '' : '/vivian_shop'

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  /* O sitemap. Sem esta linha ele sai como octet-stream, e a conferência
     local passa enquanto o Google recusa o arquivo no ar. */
  '.xml': 'application/xml; charset=utf-8',
}

/* Imagem e fonte já vêm comprimidas no próprio formato: passá-las pelo gzip
   gasta processador e às vezes aumenta o arquivo. */
const COMPRIMIVEIS = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml'])

const servidor = http.createServer((req, res) => {
  let caminho = decodeURIComponent(req.url.split('?')[0])

  if (caminho.startsWith(PREFIXO)) caminho = caminho.slice(PREFIXO.length)
  if (caminho === '' || caminho.endsWith('/')) caminho += 'index.html'

  // Nada de sair da pasta publicada por caminho relativo.
  const arquivo = path.join(RAIZ, path.normalize(caminho).replace(/^(\.\.[/\\])+/, ''))

  fs.readFile(arquivo, (erro, conteudo) => {
    if (erro) {
      const naoAchou = path.join(RAIZ, '404.html')
      if (fs.existsSync(naoAchou)) {
        res.writeHead(404, { 'content-type': TIPOS['.html'] })
        res.end(fs.readFileSync(naoAchou))
      } else {
        res.writeHead(404, { 'content-type': 'text/plain' })
        res.end('não encontrado')
      }
      return
    }

    const extensao = path.extname(arquivo).toLowerCase()
    const cabecalhos = { 'content-type': TIPOS[extensao] ?? 'application/octet-stream' }

    const aceita = String(req.headers['accept-encoding'] ?? '')

    if (COMPRIMIVEIS.has(extensao) && aceita.includes('gzip')) {
      const comprimido = zlib.gzipSync(conteudo)
      cabecalhos['content-encoding'] = 'gzip'
      cabecalhos['content-length'] = comprimido.length
      res.writeHead(200, cabecalhos)
      res.end(comprimido)
      return
    }

    cabecalhos['content-length'] = conteudo.length
    res.writeHead(200, cabecalhos)
    res.end(conteudo)
  })
})

servidor.listen(PORTA, '127.0.0.1', () => {
  console.log(`servindo dist/ em http://127.0.0.1:${PORTA}${PREFIXO}/ (com gzip)`)
})
