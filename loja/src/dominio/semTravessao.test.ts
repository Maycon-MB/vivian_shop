import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Nenhum travessão no que a Vivian e as clientes leem.
 *
 * É regra do projeto desde o começo, e existia um teste que varria as
 * telas. Ele varria só a primeira camada de pastas: `telas/painel` e
 * `telas/landing` nunca foram conferidos, e o travessão voltou em nove
 * lugares sem ninguém reparar, inclusive dentro de um texto de post que
 * sairia no Instagram dela.
 *
 * Este varre recursivo. O motivo da regra não é estilo: o travessão é a
 * pontuação que mais denuncia texto escrito por máquina, e a loja inteira
 * fala na voz dela.
 *
 * Comentário de código pode usar, e usa: quem lê comentário é quem
 * programa.
 */

const RAIZ = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const telasDe = (pasta: string): string[] => {
  const caminho = join(RAIZ, pasta)

  return readdirSync(caminho, { withFileTypes: true }).flatMap((entrada) => {
    if (entrada.isDirectory()) return telasDe(join(pasta, entrada.name))
    if (!/\.(jsx|tsx)$/.test(entrada.name)) return []
    if (entrada.name.includes('.test.')) return []
    return [join(caminho, entrada.name)]
  })
}

/**
 * Só o que a pessoa lê na tela.
 *
 * Tira bloco `/* *\/` e linha que começa com `//`. Comentário no fim de
 * uma linha de código fica, e é de propósito: separar isso de um `https://`
 * dentro de uma string exigiria interpretar o arquivo, e um teste que
 * interpreta errado é pior que um teste que pede uma linha a mais.
 */
const textoVisivel = (fonte: string): string =>
  fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('nenhum travessão no que ela lê', () => {
  const telas = [...telasDe('telas'), ...telasDe('componentes')]

  it('encontra as telas de dentro das pastas, e não só as de fora', () => {
    /* O teste antigo passava verde vendo doze arquivos de um total de
       cinquenta. Se este número cair, é porque a varredura parou de descer
       nas pastas, e não porque a loja encolheu. */
    expect(telas.length).toBeGreaterThan(30)
  })

  it.each(telas)('%s não usa travessão', (arquivo) => {
    const visivel = textoVisivel(readFileSync(arquivo, 'utf8'))

    expect(visivel).not.toContain('—')
  })
})
