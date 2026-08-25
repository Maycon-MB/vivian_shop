import { describe, it, expect } from 'vitest'

import {
  FORMULARIO_VAZIO,
  doBanco,
  enderecoDoNome,
  paraOBanco,
  problemas,
  type Formulario,
} from './edicaoDeProduto'

/**
 * Cadastrar e editar produto.
 *
 * Ela pediu isso em 24/08, depois de ver a loja no ar: "como faço para
 * editar produtos, incluir um produto, modificar preços". Cada teste aqui
 * descreve o que acontece com ela, e não o que o código faz.
 */

const cheio = (mudancas: Partial<Formulario> = {}): Formulario => ({
  ...FORMULARIO_VAZIO,
  nome: 'Lousa Mágica - Peppa Pig',
  preco: '13,70',
  peso_g: '900',
  alt_cm: '5',
  larg_cm: '22',
  comp_cm: '30',
  ...mudancas,
})

describe('o endereço do produto na loja', () => {
  it('vira o que alguém digitaria no Google', () => {
    expect(enderecoDoNome('Lousa Mágica - Peppa Pig')).toBe('lousa-magica-peppa-pig')
  })

  it('tira os pontos que ela usava para escapar do filtro do marketplace', () => {
    // No Elo7 ela escrevia "P.e.p.p.a P.i.g" para o anúncio não cair no
    // filtro de marca. Na loja dela isso não é preciso, e ninguém procura
    // por "p.e.p.p.a".
    expect(enderecoDoNome('Lousa - P.e.p.p.a P.i.g')).toBe('lousa-peppa-pig')
  })

  it('não termina nem começa com traço', () => {
    expect(enderecoDoNome('  Álbum!  ')).toBe('album')
  })
})

describe('o que impede de salvar', () => {
  it('deixa salvar quando está tudo preenchido', () => {
    expect(problemas(cheio())).toEqual([])
  })

  it('cobra o nome', () => {
    expect(problemas(cheio({ nome: '' })).join(' ')).toContain('nome')
  })

  it('cobra um nome que vire endereço', () => {
    // "???" tem caracteres, mas nenhum que sobreviva ao endereço. Sem
    // isso o produto nasceria com slug vazio e o banco recusaria com uma
    // mensagem que ela não entende.
    expect(problemas(cheio({ nome: '???' })).join(' ')).toContain('letra')
  })

  it('cobra o preço', () => {
    expect(problemas(cheio({ preco: '' })).join(' ')).toContain('preço')
  })

  it('recusa preço zero', () => {
    // Preço vazio é esquecimento; preço zero publicaria o produto de
    // graça. Os dois param aqui.
    expect(problemas(cheio({ preco: '0' })).join(' ')).toContain('maior que zero')
  })

  it('recusa promoção que não é promoção', () => {
    const recado = problemas(cheio({ preco: '13,70', preco_promocional: '15,00' })).join(' ')
    expect(recado).toContain('menor que o preço normal')
  })

  it('aceita promoção de verdade', () => {
    expect(problemas(cheio({ preco: '13,70', preco_promocional: '10,00' }))).toEqual([])
  })

  it('cobra mínimo de pelo menos um', () => {
    expect(problemas(cheio({ minimo: '0' })).join(' ')).toContain('mínimo')
  })
})

describe('rascunho pode estar incompleto, publicado não', () => {
  it('salva rascunho sem peso e sem medidas', () => {
    /* Ela cadastra o produto entre uma encomenda e outra, e o peso da
       caixa ela só sabe depois de embalar. Exigir tudo de uma vez faz
       ela desistir no meio e perder o que já digitou. */
    const rascunho = cheio({ ativo: false, peso_g: '', alt_cm: '', larg_cm: '', comp_cm: '' })
    expect(problemas(rascunho)).toEqual([])
  })

  it('não deixa publicar sem peso e medidas, e diz o porquê', () => {
    const publicando = cheio({ ativo: true, peso_g: '', alt_cm: '' })
    const recado = problemas(publicando).join(' ')

    expect(recado).toContain('o peso')
    expect(recado).toContain('a altura')
    // O motivo, e não só a regra: sem isso ela acha que é burocracia.
    expect(recado).toContain('do seu bolso')
  })

  it('deixa publicar quando as medidas estão lá', () => {
    expect(problemas(cheio({ ativo: true }))).toEqual([])
  })

  it('cobra a pasta do Drive para publicar material digital', () => {
    const digital = cheio({ ativo: true, linha: 'pedagogica', pasta_drive: '' })
    expect(problemas(digital).join(' ')).toContain('Drive')
  })

  it('não cobra medidas de caixa para material digital', () => {
    // O digital não vai pelos Correios.
    const digital = cheio({
      ativo: true, linha: 'pedagogica', pasta_drive: 'https://drive.google.com/x',
      peso_g: '', alt_cm: '', larg_cm: '', comp_cm: '',
    })
    expect(problemas(digital)).toEqual([])
  })
})

describe('o formulário virando linha de banco', () => {
  it('entende o preço com vírgula, que é como ela digita', () => {
    expect(paraOBanco(cheio({ preco: '13,70' })).preco_reais).toBe(13.7)
  })

  it('guarda promoção vazia como nada, e não como zero', () => {
    // Zero viraria "produto em promoção por R$ 0,00" na vitrine.
    expect(paraOBanco(cheio({ preco_promocional: '' })).preco_promocional_reais).toBeNull()
  })

  it('mantém o endereço antigo ao editar', () => {
    /* Se ela corrigir uma letra do nome, o endereço não pode mudar: a
       cliente salvou o link e o Google já indexou a página. */
    const salvo = paraOBanco(cheio({ nome: 'Lousa Mágica - Peppa Pigg' }), 'lousa-magica-peppa-pig')
    expect(salvo.slug).toBe('lousa-magica-peppa-pig')
  })

  it('cria o endereço a partir do nome quando o produto é novo', () => {
    expect(paraOBanco(cheio()).slug).toBe('lousa-magica-peppa-pig')
  })

  it('guarda tema vazio como nada', () => {
    // Coluna com chave estrangeira: '' não é um tema, é ausência de tema.
    expect(paraOBanco(cheio({ tema_id: '' })).tema_id).toBeNull()
  })

  it('arredonda o peso, que o banco guarda em grama inteira', () => {
    expect(paraOBanco(cheio({ peso_g: '899,6' })).peso_g).toBe(900)
  })
})

describe('a linha do banco virando formulário', () => {
  it('traz o produto para ela editar', () => {
    const formulario = doBanco({
      nome: 'Álbum de Figurinhas',
      preco_reais: '13.70',
      preco_promocional_reais: null,
      linha: 'personalizada',
      minimo: 10,
      peso_g: 900,
      ativo: true,
    })

    expect(formulario.nome).toBe('Álbum de Figurinhas')
    expect(formulario.preco).toBe('13.70')
    expect(formulario.ativo).toBe(true)
  })

  it('mostra campo vazio, e nunca a palavra null', () => {
    // Sem isso, ela abre o produto e lê "null" no campo do peso.
    expect(doBanco({ peso_g: null, preco_promocional_reais: null }).peso_g).toBe('')
    expect(doBanco({ peso_g: null, preco_promocional_reais: null }).preco_promocional).toBe('')
  })

  it('ida e volta não muda o produto', () => {
    const original = cheio({ ativo: true, descricao: 'Com 30 figurinhas.' })
    expect(doBanco(paraOBanco(original) as unknown as Record<string, unknown>)).toEqual({
      ...original,
      preco: '13.7',
    })
  })
})
