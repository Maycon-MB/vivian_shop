import { describe, it, expect } from 'vitest'
import { moeda } from './formato'

describe('moeda', () => {
  it('usa vírgula como separador decimal', () => {
    expect(moeda(32)).toBe('R$ 32,00')
  })

  it('mostra os centavos', () => {
    expect(moeda(18.9)).toBe('R$ 18,90')
  })

  it('separa o milhar com ponto', () => {
    expect(moeda(1234.5)).toBe('R$ 1.234,50')
  })

  it('formata o menor pedido possível da linha personalizada', () => {
    expect(moeda(32 * 10)).toBe('R$ 320,00')
  })

  it('não usa espaço não-quebrável, que atrapalharia comparação e busca', () => {
    expect(moeda(10)).not.toContain(' ')
  })
})
