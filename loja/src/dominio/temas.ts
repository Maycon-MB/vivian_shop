/**
 * Reconhecer temas escritos à mão, sem prender a Vivian a uma lista.
 *
 * O problema é concreto: ela tem 86 temas e vai cadastrar 343 produtos
 * numa planilha, no celular, ao longo de semanas. Se cada produto exigir
 * escolher o tema numa lista suspensa de 86 itens, ela desiste — e se o
 * tema ainda não existir, ela trava no meio do cadastro.
 *
 * Deixar texto livre sem tratamento é pior: "mickey", "Mickey", "MICKEY"
 * e "Mickey " viram quatro temas na loja, cada um com um pedaço dos
 * produtos, e a cliente que procurar Mickey acha um quarto do catálogo.
 *
 * A saída é reconhecer em vez de exigir. Três camadas, nesta ordem:
 *
 *   1. o que é obviamente o mesmo, junta calado — só variação de
 *      maiúscula, acento e espaço
 *   2. o que é quase igual, pergunta antes — erro de digitação de uma
 *      letra é provável, mas "Bela" e "Belo" podem ser dois temas de
 *      verdade
 *   3. o que é diferente, cria — sem pedir nada
 *
 * A regra que atravessa tudo: **nunca juntar dois temas por conta
 * própria quando há dúvida.** Juntar errado apaga um tema inteiro da
 * loja e ela pode nem perceber; perguntar custa uma linha de aviso.
 */

/**
 * A forma canônica de um nome, para comparação.
 *
 * Tira acento, caixa, espaço sobrando e pontuação. "Primeira Eucaristia",
 * "primeira eucaristia" e "PRIMEIRA  EUCARISTIA!" viram a mesma chave.
 */
export const chaveDoTema = (nome: string): string =>
  nome
    .normalize('NFD')
    // Remove os acentos, mantendo a letra: "é" vira "e".
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** O nome como vai aparecer na loja: espaços normalizados, resto intacto. */
export const arrumarNome = (nome: string): string => nome.trim().replace(/\s+/g, ' ')

/**
 * Distância de edição entre duas palavras: quantas letras é preciso
 * trocar, inserir ou apagar para chegar de uma à outra.
 *
 * "mickey" e "mickei" dão 1. "mickey" e "frozen" dão 6.
 *
 * A implementação guarda só duas linhas da tabela em vez da matriz
 * inteira — com 86 temas isso não faria diferença de tempo, mas também
 * não custa nada e evita alocar 86 × 20 posições a cada comparação.
 */
export const distancia = (a: string, b: string): number => {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i)
  let atual = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i++) {
    atual[0] = i
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      atual[j] = Math.min(
        atual[j - 1] + 1, // inserir
        anterior[j] + 1, // apagar
        anterior[j - 1] + custo, // trocar
      )
    }
    ;[anterior, atual] = [atual, anterior]
  }

  return anterior[b.length]
}

/**
 * Quanta diferença ainda conta como erro de digitação.
 *
 * Escala com o tamanho, porque uma letra errada em "Bela" é metade da
 * palavra, e em "Primeira Eucaristia" é quase nada. Sem isso, ou o
 * sistema aceitaria "Bela" como "Belo", ou ignoraria "Primeira
 * Eucaristia" contra "Primeira Eucarista".
 */
const tolerancia = (tamanho: number): number => {
  if (tamanho <= 4) return 0 // nome curto: só igual serve
  if (tamanho <= 8) return 1
  return 2
}

/**
 * Dois nomes que só diferem nos números são temas diferentes de propósito.
 *
 * "Turma 1" e "Turma 2", "Kit 10" e "Kit 15" diferem em um caractere e
 * passariam como erro de digitação — mas ninguém digita 2 querendo 1. Sem
 * esta regra, uma planilha com temas numerados vira uma parede de avisos,
 * e ela para de ler todos eles, inclusive os que importam.
 */
