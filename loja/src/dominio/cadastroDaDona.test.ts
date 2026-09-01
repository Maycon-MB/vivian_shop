import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A loja já tem dona, e por isso não há mais porta de cadastro em /admin.
 *
 * ── O que aconteceu ───────────────────────────────────────────────────
 *
 * A tela `/admin/criar-conta` nasceu para a primeira conta da loja, na
 * migração 0004: enquanto `donas_da_loja` estivesse vazia, quem chegasse
 * primeiro virava dona. Essa janela fechou no dia em que ela entrou, e o
 * comentário da própria migração já dizia que o cadastro seria desligado
 * em seguida. Não foi.
 *
 * O que sobrou foi uma porta que não leva a lugar nenhum: quem se
 * cadastra ali hoje cria uma conta sem permissão nenhuma. Foi assim que
 * apareceu uma conta sobrando no Supabase Auth em 01/09.
 *
 * ── Por que o cadastro do Supabase continua ligado ────────────────────
 *
 * Porque não é só dela. O mesmo `signUp` atende a conta de quem compra,
 * em `/minha-conta`, que é como a cliente vê o próprio pedido sem
 * escrever para a Vivian. Desligar o cadastro no painel do Supabase
 * fecharia as duas portas, e a que interessa fechar é uma só.
 *
 * ── Como uma segunda dona entra a partir de agora ─────────────────────
 *
 * Pelo convite da migração 0006, que continua valendo: uma dona registra
 * o e-mail em `convites`, a pessoa cria conta e o gatilho a promove. O
 * que mudou é que essa conta nasce em `/minha-conta`, como qualquer
 * outra, em vez de numa tela de administração aberta na internet.
 */

const RAIZ = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const arquivosDe = (pasta: string): string[] => {
  const caminho = join(RAIZ, pasta)

  return readdirSync(caminho, { withFileTypes: true }).flatMap((entrada) => {
    if (entrada.isDirectory()) return arquivosDe(join(pasta, entrada.name))
    if (!/\.(jsx|tsx|ts|js)$/.test(entrada.name)) return []
    return [join(caminho, entrada.name)]
  })
}

describe('o cadastro da dona', () => {
  it('não tem mais tela própria, porque a loja já tem dona', () => {
    expect(existsSync(join(RAIZ, 'app', 'admin', 'criar-conta'))).toBe(false)
    expect(existsSync(join(RAIZ, 'telas', 'CriarConta.jsx'))).toBe(false)
  })

  it('não é oferecido em nenhuma tela', () => {
    /* Link para uma rota que não existe mais é 404 na cara dela. E link
       que volta a existir reabre a porta sem ninguém reparar, que é
       exatamente como ela ficou aberta por dez dias. */
    const comLink = [...arquivosDe('telas'), ...arquivosDe('componentes'), ...arquivosDe('app')]
      .filter((arquivo) => !arquivo.includes('.test.'))
      .filter((arquivo) => readFileSync(arquivo, 'utf8').includes('/admin/criar-conta'))

    expect(comLink).toEqual([])
  })

  it('deixa de pé o cadastro de quem compra, que usa o mesmo caminho', () => {
    /* A conta da cliente é o que responde "meu pedido saiu?" sem a Vivian
       precisar responder. Fechar o cadastro da dona não pode levá-la
       junto. */
    const minhaConta = readFileSync(join(RAIZ, 'telas', 'MinhaConta.jsx'), 'utf8')

    expect(minhaConta).toContain('criarConta')
  })
})
