/**
 * Regras da foto de produto: o que aceitar, quanto reduzir, onde guardar.
 *
 * A foto sai do celular dela com 3 ou 4 MB. Se subir assim, três coisas
 * quebram de uma vez: o 1 GB gratuito acaba em 250 fotos, a vitrine passa
 * de 1 MB e a cliente dela desiste no 4G, e o envio demora tanto que ela
 * acha que travou e aperta de novo.
 *
 * Quem reduz é o navegador dela, antes de enviar. Sai de graça, porque o
 * trabalho é feito pelo aparelho de quem está enviando, e o que trafega
 * passa a ser 60 KB em vez de 4 MB.
 *
 * Aqui ficam só as regras, sem tocar em canvas nem em rede: é o que
 * permite testar as decisões sem navegador.
 */

/** Os dois tamanhos que a loja usa, em pixels no lado maior. */
export const TAMANHOS = {
  /** Página do produto. Cabe em 640 no computador; o dobro cobre tela retina. */
  cheia: 900,
  /** Vitrine. O cartão nunca passa de 220px de largura. */
  mini: 440,
} as const

export type Tamanho = keyof typeof TAMANHOS

/**
 * O maior arquivo que sai do navegador dela, em bytes.
 *
 * É o mesmo limite do balde no Supabase, de propósito. Nunca deve ser
 * atingido: depois de reduzida, a foto fica em torno de 60 KB. Ele existe
 * como rede, para o dia em que a redução falhar e o arquivo cru tentar
 * subir assim mesmo.
 */
export const LIMITE_DE_ENVIO = 2 * 1024 * 1024

/**
 * O maior arquivo que ela pode escolher, antes de reduzir.
 *
 * Generoso de propósito: a foto do celular dela sai com 3 ou 4 MB, e
 * recusá-la seria recusar o caso normal. O limite existe para pegar o
 * engano de escolher um vídeo, que é o que costuma ter 200 MB.
 */
export const LIMITE_DA_ESCOLHA = 25 * 1024 * 1024

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']

export type Conferencia = { ok: true } | { ok: false; motivo: string }

export const conferirArquivo = ({
  tipo,
  tamanho,
}: {
  tipo: string
  tamanho: number
}): Conferencia => {
  if (!TIPOS_ACEITOS.includes(tipo)) {
    return {
      ok: false,
      motivo: 'Isso não é uma foto. Mande uma imagem do produto, em JPG ou PNG.',
    }
  }

  if (tamanho <= 0) {
    return {
      ok: false,
      motivo: 'O arquivo chegou vazio. Tente escolher a foto de novo.',
    }
  }

  if (tamanho > LIMITE_DA_ESCOLHA) {
    return {
      ok: false,
      motivo: `Este arquivo tem mais de ${Math.round(LIMITE_DA_ESCOLHA / 1024 / 1024)} MB. Confira se você escolheu uma foto, e não um vídeo.`,
    }
  }

  return { ok: true }
}

export interface Medidas {
  largura: number
  altura: number
}

/**
 * O tamanho final, encolhendo pelo lado maior e mantendo a proporção.
 *
 * Nunca aumenta: esticar uma foto de 300px para 900 deixa borrada e ocupa
 * mais espaço, o que é ficar pior e mais caro ao mesmo tempo.
 */
export const medidaReduzida = ({ largura, altura }: Medidas, maximo: number): Medidas => {
  const maior = Math.max(largura, altura)
  if (maior <= maximo) return { largura, altura }

  const proporcao = maximo / maior

  return {
    largura: Math.round(largura * proporcao),
    altura: Math.round(altura * proporcao),
  }
}

/**
 * O endereço do arquivo dentro do balde.
 *
 * Organizado por produto, e não tudo numa pasta só, para dar para olhar o
 * armazenamento e entender o que é de quê. O nome vem de texto que ela
 * escreve, então passa por limpeza: sem isso, um nome com barra ou com
 * ".." viraria caminho para outra pasta.
 */
export const caminhoNoBalde = (slug: string, ordem: number, tamanho: Tamanho): string => {
  const pasta = slug
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${pasta}/${ordem}-${tamanho}.webp`
}
