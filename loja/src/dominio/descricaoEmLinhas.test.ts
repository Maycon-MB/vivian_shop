import { describe, it, expect } from 'vitest'

import { descricaoEmLinhas } from './descricaoEmLinhas'

const texto = (bruta: string) => descricaoEmLinhas(bruta).map((l) => l.texto)

describe('a descrição que a cliente lê', () => {
  it('não junta tudo numa linha só quando o texto já vinha separado', () => {
    /* Este é o defeito que a Vivian apontou em 30/08. Duzentas e sessenta
       e duas descrições já vinham com as quebras certas do Elo7, e a
       página desenhava `<p>{descricao}</p>`: o HTML colapsa quebra de
       linha em espaço, e tudo saía embolado. O texto estava certo; quem
       jogava fora era a tela. */
    const linhas = texto('Bloquinho personalizado.\nTAMANHO: 11 x 16 cm\nMATERIAL: papel offset')

    expect(linhas).toHaveLength(3)
  })

  it('separa o que vinha corrido, usando os rótulos', () => {
    // Oitenta descrições vieram sem quebra nenhuma.
    const linhas = texto(
      'Caneca personalizada com o nome. TAMANHO: 350 ml MATERIAL: cerâmica',
    )

    expect(linhas).toEqual([
      'Caneca personalizada com o nome.',
      'Tamanho: 350 ml',
      'Material: cerâmica',
    ])
  })

  it('quebra no marcador de lista que o editor deles deixou', () => {
    /* 223 descrições usam `•` no meio da frase como se fosse item de
       lista. Na tela vira um ponto solto no meio do parágrafo. */
    const linhas = texto('Álbum personalizado • Acompanha 16 figurinhas • Não vai repetida')

    expect(linhas).toEqual([
      'Álbum personalizado',
      'Acompanha 16 figurinhas',
      'Não vai repetida',
    ])
  })

  it('marca o rótulo separado do valor, para a tela poder destacar', () => {
    const linhas = descricaoEmLinhas('TAMANHO DO ÁLBUM: 14 x 20 cm')

    expect(linhas[0].rotulo).toBe('Tamanho do álbum')
    expect(linhas[0].valor).toBe('14 x 20 cm')
  })

  it('tira o grito da caixa alta, e não muda a palavra', () => {
    /* "PRAZO DE PRODUÇÃO: 5 DIAS ÚTEIS" é como o marketplace pedia. Numa
       página de produto, caixa alta lê como grito, e ela mostrou o
       formato que quer com as palavras em caixa normal. */
    const linhas = texto('PRAZO DE PRODUÇÃO: 5 DIAS ÚTEIS')

    expect(linhas[0]).toBe('Prazo de produção: 5 dias úteis')
  })

  it('não mexe em sigla nem em medida', () => {
    /* Baixar "PDF" para "pdf" e "A4" para "a4" estragaria justamente a
       informação técnica que a cliente veio conferir. */
    const linhas = texto('MATERIAL: arquivo PDF tamanho A4, impresso em MDF')

    expect(linhas[0]).toBe('Material: arquivo PDF tamanho A4, impresso em MDF')
  })

  it('não perde nenhuma palavra dela', () => {
    /* A regra separa e desce a caixa. Não resume, não corta e não
       reescreve: o texto do produto é dela e é o que vende. */
    const bruta = 'Revista para colorir com o nome • TAMANHO: 15 x 21 cm ATENÇÃO AOS PRAZOS: 5 dias'
    const juntas = texto(bruta).join(' ').toLowerCase()

    for (const palavra of ['revista', 'colorir', 'nome', 'tamanho', 'prazos', 'dias']) {
      expect(juntas).toContain(palavra)
    }
  })

  it('não deixa linha vazia nem espaço solto', () => {
    const linhas = texto('Bloquinho.  \n\n\n   •   \nTAMANHO: 11 cm')

    expect(linhas).toEqual(['Bloquinho.', 'Tamanho: 11 cm'])
  })

  it('devolve lista vazia quando não há descrição', () => {
    expect(descricaoEmLinhas('')).toEqual([])
    expect(descricaoEmLinhas(null as never)).toEqual([])
  })
})
