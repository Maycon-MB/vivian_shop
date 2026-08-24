import { describe, it, expect } from 'vitest'

import { escolherCatalogo } from './catalogoDoBanco'

/**
 * De onde a vitrine tira os produtos.
 *
 * A loja tem dois catálogos possíveis: o de exemplo, escrito por mim, e o
 * dela, que veio da Elojinha e vive no banco. A troca não é uma edição de
 * código — é o que o banco responde na hora de gerar o site.
 *
 * A regra tem uma sutileza que vale escrever: banco vazio não significa
 * "loja sem produtos", significa "ela ainda não publicou nada". Enquanto
 * isso, mostrar os exemplos é mais honesto do que uma vitrine em branco,
 * porque a loja está em demonstração e o aviso no topo diz isso.
 */

const exemplo = [{ slug: 'exemplo', name: 'Produto de exemplo' }]
const dela = [{ slug: 'lousa-magica-frozen', name: 'Lousa Mágica - Frozen' }]

describe('escolher qual catálogo a loja mostra', () => {
  it('usa o dela quando há produto publicado', () => {
    expect(escolherCatalogo(dela, exemplo)).toBe(dela)
  })

  it('fica com os exemplos enquanto ela não publicar nada', () => {
    // Os 343 produtos estão no banco desde 24/08, todos como rascunho.
    // Vitrine em branco faria a loja parecer quebrada.
    expect(escolherCatalogo([], exemplo)).toBe(exemplo)
  })

  it('fica com os exemplos quando não há banco configurado', () => {
    expect(escolherCatalogo(undefined, exemplo)).toBe(exemplo)
  })

  it('não mistura os dois', () => {
    // Meio catálogo dela e meio meu seria a pior das duas: ela veria
    // produto que não é dela na própria loja, e não saberia como tirar.
    const resultado = escolherCatalogo(dela, exemplo)

    expect(resultado).not.toContain(exemplo[0])
  })
})
