import { describe, it, expect } from 'vitest'

import { LINHA_PEDAGOGICA, LINHA_PERSONALIZADA } from './linhas'
import { lerNumero, lerCsv, lerPlanilha } from './planilha'

/**
 * O que se prova aqui é que a planilha aguenta gente de verdade.
 *
 * A Vivian vai preencher 343 produtos ao longo de semanas, no celular, no
 * meio de outras coisas. Vai digitar "39,99" e "R$ 39,99", vai deixar uma
 * linha em branco entre um bloco e outro, vai colar de outro lugar e a
 * coluna vai chegar fora de ordem, e vai escrever "Personalizada" onde eu
 * esperava "Papelaria personalizada".
 *
 * Nada disso é erro dela. Erro seria a loja publicar preço errado por
 * causa de uma vírgula, ou parar tudo porque sobrou um espaço.
 *
 * A regra que divide as duas coisas: **o que dá para entender sem dúvida,
 * entende; o que geraria preço ou produto errado, recusa e explica.**
 */

describe('ler número escrito por gente', () => {
  it.each([
    ['39,99', 39.99],
    ['39.99', 39.99],
    ['R$ 39,99', 39.99],
    [' 39,99 ', 39.99],
    ['1.299,90', 1299.9],
    ['25', 25],
  ])('entende %s como %s', (escrito, esperado) => {
    expect(lerNumero(escrito)).toBe(esperado)
  })

  it('devolve nada para célula vazia, em vez de zero', () => {
    // Zero e vazio são coisas diferentes: preço vazio é erro, preço zero
    // seria produto de graça. Confundir os dois publica a loja inteira
    // valendo R$ 0,00.
    expect(lerNumero('')).toBeNull()
    expect(lerNumero('   ')).toBeNull()
  })

  it('devolve nada para o que não é número', () => {
    expect(lerNumero('a combinar')).toBeNull()
    expect(lerNumero('-')).toBeNull()
  })

  it('não aceita preço negativo', () => {
    expect(lerNumero('-10')).toBeNull()
  })
})

describe('ler o texto separado por vírgula que a planilha exporta', () => {
  it('separa as colunas e usa a primeira linha como cabeçalho', () => {
    const linhas = lerCsv('Nome,Preço\nCaneca,"39,99"\n')

    expect(linhas).toEqual([{ Nome: 'Caneca', 'Preço': '39,99' }])
  })

  it('respeita vírgula dentro de aspas, que é o caso do preço', () => {
    const linhas = lerCsv('Nome,Descrição\nCaneca,"Bonita, resistente e leve"\n')

    expect(linhas[0]['Descrição']).toBe('Bonita, resistente e leve')
  })

  it('entende aspas dentro de aspas, que o Google escreve dobradas', () => {
    const linhas = lerCsv('Nome\n"A caneca ""do Mickey"""\n')

    expect(linhas[0].Nome).toBe('A caneca "do Mickey"')
  })

  it('entende quebra de linha dentro da célula', () => {
    // Os "detalhes" são um por linha dentro da mesma célula: é assim que
    // ela já escreve medidas e material.
    const linhas = lerCsv('Nome,Detalhes\nCaneca,"350 ml\n10 cm de altura"\n')

    expect(linhas[0].Detalhes).toBe('350 ml\n10 cm de altura')
  })

  it('ignora linha totalmente vazia no meio', () => {
    // Ela separa blocos com uma linha em branco. Isso não é produto.
    const linhas = lerCsv('Nome\nCaneca\n\nRevista\n')

    expect(linhas).toHaveLength(2)
  })

  it('aguenta o retorno de carro que vem do Excel', () => {
    const linhas = lerCsv('Nome\r\nCaneca\r\n')

    expect(linhas[0].Nome).toBe('Caneca')
  })
})

const CABECALHO =
  'Nome,Linha,Tema,Preço,Preço promocional,Descrição,Detalhes,Peso do pacote de 10,Medidas da caixa,Pasta no Drive'

