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
  },
  {
    id: 'minimo',
    pergunta: 'Preciso comprar quantas peças?',
    resposta:
      `A maior parte dos produtos tem mínimo de ${MINIMO_PERSONALIZADO} peças, porque são feitos ` +
      'para lembrancinha de festa. O mínimo de cada produto aparece na página dele, antes do ' +
      'carrinho. Alguns poucos podem ser comprados em quantidade menor.',
    seguintes: ['personalizar', 'prazo'],
  },
  {
    id: 'personalizar',
    pergunta: 'Dá para colocar o nome da minha filha?',
    resposta:
      'Dá sim, e é o normal aqui: o nome e a idade entram na arte. O produto sai igual à foto ' +
      'do anúncio, mudando só o nome e a idade. Você escreve isso na hora de fechar o pedido.',
    seguintes: ['prazo', 'humano'],
  },
  {
    id: 'frete',
    pergunta: 'Quanto custa o frete?',
    resposta:
      'O frete é calculado pelo seu CEP e aparece no carrinho antes de você pagar, com o prazo ' +
      'de cada transportadora lado a lado. O envio sai do Rio de Janeiro.',
    seguintes: ['prazo', 'pagamento'],
  },
  {
    id: 'pagamento',
    pergunta: 'Como eu pago?',
    resposta:
      'Pix ou cartão, pelo Mercado Pago. No Pix o pagamento cai na hora e a produção já começa; ' +
      'no cartão a aprovação costuma levar alguns minutos.',
    seguintes: ['prazo', 'acompanhar'],
  },
  {
    id: 'acompanhar',
    pergunta: 'Como acompanho meu pedido?',
    resposta:
      'Você recebe o número do pedido por e-mail assim que o pagamento é aprovado, e acompanha ' +
      'por ele na página de andamento, aqui mesmo no site.',
    seguintes: ['prazo', 'humano'],
  },
  {
    id: 'atrasar',
    pergunta: 'Preciso para uma data. Chega a tempo?',
    resposta:
      `Some os ${PRAZO_PRODUCAO} dias úteis de produção ao prazo de entrega que aparece no ` +
      'carrinho: essa é a data. Se estiver apertado para a sua festa, fale com a loja antes de ' +
      'comprar, porque prometer data que não dá para cumprir não ajuda ninguém.',
    seguintes: ['humano'],
  },
  {
    id: 'trocar',
    pergunta: 'E se vier errado?',
    resposta:
      'Se o produto vier diferente do que foi pedido, a loja refaz. Fale com a loja com o número ' +
      'do pedido e uma foto, que é resolvido.',
    seguintes: ['humano'],
  },
]

/** As perguntas com que a conversa começa. */
export const PRIMEIRAS = ['prazo', 'minimo', 'personalizar', 'frete', 'pagamento']

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
  texto:
    'Oi! Escolha uma pergunta abaixo e eu respondo na hora. Se você precisar de outra coisa, ' +
    'dá para falar direto com a loja.',
}

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
