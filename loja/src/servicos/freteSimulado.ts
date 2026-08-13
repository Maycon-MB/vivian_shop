/**
 * Frete de mentira, com contas de verdade.
 *
 * A conta do Melhor Envio ainda não foi contratada, mas o checkout não pode
 * ficar esperando por isso: sem opção de entrega não dá para fechar pedido, e
 * sem fechar pedido não dá para mostrar a loja funcionando. Então este arquivo
 * cumpre o contrato `ServicoDeFrete` calculando por conta própria.
 *
 * O que é fiel à realidade aqui é a *regra*: transportadora cobra pelo maior
 * entre o peso na balança e o peso cubado, e cobra mais quanto mais longe. O
 * que é aproximação são os *números* — as tarifas e os prazos abaixo foram
 * escolhidos para ficarem plausíveis num orçamento, não copiados de tabela
 * oficial dos Correios ou da Jadlog. Não use isto para prometer prazo a
 * cliente antes de o serviço real entrar.
 *
 * Quando o Melhor Envio entrar, ele responde com as opções que as próprias
 * transportadoras devolvem, e este arquivo some inteiro. As telas não mudam:
 * elas só sabem que recebem uma lista de `OpcaoDeFrete`.
 */

import type {
  ConsultaDeFrete,
  OpcaoDeFrete,
  ServicoDeFrete,
} from '@/servicos/contratos'

/** Tempo de resposta parecido com o de uma cotação de verdade. */
const ESPERA_MS = 600

/**
 * Divisor do peso cubado dos Correios. É regra real: altura × largura ×
 * comprimento, em centímetros, dividido por 6000, dá o peso em quilos que a
 * transportadora vai considerar. Serve para caixa grande e leve — travesseiro,
 * peça de crochê volumosa — não viajar quase de graça ocupando o caminhão.
 */
const DIVISOR_DO_PESO_CUBADO = 6000

/** Abaixo disso ninguém cobra: caixa minúscula ainda ocupa lugar e dá trabalho. */
const PESO_MINIMO_KG = 0.3

interface PerfilDaRegiao {
  /** Quanto o trecho encarece em relação a uma entrega dentro do Sudeste. */
  multiplicador: number
  /** Dias somados ao prazo base de cada serviço. */
  diasExtras: number
}

/**
 * A origem é o Rio de Janeiro — CEP começando com 2, Sudeste. Daí a tabela ser
 * lida a partir do primeiro dígito do CEP de destino: mesma região sai barato,
 * Norte e Nordeste saem caro porque o trecho é longo e tem menos voo e menos
 * caminhão indo para lá.
 *
 * Os números são aproximações plausíveis, não tabela oficial.
 */
const REGIOES_POR_PRIMEIRO_DIGITO: Record<string, PerfilDaRegiao> = {
  // Grande São Paulo e interior de SP — vizinho, muita rota disponível.
  '0': { multiplicador: 1.15, diasExtras: 1 },
  '1': { multiplicador: 1.15, diasExtras: 1 },
  // Rio de Janeiro e Espírito Santo — mesma região da origem.
  '2': { multiplicador: 1, diasExtras: 0 },
  // Minas Gerais — Sudeste, um pouco mais espalhado.
  '3': { multiplicador: 1.2, diasExtras: 1 },
  // Bahia e Sergipe — começo do Nordeste.
  '4': { multiplicador: 1.7, diasExtras: 4 },
  // Pernambuco, Alagoas, Paraíba, Rio Grande do Norte.
  '5': { multiplicador: 1.85, diasExtras: 5 },
  // Ceará, Piauí, Maranhão e todo o Norte — o trecho mais caro e mais demorado.
  '6': { multiplicador: 2.1, diasExtras: 7 },
  // Distrito Federal, Goiás, Tocantins e Centro-Oeste.
  '7': { multiplicador: 1.55, diasExtras: 3 },
  // Paraná e Santa Catarina.
  '8': { multiplicador: 1.45, diasExtras: 2 },
  // Rio Grande do Sul — longe, mas com rota boa.
  '9': { multiplicador: 1.6, diasExtras: 3 },
}

interface Servico {
  id: string
  transportadora: string
  servico: string
  /** Quanto custa só por existir o envio: coleta, etiqueta, manuseio. */
  taxaBase: number
  precoPorKg: number
  prazoBaseDias: number
}

/**
 * Três opções porque é o que ajuda a decidir: uma barata e lenta, uma cara e
 * rápida, e uma no meio. Mais que isso vira tabela e a pessoa desiste.
 */
const SERVICOS: Servico[] = [
  {
    id: 'pac',
    transportadora: 'Correios',
    servico: 'PAC',
    taxaBase: 18.9,
    precoPorKg: 4.2,
    prazoBaseDias: 6,
  },
  {
    id: 'jadlog-package',
    transportadora: 'Jadlog',
    servico: '.Package',
    taxaBase: 24,
    precoPorKg: 5.5,
    prazoBaseDias: 4,
  },
  {
    id: 'sedex',
    transportadora: 'Correios',
    servico: 'SEDEX',
    taxaBase: 32.5,
    precoPorKg: 7.8,
    prazoBaseDias: 2,
  },
]

function esperar(ms: number): Promise<void> {
  return new Promise((resolva) => setTimeout(resolva, ms))
}

/** Gente digita CEP com traço, com ponto e com espaço. Guardamos só os números. */
function apenasNumeros(texto: string): string {
  return texto.replace(/\D/g, '')
}

function paraCentavos(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * O peso que a transportadora vai cobrar: o maior entre o que a balança marca e
 * o peso cubado. Peça pequena e pesada paga pelo peso real; caixa grande e leve
 * paga pelo espaço que ocupa.
 */
function pesoCobravelKg(consulta: ConsultaDeFrete): number {
  const pesoRealKg = consulta.pesoG / 1000
  const pesoCubadoKg =
    (consulta.altCm * consulta.largCm * consulta.compCm) / DIVISOR_DO_PESO_CUBADO

  return Math.max(pesoRealKg, pesoCubadoKg, PESO_MINIMO_KG)
}

export const freteSimulado: ServicoDeFrete = {
  real: false,

  async cotar(consulta: ConsultaDeFrete): Promise<OpcaoDeFrete[]> {
    const cep = apenasNumeros(consulta.cepDestino)

    if (cep.length < 8) {
      throw new Error(
        'O CEP de entrega está incompleto. Escreva os 8 números do CEP, como em 20040-020. Se não souber, procure por "Busca CEP" no site dos Correios.',
      )
    }

    // CEP sem dígito conhecido não deveria acontecer, mas se acontecer é melhor
    // cotar caro do que cotar barato e a artesã pagar a diferença do bolso.
    const regiao = REGIOES_POR_PRIMEIRO_DIGITO[cep[0]] ?? { multiplicador: 2.1, diasExtras: 7 }

    await esperar(ESPERA_MS)

    const pesoKg = pesoCobravelKg(consulta)

    return SERVICOS.map((servico) => ({
      id: servico.id,
      transportadora: servico.transportadora,
      servico: servico.servico,
      valor: paraCentavos(
        (servico.taxaBase + servico.precoPorKg * pesoKg) * regiao.multiplicador,
      ),
      prazoDias: servico.prazoBaseDias + regiao.diasExtras,
    }))
  },
}
