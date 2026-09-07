import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * O nome da dona da loja não aparece para quem compra.
 *
 * Ela pediu isso em 21/08, e é uma decisão de segurança dela, não de
 * estilo: quem vende artesanato pelo WhatsApp lida com desconhecido o dia
 * inteiro, e nome completo somado a cidade e a horário de atendimento é
 * mais informação do que qualquer compradora precisa.
 *
 * A loja continua falando na primeira pessoa e continua dizendo que quem
 * responde é quem faz as peças. O que sai é o nome próprio.
 *
 * Este teste existe porque a correção manual não se sustenta: o nome dela
 * é a palavra mais natural do mundo para escrever no meio de um texto
 * sobre a loja dela, e vai voltar sem ninguém reparar.
 *
 * Até 24/08 a varredura via só a primeira camada de `telas/` e
 * `componentes/`: `telas/painel` e `telas/landing` nunca foram conferidos,
 * e `servicos/` nunca entrou. Foi assim que `avisosSimulados.ts` assinou
 * "Um beijo, Vivian" em toda mensagem de pedido sem o teste reprovar.
 * Segue o mesmo padrão recursivo de `semTravessao.test.ts`.
 */

const RAIZ = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

/* Onde ela é a leitora, e não a vendedora: o painel, o formulário de
   perguntas e as páginas que expliquem o projeto para ela. Ali o nome
   dela não só pode como deve aparecer. */
const TELAS_DELA = [
  'Perguntas.jsx',
  'Custos.jsx',
  'AdminDashboard.jsx',
  'Entrar.jsx',
  'StatusPage.jsx',
  'Sobre.jsx',
]

const arquivosDeTela = (pasta: string): string[] => {
  const caminho = join(RAIZ, pasta)

  return readdirSync(caminho, { withFileTypes: true }).flatMap((entrada) => {
    const caminhoFilho = join(pasta, entrada.name)
    if (entrada.isDirectory()) return arquivosDeTela(caminhoFilho)
    if (!/\.(jsx|tsx|ts|js)$/.test(entrada.name)) return []
    if (entrada.name.includes('.test.')) return []
    if (TELAS_DELA.includes(entrada.name)) return []
    return [join(RAIZ, caminhoFilho)]
  })
}

/**
 * Só o que a pessoa lê na tela.
 *
 * Comentário de código explicando uma decisão continua podendo citá-la:
 * quem lê comentário é quem programa, e tirar o nome de lá tornaria a
 * explicação pior sem proteger ninguém.
 */
const textoVisivel = (fonte: string): string =>
  fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

describe('o nome da dona não vaza para quem compra', () => {
  const telas = [
    ...arquivosDeTela('telas'),
    ...arquivosDeTela('componentes'),
    ...arquivosDeTela('servicos'),
  ]

  it('encontra os arquivos para conferir, inclusive dentro de subpastas', () => {
    /* O teste antigo passava verde vendo doze arquivos de mais de
       cinquenta, porque não descia em `telas/painel` nem `telas/landing`,
       e nunca entrava em `servicos/`. Se este número cair, é porque a
       varredura parou de descer nas pastas, e não porque a loja encolheu. */
    expect(telas.length).toBeGreaterThan(40)
  })

  it.each(telas)('%s não mostra o nome dela', (arquivo) => {
    const visivel = textoVisivel(readFileSync(arquivo, 'utf8'))

    expect(visivel).not.toMatch(/Vivian/)
  })
})
