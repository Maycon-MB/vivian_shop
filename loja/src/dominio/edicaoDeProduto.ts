/**
 * Cadastrar e editar um produto.
 *
 * É o que ela pediu primeiro depois de ver a loja no ar: "como faço para
 * editar produtos, incluir um produto, modificar preços". Até aqui o
 * painel só sabia publicar e tirar do ar o que veio da Elojinha.
 *
 * Três coisas moldam estas regras, e nenhuma é técnica:
 *
 *   1. **Ela digita preço com vírgula.** "13,70" é como se escreve preço
 *      em português, e é o que o teclado do celular oferece. Recusar isso
 *      seria culpar a pessoa por escrever certo.
 *   2. **Rascunho pode estar incompleto.** Ela cadastra o produto no
 *      intervalo entre uma encomenda e outra, e o peso da caixa ela só
 *      sabe depois de embalar. Exigir tudo de uma vez faz ela desistir no
 *      meio e perder o que já digitou.
 *   3. **Publicado não pode.** Sem peso e medidas o frete sai errado, e a
 *      diferença sai do bolso dela em todo pedido. O banco recusa; aqui a
 *      gente avisa antes, na língua dela, em vez de deixar o erro do
 *      Postgres chegar à tela.
 */

import { desofuscar } from './importarElojinha'
import { lerNumero } from './planilha'

export interface Formulario {
  nome: string
  descricao: string
  preco: string
  preco_promocional: string
  linha: 'personalizada' | 'pedagogica'
  tema_id: string
  minimo: string
  prazo_producao: string
  peso_g: string
  alt_cm: string
  larg_cm: string
  comp_cm: string
  pasta_drive: string
  imagem: string
  imagem_mini: string
  /* As outras fotos: ângulo, embalagem, detalhe. Ela mandava três ou
     quatro por anúncio no Elo7. */
  galeria: string[]
  ativo: boolean
}

export const FORMULARIO_VAZIO: Formulario = {
  nome: '',
  descricao: '',
  preco: '',
  preco_promocional: '',
  linha: 'personalizada',
  tema_id: '',
  // O mínimo de dez é o dela, e é o caso da esmagadora maioria: ela vende
  // lembrancinha de festa, e ninguém faz festa com uma. Vem preenchido
  // para ela não digitar 343 vezes o mesmo número.
  minimo: '10',
  prazo_producao: '5',
  peso_g: '',
  alt_cm: '',
  larg_cm: '',
  comp_cm: '',
  pasta_drive: '',
  imagem: '',
  imagem_mini: '',
  galeria: [],
  ativo: false,
}

/**
 * O endereço do produto na loja, tirado do nome.
 *
 * Sem acento e sem ponto: "Lousa Mágica - P.e.p.p.a P.i.g" vira
 * "lousa-magica-peppa-pig", que é o que alguém digitaria no Google. Os
 * pontos entre as letras existiam para escapar do filtro de marca do
 * marketplace, e aqui só atrapalham quem procura.
 */
