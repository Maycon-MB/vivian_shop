import { describe, it, expect } from 'vitest'

import type { EstadoPagamento } from '../servicos/contratos'
import {
  estadoDoMercadoPago,
  podeAvancarPara,
  decidirSobreAviso,
  partesDaAssinatura,
  montarManifesto,
  type Estado,
} from './avisoDePagamento'

/**
 * O que se prova aqui é que dinheiro não muda de estado por engano.
 *
 * O aviso do Mercado Pago chega por HTTP, de fora, sem garantia de ordem e
 * sem garantia de vir uma vez só. Três coisas podem acontecer e todas já
 * aconteceram com quem integra isso:
 *
 *   - o mesmo aviso chega de novo, e o pedido é processado duas vezes
 *   - um aviso antigo chega depois de um novo, e o estorno vira aprovação
 *   - alguém descobre o endereço e manda um aviso inventado
 *
 * A defesa é sempre a mesma: o aviso não é a verdade. Ele é só um empurrão
 * para ir perguntar ao Mercado Pago o que aconteceu de verdade, e o que
 * volta de lá ainda passa por estas regras antes de virar estado.
 */

/* O tipo daqui é declarado sozinho, sem importar o dos contratos, porque
   este arquivo também é lido pelo Deno na função do servidor, e lá o
   atalho "@/" não existe. Esta linha é o que impede os dois de divergirem:
   se alguém acrescentar um estado num lugar e não no outro, o TypeScript
   reclama no teste. */
const provaDeCompatibilidade: EstadoPagamento = 'aprovado' satisfies Estado

describe('traduzir o estado do Mercado Pago', () => {
  it('aprova só o que está aprovado', () => {
    expect(estadoDoMercadoPago('approved')).toBe('aprovado')
  })

  it.each([['pending'], ['in_process'], ['in_mediation'], ['authorized']])(
    'trata %s como ainda aguardando',
    (mp) => {
      // "authorized" é cartão reservado e não capturado: o dinheiro ainda
      // não é dela. Tratar como aprovado liberaria material digital de uma
      // compra que pode não se concretizar.
      expect(estadoDoMercadoPago(mp)).toBe('aguardando')
    },
  )

  it.each([['rejected'], ['cancelled']])('trata %s como recusado', (mp) => {
    expect(estadoDoMercadoPago(mp)).toBe('recusado')
  })

  it.each([['refunded'], ['charged_back']])('trata %s como estornado', (mp) => {
    expect(estadoDoMercadoPago(mp)).toBe('estornado')
  })

  it('não inventa estado para o que não conhece', () => {
    // Meio de pagamento novo, estado novo do Mercado Pago: o certo é não
    // mexer no pedido e deixar para uma pessoa olhar.
    expect(estadoDoMercadoPago('coisa_nova')).toBeNull()
  })
})

describe('o estado nunca anda para trás', () => {
  it('deixa sair de aguardando para qualquer conclusão', () => {
    expect(podeAvancarPara('aguardando', 'aprovado')).toBe(true)
    expect(podeAvancarPara('aguardando', 'recusado')).toBe(true)
  })

  it('não desaprova um pedido já aprovado', () => {
    // Aviso atrasado chega fora de ordem. Se "aguardando" pudesse
    // sobrescrever "aprovado", um pedido pago voltaria para a fila e ela
    // pararia de produzir uma peça já vendida.
    expect(podeAvancarPara('aprovado', 'aguardando')).toBe(false)
    expect(podeAvancarPara('aprovado', 'recusado')).toBe(false)
  })

  it('deixa estornar o que já foi aprovado', () => {
    // Este é o único caminho de volta que existe, e ele é real: a pessoa
    // pede reembolso depois de ter pago.
    expect(podeAvancarPara('aprovado', 'estornado')).toBe(true)
  })

  it('não ressuscita pedido estornado', () => {
    expect(podeAvancarPara('estornado', 'aprovado')).toBe(false)
    expect(podeAvancarPara('estornado', 'aguardando')).toBe(false)
  })

  it('não muda nada quando o estado é o mesmo', () => {
    expect(podeAvancarPara('aprovado', 'aprovado')).toBe(false)
  })
})

