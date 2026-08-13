import { describe, it, expect } from 'vitest'

import {
  fecharOMes,
  oQueProduzir,
  compararComElo7,
  gerarCsvDoMes,
  ehVenda,
  type PedidoParaRelatorio,
} from './relatorios'

/**
 * Conta de dinheiro é o que a Vivian vai olhar para decidir se o mês foi
 * bom. Um erro aqui não aparece na tela como erro: aparece como um número
 * plausível e errado, que ela usa para tomar decisão.
 *
 * Por isso os testes atacam o que engana: frete somado à receita, pedido
 * cancelado contando como venda, e desconto esquecido.
 */

const AGOSTO = new Date('2026-08-15T12:00:00')

const pedido = (dados: Partial<PedidoParaRelatorio> = {}): PedidoParaRelatorio => ({
  id: '0001',
  criadoEm: '2026-08-10T14:00:00.000Z',
  linha: 'personalizada',
  estado: 'producao',
  itens: [{ nome: 'Caderno personalizado', quantidade: 10, preco: 32 }],
  subtotal: 320,
  frete: 28.9,
  desconto: 0,
  ...dados,
})

describe('fechamento do mês', () => {
  it('não conta o frete como receita dela', () => {
    const mes = fecharOMes([pedido()], AGOSTO)

    expect(mes.receita).toBe(320)
    expect(mes.freteRepassado).toBe(28.9)
    // O que a cliente pagou é uma coisa; o que é dela é outra.
    expect(mes.movimentado).toBe(348.9)
  })

  it('tira o desconto da receita, e não do frete', () => {
    const mes = fecharOMes([pedido({ desconto: 16 })], AGOSTO)

    expect(mes.receita).toBe(304)
    expect(mes.freteRepassado).toBe(28.9)
    expect(mes.descontosDados).toBe(16)
    expect(mes.movimentado).toBe(332.9)
  })

  it('ignora pedido cancelado e pedido sem pagamento', () => {
    const mes = fecharOMes(
      [
        pedido({ id: '1' }),
        pedido({ id: '2', estado: 'cancelado', subtotal: 900 }),
        pedido({ id: '3', estado: 'aguardando', subtotal: 700 }),
      ],
      AGOSTO,
    )

    expect(mes.pedidos).toBe(1)
    expect(mes.receita).toBe(320)
  })

  it('ignora venda de outro mês', () => {
    const mes = fecharOMes(
      [pedido({ id: '1' }), pedido({ id: '2', criadoEm: '2026-07-28T10:00:00.000Z' })],
      AGOSTO,
    )

    expect(mes.pedidos).toBe(1)
  })

  it('devolve tudo zerado quando o mês não teve venda', () => {
    const mes = fecharOMes([], AGOSTO)

    expect(mes.receita).toBe(0)
    expect(mes.pedidos).toBe(0)
    // Zero pedidos não pode virar divisão por zero na média.
    expect(mes.ticketMedio).toBe(0)
  })

  it('calcula o ticket médio sobre a receita, não sobre o frete', () => {
    const mes = fecharOMes(
      [
        pedido({ id: '1', subtotal: 300, frete: 30 }),
        pedido({ id: '2', subtotal: 500, frete: 200 }),
      ],
      AGOSTO,
    )

    // Sem isso, o pedido para longe pareceria uma venda maior do que foi.
    expect(mes.ticketMedio).toBe(400)
  })

  it('separa as duas linhas', () => {
    const mes = fecharOMes(
      [
        pedido({ id: '1', linha: 'personalizada', subtotal: 320 }),
        pedido({ id: '2', linha: 'pedagogica', subtotal: 47, frete: 0 }),
      ],
      AGOSTO,
    )

    expect(mes.porLinha.personalizada).toEqual({ receita: 320, pedidos: 1 })
    expect(mes.porLinha.pedagogica).toEqual({ receita: 47, pedidos: 1 })
  })

  it('conta as peças, e não só os pedidos', () => {
    const mes = fecharOMes(
      [
        pedido({
          itens: [
            { nome: 'Caderno', quantidade: 10, preco: 32 },
            { nome: 'Caneca', quantidade: 20, preco: 34 },
          ],
        }),
      ],
      AGOSTO,
    )

    expect(mes.pecas).toBe(30)
  })

  it('não deixa sobra de centavo em soma de valores quebrados', () => {
    const mes = fecharOMes(
      [
        pedido({ id: '1', subtotal: 10.1, frete: 0.1, desconto: 0 }),
        pedido({ id: '2', subtotal: 20.2, frete: 0.2, desconto: 0 }),
      ],
      AGOSTO,
    )

    expect(mes.receita).toBe(30.3)
    expect(mes.movimentado).toBe(30.6)
  })
})

