import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, it, expect } from 'vitest'

/**
 * O aviso que chega no e-mail da Vivian.
 *
 * O texto mora na função do Supabase, que roda em Deno e não pode ser
 * importada daqui. Em vez de copiar o texto para cá e testar a cópia, o
 * que estes testes leem é **o arquivo que vai ao ar**: uma cópia passaria
 * verde enquanto o original estivesse errado, que é o pior tipo de teste.
 *
 * O que está sendo defendido são as invariantes do projeto, não o
 * formato: sem travessão, a pergunta da cliente inteira, e nenhum segredo
 * escrito no arquivo.
 */

const raiz = path.resolve(__dirname, '..', '..', '..')
const arquivo = path.join(raiz, 'supabase', 'funcoes', 'avisar-a-dona', 'index.ts')
const gatilho = path.join(raiz, 'supabase', 'migracoes', '0009_avisar_a_dona.sql')

const funcao = readFileSync(arquivo, 'utf8')
const migracao = readFileSync(gatilho, 'utf8')

describe('o aviso que a Vivian recebe', () => {
  it('leva a pergunta da cliente no corpo', () => {
    /* Com ela no e-mail, a Vivian decide do celular se responde agora ou
       depois, sem abrir o painel para descobrir do que se trata. */
    expect(funcao).toContain('${pergunta}')
  })

  it('diz para qual endereço responder', () => {
    expect(funcao).toContain('${email}')
  })

  it('leva o endereço do painel', () => {
    expect(funcao).toContain('aba=mensagens')
  })

  it('não usa travessão, como todo texto que ela lê', () => {
    const textoDoEmail = funcao.slice(funcao.indexOf('corpoDoAviso'))
    expect(textoDoEmail).not.toContain('—')
  })

  it('responde para o e-mail da cliente', () => {
    // Assim ela aperta "responder" no Gmail e a resposta chega na cliente,
    // sem copiar endereço nenhum.
    expect(funcao).toContain('reply_to')
  })
})

describe('os segredos', () => {
  it('nenhuma chave do Resend está escrita no arquivo', () => {
    // O repositório é público.
    expect(funcao).not.toMatch(/re_[A-Za-z0-9]{8,}/)
    expect(migracao).not.toMatch(/re_[A-Za-z0-9]{8,}/)
  })

  it('a chave é lida do ambiente, e não do código', () => {
    expect(funcao).toContain("Deno.env.get('RESEND_API_KEY')")
  })

  it('a migração lê os segredos do vault', () => {
    /* Uma tabela comum sem política de leitura ainda aparece inteira para
       quem tiver a chave de serviço. O vault é cifrado em repouso. */
    expect(migracao).toContain('vault.decrypted_secrets')
  })

  it('a função recusa quem não sabe o segredo do gatilho', () => {
    // Ela está publicada na internet: sem isso, qualquer um dispara
    // e-mail em nome da loja dela.
    expect(funcao).toContain('x-segredo-do-gatilho')
    expect(funcao).toContain('401')
  })
})

describe('o gatilho no banco', () => {
  it('só dispara quando a conversa acaba de ser escalada', () => {
    /* Sem esta guarda, cada mensagem seguinte da mesma cliente manda
       outro e-mail, e ela para de abrir os avisos. */
    expect(migracao).toContain('old.escalada is true')
  })

  it('avisa todas as donas, e não só a Vivian', () => {
    // A irmã dela, a Lilian, resolve as coisas da loja junto.
    expect(migracao).toContain('donas_da_loja')
    expect(migracao).toContain('array_agg')
  })

  it('não derruba a mensagem da cliente quando o aviso falha', () => {
    /* O aviso é importante; a mensagem da cliente é mais. Sem os segredos
       configurados, a conversa é salva do mesmo jeito. */
    expect(migracao).toContain('return new;')
    expect(migracao).toContain('http_post')
  })
})
