/**
 * Testes das regras de catálogo.
 *
 *   node --test src/catalogo.test.js
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { PERSONALIZADA, PEDAGOGICA, isDigital, podeAdicionarAoCarrinho } from './catalogo.js'

const fisico = { id: 1, name: 'Caderno personalizado', category: PERSONALIZADA }
const outroFisico = { id: 2, name: 'Cartela de adesivos', category: PERSONALIZADA }
const digital = { id: 4, name: 'Apostila adaptada', category: PEDAGOGICA }
const outroDigital = { id: 5, name: 'Kit rotina visual', category: PEDAGOGICA }

test('só a linha pedagógica é digital', () => {
  assert.equal(isDigital(PEDAGOGICA), true)
  assert.equal(isDigital(PERSONALIZADA), false)
})

test('carrinho vazio aceita qualquer produto', () => {
  assert.equal(podeAdicionarAoCarrinho([], fisico).ok, true)
  assert.equal(podeAdicionarAoCarrinho([], digital).ok, true)
})

test('produtos da mesma linha somam no carrinho', () => {
  assert.equal(podeAdicionarAoCarrinho([fisico], outroFisico).ok, true)
  assert.equal(podeAdicionarAoCarrinho([digital], outroDigital).ok, true)
})

test('o mesmo produto pode ser somado de novo', () => {
  assert.equal(podeAdicionarAoCarrinho([fisico], fisico).ok, true)
})

test('digital não entra em carrinho de personalizado', () => {
  const resultado = podeAdicionarAoCarrinho([fisico], digital)
  assert.equal(resultado.ok, false)
  assert.match(resultado.motivo, /compras separadas/)
})

test('personalizado não entra em carrinho digital', () => {
  const resultado = podeAdicionarAoCarrinho([digital], fisico)
  assert.equal(resultado.ok, false)
  assert.match(resultado.motivo, /compras separadas/)
})

test('o aviso diz qual linha falta comprar depois', () => {
  assert.match(podeAdicionarAoCarrinho([fisico], digital).motivo, /material digital/)
  assert.match(podeAdicionarAoCarrinho([digital], fisico).motivo, /personalizados/)
})

test('a regra vale para o carrinho todo, não só o primeiro item', () => {
  const carrinho = [fisico, outroFisico, fisico]
  assert.equal(podeAdicionarAoCarrinho(carrinho, digital).ok, false)
  assert.equal(podeAdicionarAoCarrinho(carrinho, outroFisico).ok, true)
})

test('bloqueio sempre vem com motivo legível', () => {
  const resultado = podeAdicionarAoCarrinho([digital], fisico)
  assert.equal(typeof resultado.motivo, 'string')
  assert.ok(resultado.motivo.length > 20, 'motivo curto demais para explicar')
})
