import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * As funções do servidor usam as regras de qualidade do Mercado Pago.
 *
 * As regras têm teste próprio; este confere que elas estão ligadas. Regra
 * testada que a função não chama é a mesma nota baixa no painel deles,
 * com o CI verde.
 */

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ler = (...caminho: string[]) => readFileSync(join(RAIZ, ...caminho), 'utf8')

const cobrar = ler('supabase', 'funcoes', 'cobrar', 'index.ts')
const aviso = ler('supabase', 'funcoes', 'aviso-do-pagamento', 'index.ts')
const tela = ler('loja', 'src', 'telas', 'PagamentoMercadoPago.jsx')

describe('a cobrança manda o que o antifraude usa', () => {
  it('manda itens, nome e sobrenome montados pelas regras', () => {
    expect(cobrar).toContain("from '../../../loja/src/dominio/dadosParaAprovar.ts'")
    expect(cobrar).toContain('...paraAprovar,')
    expect(cobrar).toContain('...paraAprovar.payer,')
  })

  it('lê os itens do banco, e não do navegador', () => {
    expect(cobrar).toContain(".from('itens_do_pedido')")
  })

  it('repassa o aparelho no cabeçalho que o Mercado Pago lê', () => {
    expect(cobrar).toContain("'X-meli-session-id': dispositivo")
    expect(cobrar).toContain('dispositivoDaCompra(cobranca.dispositivo)')
  })

  it('a tela carrega o script que gera o identificador e o manda', () => {
    /* Medido em 19/10: só o SDK v2 deixa `MP_DEVICE_SESSION_ID` vazio; o
       security.js preenche com "armor.<hex>". */
    expect(tela).toContain("'https://www.mercadopago.com/v2/security.js'")
    expect(tela).toContain("setAttribute('view', 'checkout')")
    expect(tela).toContain('dispositivo: window.MP_DEVICE_SESSION_ID')
  })
})

describe('o aviso confere a assinatura antes de ler o corpo', () => {
  it('confere a x-signature com o segredo do ambiente', () => {
    expect(aviso).toContain("Deno.env.get('MERCADOPAGO_SEGREDO_DO_AVISO')")
    expect(aviso).toContain("req.headers.get('x-signature')")
    expect(aviso).toContain("req.headers.get('x-request-id')")
  })

  it('responde 401 antes de perguntar ao Mercado Pago ou gravar', () => {
    const recusa = aviso.indexOf("responder({ erro: 'assinatura inválida' }, 401)")
    expect(recusa).toBeGreaterThan(-1)
    expect(recusa).toBeLessThan(aviso.indexOf('await req.json()'))
    expect(recusa).toBeLessThan(aviso.indexOf('api.mercadopago.com/v1/payments'))
    expect(recusa).toBeLessThan(aviso.indexOf("from('eventos_de_pagamento')"))
  })

  it('o segredo não está escrito no código', () => {
    expect(aviso).not.toMatch(/SEGREDO_DO_AVISO'\)\s*\?\?\s*'/)
  })
})

describe('a tela explica a recusa', () => {
  it('usa o recado de cada status_detail', () => {
    expect(tela).toContain("from '@/dominio/recadoDoPagamento'")
    expect(tela).toContain('recadoDoPagamento(')
  })
})
