/**
 * A descrição do produto, em linhas em vez de um bloco só.
 *
 * A Vivian pediu isto em 30/08, com um print: "em todos os produtos as
 * informações estão emboladas, tudo junto. Teria como ficar cada
 * informação em uma linha separada". Ela tem razão, e o motivo é venda:
 * tamanho, material e prazo são o que a cliente veio conferir, e no meio
 * de um parágrafo de doze linhas ninguém acha.
 *
 * ── O que estava acontecendo ───────────────────────────────────────────
 *
 * Duas coisas diferentes, e só uma era do texto.
 *
 * **262 das 342 descrições já vinham com as quebras certas.** A página
 * desenhava `<p>{descricao}</p>`, e HTML colapsa quebra de linha em
 * espaço: o texto estava certo, quem jogava fora era a tela.
 *
 * **As outras 80 vieram mesmo corridas**, e a estrutura delas está nos
 * rótulos em caixa alta que o editor do marketplace usava, e no `•` que
 * eles punham no meio da frase como se fosse item de lista.
 *
 * ── O que esta função faz, e o que não faz ─────────────────────────────
 *
 * Separa e desce a caixa alta. **Não resume, não corta e não reescreve.**
 * O texto do produto é dela, custou tempo, e é o que vende: qualquer
 * palavra que eu tire aqui some da loja sem ninguém perceber.
 */

export interface LinhaDaDescricao {
  /** A linha inteira, do jeito que vai para a tela. */
  texto: string
  /** Quando a linha é "Rótulo: valor", para a tela poder destacar. */
  rotulo?: string
  valor?: string
}

/* Rótulo em caixa alta seguido de dois pontos: `TAMANHO DO ÁLBUM:`,
   `PRAZO DE PRODUÇÃO:`, `ATENÇÃO AOS PRAZOS:`. São 262 descrições com os
   dois últimos, e é o que dá para usar como divisor sem adivinhar. */
const ROTULO = /([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ ]{2,40}):/g

/* Uma sequência inteira de palavras em caixa alta, e não palavra por
   palavra: em `PRAZO DE PRODUÇÃO`, tratar cada uma sozinha deixaria o
   `DE` gritando no meio, porque ele tem duas letras. */
const GRITO = /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)*/g

/**
 * Baixa a caixa do que estava gritando, e só disso.
 *
 * Caixa alta é como o marketplace pedia que se escrevesse. Numa página de
 * produto lê como grito, e ela mostrou no print o formato que quer, em
 * caixa normal.
 *
 * O corte é por tamanho da sequência: quatro letras ou mais desce, menos
 * que isso fica. É grosseiro de propósito, e erra para o lado de não
 * mexer. `PDF`, `MDF`, `OBS` e `A4` ficam como estão, e são justamente a
 * informação técnica que a cliente veio conferir.
 */
const semGrito = (texto: string): string =>
  texto.replace(GRITO, (trecho) => {
    const letras = trecho.replace(/\s/g, '')
    if (letras.length < 4) return trecho
    return trecho.toLowerCase()
  })

const comMaiuscula = (texto: string): string =>
  texto.charAt(0).toUpperCase() + texto.slice(1)

/** Quebra a linha em rótulo e valor, quando ela tiver essa forma. */
const partir = (linha: string): LinhaDaDescricao => {
  const corte = linha.indexOf(':')

  /* Só conta como rótulo o que vem no começo da linha e é curto. Um `:`
     no meio de uma frase é pontuação, e não etiqueta. */
  if (corte > 0 && corte <= 40) {
    const rotulo = linha.slice(0, corte).trim()
    const valor = linha.slice(corte + 1).trim()
    if (rotulo && valor) return { texto: linha, rotulo, valor }
  }

  return { texto: linha }
}

/* O que a reconstrução do catálogo gravou no lugar da descrição em 80
   produtos. Oito deles não têm página salva para recuperar e continuam
   assim: melhor a cliente não ver descrição nenhuma do que ver `$2f`
   impresso na página do produto. */
const LIXO_DA_IMPORTACAO = /^\$2f$/i

export const descricaoEmLinhas = (bruta: string): LinhaDaDescricao[] => {
  const texto = String(bruta ?? '')
  if (!texto.trim()) return []
  if (LIXO_DA_IMPORTACAO.test(texto.trim())) return []

  const QUEBRA = String.fromCharCode(10)

  const separado = texto
    /* Antes de cada rótulo entra uma quebra. É o que separa as 80 que
       vieram num bloco só, e não faz mal nas 262 que já vinham certas:
       linha vazia é descartada no fim. */
    .replace(ROTULO, (_, rotulo) => `${QUEBRA}${rotulo}:`)
    // O marcador que eles punham no meio da frase.
    .replace(/\s*•\s*/g, QUEBRA)

  return separado
    .split(QUEBRA)
    .map((linha) => comMaiuscula(semGrito(linha.trim().replace(/\s{2,}/g, ' '))))
    .filter((linha) => linha.length > 0)
    .map(partir)
}
