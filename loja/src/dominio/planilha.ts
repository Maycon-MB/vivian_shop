/**
 * Ler o catálogo que a Vivian mantém numa planilha.
 *
 * São 343 produtos e 86 temas, preenchidos ao longo de semanas, no
 * celular, no meio de outras coisas. Isso define o que este arquivo tem
 * que aguentar: preço com "R$" na frente, vírgula no lugar do ponto,
 * coluna fora de ordem porque ela colou de outro lugar, linha em branco
 * separando blocos, e o mesmo tema escrito de três jeitos.
 *
 * Nada disso é erro dela. Erro seria a loja publicar preço errado por
 * causa de uma vírgula, ou travar tudo porque sobrou um espaço.
 *
 * A regra que separa as duas coisas: **o que dá para entender sem dúvida,
 * entende; o que geraria preço ou produto errado, recusa e explica em
 * português, dizendo a linha.**
 *
 * Não há banco no meio. O catálogo é informação pública e vira página
 * pronta, do mesmo jeito que o resto da loja. Quando o banco existir, esta
 * leitura vira a importação inicial e nada do que ela escreveu se perde.
 */

import { LINHA_PEDAGOGICA, LINHA_PERSONALIZADA, type Linha } from './linhas'
import { conferirTemas, reconhecerTema } from './temas'

/**
 * Número escrito por gente, não por máquina.
 *
 * `null` quando não dá para entender, e nunca zero: preço vazio é erro,
 * preço zero seria produto de graça. Confundir os dois publica a loja
 * inteira valendo R$ 0,00.
 */
export const lerNumero = (bruto: string | undefined | null): number | null => {
  if (bruto === undefined || bruto === null) return null

  // O espaço fino que o Excel escreve entre milhar não é o espaço comum.
  const limpo = bruto.replace(/\s| | /g, '').replace(/R\$/gi, '')
  if (!limpo) return null

  // Com vírgula, ela é o decimal e o ponto é separador de milhar, que é
  // como se escreve em português. Sem vírgula, o ponto é o decimal.
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo

  if (!/^\d+(\.\d+)?$/.test(normalizado)) return null

  const valor = Number(normalizado)
  return Number.isFinite(valor) ? valor : null
}

/**
 * O texto separado por vírgula que a planilha exporta.
 *
 * Escrito à mão, e não com biblioteca, porque o que este arquivo precisa
 * entender é pequeno e conhecido: aspas, aspas dobradas dentro de aspas, e
 * quebra de linha dentro da célula, que é como os "detalhes" chegam.
 * Trazer um pacote inteiro para isso seria mais dependência do que
 * benefício, e este trecho tem teste.
 */
export const lerCsv = (texto: string): Record<string, string>[] => {
  const celulas: string[][] = []
  let linha: string[] = []
  let campo = ''
  let dentroDeAspas = false

  const fecharCampo = () => {
    linha.push(campo)
    campo = ''
  }

  const fecharLinha = () => {
    fecharCampo()
    celulas.push(linha)
    linha = []
  }

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]

    if (dentroDeAspas) {
      if (c === '"') {
        // Aspas dobradas são uma aspas de verdade dentro do texto.
        if (texto[i + 1] === '"') {
          campo += '"'
          i++
        } else {
          dentroDeAspas = false
        }
      } else {
        campo += c
      }
      continue
    }

    if (c === '"') {
      dentroDeAspas = true
    } else if (c === ',') {
      fecharCampo()
    } else if (c === '\n') {
      fecharLinha()
    } else if (c !== '\r') {
      // O retorno de carro vem do Excel e não é conteúdo.
      campo += c
    }
  }

  if (campo || linha.length) fecharLinha()

  const [cabecalho, ...corpo] = celulas
  if (!cabecalho) return []

  const nomes = cabecalho.map((c) => c.trim())

  return corpo
    // Linha totalmente vazia é o espaço que ela deixa entre blocos, e não
    // um produto.
    .filter((l) => l.some((c) => c.trim()))
    .map((l) => Object.fromEntries(nomes.map((nome, i) => [nome, (l[i] ?? '').trim()])))
}

/** A forma canônica de um nome de coluna: sem acento, sem caixa, sem sobra. */
const chaveDaColuna = (nome: string): string =>
  nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Os nomes que cada coluna pode ter na planilha.
 *
 * Mais de um por campo porque a planilha vai ser editada por ela e por
 * mim, e porque colar de outro lugar traz cabeçalho de outro jeito.
 */
