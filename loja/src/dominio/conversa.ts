/**
 * A conversa dentro da loja.
 *
 * A Vivian pediu em 24/08 e aprovou o desenho em 25/08: a cliente conversa
 * dentro do site, do início ao fim, sem passar pelo WhatsApp. O que ela
 * quer resolver é real. No WhatsApp a pergunta "qual o prazo?" chega solta,
 * sem dizer de quem é nem de qual pedido, misturada com conversa pessoal.
 *
 * ── Botão, e não campo de texto livre ──────────────────────────────────
 *
 * A cliente escolhe entre opções fixas, e cada resposta foi escrita à mão a
 * partir do catálogo e das políticas dela. **Nada é gerado.**
 *
 * Isso não é economia de esforço, é a decisão que faz a coisa poder existir:
 * um robô que escreve sozinho acaba prometendo prazo, desconto ou condição
 * que ela não vai cumprir, e quem fica com a promessa na mão é ela, sozinha,
 * na frente de uma cliente com razão. Botão não inventa.
 *
 * O preço disso é que a lista de perguntas é curta e alguém sempre vai
 * querer algo fora dela. Para esse alguém existe "falar com a loja", que é
 * a única porta para um humano — e é ali, e só ali, que se pede nome e
 * e-mail.
 */

import { MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from './regras'

export interface Opcao {
  id: string
  /** O que a cliente lê no botão, escrito como ela perguntaria. */
  pergunta: string
  /** A resposta, escrita à mão. */
  resposta: string
  /** Para onde a conversa vai depois de responder. */
  seguintes?: string[]
  /**
   * As palavras que levam a esta resposta quando a cliente digita.
   *
   * Escritas à mão, como tudo aqui. É o que faz a conversa parecer
   * atendimento em vez de menu: a pessoa escreve "chega antes do dia 20?"
   * e recebe a resposta certa, sem caçar botão.
   */
  palavras: string[]
}

/**
 * As perguntas, escritas como a cliente dela pergunta.
 *
 * "Quanto tempo demora?" e não "Prazo de produção". Quem está comprando
 * lembrancinha para a festa do sábado não procura a palavra do sistema.
 */
export const OPCOES: Opcao[] = [
  {
    id: 'prazo',
    pergunta: 'Quanto tempo demora para ficar pronto?',
    resposta:
      `São ${PRAZO_PRODUCAO} dias úteis de produção, contados de quando o pagamento é aprovado. ` +
      'Sábado, domingo e feriado não contam. Depois disso ainda entra o prazo dos Correios, ' +
      'que aparece no carrinho junto com o preço do frete.',
    seguintes: ['frete', 'atrasar'],
    palavras: ['prazo', 'demora', 'tempo', 'dias', 'pronto', 'producao', 'demoram', 'rapido'],
  },
  {
    id: 'minimo',
    pergunta: 'Preciso comprar quantas peças?',
    resposta:
      `A maior parte dos produtos tem mínimo de ${MINIMO_PERSONALIZADO} peças, porque são feitos ` +
      'para lembrancinha de festa. O mínimo de cada produto aparece na página dele, antes do ' +
      'carrinho. Alguns poucos podem ser comprados em quantidade menor.',
    seguintes: ['personalizar', 'prazo'],
    palavras: ['minimo', 'quantidade', 'quantas', 'unidade', 'unidades', 'pecas', 'so uma', 'apenas uma', 'avulso'],
  },
  {
    id: 'personalizar',
    pergunta: 'Dá para colocar o nome da minha filha?',
    resposta:
      'Dá sim, e é o normal aqui: o nome e a idade entram na arte. O produto sai igual à foto ' +
      'do anúncio, mudando só o nome e a idade. Você escreve isso na hora de fechar o pedido.',
    seguintes: ['prazo', 'humano'],
    palavras: ['nome', 'personalizar', 'personalizado', 'idade', 'escrever', 'arte', 'foto', 'customizar'],
  },
  {
    id: 'frete',
    pergunta: 'Quanto custa o frete?',
    resposta:
      'O frete é calculado pelo seu CEP e aparece no carrinho antes de você pagar, com o prazo ' +
      'de cada transportadora lado a lado. O envio sai do Rio de Janeiro.',
    seguintes: ['prazo', 'pagamento'],
    palavras: ['frete', 'entrega', 'correios', 'envio', 'enviar', 'cep', 'sedex', 'transportadora', 'chega em'],
  },
  {
    id: 'pagamento',
    pergunta: 'Como eu pago?',
    resposta:
      'Pix ou cartão, pelo Mercado Pago. No Pix o pagamento cai na hora e a produção já começa; ' +
      'no cartão a aprovação costuma levar alguns minutos.',
    seguintes: ['prazo', 'acompanhar'],
    palavras: ['pagar', 'pagamento', 'pix', 'cartao', 'credito', 'debito', 'parcela', 'parcelar', 'boleto'],
  },
  {
    id: 'acompanhar',
    pergunta: 'Como acompanho meu pedido?',
    resposta:
      'Você recebe o número do pedido por e-mail assim que o pagamento é aprovado, e acompanha ' +
      'por ele na página de andamento, aqui mesmo no site.',
    seguintes: ['prazo', 'humano'],
    palavras: ['acompanhar', 'rastrear', 'rastreio', 'codigo', 'andamento', 'onde esta', 'status'],
  },
  {
    id: 'atrasar',
    pergunta: 'Preciso para uma data. Chega a tempo?',
    resposta:
      `Some os ${PRAZO_PRODUCAO} dias úteis de produção ao prazo de entrega que aparece no ` +
      'carrinho: essa é a data. Se estiver apertado para a sua festa, fale com a loja antes de ' +
      'comprar, porque prometer data que não dá para cumprir não ajuda ninguém.',
    seguintes: ['humano'],
    palavras: ['data', 'aniversario', 'festa', 'chega a tempo', 'urgente', 'preciso para', 'dia'],
  },
  {
    id: 'trocar',
    pergunta: 'E se vier errado?',
    resposta:
      'Se o produto vier diferente do que foi pedido, a loja refaz. Fale com a loja com o número ' +
      'do pedido e uma foto, que é resolvido.',
    seguintes: ['humano'],
    palavras: ['errado', 'defeito', 'trocar', 'troca', 'devolver', 'quebrado', 'problema', 'reclamacao'],
  },
]

/**
 * As perguntas com que a conversa começa.
 *
 * Três, e não cinco. Abrir com uma lista de tudo o que a loja sabe
 * responder é despejo de menu, e quem chega com uma dúvida na cabeça
 * ainda tem que ler as outras quatro antes de achar a dela. Estas três
 * são as que mais aparecem, e quem quiser outra coisa escreve.
 */
export const PRIMEIRAS = ['prazo', 'frete', 'pagamento']

export const acharOpcao = (id: string): Opcao | undefined =>
  OPCOES.find((o) => o.id === id)

/**
 * O que oferecer depois de responder.
 *
 * As perguntas ligadas a esta, mais "falar com a loja", que precisa estar
 * sempre à mão: a hora em que a cliente desiste dos botões é imprevisível,
 * e obrigá-la a caçar a saída é como ela vai embora.
 *
 * Nunca repete o que ela acabou de perguntar.
 */
export const seguintesDe = (id: string): string[] => {
  const opcao = acharOpcao(id)
  const ligadas = (opcao?.seguintes ?? PRIMEIRAS).filter((s) => s !== id && s !== 'humano')

  const sobrando = PRIMEIRAS.filter((p) => p !== id && !ligadas.includes(p))

  return [...ligadas, ...sobrando].slice(0, 3)
}

export interface Fala {
  quem: 'cliente' | 'loja'
  texto: string
}

/** A primeira coisa que a cliente lê ao abrir a conversa. */
export const ABERTURA: Fala = {
  quem: 'loja',
  /* Curto, e convidando a escrever. A versão anterior explicava o
     funcionamento do chat antes de a pessoa ter uma dúvida, e quem chega
     com pressa não lê instrução. */
  texto: 'Oi! Pode perguntar. Se preferir, escreva com as suas palavras.',
}

/** O que a loja diz quando não tem a resposta pronta. */
export const NAO_SEI = (escrito: string): Fala => ({
  quem: 'loja',
  /* Dizer que não sabe, e não chutar. A cliente que recebe a resposta
     errada com confiança vai embora achando que perguntou e foi
     respondida. */
  texto:
    `Essa eu não sei responder na hora. Mas ${escrito.trim().length > 40 ? 'a sua pergunta' : 'ela'} ` +
    'chega direto na loja se você clicar abaixo, e a resposta vai para o seu e-mail.',
})

/**
 * A conversa depois de a cliente tocar num botão.
 *
 * Devolve uma lista nova, e não altera a que recebeu: a tela guarda o
 * histórico e precisa que ele não mude por baixo dela.
 */
export const responder = (falas: Fala[], id: string): Fala[] => {
  const opcao = acharOpcao(id)
  if (!opcao) return falas

  return [
    ...falas,
    { quem: 'cliente', texto: opcao.pergunta },
    { quem: 'loja', texto: opcao.resposta },
  ]
}

/** O que impede de mandar o recado para ela, dito para a cliente. */
export const problemasDoRecado = (
  nome: string,
  email: string,
  texto: string,
): string[] => {
  const achados: string[] = []

  if (!nome.trim()) achados.push('Escreva o seu nome, para a loja saber com quem fala.')

  // Conferência simples de propósito: recusar endereço estranho que
  // existe é pior do que aceitar um errado, que só volta.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    achados.push('Confira o seu e-mail: é por ele que a resposta chega.')
  }

  if (texto.trim().length < 5) achados.push('Escreva a sua dúvida.')
  if (texto.length > 2000) achados.push('A mensagem ficou longa demais. Resuma um pouco.')

  return achados
}

