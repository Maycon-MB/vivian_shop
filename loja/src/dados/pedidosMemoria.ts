import type { Pedido } from '@/dominio/pedido'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA } from '@/dominio/linhas'

/**
 * Pedidos de exemplo, para desenhar e validar as telas do painel antes de
 * existir banco.
 *
 * Os nomes são fictícios de propósito e estão marcados como exemplo — o
 * painel da cliente não deve exibir gente inventada como se fosse venda
 * real.
 *
 * A lista cobre os quatro casos que mudam o comportamento da tela: pedido
 * digital já entregue, pedido em produção, pedido pronto para postar e
 * pedido já enviado com rastreio.
 */
const EXEMPLOS: Pedido[] = [
  {
    id: 'p4',
    numero: '0004',
    linha: LINHA_PERSONALIZADA,
    estado: 'pronto_para_envio',
    criadoEm: '2026-08-09',
    prometidoPara: '2026-08-16',
    clienteNome: 'Exemplo — Ana Souza',
    clienteEmail: 'exemplo@email.com',
    clienteWhatsapp: '(21) 90000-0000',
    itens: [{ produtoId: 'exemplo-1', nome: 'Caderno personalizado', preco: 32, quantidade: 10 }],
    subtotal: 320,
    frete: 28.9,
    total: 348.9,
    endereco: {
      cep: '20000-000',
      logradouro: 'Rua de Exemplo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
    },
    transportadora: 'Correios PAC',
  },
  {
    id: 'p3',
    numero: '0003',
    linha: LINHA_PERSONALIZADA,
    estado: 'em_producao',
    criadoEm: '2026-08-10',
    prometidoPara: '2026-08-17',
    clienteNome: 'Exemplo — Beatriz Lima',
    clienteEmail: 'exemplo@email.com',
    clienteWhatsapp: '(21) 90000-0000',
    itens: [
      { produtoId: 'exemplo-2', nome: 'Cartela de adesivos escolares', preco: 18, quantidade: 10 },
      { produtoId: 'exemplo-3', nome: 'Bloco de anotações', preco: 24, quantidade: 10 },
    ],
    subtotal: 420,
    frete: 32.5,
    total: 452.5,
    endereco: {
      cep: '30000-000',
      logradouro: 'Avenida de Exemplo',
      numero: '2000',
      complemento: 'sala 12',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte',
      uf: 'MG',
    },
    transportadora: 'Jadlog .Package',
  },
  {
    id: 'p2',
    numero: '0002',
    linha: LINHA_PEDAGOGICA,
    estado: 'entregue_digital',
    criadoEm: '2026-08-10',
    clienteNome: 'Exemplo — Carla Menezes',
    clienteEmail: 'exemplo@email.com',
    clienteWhatsapp: '(21) 90000-0000',
    itens: [
      { produtoId: 'exemplo-4', nome: 'Apostila de alfabetização adaptada', preco: 47, quantidade: 1 },
    ],
    subtotal: 47,
    frete: 0,
    total: 47,
  },
  {
    id: 'p1',
    numero: '0001',
    linha: LINHA_PERSONALIZADA,
    estado: 'enviado',
    criadoEm: '2026-08-05',
    prometidoPara: '2026-08-12',
    clienteNome: 'Exemplo — Daniela Rocha',
    clienteEmail: 'exemplo@email.com',
    clienteWhatsapp: '(21) 90000-0000',
    itens: [{ produtoId: 'exemplo-1', nome: 'Caderno personalizado', preco: 32, quantidade: 20 }],
    subtotal: 640,
    frete: 41.2,
    total: 681.2,
    endereco: {
      cep: '01000-000',
      logradouro: 'Rua de Exemplo',
      numero: '55',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    transportadora: 'Correios SEDEX',
    rastreio: 'AA123456789BR',
  },
]

export const listarPedidos = async (): Promise<Pedido[]> => EXEMPLOS

export const buscarPedido = async (id: string): Promise<Pedido | null> =>
  EXEMPLOS.find((pedido) => pedido.id === id) ?? null

export const PEDIDOS_EXEMPLO = EXEMPLOS
