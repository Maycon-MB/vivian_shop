import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('links das políticas', () => {
  it('usam o vinho, que passa de 4,5:1 no papel, e não o coral', () => {
    const css = readFileSync(join(__dirname, 'paginas.css'), 'utf8')
    const regra = css.match(/^\.politica a \{[^}]*\}/m)?.[0] ?? ''
    expect(regra).toContain('var(--color-ink)')
  })
})
