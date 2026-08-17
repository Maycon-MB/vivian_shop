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

const fs = require('fs')
const path = require('path')
const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))

/* Sem endereço informado, testa o site publicado. Na automação do GitHub
   não há site publicado ainda — o que se testa lá é o site recém-montado,
   servido na própria máquina, e o endereço chega por BASE_DA_LOJA. */
const BASE = process.argv[2] || process.env.BASE_DA_LOJA || 'https://maycon-mb.github.io/vivian_shop'

/* Onde a tela do momento da falha é guardada. Mensagem de erro raramente
   basta para entender o que quebrou; a imagem quase sempre basta. */
const PASTA_DAS_FALHAS = path.join(__dirname, '..', 'loja', 'telas-da-falha')

let paginaAtual = null

const resultados = []
const ok = (nome) => resultados.push({ nome, passou: true })
const falha = (nome, detalhe) => resultados.push({ nome, passou: false, detalhe })

const conferir = async (nome, fn) => {
  try {
    await fn()
    ok(nome)
  } catch (erro) {
    falha(nome, erro.message)

    try {
      if (paginaAtual) {
        fs.mkdirSync(PASTA_DAS_FALHAS, { recursive: true })
        const arquivo = nome.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
        await paginaAtual.screenshot({
          path: path.join(PASTA_DAS_FALHAS, `${arquivo}.png`),
          fullPage: true,
        })
      }
    } catch {
      // Não conseguir fotografar a falha não pode virar uma segunda falha.
    }
  }
}

