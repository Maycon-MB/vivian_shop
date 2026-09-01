import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import AdminDashboard from './AdminDashboard'

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

vi.mock('@/servicos/autenticacao', () => ({
  temBanco: () => false,
  donaDaVez: async () => null,
}))

/* Os gráficos usam canvas, que o jsdom não tem. */
vi.mock('./painel/GraficosVisaoGeral', () => ({
  VendasPorDia: () => <div />,
  ProporcaoLinhas: () => <div />,
  MaisVendidos: () => <div />,
}))

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
