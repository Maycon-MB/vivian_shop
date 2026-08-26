/**
 * Trazer o catálogo dela da Elojinha para a nossa loja.
 *
 * Quando o Elo7 fechou, em maio, ela migrou a papelaria personalizada para
 * a Elojinha e não contou a ninguém. Descobrimos em 23/08, quando ela
 * mandou o login. São 343 produtos com descrição, preço e foto, escritos
 * por ela ao longo de anos: é o acervo do negócio, e estava dado como
 * perdido.
 *
 * O que chega de lá não tem tudo que a nossa loja precisa. Falta a linha
 * de venda, falta o mínimo, e o tema está dentro do nome do produto. Cada
 * regra aqui preenche uma dessas lacunas, e cada uma é uma suposição que
 * pode estar errada — por isso todas têm teste com o caso real.
 *
 * O que não dá para supor fica vazio. Peso e medida chutados fazem o frete
 * sair errado, e a diferença sai do bolso dela em cada pedido.
 */

import { LINHA_PERSONALIZADA, type Linha } from './linhas'
import { lerNumero } from './planilha'

/**
 * Junta letras separadas por ponto: "P.e.p.p.a P.i.g" vira "Peppa Pig".
 *
 * Ela escreve assim para escapar do filtro de marca do marketplace. Na
 * loja dela isso não é necessário, e atrapalha quem procura: ninguém
 * digita ponto entre as letras.
 *
 * Só mexe no que está claramente ofuscado, três letras ou mais separadas
 * por ponto. "Turma da Mônica Jr." continua igual.
 */
export const desofuscar = (texto: string): string =>
  texto.replace(/\b(?:[\p{L}]\.){2,}[\p{L}]\b/gu, (trecho) => trecho.replace(/\./g, ''))

/**
 * O tipo e o tema, que na Elojinha vivem juntos no nome.
 *
 * "Lousa Mágica - a Poderosa Chefinha" é o produto "Lousa Mágica" no tema
 * "a Poderosa Chefinha". É assim que a cliente dela procura: pelo
 * personagem, não pelo tipo.
 *
 * Quando não há hífen, o tema fica vazio de propósito. Produto sem tema
 * cai em "sem tema definido", e ela ajeita depois; tema inventado por mim
 * espalha erro por 343 produtos.
 */
/**
 * O endereço do produto na loja, tirado do nome já desofuscado.
 *
 * Vive aqui, e não em `edicaoDeProduto`, para a importação não depender de
 * uma tela: quem chama isto é um script que roda fora do navegador.
 */
export const enderecoDoNome = (nome: string): string =>
  desofuscar(String(nome ?? ''))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const tipoETema = (nome: string): { tipo: string; tema: string } => {
  const partes = nome.split(' - ').map((p) => p.trim())

  return {
    tipo: partes[0].replace(/\s+/g, ' '),
    tema: partes.slice(1).join(' - '),
  }
}

/** Cinco dias úteis é a regra que ela repetia em todo anúncio. */
const PRAZO_PADRAO = 5

export const prazoEmDias = (texto: string): number => {
  // Já vem como número quando sai do painel dela ("5"); vem embrulhado em
  // frase quando sai da vitrine ("Sob encomenda: 5 dias").
  const soNumero = (texto ?? '').trim()
  if (/^\d+$/.test(soNumero)) return Number(soNumero)

  const dias = texto?.match(/(\d+)\s*dias?/i)

  return dias ? Number(dias[1]) : PRAZO_PADRAO
}

/** Uma linha do CSV que a extração produz. */
export interface LinhaDaElojinha {
  slug: string
  nome: string
  preco: string
  preco_promocional?: string
  descricao?: string
  prazo_producao?: string
  minimo?: string
  fotos?: string
  peso_g?: string
  alt_cm?: string
  larg_cm?: string
  comp_cm?: string
  estoque?: string
}

export interface ProdutoImportado {
  slug: string
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  linha: Linha
  tipo: string
  tema: string
  minimo: number
  prazoProducao: number
  fotos: string[]
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}

/** O mínimo é regra dela, e não da plataforma de onde os dados vêm. */
const MINIMO_DELA = 10

export const paraProduto = (bruto: LinhaDaElojinha): ProdutoImportado => {
  const preco = lerNumero(bruto.preco)
  if (preco === null) {
    throw new Error(`"${bruto.nome}" veio sem preço, ou o preço não foi entendido.`)
  }

  const promocional = lerNumero(bruto.preco_promocional ?? '')
  const { tipo, tema } = tipoETema(bruto.nome)

  const medida = (valor: string | undefined): number | undefined =>
    lerNumero(valor ?? '') ?? undefined

  /* O nome e o endereço também passam pelo desofuscar, e isso faltava.
     Vinte e oito produtos foram ao ar como "P.e.p.p.a P.i.g", com o
     endereço `/produto/album-de-figurinhas-p-e-p-p-a/`: ninguém digita
     assim, e o Google não ranqueia aquilo para "peppa pig", que é o tema
     campeão de vendas dela. Só o tipo e o tema eram desofuscados, e por
     isso o defeito passou. */
  const nome = desofuscar(bruto.nome)

  return {
    slug: enderecoDoNome(nome) || bruto.slug,
    nome,
    descricao: (bruto.descricao ?? '').trim(),
    preco,
    // Promoção que não é promoção confunde quem compra: se o "de" não for
    // maior que o "por", não há desconto nenhum para mostrar.
    ...(promocional !== null && promocional < preco
      ? { precoPromocional: promocional }
      : {}),
    // A Elojinha recebeu só a papelaria personalizada. O material
    // pedagógico dela nunca foi para lá.
    linha: LINHA_PERSONALIZADA,
    tipo: desofuscar(tipo),
    tema: desofuscar(tema),
    // O que ela cadastrou vale mais do que o meu padrão: 12 dos 343
    // produtos têm mínimo 1, e fixar dez apagaria essa decisão dela.
    minimo: lerNumero(bruto.minimo ?? '') ?? MINIMO_DELA,
    prazoProducao: prazoEmDias(bruto.prazo_producao ?? ''),
    fotos: (bruto.fotos ?? '')
      .split(';')
      .map((f) => f.trim())
      .filter(Boolean),
    ...(medida(bruto.peso_g) !== undefined ? { pesoG: medida(bruto.peso_g) } : {}),
    ...(medida(bruto.alt_cm) !== undefined ? { altCm: medida(bruto.alt_cm) } : {}),
    ...(medida(bruto.larg_cm) !== undefined ? { largCm: medida(bruto.larg_cm) } : {}),
    ...(medida(bruto.comp_cm) !== undefined ? { compCm: medida(bruto.comp_cm) } : {}),
  }
}
