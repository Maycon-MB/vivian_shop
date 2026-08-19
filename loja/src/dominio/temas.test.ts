import { describe, it, expect } from 'vitest'

import { chaveDoTema, distancia, reconhecerTema, conferirTemas } from './temas'

/**
 * O que se prova aqui é o equilíbrio entre dois erros opostos.
 *
 * Juntar demais: "Bela" e "Belo" viram um tema só, e metade dos produtos
 * some da loja sem ninguém perceber.
 *
 * Juntar de menos: "Mickey" e "mickey" viram dois temas, e a cliente que
 * procura Mickey acha metade do que existe.
 *
 * O primeiro é pior, porque é silencioso. Por isso a regra é: junta o que
 * é obviamente igual, pergunta no que é parecido, e nunca decide sozinho
 * quando há dúvida.
 */

describe('a chave de comparação', () => {
  it('ignora maiúscula, acento e espaço sobrando', () => {
    const esperado = 'primeira eucaristia'

    expect(chaveDoTema('Primeira Eucaristia')).toBe(esperado)
    expect(chaveDoTema('primeira eucaristia')).toBe(esperado)
    expect(chaveDoTema('PRIMEIRA EUCARISTIA')).toBe(esperado)
    expect(chaveDoTema('  Primeira   Eucaristia  ')).toBe(esperado)
    expect(chaveDoTema('Primeira Eucaristía')).toBe(esperado)
  })

  it('ignora pontuação, que ela pode digitar sem querer', () => {
    expect(chaveDoTema('Mickey!')).toBe(chaveDoTema('Mickey'))
    expect(chaveDoTema('Mickey - Disney')).toBe(chaveDoTema('Mickey Disney'))
  })
})

describe('juntar o que é o mesmo', () => {
  const conhecidos = ['Mickey', 'Primeira Eucaristia', 'Frozen']

  it.each([['mickey'], ['MICKEY'], ['  Mickey  '], ['Mickey!']])(
    'reconhece %s como o tema Mickey que já existe',
    (escrito) => {
      const r = reconhecerTema(escrito, conhecidos)

      expect(r.tipo).toBe('existente')
      if (r.tipo === 'existente') expect(r.tema).toBe('Mickey')
    },
  )

  it('não cria tema repetido quando ela escreve com acento diferente', () => {
    const r = reconhecerTema('Primeira Eucaristía', conhecidos)
    expect(r.tipo).toBe('existente')
  })
})

describe('perguntar no que é parecido', () => {
  it('avisa quando falta uma letra, sem corrigir sozinho', () => {
    const r = reconhecerTema('Primeira Eucarista', ['Primeira Eucaristia'])

    expect(r.tipo).toBe('parecido')
    if (r.tipo === 'parecido') {
      expect(r.sugestao).toBe('Primeira Eucaristia')
      // O aviso precisa dizer as duas grafias e o que fazer com elas.
      expect(r.aviso).toContain('Primeira Eucarista')
      expect(r.aviso).toContain('Primeira Eucaristia')
      expect(r.aviso).toMatch(/mesmo|diferentes/i)
    }
  })

  it('não junta nomes curtos parecidos, que costumam ser temas diferentes', () => {
    // "Bela" e "Belo" diferem em uma letra, mas são temas distintos —
    // A Bela e a Fera contra qualquer coisa "Belo". Juntar apagaria um.
    const r = reconhecerTema('Belo', ['Bela'])
    expect(r.tipo).toBe('novo')
  })

  it('trata nome longo com mais tolerância que nome curto', () => {
    // Uma letra errada em 4 caracteres é metade da palavra; em 19, é
    // quase certamente engano de digitação.
    expect(reconhecerTema('Fest', ['Fesa']).tipo).toBe('novo')
    expect(reconhecerTema('Fazendinha Divertida', ['Fazendinha Divertidas']).tipo).toBe(
      'parecido',
    )
  })
})