const caneca = (mudancas: string[] = []) => {
  const base = [
    'Caneca do Mickey',
    'Personalizada',
    'Mickey',
    '"39,99"',
    '',
    '"A turma do Mickey na sua festa"',
    '"350 ml"',
    '1800',
    '30 x 25 x 12',
    '',
  ]
  mudancas.forEach((valor, i) => {
    if (valor !== undefined && valor !== null) base[i] = valor
  })
  return base.join(',')
}

describe('ler a planilha inteira', () => {
  it('monta o produto a partir do que ela escreveu', () => {
    const { produtos, erros } = lerPlanilha(`${CABECALHO}\n${caneca()}\n`)

    expect(erros).toEqual([])
    expect(produtos).toHaveLength(1)

    const p = produtos[0]
    expect(p.nome).toBe('Caneca do Mickey')
    expect(p.preco).toBe(39.99)
    expect(p.linha).toBe(LINHA_PERSONALIZADA)
    expect(p.tema).toBe('Mickey')
    expect(p.pesoG).toBe(1800)
    expect(p.altCm).toBe(30)
    expect(p.largCm).toBe(25)
    expect(p.compCm).toBe(12)
  })

  it('cria o endereço do produto a partir do nome', () => {
    const { produtos } = lerPlanilha(`${CABECALHO}\n${caneca()}\n`)

    // O slug vai na barra de endereços e no link que ela manda por
    // WhatsApp: sem acento, sem espaço, minúsculo.
    expect(produtos[0].slug).toBe('caneca-do-mickey')
  })

  it('não deixa dois produtos com o mesmo endereço', () => {
    // Nome repetido acontece: "Caneca" da linha de cima e "caneca" da de
    // baixo. Sem isso, um sobrescreveria o outro em silêncio, e ela
    // acharia que o produto simplesmente não foi publicado.
    const { erros } = lerPlanilha(
      `${CABECALHO}\n${caneca()}\n${caneca(['caneca do mickey'])}\n`,
    )

    expect(erros).toHaveLength(1)
    expect(erros[0].linha).toBe(3)
    expect(erros[0].mensagem).toMatch(/duas vezes|repetid/i)
  })

  it('entende a linha escrita do jeito curto', () => {
    // Na planilha a lista suspensa oferece "Personalizada" e "Pedagógica",
    // que é como ela fala. O nome comprido é coisa do código.
    const digital = caneca([
      'Alfabeto Ilustrado',
      'Pedagógica',
      'Alfabetização',
      '"29,99"',
      '',
      '"Atividades de alfabetização"',
      '',
      '',
      '',
      'https://drive.google.com/pasta',
    ])

    const { produtos, erros } = lerPlanilha(`${CABECALHO}\n${digital}\n`)

    expect(erros).toEqual([])
    expect(produtos[0].linha).toBe(LINHA_PEDAGOGICA)
  })

  it('aceita a coluna fora de ordem, que é o que acontece ao colar', () => {
    const trocado = 'Preço,Nome,Linha,Tema,Descrição\n"39,99",Caneca,Personalizada,Mickey,Bonita'
    const { produtos, erros } = lerPlanilha(trocado)

    expect(erros.filter((e) => /preço|nome/i.test(e.mensagem))).toEqual([])
    expect(produtos[0].preco).toBe(39.99)
  })

  it('ignora espaço sobrando no cabeçalho e no acento', () => {
    const semAcento = ' nome , linha , tema , preco , descricao \nCaneca,Personalizada,Mickey,"39,99",Bonita'
    const { produtos, erros } = lerPlanilha(semAcento)

    expect(erros).toEqual([])
    expect(produtos[0].nome).toBe('Caneca')
  })
})

