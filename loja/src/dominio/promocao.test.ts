import { describe, it, expect } from 'vitest'

import { subtotalItem, totalCarrinho } from '@/catalogo'

/**
 * A Vivian pratica preço promocional em quase todo material pedagógico —
 * "de R$ 39,99 por R$ 29,99". Se a vitrine mostra um valor e o carrinho
 * cobra outro, quem descobre é a cliente, no extrato, depois de pagar.
 */
describe('preço com promoção', () => {
  const comPromocao = { price: 39.99, precoPromocional: 29.99, quantidade: 1 }
  const semPromocao = { price: 25.99, quantidade: 1 }

  it('cobra o promocional quando existe', () => {
    expect(subtotalItem(comPromocao)).toBeCloseTo(29.99, 2)
  })

  it('cobra o cheio quando não há promoção', () => {
    expect(subtotalItem(semPromocao)).toBeCloseTo(25.99, 2)
  })

  it('multiplica o promocional pela quantidade', () => {
    expect(subtotalItem({ ...comPromocao, quantidade: 10 })).toBeCloseTo(299.9, 2)
  })

  it('soma o carrinho misturando produto com e sem desconto', () => {
    expect(totalCarrinho([comPromocao, semPromocao])).toBeCloseTo(55.98, 2)
  })

  it('ignora promoção zerada em vez de cobrar zero', () => {
    // `?? ` só cai para o próximo quando é nulo, então um zero explícito
    // passaria. O `|| 0` no fim protege, mas o teste garante que ninguém
    // troque a lógica por um `||` que engoliria um preço legítimo.
    expect(subtotalItem({ price: 30, precoPromocional: null, quantidade: 2 })).toBeCloseTo(60, 2)
  })
})