describe('criar o que é novo', () => {
  it('aceita tema que ainda não existe, sem reclamar', () => {
    const r = reconhecerTema('Homem-Aranha', ['Mickey', 'Frozen'])

    expect(r.tipo).toBe('novo')
    if (r.tipo === 'novo') expect(r.tema).toBe('Homem-Aranha')
  })

  it('arruma o espaçamento do nome que vai para a loja', () => {
    const r = reconhecerTema('  Homem   Aranha  ', [])
    if (r.tipo === 'novo') expect(r.tema).toBe('Homem Aranha')
  })

  it('trata célula vazia como vazia, e não como tema chamado espaço', () => {
    expect(reconhecerTema('', []).tipo).toBe('vazio')
    expect(reconhecerTema('   ', []).tipo).toBe('vazio')
    expect(reconhecerTema('!!!', []).tipo).toBe('vazio')
  })
})

describe('conferindo a planilha inteira', () => {
  it('junta as variações e cria os novos, numa passada só', () => {
    const { temasFinais, novos } = conferirTemas(
      ['Mickey', 'mickey', 'MICKEY', 'Frozen', 'frozen'],
      [],
    )

    expect(novos).toEqual(['Mickey', 'Frozen'])
    expect(temasFinais).toEqual(['Mickey', 'Frozen'])
  })

  it('não obriga ela a cadastrar o tema antes de usar no produto', () => {
    // O tema nasce do próprio produto. Exigir cadastro antes seria
    // travar o trabalho dela no meio.
    const { novos } = conferirTemas(['Patrulha Canina'], ['Mickey'])
    expect(novos).toEqual(['Patrulha Canina'])
  })

  it('avisa uma vez só, mesmo com quarenta produtos no tema errado', () => {
    const escritos = Array.from({ length: 40 }, () => 'Primeira Eucarista')
    const { avisos } = conferirTemas(escritos, ['Primeira Eucaristia'])

    // Quarenta avisos iguais seria ruído, e ela pararia de ler.
    expect(avisos).toHaveLength(1)
  })

  it('não barra a publicação por causa de uma dúvida de grafia', () => {
    const { temasFinais, avisos } = conferirTemas(
      ['Primeira Eucarista'],
      ['Primeira Eucaristia'],
    )

    // O aviso existe para ela decidir depois. Segurar a loja inteira por
    // uma letra seria pior do que publicar com dois temas parecidos.
    expect(avisos).toHaveLength(1)
    expect(temasFinais).toContain('Primeira Eucarista')
  })

  it('aguenta os 86 temas dela sem se perder', () => {
    const temas = Array.from({ length: 86 }, (_, i) => `Tema ${i + 1}`)
    const { temasFinais, novos, avisos } = conferirTemas(temas, [])

    expect(novos).toHaveLength(86)
    expect(temasFinais).toHaveLength(86)
    expect(avisos).toHaveLength(0)
  })
})

describe('a distância entre palavras', () => {
  it('conta zero para palavras iguais', () => {
    expect(distancia('mickey', 'mickey')).toBe(0)
  })

  it('conta uma troca, uma inserção e uma remoção', () => {
    expect(distancia('mickey', 'mickei')).toBe(1)
    expect(distancia('mickey', 'mickeyy')).toBe(1)
    expect(distancia('mickey', 'micke')).toBe(1)
  })

  it('conta o tamanho quando uma delas é vazia', () => {
    expect(distancia('', 'mickey')).toBe(6)
    expect(distancia('mickey', '')).toBe(6)
  })
})

describe('temas numerados', () => {
  it('não confunde Turma 1 com Turma 2', () => {
    // Ninguém digita 2 querendo 1. Sem esta regra, uma planilha com temas
    // numerados vira uma parede de avisos, e ela para de ler todos —
    // inclusive os que importam.
    expect(reconhecerTema('Turma 2', ['Turma 1']).tipo).toBe('novo')
    expect(reconhecerTema('Kit 15', ['Kit 10']).tipo).toBe('novo')
  })

  it('mas ainda pega erro de digitação em tema com número', () => {
    expect(reconhecerTema('Fazendinha 2 Anos', ['Fazendinha 2 Ano']).tipo).toBe('parecido')
  })
})
