'use client'

import React from 'react'
import Link from 'next/link'
import { Container } from 'react-bootstrap'
import { Check, AlertCircle, Info } from 'lucide-react'

/**
 * O que a loja custa, explicado para a Vivian.
 *
 * Existe porque eu quase deixei ela assinar um contrato acreditando que a
 * loja custaria R$ 100 por mês para sempre. A vitrine é de graça, mas
 * guardar pedido e senha é serviço contratado.
 *
 * A primeira versão desta página assustava à toa: eu tinha assumido que os
 * PDFs do material pedagógico ficariam guardados aqui, e projetei custo de
 * armazenamento e de download em cima disso. Em 18/08 ela explicou que os
 * arquivos ficam no Drive dela e que ela libera acesso por e-mail — então
 * aquele custo nunca vai existir.
 *
 * Falar isso agora é chato. Falar daqui a oito meses, quando a cobrança
 * aparecer, é pior — ela se sentiria enganada, e com razão.
 *
 * A página é escrita para ela ler sozinha, num sábado, sem eu do lado
 * explicando. Por isso cada número vem com a conta que o gerou.
 */

const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function Custos() {
  return (
    <div className="custos">
      <Container className="py-4 py-md-5">
        <header className="custos-topo">
          <p className="custos-etiqueta">Para a Vivian</p>
          <h1>O que a loja custa</h1>
          <p className="custos-intro">
            Escrevi esta página porque quase deixei você acreditar que a loja custaria R$ 100
            por mês para sempre. Não é bem assim, e é melhor você saber agora do que descobrir
            numa fatura daqui a oito meses.
          </p>
        </header>

        {/* ── Hoje ─────────────────────────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Hoje você não paga nada além do combinado</h2>
          <p>
            Enquanto a loja está sendo construída, o único valor é o que a gente combinou:{' '}
            <strong>{moeda(200)} por mês, durante 12 meses</strong>. Nada mais.
          </p>
        </section>

        {/* ── Quando abrir ─────────────────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Quando a loja abrir de verdade</h2>
          <p>Aí passam a existir três coisas, e elas são bem diferentes entre si:</p>

          <ul className="custos-lista">
            <li>
              <strong>O que você me paga</strong>
              <span>
                {moeda(200)} por mês nos 12 primeiros meses. Do 13º em diante, {moeda(100)}.
              </span>
            </li>
            <li>
              <strong>O endereço da loja</strong>
              <span>
                Cerca de {moeda(40)} por ano, pagos uma vez, direto ao registro.br. Dá uns{' '}
                {moeda(3.33)} por mês. Fica no seu nome.
              </span>
            </li>
            <li>
              <strong>O lugar que guarda os pedidos</strong>
              <span>
                De graça, e por muitos anos. Só passa a custar se a loja crescer muito — e o
                resto desta página explica por quê.
              </span>
            </li>
          </ul>
        </section>

        {/* ── Por que existe esse custo ────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Por que esse terceiro custo existe</h2>
          <p>
            As páginas da loja — a vitrine, as fotos, os produtos — são como um folheto: iguais
            para todo mundo, prontas antes de alguém chegar. Isso é de graça, e continua de
            graça mesmo com muita gente visitando.
          </p>
          <p>
            Só que folheto não guarda nada. Quando alguém compra, alguma coisa precisa{' '}
            <strong>gravar aquele pedido</strong> num lugar de onde você possa ler depois. O
            mesmo vale para a sua senha do painel e para o estoque.
          </p>
          <p className="custos-nota">
            <Info size={16} /> Esse lugar é o que a gente chama de banco de dados. É um serviço
            contratado, no seu nome, e o valor depende do quanto ele trabalha.
          </p>
        </section>

        {/* ── Os pedidos ───────────────────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Os pedidos não são o problema</h2>
          <p>
            Cada pedido guardado ocupa mais ou menos o espaço de uma mensagem de texto. No
            plano gratuito cabem <strong>mais de 100 mil pedidos</strong>.
          </p>
          <p className="custos-destaque">
            <Check size={18} /> A 50 pedidos por mês, isso daria para 170 anos.
          </p>
          <p>
            Ou seja: por mais que a papelaria personalizada venda, ela sozinha nunca vai fazer
            você sair do plano gratuito.
          </p>
        </section>

        {/* ── O material digital ───────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>E o material pedagógico?</h2>
          <p>
            Você me explicou como faz: as atividades ficam no seu Drive e você libera o acesso
            para o e-mail de quem compra, por 7 dias.
          </p>
          <p>
            <strong>Vai continuar exatamente assim.</strong> Os arquivos não passam pela loja, e
            por isso não ocupam espaço nem geram custo nenhum aqui.
          </p>
          <p className="custos-destaque">
            <Check size={18} /> A diferença é que a loja vai fazer isso sozinha, na hora do
            pagamento — sem você precisar estar em casa para liberar.
          </p>
          <p className="custos-nota">
            <Info size={16} /> Antes eu tinha imaginado que os arquivos ficariam guardados aqui,
            e cheguei a te perguntar quanto eles pesavam. Do jeito que você faz, essa pergunta
            deixou de existir — e o custo que ela geraria, também.
          </p>
        </section>

        {/* ── Quando começa a pagar ────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Então quando isso passa a custar?</h2>
          <p>
            Sobrando só texto para guardar — pedidos, cadastro, produtos —, o plano gratuito
            leva <strong>muitos anos</strong> para encher. Não é uma preocupação para agora nem
            para o ano que vem.
          </p>
          <p>
            Se um dia chegar lá, o serviço passa a custar cerca de {moeda(130)} por mês. Mas
            para isso você já estaria vendendo num volume em que esse valor é pequeno.
          </p>
          <p>
            E, de qualquer forma, <strong>nada é contratado sem você autorizar</strong> — está
            escrito no contrato. Eu aviso antes, com o valor, e a decisão é sua.
          </p>
        </section>

        {/* ── O resumo honesto ─────────────────────────────────────────── */}
        <section className="custos-bloco custos-resumo">
          <h2>O resumo</h2>

          <table className="custos-tabela">
            <thead>
              <tr>
                <th>Momento</th>
                <th>Quanto sai por mês</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Agora, construindo</td>
                <td>{moeda(200)}</td>
              </tr>
              <tr>
                <td>Loja aberta, primeiro ano</td>
                <td>{moeda(203)}</td>
              </tr>
              <tr>
                <td>A partir do 13º mês</td>
                <td>
                  <strong>{moeda(103)}</strong>
                </td>
              </tr>
              <tr>
                <td>Se um dia o banco encher (muitos anos)</td>
                <td>cerca de {moeda(233)}</td>
              </tr>
            </tbody>
          </table>

          <p className="custos-aviso">
            <AlertCircle size={16} /> Estes valores são de agosto de 2026 e podem mudar, porque
            dependem de empresas que não são nem minhas nem suas. Se mudarem, eu te aviso antes
            de qualquer cobrança.
          </p>
        </section>

        <Link href="/perguntas/" className="custos-voltar" prefetch={false}>
          Voltar para as perguntas
        </Link>
      </Container>
    </div>
  )
}