;(async () => {
  const navegador = await chromium.launch()
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } })
  paginaAtual = pagina

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

  await conferir('o catálogo mostra os produtos', async () => {
    const cartoes = await pagina.locator('.premium-card').count()
    if (cartoes < 6) throw new Error(`esperava vários produtos, achei ${cartoes}`)
  })

  await conferir('o filtro por linha reduz a lista', async () => {
    const antes = await pagina.locator('.premium-card').count()

    await pagina.getByRole('button', { name: 'Papelaria pedagógica', exact: true }).first().click()
    await pagina.waitForTimeout(600)
    const depois = await pagina.locator('.premium-card').count()

    // A conta exata mudaria a cada produto que a Vivian cadastrasse. O que
    // precisa continuar valendo é que filtrar tira coisa da tela.
    if (depois >= antes) throw new Error(`o filtro não reduziu: ${antes} antes, ${depois} depois`)
    if (depois === 0) throw new Error('o filtro escondeu tudo')
  })

  await conferir('os temas levam para a página do tema', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })

    // É assim que a cliente dela procura: pelo tema da festa, não pelo
    // tipo do produto. Era o funcionamento da loja no Elo7.
    const temas = await pagina.locator('.temas-lista a').count()
    if (temas === 0) throw new Error('a vitrine não mostra tema nenhum')

    await pagina.locator('.temas-lista a').first().click()
    await pagina.waitForURL('**/tema/**', { timeout: 15000 })

    const produtos = await pagina.locator('.tema-produtos li').count()
    if (produtos === 0) throw new Error('o tema abriu sem produto')
  })

  await conferir('o card leva à página do produto', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagina.locator('a[href*="/produto/"]').first().click()
    await pagina.waitForURL('**/produto/**')
  })

  await conferir('a página do produto mostra o mínimo e o total certos', async () => {
    await pagina.goto(`${BASE}/produto/caneca-personalizada/`, { waitUntil: 'networkidle' })
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Mínimo de 10')) throw new Error('não avisa o mínimo de 10')
    // A caneca sai por R$ 29,90 cada, e o mínimo são 10: R$ 299,00 o pacote.
    if (!corpo.includes('299,00')) throw new Error('o botão não mostra o total do pacote')
  })

  await conferir('a quantidade não desce abaixo do mínimo', async () => {
    const menos = pagina.getByRole('button', { name: 'Diminuir' })
    if (!(await menos.isDisabled())) throw new Error('dá para descer abaixo de 10')
  })

  await conferir('aumentar a quantidade recalcula o total', async () => {
    await pagina.getByRole('button', { name: 'Aumentar' }).click()
    await pagina.waitForTimeout(300)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('328,90')) throw new Error('11 unidades deveriam somar R$ 328,90')
  })

  await conferir('o produto digital não fala de frete nem de produção', async () => {
    await pagina.goto(`${BASE}/produto/primeiras-descobertas-cores/`, { waitUntil: 'networkidle' })
    const corpo = await pagina.locator('body').textContent()
    if (corpo.includes('dias úteis')) throw new Error('material digital não tem prazo de produção')
    if (corpo.includes('Mínimo de 10')) throw new Error('material digital não tem mínimo')
  })

  await conferir('o carrinho impede misturar as duas linhas', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    // Um personalizado e depois um digital: o segundo tem que ser barrado.
    await pagina.locator('.premium-card').first().getByRole('button', { name: /Comprar/i }).click()
    await pagina.waitForTimeout(400)

    await pagina.getByRole('button', { name: 'Papelaria pedagógica', exact: true }).first().click()
    await pagina.waitForTimeout(600)
    await pagina.locator('.premium-card').first().getByRole('button', { name: /Comprar/i }).click()
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
    await pagina.goto(`${BASE}/produto/caneca-personalizada/`, { waitUntil: 'networkidle' })
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
    if (!corpo.includes('Caneca personalizada')) throw new Error('o carrinho esvaziou ao mudar de página')
    // 10 canecas a R$ 29,90.
    if (!corpo.includes('299,00')) throw new Error('o valor não chegou ao checkout')
  })

  await conferir('a loja avisa que ainda é demonstração', async () => {
    // Enquanto o pagamento não é real, este aviso é o que impede alguém de
    // completar uma compra e ficar esperando um pacote que ninguém postou.
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('nenhuma cobrança é feita')) {
      throw new Error('o checkout não avisa que nada é cobrado')
    }
  })

  await conferir('o checkout cobra os dados antes de deixar pagar', async () => {
    await pagina.getByRole('button', { name: /^Pagar$/ }).click()
    await pagina.waitForTimeout(600)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('nome e sobrenome')) throw new Error('deixaria pagar sem nome')
    if (!corpo.includes('8 números')) throw new Error('deixaria pagar sem CEP')
  })

  await conferir('o total soma frete e desconto sem dar NaN', async () => {
    await pagina.fill('#campo-nome', 'Ana Paula Souza')
    await pagina.fill('#campo-email', 'ana@exemplo.com.br')
    await pagina.fill('#campo-whatsapp', '(21) 98888-7777')
    await pagina.fill('#campo-cep', '01310100')
    // A cotação é assíncrona: espera as opções aparecerem, não um tempo fixo.
    await pagina.locator('.frete').first().waitFor({ timeout: 15000 })
    await pagina.getByText('Correios SEDEX').click()
    await pagina.waitForTimeout(400)

    const corpo = await pagina.locator('body').textContent()
    if (corpo.includes('NaN')) throw new Error('o total apareceu como NaN')
    // O desconto do Pix incide só sobre os produtos, nunca sobre o frete.
    // 5% de 320 são 16,00 — dar desconto sobre o frete faria a Vivian pagar
    // a diferença do próprio bolso em cada pedido.
    const emNumero = (t) => Number(t.replace(/\./g, '').replace(',', '.'))

    const produtos = (corpo.match(/Produtos\s*R\$ ([\d.,]+)/) || [])[1]
    const desconto = (corpo.match(/− R\$ ([\d.,]+)/) || [])[1]
    if (!produtos || !desconto) throw new Error('não achei os produtos ou o desconto na tela')

    const esperadoDesconto = emNumero(produtos) * 0.05
    if (Math.abs(emNumero(desconto) - esperadoDesconto) > 0.01) {
      throw new Error(`o desconto do Pix deveria ser ${esperadoDesconto.toFixed(2)}, e está ${desconto}`)
    }

    const totalNaTela = (corpo.match(/Total\s*R\$ ([\d.,]+)/) || [])[1]
    if (!totalNaTela) throw new Error('não achei o total na tela')

    const freteNaTela = (corpo.match(/Frete\s*R\$ ([\d.,]+)/) || [])[1]
    if (!freteNaTela) throw new Error('não achei o frete na tela')

    const esperado = emNumero(produtos) - emNumero(desconto) + emNumero(freteNaTela)
    if (Math.abs(emNumero(totalNaTela) - esperado) > 0.01) {
      throw new Error(`total ${totalNaTela} não bate com ${esperado.toFixed(2)}`)
    }
  })

  await conferir('a compra cria um pedido e ele aparece no painel', async () => {
    await pagina.fill('#campo-rua', 'Avenida Paulista')
    await pagina.fill('#campo-numero', '1000')
    await pagina.getByRole('button', { name: /^Pagar$/ }).click()

    await pagina.waitForURL(/pedido-confirmado/, { timeout: 20000 })
    /* `waitForURL` volta assim que o endereço muda, e nesse instante a
       tela ainda não desenhou. Ler o texto agora pega a página em branco
       e acusa uma falha que não existe. Esperar o número do pedido é o
       sinal de que o React já montou com o pedido em mãos. */
    await pagina.locator('.confirmado-topo p').first().waitFor({ timeout: 15000 })
    const confirmacao = await pagina.locator('body').textContent()
    // O número não é fixo: cada compra feita nesta mesma sessão avança o
    // contador. O que importa é ele existir e ter os quatro dígitos.
    if (!/#\d{4}/.test(confirmacao)) throw new Error('o pedido não ganhou número')
    if (!confirmacao.includes('nada foi cobrado')) {
      throw new Error('a confirmação não avisa que é simulação')
    }
    if (!confirmacao.includes('dias úteis')) throw new Error('não diz o prazo de produção')

    await pagina.goto(`${BASE}/painel/?aba=pedidos`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(1200)
    if ((await pagina.locator('.pedido-daloja').count()) === 0) {
      throw new Error('o pedido comprado não chegou ao painel da Vivian')
    }
  })

  await conferir('os relatórios separam o que é dela do frete', async () => {
    await pagina.goto(`${BASE}/painel/?aba=relatorios`, { waitUntil: 'networkidle' })
    // Espera o bloco existir em vez de esperar um tempo fixo: a tela só
    // desenha depois de ler os pedidos guardados, e um segundo cravado
    // passa na minha máquina e falha na máquina lenta da automação.
    await pagina.locator('.relatorio-bloco').first().waitFor({ timeout: 15000 })

    const corpo = await pagina.locator('body').textContent()

    // O ponto inteiro desta tela: frete não pode aparecer como ganho dela.
    if (!corpo.includes('O que é seu')) throw new Error('não mostra a receita dela')
    if (!corpo.includes('Frete (não é seu)')) {
      throw new Error('o frete não está marcado como repasse')
    }
    if (!corpo.includes('O que produzir agora')) throw new Error('não mostra a fila de produção')
    if (!corpo.includes('Comparando com o Elo7')) throw new Error('não compara com o Elo7')

    // A taxa do Elo7 ainda é estimativa minha, e a tela precisa admitir isso
    // enquanto a Vivian não responder.
    if (!corpo.includes('chute meu')) throw new Error('apresenta a estimativa como fato')

    const baixar = pagina.getByRole('button', { name: /Baixar para o contador/ })
    if (!(await baixar.isEnabled())) throw new Error('não dá para exportar para o contador')
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
