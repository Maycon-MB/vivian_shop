import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Para onde o Mercado Pago avisa que o pagamento saiu.
 *
 * ── Por que isto virou teste ──────────────────────────────────────────
 *
 * A cobrança criava o pagamento sem dizer para onde avisar. Quem decidia
 * era o painel do Mercado Pago, e lá o endereço é um campo separado por
 * ambiente: um para teste, outro para produção.
 *
 * O de teste foi preenchido em 25/08 e funcionou. O de produção só passou
 * a existir em 01/09, com as credenciais dela, e ninguém conferiu depois
 * da virada. Era o único elo da corrente do dinheiro morando fora do
 * repositório.
 *
 * A falha é silenciosa, e é a pior forma dela: o pagamento aprova, o
 * dinheiro entra na conta dela, e o pedido fica "esperando o pagamento"
 * para sempre em `/admin`. Nada dá erro, nada fica vermelho, o CI
 * continua verde, e quem descobre é ela conferindo o extrato contra os
 * pedidos, ou a cliente perguntando por que não foi produzido.
 *
 * Com o endereço na própria cobrança, ele é o mesmo em teste e em
 * produção, está versionado, e some da lista de coisas para lembrar de
 * conferir num painel.
 */

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const FUNCOES = join(RAIZ, 'supabase', 'funcoes')

const cobrar = readFileSync(join(FUNCOES, 'cobrar', 'index.ts'), 'utf8')

describe('a cobrança diz para onde o Mercado Pago deve avisar', () => {
  it('manda o endereço do aviso junto com o pagamento', () => {
    /* Sem isto, o pedido dela fica preso em "esperando o pagamento"
       mesmo com o dinheiro já na conta. */
    expect(cobrar).toContain('notification_url')
  })

  it('aponta para uma função que existe de verdade', () => {
    /* Endereço com o nome errado não dá erro na hora de cobrar: o
       Mercado Pago aceita, cobra, e o aviso vai para o vazio. Foi um
       nome a uma letra de distância que deixou `aviso-de-pagamento`
       morto no repositório desde agosto. */
    expect(cobrar).toContain('aviso-do-pagamento')
    expect(existsSync(join(FUNCOES, 'aviso-do-pagamento'))).toBe(true)
  })

  it('monta o endereço a partir do ambiente, e não escrito à mão', () => {
    /* O endereço do projeto escrito no meio do código é o que faz uma
       cópia da loja avisar o banco da outra. Ele já está em
       `SUPABASE_URL`, que a própria função usa para falar com o banco. */
    expect(cobrar).toMatch(
      /Deno\.env\.get\('SUPABASE_URL'\)\}\/functions\/v1\/aviso-do-pagamento/,
    )
    expect(cobrar).not.toContain('https://kbvgdnrymwfavgkxqvjh.supabase.co')
  })

  it('continua sem mandar quanto cobrar', () => {
    /* A regra que não pode ser perdida numa mexida no corpo da cobrança:
       o valor vem da tabela `pedidos`, e nunca do navegador. */
    expect(cobrar).toContain('transaction_amount: Number(pedido.total)')
  })
})
