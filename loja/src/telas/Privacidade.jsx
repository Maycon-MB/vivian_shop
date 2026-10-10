'use client'

import React from 'react'
import Link from 'next/link'
import { Container, Row, Col } from 'react-bootstrap'

const ATUALIZADA_EM = '10 de outubro de 2026'

const LinkDaConversa = () => (
  <Link href="/?conversa=1" prefetch={false}>
    conversa da loja
  </Link>
)

const NO_NAVEGADOR = [
  'O carrinho, para os produtos não sumirem se você fechar a aba.',
  'A sessão de login, se você entrar na sua conta, para não pedir a senha toda vez.',
  'A chave da conversa, se você abrir a conversa da loja, para a resposta aparecer quando você voltar.',
  'Uma marca de visita, que só diz se esta é a primeira página da visita. Ela some quando você fecha a aba.',
]

const DIREITOS = [
  'Confirmar se a loja tem dados seus.',
  'Ver os dados que a loja tem sobre você.',
  'Corrigir o que estiver errado, incompleto ou desatualizado.',
  'Pedir para apagar os seus dados, quando a lei permitir. O que a lei manda guardar, como o registro de uma venda, fica pelo prazo dela.',
  'Receber uma cópia dos seus dados para levar a outro fornecedor (portabilidade).',
  'Saber com quem a loja compartilha os seus dados. A lista está acima.',
  'Retirar o consentimento da sua avaliação, e ela sai do ar.',
]

