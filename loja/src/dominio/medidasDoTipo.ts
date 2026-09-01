/**
 * O peso e a caixa que os produtos parecidos já usam.
 *
 * Existe por uma pergunta que ela não sabe responder. O formulário pede
 * peso, altura, largura e comprimento **da caixa fechada com dez peças**,
 * e o banco recusa publicar produto personalizado sem isso, porque frete
 * errado sai do bolso dela em toda venda.
 *
 * Só que é a mesma pergunta que a gente decidiu não fazer a ela quando
 * discutiu frete, em 27/08: "ela também não sabe de cabeça". Aí a tela
 * pergunta assim mesmo, e ela cadastra o primeiro produto sozinha, deixa
 * os quatro campos vazios e leva uma recusa que não sabe resolver.
 *
 * ── Por que dá para responder por ela ──────────────────────────────────
 *
 * Porque o peso é do **tipo**, e não do produto. Uma Lousa Mágica pesa o
 * que pesa, com o nome da Peppa ou do Homem-Aranha.
 *
 * Isso foi medido, e não suposto: nos 96 tipos do catálogo dela, **zero**
 * têm mais de uma medida. As 58 Lousas Mágicas são idênticas na balança.
 *
 * ── Por que preferir não sugerir a sugerir errado ──────────────────────
 *
 * Quando os parecidos discordam entre si, esta função devolve nada. Um
 * palpite silencioso ali vira frete cobrado a menos, e ela só descobre no
 * balcão dos Correios, pagando a diferença.
 */

export interface ProdutoComMedida {
  nome: string
  peso_g: number | null
  alt_cm: number | string | null
  larg_cm: number | string | null
  comp_cm: number | string | null
}

export interface Medidas {
  familia: string
  quantos: number
  peso_g: number
  alt_cm: number
  larg_cm: number
  comp_cm: number
}

/**
 * O tipo do produto, tirado do nome.
 *
 * Os 342 vieram da Elojinha no formato "tipo - tema", e é assim que ela
 * continua escrevendo. Sem traço, o nome inteiro é a família.
 */
export const familiaDoNome = (nome: string): string =>
  String(nome ?? '')
    .split(' - ')[0]
    .trim()

/* Sem acento, sem caixa, sem pontuação: ela digita do celular, com pressa,
   e a ajuda não pode funcionar só para quem escreve igual ao banco. */
const comparavel = (texto: string): string =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const numero = (valor: unknown): number => Number(String(valor ?? '').replace(',', '.'))

const temMedida = (p: ProdutoComMedida): boolean =>
  [p.peso_g, p.alt_cm, p.larg_cm, p.comp_cm].every((v) => Number.isFinite(numero(v)) && numero(v) > 0)

export const medidasParecidas = (
  nome: string,
  catalogo: ProdutoComMedida[],
): Medidas | null => {
  const procurado = comparavel(nome)
  if (!procurado) return null

  const comMedida = (catalogo ?? []).filter(temMedida)

  /* Acha a família mais longa que o nome digitado começa com. A mais
     longa porque "Bloco Destacável" e "Bloco" convivem no catálogo, e a
     resposta certa é a mais específica das duas. */
  const familias = [...new Set(comMedida.map((p) => familiaDoNome(p.nome)))]
    .filter((f) => f && procurado.startsWith(comparavel(f)))
    .sort((a, b) => b.length - a.length)

  const familia = familias[0]
  if (!familia) return null

  const iguais = comMedida.filter((p) => familiaDoNome(p.nome) === familia)

  const assinatura = (p: ProdutoComMedida) =>
    [numero(p.peso_g), numero(p.alt_cm), numero(p.larg_cm), numero(p.comp_cm)].join('|')

  /* Discordância entre parecidos vira silêncio. Escolher uma das medidas
     seria decidir por ela sem ela saber que houve escolha. */
  if (new Set(iguais.map(assinatura)).size !== 1) return null

  const modelo = iguais[0]

  return {
    familia,
    quantos: iguais.length,
    peso_g: numero(modelo.peso_g),
    alt_cm: numero(modelo.alt_cm),
    larg_cm: numero(modelo.larg_cm),
    comp_cm: numero(modelo.comp_cm),
  }
}
