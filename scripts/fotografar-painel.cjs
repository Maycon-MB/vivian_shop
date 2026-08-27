/**
 * Tira print das telas da área da Vivian, sem precisar da senha dela.
 *
 *     node scripts/fotografar-painel.cjs [http://127.0.0.1:3000]
 *
 * Existe porque a regra do projeto é olhar a tela, e não confiar no teste:
 * os dois piores defeitos daqui passaram por build, lint e teste de
 * unidade e só apareceram numa imagem. O menu coberto por uma faixa fixa
 * ficou dois dias no ar sem ninguém conseguir clicar.
 *
 * O painel exige login, e a senha da conta de teste vive nos segredos do
 * repositório, não nesta máquina. Em vez de pedir a senha, este script
 * põe uma sessão de mentira no navegador e responde no lugar do banco.
 * Isso não afrouxa nada: o que protege os dados são as políticas do
 * Postgres, e elas continuam intactas — aqui o banco nem chega a ser
 * consultado. O que se está conferindo é o desenho da tela.
 */

const path = require('node:path')
const fs = require('node:fs')

// Como nos outros scripts: o Playwright é dependência da loja, e não da
// raiz do repositório.
const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))

const base = process.argv[2] ?? 'http://127.0.0.1:3000'
const destino = process.argv[3] ?? path.join(process.env.TEMP ?? '/tmp', 'prints-painel')

const REF = 'kbvgdnrymwfavgkxqvjh'

const DONA = { id: '00000000-0000-4000-8000-000000000001', nome: 'Vivian' }

const TEMAS = [
  { id: 'tema-1', nome: 'Peppa Pig' },
  { id: 'tema-2', nome: 'Lilo e Stitch' },
  { id: 'tema-3', nome: 'Chaves' },
]

const PRODUTOS = [
  {
    id: 'p-1', slug: 'lousa-magica-peppa-pig', nome: 'Lousa Mágica - Peppa Pig',
    descricao: 'Lousa mágica com caneta presa por cordão.',
    preco_reais: '13.70', preco_promocional_reais: null, linha: 'personalizada',
    tema_id: 'tema-1', minimo: 10, prazo_producao: 5,
    peso_g: 900, alt_cm: '5.00', larg_cm: '22.00', comp_cm: '30.00',
    pasta_drive: null, ativo: true, posicao: -1, imagem_mini: null, temas: { nome: 'Peppa Pig' },
  },
  {
    id: 'p-2', slug: 'lousa-magica-chaves', nome: 'Lousa Mágica - Chaves',
    descricao: '', preco_reais: '13.70', preco_promocional_reais: null,
    linha: 'personalizada', tema_id: 'tema-3', minimo: 10, prazo_producao: 5,
    peso_g: null, alt_cm: null, larg_cm: null, comp_cm: null,
    pasta_drive: null, ativo: false, posicao: 0, imagem_mini: null, temas: { nome: 'Chaves' },
  },
  {
    id: 'p-3', slug: 'album-de-figurinhas-lilo-e-stitch', nome: 'Álbum de Figurinhas - Lilo e Stitch',
    descricao: '', preco_reais: '15.90', preco_promocional_reais: '12.90',
    linha: 'personalizada', tema_id: 'tema-2', minimo: 10, prazo_producao: 5,
    peso_g: 1200, alt_cm: '3.00', larg_cm: '21.00', comp_cm: '30.00',
    pasta_drive: null, ativo: true, posicao: 0, imagem_mini: null, temas: { nome: 'Lilo e Stitch' },
  },
]

const CONVERSAS = [
  {
    id: 'c-1',
    nome: 'Ana',
    email: 'ana@exemplo.com',
    respondida_em: null,
    atualizado_em: '2026-08-25T12:40:00Z',
    mensagens: [
      {
        quem: 'cliente',
        texto: 'Oi! Preciso de 20 lousas da Peppa para o dia 6 de setembro. Dá tempo?',
        criado_em: '2026-08-25T12:40:00Z',
      },
    ],
  },
  {
    id: 'c-2',
    nome: 'Beatriz',
    email: 'beatriz@exemplo.com',
    respondida_em: '2026-08-24T18:10:00Z',
    atualizado_em: '2026-08-24T18:10:00Z',
    mensagens: [
      {
        quem: 'cliente',
        texto: 'Dá para trocar a cor da capa para azul?',
        criado_em: '2026-08-24T17:02:00Z',
      },
      {
        quem: 'loja',
        texto: 'Dá sim! Me diz o tom e eu mando a prévia antes de produzir.',
        criado_em: '2026-08-24T18:10:00Z',
      },
    ],
  },
]

const json = (corpo) => ({
  status: 200,
  contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' },
  body: JSON.stringify(corpo),
})

/* Números de mentira, no tamanho que os de verdade vão ter: é o que
   revela texto espremido e coluna que quebra. */
const VISITAS_POR_DIA = [
  { dia: '2026-08-27', visitantes: 84, paginas: 213 },
  { dia: '2026-08-26', visitantes: 121, paginas: 349 },
  { dia: '2026-08-25', visitantes: 67, paginas: 158 },
]

const VISITAS_POR_ORIGEM = [
  { origem: 'instagram', visitantes: 148, paginas: 402 },
  { origem: 'direto', visitantes: 71, paginas: 190 },
  { origem: 'anuncio', visitantes: 39, paginas: 96 },
  { origem: 'google', visitantes: 14, paginas: 32 },
]

