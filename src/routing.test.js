/**
 * Testes do roteamento por hash.
 *
 * Roda com o test runner do próprio Node, sem dependência nova:
 *   node --test src/routing.test.js
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { VIEWS, LEGACY_HASHES, viewForHash, hashForView, DEFAULT_VIEW } from './routing.js'

test('cada view tem ida e volta consistente', () => {
  VIEWS.forEach((view) => {
    assert.equal(hashForView(view.id), view.hash, `hashForView('${view.id}')`)
    assert.equal(viewForHash(view.hash), view.id, `viewForHash('${view.hash}')`)
  })
})

test('a loja é a entrada quando não há hash', () => {
  assert.equal(viewForHash(''), 'landing')
  assert.equal(viewForHash('#'), 'landing')
  assert.equal(viewForHash(undefined), 'landing')
  assert.equal(viewForHash(null), 'landing')
})

test('a loja não escreve hash no endereço', () => {
  assert.equal(hashForView('landing'), '')
})

test('links antigos continuam chegando em alguma página', () => {
  Object.entries(LEGACY_HASHES).forEach(([hash, expected]) => {
    assert.equal(viewForHash(hash), expected, `link antigo ${hash}`)
  })
})

test('todo destino de link antigo é uma view que existe', () => {
  const ids = new Set(VIEWS.map((view) => view.id))
  Object.entries(LEGACY_HASHES).forEach(([hash, target]) => {
    assert.ok(ids.has(target), `${hash} aponta para view inexistente: ${target}`)
  })
})

test('hash desconhecido cai na loja em vez de tela em branco', () => {
  assert.equal(viewForHash('#nao-existe'), DEFAULT_VIEW)
  assert.equal(viewForHash('#linhas'), DEFAULT_VIEW)
  assert.equal(viewForHash('#catalog'), DEFAULT_VIEW)
})

test('view desconhecida não quebra a barra de endereço', () => {
  assert.equal(hashForView('inexistente'), '')
})

test('nenhum hash é declarado duas vezes', () => {
  const hashes = VIEWS.map((view) => view.hash).filter(Boolean)
  assert.equal(new Set(hashes).size, hashes.length, 'hash duplicado entre views')

  const collisions = Object.keys(LEGACY_HASHES).filter((hash) => hashes.includes(hash))
  assert.deepEqual(collisions, [], 'link antigo colide com hash atual')
})