const COLUNAS: Record<string, string[]> = {
  nome: ['nome', 'produto', 'nome do produto'],
  linha: ['linha', 'categoria'],
  tema: ['tema', 'colecao'],
  tipo: ['tipo'],
  preco: ['preco', 'preco cheio', 'valor'],
  promocional: ['preco promocional', 'promocional', 'preco com desconto'],
  descricao: ['descricao', 'texto'],
  detalhes: ['detalhes', 'medidas e material'],
  peso: ['peso do pacote de 10', 'peso', 'peso g'],
  caixa: ['medidas da caixa', 'caixa', 'medidas'],
  drive: ['pasta no drive', 'drive', 'pasta'],
  imagem: ['foto', 'imagem'],
}

const acharColuna = (presentes: string[], candidatos: string[]): string | null =>
  candidatos.find((c) => presentes.includes(c)) ?? null

/** O endereço do produto, que vai na barra e no link do WhatsApp. */
export const enderecoDe = (nome: string): string =>
  nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * A linha de venda escrita do jeito curto.
 *
 * Na planilha a lista suspensa oferece "Personalizada" e "Pedagógica",
 * que é como ela fala. O nome comprido é coisa do código.
 */
const lerLinha = (bruto: string): Linha | null => {
  const chave = chaveDaColuna(bruto)
  if (!chave) return null
  if (chave.includes('personalizad')) return LINHA_PERSONALIZADA
  if (chave.includes('pedagogic') || chave.includes('digital')) return LINHA_PEDAGOGICA
  return null
}

/** "30 x 25 x 12" vira altura, largura e comprimento. */
const lerCaixa = (bruto: string): [number, number, number] | null => {
  const numeros = bruto
    .split(/[x×*]/i)
    .map((p) => lerNumero(p))
    .filter((n): n is number => n !== null)

  return numeros.length === 3 ? [numeros[0], numeros[1], numeros[2]] : null
}

export interface ProdutoDaPlanilha {
  slug: string
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  linha: Linha
  tema: string
  tipo?: string
  detalhes: string[]
  imagem?: string
  pastaDrive?: string
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}

export interface ErroDaPlanilha {
  /** O número que ela vê na lateral da planilha, contando o cabeçalho. */
  linha: number
  mensagem: string
}

export interface LeituraDaPlanilha {
  produtos: ProdutoDaPlanilha[]
  temas: string[]
  erros: ErroDaPlanilha[]
  avisos: string[]
}

/**
 * Lê a planilha inteira e devolve o que publicar e o que corrigir.
 *
 * Enquanto houver um erro sequer, **nada é publicado**: é melhor a loja não
 * atualizar do que atualizar errado. Por isso `produtos` só deve ser usado
 * quando `erros` estiver vazio.
 *
 * Linha sem nome ou sem preço é descartada, porque não dá para construir
 * produto nenhum a partir dela. As outras continuam na lista mesmo com
 * erro, para o aviso poder falar de um produto com nome.
 */
