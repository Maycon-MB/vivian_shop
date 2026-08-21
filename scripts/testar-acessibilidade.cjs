/**
 * Passa o pente fino de acessibilidade em todas as telas.
 *
 *     node scripts/testar-acessibilidade.cjs [endereço]
 *
 * Existe porque a minha conferência era manual e pontual: calculei
 * contraste algumas vezes, olhando, quando lembrei. Isso pega o erro que
 * eu procurei — não o que eu não sei procurar, e não o que entra amanhã
 * numa tela que eu não revisei.
 *
 * A ferramenta é o axe, o mesmo motor que o Lighthouse usa por baixo. Ele
 * não substitui testar com leitor de tela de verdade, e nenhuma ferramenta
 * substitui: cerca de metade dos problemas de acessibilidade só aparecem
 * usando. Mas a outra metade — rótulo faltando, contraste baixo, ordem de
 * cabeçalho quebrada, campo sem nome — ele pega em todas as páginas, a
 * cada envio, sem depender da minha memória.
 *
 * O critério é WCAG 2.1 AA, que é o que a legislação brasileira de
 * acessibilidade digital toma como referência.
 */

const path = require('path')
const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))
const AxeBuilder = require(path.join(__dirname, '..', 'loja', 'node_modules', '@axe-core/playwright')).default

const BASE =
  process.argv[2] ||
  process.env.BASE_DA_LOJA ||
  (process.env.DOMINIO_PRONTO === 'true'
    ? 'https://feitoparavocepapelaria.com.br'
    : 'https://maycon-mb.github.io/vivian_shop')

/** Uma de cada tipo de tela. Produto e painel repetem estrutura entre si. */
const TELAS = [
  { caminho: '/', nome: 'a loja' },
  { caminho: '/produto/caderno-personalizado/', nome: 'a página de um produto' },
  { caminho: '/checkout/', nome: 'o checkout' },
  { caminho: '/perguntas/', nome: 'o formulário de perguntas' },
  { caminho: '/painel/', nome: 'o painel' },
  { caminho: '/painel/?aba=pedidos', nome: 'os pedidos' },
  { caminho: '/painel/?aba=relatorios', nome: 'os relatórios' },
  { caminho: '/sobre/', nome: 'a página sobre' },
  { caminho: '/como-funciona/', nome: 'como funciona' },
  { caminho: '/baixar/', nome: 'a página de download' },
  { caminho: '/entrar/', nome: 'a entrada do painel' },
]

const REGRAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/* Traduz o nome técnico da regra para o que isso significa para quem usa.
   "color-contrast" não diz nada; "texto claro demais para ler no sol" diz. */
const EXPLICACOES = {
  'color-contrast': 'texto com contraste baixo demais para ler no celular ao sol',
  'label': 'campo de formulário sem nome — quem usa leitor de tela não sabe o que preencher',
  'button-name': 'botão sem texto nem descrição: o leitor de tela anuncia só "botão"',
  'link-name': 'link sem texto: o leitor de tela anuncia só "link"',
  'image-alt': 'imagem sem descrição',
  'heading-order': 'títulos fora de ordem, o que quebra a navegação por cabeçalhos',
  'landmark-one-main': 'a página não marca onde começa o conteúdo principal',
  'region': 'há conteúdo fora de qualquer região marcada',
  'aria-required-attr': 'elemento com papel declarado mas sem os atributos que ele exige',
  'duplicate-id': 'dois elementos com o mesmo identificador',
  'html-has-lang': 'a página não declara o idioma, e o leitor de tela lê com sotaque errado',
}

const gravidade = { critical: 'grave', serious: 'sério', moderate: 'médio', minor: 'pequeno' }

;(async () => {
  const navegador = await chromium.launch()
  // O axe injeta script na página, e para isso a página precisa vir de um
  // contexto explícito — `newPage` com opções é recusado.
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } })
  const problemas = []
  let telasLimpas = 0

  for (const tela of TELAS) {
    const pagina = await contexto.newPage()

    try {
      await pagina.goto(`${BASE}${tela.caminho}`, { waitUntil: 'networkidle', timeout: 45000 })
      // O painel e os relatórios só desenham depois de ler o navegador.
      await pagina.waitForTimeout(800)

      const resultado = await new AxeBuilder({ page: pagina }).withTags(REGRAS).analyze()

      if (resultado.violations.length === 0) {
        console.log(`  ok    ${tela.nome}`)
        telasLimpas += 1
      } else {
        console.log(`FALHOU  ${tela.nome}`)
        for (const v of resultado.violations) {
          const oQueE = EXPLICACOES[v.id] ?? v.help
          console.log(`          [${gravidade[v.impact] ?? v.impact}] ${oQueE}`)
          console.log(`          em ${v.nodes.length} lugar(es), o primeiro: ${v.nodes[0].target.join(' ')}`)
          problemas.push({ tela: tela.nome, regra: v.id, impacto: v.impact })
        }
      }
    } catch (erro) {
      console.log(`FALHOU  ${tela.nome}`)
      console.log(`          não consegui abrir: ${erro.message.split('\n')[0]}`)
      problemas.push({ tela: tela.nome, regra: 'não abriu', impacto: 'critical' })
    } finally {
      await pagina.close()
    }
  }

  await navegador.close()

  console.log(`\n${telasLimpas}/${TELAS.length} telas sem problema de acessibilidade`)

  if (problemas.length > 0) {
    console.log(`\n${problemas.length} problema(s) para resolver.`)
    console.log('Lembrete: isto pega cerca de metade dos problemas reais.')
    console.log('O resto só aparece usando de verdade, com leitor de tela e só com o teclado.')
  }

  process.exit(problemas.length === 0 ? 0 : 1)
})()
