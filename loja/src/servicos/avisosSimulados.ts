/**
 * Os avisos que a loja mandaria — sem mandar nada.
 *
 * A loja precisa avisar quem comprou em três momentos: pagamento confirmado,
 * material digital liberado e pedido postado. Enviar e-mail ou WhatsApp de
 * verdade custa serviço contratado, e ainda não há. Esta implementação cumpre
 * o contrato `ServicoDeAvisos` guardando cada aviso numa lista no navegador,
 * com data, tipo, destinatário e o texto inteiro que teria saído.
 *
 * Isso não é um placeholder vazio: é o que permite a Vivian abrir o painel na
 * demonstração e ler, palavra por palavra, o que a cliente dela receberia —
 * e pedir para mudar o tom antes de o serviço real entrar.
 *
 * Nada aqui finge ter entregado. `real` é `false` e o canal é `'simulado'`,
 * justamente para a interface poder escrever na tela que o aviso não saiu.
 * Quando o e-mail de verdade entrar, os textos abaixo migram para lá e só a
 * forma de enviar muda — as telas continuam iguais.
 */

import type {
  Aviso,
  Comprador,
  Pedido,
  ServicoDeAvisos,
  TipoDeAviso,
} from './contratos'

const CHAVE_AVISOS = 'feito-para-voce:avisos'

/** O que fica registrado de cada aviso que teria sido enviado. */
export interface AvisoRegistrado {
  /** ISO, para o painel ordenar e mostrar "quando teria saído". */
  data: string
  tipo: TipoDeAviso
  /** Nome, e-mail e WhatsApp de quem receberia. */
  destinatario: Comprador
  numeroDoPedido: string
  texto: string
}

const armazenamento = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

const lerRegistro = (): AvisoRegistrado[] => {
  const guarda = armazenamento()
  if (!guarda) return []

  try {
    const bruto = guarda.getItem(CHAVE_AVISOS)
    if (!bruto) return []

    const conteudo: unknown = JSON.parse(bruto)
    if (!Array.isArray(conteudo)) return []

    return conteudo.filter(
      (item): item is AvisoRegistrado =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as AvisoRegistrado).texto === 'string',
    )
  } catch {
    // Registro corrompido não pode impedir um novo aviso de ser guardado.
    return []
  }
}

/** Tratar a pessoa pelo primeiro nome — é como a Vivian fala com as clientes. */
const primeiroNome = (nome: string): string => {
  const limpo = nome.trim()
  if (!limpo) return 'oi'
  return limpo.split(/\s+/)[0]
}

/** "R$ 120,00" — o mesmo formato que aparece na loja. */
const emReais = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Os textos.
 *
 * Cada um diz duas coisas, nessa ordem: o que acabou de acontecer e o que a
 * pessoa faz agora. Quem compra de artesã espera falar com gente, não com
 * departamento — por isso nada de "prezado cliente" nem "sua solicitação foi
 * processada". A assinatura fica no plural, em nome da loja, sem nome
 * próprio — mesma regra de `nomeDaDona.test.ts`, que até 24/08 não cobria
 * este arquivo por só varrer `telas` e `componentes`.
 */
const textos: Record<TipoDeAviso, (aviso: Aviso) => string> = {
  'pedido-confirmado': ({ para, pedido }: Aviso): string =>
    [
      `Oi, ${primeiroNome(para.nome)}!`,
      '',
      `Seu pagamento de ${emReais(pedido.total)} entrou certinho e o pedido ${pedido.numero} já está com a gente.`,
      'Agora a gente começa a fazer. Assim que estiver pronto e postado, a gente avisa com o código de rastreio.',
      '',
      `Se precisar mudar alguma coisa, é só chamar no WhatsApp e falar o número ${pedido.numero}.`,
      '',
      'Um abraço',
    ].join('\n'),

  'material-digital': ({ para, pedido }: Aviso): string =>
    [
      `Oi, ${primeiroNome(para.nome)}!`,
      '',
      `O material do pedido ${pedido.numero} já está liberado — é só clicar no link e baixar.`,
      // Os dois avisos abaixo existem para evitar as duas dúvidas que mais
      // chegam no WhatsApp: "o link parou de funcionar" e "por que meu nome
      // está no arquivo".
      'O link fica valendo por 7 dias, então baixa e guarda no seu computador ou celular.',
      'O seu nome sai impresso no arquivo — é assim que a loja protege o trabalho de ser repassado adiante.',
      '',
      'Se der qualquer problema para abrir, chama que a gente resolve.',
      '',
      'Um abraço',
    ].join('\n'),

  'pedido-postado': ({ para, pedido }: Aviso): string => {
    const linhas = [
      `Oi, ${primeiroNome(para.nome)}!`,
      '',
      `Seu pedido ${pedido.numero} ficou pronto e já está postado.`,
    ]

    // Sem rastreio, o texto não inventa código nem promete prazo: diz o que
    // a pessoa faz enquanto o código não sai.
    if (pedido.rastreio) {
      const transportadora = pedido.transportadora ?? 'transportadora'
      linhas.push(
        `O código de rastreio é ${pedido.rastreio} — dá para acompanhar no site da ${transportadora}.`,
        'O código costuma levar umas horas para aparecer no sistema, então se não achar agora, tenta mais tarde.',
      )
    } else {
      linhas.push(
        'O código de rastreio ainda não saiu; assim que sair, a gente manda aqui mesmo.',
      )
    }

    linhas.push(
      '',
      'Quando chegar, conta pra gente o que achou? Ficamos felizes de ver a foto.',
      '',
      'Um abraço',
    )

    return linhas.join('\n')
  },
}

/** Deixa o texto pronto sem gravar nada — útil para pré-visualizar na tela. */
export const textoDoAviso = (aviso: Aviso): string => textos[aviso.tipo](aviso)

export const avisosSimulados: ServicoDeAvisos = {
  real: false,

  async enviar(aviso: Aviso): Promise<{ enviado: boolean; canal: string }> {
    const pedido: Pedido = aviso.pedido

    const registro: AvisoRegistrado = {
      data: new Date().toISOString(),
      tipo: aviso.tipo,
      destinatario: aviso.para,
      numeroDoPedido: pedido.numero,
      texto: textoDoAviso(aviso),
    }

    const guarda = armazenamento()
    if (guarda) {
      try {
        guarda.setItem(CHAVE_AVISOS, JSON.stringify([...lerRegistro(), registro]))
      } catch {
        // Sem espaço ou sem permissão: o registro se perde, e o fluxo segue.
      }
    }

    // `enviado: true` diz que a simulação registrou o aviso, e o canal
    // `'simulado'` diz que nada saiu daqui. Quem chama mostra isso na tela —
    // não existe confirmação de entrega para dar, porque não houve entrega.
    return { enviado: true, canal: 'simulado' }
  },
}

/** Alimenta a tela do painel que mostra "o que teria sido enviado". */
export const listarAvisos = (): AvisoRegistrado[] =>
  // Mais recentes primeiro, igual ao painel de pedidos.
  lerRegistro().sort((a, b) => Date.parse(b.data) - Date.parse(a.data))

export const limparAvisos = (): void => {
  const guarda = armazenamento()
  if (!guarda) return

  try {
    guarda.removeItem(CHAVE_AVISOS)
  } catch {
    // Sem armazenamento não há o que limpar.
  }
}