export const lerPlanilha = (csv: string): LeituraDaPlanilha => {
  const linhas = lerCsv(csv)
  const erros: ErroDaPlanilha[] = []

  if (!linhas.length) {
    return { produtos: [], temas: [], erros, avisos: [] }
  }

  const presentes = Object.keys(linhas[0]).map(chaveDaColuna)
  const coluna = Object.fromEntries(
    Object.entries(COLUNAS).map(([campo, nomes]) => [campo, acharColuna(presentes, nomes)]),
  ) as Record<keyof typeof COLUNAS, string | null>

  if (!coluna.nome || !coluna.preco) {
    erros.push({
      linha: 1,
      mensagem:
        'Não encontrei as colunas obrigatórias. A primeira linha precisa ter, no mínimo, "Nome" e "Preço".',
    })
    return { produtos: [], temas: [], erros, avisos: [] }
  }

  /* O valor de uma coluna, achada pelo nome canônico e não pela posição:
     é o que faz a planilha aguentar coluna fora de ordem. */
  const valor = (registro: Record<string, string>, campo: keyof typeof COLUNAS): string => {
    const alvo = coluna[campo]
    if (!alvo) return ''
    const chave = Object.keys(registro).find((k) => chaveDaColuna(k) === alvo)
    return chave ? registro[chave] : ''
  }

  const produtos: ProdutoDaPlanilha[] = []
  const enderecos = new Map<string, number>()
  const temasEscritos: string[] = []

  linhas.forEach((registro, i) => {
    // A primeira linha da planilha é o cabeçalho, então o produto da
    // posição 0 está na linha 2. Ela vai procurar esse número na tela.
    const numeroDaLinha = i + 2
    const reclamar = (mensagem: string) => erros.push({ linha: numeroDaLinha, mensagem })

    const nome = valor(registro, 'nome')
    if (!nome) {
      reclamar('Esta linha está sem nome de produto.')
      return
    }

    const preco = lerNumero(valor(registro, 'preco'))
    if (preco === null) {
      reclamar(`"${nome}" está sem preço, ou o preço não foi entendido.`)
      return
    }

    const endereco = enderecoDe(nome)
    const jaVisto = enderecos.get(endereco)
    if (jaVisto) {
      reclamar(
        `"${nome}" aparece duas vezes, aqui e na linha ${jaVisto}. Dois produtos não podem ter o mesmo nome.`,
      )
      return
    }
    enderecos.set(endereco, numeroDaLinha)

    const linhaDeVenda = lerLinha(valor(registro, 'linha'))
    if (!linhaDeVenda) {
      reclamar(
        `"${nome}" está sem linha. Escreva "Personalizada" ou "Pedagógica".`,
      )
    }

    const promocional = lerNumero(valor(registro, 'promocional'))
    if (promocional !== null && promocional >= preco) {
      reclamar(
        `O preço promocional de "${nome}" não é menor que o preço cheio. Promoção que não é promoção confunde quem compra.`,
      )
    }

    const ehPersonalizado = linhaDeVenda === LINHA_PERSONALIZADA
    const pesoG = lerNumero(valor(registro, 'peso')) ?? undefined
    const caixa = lerCaixa(valor(registro, 'caixa'))

    // Só cobra o que a planilha tem coluna para responder: planilha
    // reduzida, colada de outro lugar, não deve virar parede de erro.
    if (ehPersonalizado && coluna.peso && pesoG === undefined) {
      reclamar(
        `Falta o peso do pacote de 10 de "${nome}". Sem ele o frete sai errado, e a diferença sai do seu bolso em cada pedido.`,
      )
    }

    if (ehPersonalizado && coluna.caixa && !caixa) {
      reclamar(
        `Faltam as medidas da caixa de "${nome}". Escreva assim: 30 x 25 x 12.`,
      )
    }

    const pastaDrive = valor(registro, 'drive')
    if (linhaDeVenda === LINHA_PEDAGOGICA && coluna.drive && !pastaDrive) {
      reclamar(
        `"${nome}" é material digital e está sem a pasta no Drive. Sem ela, a loja não tem o que entregar depois do pagamento.`,
      )
    }

    const tema = valor(registro, 'tema')
    if (tema) temasEscritos.push(tema)

    produtos.push({
      slug: endereco,
      nome,
      descricao: valor(registro, 'descricao'),
      preco,
      ...(promocional !== null && promocional < preco
        ? { precoPromocional: promocional }
        : {}),
      linha: linhaDeVenda ?? LINHA_PERSONALIZADA,
      tema,
      ...(valor(registro, 'tipo') ? { tipo: valor(registro, 'tipo') } : {}),
      detalhes: valor(registro, 'detalhes')
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean),
      ...(valor(registro, 'imagem') ? { imagem: valor(registro, 'imagem') } : {}),
      ...(pastaDrive ? { pastaDrive } : {}),
      ...(pesoG !== undefined ? { pesoG } : {}),
      ...(caixa ? { altCm: caixa[0], largCm: caixa[1], compCm: caixa[2] } : {}),
    })
  })

  // Os temas passam pelas mesmas regras de reconhecimento de sempre: junta
  // o que é obviamente igual, pergunta no que é parecido, cria o que é
  // novo. Um tema parecido vira aviso, e não erro: segurar a loja inteira
  // por uma letra seria pior do que publicar com dois temas parecidos.
  const { temasFinais, avisos } = conferirTemas(temasEscritos, [])

  // O produto guarda o nome do tema já unificado, senão "mickey" e
  // "Mickey" viravam duas coleções na loja com metade dos produtos cada.
  for (const produto of produtos) {
    if (!produto.tema) continue
    const reconhecido = reconhecerTema(produto.tema, temasFinais)
    if (reconhecido.tipo === 'existente') produto.tema = reconhecido.tema
  }

  return { produtos, temas: temasFinais, erros, avisos }
}
