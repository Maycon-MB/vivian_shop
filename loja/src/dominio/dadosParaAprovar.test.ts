import { describe, it, expect } from 'vitest'

import {
  dadosParaAprovar,
  dispositivoDaCompra,
  nomeESobrenome,
  descricaoNaFatura,
} from './dadosParaAprovar'

/**
 * O que vai junto da cobrança para o antifraude do Mercado Pago aprovar.
 *
 * Cartão recusado por "alto risco" é venda perdida que ela nem fica
 * sabendo. A medição de qualidade deles conta cada um destes campos, e
 * nenhum é dado novo: tudo já está no pedido gravado no banco.
 */

const pedido = {
  numero: '0042',
  linha: 'personalizada' as const,
  comprador_nome: '  Ana Maria   de Souza ',
}

const itens = [
  {
    produto_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    nome: 'Caixa milk Safari',
    preco_unitario: '13.50',
    quantidade: 10,
    produtos: { descricao: 'Caixinha personalizada com o nome da criança.' },
  },
]

describe('os itens vão para o Mercado Pago como estão no pedido', () => {
  it('manda código, nome, descrição, categoria, quantidade e preço de cada item', () => {
    const { additional_info } = dadosParaAprovar({ pedido, itens })

    expect(additional_info.items).toEqual([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        title: 'Caixa milk Safari',
        description: 'Caixinha personalizada com o nome da criança.',
        category_id: 'others',
        quantity: 10,
        unit_price: 13.5,
      },
    ])
  })

  it('classifica o material pedagógico como arquivo digital', () => {
    /* É PDF liberado no Drive: "virtual_goods" na lista de categorias
       deles. Mandar como objeto físico faz o antifraude esperar entrega. */
    const { additional_info } = dadosParaAprovar({
      pedido: { ...pedido, linha: 'pedagogica' },
      itens,
    })

    expect(additional_info.items[0].category_id).toBe('virtual_goods')
  })

  it('não perde o item quando o produto saiu do catálogo depois da compra', () => {
    /* `produto_id` vira null quando ela apaga o produto; o pedido antigo
       ainda pode ser cobrado de novo e não pode quebrar. */
    const { additional_info } = dadosParaAprovar({
      pedido,
      itens: [{ ...itens[0], produto_id: null, produtos: null }],
    })

    expect(additional_info.items[0].id).toBe('0042-1')
    expect(additional_info.items[0].description).toBe('Caixa milk Safari')
  })

  it('corta descrição longa em vez de arriscar a cobrança', () => {
    const longa = 'a'.repeat(900)
    const { additional_info } = dadosParaAprovar({
      pedido,
      itens: [{ ...itens[0], produtos: { descricao: longa } }],
    })

    expect(additional_info.items[0].description.length).toBeLessThanOrEqual(256)
  })
})

describe('o nome de quem compra vai separado em nome e sobrenome', () => {
  it('separa o primeiro nome do resto', () => {
    expect(nomeESobrenome('  Ana Maria   de Souza ')).toEqual({
      first_name: 'Ana',
      last_name: 'Maria de Souza',
    })
  })

  it('não inventa sobrenome para quem digitou um nome só', () => {
    expect(nomeESobrenome('Ana')).toEqual({ first_name: 'Ana' })
  })

  it('vai no comprador e no additional_info, que a medição confere nos dois', () => {
    const dados = dadosParaAprovar({ pedido, itens })

    expect(dados.payer).toEqual({ first_name: 'Ana', last_name: 'Maria de Souza' })
    expect(dados.additional_info.payer).toEqual(dados.payer)
  })
})

describe('o identificador do aparelho', () => {
  it('aceita o que o SDK do Mercado Pago gera', () => {
    expect(dispositivoDaCompra('armor.4b5e8a0c1f2d3e4f5a6b7c8d9e0f1a2b')).toBe(
      'armor.4b5e8a0c1f2d3e4f5a6b7c8d9e0f1a2b',
    )
  })

  it('descarta o que não parece um identificador, em vez de mandar num cabeçalho', () => {
    /* Vem do navegador: quebra de linha num cabeçalho HTTP é injeção. */
    expect(dispositivoDaCompra('abc\r\nX-Outro: 1')).toBeUndefined()
    expect(dispositivoDaCompra('x'.repeat(300))).toBeUndefined()
    expect(dispositivoDaCompra(undefined)).toBeUndefined()
    expect(dispositivoDaCompra(42)).toBeUndefined()
  })
})

describe('o nome na fatura do cartão', () => {
  it('não manda nada enquanto ela não escolher o texto', () => {
    /* Sem o campo, o Mercado Pago usa o nome da conta dela, que é o que
       já acontece hoje. */
    expect(descricaoNaFatura(undefined)).toBeUndefined()
    expect(descricaoNaFatura('   ')).toBeUndefined()
    expect(dadosParaAprovar({ pedido, itens }).statement_descriptor).toBeUndefined()
  })

  it('manda o texto escolhido, em maiúsculas', () => {
    expect(dadosParaAprovar({ pedido, itens, fatura: 'Feito p Voce' }).statement_descriptor).toBe(
      'FEITO P VOCE',
    )
  })

  it('ignora texto com acento, símbolo ou comprido, que o banco pode recusar', () => {
    expect(descricaoNaFatura('Feito para Você')).toBeUndefined()
    expect(descricaoNaFatura('LOJA*PROMO')).toBeUndefined()
    expect(descricaoNaFatura('UM NOME LONGO DEMAIS PARA FATURA')).toBeUndefined()
  })
})
