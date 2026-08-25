/**
 * As avaliações reais que a loja mostra.
 *
 * São 13, escritas por clientes dela entre março de 2025 e fevereiro de
 * 2026. Vieram do Elo7 e migraram para a Elojinha junto com o catálogo.
 *
 * Duas regras mandam aqui, e as duas são sobre gente:
 *
 *   - **só o primeiro nome.** Quem escreveu avaliou uma loja em outra
 *     plataforma, e não autorizou aparecer nesta. Primeiro nome identifica
 *     o depoimento sem expor a pessoa.
 *   - **nada é inventado, nem corrigido.** "Adorai" tem erro de digitação
 *     e continua assim: corrigir o depoimento de alguém é reescrever o que
 *     a pessoa disse.
 */

import { desofuscar } from './importarElojinha'

export interface AvaliacaoCrua {
  data: string
  produto: string
  /** "Positiva" ou "Negativa": o marketplace nunca guardou estrelas. */
  nota: string
  primeiro_nome: string
  texto: string
  resposta_da_loja?: string
}

export interface Avaliacao {
  nome: string
  produto: string
  texto: string
  /**
   * O marketplace guardava "Positiva" ou "Negativa", e não estrelas. Por
   * isso a loja não mostra nota: cinco estrelas onde o dado é só
   * "positiva" seria número inventado numa página que existe para provar
   * que ela cumpre o que promete.
   */
  positiva: boolean
  quando: Date
  resposta?: string
}

/**
 * O nome do produto como uma pessoa o chamaria.
 *
 * No marketplace ele vinha com tudo que ajudava a aparecer em busca:
 * "Revista Passatempo - P.e.p.p.a P.i.g - Lembrancinha aniversário."
 *
 * Ficam o tipo e o tema, que é como a cliente dela pensa o produto: ela
 * não quer uma revista, quer a revista da Peppa. Sai a frase de venda do
 * fim, que existia para aparecer em busca e não diz nada a quem lê o
 * depoimento.
 */
const nomeLimpo = (produto: string): string =>
  desofuscar(produto)
    .split(' - ')
    .slice(0, 2)
    .join(' - ')
    .replace(/\.$/, '')
    .trim()

/**
 * O nome como se escreve um nome.
 *
 * Duas clientes escreveram o próprio nome em maiúscula no formulário do
 * marketplace. Publicar "MICHELLE" numa página de depoimento lê como
 * grito, e não é o que ela quis dizer.
 */
const nomeDeGente = (bruto: string): string => {
  const primeiro = String(bruto ?? '').trim().split(/\s+/)[0] ?? ''
  if (!primeiro) return ''

  // Só mexe em quem está inteiro em maiúscula: "Lílian" fica como está.
  if (primeiro !== primeiro.toUpperCase()) return primeiro

  return primeiro[0] + primeiro.slice(1).toLowerCase()
}

/**
 * O texto como a pessoa escreveu, sem o que a extração estragou.
 *
 * O emoji virou "??" ao sair do marketplace. Deixar assim publica um
 * defeito nosso como se fosse coisa dela; tirar não muda o que ela disse,
 * porque o que estava ali não era pontuação.
 *
 * **Duas ou mais interrogações seguidas**, em qualquer lugar da frase.
 * Uma sozinha fica: "dá para encomendar de novo?" é pergunta de verdade.
 * Duas no meio de "chegou rapidinho ?? Muito obrigada" não são.
 */
const semEmojiPerdido = (bruto: string): string =>
  String(bruto ?? '')
    .replace(/\s*\?{2,}/g, '')
    // A remoção deixa dois espaços onde o emoji separava duas frases.
    .replace(/\s{2,}/g, ' ')
    .trim()

export const paraMostrar = (crua: AvaliacaoCrua): Avaliacao => {
  const [dia, mes, ano] = crua.data.split('/').map(Number)

  return {
    // Corta o sobrenome mesmo que ele venha: a loja nunca publica.
    nome: nomeDeGente(crua.primeiro_nome),
    produto: nomeLimpo(crua.produto ?? ''),
    texto: semEmojiPerdido(crua.texto),
    /* Só "Positiva" conta como positiva. Qualquer outra coisa, inclusive
       campo vazio ou palavra que eu não previ, fica de fora do que a loja
       publica — errar para o lado de não mostrar. */
    positiva: String(crua.nota ?? '').trim().toLowerCase().startsWith('positiv'),
    quando: new Date(ano, (mes ?? 1) - 1, dia ?? 1),
    /* A resposta dela também perdeu emoji na extração, e ali o "??"
       caiu no meio da frase. */
    ...(semEmojiPerdido(crua.resposta_da_loja ?? '')
      ? { resposta: semEmojiPerdido(crua.resposta_da_loja ?? '') }
      : {}),
  }
}

/** A mais recente primeiro: quem chega quer ver que a loja vende hoje. */
export const ordenarPorData = (lista: Avaliacao[]): Avaliacao[] =>
  [...lista].sort((a, b) => b.quando.getTime() - a.quando.getTime())

/**
 * O que a loja publica.
 *
 * Só as positivas, e não porque as outras sejam escondidas: as treze que
 * existem são todas positivas, e o filtro está aqui para o dia em que
 * aparecer uma que não seja. Uma avaliação ruim numa vitrine de
 * depoimentos é decisão dela, e não minha para tomar em silêncio.
 */
export const paraAVitrine = (cruas: AvaliacaoCrua[]): Avaliacao[] =>
  ordenarPorData(cruas.map(paraMostrar).filter((a) => a.positiva && a.texto.trim()))
