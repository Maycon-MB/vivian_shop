import { describe, it, expect } from 'vitest'

import {
  LIMITE_DA_ESCOLHA,
  LIMITE_DE_ENVIO,
  conferirArquivo,
  caminhoNoBalde,
  medidaReduzida,
  TAMANHOS,
} from './fotoDoProduto'

/**
 * A foto sai do celular dela com 4 MB. Não pode chegar assim na loja.
 *
 * Três coisas quebram se ninguém reduzir antes de enviar:
 *
 *   - o 1 GB gratuito de armazenamento acaba em 250 fotos
 *   - a vitrine passa de 1 MB e a cliente dela desiste no 4G
 *   - o envio demora tanto que ela acha que travou e aperta de novo
 *
 * Reduzir no navegador dela resolve os três de uma vez, e de graça: quem
 * faz o trabalho é o aparelho de quem está enviando.
 */

describe('reduzir sem deformar', () => {
  it('encolhe pelo lado maior e mantém a proporção', () => {
    // Foto de celular em pé, 3024x4032.
    expect(medidaReduzida({ largura: 3024, altura: 4032 }, 900)).toEqual({
      largura: 675,
      altura: 900,
    })
  })

  it('encolhe deitada pelo mesmo critério', () => {
    expect(medidaReduzida({ largura: 4000, altura: 3000 }, 900)).toEqual({
      largura: 900,
      altura: 675,
    })
  })

  it('não aumenta foto pequena', () => {
    // Esticar uma foto de 300px para 900 deixa borrada e ocupa mais
    // espaço: fica pior e mais cara ao mesmo tempo.
    expect(medidaReduzida({ largura: 300, altura: 200 }, 900)).toEqual({
      largura: 300,
      altura: 200,
    })
  })

  it('arredonda para pixel inteiro', () => {
    const { largura, altura } = medidaReduzida({ largura: 1001, altura: 667 }, 900)

    expect(Number.isInteger(largura)).toBe(true)
    expect(Number.isInteger(altura)).toBe(true)
  })

  it('aguenta imagem quadrada', () => {
    expect(medidaReduzida({ largura: 2000, altura: 2000 }, 900)).toEqual({
      largura: 900,
      altura: 900,
    })
  })
})

describe('os dois tamanhos que a loja usa', () => {
  it('guarda a foto da página do produto e a da vitrine', () => {
    // A vitrine mostra treze de uma vez; a página do produto, uma. Servir
    // o mesmo arquivo nas duas levou a vitrine a 1,3 MB, e foi o teste de
    // peso que pegou.
    expect(TAMANHOS.cheia).toBe(900)
    expect(TAMANHOS.mini).toBe(440)
    expect(TAMANHOS.mini).toBeLessThan(TAMANHOS.cheia)
  })
})

describe('o que a loja aceita receber', () => {
  it('aceita foto de celular comum', () => {
    expect(conferirArquivo({ tipo: 'image/jpeg', tamanho: 3_500_000 }).ok).toBe(true)
    expect(conferirArquivo({ tipo: 'image/png', tamanho: 800_000 }).ok).toBe(true)
    expect(conferirArquivo({ tipo: 'image/webp', tamanho: 200_000 }).ok).toBe(true)
  })

  it('recusa o que não é imagem, dizendo o que fazer', () => {
    const r = conferirArquivo({ tipo: 'application/pdf', tamanho: 100_000 })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.motivo).toMatch(/foto|imagem/i)
  })

  it('recusa o que é grande demais até para reduzir', () => {
    // A foto do celular dela tem 3 ou 4 MB e precisa passar: é o caso
    // normal. O que este limite pega é o engano de escolher um vídeo.
    const r = conferirArquivo({ tipo: 'image/jpeg', tamanho: LIMITE_DA_ESCOLHA + 1 })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.motivo).toMatch(/MB|vídeo/i)
  })

  it('o limite do balde é bem menor que o da escolha, e é a rede', () => {
    // Depois de reduzida a foto fica em torno de 60 KB. Se um arquivo
    // chegar perto de 2 MB no envio, a redução falhou.
    expect(LIMITE_DE_ENVIO).toBeLessThan(LIMITE_DA_ESCOLHA)
  })

  it('recusa arquivo vazio, que é o que sobra de um envio interrompido', () => {
    expect(conferirArquivo({ tipo: 'image/jpeg', tamanho: 0 }).ok).toBe(false)
  })
})

describe('onde a foto fica guardada', () => {
  it('usa o endereço do produto, para o arquivo ser reconhecível', () => {
    expect(caminhoNoBalde('caneca-personalizada', 1, 'cheia')).toBe(
      'caneca-personalizada/1-cheia.webp',
    )
    expect(caminhoNoBalde('caneca-personalizada', 1, 'mini')).toBe(
      'caneca-personalizada/1-mini.webp',
    )
  })

  it('separa as fotos do mesmo produto pela ordem', () => {
    expect(caminhoNoBalde('lousa-magica', 3, 'cheia')).toBe('lousa-magica/3-cheia.webp')
  })

  it('não deixa o nome do produto escapar da própria pasta', () => {
    // Nome com barra ou ".." viraria caminho para outra pasta do balde.
    // Ela não faria isso de propósito, mas o nome vem de texto livre.
    expect(caminhoNoBalde('../outra/pasta', 1, 'cheia')).toBe('outra-pasta/1-cheia.webp')
    expect(caminhoNoBalde('Caneca do Mickey!', 1, 'cheia')).toBe(
      'caneca-do-mickey/1-cheia.webp',
    )
  })
})
