import { describe, it, expect } from 'vitest'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA, LINHAS, ehDigital } from './linhas'

describe('linhas da loja', () => {
  it('a linha pedagógica é digital', () => {
    expect(ehDigital(LINHA_PEDAGOGICA)).toBe(true)
  })

  it('a linha personalizada é física', () => {
    expect(ehDigital(LINHA_PERSONALIZADA)).toBe(false)
  })

  it('os nomes das linhas são os que a cliente usa', () => {
    expect(LINHA_PERSONALIZADA).toBe('Papelaria personalizada')
    expect(LINHA_PEDAGOGICA).toBe('Papelaria pedagógica')
  })

  it('existem exatamente duas linhas', () => {
    expect(LINHAS).toHaveLength(2)
  })
})