/**
 * O e-mail que ela manda para a cliente, já escrito.
 *
 * É o que o Maycon prometeu à Vivian em 24/08, e a razão de o e-mail ser
 * pedido à cliente:
 *
 *   > "se você não estiver online no momento, ainda dá pra responder
 *   > depois por e-mail, em vez de perder a cliente"
 *
 * Quem envia é o programa de e-mail dela, e não a loja. Por isso isto
 * funciona hoje, sem depender do serviço de envio que ainda falta
 * contratar: o `mailto:` abre o Gmail dela com tudo preenchido, faltando
 * só a resposta.
 *
 * A pergunta da cliente vai citada no corpo. Sem isso ela responde um
 * e-mail que chega solto, e a cliente não lembra do que se trata,
 * exatamente o problema do WhatsApp que ela queria resolver.
 */
export const emailDeResposta = (
  nome: string,
  email: string,
  pergunta: string,
): string => {
  const assunto = 'Sobre a sua dúvida na Feito para Você'

  const corpo = [
    `Oi, ${nome.trim().split(' ')[0] || 'tudo bem'}!`,
    '',
    'Você perguntou:',
    `"${pergunta.trim()}"`,
    '',
    '',
    'Feito para Você! Papelaria Personalizada',
    'https://feitoparavocepapelaria.com.br',
  ].join(String.fromCharCode(10))

  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
}

