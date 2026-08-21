/**
 * Verifica os links do site publicado.
 *
 *     node scripts/verificar-links.cjs
 *
 * Percorre as páginas a partir da raiz, coleta todo href interno e testa
 * cada um. Reporta o que não responde 200 e de qual página veio.
 *
 * Existe porque link quebrado não aparece em teste nem em build: o site
 * publica normalmente e só quem clica descobre. Rodar isto depois de cada
 * publicação custa segundos.
 */
/* Aceita endereço por argumento ou ambiente para poder rodar contra o
   servidor local, que é o mesmo artefato que vai ao ar. Antes daqui só
   apontava para o site publicado, e conferir links de uma versão que
   ainda não subiu era impossível. */
const BASE = (process.argv[2] || process.env.BASE_DA_LOJA || 'https://feitoparavocepapelaria.com.br')
  .replace(/\/$/, '')
const INICIOS = ['/']

const visitadas = new Set()
const problemas = []
const fila = [...INICIOS.map((u) => ({ url: u, veioDe: '(início)' }))]

const ehInterno = (href) =>
  href.startsWith('/') ||
  (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:'))

const absolutizar = (href, de) => {
  if (href.startsWith('/')) return href
  return new URL(href, BASE + de).pathname
}

;(async () => {
  while (fila.length) {
    const { url, veioDe } = fila.shift()
    if (visitadas.has(url)) continue
    visitadas.add(url)

    let resposta
    try {
      resposta = await fetch(BASE + url)
    } catch (e) {
      problemas.push({ url, veioDe, status: 'erro de rede' })
      continue
    }

    if (!resposta.ok) {
      problemas.push({ url, veioDe, status: resposta.status })
      continue
    }

    const html = await resposta.text()
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])

    for (const href of hrefs) {
      if (!ehInterno(href)) continue
      if (href.endsWith('.css') || href.endsWith('.ico') || href.endsWith('.png')) continue
      const alvo = absolutizar(href, url)
      if (!alvo.startsWith('/')) continue
      if (!visitadas.has(alvo)) fila.push({ url: alvo, veioDe: url })
    }
  }

  console.log('paginas verificadas:', visitadas.size)
  console.log('')

  if (problemas.length === 0) {
    console.log('todos os links respondem')
  } else {
    console.log('PROBLEMAS:')
    for (const p of problemas) console.log(`  ${p.status}  ${p.url}   (link em ${p.veioDe})`)
  }
})()
