import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'



/**
 * O painel dela monta.
 *
 * Parece pouco para um teste, e é o que faltava em 01/09: uma limpeza de
 * código morto levou junto a lista de indicadores, e o painel inteiro
 * virou "This page couldn't load" — a tela branca do navegador, sem
 * mensagem nenhuma para ela entender.
 *
 * Nada acusou. O `npm run build` passou, o lint passou, e os 736 testes
 * passaram, porque nenhum deles chegava a montar este arquivo. Quem
 * descobriu foi o teste de navegação no CI, que só roda com a senha dela
 * configurada: na minha máquina ele é pulado, então subi quebrado duas
 * vezes.
 *
 * Este teste fecha essa distância. Ele monta o componente de verdade, o
 * que basta para estourar qualquer nome que sumiu, e não depende de
 * senha nenhuma para rodar.
 *
 * ── Por que os filhos entram falsos ────────────────────────────────────
 *
 * As abas puxam banco e desenham gráfico. Nada disso importa aqui: o que
 * se protege é o corpo deste arquivo, que é onde a limpeza mexeu. Filho
 * falso deixa o teste rápido e sem rede, e continua estourando o erro que
 * interessa.
 */

const temBanco = vi.fn(() => false)

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => temBanco(),
  donaDaVez: async () => null,
}))

/* Os gráficos usam canvas, que o jsdom não tem. */
vi.mock('./painel/GraficosVisaoGeral', () => ({
  VendasPorDia: () => <div />,
  ProporcaoLinhas: () => <div />,
  MaisVendidos: () => <div />,
}))

/* O cartão de visitas fala com o Supabase assim que monta. */
vi.mock('@/dados/visitasNoBanco', () => ({
  movimentoDaLoja: async () => null,
}))

const { default: AdminDashboard } = await import('./AdminDashboard')

beforeEach(() => {
  temBanco.mockReturnValue(false)
})

describe('o painel da Vivian', () => {
  it('monta sem estourar', () => {
    /* Se algum nome usado lá dentro não existir mais, o render levanta
       ReferenceError aqui, e não no navegador dela. */
    expect(() => render(<AdminDashboard />)).not.toThrow()
  })

  it('mostra os números da visão geral', () => {
    /* Os rótulos são o que ela lê ao abrir. Sumir com a lista que os
       alimenta foi exatamente o defeito de 01/09, e passou por build,
       lint e bateria inteira sem ninguém notar. */
    render(<AdminDashboard />)

    expect(screen.getByText(/esperando você/i)).toBeInTheDocument()
    expect(screen.getByText(/vendas do mês/i)).toBeInTheDocument()
  })

  it('avisa que os números do topo são de exemplo', () => {
    /* Enquanto a loja não vender, a visão geral mostra números de mostruário.
       Os gráficos já dizem "exemplo" em cima; os quatro cartões do topo não
       diziam, e são justamente os maiores da tela: ela abria o painel e lia
       "VENDAS DO MÊS R$ 16.768,00" como venda dela.

       Um selo a menos aqui não é detalhe de acabamento. É a diferença entre
       ela conferir o próprio faturamento e ela conferir o meu mostruário. */
    const { container } = render(<AdminDashboard />)

    const cartoes = container.querySelectorAll('.kpi-card')
    expect(cartoes.length).toBe(4)

    cartoes.forEach((cartao) => {
      expect(cartao.querySelector('.selo-exemplo')).not.toBeNull()
    })
  })
})

/**
 * A Visão Geral com a loja no ar.
 *
 * Esta é a primeira tela que ela vê ao entrar, e até 12/09 ela era
 * inteira de mentira: quatro números de mostruário, gráficos de vendas
 * que nunca aconteceram, uma fila de produção inventada e uma tabela de
 * pedidos de gente que não existe. O selo "exemplo" ajudava, mas selo em
 * tela inteira não resolve, foi o que fez a Vivian perguntar se aquilo
 * ia zerar quando entrasse venda de verdade.
 *
 * Não ia. Nada daquilo está no banco dela, que tem zero pedidos: está
 * escrito no código. A regra passa a ser a mesma do resto do painel, com
 * banco ligado não se mostra número inventado, mostra-se o que há.
 *
 * Os dois botões que mentiam saem junto, e são o pior pedaço. "Lançar
 * venda" fabricava um pedido de R$ 150 com número sorteado e dizia
 * "registrada com sucesso", sem gravar nada em lugar nenhum. "Agendar"
 * dizia que o post tinha ido para o Instagram dela. Tela que confirma o
 * que não fez é pior do que botão que não faz nada, porque ela para de
 * conferir.
 */
describe('a visão geral, com a loja no ar', () => {
  beforeEach(() => {
    temBanco.mockReturnValue(true)
  })

  it('não mostra número de mostruário nenhum', () => {
    const { container } = render(<AdminDashboard />)

    expect(container.querySelectorAll('.kpi-card').length).toBe(0)
    expect(container.querySelectorAll('.selo-exemplo').length).toBe(0)
    expect(screen.queryByText(/16\.768/)).toBeNull()
  })

  it('não oferece lançar venda, que não gravava nada', () => {
    render(<AdminDashboard />)

    expect(screen.queryByRole('button', { name: /Lançar venda/ })).toBeNull()
  })

  it('não oferece agendar post, que não ia para o Instagram', () => {
    render(<AdminDashboard />)

    expect(screen.queryByText(/Post sugerido/)).toBeNull()
  })

  it('diz que ainda não houve venda, em vez de inventar uma', () => {
    render(<AdminDashboard />)

    expect(screen.getByText(/Nenhuma venda ainda/)).toBeInTheDocument()
  })

  it('mostra o movimento da loja, que é dado de verdade', () => {
    render(<AdminDashboard />)

    // A contagem de visita já está no ar e é medida real: é a única coisa
    // que esta tela tem para contar antes da primeira venda.
    expect(screen.getByText('Quem entrou na loja')).toBeInTheDocument()
  })

  it('continua deixando ela abrir a loja e cadastrar produto', () => {
    render(<AdminDashboard />)

    // Cortar o que mente não pode cortar o que funciona.
    expect(screen.getByRole('button', { name: /Novo produto/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ver a loja/ })).toBeInTheDocument()
  })
})
