import { paraAVitrine } from '@/dominio/vitrineDeTemas'
import { PERSONALIZADA, PEDAGOGICA, MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from '../catalogo'
import { BASE } from '../base'
import { escolherCatalogo } from '../dominio/catalogoDoBanco'
import doBanco from '../dados/catalogo-publicado.json'
import { limparDescricao } from '../dominio/limparDescricao'

/**
 * O catálogo da loja.
 *
 * As descrições, medidas e preços daqui são os que a Vivian usava no Elo7
 * e mandou em 16/08/2026. Não são texto inventado por mim: são as palavras
 * que já venderam 343 produtos, e mexer nelas sem motivo seria trocar o
 * que funciona por o que eu acho bonito.
 *
 * Três coisas se repetiam em todos os anúncios dela e por isso viraram
 * regra da loja, em vez de texto copiado em cada produto:
 *
 *   1. vai embalado em saquinho transparente com lapela no tema
 *   2. a arte é a da foto, muda só o nome e a idade, e não há prévia
 *   3. o prazo de produção é contado em dias úteis, e o frete vem depois
 *
 * A segunda é a mais importante de todas: é o que impede a cliente de
 * exigir revisão de arte depois de a peça estar impressa.
 *
 * O `tema` é como a cliente dela procura. No Elo7 quem queria festa do
 * Mickey escolhia o tema e via tudo junto — caneca, revista, álbum — e é
 * esse raciocínio que a loja precisa preservar. São 86 temas na loja
 * dela; aqui estão os que apareceram no material que ela mandou.
 *
 * O `slug` é o que aparece no endereço: vira link para mandar no WhatsApp
 * e é o que o Google indexa.
 *
 * PENDENTE-VIVIAN — os preços dos produtos personalizados são MEUS, não
 * dela. Ela mandou a lista de preços só do material pedagógico; dos
 * personalizados vieram as descrições e as medidas, sem valor. Coloquei
 * números plausíveis para a loja não ficar vazia, e eles saem no lugar dos
 * verdadeiros assim que o catálogo do Elo7 for lido. Nenhum destes preços
 * pode ir ao ar cobrando de cliente.
 */

/* Vale para todo produto personalizado, e aparece uma vez na tela em vez
   de repetido em cada anúncio. */
export const REGRAS_DO_PERSONALIZADO = [
  'Já vai embalado em saquinho transparente com lapela no tema.',
  'Você recebe exatamente como está na foto: muda só o nome e a idade. Não enviamos prévia para aprovação.',
  `Produção de ${PRAZO_PRODUCAO} dias úteis, sem contar sábado, domingo e feriado. O prazo da transportadora vem depois disso.`,
]

/* Os temas de exemplo, usados enquanto ela não publicar nada. Os dela
   vivem no banco: são 140, vindos dos nomes dos 343 produtos. */
const TEMAS_DE_EXEMPLO = [
  { slug: 'mickey', nome: 'Mickey', descricao: 'A turma do Mickey para festa e lembrancinha.' },
  { slug: 'primeira-eucaristia', nome: 'Primeira Eucaristia', descricao: 'Para a celebração e as lembrancinhas do dia.' },
  { slug: 'sem-tema', nome: 'Sem tema definido', descricao: 'Produtos que ainda não foram separados por tema.' },
]

const PRODUTOS_DE_EXEMPLO = [
  {
    id: 1,
    slug: 'jogo-2-em-1-velha-e-forca',
    name: 'Jogo 2 em 1 — Jogo da Velha e Jogo da Forca',
    category: PERSONALIZADA,
    tema: 'sem-tema',
    tipo: 'Jogo',
    price: 24.9,
    image: `${BASE}produtos/jogo-2-em-1-velha-e-forca.webp`,
    mini: `${BASE}produtos/jogo-2-em-1-velha-e-forca-mini.webp`,
    tag: 'Sob encomenda',
    description: 'Lousa de jogo da velha e forca com o nome de quem vai brincar.',
    detalhes: [
      'Lousa de 24 × 18 cm, base dura de 1,9 mm',
      'Laminação especial: escreve e apaga quantas vezes quiser',
      'Acompanha 1 caneta com apagador na tampa',
    ],
  },
  {
    id: 2,
    slug: 'kit-colorir-revista-e-giz',
    name: 'Kit de Colorir — Revista + Giz de Cera',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Revista',
    price: 19.9,
    image: `${BASE}produtos/kit-colorir-revista-e-giz.webp`,
    mini: `${BASE}produtos/kit-colorir-revista-e-giz-mini.webp`,
    tag: 'Sob encomenda',
    description: 'Revista para colorir com o nome da criança, e giz de cera junto.',
    detalhes: [
      'Revista de 14 × 20 cm com 12 páginas para colorir',
      'Acompanha caixa de giz de cera com 6 cores',
    ],
  },
  {
    id: 3,
    slug: 'album-de-figurinhas',
    name: 'Álbum de Figurinhas',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Álbum',
    price: 22.9,
    image: `${BASE}produtos/album-de-figurinhas.webp`,
    mini: `${BASE}produtos/album-de-figurinhas-mini.webp`,
    galeria: [`${BASE}produtos/album-de-figurinhas-2.webp`, `${BASE}produtos/album-de-figurinhas-3.webp`],
    tag: 'Sob encomenda',
    description: 'Álbum com o nome da criança e um envelope de figurinhas do tema.',
    detalhes: [
      'Álbum de 14 × 20 cm',
      'Acompanha 1 envelope com 16 figurinhas do tema',
      'Sem figurinhas repetidas',
    ],
  },
  {
    id: 4,
    slug: 'tubolata-personalizada',
    name: 'Tubolata personalizada',
    category: PERSONALIZADA,
    tema: 'sem-tema',
    tipo: 'Lembrancinha',
    price: 12.9,
    image: `${BASE}produtos/tubolata-personalizada.webp`,
    mini: `${BASE}produtos/tubolata-personalizada-mini.webp`,
    tag: 'Sob encomenda',
    description: 'Tubolata branca com o nome e a idade de quem faz aniversário.',
    detalhes: ['7 × 6 cm, na cor branca', 'Vai vazia: não acompanha guloseimas'],
  },
  {
    id: 5,
    slug: 'caneca-personalizada',
    name: 'Caneca personalizada',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Caneca',
    price: 29.9,
    image: `${BASE}produtos/caneca-personalizada.webp`,
    mini: `${BASE}produtos/caneca-personalizada-mini.webp`,
    galeria: [`${BASE}produtos/caneca-personalizada-2.webp`, `${BASE}produtos/caneca-personalizada-3.webp`],
    tag: 'Sob encomenda',
    description: 'Caneca de 350 ml com tampa, personalizada com nome e idade.',
    detalhes: [
      '350 ml — 10 cm de altura e 8 cm de diâmetro',
      'Copo de acrílico e tampa de plástico',
    ],
  },
  {
    id: 6,
    slug: 'saquinho-personalizado',
    name: 'Saquinho personalizado',
    category: PERSONALIZADA,
    tema: 'sem-tema',
    tipo: 'Lembrancinha',
    price: 9.9,
    image: `${BASE}produtos/saquinho-personalizado.webp`,
    mini: `${BASE}produtos/saquinho-personalizado-mini.webp`,
    galeria: [`${BASE}produtos/saquinho-personalizado-2.webp`, `${BASE}produtos/saquinho-personalizado-3.webp`, `${BASE}produtos/saquinho-personalizado-4.webp`],
    tag: 'Sob encomenda',
    description: 'Saquinho com adesivo personalizado, para montar a lembrancinha.',
    detalhes: [
      'Saquinho de 10 × 15 cm, adesivo de 9 × 10,5 cm',
      'Fechamento zip lock e verso com visor transparente',
      'Fica em pé com facilidade. Vai vazio: não acompanha guloseimas',
    ],
  },
  {
    id: 7,
    slug: 'revista-de-colorir',
    name: 'Revista de Colorir',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Revista',
    price: 14.9,
    image: `${BASE}produtos/revista-de-colorir.webp`,
    mini: `${BASE}produtos/revista-de-colorir-mini.webp`,
    galeria: [`${BASE}produtos/revista-de-colorir-2.webp`, `${BASE}produtos/revista-de-colorir-3.webp`],
    tag: 'Sob encomenda',
    description: 'Revista para colorir com o nome da criança na capa.',
    detalhes: ['14 × 20 cm com 12 páginas para colorir', 'Não acompanha giz de cera'],
  },
  {
    id: 8,
    slug: 'lousa-magica',
    name: 'Lousa Mágica',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Jogo',
    price: 24.9,
    image: `${BASE}produtos/lousa-magica.webp`,
    mini: `${BASE}produtos/lousa-magica-mini.webp`,
    galeria: [`${BASE}produtos/lousa-magica-2.webp`, `${BASE}produtos/lousa-magica-3.webp`, `${BASE}produtos/lousa-magica-4.webp`],
    tag: 'Sob encomenda',
    description: 'Lousa para escrever e apagar, com o nome de quem vai usar.',
    detalhes: [
      '24 × 18 cm, base dura de 1,9 mm',
      'Laminação especial: escreve e apaga sem danificar a impressão',
      'Acompanha 1 caneta com apagador na tampa',
    ],
  },
  {
    id: 9,
    slug: 'bloco-destacavel',
    name: 'Bloco Destacável',
    category: PERSONALIZADA,
    tema: 'sem-tema',
    tipo: 'Papelaria',
    price: 13.9,
    image: `${BASE}produtos/bloco-destacavel.webp`,
    mini: `${BASE}produtos/bloco-destacavel-mini.webp`,
    tag: 'Sob encomenda',
    description: 'Bloco de anotações com o nome impresso em cada folha.',
    detalhes: ['A6 — 10,5 × 14,8 cm', '30 folhas destacáveis, impressas só na frente'],
  },
  {
    id: 10,
    slug: 'kit-bloco-e-lapis',
    name: 'Kit Bloco Destacável + Lápis',
    category: PERSONALIZADA,
    tema: 'sem-tema',
    tipo: 'Papelaria',
    price: 16.9,
    image: `${BASE}produtos/kit-bloco-e-lapis.webp`,
    mini: `${BASE}produtos/kit-bloco-e-lapis-mini.webp`,
    tag: 'Sob encomenda',
    description: 'O bloco personalizado com um lápis junto, pronto para presentear.',
    detalhes: [
      'A6 — 10,5 × 14,8 cm, 30 folhas destacáveis',
      'Acompanha 1 lápis com borracha',
    ],
  },
  {
    id: 11,
    slug: 'revista-passatempo',
    name: 'Revista Passatempo',
    category: PERSONALIZADA,
    tema: 'mickey',
    tipo: 'Revista',
    price: 14.9,
    image: `${BASE}produtos/revista-passatempo.webp`,
    mini: `${BASE}produtos/revista-passatempo-mini.webp`,
    galeria: [`${BASE}produtos/revista-passatempo-2.webp`, `${BASE}produtos/revista-passatempo-3.webp`],
    tag: 'Sob encomenda',
    description: 'Revista de atividades para crianças de 2 a 5 anos.',
    detalhes: [
      '14 × 20 cm com 12 páginas de atividades',
      'Colorir, cobrir, ligar e jogo da memória',
      'Pensada para a faixa de 2 a 5 anos',
    ],
  },
  {
    id: 12,
    slug: 'livrinho-de-oracoes',
    name: 'Livrinho de Orações — Primeira Eucaristia',
    category: PERSONALIZADA,
    tema: 'primeira-eucaristia',
    tipo: 'Lembrancinha',
    price: 17.9,
    image: `${BASE}produtos/livrinho-de-oracoes.webp`,
    mini: `${BASE}produtos/livrinho-de-oracoes-mini.webp`,
    galeria: [`${BASE}produtos/livrinho-de-oracoes-2.webp`, `${BASE}produtos/livrinho-de-oracoes-3.webp`],
    tag: 'Sob encomenda',
    description: 'Livrinho com o nome, a igreja e a data da Primeira Eucaristia.',
    detalhes: [
      'A6 — 10,5 × 14,8 cm, capa flexível',
      'Traz nome, nome da igreja e data da celebração',
      '14 orações, incluindo como rezar o terço',
    ],
  },

  /* ── Material pedagógico ───────────────────────────────────────────────
     Preços do Elo7, com o valor cheio e o promocional que ela pratica.
     Aqui não há mínimo, não há frete e não há produção: o arquivo sai
     assim que o pagamento aprova. */
  {
    id: 20,
    slug: 'primeiras-descobertas-cores',
    name: 'Primeiras Descobertas — Cores',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 39.99,
    precoPromocional: 29.99,
    image: `${BASE}produtos/primeiras-descobertas-cores.webp`,
    mini: `${BASE}produtos/primeiras-descobertas-cores-mini.webp`,
    galeria: [`${BASE}produtos/primeiras-descobertas-cores-2.webp`, `${BASE}produtos/primeiras-descobertas-cores-3.webp`],
    tag: 'Digital',
    description: 'Kit de 51 páginas para conhecer e identificar as cores.',
    detalhes: [
      '51 páginas para pintar, colar, ligar, conhecer, identificar e cobrir',
      'Cobre o nome das cores em letra bastão',
      'Trabalha coordenação motora, concentração e vocabulário',
    ],
  },
  {
    id: 21,
    slug: 'formacao-de-palavras',
    name: 'Formação de Palavras',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 35,
    precoPromocional: 29.99,
    image: '',
    tag: 'Digital',
    description: 'Atividades de formação de palavras para o ensino fundamental.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 22,
    slug: 'datas-comemorativas',
    name: 'Datas Comemorativas',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 32,
    precoPromocional: 27.99,
    image: '',
    tag: 'Digital',
    description: 'Atividades para trabalhar as datas do calendário escolar.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 23,
    slug: 'aumentativo-e-diminutivo',
    name: 'Aumentativo e Diminutivo',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 49.99,
    precoPromocional: 39.99,
    image: '',
    tag: 'Digital',
    description: 'Material estruturado sobre aumentativo e diminutivo.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 24,
    slug: 'desenvolvimento-das-habilidades',
    name: 'Desenvolvimento das Habilidades',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 30,
    precoPromocional: 25.99,
    image: '',
    tag: 'Digital',
    description: 'Atividades para desenvolver habilidades de forma progressiva.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 25,
    slug: 'sinonimos-e-antonimos',
    name: 'Sinônimos e Antônimos',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 32,
    precoPromocional: 26.99,
    image: '',
    tag: 'Digital',
    description: 'Atividades de sinônimos e antônimos para o ensino fundamental.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 26,
    slug: 'atividades-adaptadas-matematica',
    name: 'Atividades Adaptadas — Matemática',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Adaptada',
    price: 49,
    precoPromocional: 29.99,
    image: '',
    tag: 'Digital',
    description: 'Matemática adaptada, com apoio visual, para inclusão escolar.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 27,
    slug: 'atividades-adaptadas-vogais',
    name: 'Atividades Adaptadas — Vogais',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Adaptada',
    price: 29.99,
    image: '',
    tag: 'Digital',
    description: 'Vogais adaptadas, com apoio visual, para inclusão escolar.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
  {
    id: 28,
    slug: 'alfabeto-ilustrado',
    name: 'Alfabeto Ilustrado',
    category: PEDAGOGICA,
    tema: 'sem-tema',
    tipo: 'Atividade',
    price: 25.99,
    image: '',
    tag: 'Digital',
    description: 'Alfabeto ilustrado para imprimir e usar em casa ou na escola.',
    detalhes: ['Arquivo em PDF para imprimir quantas vezes quiser'],
  },
]

/**
 * O catálogo que vai ao ar.
 *
 * Vem do banco quando ela tem produto publicado, e dos exemplos enquanto
 * não tem. A escolha acontece na hora de gerar o site, com o arquivo que
 * o `scripts/baixar-catalogo.mjs` escreve.
 *
 * Isso significa que publicar no painel não muda a loja na hora: a página
 * é gerada uma vez e servida pronta, que é o que a deixa rápida no 4G e
 * legível para o Google. O site passa a mostrar depois da próxima
 * publicação.
 */
/**
 * A descrição sai limpa, e o JSON continua cru.
 *
 * As 342 descrições vieram inteiras da Elojinha, e 262 delas mandavam a
 * cliente conferir o prazo "no ELO7", que é a concorrente e está fechada.
 * `limparDescricao` foi escrita e testada em 26/08 e nunca chegou a ser
 * chamada por ninguém: o texto cru estava saindo na loja desde então.
 *
 * A limpeza acontece aqui, e não no arquivo baixado, para o original
 * continuar versionado. Se a limpeza um dia estiver errada, o texto que
 * ela escreveu ao longo de anos ainda está lá para consertar.
 *
 * O genérico não é enfeite: sem ele o tipo de `PRODUTOS` vira `any[]`, e
 * os testes que percorrem o catálogo param de conferir qualquer coisa.
 *
 * @template {{ description?: string }} T
 * @param {T[]} produtos
 * @returns {T[]}
 */
const semPoeiraDoMarketplace = (produtos) =>
  produtos.map((produto) => ({
    ...produto,
    description: limparDescricao(produto.description ?? ''),
  }))

export const PRODUTOS = semPoeiraDoMarketplace(
  escolherCatalogo(doBanco.produtos, PRODUTOS_DE_EXEMPLO),
)

export const TEMAS = escolherCatalogo(doBanco.temas, TEMAS_DE_EXEMPLO)

/**
 * O que a loja mostra hoje: só o que tem foto.
 *
 * Ela mandou 41 fotos, que cobrem 13 dos 21 produtos. Uma vitrine com um
 * terço dos cartões escrito "aqui entra a foto" passa impressão de obra
 * parada, e é o contrário do que ela precisa transmitir para quem chega
 * pelo Instagram.
 *
 * Escondido, e não apagado: as descrições e os preços são dela, vieram do
 * Elo7 e custaram tempo. Quando a foto chegar, o produto volta sozinho,
 * sem ninguém precisar redigitar nada.
 *
 * Quando o cadastro pela própria Vivian existir, isso vira a coluna
 * `ativo` do banco e a decisão passa a ser dela, produto a produto.
 */
export const PUBLICADOS = PRODUTOS.filter((produto) => produto.image)

/** Encontra o produto pelo pedaço do endereço. */
export const acharPorSlug = (slug) => PRODUTOS.find((produto) => produto.slug === slug)

/** O que a pessoa paga hoje: o promocional quando existe, senão o cheio. */
export const precoAtual = (produto) => produto.precoPromocional ?? produto.price

/** Verdadeiro quando há desconto para mostrar riscado do lado. */
export const temPromocao = (produto) =>
  typeof produto.precoPromocional === 'number' && produto.precoPromocional < produto.price

export const produtosDoTema = (slugDoTema) =>
  PUBLICADOS.filter((produto) => produto.tema === slugDoTema)

export const acharTema = (slugDoTema) => TEMAS.find((tema) => tema.slug === slugDoTema)

/**
 * Os temas que têm produto, com a conta de quantos.
 *
 * Tema vazio não aparece: com 86 deles, uma lista cheia de links que não
 * levam a nada é pior do que uma lista curta.
 */
export const temasComProdutos = () =>
  TEMAS.map((tema) => ({ ...tema, quantos: produtosDoTema(tema.slug).length })).filter(
    (tema) => tema.quantos > 0,
  )

/**
 * Os temas prontos para a vitrine: com foto, e os maiores primeiro.
 *
 * As regras estão em `vitrineDeTemas.ts`, sem tocar no catálogo. Aqui é só
 * a ligação entre os dois.
 */
export const temasDaVitrine = () => paraAVitrine(temasComProdutos(), PUBLICADOS)

export { PERSONALIZADA, PEDAGOGICA, MINIMO_PERSONALIZADO, PRAZO_PRODUCAO, BASE }
