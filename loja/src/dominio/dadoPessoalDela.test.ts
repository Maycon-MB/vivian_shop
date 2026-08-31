import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'

/**
 * Nenhum dado pessoal entra no repositório.
 *
 * Ele é público. Está escrito no CLAUDE.md desde o começo que chave
 * secreta não entra aqui, e eu apliquei a regra às chaves e não às
 * pessoas.
 *
 * O que estava exposto, descoberto em 31/08:
 *
 *   - o **CPF** e o nome completo da Vivian, dez dias em
 *     `docs/o-endereco-da-loja.md`
 *   - o **endereço residencial** dela, catorze dias em
 *     `docs/contrato-modelo.md`
 *   - o **nome da rua onde ela mora**, como exemplo do campo de endereço
 *     no checkout, e o **CEP da casa dela** na mensagem de erro e na
 *     página de perguntas
 *
 * Os dois últimos são os piores: não estavam em documento de quem
 * programa, estavam **no site**, à vista de toda cliente que abrisse o
 * checkout. Ela vende sozinha pela internet.
 *
 * ── Por que a forma, e não o valor dela ────────────────────────────────
 *
 * A primeira versão deste teste listava o CPF, a rua e o CEP dela para
 * poder procurá-los. Guardar o dado para proibir o dado é o mesmo
 * vazamento com outro nome: eu passei a tarde tirando o CPF do histórico
 * e deixei uma cópia dentro do arquivo que existe para impedir isso. Pior:
 * escrito como expressão de busca, com barras, ele escapou da própria
 * reescrita do histórico.
 *
 * Procurar pela forma pega o CPF dela, o meu, e o de qualquer cliente que
 * apareça aqui um dia, sem este arquivo precisar saber número de ninguém.
 *
 * A rua e o CEP saíram do repositório e do histórico. Não há padrão que os
 * pegue sem escrevê-los aqui, então ficam de fora: o que protege daqui
 * para frente é o CEP viver só na variável da função de frete.
 */

const RAIZ = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

interface Proibido {
  padrao: string
  oQueE: string
  /** O que pode aparecer mesmo casando com o padrão, e por quê. */
  liberado?: RegExp
}

const PROIBIDO: Proibido[] = [
  {
    padrao: '[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2}',
    oQueE: 'um CPF',
    /* Máscara de campo não é CPF de ninguém: `000.000.000-00` é o cinza
       que a tela mostra para a pessoa saber o formato. */
    liberado: /000[.]000[.]000-00/,
  },
  {
    padrao: '[0-9]{2}[.][0-9]{3}[.][0-9]{3}/[0-9]{4}-[0-9]{2}',
    oQueE: 'um CNPJ',
    /* O contrato traz o CNPJ do Maycon, que é dele e é registro público:
       está ali de propósito, porque contrato identifica quem assina. O de
       qualquer outra pessoa continua reprovando. */
    liberado: /contrato-modelo[.]md/,
  },
]

/* Com `-n`, para vir `arquivo:linha:conteúdo`. Sem o conteúdo não há como
   separar a máscara de um CPF de verdade. */
const procurar = (padrao: string): string[] => {
  try {
    const saida = execFileSync(
      'git',
      ['grep', '-n', '-I', '-E', padrao, '--', '.', ':!*dadoPessoalDela.test.ts'],
      { cwd: RAIZ, encoding: 'utf8' },
    )
    return saida.split('\n').filter(Boolean)
  } catch {
    /* `git grep` sai com 1 quando não acha nada, que é o caso bom. */
    return []
  }
}

const achados = ({ padrao, liberado }: Proibido): string[] => {
  const linhas = procurar(padrao)
  if (!liberado) return linhas

  return linhas.filter((linha) => !liberado.test(linha))
}

describe('o repositório é público', () => {
  it.each(PROIBIDO)('não guarda $oQueE', (proibido) => {
    const linhas = achados(proibido)

    expect(linhas, `${proibido.oQueE} apareceu em: ${linhas.join(' | ')}`).toEqual([])
  })

  it('acha de verdade quando existe', () => {
    /* Um teste que nunca acha nada não prova que a busca funciona: ele
       passaria igual com a expressão errada, e continuaria verde no dia em
       que o dado voltasse.

       Esta canária já salvou uma vez. A primeira versão procurava por
       "CLAUDE", que é nome de arquivo e não conteúdo: os testes acima
       passaram porque a busca não achava nada em lugar nenhum. */
    expect(procurar('feitoparavocepapelaria').length).toBeGreaterThan(0)
  })
})
