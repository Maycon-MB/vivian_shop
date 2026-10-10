import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, it, expect } from 'vitest'

import { ETAPAS } from './funil'
import { ORIGENS } from './origemDaVisita'

/* O SQL não dá para importar daqui: o teste lê o arquivo que vai ao ar. */
const raiz = path.resolve(__dirname, '..', '..', '..')
const migracoes = path.join(raiz, 'supabase', 'migracoes')
const arquivo = path.join(migracoes, '0020_funil_da_loja.sql')

const semComentarios = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*--.*$/gm, '')

const ler = (nome: string) => semComentarios(readFileSync(path.join(migracoes, nome), 'utf8'))

const sql = existsSync(arquivo) ? semComentarios(readFileSync(arquivo, 'utf8')) : ''

/** O corpo de uma função, do `create` até o `$$;` que a fecha. */
const corpoDa = (funcao: string) => {
  const inicio = sql.indexOf(`create or replace function ${funcao}(`)
  if (inicio < 0) return ''
  const abre = sql.indexOf('$$', inicio)
  const fecha = sql.indexOf('$$', abre + 2)
  return sql.slice(inicio, fecha + 2)
}

describe('a tabela do funil', () => {
  it('existe na migração 0020', () => {
    expect(sql).toMatch(/create table if not exists etapas_do_funil/)
  })

  it('fecha a leitura e a escrita direta, e só abre pelas funções', () => {
    // Desde 30/10/2026 o Supabase não expõe tabela nova sozinho; a loja nem precisa disso.
    expect(sql).toMatch(/alter table etapas_do_funil enable row level security/)
    expect(sql).not.toMatch(/grant\s+(select|insert|update|delete|all)[^;]*on\s+(table\s+)?etapas_do_funil/i)
  })
})

describe('contar uma etapa', () => {
  const corpo = corpoDa('contar_etapa')

  it('aceita só as etapas que a loja conhece', () => {
    const lista = corpo.match(/not in \(([^)]*)\)/)?.[1] ?? ''
    const noBanco = [...lista.matchAll(/'([a-z_]+)'/g)].map((m) => m[1])

    expect(noBanco).toEqual([...ETAPAS])
  })

  it('usa a mesma lista fechada de origens da contagem de visita', () => {
    const noBanco = [...corpo.matchAll(/when '([a-z_]+)' then/g)].map((m) => m[1])

    expect(new Set([...noBanco, 'outro'])).toEqual(new Set(ORIGENS))
  })

  it('roda com o dono da função e sem caminho de busca aberto', () => {
    expect(corpo).toMatch(/security definer/)
    expect(corpo).toMatch(/set search_path = ''/)
  })

  it('pode ser chamada por quem visita sem conta', () => {
    expect(sql).toMatch(/grant execute on function contar_etapa\([^)]*\) to anon, authenticated;/)
  })
})

describe('ler o funil', () => {
  const corpo = corpoDa('funil_da_loja')

  it('responde só para a dona, nas duas partes da conta', () => {
    const perguntas = corpo.match(/exists \(select 1 from public\.donas_da_loja d where d\.id = auth\.uid\(\)\)/g)

    expect(perguntas).toHaveLength(2)
  })

  it('não devolve nem a linha do zero para quem não é dona', () => {
    // `count(*)` sem `group by` sempre devolve uma linha; o `having` é o que a esconde.
    expect(corpo).toMatch(/having exists \(select 1 from public\.donas_da_loja/)
  })

  it('conta como pago só pedido aprovado', () => {
    expect(corpo).toMatch(/estado_pagamento = 'aprovado'/)
  })

  it('tira os pedidos de teste com as mesmas regras da limpeza', () => {
    const limpeza = ler('0015_limpar_o_que_o_teste_cria.sql')
    const regras = (texto: string) => [...texto.matchAll(/comprador_email ~\* '([^']+)'/g)].map((m) => m[1])

    expect(regras(corpo)).toEqual(regras(limpeza))
    expect(regras(corpo).length).toBeGreaterThan(0)
  })

  it('não pode ser chamada pela chave anônima', () => {
    expect(sql).toMatch(/grant execute on function funil_da_loja\([^)]*\) to authenticated;/)
    expect(sql).not.toMatch(/grant execute on function funil_da_loja[^;]*anon/)
  })
})