export const enderecoDoNome = (nome: string): string =>
  desofuscar(String(nome ?? ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * O que impede de salvar, dito para ela.
 *
 * Devolve lista vazia quando está bom. Cada recado diz o que fazer, e não
 * o que está errado: "preencha o peso" resolve, "peso inválido" não.
 */
export const problemas = (f: Formulario): string[] => {
  const achados: string[] = []

  if (!f.nome.trim()) achados.push('Dê um nome ao produto. É o que a cliente vê na loja.')
  if (!enderecoDoNome(f.nome)) achados.push('O nome precisa ter ao menos uma letra ou número.')

  const preco = lerNumero(f.preco)
  if (preco === null) achados.push('Falta o preço.')
  else if (preco <= 0) achados.push('O preço precisa ser maior que zero.')

  const promo = lerNumero(f.preco_promocional)
  if (promo !== null && preco !== null && promo >= preco) {
    // Promoção que não é promoção confunde e corrói confiança.
    achados.push('O preço promocional precisa ser menor que o preço normal.')
  }

  const minimo = lerNumero(f.minimo)
  if (minimo === null || minimo < 1) achados.push('O mínimo por pedido precisa ser 1 ou mais.')

  const prazo = lerNumero(f.prazo_producao)
  if (prazo === null || prazo < 0) achados.push('Diga em quantos dias você produz.')

  /* Daqui para baixo, só vale para publicar. Rascunho pode estar
     incompleto de propósito: ela cadastra agora e pesa a caixa depois. */
  if (!f.ativo) return achados

  if (f.linha === 'personalizada') {
    const faltando = ([
      ['peso_g', 'o peso'],
      ['alt_cm', 'a altura'],
      ['larg_cm', 'a largura'],
      ['comp_cm', 'o comprimento'],
    ] as const).filter(([campo]) => {
      const valor = lerNumero(f[campo])
      return valor === null || valor <= 0
    })

    if (faltando.length) {
      achados.push(
        `Para colocar no ar, falta ${faltando.map(([, nome]) => nome).join(', ')} da caixa fechada. Sem isso o frete sai errado, e a diferença sai do seu bolso.`,
      )
    }
  }

  if (f.linha === 'pedagogica' && !f.pasta_drive.trim()) {
    achados.push('Para colocar no ar, falta a pasta do Drive. Sem ela a loja não tem o que entregar depois do pagamento.')
  }

  return achados
}

export interface LinhaParaSalvar {
  slug: string
  nome: string
  descricao: string
  preco_reais: number
  preco_promocional_reais: number | null
  linha: string
  tema_id: string | null
  minimo: number
  prazo_producao: number
  peso_g: number | null
  alt_cm: number | null
  larg_cm: number | null
  comp_cm: number | null
  pasta_drive: string | null
  imagem: string | null
  imagem_mini: string | null
  galeria: string[]
  ativo: boolean
}

/** O formulário virado linha de banco. Só depois de `problemas` passar. */
export const paraOBanco = (f: Formulario, slugAtual?: string): LinhaParaSalvar => ({
  /* O endereço nasce do nome e não muda depois: mudar quebraria o link
     que a cliente salvou e o que o Google já indexou. */
  slug: slugAtual || enderecoDoNome(f.nome),
  nome: f.nome.trim(),
  descricao: f.descricao.trim(),
  preco_reais: lerNumero(f.preco) as number,
  preco_promocional_reais: lerNumero(f.preco_promocional),
  linha: f.linha,
  tema_id: f.tema_id || null,
  minimo: Math.round(lerNumero(f.minimo) as number),
  prazo_producao: Math.round(lerNumero(f.prazo_producao) as number),
  peso_g: lerNumero(f.peso_g) === null ? null : Math.round(lerNumero(f.peso_g) as number),
  alt_cm: lerNumero(f.alt_cm),
  larg_cm: lerNumero(f.larg_cm),
  comp_cm: lerNumero(f.comp_cm),
  pasta_drive: f.pasta_drive.trim() || null,
  imagem: f.imagem.trim() || null,
  imagem_mini: f.imagem_mini.trim() || null,
  galeria: f.galeria,
  ativo: f.ativo,
})

/** A linha do banco virada formulário, para ela editar o que já existe. */
export const doBanco = (linha: Record<string, unknown>): Formulario => {
  const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v))

  return {
    nome: texto(linha.nome),
    descricao: texto(linha.descricao),
    preco: texto(linha.preco_reais),
    preco_promocional: texto(linha.preco_promocional_reais),
    linha: linha.linha === 'pedagogica' ? 'pedagogica' : 'personalizada',
    tema_id: texto(linha.tema_id),
    minimo: texto(linha.minimo),
    prazo_producao: texto(linha.prazo_producao),
    peso_g: texto(linha.peso_g),
    alt_cm: texto(linha.alt_cm),
    larg_cm: texto(linha.larg_cm),
    comp_cm: texto(linha.comp_cm),
    pasta_drive: texto(linha.pasta_drive),
    imagem: texto(linha.imagem),
    imagem_mini: texto(linha.imagem_mini),
    galeria: Array.isArray(linha.galeria) ? (linha.galeria as string[]) : [],
    ativo: Boolean(linha.ativo),
  }
}
