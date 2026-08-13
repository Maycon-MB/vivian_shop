'use client'

import { useState } from 'react'
import { pagamento, frete, avisos, pedidos } from '@/servicos'

/**
 * A compra, do clique em pagar até o pedido existir.
 *
 * Fica separada da tela por dois motivos. O primeiro é que a sequência é
 * longa — cobrar, guardar, avisar — e cada passo pode falhar de um jeito
 * diferente, o que dentro de um componente vira um emaranhado. O segundo é
 * que essa sequência não muda quando o Mercado Pago entrar: só troca quem
 * cumpre o contrato de pagamento.
 *
 * A ordem importa e não é acidental: cobra primeiro, guarda depois. Se
 * gravasse o pedido antes de cobrar, uma recusa deixaria pedido fantasma
 * no painel da Vivian — ela veria venda que não existiu.
 */

const gerarToken = () =>
  Array.from({ length: 24 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join('')

const emSeteDias = () => {
  const data = new Date()
  data.setDate(data.getDate() + 7)
  return data.toISOString().slice(0, 10)
}

const emDiasUteis = (dias) => {
  const data = new Date()
  let restantes = dias
  while (restantes > 0) {
    data.setDate(data.getDate() + 1)
    const diaDaSemana = data.getDay()
    if (diaDaSemana !== 0 && diaDaSemana !== 6) restantes -= 1
  }
  return data.toISOString().slice(0, 10)
}

/* O nome começa com `use` porque é exigência do React: só assim as regras
   de hooks são verificadas neste arquivo. É a única concessão ao inglês
   no código do projeto, e ela existe para a ferramenta poder pegar erro. */
export function useCompra() {
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState(null)

  /** Cota o frete de verdade a partir do peso e das medidas do pacote. */
  const cotarFrete = async (cep, itens) => {
    const pesoTotal = itens.reduce((soma, item) => soma + (item.pesoG ?? 4000) * item.quantidade / (item.minimo || 10), 0)
    const maior = itens[0] ?? {}

    return frete.cotar({
      cepDestino: cep,
      pesoG: Math.max(Math.round(pesoTotal), 300),
      altCm: maior.altCm ?? 20,
      largCm: maior.largCm ?? 30,
      compCm: maior.compCm ?? 30,
    })
  }

  /**
   * Devolve o pedido criado, ou null se algo impediu. Em caso de recusa,
   * `erro` carrega o que houve e o que a pessoa faz agora — a tela só
   * precisa mostrar.
   */
  const finalizar = async ({ itens, comprador, endereco, opcaoFrete, meio, linha, subtotal, desconto }) => {
    setErro(null)
    setProcessando(true)

    try {
      const valorFrete = opcaoFrete?.valor ?? 0
      const total = subtotal + valorFrete - desconto

      const resultado = await pagamento.cobrar({ valor: total, meio, comprador })

      if (!resultado.aprovado) {
        setErro({ titulo: resultado.motivo, saida: resultado.comoResolver })
        return null
      }

      const digital = !endereco

      const pedido = await pedidos.salvar({
        id: '',
        numero: '',
        linha,
        criadoEm: new Date().toISOString(),
        comprador,
        itens: itens.map((item) => ({
          produtoId: item.id,
          nome: item.name ?? item.nome,
          precoUnitario: item.price ?? item.preco,
          quantidade: item.quantidade,
        })),
        subtotal,
        frete: valorFrete,
        desconto,
        total,
        meioDePagamento: meio,
        estadoPagamento: 'aprovado',
        endereco: endereco ?? undefined,
        transportadora: opcaoFrete ? `${opcaoFrete.transportadora} ${opcaoFrete.servico}` : undefined,
        prometidoPara: digital ? undefined : emDiasUteis(5 + (opcaoFrete?.prazoDias ?? 0)),
        tokenDownload: digital ? gerarToken() : undefined,
        expiraEm: digital ? emSeteDias() : undefined,
      })

      // O aviso vem depois de o pedido existir: avisar sobre pedido que
      // não foi guardado seria prometer o que ninguém consegue consultar.
      await avisos.enviar({
        tipo: digital ? 'material-digital' : 'pedido-confirmado',
        para: comprador,
        pedido,
      })

      return pedido
    } catch (falha) {
      setErro({
        titulo: 'Não conseguimos concluir a compra agora.',
        saida:
          'Nada foi cobrado. Tente de novo em alguns instantes, ou me chame no WhatsApp que eu resolvo por lá.',
      })
      console.error('falha ao finalizar a compra:', falha)
      return null
    } finally {
      setProcessando(false)
    }
  }

  return { finalizar, cotarFrete, processando, erro, limparErro: () => setErro(null) }
}
