'use client'

import {
  LIMITE_DE_ENVIO,
  TAMANHOS,
  caminhoNoBalde,
  conferirArquivo,
  medidaReduzida,
  type Tamanho,
} from '@/dominio/fotoDoProduto'
import { bancoDoNavegador } from '@/servicos/autenticacao'

/**
 * A foto do produto, do escolher ao guardar.
 *
 * As regras estão em `fotoDoProduto.ts`, sem tocar em navegador. Aqui está
 * o que precisa de canvas e de rede.
 *
 * **Quem reduz é o aparelho dela, antes de enviar.** A foto sai do celular
 * com 3 ou 4 MB; subir assim acabaria com o 1 GB gratuito em 250 fotos,
 * faria a vitrine passar de 1 MB no 4G, e demoraria tanto que ela acharia
 * que travou e apertaria de novo. Reduzida, vai com uns 60 KB.
 */

const BALDE = 'produtos'

/** A imagem carregada, para o canvas saber o tamanho de verdade dela. */
const carregar = (arquivo: File): Promise<HTMLImageElement> =>
  new Promise((resolver, recusar) => {
    const endereco = URL.createObjectURL(arquivo)
    const imagem = new Image()

    imagem.onload = () => {
      // Sem isto, o endereço temporário segura a foto inteira na memória
      // do aparelho dela até a aba fechar.
      URL.revokeObjectURL(endereco)
      resolver(imagem)
    }

    imagem.onerror = () => {
      URL.revokeObjectURL(endereco)
      recusar(new Error('não consegui abrir a foto'))
    }

    imagem.src = endereco
  })

/**
 * A foto reduzida para um dos dois tamanhos, em WebP.
 *
 * WebP porque a mesma foto fica em torno de um terço do JPG no mesmo
 * olho, e é o que faz a vitrine abrir rápido no 4G.
 */
const reduzir = async (arquivo: File, tamanho: Tamanho): Promise<Blob> => {
  const imagem = await carregar(arquivo)

  const medida = medidaReduzida(
    { largura: imagem.naturalWidth, altura: imagem.naturalHeight },
    TAMANHOS[tamanho],
  )

  const tela = document.createElement('canvas')
  tela.width = medida.largura
  tela.height = medida.altura

  const pincel = tela.getContext('2d')
  if (!pincel) throw new Error('o navegador não deixou reduzir a foto')

  pincel.drawImage(imagem, 0, 0, medida.largura, medida.altura)

  const pedaco = await new Promise<Blob | null>((resolver) =>
    // 0.82 é o ponto em que a diferença deixa de ser vista e o arquivo
    // ainda cai bastante. Acima disso o peso sobe sem ganho.
    tela.toBlob(resolver, 'image/webp', 0.82),
  )

  if (!pedaco) throw new Error('não consegui reduzir a foto')

  return pedaco
}

export interface FotoGuardada {
  cheia: string
  mini: string
}

/**
 * Reduz, envia os dois tamanhos e devolve os endereços públicos.
 *
 * `upsert` porque ela troca a foto do mesmo produto: sem isso, a segunda
 * tentativa seria recusada e ela ficaria com a foto errada no ar.
 */
export const enviarFoto = async (
  arquivo: File,
  slug: string,
  ordem = 0,
): Promise<FotoGuardada> => {
  const conferido = conferirArquivo({ tipo: arquivo.type, tamanho: arquivo.size })
  if (!conferido.ok) throw new Error(conferido.motivo)

  const banco = bancoDoNavegador()
  const guardados: Partial<FotoGuardada> = {}

  for (const tamanho of ['cheia', 'mini'] as const) {
    const reduzida = await reduzir(arquivo, tamanho)

    /* Rede contra o dia em que a redução falhar: sem ela, o arquivo cru
       de 4 MB tentaria subir e o balde recusaria com um erro do Supabase
       que ela não entende. */
    if (reduzida.size > LIMITE_DE_ENVIO) {
      throw new Error('A foto ficou grande demais mesmo depois de reduzir. Tente outra.')
    }

    const caminho = caminhoNoBalde(slug, ordem, tamanho)

    const { error } = await banco.storage
      .from(BALDE)
      .upload(caminho, reduzida, { contentType: 'image/webp', upsert: true })

    if (error) throw new Error(error.message)

    const { data } = banco.storage.from(BALDE).getPublicUrl(caminho)
    guardados[tamanho] = data.publicUrl
  }

  return guardados as FotoGuardada
}
