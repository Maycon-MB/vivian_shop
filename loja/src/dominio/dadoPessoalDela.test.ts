import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'

/**
 * Nenhum dado pessoal da Vivian entra no repositório.
 *
 * Ele é público. Está escrito no CLAUDE.md desde o começo que chave
 * secreta não entra aqui, e eu apliquei a regra às chaves e não a ela.
 *
 * O resultado, descoberto em 31/08:
 *
 *   - o **CPF** e o nome completo dela ficaram dez dias em
 *     `docs/o-endereco-da-loja.md`
 *   - o **endereço residencial** ficou catorze dias em
 *     `docs/contrato-modelo.md`
 *   - o **nome da rua onde ela mora** era o exemplo do campo de endereço
 *     no checkout, e o **CEP da casa dela** aparecia na mensagem de erro
 *     do CEP e na página de perguntas
 *
 * Os dois últimos são piores que os primeiros: não estavam num documento
 * de quem programa, estavam **no site**, à vista de toda cliente que
 * abrisse o checkout.
 *
 * Ela vende sozinha pela internet e lida com desconhecido o dia inteiro.
 *
 * ── Por que buscar no `git grep`, e não ler arquivo por arquivo ────────
 *
 * Porque o vazamento não escolhe pasta. Ele apareceu em documentação, em
 * tela e em teste, e a próxima vez vai ser num lugar que eu não pensaria
 * em varrer.
 */

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

/* O que não pode aparecer em lugar nenhum.
 *
 * O CPF está escrito aqui de propósito, e é a única cópia que sobra: sem
 * ele o teste não tem como procurar. Se um dia o repositório deixar de ser
 * público, isto pode virar uma variável de ambiente. */
const PROIBIDO: [string, string][] = [
  ['[dado pessoal removido]', 'o CPF dela'],
  ['[dado pessoal removido]', 'a rua onde ela mora'],
  ['[dado pessoal removido]', 'o CEP da casa dela'],
  ['[nome removido]', 'o nome completo dela'],
]

const procurar = (padrao: string): string[] => {
  try {
    const saida = execFileSync(
      'git',
      ['grep', '-l', '-I', '-E', padrao, '--', '.', ':!*dadoPessoalDela.test.ts'],
      { cwd: RAIZ, encoding: 'utf8' },
    )
    return saida.split('\n').filter(Boolean)
  } catch {
    /* `git grep` sai com 1 quando não acha nada, que é o caso bom. */
    return []
  }
}

describe('o repositório é público', () => {
  it.each(PROIBIDO)('não guarda %s', (padrao, oQueE) => {
    const arquivos = procurar(padrao)

    expect(arquivos, `${oQueE} apareceu em: ${arquivos.join(', ')}`).toEqual([])
  })

  it('acha de verdade quando existe', () => {
    /* Um teste que nunca acha nada não prova que a busca funciona: ele
       passaria igual com a expressão errada, e continuaria verde no dia em
       que o dado voltasse.

       Esta canária já salvou uma vez. A primeira versão procurava por
       "CLAUDE", que é nome de arquivo e não conteúdo: os quatro testes
       acima passaram porque a busca não achava nada, e não porque o dado
       tinha saído. */
    const achou = procurar('feitoparavocepapelaria')

    expect(achou.length).toBeGreaterThan(0)
  })
})