/** Sem acento e em minúscula: ninguém digita "mágica" com acento no celular. */
const comparavel = (texto: string): string =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/**
 * A resposta pronta que combina com o que a cliente escreveu.
 *
 * É o que faz a conversa parecer atendimento em vez de menu: a pessoa
 * escreve "chega antes do dia 20?" e recebe a resposta certa, sem caçar
 * botão. **Continua sem gerar texto**: o que muda é como se chega até a
 * resposta escrita à mão, e não a resposta.
 *
 * **Devolve nada quando está em dúvida, e isso é de propósito.** Responder
 * a coisa errada com confiança é pior do que dizer "essa eu não sei": a
 * cliente vai embora achando que perguntou e foi respondida. Quando não
 * há certeza, o caminho é falar com a loja.
 */
export const acharPelaEscrita = (texto: string): Opcao | undefined => {
  const escrito = comparavel(texto)
  if (escrito.trim().length < 3) return undefined

  let melhor: { opcao: Opcao; pontos: number } | undefined

  for (const opcao of OPCOES) {
    /* Uma palavra da lista dentro do que ela escreveu. Peso pelo tamanho
       da palavra: "pix" achar dentro de "pixel" é acidente, e palavra
       longa que bate é sinal mais forte do que palavra curta. */
    const pontos = opcao.palavras
      .filter((palavra) => escrito.includes(comparavel(palavra)))
      .reduce((soma, palavra) => soma + palavra.length, 0)

    if (pontos === 0) continue
    if (!melhor || pontos > melhor.pontos) melhor = { opcao, pontos }
  }

  return melhor?.opcao
}
