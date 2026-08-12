import { PERSONALIZADA, PEDAGOGICA, MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from '../catalogo'
import { BASE } from '../base'

/**
 * Catálogo de exemplo da loja.
 *
 * Saiu de dentro da LandingPage porque agora três telas leem daqui: a
 * vitrine, a página de cada produto e o carrinho. Enquanto o catálogo
 * morava dentro de um componente, a página de produto não tinha como
 * saber que produto mostrar.
 *
 * Nada aqui é produto real. O `slug` é o que aparece no endereço — vira
 * link que dá para mandar no WhatsApp e que o Google indexa.
 */
export const PRODUTOS = [
  {
    id: 1,
    slug: 'caderno-personalizado',
    name: 'Caderno personalizado',
    category: PERSONALIZADA,
    price: 32.0,
    image: '',
    tag: 'Sob encomenda',
    description: 'Capa com o nome de quem vai usar.',
    detalhes: [
      'Capa dura com o nome impresso',
      'Miolo pautado, 96 folhas',
      'Escolha a cor da capa na hora da compra',
    ],
  },
  {
    id: 2,
    slug: 'cartela-de-adesivos-escolares',
    name: 'Cartela de adesivos escolares',
    category: PERSONALIZADA,
    price: 18.0,
    image: '',
    tag: 'Sob encomenda',
    description: 'Etiquetas para material escolar, com nome e turma.',
    detalhes: [
      'Vinil resistente à água',
      'Nome e turma impressos',
      'Tamanhos variados na mesma cartela',
    ],
  },
  {
    id: 3,
    slug: 'bloco-de-anotacoes',
    name: 'Bloco de anotações',
    category: PERSONALIZADA,
    price: 24.0,
    image: '',
    tag: 'Sob encomenda',
    description: 'Bloco personalizado, ideal para lembrancinha.',
    detalhes: ['50 folhas', 'Nome impresso em cada folha', 'Ótimo para lembrancinha de escola'],
  },
  {
    id: 4,
    slug: 'apostila-de-alfabetizacao-adaptada',
    name: 'Apostila de alfabetização adaptada',
    category: PEDAGOGICA,
    price: 47.0,
    image: '',
    tag: 'Digital',
    description: 'Material estruturado com apoio visual, para imprimir em casa.',
    detalhes: [
      'Arquivo em PDF, para imprimir quantas vezes precisar',
      'Atividades com apoio visual',
      'Chega no e-mail assim que o pagamento é aprovado',
    ],
  },
  {
    id: 5,
    slug: 'kit-rotina-visual',
    name: 'Kit rotina visual',
    category: PEDAGOGICA,
    price: 39.0,
    image: `${BASE}rotina_visual_premium_1778703012017.png`,
    tag: 'Digital',
    description: 'Quadro de rotina para montar e usar no dia a dia.',
    detalhes: [
      'Arquivo em PDF para imprimir e montar',
      'Cartões de rotina ilustrados',
      'Ajuda a criança a saber o que vem depois',
    ],
  },
  {
    id: 6,
    slug: 'jogo-das-emocoes',
    name: 'Jogo das emoções',
    category: PEDAGOGICA,
    price: 29.0,
    image: `${BASE}jogo_emocoes_premium_1778702950986.png`,
    tag: 'Digital',
    description: 'Atividade lúdica para identificar sentimentos.',
    detalhes: [
      'Arquivo em PDF para imprimir e recortar',
      'Cartas com expressões para nomear sentimentos',
      'Feito para usar em casa ou em atendimento',
    ],
  },
]

export const acharPorSlug = (slug) => PRODUTOS.find((p) => p.slug === slug) ?? null

export { MINIMO_PERSONALIZADO, PRAZO_PRODUCAO }
