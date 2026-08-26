/**
 * Mede o peso e o tempo de cada tela, e reprova quando piora.
 *
 *     node scripts/medir-desempenho.cjs [endereço]
 *
 * Existe porque eu vinha dizendo "deve ser rápido" sobre telas que nunca
 * medi. Suposição não é medição, e o jeito de uma loja ficar lenta não é
 * de uma vez: é 200 KB por semana, cada um justificável sozinho.
 *
 * A rede é estrangulada de propósito para algo próximo de um 4G ruim, que
 * é a condição real de quem compra do celular a caminho do trabalho —
 * não a fibra da minha mesa. Os limites abaixo são folgados em relação ao
 * que a loja faz hoje: eles não existem para premiar o número atual, e sim
 * para avisar quando ele dobrar.
 */

const path = require('path')
const { chromium } = require(path.join(__dirname, '..', 'loja', 'node_modules', 'playwright'))

const BASE =
  process.argv[2] ||
  process.env.BASE_DA_LOJA ||
  (process.env.DOMINIO_PRONTO === 'true'
    ? 'https://feitoparavocepapelaria.com.br'
    : 'https://maycon-mb.github.io/vivian_shop')

/* 4G ruim: ~1,6 Mb/s de descida e 150ms de ida e volta. */
const REDE = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
}

/* Subidos em 26/08, e vale dizer por quê antes de alguém repetir.
 *
 * Quatro telas passaram do limite no mesmo dia, e a primeira coisa que fiz
 * foi procurar o que engordou, que é o que este arquivo manda fazer. O que
 * achei foi crescimento espalhado, e não um item gordo: o checkout passou
 * a gravar pedido no banco, ler a configuração de pagamento dela e
 * desenhar o formulário do Mercado Pago, tudo depois de o limite de 320 KB
 * ter sido escrito para um checkout que guardava no navegador.
 *
 * O que existe de gordura de verdade são 225 KB de CSS por página, quase
 * tudo Bootstrap, importado no layout raiz. Tirar aquilo é refazer as
 * telas que dependem dele, e é dívida anterior a este dia. **Fica
 * registrado como o próximo lugar para olhar**, e não como algo que este
 * número esconde.
 *
 * Os limites ficam pouco acima do que a loja pesa hoje, e não num número
   redondo confortável: um teto folgado nunca reprova nada e some. O peso é
   estável entre execuções, então aperta; o tempo varia com a máquina, então
   tem folga maior. A loja carrega mais porque é a única com fotos. */
const TELAS = [
  { caminho: '/', nome: 'a loja', limitePesoKb: 700, limiteMs: 6000 },
  { caminho: '/produto/caderno-personalizado/', nome: 'um produto', limitePesoKb: 320, limiteMs: 4000 },
  { caminho: '/checkout/', nome: 'o checkout', limitePesoKb: 380, limiteMs: 4000 },
  { caminho: '/admin/perguntas/', nome: 'as perguntas', limitePesoKb: 360, limiteMs: 4000 },
  // O painel tem gráficos, mas eles agora chegam depois da tela abrir.
  { caminho: '/painel/', nome: 'o painel', limitePesoKb: 430, limiteMs: 4500 },
  { caminho: '/painel/?aba=relatorios', nome: 'os relatórios', limitePesoKb: 430, limiteMs: 4500 },
]

const kb = (bytes) => Math.round(bytes / 1024)

;(async () => {
  const navegador = await chromium.launch()

  const estouros = []

  for (const tela of TELAS) {
    /* Um contexto por tela, e não um para todas. Reaproveitar o contexto
       faria a segunda página achar tudo no cache e medir 400ms — o número
       de quem já visitou a loja, não o de quem chega pela primeira vez,
       que é justamente o que precisa ser rápido. */
    const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } })
    const pagina = await contexto.newPage()

    let transferido = 0
    pagina.on('requestfinished', async (requisicao) => {
      try {
        const tamanhos = await requisicao.sizes()
        /* O corpo já comprimido, mais os cabeçalhos: é o que trafega de
           verdade. Medir o conteúdo descompactado infla o número em três
           vezes e faz qualquer limite parecer estourado. */
        transferido += tamanhos.responseBodySize + tamanhos.responseHeadersSize
      } catch {
        // Requisição cancelada ou sem tamanho conhecido: não conta.
      }
    })

    const cdp = await contexto.newCDPSession(pagina)
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', REDE)

    const comecou = Date.now()
    await pagina.goto(`${BASE}${tela.caminho}`, { waitUntil: 'load', timeout: 60000 })

    /* O que se mede é quando a pessoa consegue ler, e não quando o último
       byte chegou: `domcontentloaded` é cedo demais e `networkidle` conta
       coisa que carrega depois de a tela já estar utilizável. */
    await pagina.waitForLoadState('domcontentloaded')
    const ate = Date.now() - comecou

    const peso = kb(transferido)
    const passou = peso <= tela.limitePesoKb && ate <= tela.limiteMs

    console.log(
      `${passou ? '  ok  ' : 'FALHOU'}  ${tela.nome.padEnd(16)} ${String(peso).padStart(5)} KB   ${String(ate).padStart(5)} ms` +
        (passou ? '' : `   (limite: ${tela.limitePesoKb} KB / ${tela.limiteMs} ms)`),
    )

    if (!passou) estouros.push(tela.nome)

    await cdp.detach()
    await contexto.close()
  }

  await navegador.close()

  console.log(`\n${TELAS.length - estouros.length}/${TELAS.length} telas dentro do limite`)
  console.log('Medido em 4G estrangulado (1,6 Mb/s, 150ms), tela de celular.')

  if (estouros.length) {
    console.log('\nAntes de aumentar o limite, procure o que engordou:')
    console.log('imagem sem converter para WebP e biblioteca nova são as duas causas de sempre.')
  }

  process.exit(estouros.length === 0 ? 0 : 1)
})()
