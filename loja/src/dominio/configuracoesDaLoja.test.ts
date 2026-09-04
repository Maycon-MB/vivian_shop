import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, it, expect } from 'vitest'

/**
 * As configurações da loja: nome, frase, contato, endereço de origem e os
 * padrões de mínimo e prazo.
 *
 * ── Por que existe ────────────────────────────────────────────────────
 *
 * A aba de Configurações do painel era maquete: os campos apareciam
 * preenchidos, ela digitava, saía da tela e nada tinha mudado. Pior do que
 * não ter a tela, porque parecia que tinha.
 *
 * ── O que estes testes leem ───────────────────────────────────────────
 *
 * A migração é SQL e a função de frete roda em Deno. Nenhuma das duas dá
 * para importar daqui, então o que estes testes abrem é **o arquivo que
 * vai ao ar**, e não uma cópia: cópia passa verde com o original errado. É
 * o mesmo caminho de `avisoDePedido.test.ts` e `funcoesDoSupabase.test.ts`.
 */

const raiz = path.resolve(__dirname, '..', '..', '..')

const migracao = readFileSync(
  path.join(raiz, 'supabase', 'migracoes', '0019_configuracoes_da_loja.sql'),
  'utf8',
)
const cotarFrete = readFileSync(
  path.join(raiz, 'supabase', 'funcoes', 'cotar-frete', 'index.ts'),
  'utf8',
)

/* Os comentários explicam decisões, e citam de propósito palavras que o
   código não pode conter. Quem procura coluna procura no SQL, não na
   explicação. */
const semComentarios = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*--.*$/gm, '')

const soAsColunas = semComentarios(migracao)

