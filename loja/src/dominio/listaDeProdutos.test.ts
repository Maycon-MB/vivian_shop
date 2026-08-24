import { describe, it, expect } from 'vitest'

import { agruparPorTipo, buscar, resumo } from './listaDeProdutos'

/**
 * A lista de produtos do painel, com 343 itens dentro.
 *
 * Esse número muda o que a tela precisa ser. Com vinte produtos, rolar
 * resolve; com 343, rolar é como procurar um nome numa lista telefônica.
 * Ela vinha do Elo7, onde a tela era uma tabela com busca, e é isso que
 * a mão dela já sabe fazer.
 *
 * O agrupamento por tipo existe por outra razão: ela tem 58 Lousas
 * Mágicas iguais, variando só o tema impresso. Publicar uma a uma são 58
 * toques no celular. Por tipo, é um.
 */

const p = (nome: string, extras: Record<string, unknown> = {}) => ({
  id: nome,
  slug: nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  nome,
  preco: 13.7,
  ativo: false,
  tema: '',
  ...extras,
})

const CATALOGO = [
  p('Lousa Mágica - Frozen'),
  p('Lousa Mágica - Mickey'),
  p('Lousa Mágica - P.e.p.p.a P.i.g'),
  p('Caneca Personalizada - Frozen'),
  p('Álbum de Figurinhas - Chaves', { ativo: true }),
  p('Bloquinho'),
]

describe('procurar na lista', () => {
  it('acha pelo nome, sem precisar do acento', () => {
    // Ela digita no celular, com pressa, e o teclado nem sempre acentua.
    expect(buscar(CATALOGO, 'album').map((x) => x.nome)).toEqual([
      'Álbum de Figurinhas - Chaves',
    ])
  })

  it('ignora maiúscula e espaço sobrando', () => {
    expect(buscar(CATALOGO, '  FROZEN ')).toHaveLength(2)
  })

  it('acha pelo tema, que é como a cliente dela pede', () => {
    // "Tem alguma coisa do Mickey?" é a pergunta que chega no WhatsApp.
    expect(buscar(CATALOGO, 'mickey')).toHaveLength(1)
  })

  it('acha o personagem escrito com pontos', () => {
    // Ela escrevia "P.e.p.p.a P.i.g" no marketplace para escapar do filtro
    // de marca. Ninguém procura digitando os pontos.
    expect(buscar(CATALOGO, 'peppa')).toHaveLength(1)
  })

  it('devolve a lista inteira quando não há busca', () => {
    expect(buscar(CATALOGO, '')).toHaveLength(CATALOGO.length)
    expect(buscar(CATALOGO, '   ')).toHaveLength(CATALOGO.length)
  })

  it('devolve nada quando não acha, em vez de tudo', () => {
    // Devolver a lista inteira faria ela achar que o produto existe.
    expect(buscar(CATALOGO, 'guarda-chuva')).toEqual([])
  })
})

describe('agrupar por tipo', () => {
  it('junta os produtos que só diferem no tema', () => {
    const grupos = agruparPorTipo(CATALOGO)
    const lousas = grupos.find((g) => g.tipo === 'Lousa Mágica')

    expect(lousas?.produtos).toHaveLength(3)
  })

  it('mantém quem não tem tema como grupo próprio', () => {
    const grupos = agruparPorTipo(CATALOGO)

    expect(grupos.find((g) => g.tipo === 'Bloquinho')?.produtos).toHaveLength(1)
  })

  it('ordena do maior grupo para o menor', () => {
    // O que ela ganha mais publicando de uma vez aparece primeiro.
    const grupos = agruparPorTipo(CATALOGO)

    expect(grupos[0].tipo).toBe('Lousa Mágica')
  })

  it('conta quantos do grupo já estão no ar', () => {
    const grupos = agruparPorTipo(CATALOGO)

    expect(grupos.find((g) => g.tipo === 'Lousa Mágica')?.publicados).toBe(0)
    expect(grupos.find((g) => g.tipo === 'Álbum de Figurinhas')?.publicados).toBe(1)
  })
})

describe('o resumo que a tela mostra em cima', () => {
  it('conta o que está no ar e o que falta', () => {
    expect(resumo(CATALOGO)).toEqual({ total: 6, publicados: 1, rascunhos: 5 })
  })

  it('aguenta lista vazia sem quebrar a conta', () => {
    expect(resumo([])).toEqual({ total: 0, publicados: 0, rascunhos: 0 })
  })
})
