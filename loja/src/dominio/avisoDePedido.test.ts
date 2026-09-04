import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, it, expect } from 'vitest'

/**
 * O aviso de venda que chega no e-mail da Vivian.
 *
 * ── Por que existe ────────────────────────────────────────────────────
 *
 * Ela perguntou em 04/09 se o sistema avisa a cada compra. Não avisava: o
 * único gatilho de e-mail era em `conversas`, quando uma cliente escreve.
 *
 * Pior do que não avisar, a tela de Configurações dizia que sim, com a
 * opção "Pedido novo" marcada e prometendo **mensagem no WhatsApp**. Três
 * caixas de seleção sem estado, sem salvar e sem nada atrás. Ela ia
 * assinar o contrato acreditando que era avisada de cada venda.
 *
 * ── Por que no pagamento aprovado, e não no pedido criado ─────────────
 *
 * O pedido nasce no banco antes de a cliente pagar. Avisar no nascimento
 * encheria a caixa dela de carrinho abandonado, e o aviso vira ruído que
 * ela aprende a ignorar.
 *
 * E tem a razão que manda: **o teste de navegação cria pedido de verdade
 * no banco dela a cada push.** Já custou onze pedidos falsos em 25/08.
 * Gatilho na criação faria cada envio meu virar e-mail de venda para ela.
 * Pedido de teste nunca é aprovado, então o aviso na aprovação é o único
 * que separa venda de tráfego nosso.
 *
 * Como o outro aviso, o texto mora na função do Supabase, que roda em Deno
 * e não dá para importar daqui. O que estes testes leem é **o arquivo que
 * vai ao ar**, e não uma cópia: cópia passa verde com o original errado.
 */

const raiz = path.resolve(__dirname, '..', '..', '..')

const funcao = readFileSync(
  path.join(raiz, 'supabase', 'funcoes', 'avisar-a-dona', 'index.ts'),
  'utf8',
)
const migracao = readFileSync(
  path.join(raiz, 'supabase', 'migracoes', '0018_avisar_pedido_novo.sql'),
  'utf8',
)
const configuracoes = readFileSync(
  path.join(raiz, 'loja', 'src', 'telas', 'painel', 'AbaConfiguracoes.jsx'),
  'utf8',
)

describe('quando a Vivian é avisada de uma venda', () => {
  it('avisa quando o pagamento é aprovado', () => {
    expect(migracao).toContain("estado_pagamento = 'aprovado'")
  })

  it('não avisa quando o pedido apenas nasce, ainda sem pagamento', () => {
    /* O pedido nasce como `aguardando`. Gatilho em `insert` encheria a
       caixa dela de carrinho abandonado, e faria cada push do CI, que cria
       pedido de verdade no banco, virar e-mail de venda. */
    expect(migracao).toMatch(/after update[\s\S]*on public\.pedidos/i)
    expect(migracao).not.toMatch(/after insert on public\.pedidos/i)
  })

  it('não avisa duas vezes pelo mesmo pedido', () => {
    /* O Mercado Pago reenvia o mesmo aviso até receber 200, e cada reenvio
       reescreve a linha. Sem olhar o estado anterior, ela receberia o
       mesmo "vendeu" quatro vezes. */
    expect(migracao).toContain('old.estado_pagamento')
  })

  it('diz o número do pedido e quanto entrou', () => {
    /* É o que ela precisa para decidir do celular se corre produzir agora
       ou se olha depois, sem abrir o painel. */
    expect(funcao).toContain('${numero}')
    expect(funcao).toContain('emReais(total)')
  })

  it('escreve o valor em reais, e não o número cru do banco', () => {
    /* `total` é `numeric` no Postgres e chega como texto. Solto no e-mail
       viraria "135.5", e ela leria cento e trinta e cinco e meio em vez de
       R$ 135,50. */
    expect(funcao).toContain("style: 'currency'")
    expect(funcao).toContain("'pt-BR'")
  })

  it('leva ao painel de pedidos, e não à página inicial', () => {
    expect(funcao).toContain('aba=pedidos')
  })

  it('não escreve segredo nenhum no arquivo', () => {
    /* O repositório é público. A chave do Resend vive no vault. */
    expect(funcao).not.toMatch(/re_[A-Za-z0-9]{10}/)
    expect(migracao).not.toMatch(/re_[A-Za-z0-9]{10}/)
  })

  it('não usa travessão, como todo texto que ela lê', () => {
    const soOTexto = funcao
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')

    expect(soOTexto).not.toContain('—')
  })
})

describe('a tela de Configurações', () => {
  it('não promete mais mensagem no WhatsApp quando alguém compra', () => {
    /* A loja inteira foi desenhada sem WhatsApp: a conversa com a cliente
       acontece dentro do site. Prometer WhatsApp ali era promessa que
       nenhuma parte do sistema podia cumprir.

       O campo de contato "WhatsApp", mais acima na tela, também saiu, em
       04/09: guardava um número que nada no sistema usaria, e sugeria um
       canal de atendimento que a loja não tem. Quem cobre a ausência dele
       é AbaConfiguracoes.test.tsx, que olha a tela desenhada; aqui o teste
       segue mirando na frase, que é a promessa que doía. */
    expect(configuracoes).not.toMatch(/Mensagem no WhatsApp/i)
  })

  it('não oferece aviso que não existe', () => {
    /* "Prazo chegando" e "Resumo da semana" eram caixas marcadas sem nada
       atrás. Enquanto não existirem, não aparecem.

       O teste olha o que é desenhado, e não o arquivo inteiro: o comentário
       da tela cita os dois nomes de propósito, para quem for mexer ali
       saber por que sumiram. */
    expect(configuracoes).not.toContain('<strong>Prazo chegando</strong>')
    expect(configuracoes).not.toContain('<strong>Resumo da semana</strong>')

    /* E nenhuma caixa de seleção sobrou sem nada atrás. */
    expect(configuracoes).not.toContain('defaultChecked')
  })

  it('diz que o aviso de venda vai por e-mail', () => {
    expect(configuracoes).toMatch(/e-mail/i)
  })
})
