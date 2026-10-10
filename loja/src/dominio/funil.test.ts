import { describe, it, expect } from 'vitest'

import { ETAPAS, passosDoFunil, maiorPerda } from './funil'

describe('as etapas do funil', () => {
  it('seguem a ordem em que a cliente anda pela loja', () => {
    expect(ETAPAS).toEqual(['produto', 'carrinho', 'checkout', 'pagamento'])
  })
})

describe('do clique ao pagamento', () => {
  const doBanco = [
    { etapa: 'produto', pessoas: 120 },
    { etapa: 'carrinho', pessoas: 30 },
    { etapa: 'checkout', pessoas: 12 },
    { etapa: 'pagamento', pessoas: 6 },
    { etapa: 'pago', pessoas: 3 },
  ]

  it('mostra as seis etapas, de quem entrou até quem pagou', () => {
    const passos = passosDoFunil(200, doBanco)

    expect(passos.map((p) => p.pessoas)).toEqual([200, 120, 30, 12, 6, 3])
  })

  it('diz quantos de cada cem que entraram chegaram a cada etapa', () => {
    const passos = passosDoFunil(200, doBanco)

    expect(passos.map((p) => p.deCadaCem)).toEqual([100, 60, 15, 6, 3, 1.5])
  })

  it('não inventa porcentagem quando ninguém entrou', () => {
    const passos = passosDoFunil(0, doBanco)

    expect(passos.every((p) => p.deCadaCem === null)).toBe(true)
  })

  it('mostra zero na etapa sem registro, em vez de sumir com ela da tela', () => {
    const passos = passosDoFunil(50, [{ etapa: 'produto', pessoas: 20 }])

    expect(passos).toHaveLength(6)
    expect(passos[2].pessoas).toBe(0)
  })

  it('ignora etapa que o banco não deveria mandar', () => {
    const passos = passosDoFunil(50, [{ etapa: 'inventada', pessoas: 999 }])

    expect(passos.map((p) => p.pessoas)).toEqual([50, 0, 0, 0, 0, 0])
  })
})

describe('onde a loja perde mais gente', () => {
  it('aponta a passagem em que mais gente desiste', () => {
    // De 120 que abriram produto, só 30 puseram no carrinho: 75 de cada 100 param ali.
    const passos = passosDoFunil(200, [
      { etapa: 'produto', pessoas: 120 },
      { etapa: 'carrinho', pessoas: 30 },
      { etapa: 'checkout', pessoas: 20 },
      { etapa: 'pagamento', pessoas: 18 },
      { etapa: 'pago', pessoas: 9 },
    ])

    expect(maiorPerda(passos)).toEqual({
      de: 'Abriram um produto',
      para: 'Puseram no carrinho',
      param: 75,
    })
  })

  it('não aponta nada enquanto ninguém entrou', () => {
    expect(maiorPerda(passosDoFunil(0, []))).toBeNull()
  })

  it('ignora passagem com mais gente que a anterior', () => {
    // Quem põe no carrinho direto da vitrine pula a página do produto.
    const passos = passosDoFunil(10, [
      { etapa: 'produto', pessoas: 2 },
      { etapa: 'carrinho', pessoas: 5 },
      { etapa: 'checkout', pessoas: 5 },
      { etapa: 'pagamento', pessoas: 5 },
      { etapa: 'pago', pessoas: 5 },
    ])

    expect(maiorPerda(passos)).toEqual({
      de: 'Entraram na loja',
      para: 'Abriram um produto',
      param: 80,
    })
  })
})
