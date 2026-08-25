import { describe, it, expect } from 'vitest'

import {
  ABERTURA,
  emailDeResposta,
  OPCOES,
  PRIMEIRAS,
  acharOpcao,
  problemasDoRecado,
  responder,
  seguintesDe,
} from './conversa'
import { MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from './regras'

/**
 * A conversa dentro da loja.
 *
 * Cada teste descreve o que acontece com a cliente dela, ou com ela.
 */

describe('as respostas são escritas, e não geradas', () => {
  it('toda pergunta tem resposta pronta', () => {
    /* Se um dia alguém acrescentar uma pergunta sem resposta, a cliente
       toca no botão e não acontece nada. */
    for (const opcao of OPCOES) {
      expect(opcao.resposta.trim().length, opcao.id).toBeGreaterThan(20)
    }
  })

  it('a resposta do prazo usa o número dela, e não um escrito à mão', () => {
    /* O prazo é dela e pode mudar. Se estivesse digitado na frase, mudar
       em regras.ts deixaria a conversa prometendo outra coisa. */
    expect(acharOpcao('prazo')?.resposta).toContain(String(PRAZO_PRODUCAO))
  })

  it('a resposta do mínimo usa o número dela', () => {
    expect(acharOpcao('minimo')?.resposta).toContain(String(MINIMO_PERSONALIZADO))
  })

  it('nenhuma resposta promete data', () => {
    /* "chega até sexta" é o tipo de promessa que ela é quem paga. A
       resposta da data manda somar produção e frete, e manda falar com a
       loja quando estiver apertado. */
    for (const opcao of OPCOES) {
      expect(opcao.resposta, opcao.id).not.toMatch(/garantimos|com certeza chega|prometo/i)
    }
  })

  it('nenhuma resposta manda a cliente para o WhatsApp', () => {
    // A conversa acontece dentro da loja, do início ao fim. Foi o pedido
    // dela em 24/08.
    for (const opcao of OPCOES) {
      expect(opcao.resposta, opcao.id).not.toMatch(/whats/i)
    }
    expect(ABERTURA.texto).not.toMatch(/whats/i)
  })

  it('não usa travessão, como o resto do que ela lê', () => {
    for (const opcao of OPCOES) {
      expect(opcao.resposta, opcao.id).not.toContain('—')
      expect(opcao.pergunta, opcao.id).not.toContain('—')
    }
    expect(ABERTURA.texto).not.toContain('—')
  })
})

describe('para onde a conversa vai depois', () => {
  it('não repete a pergunta que ela acabou de fazer', () => {
    for (const opcao of OPCOES) {
      expect(seguintesDe(opcao.id), opcao.id).not.toContain(opcao.id)
    }
  })

  it('sempre sobra alguma coisa para tocar', () => {
    // Conversa que termina em tela sem botão é beco sem saída.
    for (const opcao of OPCOES) {
      expect(seguintesDe(opcao.id).length, opcao.id).toBeGreaterThan(0)
    }
  })

  it('só oferece pergunta que existe', () => {
    for (const opcao of OPCOES) {
      for (const seguinte of seguintesDe(opcao.id)) {
        expect(acharOpcao(seguinte), `${opcao.id} → ${seguinte}`).toBeDefined()
      }
    }
  })

  it('a conversa começa pelo que mais perguntam', () => {
    for (const id of PRIMEIRAS) expect(acharOpcao(id), id).toBeDefined()
  })
})

describe('a conversa acontecendo', () => {
  it('mostra a pergunta dela e a resposta, nessa ordem', () => {
    const falas = responder([ABERTURA], 'prazo')

    expect(falas).toHaveLength(3)
    expect(falas[1].quem).toBe('cliente')
    expect(falas[1].texto).toBe(acharOpcao('prazo')?.pergunta)
    expect(falas[2].quem).toBe('loja')
  })

  it('não estraga o histórico que a tela já tem', () => {
    // A tela guarda as falas anteriores; mexer na lista recebida faria a
    // conversa mudar por baixo dela.
    const antes = [ABERTURA]
    responder(antes, 'prazo')
    expect(antes).toHaveLength(1)
  })

  it('ignora botão que não existe, em vez de quebrar a tela', () => {
    const antes = [ABERTURA]
    expect(responder(antes, 'inventado')).toEqual(antes)
  })
})

describe('quando ela quer falar com a loja', () => {
  const bom = ['Ana', 'ana@exemplo.com', 'Consegue entregar antes do dia 20?'] as const

  it('deixa mandar quando está preenchido', () => {
    expect(problemasDoRecado(...bom)).toEqual([])
  })

  it('cobra o nome', () => {
    expect(problemasDoRecado('', bom[1], bom[2]).join(' ')).toContain('nome')
  })

  it('cobra o e-mail, porque é por ele que a resposta chega', () => {
    /* A Vivian não fica online o dia todo. Sem e-mail, a dúvida se perde
       quando a cliente fecha a aba. */
    expect(problemasDoRecado(bom[0], 'ana', bom[2]).join(' ')).toContain('e-mail')
  })

  it('cobra a dúvida', () => {
    expect(problemasDoRecado(bom[0], bom[1], 'oi').join(' ')).toContain('dúvida')
  })

  it('recusa mensagem longa demais', () => {
    // O banco recusa acima de 2000, e o recado daqui é mais gentil do que
    // o erro do Postgres.
    const enorme = 'a'.repeat(2001)
    expect(problemasDoRecado(bom[0], bom[1], enorme).join(' ')).toContain('longa demais')
  })
})

describe('o e-mail que ela manda para a cliente', () => {
  /* O Maycon prometeu isto à Vivian em 24/08, e é a razão de o e-mail ser
     pedido à cliente: "se você não estiver online no momento, ainda dá
     pra responder depois por e-mail, em vez de perder a cliente". */

  const link = emailDeResposta('Ana Souza', 'ana@exemplo.com', 'Chega antes do dia 20?')

  it('abre o programa de e-mail dela no endereço da cliente', () => {
    expect(link.startsWith('mailto:ana@exemplo.com')).toBe(true)
  })

  it('leva a pergunta junto', () => {
    // Sem ela, a resposta chega solta e a cliente não lembra do que é:
    // o mesmo problema do WhatsApp que ela queria resolver.
    expect(decodeURIComponent(link)).toContain('Chega antes do dia 20?')
  })

  it('chama a cliente pelo primeiro nome', () => {
    expect(decodeURIComponent(link)).toContain('Oi, Ana!')
  })

  it('não depende de serviço de envio nenhum', () => {
    /* Quem manda é o programa de e-mail dela. É o que faz isto funcionar
       hoje, antes de o Resend existir. */
    expect(link).not.toMatch(/https?:\/\/(?!feitoparavoce)/)
  })
})
