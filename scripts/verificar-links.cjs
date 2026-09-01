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
const BASE = (
  process.argv[2] ||
  process.env.BASE_DA_LOJA ||
  (process.env.DOMINIO_PRONTO === 'true'
    ? 'https://feitoparavocepapelaria.com.br'
    : 'https://maycon-mb.github.io/vivian_shop')
).replace(/\/$/, '')
/* O robots.txt e o sitemap.xml entram na lista porque nenhuma página
   aponta para eles: o rastreador daqui nunca chegaria neles sozinho, e
   sumiriam da publicação sem nada ficar vermelho. Foi assim que
   /sitemap.xml passou meses devolvendo a página de erro. */
const INICIOS = ['/', '/robots.txt', '/sitemap.xml']

/* O pedaço de caminho que o BASE já carrega: vazio no domínio dela,
   `/vivian_shop` enquanto a loja morar no GitHub. */
const PREFIXO_DA_BASE = new URL(BASE).pathname.replace(/\/$/, '')

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

    /* O sitemap não tem `href`: os endereços dele moram em `<loc>`, e sem
       isto os 487 que ele promete ao Google nunca seriam abertos por
       ninguém aqui. Sitemap que aponta para página que não existe é pior
       do que sitemap nenhum: o Google acha o 404 antes de achar a loja. */
    const doMapa = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      m[1].replace(/&amp;/g, '&'),
    )

    for (const endereco of doMapa) {
      /* O sitemap escreve endereço absoluto e completo, como o Google
         exige. Aqui só interessa o caminho, e sem o pedaço que o próprio
         BASE já carrega: senão, com a loja sob /vivian_shop, o prefixo
         entraria duas vezes e as 487 páginas dariam 404 de mentira. */
      const caminho = endereco.startsWith('http') ? new URL(endereco).pathname : endereco
      const alvo = caminho.startsWith(PREFIXO_DA_BASE)
        ? caminho.slice(PREFIXO_DA_BASE.length) || '/'
        : caminho

      if (!visitadas.has(alvo)) fila.push({ url: alvo, veioDe: url })
    }

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