describe('o que faz a publicação parar', () => {
  it('recusa produto sem nome', () => {
    const { erros, produtos } = lerPlanilha(`${CABECALHO}\n${caneca([''])}\n`)

    expect(produtos).toHaveLength(0)
    expect(erros[0].mensagem).toMatch(/nome/i)
    expect(erros[0].linha).toBe(2)
  })

  it('recusa produto sem preço, em vez de publicar de graça', () => {
    const { erros } = lerPlanilha(
      `${CABECALHO}\n${caneca([undefined as never, undefined as never, undefined as never, ''])}\n`,
    )

    expect(erros).toHaveLength(1)
    expect(erros[0].mensagem).toMatch(/preço/i)
  })

  it('recusa promoção maior que o preço cheio', () => {
    const { erros } = lerPlanilha(
      `${CABECALHO}\n${caneca([
        undefined as never,
        undefined as never,
        undefined as never,
        '"39,99"',
        '"49,99"',
      ])}\n`,
    )

    expect(erros[0].mensagem).toMatch(/promo/i)
  })

  it('recusa personalizado sem peso e sem medida, que faz o frete sair errado', () => {
    const semMedida = caneca([
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      '',
      '',
    ])

    const { erros } = lerPlanilha(`${CABECALHO}\n${semMedida}\n`)

    // A diferença sai do bolso dela em cada pedido.
    expect(erros.some((e) => /peso|medida/i.test(e.mensagem))).toBe(true)
  })

  it('recusa digital sem a pasta do Drive, que não teria o que entregar', () => {
    const digital = caneca([
      'Alfabeto',
      'Pedagógica',
      'Alfabetização',
      '"29,99"',
      '',
      '"Atividades"',
      '',
      '',
      '',
      '',
    ])

    const { erros } = lerPlanilha(`${CABECALHO}\n${digital}\n`)

    expect(erros.some((e) => /pasta|drive/i.test(e.mensagem))).toBe(true)
  })

  it('diz o número da linha da planilha, e não o índice do vetor', () => {
    // Ela vai procurar essa linha na tela. Errar em um é mandar ela olhar
    // o produto errado.
    const { erros } = lerPlanilha(`${CABECALHO}\n${caneca()}\n${caneca([''])}\n`)

    expect(erros[0].linha).toBe(3)
  })

  it('não deixa passar linha sem coluna nenhuma conhecida', () => {
    const { erros } = lerPlanilha('Coisa,Outra\nA,B')

    expect(erros.some((e) => /coluna/i.test(e.mensagem))).toBe(true)
  })
})

describe('os temas que saem da planilha', () => {
  it('junta as variações de escrita num tema só', () => {
    const csv = [
      CABECALHO,
      caneca([undefined as never, undefined as never, 'Mickey']),
      caneca(['Revista do Mickey', undefined as never, 'mickey']),
      caneca(['Álbum do Mickey', undefined as never, 'MICKEY']),
    ].join('\n')

    const { temas } = lerPlanilha(csv)

    expect(temas).toEqual(['Mickey'])
  })

  it('avisa sobre tema parecido sem impedir a publicação', () => {
    const csv = [
      CABECALHO,
      caneca([undefined as never, undefined as never, 'Primeira Eucaristia']),
      caneca(['Terço', undefined as never, 'Primeira Eucarista']),
    ].join('\n')

    const { avisos, erros, produtos } = lerPlanilha(csv)

    // Segurar a loja inteira por uma letra seria pior do que publicar com
    // dois temas parecidos e avisar.
    expect(erros).toEqual([])
    expect(produtos).toHaveLength(2)
    expect(avisos).toHaveLength(1)
    expect(avisos[0]).toMatch(/Primeira Eucarista/)
  })

  it('trata produto sem tema como sem tema, e não como erro', () => {
    const semTema = caneca([undefined as never, undefined as never, ''])
    const { erros, produtos } = lerPlanilha(`${CABECALHO}\n${semTema}\n`)

    expect(erros).toEqual([])
    expect(produtos[0].tema).toBe('')
  })
})
