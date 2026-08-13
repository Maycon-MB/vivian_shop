import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

/**
 * O que todo teste de tela precisa antes de começar.
 *
 * Sem isto, cada arquivo repetiria a mesma preparação — e, pior, um teste
 * que esquecesse de limpar deixaria a tela anterior montada, fazendo o
 * teste seguinte encontrar dois botões "Pagar" e falhar por um motivo que
 * não tem nada a ver com o que ele testa.
 */

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

beforeEach(() => {
  /* O jsdom não implementa isto, e a tela usa nos dois casos: rolar até o
     primeiro campo com erro e reagir a "menos movimento" no sistema. Sem
     os dois, o teste quebra em coisa que não é defeito da loja. */
  Element.prototype.scrollIntoView = vi.fn()

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (consulta: string) => ({
      matches: false,
      media: consulta,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
})

/**
 * O Next fornece estes em tempo de execução; num teste isolado eles não
 * existem. O `push` é uma função observável de propósito: é assim que o
 * teste confere que a compra levou a pessoa para a confirmação.
 */
export const navegacaoFalsa = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }

vi.mock('next/navigation', () => ({
  useRouter: () => navegacaoFalsa,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...resto }: { children: React.ReactNode; href: string }) => {
    const React = require('react')
    return React.createElement('a', { href, ...resto }, children)
  },
}))