const Privacidade = () => (
  <div className="politica privacidade">
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <header className="politica-topo">
            <h1>Política de privacidade</h1>
            <p>
              Aqui você vê, em palavras simples, quais dados seus a loja guarda, para que servem,
              quem mais recebe e como pedir para ver, corrigir ou apagar.
            </p>
            <p>
              Ela segue a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). As regras de
              compra, troca e direitos autorais estão na{' '}
              <Link href="/politicas/">Política da loja</Link>.
            </p>
          </header>

          <section className="politica-bloco">
            <h2>Quem cuida dos seus dados</h2>
            {/* TODO: CNPJ e razão social entram aqui quando a loja tiver. */}
            <p>
              Quem cuida dos seus dados é a loja Feito para você! Personalizados. A lei chama isso
              de controladora: é quem decide o que é guardado e para quê.
            </p>
            <p>
              Para qualquer assunto sobre os seus dados, fale com a loja pela <LinkDaConversa />. É
              o mesmo lugar das dúvidas sobre pedidos.
            </p>
            <p>
              Por ser um negócio pequeno, a loja não tem um encarregado de dados: a Autoridade
              Nacional de Proteção de Dados (ANPD) dispensa negócios desse porte. O canal para
              esses pedidos é a conversa da loja.
            </p>
          </section>

          <section className="politica-bloco">
            <h2>O que a loja guarda e para quê</h2>
            <ul className="politica-lista itens">
              <li>
                <strong>Quando você compra:</strong> nome, e-mail e WhatsApp, o que você comprou e
                quanto pagou. Nos produtos que vão pelo correio, também o endereço de entrega.
                Servem para fazer, enviar e acompanhar o seu pedido, e para falar com você sobre
                ele.
              </li>
              <li>
                <strong>Quando você cria uma conta:</strong> nome, e-mail e senha. A senha fica com
                o serviço de login, guardada de um jeito que nem a loja consegue ler. A conta serve
                para você ver os seus pedidos. Por segurança, o serviço de login também registra o
                endereço de internet (IP) e o navegador usados para entrar.
              </li>
              <li>
                <strong>Quando você escreve para a loja:</strong> nome, e-mail e a sua mensagem,
                para a loja responder você. A loja recebe um aviso por e-mail com esses dados, e a
                resposta chega no seu e-mail.
              </li>
              <li>
                <strong>Quando você avalia um produto:</strong> o seu primeiro nome, a nota e o que
                você escreveu. A avaliação só aparece na loja depois que a loja aprova. Cerca de 14
                dias depois de um pedido pago, a loja manda um e-mail, uma vez só, convidando você
                a avaliar.
              </li>
              <li>
                <strong>Quando você paga:</strong> quem cobra é o Mercado Pago. Os dados do cartão
                você digita nos campos dele, e o número do cartão nunca passa pela loja. O CPF
                pedido no pagamento vai para o Mercado Pago junto com a cobrança. A loja recebe de
                volta e guarda o comprovante do pagamento, que pode trazer o CPF e alguns números
                do cartão, nunca o número inteiro.
              </li>
              <li>
                <strong>Quando você visita a loja:</strong> a loja conta quantas vezes cada página
                foi aberta, por dia e por origem (por exemplo, Instagram ou Google). São só números
                somados, sem cookie, e nada identifica quem visitou.
              </li>
            </ul>

            <p>
              <strong>Por que a loja pode usar esses dados.</strong> A LGPD (art. 7º) lista os
              motivos que permitem usar dado pessoal. Aqui valem quatro:
            </p>
            <ul className="politica-lista itens">
              <li>
                <strong>Para cumprir o que você pediu:</strong> fazer, enviar e acompanhar o
                pedido, manter a sua conta e responder as suas dúvidas antes de comprar (art. 7º,
                V).
              </li>
              <li>
                <strong>Para cumprir a lei</strong>, que manda guardar os registros de venda (art.
                7º, II).
              </li>
              <li>
                <strong>Com o seu consentimento</strong>, para publicar a sua avaliação (art. 7º,
                I). Você pode retirar quando quiser.
              </li>
              <li>
                <strong>Por interesse legítimo da loja</strong>, para mandar um único convite para
                avaliar o que você comprou (art. 7º, IX).
              </li>
            </ul>
            <p>A contagem de visita não usa dado pessoal.</p>
          </section>

          <section className="politica-bloco">
            <h2>Quem recebe os seus dados</h2>
            <p>
              A loja não vende os seus dados e não usa rastreamento de propaganda. Eles vão só
              para os serviços que fazem a loja funcionar, e cada um recebe só o que precisa:
            </p>
            <ul className="politica-lista itens">
              <li>
                <strong>Supabase:</strong> guarda o banco de dados da loja (pedidos, contas,
                conversas e avaliações) e cuida do login. O banco fica em São Paulo.
              </li>
              <li>
                <strong>Mercado Pago:</strong> faz a cobrança. Recebe o valor, o seu e-mail e os
                dados de pagamento.
              </li>
              <li>
                <strong>Resend:</strong> manda os e-mails da loja: os avisos de mensagem e de venda
                para a loja, o link para confirmar a conta ou trocar a senha, e o convite para
                avaliar. Fica nos Estados Unidos.
              </li>
              <li>
                <strong>Melhor Envio:</strong> calcula o frete. Recebe só o CEP da loja, o seu CEP e
                o tamanho do pacote.
              </li>
              <li>
                <strong>Correios ou Jadlog:</strong> entregam o pacote, com o seu nome e o endereço
                na etiqueta.
              </li>
              <li>
                <strong>GitHub:</strong> publica o site da loja e guarda a cópia de segurança
                diária do banco, cifrada com uma chave que o GitHub não tem. Fica nos Estados
                Unidos e, como todo serviço de site, registra o endereço de internet (IP) de quem
                visita, por segurança.
              </li>
              <li>
                <strong>Quem mantém o site para a loja:</strong> pode ver os dados só para fazer a
                loja funcionar e cuidar das cópias de segurança.
              </li>
            </ul>
            <p>
              Resend e GitHub ficam nos Estados Unidos, então parte dos seus dados sai do Brasil.
              Cada serviço segue também a própria política de privacidade.
            </p>
          </section>

          <section className="politica-bloco">
            <h2>O que fica no seu navegador</h2>
            <p>
              A loja não usa cookies de rastreamento nem de propaganda. No seu navegador, ela
              guarda só isto:
            </p>
            <ul className="politica-lista itens">
              {NO_NAVEGADOR.map((linha) => (
                <li key={linha}>{linha}</li>
              ))}
            </ul>
            <p>
              Você pode apagar tudo isso limpando os dados do site no seu navegador. Na hora de
              pagar, o formulário do Mercado Pago roda dentro da página e segue as regras de
              privacidade dele.
            </p>
          </section>

          <section className="politica-bloco">
            <h2>Por quanto tempo</h2>
            <ul className="politica-lista itens">
              <li>
                <strong>Pedidos:</strong> pelo tempo que a lei exige para guardar os registros de
                venda.
              </li>
              <li>
                <strong>Conta e conversa:</strong> até você pedir para apagar. Só fica o que a lei
                obriga a guardar, como o registro das suas compras.
              </li>
              <li>
                <strong>Avaliação:</strong> até você pedir para tirar.
              </li>
              <li>
                <strong>Cópias de segurança:</strong> cada cópia é apagada sozinha depois de 30
                dias. Um dado apagado do banco some das cópias nesse prazo.
              </li>
            </ul>
          </section>

          <section className="politica-bloco">
            <h2>Seus direitos</h2>
            <p>Pela LGPD (art. 18), você pode:</p>
            <ul className="politica-lista itens">
              {DIREITOS.map((direito) => (
                <li key={direito}>{direito}</li>
              ))}
            </ul>
            <p>
              <strong>Como pedir:</strong> escreva pela <LinkDaConversa />, com o mesmo e-mail que
              você usou na compra ou na conta. Antes de mostrar ou mudar qualquer coisa, a loja
              pode pedir para confirmar que os dados são seus. A resposta vem em até 15 dias.
            </p>
            <p>Se a resposta não resolver, você pode reclamar na ANPD, pelo site gov.br/anpd.</p>
          </section>

          <section className="politica-bloco">
            <h2>Crianças</h2>
            <p>
              As compras são feitas por adultos. A loja não pede cadastro nem dados de crianças.
              Quando uma peça personalizada leva o nome e a idade de uma criança, quem informa é o
              adulto que compra, e esses dados servem só para fazer a peça.
            </p>
          </section>

          <section className="politica-bloco">
            <h2>Mudanças nesta política</h2>
            <p>
              Se a loja mudar o jeito de cuidar dos seus dados, esta página muda junto, e a data
              abaixo também.
            </p>
            <p>Última atualização: {ATUALIZADA_EM}.</p>
          </section>
        </Col>
      </Row>
    </Container>
  </div>
)

export default Privacidade
