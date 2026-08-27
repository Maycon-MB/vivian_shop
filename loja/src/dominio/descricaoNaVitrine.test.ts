import { describe, it, expect } from 'vitest'

import { PRODUTOS } from '../telas/catalogo'

/**
 * A limpeza da descrição está ligada no catálogo que vai ao ar.
 *
 * `limparDescricao` foi escrita em 26/08 com 20 testes, e nunca foi
 * chamada por ninguém: o texto cru da Elojinha saiu na loja por um dia
 * inteiro, com 262 produtos mandando a cliente conferir o prazo na
 * concorrente.
 *
 * Os testes daquele arquivo provam que a função limpa. Este prova que ela
 * está no caminho, que é a parte que faltava e a que ninguém repara ao
 * refatorar.
 */

describe('o que a cliente lê na vitrine', () => {
  it('nenhuma descrição cita a loja concorrente', () => {
    /* Mandar a cliente para uma loja fechada é perder a venda no meio da
       página, e ainda anunciar quem morreu. */
    const citando = PRODUTOS.filter((p) => /ELO\s?7/i.test(p.description ?? ''))

    expect(citando.map((p) => p.slug)).toEqual([])
  })

  it('nenhuma descrição traz filete de hifens', () => {
    // Separador do editor deles. Aqui vira uma linha de traços no meio do
    // texto, e a página parece quebrada.
    const comFilete = PRODUTOS.filter((p) => /^\s*-{4,}\s*$/m.test(p.description ?? ''))

    expect(comFilete.map((p) => p.slug)).toEqual([])
  })

  it('nenhuma descrição usa seta no lugar de marcador', () => {
    const comSeta = PRODUTOS.filter((p) => (p.description ?? '').includes('-->'))

    expect(comSeta.map((p) => p.slug)).toEqual([])
  })

  it('nenhuma descrição fala em anúncio', () => {
    /* Palavra de marketplace. Aqui não há anúncio, há a página do produto
       dela. */
    const comAnuncio = PRODUTOS.filter((p) => /\b(no|do) anúncio\b/i.test(p.description ?? ''))

    expect(comAnuncio.map((p) => p.slug)).toEqual([])
  })

  it('o texto dela continua lá', () => {
    /* A limpeza tira o que a plataforma antiga exigia, e não a descrição.
       Se um dia ela apagar tudo, este teste avisa antes de a loja ir ao ar
       com 342 produtos sem texto. */
    const vazias = PRODUTOS.filter((p) => !(p.description ?? '').trim())

    expect(vazias.map((p) => p.slug)).toEqual([])
  })
})
