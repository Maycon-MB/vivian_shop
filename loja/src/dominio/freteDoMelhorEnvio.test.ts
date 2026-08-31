import { describe, it, expect } from 'vitest'

import { pacoteParaMelhorEnvio, opcoesDoMelhorEnvio } from './freteDoMelhorEnvio'

const CONSULTA = {
  cepDestino: '01310-100',
  pesoG: 1150,
  altCm: 17,
  largCm: 19,
  compCm: 30,
}

describe('o que a loja manda para o Melhor Envio', () => {
  it('manda o peso em quilo, e não em grama', () => {
    /* Eles esperam quilo. Mandando 1150 onde se espera 1,15, a cotação
       sai como se o pacote tivesse mais de uma tonelada, e o frete
       aparece absurdo na tela de quem ia comprar. */
    const pacote = pacoteParaMelhorEnvio(CONSULTA, '30170-000')

    expect(pacote.products[0].weight).toBeCloseTo(1.15)
  })

  it('manda as medidas em centímetro, como já estão', () => {
    const pacote = pacoteParaMelhorEnvio(CONSULTA, '30170-000')

    expect(pacote.products[0]).toMatchObject({ height: 17, width: 19, length: 30 })
  })

  it('leva o CEP de origem e o de destino só com número', () => {
    /* Eles recusam o traço. É o tipo de detalhe que faz a integração
       inteira devolver erro por causa de um caractere. */
    const pacote = pacoteParaMelhorEnvio(CONSULTA, '30170-000')

    expect(pacote.to.postal_code).toBe('01310100')
    expect(pacote.from.postal_code).toBe('30170000')
  })

  it('declara valor zero de seguro, de propósito', () => {
    /* Seguro encarece o frete, e ela não segura pedido hoje. Quando
       decidir segurar, é aqui que o valor do pedido entra, e a conta
       passa a depender do carrinho. */
    const pacote = pacoteParaMelhorEnvio(CONSULTA, '30170-000')

    expect(pacote.products[0].insurance_value).toBe(0)
  })
})

describe('o que a loja mostra do que eles respondem', () => {
  const RESPOSTA = [
    {
      id: 1,
      name: 'PAC',
      price: '24.50',
      delivery_time: 8,
      company: { id: 1, name: 'Correios' },
    },
    {
      id: 2,
      name: 'SEDEX',
      price: '41.30',
      delivery_time: 3,
      company: { id: 1, name: 'Correios' },
    },
    {
      id: 3,
      name: '.Package',
      price: '19.90',
      delivery_time: 6,
      company: { id: 2, name: 'Jadlog' },
    },
  ]

  it('mostra transportadora, serviço, preço e prazo', () => {
    const opcoes = opcoesDoMelhorEnvio(RESPOSTA)

    expect(opcoes[0]).toEqual({
      id: '3',
      transportadora: 'Jadlog',
      servico: '.Package',
      valor: 19.9,
      prazoDias: 6,
    })
  })

  it('mostra o mais barato primeiro', () => {
    // É a ordem em que a cliente decide, e a que segura a venda.
    const valores = opcoesDoMelhorEnvio(RESPOSTA).map((o) => o.valor)

    expect(valores).toEqual([19.9, 24.5, 41.3])
  })

  it('esconde a transportadora que devolveu erro', () => {
    /* Eles respondem 200 com um `error` dentro do item quando a
       transportadora não atende aquele CEP. Mostrando isso, a cliente vê
       "Correios: undefined" na hora de escolher o frete. */
    const opcoes = opcoesDoMelhorEnvio([
      ...RESPOSTA,
      { id: 9, name: 'Mini Envios', company: { id: 1, name: 'Correios' }, error: 'CEP não atendido' },
    ])

    expect(opcoes).toHaveLength(3)
  })

  it('esconde a opção sem preço', () => {
    // Preço nulo é a mesma coisa que erro, só que sem a palavra.
    const opcoes = opcoesDoMelhorEnvio([
      { id: 7, name: 'X', company: { id: 3, name: 'Loggi' }, delivery_time: 2 },
    ])

    expect(opcoes).toEqual([])
  })

  it('converte o preço de texto para número', () => {
    /* Eles mandam "24.50" como string. Somando ao subtotal sem converter,
       o total do pedido concatena em vez de somar, e a cliente paga um
       número que ninguém escreveu. */
    const opcoes = opcoesDoMelhorEnvio(RESPOSTA)

    expect(typeof opcoes[0].valor).toBe('number')
  })

  it('não quebra quando a resposta não é lista', () => {
    // Erro de autenticação deles volta como objeto, e não como lista.
    expect(opcoesDoMelhorEnvio({ message: 'Unauthenticated.' } as never)).toEqual([])
    expect(opcoesDoMelhorEnvio(null as never)).toEqual([])
  })
})
