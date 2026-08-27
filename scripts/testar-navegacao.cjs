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
const BASE =
  process.argv[2] ||
  process.env.BASE_DA_LOJA ||
  (process.env.DOMINIO_PRONTO === 'true'
    ? 'https://feitoparavocepapelaria.com.br'
    : 'https://maycon-mb.github.io/vivian_shop')

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

  /* A área da Vivian passou a exigir login em 24/08. O teste entra uma vez
     só, antes de tudo, com uma conta de teste que é dona da loja.

     Uma vez só, e no começo, por um motivo que custou caro para descobrir:
     os testes compartilham a mesma aba e continuam de onde o anterior
     parou. Entrar no meio navega para fora do que o teste anterior deixou
     na tela, e a falha aparece três testes depois, em outro lugar.

     Sem as credenciais no ambiente, as telas dela são puladas em vez de
     falharem: quem clona o repositório não tem acesso ao banco, e teste
     vermelho por falta de credencial ensina a ignorar teste vermelho. */
  const EMAIL_DE_TESTE = process.env.TESTE_DONA_EMAIL
  const SENHA_DE_TESTE = process.env.TESTE_DONA_SENHA
  const podeEntrar = Boolean(EMAIL_DE_TESTE && SENHA_DE_TESTE)

  if (podeEntrar) {
    await pagina.goto(`${BASE}/admin/entrar/`, { waitUntil: 'networkidle' })
    await pagina.getByLabel('Seu e-mail').fill(EMAIL_DE_TESTE)
    await pagina.getByLabel('Sua senha').fill(SENHA_DE_TESTE)
    await pagina.getByRole('button', { name: /entrar/i }).click()
    await pagina.waitForURL(/\/admin\/?$/, { timeout: 20000 })
  } else {
    console.log('  (pulando as telas da dona: faltam TESTE_DONA_EMAIL e TESTE_DONA_SENHA)')
  }
  paginaAtual = pagina

  // Erro no console é defeito, mesmo que a tela pareça certa.
  const errosConsole = []
  pagina.on('console', (m) => {
    if (m.type() === 'error') errosConsole.push(m.text())
  })
  pagina.on('pageerror', (e) => errosConsole.push(e.message))

  /* "Failed to load resource: 404" sozinho não diz qual endereço faltou, e
     quem cai nisso perde meia hora procurando. Aqui o endereço vai junto. */
  pagina.on('response', (r) => {
    if (r.status() >= 400) errosConsole.push(`${r.status()} em ${r.url()}`)
  })

  await conferir('a loja abre e mostra o nome certo', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    const titulo = await pagina.locator('h1').first().textContent()
    // A frase é dela, e ela pode trocar de novo. O que não pode é a
    // primeira tela abrir sem título nenhum, ou com texto de exemplo.
    if (!titulo || titulo.trim().length < 12 || /lorem|exemplo|placeholder/i.test(titulo)) {
      throw new Error(`título inesperado: ${titulo}`)
    }

    // A logo dela precisa estar ali: foi o pedido de 21/08, e é a
    // diferença entre a loja parecer dela ou parecer modelo pronto.
    const logo = await pagina.locator('img[alt*="Feito Para Você"]').count()
    if (!logo) throw new Error('a logo da loja não está na primeira tela')
  })

  await conferir('o catálogo mostra os produtos', async () => {
    const cartoes = await pagina.locator('.premium-card').count()
    if (cartoes < 6) throw new Error(`esperava vários produtos, achei ${cartoes}`)
  })

  await conferir('o filtro por linha só oferece o que existe', async () => {
    /* O catálogo dela veio da Elojinha, que recebeu apenas a papelaria
       personalizada: o material pedagógico ficou no Projeto Educar e nunca
       migrou. O filtro daquela linha não pode aparecer enquanto não houver
       produto nela, senão é um botão que leva a uma tela vazia — e quem
       clica conclui que a loja está quebrada. */
    const antes = await pagina.locator('.premium-card').count()
    if (antes === 0) throw new Error('a vitrine abriu sem produto nenhum')

    const linhas = await pagina
      .getByRole('button', { name: /^Papelaria/ })
      .allTextContents()

    for (const linha of linhas) {
      await pagina.getByRole('button', { name: linha, exact: true }).first().click()
      await pagina.waitForTimeout(500)

      const depois = await pagina.locator('.premium-card').count()
      if (depois === 0) throw new Error(`o filtro "${linha}" não mostra nada`)
      if (depois > antes) throw new Error(`o filtro "${linha}" mostrou mais que o total`)
    }
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
    /* O produto vem da vitrine, e não de um endereço escrito à mão.

       Este teste apontava para /produto/caneca-personalizada/, que era um
       slug do meu catálogo de exemplo. Quando o catálogo dela entrou, esse
       endereço deixou de existir, a página abriu vazia e as três provas
       seguintes falharam em cascata — todas culpando a tela errada.

       A conta também não pode ser fixa: o preço e o mínimo são dela, e
       mudam. O que precisa continuar valendo é o total bater com o preço
       vezes o mínimo. */
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagina.locator('a[href*="/produto/"]').first().click()
    await pagina.waitForURL(/\/produto\//, { timeout: 20000 })
    await pagina.locator('.produto-imagem').first().waitFor({ timeout: 15000 })

    const corpo = await pagina.locator('body').textContent()

    const minimo = Number((corpo.match(/Mínimo de (\d+) unidades/) || [])[1])
    if (!minimo) throw new Error('a página não avisa o mínimo')

    const emNumero = (texto) => Number(texto.replace(/\./g, '').replace(',', '.'))
    const unitario = emNumero((corpo.match(/R\$ ([\d.,]+)\s*cada/) || [])[1] || '0')
    if (!unitario) throw new Error('a página não mostra o preço de cada peça')

    const esperado = (unitario * minimo).toFixed(2).replace('.', ',')
    if (!corpo.includes(esperado)) {
      throw new Error(`o total do pacote deveria ser ${esperado}`)
    }
  })

  await conferir('a quantidade não desce abaixo do mínimo', async () => {
    const menos = pagina.getByRole('button', { name: 'Diminuir' })
    if (!(await menos.isDisabled())) throw new Error('dá para descer abaixo do mínimo')
  })

  await conferir('aumentar a quantidade recalcula o total', async () => {
    const antes = await pagina.locator('body').textContent()
    const minimo = Number((antes.match(/Mínimo de (\d+) unidades/) || [])[1])
    const emNumero = (texto) => Number(texto.replace(/\./g, '').replace(',', '.'))
    const unitario = emNumero((antes.match(/R\$ ([\d.,]+)\s*cada/) || [])[1] || '0')

    await pagina.getByRole('button', { name: 'Aumentar' }).click()
    await pagina.waitForTimeout(400)

    const esperado = (unitario * (minimo + 1)).toFixed(2).replace('.', ',')
    const depois = await pagina.locator('body').textContent()

    if (!depois.includes(esperado)) {
      throw new Error(`${minimo + 1} unidades deveriam somar R$ ${esperado}`)
    }
  })

  /* Daqui para baixo, o que precisa das duas linhas de venda.

     O catálogo dela veio da Elojinha, que recebeu só a papelaria
     personalizada: os 37 produtos do Projeto Educar, que são o digital,
     nunca migraram. Sem um produto de cada linha não dá para provar que a
     loja impede misturar os dois no mesmo carrinho.

     Pular é melhor do que falhar: teste vermelho por falta de dado ensina
     a ignorar teste vermelho. Quando o digital dela entrar, isto volta a
     rodar sozinho. */
  await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  /* Nomes distintos, e não botões: o mesmo filtro aparece no cabeçalho e
     na vitrine, então contar botões daria dois com uma linha só. */
  const rotulos = await pagina.getByRole('button', { name: /^Papelaria/ }).allTextContents()
  const linhasNaLoja = new Set(rotulos.map((r) => r.trim())).size
  const conferirDuasLinhas = linhasNaLoja > 1 ? conferir : async () => {}

  if (linhasNaLoja <= 1) {
    console.log('  (pulando o que precisa das duas linhas: a loja só tem a personalizada)')
  }

  /* Este estava acima, com `conferir`, e pedia um produto do catálogo de
     exemplo pelo nome. Passava porque o build local ficava sem catálogo e
     caía no exemplo; quando o catálogo dela passou a entrar de verdade, a
     página virou 404 e o console sujou sem ninguém entender por quê.

     Ele é do mesmo grupo dos daqui de baixo: precisa da linha digital,
     que ainda não existe na loja. */
  await conferirDuasLinhas('o produto digital não fala de frete nem de produção', async () => {
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagina.getByRole('button', { name: 'Papelaria pedagógica', exact: true }).first().click()
    await pagina.waitForTimeout(600)
    await pagina.locator('a[href*="/produto/"]').first().click()
    await pagina.waitForURL('**/produto/**')

    const corpo = await pagina.locator('body').textContent()
    if (corpo.includes('dias úteis')) throw new Error('material digital não tem prazo de produção')
    if (corpo.includes('Mínimo de 10')) throw new Error('material digital não tem mínimo')
  })

  await conferirDuasLinhas('o carrinho impede misturar as duas linhas', async () => {
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

  const conferirDaDona = podeEntrar ? conferir : async () => {}

  await conferirDaDona('o painel abre e mostra os números', async () => {
    await pagina.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(1800)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Bem-vinda')) throw new Error('painel não abriu')
    if (corpo.includes('R$ 0,00')) throw new Error('os números pararam em zero')
  })

  await conferirDaDona('o painel tem navegação própria, e não a da loja', async () => {
    await pagina.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' })

    // A área dela não mostra as faixas da loja nem o botão de WhatsApp:
    // ela não precisa de aviso de demonstração nem de um botão para
    // chamar a si mesma.
    const temFaixa = await pagina.locator('.aviso-demonstracao').count()
    const temWhats = await pagina.locator('.bt-whats').count()
    if (temFaixa || temWhats) throw new Error('a área dela ainda mostra coisa da loja')

    const lateral = await pagina.locator('.sidebar-nav').count()
    if (!lateral) throw new Error('a barra lateral do painel não apareceu')

    // As páginas dela que não são o painel também precisam ser
    // alcançáveis por ali: antes de 24/08 ela só chegava às perguntas por
    // uma faixa no meio da vitrine.
    const paraAsPerguntas = await pagina.locator('a[href$="/admin/perguntas/"]').count()
    if (!paraAsPerguntas) throw new Error('a barra não leva às perguntas')
  })

  await conferirDaDona('o menu do painel troca de aba', async () => {
    await pagina.getByRole('button', { name: 'Pedidos', exact: true }).click()
    await pagina.waitForTimeout(700)
    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes('Precisa de você')) throw new Error('não chegou em Pedidos')
  })

  await conferirDaDona('o endereço guarda a aba aberta', async () => {
    const url = pagina.url()
    if (!url.includes('aba=pedidos')) throw new Error(`endereço não acompanhou: ${url}`)
  })

  await conferirDaDona('o filtro de pedidos muda a lista', async () => {
    /* Esperava sete, que era a quantidade dos pedidos de exemplo. Desde
       25/08 o painel lê os pedidos de verdade do banco, e o número
       depende do que houver lá: num banco recém-limpo, zero.

       O que este teste prova é que o filtro funciona, e não quantos
       pedidos existem. Com a loja vazia ele não tem o que provar, e
       passar direto é melhor do que reprovar por falta de dado. */
    await pagina.getByRole('button', { name: /^Todos/ }).click()
    await pagina.waitForTimeout(500)

    const todos = await pagina.locator('.pedido').count()
    if (todos === 0) return

    // "Em produção" é um dos filtros de verdade da tela dela. Da primeira
    // vez eu inventei nomes que não existiam, e o teste ficou esperando
    // um botão que nunca ia aparecer.
    await pagina.getByRole('button', { name: /^Em produção/ }).first().click()
    await pagina.waitForTimeout(500)

    const filtrados = await pagina.locator('.pedido').count()
    if (filtrados > todos) {
      throw new Error(`o filtro mostrou ${filtrados}, mais do que os ${todos} de "Todos"`)
    }
  })

  await conferirDaDona('a busca de pedidos filtra', async () => {
    await pagina.getByLabel('Buscar pedido').fill('caneca')
    await pagina.waitForTimeout(500)
    const itens = await pagina.locator('.pedido').count()
    if (itens !== 1) throw new Error(`busca por "caneca" devia achar 1, achou ${itens}`)
  })

  await conferirDaDona('a barra lateral recolhe', async () => {
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
    /* O produto sai da vitrine, e o valor esperado sai da própria página.

       Antes isto apontava para /produto/caneca-personalizada/ e conferia
       "R$ 299,00", que eram o slug e o preço do meu catálogo de exemplo.
       Com o catálogo dela no ar, o endereço deixou de existir e o teste
       passou a acusar o carrinho por um erro que era do teste. */
    await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle' })

    /* Zera só o que é da loja, e não o navegador inteiro.

       Este teste limpava tudo, e tudo passou a incluir a sessão da dona
       depois que o login existiu: o carrinho zerava, e três testes adiante
       o painel não abria mais. A falha aparecia longe da causa. */
    await pagina.evaluate(() => {
      Object.keys(window.localStorage)
        .filter((chave) => chave.startsWith('feito-para-voce:'))
        .forEach((chave) => window.localStorage.removeItem(chave))
    })
    await pagina.reload({ waitUntil: 'networkidle' })

    await pagina.locator('a[href*="/produto/"]').first().click()
    await pagina.waitForURL(/\/produto\//, { timeout: 20000 })
    await pagina.locator('.produto-imagem').first().waitFor({ timeout: 15000 })

    const naPagina = await pagina.locator('body').textContent()
    const nome = (await pagina.locator('h1').first().textContent()).trim()
    const minimo = Number((naPagina.match(/Mínimo de (\d+) unidades/) || [])[1] || 1)
    const emNumero = (t) => Number(t.replace(/\./g, '').replace(',', '.'))
    const unitario = emNumero((naPagina.match(/R\$ ([\d.,]+)\s*cada/) || [])[1] || '0')

    await pagina.getByRole('button', { name: /Adicionar/ }).click()
    await pagina.waitForTimeout(700)
    await pagina.goto(`${BASE}/checkout/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(900)

    const corpo = await pagina.locator('body').textContent()
    if (!corpo.includes(nome)) throw new Error('o carrinho esvaziou ao mudar de página')

    const esperado = (unitario * minimo).toFixed(2).replace('.', ',')
    if (!corpo.includes(esperado)) throw new Error(`o valor não chegou ao checkout: ${esperado}`)
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

    /* O desconto do Pix deixou de ser 5% fixo no código em 25/08: agora
       vem de "Como eu recebo", no painel dela, e nasce em zero. O teste
       confere que a conta fecha com o desconto que estiver valendo,
       inclusive nenhum, em vez de exigir um número que era meu. */
    const emNumero = (t) => Number(t.replace(/\./g, '').replace(',', '.'))

    const produtos = (corpo.match(/Produtos\s*R\$ ([\d.,]+)/) || [])[1]
    if (!produtos) throw new Error('não achei os produtos na tela')

    const desconto = (corpo.match(/− R\$ ([\d.,]+)/) || [])[1] ?? '0'

    const totalNaTela = (corpo.match(/Total\s*R\$ ([\d.,]+)/) || [])[1]
    if (!totalNaTela) throw new Error('não achei o total na tela')

    const freteNaTela = (corpo.match(/Frete\s*R\$ ([\d.,]+)/) || [])[1]
    if (!freteNaTela) throw new Error('não achei o frete na tela')

    // O desconto incide só sobre os produtos, nunca sobre o frete: o
    // frete é repassado inteiro, e descontar ali sai do bolso dela.
    const esperado = emNumero(produtos) - emNumero(desconto) + emNumero(freteNaTela)
    if (Math.abs(emNumero(totalNaTela) - esperado) > 0.01) {
      throw new Error(`total ${totalNaTela} não bate com ${esperado.toFixed(2)}`)
    }
  })

  await conferir('a compra cria o pedido e abre o pagamento', async () => {
    await pagina.fill('#campo-rua', 'Avenida Paulista')
    await pagina.fill('#campo-numero', '1000')
    /* Bairro, cidade e estado entraram na tela em 25/08. Faltavam, e
       ficavam vazios sem ninguém perceber: o pedido era guardado no
       navegador, que aceita qualquer coisa. Com o pedido no banco,
       entrega física sem estado é recusada. */
    await pagina.fill('#campo-bairro', 'Bela Vista')
    await pagina.fill('#campo-cidade', 'São Paulo')
    await pagina.selectOption('#campo-uf', 'SP')
    await pagina.getByRole('button', { name: /^Pagar$/ }).click()

    /* Daqui em diante o caminho depende de o pagamento estar ligado.
       Com o Mercado Pago, "Pagar" grava o pedido e abre o formulário
       deles; a confirmação só vem depois de pagar de verdade, e isso este
       teste não faz: cobrar num cartão a cada `git push` é o tipo de
       automação que ninguém quer descobrir tarde.

       Sem o pagamento ligado, a compra termina como sempre terminou, na
       página de confirmação. */
    const comPagamento = await pagina
      .locator('#pagamento-mercadopago')
      .waitFor({ timeout: 25000 })
      .then(() => true)
      .catch(() => false)

    if (comPagamento) {
      const corpo = await pagina.locator('body').textContent()
      if (!corpo.includes('não passam por esta loja')) {
        throw new Error('a tela de pagamento não diz que o cartão não passa pela loja')
      }
      return
    }

    await pagina.waitForURL(/pedido-confirmado/, { timeout: 20000 })
    await pagina.locator('.confirmado-topo p').first().waitFor({ timeout: 15000 })
    const confirmacao = await pagina.locator('body').textContent()
    if (!/#\d{4}/.test(confirmacao)) throw new Error('o pedido não ganhou número')
    if (!confirmacao.includes('dias úteis')) throw new Error('não diz o prazo de produção')
  })

  await conferir('no celular dá para achar o carrinho e abrir o menu', async () => {
    /* Este teste existe por dois defeitos, e os dois eram de toque.

       O primeiro durou dois dias: o cabeçalho passava por cima da barra
       de navegação no celular, e nenhum item funcionava. Apareciam todos
       na tela, o ativo ficava destacado, e o toque não fazia nada.

       O segundo veio de uma auditoria em 26/08: o carrinho ficava dentro
       do menu recolhido, e quem punha produto não achava onde fechar a
       compra. A barra de navegação saiu no mesmo dia, porque "A loja" e
       "Como funciona" flutuando sobre o conteúdo eram cara de protótipo.

       Nenhum teste pegou os dois porque todos navegavam por endereço
       direto, que é o jeito que ninguém usa. Este toca, que é o que a
       cliente faz. */
    const celular = await navegador.newContext({ viewport: { width: 375, height: 812 } })
    const tela = await celular.newPage()

    try {
      await tela.goto(`${BASE}/`, { waitUntil: 'networkidle' })

      // O carrinho tem que estar visível sem abrir menu nenhum.
      const carrinho = tela.locator('.carrinho-no-celular')
      await carrinho.waitFor({ timeout: 15000 })

      await carrinho.click()
      await tela.waitForTimeout(700)

      const comCarrinhoAberto = await tela.locator('body').textContent()
      if (!/carrinho/i.test(comCarrinhoAberto)) {
        throw new Error('tocar no carrinho não abriu o carrinho')
      }

      await tela.keyboard.press('Escape')
      await tela.waitForTimeout(400)

      // E o menu tem que abrir, com o caminho para o catálogo dentro.
      await tela.locator('.navbar-toggler').click()
      await tela.waitForTimeout(600)

      const menu = tela.locator('a[href*="/produtos"]').first()
      if ((await menu.count()) === 0) throw new Error('o menu não leva ao catálogo')
    } finally {
      await celular.close()
    }
  })

  await conferir('endereço antigo redireciona para o novo', async () => {
    // Dois saltos: /loja/painel é do tempo do protótipo em Vite, e
    // /painel é de antes de a área dela ganhar lugar próprio, em 24/08.
    // Os dois foram mandados por WhatsApp e continuam circulando.
    await pagina.goto(`${BASE}/loja/painel/`, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(900)
    if (!pagina.url().includes('/admin')) throw new Error(`ficou em ${pagina.url()}`)
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

  /* Duas fontes de ruído, e as duas são do ambiente, não da loja.

     O SDK do Mercado Pago chama o antifraude deles em mercadolibre.com, e
     essas chamadas falham quando a loja é servida de 127.0.0.1: a origem
     não bate.

     E o próprio navegador escreve "Failed to load resource" para cada uma
     delas, **sem dizer qual endereço**. Essa mensagem genérica não tem
     como ser filtrada por domínio, e não perde nada ao sair: o ouvinte de
     `response` acima registra toda resposta 400 ou mais **com o
     endereço**, que é estritamente mais informativo. Um 404 de verdade
     continua aparecendo, e com o endereço junto. */
  const DE_FORA = [
    'favicon',
    'mercadolibre.com',
    'mercadopago.com',
    'Failed to load resource',
  ]

  const errosReais = errosConsole.filter((e) => !DE_FORA.some((quem) => e.includes(quem)))
  if (errosReais.length) {
    console.log(`\nErros no console do navegador (${errosReais.length}):`)
    errosReais.slice(0, 5).forEach((e) => console.log('  ' + e.slice(0, 140)))
  } else {
    console.log('\nNenhum erro no console do navegador.')
  }

  process.exit(passaram === resultados.length ? 0 : 1)
})()
