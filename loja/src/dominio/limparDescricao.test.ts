import { describe, it, expect } from 'vitest'

import { limparDescricao } from './limparDescricao'

/**
 * A descrição do produto, tirada a poeira do marketplace.
 *
 * Achado numa auditoria em 26/08: 262 dos 342 produtos mandavam a cliente
 * conferir o prazo "no ELO7", que é a concorrente e está fechada.
 */

describe('o que sai', () => {
  it('tira o nome da loja concorrente', () => {
    /* Setenta e sete por cento do catálogo mandava a cliente para outro
       lugar, e esse outro lugar nem existe mais. */
    const limpa = limparDescricao('Prazo de entrega previsto no ELO7 (Correios).')
    expect(limpa).not.toMatch(/elo\s?7/i)
  })

  it('tira a frase que mandava somar prazos de outro site', () => {
    const bruta =
      'Álbum bonito.\n- O produto será enviado após o prazo (Some o prazo de produção ao prazo de entrega previsto no ELO7 (prazo dos Correios) para saber a data.\n'
    const limpa = limparDescricao(bruta)

    expect(limpa).toContain('Álbum bonito')
    expect(limpa).not.toContain('Some o prazo')
  })

  it('apaga a linha inteira que ainda cite a concorrente', () => {
    /* A primeira versao listava as frases conhecidas e deixou uma passar,
       porque numa das 342 ela vinha grudada no texto anterior. */
    const bruta = [
      'Produto bonito.',
      'o (Some o prazo previsto no ELO7 (Correios) para saber.',
      'Fim.',
    ].join(String.fromCharCode(10))

    const limpa = limparDescricao(bruta)

    expect(limpa).not.toMatch(/elo\s?7/i)
    expect(limpa).toContain('Produto bonito')
    expect(limpa).toContain('Fim.')
  })

  it('tira os filetes de hifens', () => {
    const limpa = limparDescricao('Antes\n----------------------------------------\nDepois')
    expect(limpa).not.toContain('----')
    expect(limpa).toContain('Antes')
    expect(limpa).toContain('Depois')
  })

  it('troca a seta do editor deles por marcador de lista', () => {
    expect(limparDescricao('--> Já vai embalado')).toBe('• Já vai embalado')
  })

  it('troca "anúncio" por "foto"', () => {
    // Aqui não há anúncio: há a página do produto dela.
    expect(limparDescricao('produzido com a arte no anúncio')).toContain('na foto')
  })

  it('não repete "foto" quando a frase já falava em foto', () => {
    /* Este teste existe por causa de um defeito que ficou no ar de 26/08
       a 31/08, em 262 produtos. A frase original era "a mesma arte da foto
       no anúncio"; trocando só o pedaço, virou "da foto na foto", e nenhum
       teste reclamou porque a versão antiga deste arquivo pedia
       exatamente isso.

       Trocar palavra em texto que eu não escrevi pede reler a frase
       inteira depois. */
    expect(limparDescricao('a mesma arte da foto no anúncio')).toBe('a mesma arte da foto')
  })
})

describe('o que fica', () => {
  it('mantém o que ela escreveu sobre o produto', () => {
    const bruta = 'TAMANHO DO ÁLBUM: 14 x 20 cm \n \nOBS: \n- Não enviamos prévia.'
    const limpa = limparDescricao(bruta)

    expect(limpa).toContain('TAMANHO DO ÁLBUM: 14 x 20 cm')
    expect(limpa).toContain('Não enviamos prévia')
  })

  it('mantém o prazo de produção, que é regra dela', () => {
    const limpa = limparDescricao('PRAZO DE PRODUÇÃO: 5 DIAS ÚTEIS (Não inclui Sábado)')
    expect(limpa).toContain('5 DIAS ÚTEIS')
  })

  it('não deixa três linhas vazias seguidas', () => {
    expect(limparDescricao('Um\n\n\n\nDois')).toBe('Um\n\nDois')
  })

  it('não quebra com descrição vazia', () => {
    expect(limparDescricao('')).toBe('')
  })
})