describe('o que produzir', () => {
  it('junta a mesma peça vinda de pedidos diferentes', () => {
    const fila = oQueProduzir([
      pedido({ id: '1', itens: [{ nome: 'Caneca', quantidade: 10, preco: 34 }] }),
      pedido({ id: '2', itens: [{ nome: 'Caneca', quantidade: 20, preco: 34 }] }),
    ])

    expect(fila).toEqual([{ nome: 'Caneca', quantidade: 30, emQuantosPedidos: 2 }])
  })

  it('coloca o que rende mais na frente', () => {
    const fila = oQueProduzir([
      pedido({
        id: '1',
        itens: [
          { nome: 'Bloco', quantidade: 10, preco: 24 },
          { nome: 'Caneca', quantidade: 40, preco: 34 },
        ],
      }),
    ])

    expect(fila.map((f) => f.nome)).toEqual(['Caneca', 'Bloco'])
  })

  it('não pede para produzir o que já foi enviado nem o que é digital', () => {
    const fila = oQueProduzir([
      pedido({ id: '1', estado: 'enviado' }),
      pedido({ id: '2', estado: 'entregue' }),
      pedido({ id: '3', estado: 'digital' }),
    ])

    expect(fila).toEqual([])
  })

  it('inclui o que está pronto mas ainda não saiu', () => {
    const fila = oQueProduzir([pedido({ estado: 'pronto' })])
    expect(fila).toHaveLength(1)
  })
})

describe('comparação com o Elo7', () => {
  it('mostra a economia quando o mês compensa o fixo', () => {
    const comparacao = compararComElo7(5000, 100, 0.12)

    expect(comparacao.ficariaComOElo7).toBe(600)
    expect(comparacao.economia).toBe(500)
  })

  it('mostra prejuízo quando o mês foi fraco, em vez de esconder', () => {
    const comparacao = compararComElo7(400, 100, 0.12)

    // 48 de comissão contra 100 de mensalidade: aqui saiu mais caro, e a
    // tela precisa poder dizer isso em vez de mostrar economia negativa
    // como se fosse ganho.
    expect(comparacao.economia).toBeLessThan(0)
  })

  it('avisa quando a taxa ainda é estimativa minha, e não número dela', () => {
    expect(compararComElo7(5000, 100).confirmada).toBe(false)
    expect(compararComElo7(5000, 100, 0.15, true).confirmada).toBe(true)
  })
})

describe('arquivo para o contador', () => {
  it('usa ponto e vírgula, que é o que o Excel em português entende', () => {
    const csv = gerarCsvDoMes([pedido()], AGOSTO)
    expect(csv.split('\r\n')[0]).toContain('Pedido;Data;Linha')
  })

  it('escreve o valor com vírgula decimal', () => {
    const csv = gerarCsvDoMes([pedido({ subtotal: 320, frete: 28.9 })], AGOSTO)
    expect(csv).toContain('320,00')
    expect(csv).toContain('28,90')
  })

  it('separa o frete do valor dos produtos', () => {
    const csv = gerarCsvDoMes([pedido({ subtotal: 320, frete: 28.9, desconto: 16 })], AGOSTO)
    const linha = csv.split('\r\n')[1].split(';')

    expect(linha[3]).toBe('320,00') // produtos
    expect(linha[4]).toBe('16,00') // desconto
    expect(linha[5]).toBe('28,90') // frete repassado
    expect(linha[6]).toBe('332,90') // total pago
  })

  it('protege nome de produto que tenha ponto e vírgula', () => {
    const csv = gerarCsvDoMes(
      [pedido({ itens: [{ nome: 'Kit; especial', quantidade: 1, preco: 10 }] })],
      AGOSTO,
    )

    // O nome não vai no CSV hoje, mas o escape precisa existir antes de
    // alguém adicionar a coluna e quebrar todas as linhas do arquivo.
    expect(csv).not.toContain('Kit; especial')
  })

  it('sai só com o cabeçalho quando o mês não teve venda', () => {
    const csv = gerarCsvDoMes([], AGOSTO)
    expect(csv.split('\r\n')).toHaveLength(1)
  })

  it('ordena do primeiro ao último dia do mês', () => {
    const csv = gerarCsvDoMes(
      [
        pedido({ id: 'B', criadoEm: '2026-08-20T10:00:00.000Z' }),
        pedido({ id: 'A', criadoEm: '2026-08-02T10:00:00.000Z' }),
      ],
      AGOSTO,
    )

    const linhas = csv.split('\r\n')
    expect(linhas[1].startsWith('A')).toBe(true)
    expect(linhas[2].startsWith('B')).toBe(true)
  })
})

describe('o que conta como venda', () => {
  it.each([
    ['producao', true],
    ['pronto', true],
    ['enviado', true],
    ['entregue', true],
    ['digital', true],
    ['cancelado', false],
    ['aguardando', false],
  ])('%s conta como venda: %s', (estado, esperado) => {
    expect(ehVenda(pedido({ estado }))).toBe(esperado)
  })
})
