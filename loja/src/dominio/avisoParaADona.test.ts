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

describe('o convite de avaliação', () => {
  const convite = readFileSync(
    path.join(raiz, 'supabase', 'funcoes', 'convite-de-avaliacao', 'index.ts'),
    'utf8',
  )
  const agendado = readFileSync(
    path.join(raiz, 'supabase', 'migracoes', '0014_convidar_para_avaliar.sql'),
    'utf8',
  )

  it('leva o link com a chave daquele pedido', () => {
    // Sem ele a tela de avaliar existe e ninguém chega nela.
    expect(convite).toContain('/avaliar/?pedido=${chave}')
  })

  it('chama a cliente pelo primeiro nome', () => {
    // Regex escrita como string escapa mal; procurar a intenção basta.
    expect(convite).toContain('primeiro = nome.trim().split')
  })

  it('não usa travessão, como todo texto que ela lê', () => {
    expect(convite.slice(convite.indexOf('corpoDoConvite'))).not.toContain('—')
  })

  it('recusa quem não sabe o segredo do gatilho', () => {
    expect(convite).toContain('x-segredo-do-gatilho')
    expect(convite).toContain('401')
  })

  it('nenhuma chave está escrita no arquivo', () => {
    expect(convite).not.toMatch(/re_[A-Za-z0-9]{8,}/)
  })

  it('conta os dias de criado_em, e não de atualizado_em', () => {
    /* Existe um gatilho que reescreve `atualizado_em` a cada toque no
       pedido: contando dali, marcar o rastreio adiaria o convite, e quem
       cuida bem do pedido nunca receberia. */
    expect(agendado).toContain('pe.criado_em < now()')
    expect(agendado).not.toContain("pe.atualizado_em < now()")
  })

  it('nunca convida endereço de exemplo', () => {
    /* O teste de compra do CI cria um pedido de verdade a cada push, com
       ana@exemplo.com.br. Convidar aquele endereço geraria devolução, e
       devolução derruba a reputação do domínio: o e-mail dela para as
       clientes de verdade passaria a cair em spam. */
    expect(agendado).toContain('exemplo|example')
  })

  it('tem teto por rodada', () => {
    // Centenas de e-mails de uma vez, de um domínio novo, é o que faz o
    // provedor marcar tudo como spam.
    expect(agendado).toContain('limit 30')
  })
})

describe('a limpeza do que o teste cria', () => {
  const limpeza = readFileSync(
    path.join(raiz, 'supabase', 'migracoes', '0015_limpar_o_que_o_teste_cria.sql'),
    'utf8',
  )

  it('só alcança endereços de exemplo', () => {
    /* É o que permite chamá-la com a chave pública sem risco: ela não tem
       como apagar pedido de cliente. Se alguém tirar este `where`, a
       função passa a apagar o banco inteiro para qualquer um. */
    expect(limpeza).toContain('exemplo|example')
    expect(limpeza).toContain('testuser')
  })

  it('não recebe parâmetro', () => {
    // Sem parâmetro não há como apontá-la para outro pedido.
    expect(limpeza).toContain('limpar_pedidos_de_teste()')
  })

  it('apaga os itens e eventos junto, e não só o pedido', () => {
    // Item órfão de pedido apagado é lixo que ninguém encontra depois.
    expect(limpeza).toContain('delete from public.itens_do_pedido')
    expect(limpeza).toContain('delete from public.eventos_de_pagamento')
  })
})
