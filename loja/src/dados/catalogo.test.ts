import { describe, it, expect } from 'vitest'
import { catalogoMemoria, PRODUTOS_EXEMPLO } from './catalogoMemoria'
import { paraProduto } from './catalogoSupabase'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA } from '@/dominio/linhas'

describe('catálogo em memória', () => {
  it('lista todos os produtos quando não filtra', async () => {
    const produtos = await catalogoMemoria.listar()
    expect(produtos).toHaveLength(PRODUTOS_EXEMPLO.length)
  })

  it('filtra pela linha personalizada', async () => {
    const produtos = await catalogoMemoria.listar(LINHA_PERSONALIZADA)
    expect(produtos.length).toBeGreaterThan(0)
    expect(produtos.every((p) => p.linha === LINHA_PERSONALIZADA)).toBe(true)
  })

  it('filtra pela linha pedagógica', async () => {
    const produtos = await catalogoMemoria.listar(LINHA_PEDAGOGICA)
    expect(produtos.length).toBeGreaterThan(0)
    expect(produtos.every((p) => p.linha === LINHA_PEDAGOGICA)).toBe(true)
  })

  it('acha produto pelo endereço', async () => {
    const produto = await catalogoMemoria.buscarPorSlug('caderno-personalizado')
    expect(produto?.nome).toBe('Caderno personalizado')
  })

  it('devolve nulo quando o endereço não existe', async () => {
    expect(await catalogoMemoria.buscarPorSlug('nao-existe')).toBeNull()
  })

  it('todo produto físico tem as medidas do pacote', async () => {
    const produtos = await catalogoMemoria.listar(LINHA_PERSONALIZADA)
    for (const produto of produtos) {
      expect(produto.pesoG, `${produto.nome} sem peso`).toBeGreaterThan(0)
      expect(produto.altCm, `${produto.nome} sem altura`).toBeGreaterThan(0)
    }
  })

  it('todo produto físico tem mínimo maior que um', async () => {
    const produtos = await catalogoMemoria.listar(LINHA_PERSONALIZADA)
    expect(produtos.every((p) => p.minimo > 1)).toBe(true)
  })

  it('os endereços não se repetem', async () => {
    const produtos = await catalogoMemoria.listar()
    const slugs = produtos.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('conversão do formato do banco', () => {
  const cru = {
    id: 'abc',
    slug: 'caneca',
    nome: 'Caneca',
    descricao: 'Com nome',
    preco_reais: '32.00',
    linha: LINHA_PERSONALIZADA,
    minimo: 10,
    prazo_producao: 5,
    peso_g: 4000,
    alt_cm: 20,
    larg_cm: 30,
    comp_cm: 30,
  }

  it('preço vem como texto do Postgres e vira número', () => {
    const produto = paraProduto({ ...cru, preco_reais: '18.90' })
    expect(produto.preco).toBe(18.9)
    expect(typeof produto.preco).toBe('number')
  })

  it('converte os nomes das colunas', () => {
    const produto = paraProduto(cru)
    expect(produto.prazoProducao).toBe(5)
    expect(produto.pesoG).toBe(4000)
  })

  it('produto digital não traz medidas', () => {
    const produto = paraProduto({
      ...cru,
      linha: LINHA_PEDAGOGICA,
      peso_g: null,
      alt_cm: null,
      larg_cm: null,
      comp_cm: null,
    })
    expect(produto.pesoG).toBeUndefined()
    expect(produto.altCm).toBeUndefined()
  })
})
