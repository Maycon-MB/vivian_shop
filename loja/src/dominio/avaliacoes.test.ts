import { describe, it, expect } from 'vitest'

import { paraMostrar, ordenarPorData, paraAVitrine } from './avaliacoes'

/**
 * As avaliações que a loja mostra.
 *
 * São 13, reais, escritas por clientes dela entre março de 2025 e fevereiro
 * de 2026. Vieram do Elo7 e migraram para a Elojinha junto com o catálogo.
 *
 * Duas regras mandam aqui, e as duas são sobre gente:
 *
 *   - **só o primeiro nome.** Quem escreveu não autorizou a aparecer numa
 *     loja nova. Primeiro nome identifica o depoimento sem expor a pessoa,
 *     e é o que dá para publicar sem pedir permissão a treze pessoas.
 *   - **nada é inventado.** Depoimento falso numa loja de material infantil
 *     é o tipo de coisa que destrói a confiança que ela levou anos
 *     construindo, e que qualquer cliente antiga desmente.
 */

const crua = {
  data: '26/02/2026',
  produto: 'Revista Passatempo - P.e.p.p.a P.i.g - Lembrancinha aniversário.',
  nota: 'Positiva',
  primeiro_nome: 'Mariana',
  texto: 'Adorai',
  resposta_da_loja: 'Ficamos felizes!',
}

describe('preparar uma avaliação para a tela', () => {
  it('mantém o texto exatamente como a cliente escreveu', () => {
    // "Adorai" tem erro de digitação e continua assim. Corrigir o
    // depoimento de alguém é reescrever o que a pessoa disse.
    expect(paraMostrar(crua).texto).toBe('Adorai')
  })

  it('mostra só o primeiro nome', () => {
    expect(paraMostrar({ ...crua, primeiro_nome: 'Mariana' }).nome).toBe('Mariana')
  })

  it('corta o sobrenome se ele vier junto', () => {
    // A extração já devia entregar só o primeiro, mas se um dia vier
    // "Mariana Leite", a loja não publica o sobrenome.
    expect(paraMostrar({ ...crua, primeiro_nome: 'Mariana Leite' }).nome).toBe('Mariana')
  })

  it('desofusca o nome do produto', () => {
    // Ela escrevia "P.e.p.p.a P.i.g" para escapar do filtro de marca do
    // marketplace. Na loja dela isso não é preciso, e fica estranho de ler.
    expect(paraMostrar(crua).produto).toContain('Peppa Pig')
  })

  it('tira a frase de venda, e mantém o tema', () => {
    /* "- Lembrancinha aniversário." era o que o anúncio precisava para
       aparecer em busca no marketplace. O tema, não: é como a cliente
       dela pensa o produto, e é o que faz o depoimento dizer alguma
       coisa. */
    expect(paraMostrar(crua).produto).toBe('Revista Passatempo - Peppa Pig')
  })

  it('entende a data no formato brasileiro', () => {
    expect(paraMostrar(crua).quando.getFullYear()).toBe(2026)
    expect(paraMostrar(crua).quando.getMonth()).toBe(1)
  })

  it('guarda a resposta da loja quando existe', () => {
    expect(paraMostrar(crua).resposta).toBe('Ficamos felizes!')
    expect(paraMostrar({ ...crua, resposta_da_loja: '' }).resposta).toBeUndefined()
  })
})

describe('a sujeira que a extração deixou', () => {
  it('não grita o nome de quem escreveu em maiúscula', () => {
    // Duas clientes preencheram o próprio nome em caixa alta no
    // formulário do marketplace.
    expect(paraMostrar({ ...crua, primeiro_nome: 'MICHELLE' }).nome).toBe('Michelle')
  })

  it('não mexe no nome que já está escrito como nome', () => {
    expect(paraMostrar({ ...crua, primeiro_nome: 'Lílian' }).nome).toBe('Lílian')
  })

  it('tira o emoji que virou interrogação ao sair do marketplace', () => {
    const perdido = paraMostrar({ ...crua, texto: 'muito capricho ??' })
    expect(perdido.texto).toBe('muito capricho')
  })

  it('tira o emoji perdido do meio da frase', () => {
    /* "Ficamos felizes que chegou rapidinho ?? Muito obrigada" tinha um
       emoji entre as duas frases, e não uma pergunta. */
    const limpa = paraMostrar({
      ...crua,
      resposta_da_loja: 'Que bom que chegou rapidinho ?? Muito obrigada!',
    })
    expect(limpa.resposta).toBe('Que bom que chegou rapidinho Muito obrigada!')
  })

  it('não tira interrogação de verdade', () => {
    // "Chegou?" é pergunta, e não emoji estragado.
    expect(paraMostrar({ ...crua, texto: 'Chegou rápido, dá para encomendar de novo?' }).texto)
      .toBe('Chegou rápido, dá para encomendar de novo?')
  })
})

describe('a nota que o marketplace nunca guardou', () => {
  it('entende "Positiva"', () => {
    expect(paraMostrar(crua).positiva).toBe(true)
  })

  it('não transforma uma avaliação negativa em elogio', () => {
    /* O campo vem como "Positiva" ou "Negativa", e não como estrela. Ler
       isso como número dava 5 para tudo, inclusive para a reclamação. */
    expect(paraMostrar({ ...crua, nota: 'Negativa' }).positiva).toBe(false)
  })

  it('trata o que não reconhece como não positiva', () => {
    expect(paraMostrar({ ...crua, nota: '' }).positiva).toBe(false)
  })
})

describe('o que vai para a vitrine', () => {
  it('deixa de fora a que não é positiva', () => {
    const vitrine = paraAVitrine([crua, { ...crua, nota: 'Negativa', texto: 'ruim' }])
    expect(vitrine.map((a) => a.texto)).toEqual(['Adorai'])
  })

  it('deixa de fora a que não tem texto', () => {
    // Nome e data sozinhos não são depoimento, são linha vazia na tela.
    expect(paraAVitrine([{ ...crua, texto: '   ' }])).toEqual([])
  })

  it('mostra a mais recente primeiro', () => {
    const vitrine = paraAVitrine([
      { ...crua, data: '11/03/2025', texto: 'antiga' },
      { ...crua, data: '26/02/2026', texto: 'recente' },
    ])
    expect(vitrine.map((a) => a.texto)).toEqual(['recente', 'antiga'])
  })
})

describe('a ordem em que aparecem', () => {
  it('mostra a mais recente primeiro', () => {
    const lista = [
      { ...crua, data: '11/03/2025', texto: 'antiga' },
      { ...crua, data: '26/02/2026', texto: 'recente' },
      { ...crua, data: '22/11/2025', texto: 'meio' },
    ].map(paraMostrar)

    expect(ordenarPorData(lista).map((a) => a.texto)).toEqual(['recente', 'meio', 'antiga'])
  })
})
