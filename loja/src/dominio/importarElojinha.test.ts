import { describe, it, expect } from 'vitest'

import { LINHA_PERSONALIZADA } from './linhas'
import {
  desofuscar,
  prazoEmDias,
  tipoETema,
  paraProduto,
} from './importarElojinha'

/**
 * O catálogo dela existe numa terceira loja, e precisa virar o nosso.
 *
 * Quando o Elo7 fechou, ela migrou a papelaria personalizada para a
 * Elojinha. São 343 produtos com descrição, preço e foto, escritos por ela
 * ao longo de anos. Isso é o acervo do negócio, e é o que estava dado como
 * perdido.
 *
 * O que chega de lá não tem tudo que a nossa loja precisa: não diz a linha
 * de venda, não diz o mínimo, e o tema está dentro do nome do produto. É
 * isso que estas regras resolvem, e cada suposição aqui é uma decisão que
 * pode estar errada — por isso todas têm teste com o caso real.
 */

describe('separar o tipo do tema', () => {
  it('quebra no hífen, que é o padrão que ela usa', () => {
    expect(tipoETema('Lousa Mágica - a Poderosa Chefinha')).toEqual({
      tipo: 'Lousa Mágica',
      tema: 'a Poderosa Chefinha',
    })
  })

  it('aguenta tema com hífen no meio', () => {
    // "Kit de Colorir - Revista + Giz - Mickey" tem dois hifens: o tipo é
    // o primeiro pedaço, o tema é todo o resto.
    expect(tipoETema('Kit de Colorir - Revista + Giz - Mickey')).toEqual({
      tipo: 'Kit de Colorir',
      tema: 'Revista + Giz - Mickey',
    })
  })

  it('deixa o tema vazio quando o nome não tem hífen', () => {
    // Sem tema é melhor do que tema inventado: produto sem tema aparece
    // em "sem tema definido" e ela ajeita depois.
    expect(tipoETema('Caderno personalizado')).toEqual({
      tipo: 'Caderno personalizado',
      tema: '',
    })
  })

  it('não se perde com espaço sobrando', () => {
    expect(tipoETema('  Caneca   -   Frozen  ')).toEqual({
      tipo: 'Caneca',
      tema: 'Frozen',
    })
  })
})

describe('desofuscar o nome do personagem', () => {
  it('junta as letras separadas por ponto', () => {
    // Ela escreve "P.e.p.p.a P.i.g" para escapar do filtro de marca do
    // marketplace. Na loja dela isso não é necessário, e atrapalha quem
    // procura: ninguém digita ponto entre as letras.
    expect(desofuscar('P.e.p.p.a P.i.g')).toBe('Peppa Pig')
  })

  it('mexe só no que está claramente ofuscado', () => {
    expect(desofuscar('Frozen')).toBe('Frozen')
    expect(desofuscar('Lousa Mágica')).toBe('Lousa Mágica')
  })

  it('não estraga abreviação de verdade', () => {
    // "Kit 2 em 1" e nomes com ponto final legítimo continuam iguais.
    expect(desofuscar('Kit 2 em 1')).toBe('Kit 2 em 1')
    expect(desofuscar('Turma da Mônica Jr.')).toBe('Turma da Mônica Jr.')
  })
})

describe('o prazo de produção', () => {
  it.each([
    ['Sob encomenda: 5 dias', 5],
    ['Em 5 dias', 5],
    ['Sob encomenda: 10 dias úteis', 10],
  ])('entende %s como %s dias', (texto, esperado) => {
    expect(prazoEmDias(texto)).toBe(esperado)
  })

  it('usa o prazo dela quando o texto não diz nada', () => {
    // Cinco dias úteis é a regra que ela repetia em todo anúncio.
    expect(prazoEmDias('')).toBe(5)
    expect(prazoEmDias('sob encomenda')).toBe(5)
  })
})

describe('virar um produto da nossa loja', () => {
  const bruto = {
    slug: 'lousa-magica-a-poderosa-chefinha',
    nome: 'Lousa Mágica - a Poderosa Chefinha',
    preco: 'R$ 13,70',
    preco_promocional: '',
    descricao: 'Lousa Mágica personalizada com o nome de sua preferência!',
    prazo_producao: 'Sob encomenda: 5 dias',
    fotos: 'https://cdn/1.jpg;https://cdn/2.jpg',
    peso_g: '',
    alt_cm: '',
    larg_cm: '',
    comp_cm: '',
  }

  it('traz nome, preço e descrição como ela escreveu', () => {
    const p = paraProduto(bruto)

    expect(p.nome).toBe('Lousa Mágica - a Poderosa Chefinha')
    expect(p.preco).toBe(13.7)
    expect(p.descricao).toContain('personalizada com o nome')
  })

  it('assume a linha personalizada, que é o que essa loja vende', () => {
    // A Elojinha recebeu só a papelaria personalizada. O material
    // pedagógico dela nunca foi para lá.
    expect(paraProduto(bruto).linha).toBe(LINHA_PERSONALIZADA)
  })

  it('usa o mínimo que ela cadastrou, quando ele vem', () => {
    // 12 dos 343 produtos dela têm mínimo 1, e não 10. Fixar dez apagaria
    // uma decisão dela em cada um deles.
    expect(paraProduto({ ...bruto, minimo: '1' }).minimo).toBe(1)
    expect(paraProduto({ ...bruto, minimo: '10' }).minimo).toBe(10)
  })

  it('cai no mínimo de 10 quando o dado não vem', () => {
    expect(paraProduto(bruto).minimo).toBe(10)
  })

  it('usa o prazo em dias que ela cadastrou', () => {
    expect(paraProduto({ ...bruto, prazo_producao: '7' }).prazoProducao).toBe(7)
  })

  it('separa as fotos e guarda a primeira como capa', () => {
    const p = paraProduto(bruto)

    expect(p.fotos).toEqual(['https://cdn/1.jpg', 'https://cdn/2.jpg'])
  })

  it('tira o tema de dentro do nome, já desofuscado', () => {
    const p = paraProduto({ ...bruto, nome: 'Revista para Colorir - P.e.p.p.a P.i.g' })

    expect(p.tema).toBe('Peppa Pig')
  })

  it('deixa peso e medidas vazios em vez de chutar', () => {
    // Eles só existem no painel logado. Chutar peso faz o frete sair
    // errado, e a diferença sai do bolso dela em cada pedido.
    const p = paraProduto(bruto)

    expect(p.pesoG).toBeUndefined()
    expect(p.altCm).toBeUndefined()
  })

  it('aproveita peso e medidas quando eles vierem', () => {
    const p = paraProduto({ ...bruto, peso_g: '1800', alt_cm: '30', larg_cm: '25', comp_cm: '12' })

    expect(p.pesoG).toBe(1800)
    expect(p.altCm).toBe(30)
  })

  it('só aceita promoção que é menor que o preço cheio', () => {
    expect(paraProduto({ ...bruto, preco_promocional: 'R$ 9,90' }).precoPromocional).toBe(9.9)
    expect(paraProduto({ ...bruto, preco_promocional: 'R$ 20,00' }).precoPromocional).toBeUndefined()
  })

  it('recusa produto sem preço, em vez de publicar de graça', () => {
    expect(() => paraProduto({ ...bruto, preco: '' })).toThrow(/preço/i)
  })
})
