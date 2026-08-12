/**
 * Testa a loja como quem usa, não como quem lê o código.
 *
 *     node scripts/testar-navegacao.cjs [endereço]
 *
 * Abre um navegador de verdade, clica, digita e confere o que aparece.
 * Sem servidor informado, testa o site publicado.
 *
 * Existe porque teste de unidade não pega o que quebra na tela: link que
 * leva ao lugar errado, botão que não faz nada, erro que só aparece no
 * console do navegador. Tudo isso publica sem reclamar.
 */

const path = require('path')
const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))

const BASE = process.argv[2] || 'https://maycon-mb.github.io/vivian_shop'

const resultados = []
const ok = (nome) => resultados.push({ nome, passou: true })
const falha = (nome, detalhe) => resultados.push({ nome, passou: false, detalhe })

const conferir = async (nome, fn) => {
  try {
    await fn()
    ok(nome)
  } catch (erro) {
    falha(nome, erro.message)
  }
}

;(async () => {
  const navegador = await chromium.launch()
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } })

  // Erro no console é defeito, mesmo que a tela pareça certa.
  const errosConsole = []
  pagina.on('console', (m) => {
    if (m.type() === 'error') errosConsole.push(m.text())
  })
  pagina.on('pageerror', (e) => errosConsole.push(e.message))

  await conferir('a loja abre e mostra o nome certo', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    const titulo = await pagina.locator('h1').first().textContent()
    if (!titulo.includes('acolhe') && !titulo.includes('Feito')) {
      throw new Error(`título inesperado: ${titulo}`)
    }
  })

  await conferir('o catálogo mostra os seis produtos', async () => {
    const cartoes = await pagina.locator('.premium-card').count()
    if (cartoes !== 6) throw new Error(`esperava 6 produtos, achei ${cartoes}`)
  })

  await conferir('o filtro por linha reduz a lista', async () => {
    await pagina.getByRole('button', { name: 'Papelaria pedagógica', exact: true }).first().click()
    await pagina.waitForTimeout(600)
    const cartoes = await pagina.locator('.premium-card').count()
    if (cartoes !== 3) throw new Error(`esperava 3 na linha pedagógica, achei ${cartoes}`)
  })

  await conferir('o card leva à página do produto', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagina.locator('a[href*="/produto/"]').first().click()
    await pagina.waitForURL('**/produto/**')
  })

  await conferir('a página do produto mostra o mínimo e o total certos', async () => {
    await pagina.goto(`${BASE}/produto/caderno-personalizado/`, { waitUntil: 'networkidle' })
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Mínimo de 10')) throw new Error('não avisa o mínimo de 10')
    // R$ 32,00 x 10 = R$ 320,00
    if (!corpo.includes('320,00')) throw new Error('o botão não mostra o total do pacote')
  })

  await conferir('a quantidade não desce abaixo do mínimo', async () => {
    const menos = pagina.getByRole('button', { name: 'Diminuir' })
    if (!(await menos.isDisabled())) throw new Error('dá para descer abaixo de 10')
  })

  await conferir('aumentar a quantidade recalcula o total', async () => {
    await pagina.getByRole('button', { name: 'Aumentar' }).click()
    await pagina.waitForTimeout(300)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('352,00')) throw new Error('11 unidades deveriam somar R$ 352,00')
  })

  await conferir('o produto digital não fala de frete nem de produção', async () => {
    await pagina.goto(`${BASE}/produto/jogo-das-emocoes/`, { waitUntil: 'networkidle' })
    const corpo = await pagina.locator('body').textContent()
    if (corpo.includes('dias úteis')) throw new Error('material digital não tem prazo de produção')
    if (corpo.includes('Mínimo de 10')) throw new Error('material digital não tem mínimo')
  })

  await conferir('o carrinho impede misturar as duas linhas', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    // Um personalizado e depois um digital: o segundo tem que ser barrado.
    await pagina.locator('.premium-card').first().getByRole('button', { name: /Comprar/i }).click()
    await pagina.waitForTimeout(400)
    await pagina.locator('.premium-card').nth(3).getByRole('button', { name: /Comprar/i }).click()
    await pagina.waitForTimeout(600)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('compras separadas')) throw new Error('deixou misturar as linhas')
  })

  await conferir('o painel abre e mostra os números', async () => {
    await pagina.goto(`${BASE}/painel/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(1800)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Bem-vinda')) throw new Error('painel não abriu')
    if (corpo.includes('R$ 0,00')) throw new Error('os números pararam em zero')
  })

  await conferir('o menu do painel troca de aba', async () => {
    await pagina.getByRole('button', { name: 'Pedidos', exact: true }).click()
    await pagina.waitForTimeout(700)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Precisa de você')) throw new Error('não chegou em Pedidos')
  })

  await conferir('o endereço guarda a aba aberta', async () => {
    const url = pagina.url()
    if (!url.includes('aba=pedidos')) throw new Error(`endereço não acompanhou: ${url}`)
  })

  await conferir('o filtro de pedidos muda a lista', async () => {
    await pagina.getByRole('button', { name: /^Todos/ }).click()
    await pagina.waitForTimeout(500)
    const itens = await pagina.locator('.pedido').count()
    if (itens !== 7) throw new Error(`esperava 7 pedidos em Todos, achei ${itens}`)
  })

  await conferir('a busca de pedidos filtra', async () => {
    await pagina.getByLabel('Buscar pedido').fill('caneca')
    await pagina.waitForTimeout(500)
    const itens = await pagina.locator('.pedido').count()
    if (itens !== 1) throw new Error(`busca por "caneca" devia achar 1, achou ${itens}`)
  })

  await conferir('a barra lateral recolhe', async () => {
    await pagina.getByRole('button', { name: 'Recolher menu' }).click()
    await pagina.waitForTimeout(500)
    const recolhida = await pagina.locator('.sidebar-nav.recolhida').count()
    if (recolhida !== 1) throw new Error('a barra não recolheu')
  })

  await conferir('as outras telas abrem', async () => {
    for (const rota of ['como-funciona', 'andamento', 'identidade']) {
      const r = await pagina.goto(`${BASE}/${rota}/`, { waitUntil: 'networkidle' })
      if (!r.ok()) throw new Error(`${rota} respondeu ${r.status()}`)
    }
  })

  await conferir('o carrinho sobrevive à troca de página', async () => {
    await pagina.goto(`${BASE}/produto/caderno-personalizado/`, { waitUntil: 'networkidle' })
    // O carrinho é guardado no navegador e sobrevive entre as verificações:
    // sem limpar, o total testado aqui carrega o que os testes anteriores
    // deixaram lá.
    await pagina.evaluate(() => window.localStorage.clear())
    await pagina.reload({ waitUntil: 'networkidle' })
    await pagina.getByRole('button', { name: /Adicionar/ }).click()
    await pagina.waitForTimeout(700)
    await pagina.goto(`${BASE}/checkout/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(900)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Caderno personalizado')) throw new Error('o carrinho esvaziou ao mudar de página')
    if (!corpo.includes('320,00')) throw new Error('o valor não chegou ao checkout')
  })

  await conferir('o checkout não deixa pagar sem escolher o frete', async () => {
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Escolha o frete')) throw new Error('deixaria pagar sem frete')
  })

  await conferir('o total soma frete e desconto sem dar NaN', async () => {
    await pagina.locator('input[placeholder="00000-000"]').fill('01310100')
    await pagina.waitForTimeout(700)
    await pagina.getByText('Correios SEDEX').click()
    await pagina.waitForTimeout(500)
    const corpo = await pagina.locator('body').textContent()
    if (corpo.includes('NaN')) throw new Error('o total apareceu como NaN')
    // 320 + 46,50 = 366,50, menos 5% do Pix = 348,18
    if (!corpo.includes('348,18')) throw new Error('a conta do total está errada')
  })

  await conferir('a confirmação explica o que acontece depois', async () => {
    await pagina.goto(`${BASE}/pedido-confirmado/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(900)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Pagamento aprovado')) throw new Error('não confirmou')
    if (!corpo.includes('dias úteis')) throw new Error('não diz o prazo de produção')
  })

  await conferir('endereço antigo redireciona para o novo', async () => {
    await pagina.goto(`${BASE}/loja/painel/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(900)
    if (!pagina.url().includes('/painel')) throw new Error(`ficou em ${pagina.url()}`)
    if (pagina.url().includes('/loja/')) throw new Error('não saiu do endereço antigo')
  })

  await navegador.close()

  // ── Resultado ──
  const passaram = resultados.filter((r) => r.passou).length
  console.log('')
  for (const r of resultados) {
    console.log(`${r.passou ? '  ok  ' : 'FALHOU'}  ${r.nome}`)
    if (!r.passou) console.log(`          ${r.detalhe}`)
  }

  console.log(`\n${passaram}/${resultados.length} passaram`)

  const errosReais = errosConsole.filter((e) => !e.includes('favicon'))
  if (errosReais.length) {
    console.log(`\nErros no console do navegador (${errosReais.length}):`)
    errosReais.slice(0, 5).forEach((e) => console.log('  ' + e.slice(0, 140)))
  } else {
    console.log('\nNenhum erro no console do navegador.')
  }

  process.exit(passaram === resultados.length ? 0 : 1)
})()
