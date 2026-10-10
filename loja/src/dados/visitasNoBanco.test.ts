import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const rpc = vi.fn()

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => true,
  bancoDoNavegador: () => ({ rpc }),
}))

const { contarVisita, contarEtapa, funilDaLoja } = await import('./visitasNoBanco')

const guardado = new Map<string, string>()
const sessao = {
  getItem: (chave: string) => guardado.get(chave) ?? null,
  setItem: (chave: string, valor: string) => void guardado.set(chave, valor),
}

const naLoja = (hostname = 'feitoparavocepapelaria.com.br') =>
  vi.stubGlobal('window', { location: { hostname }, sessionStorage: sessao })

const chamadasDe = (funcao: string) => rpc.mock.calls.filter(([nome]) => nome === funcao)

beforeEach(() => {
  guardado.clear()
  rpc.mockReset().mockResolvedValue({ data: null, error: null })
  naLoja()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('contar uma etapa do funil', () => {
  it('conta cada etapa uma vez por visita, mesmo que a cliente volte nela', async () => {
    await contarEtapa('produto')
    await contarEtapa('produto')

    expect(chamadasDe('contar_etapa')).toHaveLength(1)
  })

  it('não conta a máquina de quem está construindo a loja', async () => {
    naLoja('127.0.0.1')

    await contarEtapa('carrinho')

    expect(rpc).not.toHaveBeenCalled()
  })

  it('leva a origem de quem entrou, e não a página anterior da própria loja', async () => {
    await contarVisita('/', 'https://l.instagram.com/', '')
    await contarEtapa('carrinho')

    expect(chamadasDe('contar_etapa')[0][1]).toEqual({ p_etapa: 'carrinho', p_origem: 'instagram' })
  })

  it('conta como direto quando a origem da visita não ficou guardada', async () => {
    await contarEtapa('checkout')

    expect(chamadasDe('contar_etapa')[0][1]).toEqual({ p_etapa: 'checkout', p_origem: 'direto' })
  })

  it('não deixa uma falha da medição atrapalhar a compra', async () => {
    rpc.mockRejectedValue(new Error('sem rede'))

    await expect(contarEtapa('pagamento')).resolves.toBeUndefined()
  })
})

describe('ler o funil para o painel', () => {
  it('devolve as pessoas de cada etapa como o banco mandou', async () => {
    rpc.mockResolvedValue({
      data: [
        { etapa: 'produto', pessoas: 12 },
        { etapa: 'pago', pessoas: 1 },
      ],
      error: null,
    })

    expect(await funilDaLoja(7)).toEqual([
      { etapa: 'produto', pessoas: 12 },
      { etapa: 'pago', pessoas: 1 },
    ])
    expect(rpc).toHaveBeenCalledWith('funil_da_loja', { p_dias: 7 })
  })

  it('devolve vazio quando o banco falha, e o painel mostra sem dado', async () => {
    rpc.mockRejectedValue(new Error('sem rede'))

    expect(await funilDaLoja(30)).toEqual([])
  })
})
