import { describe, it, expect } from 'vitest'

import { origemDaVisita, caminhoDaVisita, ORIGENS } from './origemDaVisita'

const NOSSO = 'feitoparavocepapelaria.com.br'

describe('de onde a pessoa veio', () => {
  it('diz Instagram quando o link foi clicado no Instagram', () => {
    /* É a pergunta que ela faz toda semana: "o post trouxe alguém?".
       Sem esta linha, o painel responde "não sei" para tudo. */
    expect(origemDaVisita('https://l.instagram.com/', '', NOSSO)).toBe('instagram')
  })

  it('reconhece o Instagram mesmo quando eles trocam o endereço', () => {
    /* Eles mandam de `l.instagram.com`, de `instagram.com` e do aplicativo,
       e mudam isso sem avisar ninguém. Procurar o pedaço do nome sobrevive
       à troca; a lista de endereços exatos não. */
    expect(origemDaVisita('https://instagram.com/p/abc', '', NOSSO)).toBe('instagram')
    expect(origemDaVisita('https://lm.facebook.com/', '', NOSSO)).toBe('facebook')
    expect(origemDaVisita('https://www.google.com.br/search?q=x', '', NOSSO)).toBe('google')
  })

  it('não conta a própria loja como origem', () => {
    /* Ir da vitrine para o produto é navegação, não visita nova. Sem isto
       a loja seria a maior fonte de tráfego dela mesma, e o número que
       decide o anúncio ficaria inútil. */
    expect(origemDaVisita(`https://${NOSSO}/produtos`, '', NOSSO)).toBe('direto')
  })

  it('diz direto quando ninguém mandou', () => {
    // Digitou o endereço, ou veio de um lugar que não conta de onde veio.
    expect(origemDaVisita('', '', NOSSO)).toBe('direto')
  })

  it('separa o clique pago do post normal', () => {
    /* Os dois chegam com `instagram.com` no referrer. A marca no link do
       anúncio é o único jeito de saber qual dos dois trouxe a pessoa, e é
       disso que depende continuar pagando ou não. */
    const pago = origemDaVisita('https://l.instagram.com/', '?origem=anuncio', NOSSO)
    expect(pago).toBe('anuncio')
  })

  it('entende a marca que as ferramentas de anúncio colocam sozinhas', () => {
    // `utm_source` é o que o gerenciador do Instagram gruda no link.
    expect(origemDaVisita('', '?utm_source=instagram', NOSSO)).toBe('instagram')
  })

  it('joga o que não conhece em outro, e nunca inventa linha nova', () => {
    /* A chamada sai de dentro da página, e qualquer um manda o que quiser
       nela. Sem esta regra, uma tarde de brincadeira enche o relatório
       dela de milhares de origens inventadas. */
    expect(origemDaVisita('https://sitequalquer.com.br/', '', NOSSO)).toBe('outro')
    expect(origemDaVisita('', '?origem=xpto-inventado', NOSSO)).toBe('outro')
  })

  it('só devolve origem que o banco aceita', () => {
    const respostas = [
      origemDaVisita('https://l.instagram.com/', '', NOSSO),
      origemDaVisita('', '', NOSSO),
      origemDaVisita('https://sitequalquer.com.br/', '', NOSSO),
      origemDaVisita('', '?origem=<script>', NOSSO),
    ]

    for (const resposta of respostas) expect(ORIGENS).toContain(resposta)
  })
})

describe('qual página foi aberta', () => {
  it('tira o que vem depois da interrogação', () => {
    /* Um link de campanha traz cinco parâmetros, e cada clique viraria uma
       linha nova. A página mais vista da loja apareceria quebrada em
       dezenas de pedaços, e ela não veria qual produto puxa gente. */
    expect(caminhoDaVisita('/produto/caderno?utm_source=ig&fbclid=abc')).toBe(
      '/produto/caderno',
    )
  })

  it('junta a página com e sem barra no fim', () => {
    expect(caminhoDaVisita('/produtos/')).toBe('/produtos')
    expect(caminhoDaVisita('/produtos')).toBe('/produtos')
  })

  it('junta o endereço com e sem index.html', () => {
    // O site é estático: o servidor entrega a mesma página nos dois.
    expect(caminhoDaVisita('/produto/caderno/index.html')).toBe('/produto/caderno')
  })

  it('mantém a raiz como raiz', () => {
    expect(caminhoDaVisita('/')).toBe('/')
    expect(caminhoDaVisita('')).toBe('/')
  })

  it('descarta a âncora', () => {
    expect(caminhoDaVisita('/como-funciona#frete')).toBe('/como-funciona')
  })
})
