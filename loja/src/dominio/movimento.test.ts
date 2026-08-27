import { describe, it, expect } from 'vitest'

import {
  taxaDeConversao,
  conversaoEmTexto,
  leituraDaConversao,
  totalDoPeriodo,
  paginasPorVisita,
  nomeDaOrigem,
  pedidosNosUltimosDias,
} from './movimento'

describe('quantos dos que entraram compraram', () => {
  it('diz dois por cento quando duas de cem compraram', () => {
    expect(taxaDeConversao(100, 2)).toBeCloseTo(2)
  })

  it('não diz zero por cento quando ninguém entrou', () => {
    /* São coisas diferentes, e confundir as duas faz ela decidir errado:
       "veio gente e não comprou" é problema de foto ou de preço, e "ainda
       não veio ninguém" é problema de divulgação. */
    expect(taxaDeConversao(0, 0)).toBeNull()
    expect(conversaoEmTexto(taxaDeConversao(0, 0))).toBe('ainda sem visita')
  })

  it('separa na tela o zero de verdade do sem-dado', () => {
    expect(leituraDaConversao(0)).toContain('ninguém comprou')
    expect(leituraDaConversao(null)).toContain('Ainda não')
  })

  it('avisa quando trazer mais gente não é o conserto', () => {
    /* É o dinheiro dela em jogo: anunciar uma loja que não converte é
       pagar para trazer gente que vai embora do mesmo jeito. */
    expect(leituraDaConversao(0.2)).toContain('antes de anunciar')
  })

  it('avisa quando vale trazer mais gente', () => {
    expect(leituraDaConversao(3)).toContain('mais venda')
  })

  it('escreve o número com vírgula, e com uma casa só', () => {
    /* Duas casas dão falsa precisão num número que vem de contagem
       aproximada, e ela tomaria decisão em cima de ruído. */
    expect(conversaoEmTexto(1.847)).toBe('1,8%')
  })
})

describe('o total do período', () => {
  it('soma os dias', () => {
    const total = totalDoPeriodo([
      { dia: '2026-08-26', visitantes: 10, paginas: 30 },
      { dia: '2026-08-27', visitantes: 5, paginas: 12 },
    ])

    expect(total).toEqual({ visitantes: 15, paginas: 42 })
  })

  it('não quebra com o que o banco devolve como texto', () => {
    // `sum()` no Postgres volta como string em algumas configurações, e um
    // '10' + '5' viraria '105' no relatório dela.
    const total = totalDoPeriodo([
      { dia: '2026-08-26', visitantes: '10', paginas: '30' },
      { dia: '2026-08-27', visitantes: '5', paginas: '12' },
    ] as never)

    expect(total).toEqual({ visitantes: 15, paginas: 42 })
  })

  it('devolve zero quando não há dia nenhum', () => {
    expect(totalDoPeriodo([])).toEqual({ visitantes: 0, paginas: 0 })
  })
})

describe('quantas páginas cada visita abriu', () => {
  it('diz três quando trinta páginas vieram de dez visitas', () => {
    expect(paginasPorVisita(10, 30)).toBeCloseTo(3)
  })

  it('não divide por zero', () => {
    expect(paginasPorVisita(0, 0)).toBeNull()
  })
})

describe('o nome da origem', () => {
  it('mostra o nome que ela reconhece, e não a palavra do banco', () => {
    expect(nomeDaOrigem('anuncio')).toBe('Anúncio pago')
    expect(nomeDaOrigem('direto')).toBe('Digitou o endereço')
    expect(nomeDaOrigem('google')).toBe('Busca do Google')
  })

  it('não deixa buraco na tela quando a origem é desconhecida', () => {
    expect(nomeDaOrigem('coisa-que-nao-existe')).toBe('Outros sites')
  })
})

describe('os pedidos da mesma janela', () => {
  const HOJE = new Date('2026-08-27T12:00:00Z')
  const emDiasAtras = (dias: number) => {
    const quando = new Date(HOJE)
    quando.setDate(quando.getDate() - dias)
    return { criadoEm: quando.toISOString() }
  }

  it('conta só o que caiu dentro do período', () => {
    /* Comparar visita de sete dias com pedido de um mês infla a taxa por
       quatro, e ela desligaria um anúncio que estava dando certo. */
    const pedidos = [emDiasAtras(1), emDiasAtras(5), emDiasAtras(20)]

    expect(pedidosNosUltimosDias(pedidos, 7, HOJE)).toBe(2)
    expect(pedidosNosUltimosDias(pedidos, 30, HOJE)).toBe(3)
  })

  it('ignora pedido sem data em vez de quebrar a tela', () => {
    expect(pedidosNosUltimosDias([{}, { criadoEm: 'não é data' }], 30, HOJE)).toBe(0)
  })
})