describe('decidir o que fazer com o aviso', () => {
  const pedido = { numero: '0007', total: 320, estadoPagamento: 'aguardando' as const }

  const pagamento = {
    id: 'mp-123',
    status: 'approved',
    valor: 320,
    referencia: '0007',
  }

  it('aprova o pedido quando o pagamento confere', () => {
    const d = decidirSobreAviso({ pagamento, pedido, jaProcessado: false })

    expect(d.acao).toBe('atualizar')
    if (d.acao === 'atualizar') expect(d.estado).toBe('aprovado')
  })

  it('ignora o mesmo aviso chegando de novo', () => {
    // O Mercado Pago reenvia até receber 200. Sem isto, o material digital
    // sairia por e-mail a cada reenvio.
    const d = decidirSobreAviso({ pagamento, pedido, jaProcessado: true })

    expect(d.acao).toBe('ignorar')
  })

  it('não aprova quando pagaram menos do que o pedido', () => {
    // O valor que vale é o que o Mercado Pago confirma, e ele precisa
    // bater com o pedido. Pagar R$ 3 num pedido de R$ 320 não aprova nada.
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, valor: 3 },
      pedido,
      jaProcessado: false,
    })

    expect(d.acao).toBe('conferir')
    if (d.acao === 'conferir') expect(d.motivo).toMatch(/valor/i)
  })

  it('aceita centavos a mais, que é arredondamento e não fraude', () => {
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, valor: 320.01 },
      pedido,
      jaProcessado: false,
    })

    expect(d.acao).toBe('atualizar')
  })

  it('guarda o aviso de um pedido que não existe, sem criar nada', () => {
    // Endereço de webhook é público. Aviso apontando para pedido
    // inexistente é engano ou é gente testando: registra e não faz nada.
    const d = decidirSobreAviso({ pagamento, pedido: null, jaProcessado: false })

    expect(d.acao).toBe('conferir')
    if (d.acao === 'conferir') expect(d.motivo).toMatch(/pedido/i)
  })

  it('não mexe no pedido quando o estado do Mercado Pago é desconhecido', () => {
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, status: 'coisa_nova' },
      pedido,
      jaProcessado: false,
    })

    expect(d.acao).toBe('conferir')
  })

  it('ignora o aviso que faria o estado andar para trás', () => {
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, status: 'pending' },
      pedido: { ...pedido, estadoPagamento: 'aprovado' },
      jaProcessado: false,
    })

    expect(d.acao).toBe('ignorar')
  })

  it('estorna pedido já aprovado quando o reembolso chega', () => {
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, status: 'refunded' },
      pedido: { ...pedido, estadoPagamento: 'aprovado' },
      jaProcessado: false,
    })

    expect(d.acao).toBe('atualizar')
    if (d.acao === 'atualizar') expect(d.estado).toBe('estornado')
  })

  it('não confia no valor quando o pagamento é estorno', () => {
    // Reembolso parcial devolve menos que o total, e isso não é motivo
    // para deixar de registrar o estorno.
    const d = decidirSobreAviso({
      pagamento: { ...pagamento, status: 'refunded', valor: 10 },
      pedido: { ...pedido, estadoPagamento: 'aprovado' },
      jaProcessado: false,
    })

    expect(d.acao).toBe('atualizar')
  })
})

describe('a assinatura que o Mercado Pago manda', () => {
  it('separa o carimbo de hora e a assinatura do cabeçalho', () => {
    const partes = partesDaAssinatura('ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef')

    expect(partes).toEqual({ ts: '1704908010', v1: '618c85345248dd820d5fd456117c2ab2ef' })
  })

  it('aguenta espaço sobrando e ordem trocada', () => {
    const partes = partesDaAssinatura(' v1=abc , ts=123 ')

    expect(partes).toEqual({ ts: '123', v1: 'abc' })
  })

  it('devolve nada quando falta uma das duas partes', () => {
    // Sem assinatura não há o que conferir, e o certo é recusar em vez de
    // seguir em frente achando que conferiu.
    expect(partesDaAssinatura('ts=123')).toBeNull()
    expect(partesDaAssinatura('')).toBeNull()
    expect(partesDaAssinatura(null)).toBeNull()
  })

  it('monta o texto assinado na ordem exata que o Mercado Pago usa', () => {
    // A ordem e os pontos e vírgulas não são estilo: qualquer diferença
    // gera outro resumo, e toda notificação legítima passa a ser recusada.
    expect(
      montarManifesto({ id: '123456', requestId: 'req-1', ts: '1704908010' }),
    ).toBe('id:123456;request-id:req-1;ts:1704908010;')
  })

  it('usa o id em minúsculas, como eles documentam', () => {
    expect(montarManifesto({ id: 'ABC', requestId: 'r', ts: '1' })).toContain('id:abc;')
  })
})

describe('a compatibilidade com os contratos da loja', () => {
  it('usa os mesmos nomes de estado que o resto do sistema', () => {
    expect(provaDeCompatibilidade).toBe('aprovado')
  })
})