const PAGINAS_MAIS_VISTAS = [
  { caminho: '/', paginas: 233 },
  { caminho: '/produtos', paginas: 141 },
  { caminho: '/produto/lousa-magica-lilo-e-stitch', paginas: 88 },
  { caminho: '/produto/bloquinho-personalizado-peppa-pig', paginas: 54 },
]

const main = async () => {
  fs.mkdirSync(destino, { recursive: true })

  const navegador = await chromium.launch()
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } })

  await contexto.route('**/rest/v1/**', (rota) => {
    const url = rota.request().url()

    if (url.includes('/donas_da_loja')) return rota.fulfill(json([DONA]))

    /* O bloco de visitas do relatório. Sem estas três respostas ele
       aparece vazio no print, e um bloco vazio esconde exatamente o que
       este script existe para conferir: se os números cabem na tela do
       celular dela. */
    if (url.includes('/rpc/resumo_de_visitas')) return rota.fulfill(json(VISITAS_POR_DIA))
    if (url.includes('/rpc/visitas_por_origem')) return rota.fulfill(json(VISITAS_POR_ORIGEM))
    if (url.includes('/rpc/paginas_mais_vistas')) return rota.fulfill(json(PAGINAS_MAIS_VISTAS))
    if (url.includes('/temas')) return rota.fulfill(json(TEMAS))
    if (url.includes('/conversas')) return rota.fulfill(json(CONVERSAS))

    if (url.includes('/produtos')) {
      // `single()` pede um objeto, e não uma lista.
      const um = rota.request().headers().accept?.includes('vnd.pgrst.object')
      return rota.fulfill(json(um ? PRODUTOS[0] : PRODUTOS))
    }

    return rota.fulfill(json([]))
  })

  // O `/auth/v1` só é procurado para renovar a sessão. Como ela é de
  // mentira, responder aqui evita o painel expulsar no meio do print.
  await contexto.route('**/auth/v1/**', (rota) => rota.fulfill(json({})))

  const daquiUmAno = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365

  /* O Supabase decodifica o token para saber quem é e quando expira, e
     não aceita um texto qualquer no lugar. A assinatura não é conferida
     no navegador — quem confere é o Postgres, que aqui nem é chamado. */
  const base64url = (objeto) =>
    Buffer.from(JSON.stringify(objeto))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  const token = [
    base64url({ alg: 'HS256', typ: 'JWT' }),
    base64url({
      sub: DONA.id,
      email: 'print@exemplo.com',
      aud: 'authenticated',
      role: 'authenticated',
      exp: daquiUmAno,
      iat: Math.floor(Date.now() / 1000),
    }),
    'assinatura-de-mentira',
  ].join('.')

  await contexto.addInitScript(
    ([ref, dona, expira, jwt]) => {
      const sessao = {
        access_token: jwt,
        token_type: 'bearer',
        expires_at: expira,
        expires_in: 60 * 60 * 24 * 365,
        refresh_token: 'print',
        user: {
          id: dona.id,
          email: 'print@exemplo.com',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        },
      }

      const chave = `sb-${ref}-auth-token`
      window.localStorage.setItem(chave, JSON.stringify(sessao))
    },
    [REF, DONA, daquiUmAno, token],
  )

  const pagina = await contexto.newPage()
  const problemas = []
  pagina.on('pageerror', (e) => problemas.push(String(e)))

  const tirar = async (nome, largura) => {
    await pagina.setViewportSize({ width: largura, height: 900 })
    await pagina.waitForTimeout(600)
    const arquivo = path.join(destino, `${nome}.png`)
    await pagina.screenshot({ path: arquivo, fullPage: true })
    console.log(arquivo)
  }

  await pagina.goto(`${base}/admin/?aba=catalogo`, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1200)

  await tirar('catalogo-computador', 1280)
  await tirar('catalogo-celular', 390)

  await pagina.setViewportSize({ width: 1280, height: 900 })
  await pagina.getByRole('button', { name: /cadastrar produto/i }).first().click()
  await pagina.waitForTimeout(700)

  await tirar('cadastrar-computador', 1280)
  await tirar('cadastrar-celular', 390)

  // Publicar sem as medidas: é o aviso que ela vai encontrar de verdade.
  await pagina.setViewportSize({ width: 1280, height: 900 })
  await pagina.getByLabel(/nome do produto/i).fill('Caderno - Peppa Pig')
  await pagina.getByLabel(/deixar no ar/i).check()
  await pagina.getByRole('button', { name: /salvar produto/i }).click()
  await pagina.waitForTimeout(500)
  await tirar('cadastrar-faltando', 1280)

  await pagina.goto(`${base}/admin/?aba=catalogo`, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1200)
  await pagina.getByRole('button', { name: /editar/i }).first().click()
  await pagina.waitForTimeout(900)
  await tirar('editar-computador', 1280)
  await tirar('editar-celular', 390)

  await pagina.goto(`${base}/admin/?aba=mensagens`, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1400)
  await tirar('mensagens-computador', 1280)
  await tirar('mensagens-celular', 390)

  await pagina.goto(`${base}/admin/?aba=recebo`, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1400)
  await tirar('recebo-computador', 1280)

  await pagina.goto(`${base}/admin/?aba=relatorios`, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1400)
  await tirar('relatorios-computador', 1280)
  await tirar('relatorios-celular', 390)



  await navegador.close()

  if (problemas.length) {
    console.log('\nerros de JavaScript na página:')
    problemas.forEach((p) => console.log(`  ${p}`))
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