const soDiferemNosNumeros = (a: string, b: string): boolean => {
  const semNumero = (t: string) => t.replace(/\d+/g, '').replace(/\s+/g, ' ').trim()
  const numerosDe = (t: string) => (t.match(/\d+/g) ?? []).join(',')

  return semNumero(a) === semNumero(b) && numerosDe(a) !== numerosDe(b)
}

export type Resultado =
  | { tipo: 'existente'; tema: string }
  | { tipo: 'parecido'; escrito: string; sugestao: string; aviso: string }
  | { tipo: 'novo'; tema: string }
  | { tipo: 'vazio' }

/**
 * Decide o que fazer com um tema que a Vivian escreveu.
 *
 * `conhecidos` são os temas que já existem na loja.
 */
export const reconhecerTema = (escrito: string, conhecidos: string[]): Resultado => {
  const nome = arrumarNome(escrito ?? '')
  if (!nome) return { tipo: 'vazio' }

  const chave = chaveDoTema(nome)
  if (!chave) return { tipo: 'vazio' }

  // 1. O mesmo tema, escrito de outro jeito. Junta sem perguntar.
  const igual = conhecidos.find((c) => chaveDoTema(c) === chave)
  if (igual) return { tipo: 'existente', tema: igual }

  // 2. Quase igual. Pergunta, nunca decide sozinho.
  let maisProximo: { tema: string; distancia: number } | null = null

  for (const conhecido of conhecidos) {
    const d = distancia(chave, chaveDoTema(conhecido))
    if (!maisProximo || d < maisProximo.distancia) {
      maisProximo = { tema: conhecido, distancia: d }
    }
  }

  const proximoEhSoNumero =
    maisProximo && soDiferemNosNumeros(chave, chaveDoTema(maisProximo.tema))

  if (
    maisProximo &&
    !proximoEhSoNumero &&
    maisProximo.distancia <= tolerancia(chave.length)
  ) {
    return {
      tipo: 'parecido',
      escrito: nome,
      sugestao: maisProximo.tema,
      aviso: `Você escreveu "${nome}", e já existe o tema "${maisProximo.tema}". É o mesmo? Se for, corrija para o nome que já existe. Se forem temas diferentes mesmo, pode deixar como está.`,
    }
  }

  // 3. Tema novo de verdade.
  return { tipo: 'novo', tema: nome }
}

export interface Conferencia {
  temasFinais: string[]
  novos: string[]
  avisos: string[]
}

/**
 * Passa a planilha inteira e devolve o que publicar e o que avisar.
 *
 * Os temas novos entram sozinhos: ela não precisa cadastrar antes de
 * usar. Os parecidos viram aviso, e o produto continua com o que ela
 * escreveu — porque impedir a publicação por uma dúvida de grafia seria
 * segurar a loja inteira por causa de uma letra.
 */
export const conferirTemas = (
  escritos: string[],
  conhecidos: string[] = [],
): Conferencia => {
  const temasFinais = [...conhecidos]
  const novos: string[] = []
  const avisos: string[] = []
  const jaAvisado = new Set<string>()

  for (const escrito of escritos) {
    const resultado = reconhecerTema(escrito, temasFinais)

    if (resultado.tipo === 'novo') {
      temasFinais.push(resultado.tema)
      novos.push(resultado.tema)
      continue
    }

    if (resultado.tipo === 'parecido') {
      // O tema entra mesmo assim: o aviso é para ela decidir, não para
      // barrar. Mas avisa uma vez só, mesmo com 40 produtos no tema.
      if (!jaAvisado.has(chaveDoTema(resultado.escrito))) {
        avisos.push(resultado.aviso)
        jaAvisado.add(chaveDoTema(resultado.escrito))
      }
      temasFinais.push(resultado.escrito)
      novos.push(resultado.escrito)
    }
  }

  return { temasFinais, novos, avisos }
}
