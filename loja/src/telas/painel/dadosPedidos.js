/**
 * Pedidos de exemplo para desenhar e validar a tela.
 *
 * A lista cobre de propósito todos os estados que mudam o comportamento
 * da tela — inclusive os incômodos: pedido atrasado, pagamento que não
 * confirmou e pedido cancelado. Desenhar só com o caminho feliz é como
 * telas quebram na primeira semana real.
 *
 * Os nomes são fictícios e estão marcados como exemplo: o painel da
 * cliente não deve exibir gente inventada como se fosse venda de verdade.
 */

export const ESTADOS = {
  aguardando: {
    rotulo: 'Aguardando pagamento',
    cor: 'neutro',
    explicacao: 'A pessoa fez o pedido mas o pagamento ainda não foi aprovado. Nada a fazer.',
  },
  producao: {
    rotulo: 'Em produção',
    cor: 'atencao',
    explicacao: 'Pago. Está com você para fazer.',
  },
  pronto: {
    rotulo: 'Pronto para enviar',
    cor: 'acao',
    explicacao: 'Produzido. Falta gerar a etiqueta e levar aos Correios.',
  },
  enviado: {
    rotulo: 'A caminho',
    cor: 'ok',
    explicacao: 'Postado. O rastreio já foi para quem comprou.',
  },
  entregue: {
    rotulo: 'Entregue',
    cor: 'ok',
    explicacao: 'Chegou ao destino.',
  },
  digital: {
    rotulo: 'Entregue por e-mail',
    cor: 'ok',
    explicacao: 'Material digital: foi sozinho quando o pagamento aprovou.',
  },
  cancelado: {
    rotulo: 'Cancelado',
    cor: 'problema',
    explicacao: 'O pedido não seguiu.',
  },
}

/** Só estes exigem alguma coisa dela hoje. */
export const PRECISA_DE_ACAO = ['producao', 'pronto']

export const PEDIDOS = [
  {
    id: '0007',
    diasAtras: 6,
    estado: 'pronto',
    linha: 'personalizada',
    cliente: 'Exemplo — Ana Souza',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Caderno personalizado', quantidade: 10, preco: 32 }],
    subtotal: 320,
    frete: 28.9,
    quando: 'há 6 dias',
    prazoDias: 0,
    cidade: 'Rio de Janeiro, RJ',
    transportadora: 'Correios PAC',
  },
  {
    id: '0006',
    diasAtras: 5,
    estado: 'producao',
    linha: 'personalizada',
    cliente: 'Exemplo — Beatriz Lima',
    whatsapp: '(21) 90000-0000',
    itens: [
      { nome: 'Cartela de adesivos escolares', quantidade: 10, preco: 18 },
      { nome: 'Bloco de anotações', quantidade: 10, preco: 24 },
    ],
    subtotal: 420,
    frete: 32.5,
    quando: 'há 5 dias',
    prazoDias: -1,
    cidade: 'Belo Horizonte, MG',
    transportadora: 'Jadlog .Package',
  },
  {
    id: '0005',
    diasAtras: 2,
    estado: 'producao',
    linha: 'personalizada',
    cliente: 'Exemplo — Carla Menezes',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Caneca personalizada', quantidade: 20, preco: 34 }],
    subtotal: 680,
    frete: 41.2,
    quando: 'há 2 dias',
    prazoDias: 3,
    cidade: 'Curitiba, PR',
    transportadora: 'Correios SEDEX',
  },
  {
    id: '0004',
    diasAtras: 0,
    estado: 'digital',
    linha: 'pedagogica',
    cliente: 'Exemplo — Daniela Rocha',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Apostila de alfabetização adaptada', quantidade: 1, preco: 47 }],
    subtotal: 47,
    frete: 0,
    quando: 'hoje, 09:12',
    cidade: 'São Paulo, SP',
  },
  {
    id: '0003',
    diasAtras: 0,
    estado: 'aguardando',
    linha: 'pedagogica',
    cliente: 'Exemplo — Elaine Prado',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Kit rotina visual', quantidade: 1, preco: 39 }],
    subtotal: 39,
    frete: 0,
    quando: 'hoje, 08:40',
    cidade: 'Salvador, BA',
  },
  {
    id: '0002',
    diasAtras: 8,
    estado: 'enviado',
    linha: 'personalizada',
    cliente: 'Exemplo — Fernanda Dias',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Caderno personalizado', quantidade: 20, preco: 32 }],
    subtotal: 640,
    frete: 41.2,
    quando: 'há 8 dias',
    cidade: 'Fortaleza, CE',
    transportadora: 'Correios SEDEX',
    rastreio: 'AA123456789BR',
  },
  {
    id: '0001',
    diasAtras: 14,
    estado: 'entregue',
    linha: 'personalizada',
    cliente: 'Exemplo — Gabriela Nunes',
    whatsapp: '(21) 90000-0000',
    itens: [{ nome: 'Marcador de página', quantidade: 10, preco: 12 }],
    subtotal: 120,
    frete: 22.4,
    quando: 'há 14 dias',
    cidade: 'Porto Alegre, RS',
    transportadora: 'Correios PAC',
    rastreio: 'AA987654321BR',
  },
]

export const totalDe = (pedido) => pedido.subtotal + pedido.frete

/**
 * A data de cada exemplo, contada a partir de hoje.
 *
 * Os exemplos guardam "há quantos dias", e não uma data fixa, porque data
 * fixa envelhece: em seis meses o painel de demonstração mostraria pedidos
 * de meio ano atrás e o fechamento do mês viria vazio.
 */
export const criadoEmDe = (pedido) => {
  const data = new Date()
  data.setDate(data.getDate() - (pedido.diasAtras ?? 0))
  return data.toISOString()
}

export const contarPor = (filtro) =>
  filtro === 'todos'
    ? PEDIDOS.length
    : filtro === 'acao'
      ? PEDIDOS.filter((p) => PRECISA_DE_ACAO.includes(p.estado)).length
      : PEDIDOS.filter((p) => p.estado === filtro).length
