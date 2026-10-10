import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Nenhum e-mail de pedido sai da loja; prometer um deixa a cliente esperando à toa.
const telas = ['Checkout.jsx', 'PagamentoMercadoPago.jsx']

describe('a cliente não é avisada de um e-mail que nunca chega', () => {
  it.each(telas)('%s não promete e-mail de confirmação', (arquivo) => {
    const fonte = readFileSync(join(__dirname, arquivo), 'utf8')
    expect(fonte).not.toMatch(/recebe um e-mail|receber a confirmação|confirmação vai/i)
  })
})
