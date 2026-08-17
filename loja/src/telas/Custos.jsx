'use client'

import React from 'react'
import Link from 'next/link'
import { Container } from 'react-bootstrap'
import { Check, AlertCircle, Info } from 'lucide-react'

/**
 * O que a loja custa, explicado para a Vivian.
 *
 * Existe porque eu quase deixei ela assinar um contrato acreditando que a
 * loja custaria R$ 100 por mês para sempre. Não custa: a vitrine é de
 * graça, mas guardar pedido, senha e arquivo é um serviço que começa
 * gratuito e passa a custar quando o movimento cresce.
 *
 * Falar isso agora é chato. Falar daqui a oito meses, quando a cobrança
 * aparecer, é pior — ela se sentiria enganada, e com razão.
 *
 * A página é escrita para ela ler sozinha, num sábado, sem eu do lado
 * explicando. Por isso cada número vem com a conta que o gerou.
 */

const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

/* Plano gratuito do Supabase em agosto de 2026. Os limites mudam, e por
   isso a página mostra a conta, e não só o resultado. */
const TRANSFERENCIA_GRATIS_MB = 5120

const TAMANHOS = [5, 15, 30]

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
                Começa de graça. Passa a custar cerca de {moeda(130)} por mês só quando o
                movimento crescer — e é sobre isso que fala o resto desta página.
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
            mesmo vale para a sua senha do painel, para o estoque e para os arquivos do
            material pedagógico.
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

        {/* ── O material digital ───────────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>Quem decide o custo é o material pedagógico</h2>
          <p>
            O que pesa não é guardar o arquivo — é <strong>entregar</strong>. Cada vez que uma
            cliente baixa uma apostila, aquele arquivo trafega inteiro. O plano gratuito dá 5 GB
            de tráfego por mês.
          </p>

          <table className="custos-tabela">
            <thead>
              <tr>
                <th>Se sua apostila pesar</th>
                <th>Downloads por mês antes de passar do gratuito</th>
              </tr>
            </thead>
            <tbody>
              {TAMANHOS.map((mb) => (
                <tr key={mb}>
                  <td>{mb} MB</td>
                  <td>
                    <strong>{Math.floor(TRANSFERENCIA_GRATIS_MB / mb)}</strong> downloads
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="custos-nota">
            <Info size={16} /> Por isso eu perguntei quanto pesam os seus arquivos. Se
            estiverem pesados, quase sempre dá para deixar mais leves sem perder nada na
            impressão — e aí esses números multiplicam.
          </p>
        </section>

        {/* ── Quando começa a pagar ────────────────────────────────────── */}
        <section className="custos-bloco">
          <h2>E se passar do gratuito?</h2>
          <p>
            Aí o serviço passa a custar cerca de {moeda(130)} por mês. Mas repare no que isso
            significa: para passar do limite com apostilas de 15 MB, você precisaria vender{' '}
            <strong>mais de 340 materiais digitais por mês</strong>.
          </p>
          <p className="custos-destaque">
            <Check size={18} /> A {moeda(29.99)} cada, isso é mais de {moeda(10000)} num mês só
            de material digital. Os {moeda(130)} seriam pouco mais de 1% disso.
          </p>
          <p>
            O custo só aparece quando a loja já está pagando ele com folga. E, mesmo assim,{' '}
            <strong>nada é contratado sem você autorizar</strong> — está escrito no contrato.
            Eu aviso antes, com o valor, e a decisão é sua.
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
                <td>Se o digital passar de ~340 downloads/mês</td>
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