describe('onde ficam as configurações da loja', () => {
  it('guarda uma linha só, como a tabela de pagamento', () => {
    /* Duas linhas seriam duas verdades: a loja mostraria o nome de uma e o
       painel salvaria na outra. O `check` é o que impede. */
    expect(soAsColunas).toContain('create table if not exists configuracoes_da_loja')
    expect(soAsColunas).toMatch(/id\s+boolean\s+primary key\s+default true\s+check\s*\(\s*id\s*\)/)
  })

  it('já nasce com a linha dentro, para a tela nunca abrir vazia', () => {
    /* Sem isto, o primeiro `update` do painel não acha o que atualizar, não
       dá erro, e ela conclui que salvar não funciona. */
    expect(soAsColunas).toMatch(/insert into configuracoes_da_loja[\s\S]*values\s*\(\s*true\s*\)/i)
  })

  it('tem nome e frase já preenchidos com os da loja dela', () => {
    // A vitrine precisa de um título mesmo antes de ela abrir a aba.
    expect(soAsColunas).toMatch(/nome_da_loja\s+text not null\s+default '/)
    expect(soAsColunas).toMatch(/frase_da_loja\s+text not null\s+default '/)
  })

  it('guarda o contato e o endereço de onde o pacote sai', () => {
    for (const coluna of [
      'email_de_contato',
      'cep_de_origem',
      'cidade_de_origem',
      'endereco_de_origem',
    ]) {
      expect(soAsColunas).toContain(coluna)
    }
  })

  it('não aceita mínimo menor que uma peça nem prazo negativo', () => {
    /* Mínimo zero venderia nada, e prazo negativo prometeria entrega
       ontem. Os dois passam pela tela dela num dedo errado. */
    expect(soAsColunas).toMatch(/minimo_padrao\s+integer not null default \d+\s*\n?\s*check \(minimo_padrao >= 1\)/)
    expect(soAsColunas).toMatch(/prazo_padrao\s+integer not null default \d+\s*\n?\s*check \(prazo_padrao >= 0\)/)
  })

  it('não guarda WhatsApp, porque a conversa acontece dentro da loja', () => {
    /* A `0008_conversa_na_loja.sql` decidiu isso em 25/08, e a loja inteira
       foi construída em cima: a cliente escreve na página do produto e a
       Vivian é avisada por e-mail. Um campo de WhatsApp aqui não teria para
       onde ir, e prometeria na tela dela um canal que não existe. */
    expect(soAsColunas).not.toMatch(/whats/i)
  })
})

describe('quem pode ler e quem pode escrever', () => {
  it('não deixa o endereço da casa dela sair para quem abrir a loja', () => {
    /* A tabela guarda `cep_de_origem` e `endereco_de_origem`, que são onde
       ela mora. A chave anônima vai dentro da página e qualquer um a copia
       em dez segundos: com leitura pública, o endereço dela sairia numa
       chamada de uma linha.

       Este projeto já pagou esse preço. A `gh-pages` guardava builds
       antigos com o CEP da casa dela compilado dentro do JavaScript, e o
       site atual já estava limpo enquanto o histórico continuava servindo
       o dado.

       Ninguém além dela precisa ler isto no navegador: o nome e a frase da
       loja são resolvidos no build, e o `cotar-frete` lê o CEP pelo
       servidor, com a chave de serviço, que ignora RLS. */
    expect(migracao).toContain('alter table configuracoes_da_loja enable row level security')
    expect(migracao).toMatch(/for select\s*\n\s*to authenticated\s*\n\s*using \(e_dona_da_loja\(\)\)/)
    expect(migracao).not.toMatch(/for select\s*\n\s*to anon/)
  })

  it('só deixa a dona mudar', () => {
    /* Sem isto, qualquer um com a chave anônima, que vai dentro da página,
       trocaria o nome da loja e o CEP de onde o pacote sai. */
    expect(migracao).toMatch(/for update\s*\n\s*to authenticated\s*\n\s*using \(e_dona_da_loja\(\)\)\s*\n\s*with check \(e_dona_da_loja\(\)\)/)
  })

  it('não deixa ninguém criar uma segunda linha nem apagar a que existe', () => {
    expect(soAsColunas).not.toMatch(/for insert/i)
    expect(soAsColunas).not.toMatch(/for delete/i)
  })
})

describe('o frete sai do CEP que ela digitou', () => {
  it('lê o CEP de origem do banco, e não só da variável da função', () => {
    /* Antes, mudar o CEP dela era tarefa minha: entrar no painel do
       Supabase e trocar uma variável. Agora ela troca sozinha. */
    expect(cotarFrete).toContain('configuracoes_da_loja')
    expect(cotarFrete).toContain('cep_de_origem')
  })

  it('continua cotando quando o banco está sem CEP', () => {
    /* Rede de segurança: se ela apagar o campo sem querer, ou se a consulta
       ao banco falhar no meio de uma compra, o frete não pode parar. A
       variável da função continua valendo. */
    expect(cotarFrete).toContain('MELHORENVIO_CEP_ORIGEM')
    expect(cotarFrete).toMatch(/cep_de_origem[\s\S]*MELHORENVIO_CEP_ORIGEM/)
  })

  it('não manda cotar com CEP pela metade', () => {
    // Oito dígitos ou nada: meio CEP faz o Melhor Envio recusar a cotação.
    expect(cotarFrete).toMatch(/length === 8/)
  })
})

describe('o que não pode estar escrito nestes arquivos', () => {
  it('não traz segredo nenhum, porque o repositório é público', () => {
    for (const arquivo of [migracao, cotarFrete]) {
      // Chave do Supabase (JWT ou a nova `sb_`), token do Melhor Envio, Resend.
      expect(arquivo).not.toMatch(/eyJ[A-Za-z0-9_-]{20}/)
      expect(arquivo).not.toMatch(/sb_(secret|publishable)_[A-Za-z0-9_-]{10}/)
      expect(arquivo).not.toMatch(/re_[A-Za-z0-9]{10}/)
      expect(arquivo).not.toMatch(/APP_USR-[A-Za-z0-9-]{10}/)
    }
  })

  it('não traz o endereço da casa dela escrito no código', () => {
    /* O CEP de origem vem do banco ou da variável da função. Cravado aqui,
       ele iria para o repositório público e ficaria no histórico do git
       mesmo depois de apagado. */
    expect(cotarFrete).not.toMatch(/\b\d{5}-?\d{3}\b/)
  })
})
