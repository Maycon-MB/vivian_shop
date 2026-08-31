import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * As funções do Supabase, e as duas armadilhas de 31/08.
 *
 * Nenhuma das duas apareceu em teste. As duas apareceram na Vivian.
 */

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const NOSSA = join(RAIZ, 'supabase', 'funcoes')
const DO_CLI = join(RAIZ, 'supabase', 'functions')

const funcoes = readdirSync(NOSSA, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

describe('a pasta que o CLI espera', () => {
  it('não fica no repositório', () => {
    /* O CLI do Supabase procura em `supabase/functions/` e as nossas moram
       em `supabase/funcoes/`, porque aqui tudo é escrito em português.
       `scripts/subir-funcoes.mjs` copia na hora de publicar e apaga
       depois.

       Se a cópia ficar versionada, vira a armadilha seguinte: alguém edita
       a pasta em português, sobe a em inglês, e passa meia hora sem
       entender por que a mudança não subiu. */
    expect(existsSync(DO_CLI)).toBe(false)
  })

  it('o script de publicação existe e aponta para a pasta em português', () => {
    // Sem ele, o `supabase functions deploy` não acha nada e não reclama:
    // foi assim que a Vivian recebeu um 404 no meio da autorização.
    const script = readFileSync(join(RAIZ, 'scripts', 'subir-funcoes.mjs'), 'utf8')

    expect(script).toContain("'funcoes'")
    expect(script).toContain("'functions'")
  })
})

describe('o que cada função devolve', () => {
  it.each(funcoes)('%s não tenta desenhar HTML', (nome) => {
    /* O Supabase força `content-type: text/plain` com `nosniff` em
       resposta de Edge Function, para ninguém hospedar página falsa no
       domínio dele.

       A primeira versão de `frete-retorno` devolvia HTML. A Vivian viu o
       código-fonte cru na tela, com os acentos quebrados, no momento
       exato em que a tela deveria dizer que tinha dado certo: funcionou e
       pareceu quebrado.

       Quem precisa mostrar página redireciona para a loja. */
    const codigo = readFileSync(join(NOSSA, nome, 'index.ts'), 'utf8')

    expect(codigo).not.toContain('text/html')
    expect(codigo).not.toContain('<!doctype')
  })
})
