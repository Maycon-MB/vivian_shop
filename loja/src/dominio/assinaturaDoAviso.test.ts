import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'

import {
  conferirAssinatura,
  montarManifesto,
  decidirPelaAssinatura,
} from './assinaturaDoAviso'

/**
 * A assinatura do aviso do Mercado Pago.
 *
 * O aviso já é conferido perguntando o pagamento de volta à API deles, e
 * isso continua. A assinatura barra antes: um POST falso nem chega a
 * consultar nada nem gravar `eventos_de_pagamento`.
 *
 * O cálculo de referência aqui usa `node:crypto`, e não o código testado:
 * o manifesto e o HMAC seguem a documentação de webhooks deles.
 */

const SEGREDO = 'segredo-de-teste-que-nao-e-o-da-loja'

const assinar = (manifesto: string) =>
  createHmac('sha256', SEGREDO).update(manifesto).digest('hex')

const avisoAssinado = (dataId = '123456789', requestId = 'req-abc', ts = '1704908010000') => ({
  assinatura: `ts=${ts},v1=${assinar(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`)}`,
  requestId,
  dataId,
})

describe('o manifesto que o Mercado Pago assina', () => {
  it('segue o modelo id, request-id e ts da documentação', () => {
    expect(montarManifesto({ dataId: '123', requestId: 'r1', ts: '99' })).toBe(
      'id:123;request-id:r1;ts:99;',
    )
  })

  it('usa o id em minúsculas, como eles mandam', () => {
    expect(montarManifesto({ dataId: 'ABC123', requestId: 'r1', ts: '99' })).toBe(
      'id:abc123;request-id:r1;ts:99;',
    )
  })

  it('tira do manifesto o que não veio no aviso', () => {
    expect(montarManifesto({ dataId: '123', requestId: null, ts: '99' })).toBe('id:123;ts:99;')
  })
})

describe('a conferência da assinatura', () => {
  it('aceita o aviso assinado com o segredo da aplicação', async () => {
    expect(await conferirAssinatura({ ...avisoAssinado(), segredo: SEGREDO })).toBe('valida')
  })

  it('recusa assinatura feita com outro segredo', async () => {
    const aviso = avisoAssinado()
    expect(await conferirAssinatura({ ...aviso, segredo: 'outro-segredo' })).toBe('invalida')
  })

  it('recusa assinatura válida reaproveitada para outro pagamento', async () => {
    /* Copiar o cabeçalho de um aviso de verdade e trocar o id é o ataque
       mais barato. O id faz parte do que foi assinado. */
    const aviso = avisoAssinado('111')
    expect(await conferirAssinatura({ ...aviso, dataId: '222', segredo: SEGREDO })).toBe(
      'invalida',
    )
  })

  it('recusa cabeçalho mal formado', async () => {
    for (const assinatura of ['lixo', 'ts=1', 'v1=abc', 'ts=1,v1=nao-e-hex']) {
      expect(
        await conferirAssinatura({ assinatura, requestId: 'r', dataId: '1', segredo: SEGREDO }),
        assinatura,
      ).toBe('invalida')
    }
  })

  it('diz que veio sem assinatura, que é diferente de assinatura falsa', async () => {
    expect(
      await conferirAssinatura({ assinatura: null, requestId: 'r', dataId: '1', segredo: SEGREDO }),
    ).toBe('ausente')
  })
})

describe('o que o aviso faz com o resultado', () => {
  it('barra assinatura falsa sempre', () => {
    expect(decidirPelaAssinatura({ resultado: 'invalida', exigir: false })).toBe('recusar')
    expect(decidirPelaAssinatura({ resultado: 'invalida', exigir: true })).toBe('recusar')
  })

  it('barra aviso sem assinatura quando a loja exige', () => {
    expect(decidirPelaAssinatura({ resultado: 'ausente', exigir: true })).toBe('recusar')
  })

  it('deixa passar aviso sem assinatura enquanto a loja não exige', () => {
    /* Pagamento aprovado sem aviso fica "esperando" para sempre. Até ter
       prova no log de que todo aviso de verdade vem assinado, o sem
       assinatura segue para a conferência na API, que já existia. */
    expect(decidirPelaAssinatura({ resultado: 'ausente', exigir: false })).toBe('seguir')
  })

  it('segue com assinatura válida', () => {
    expect(decidirPelaAssinatura({ resultado: 'valida', exigir: true })).toBe('seguir')
  })
})
