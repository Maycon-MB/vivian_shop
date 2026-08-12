import { describe, it, expect } from 'vitest'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA } from './linhas'
import type { Produto } from './produto'
import {
  quantidadeMinima,
  permiteVariasUnidades,
  podeAdicionar,
  adicionar,
  alterarQuantidade,
  remover,
  totalCarrinho,
  totalUnidades,
} from './carrinho'

const caneca: Produto = {
  id: '1', slug: 'caneca', nome: 'Caneca personalizada', descricao: '',
  preco: 32, linha: LINHA_PERSONALIZADA, minimo: 10, prazoProducao: 5,
  pesoG: 4000, altCm: 20, largCm: 30, compCm: 30,
}

const caderno: Produto = {
  ...caneca, id: '2', slug: 'caderno', nome: 'Caderno personalizado', preco: 18,
}

const apostila: Produto = {
  id: '3', slug: 'apostila', nome: 'Apostila adaptada', descricao: '',
  preco: 47, linha: LINHA_PEDAGOGICA, minimo: 1, prazoProducao: 0,
}

describe('quantidade mínima', () => {
  it('produto personalizado começa no mínimo do produto', () => {
    expect(quantidadeMinima(caneca)).toBe(10)
  })

  it('não dá para comprar 1 caneca', () => {
    expect(quantidadeMinima(caneca)).toBeGreaterThan(1)
  })

  it('material digital é sempre uma unidade', () => {
    expect(quantidadeMinima(apostila)).toBe(1)
  })

  it('só o produto físico aceita várias unidades', () => {
    expect(permiteVariasUnidades(caneca)).toBe(true)
    expect(permiteVariasUnidades(apostila)).toBe(false)
  })
})

describe('mistura de linhas', () => {
  it('carrinho vazio aceita qualquer produto', () => {
    expect(podeAdicionar([], caneca).ok).toBe(true)
    expect(podeAdicionar([], apostila).ok).toBe(true)
  })

  it('produtos da mesma linha somam', () => {
    expect(podeAdicionar(adicionar([], caneca), caderno).ok).toBe(true)
  })

  it('digital não entra em carrinho de personalizado', () => {
    const resultado = podeAdicionar(adicionar([], caneca), apostila)
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.motivo).toMatch(/compras separadas/)
  })

  it('personalizado não entra em carrinho digital', () => {
    const resultado = podeAdicionar(adicionar([], apostila), caneca)
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.motivo).toMatch(/personalizados/)
  })

  it('a regra vale para o carrinho todo, não só o primeiro item', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    expect(podeAdicionar(carrinho, apostila).ok).toBe(false)
  })

  it('adicionar produto barrado não muda o carrinho', () => {
    const carrinho = adicionar([], caneca)
    expect(adicionar(carrinho, apostila)).toEqual(carrinho)
  })
})

describe('adicionar', () => {
  it('produto personalizado entra já no mínimo', () => {
    expect(adicionar([], caneca)[0].quantidade).toBe(10)
  })

  it('adicionar de novo soma uma unidade, sem duplicar a linha', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caneca)
    expect(carrinho).toHaveLength(1)
    expect(carrinho[0].quantidade).toBe(11)
  })

  it('material digital não duplica', () => {
    let carrinho = adicionar([], apostila)
    carrinho = adicionar(carrinho, apostila)
    expect(carrinho).toHaveLength(1)
    expect(carrinho[0].quantidade).toBe(1)
  })

  it('não modifica o carrinho recebido', () => {
    const original: never[] = []
    adicionar(original, caneca)
    expect(original).toHaveLength(0)
  })
})

describe('alterar quantidade', () => {
  it('abaixo do mínimo, o produto sai do carrinho', () => {
    expect(alterarQuantidade(adicionar([], caneca), caneca.id, 9)).toHaveLength(0)
  })

  it('no mínimo, o produto fica', () => {
    expect(alterarQuantidade(adicionar([], caneca), caneca.id, 10)[0].quantidade).toBe(10)
  })

  it('acima do mínimo, atualiza', () => {
    expect(alterarQuantidade(adicionar([], caneca), caneca.id, 25)[0].quantidade).toBe(25)
  })

  it('não mexe nos outros produtos', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    const depois = alterarQuantidade(carrinho, caneca.id, 20)
    expect(depois.find((i) => i.id === caderno.id)?.quantidade).toBe(10)
  })
})

describe('remover', () => {
  it('tira o produto do carrinho', () => {
    expect(remover(adicionar([], caneca), caneca.id)).toHaveLength(0)
  })
})

describe('totais', () => {
  it('multiplica preço pela quantidade', () => {
    expect(totalCarrinho(adicionar([], caneca))).toBe(320)
  })

  it('soma os itens', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    expect(totalCarrinho(carrinho)).toBe(320 + 180)
  })

  it('carrinho vazio soma zero', () => {
    expect(totalCarrinho([])).toBe(0)
  })

  it('não acumula erro de centavo visível', () => {
    const item = { ...caneca, preco: 18.9 }
    expect(totalCarrinho(adicionar([], item)).toFixed(2)).toBe('189.00')
  })

  it('conta unidades, não linhas', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    expect(totalUnidades(carrinho)).toBe(20)
  })
})
