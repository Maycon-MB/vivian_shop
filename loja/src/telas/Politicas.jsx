'use client'

import React from 'react'
import Link from 'next/link'
import { Container, Row, Col } from 'react-bootstrap'

/**
 * As políticas da loja, escritas por ela.
 *
 * A Vivian mandou este texto inteiro em 30/08, pronto, e pediu que
 * entrasse na loja. **O texto é dela e está aqui palavra por palavra.**
 * Não resumi, não reescrevi e não "melhorei" nada: são as regras de
 * direito autoral e de troca do negócio dela, e quem responde por elas se
 * uma cliente reclamar é ela, não eu.
 *
 * A única coisa que fiz foi separar em seções e dar hierarquia, que é o
 * que faz um texto de duas mil palavras ser lido em vez de ignorado.
 *
 * ── Por que uma página, e não um acordeão no rodapé ────────────────────
 *
 * Política que a cliente precisa procurar não protege ninguém. Se um dia
 * houver discussão sobre devolução de arquivo digital, o que vale é ela
 * conseguir mostrar onde estava escrito, com endereço próprio, e não um
 * bloco escondido atrás de um clique.
 *
 * É também para onde aponta o cartão "Antes de finalizar sua compra" da
 * página inicial, que carrega só o primeiro parágrafo.
 */

const NAO_PODE = [
  'Alterar, copiar, modificar ou adaptar os arquivos digitais para revenda, redistribuição ou comercialização como arquivos digitais.',
  'Alterar cores, fontes, textos, idioma ou outros elementos dos arquivos com a finalidade de criar uma nova versão para comercialização.',
  'Copiar, revender, repassar, doar, compartilhar, disponibilizar em grupos, sites, plataformas, redes sociais ou qualquer outro meio os arquivos digitais adquiridos.',
  'Comercializar o arquivo digital adquirido separadamente ou incluí-lo em qualquer produto que permita que terceiros tenham acesso ao arquivo original.',
  'Utilizar os arquivos adquiridos como base para criar e comercializar novos produtos digitais.',
]

const PODE = [
  'Utilizar os arquivos digitais adquiridos para uso pessoal.',
  'Adaptar o tamanho do arquivo para impressão, quando tecnicamente possível, sem alterar sua identidade visual.',
]

const Politicas = () => (
  <div className="politica">
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
    <header className="politica-topo">
      <h1>Política da loja</h1>
      <p>
        Na Feito para Você Papelaria Personalizada, queremos proporcionar uma experiência
        de compra segura, transparente e agradável para nossos clientes.
      </p>
      <p>
        Para garantir o bom uso dos nossos produtos e preservar os direitos autorais dos
        materiais produzidos pela loja, confira atentamente nossa política abaixo. Em caso
        de dúvidas, entre em contato conosco antes de realizar sua compra.
      </p>
    </header>

    <section className="politica-bloco">
      <h2>Você pode</h2>
      <ul className="politica-lista pode">
        {PODE.map((linha) => (
          <li key={linha}>{linha}</li>
        ))}
      </ul>

      <h2>Você não pode</h2>
      <ul className="politica-lista nao-pode">
        {NAO_PODE.map((linha) => (
          <li key={linha}>{linha}</li>
        ))}
      </ul>
    </section>

    <section className="politica-bloco">
      <h2>Atenção aos direitos autorais</h2>
      <p>
        Os arquivos digitais disponibilizados pela Feito para Você Papelaria Personalizada
        são protegidos pela legislação brasileira de direitos autorais.
      </p>
      <p>
        A compra de um arquivo digital não transfere ao comprador os direitos autorais
        sobre a criação. O comprador adquire apenas o direito de utilização do arquivo de
        acordo com as condições estabelecidas nesta política e na descrição do produto.
      </p>
      <p>
        É expressamente proibida a cópia, reprodução, revenda, redistribuição,
        compartilhamento, doação ou disponibilização dos arquivos digitais, total ou
        parcialmente, sem autorização da Feito para Você Papelaria Personalizada.
      </p>
      <p>
        O uso indevido dos arquivos poderá resultar na adoção das medidas cabíveis para
        proteção dos direitos autorais da loja.
      </p>
      <p className="politica-destaque">
        Pirataria é crime. Ajude a combater o uso e a distribuição ilegal dos nossos
        arquivos. Caso você encontre nossos arquivos sendo comercializados, compartilhados
        ou disponibilizados de forma indevida, entre em contato conosco para que possamos
        verificar a situação.
      </p>
    </section>

    <section className="politica-bloco">
      <h2>Envio e acesso aos arquivos digitais</h2>
      <p>Os produtos digitais são disponibilizados de forma eletrônica.</p>
      <p>
        Após a confirmação do pagamento, o acesso ou download do arquivo será liberado de
        acordo com as condições informadas na página do produto.
      </p>
      <p>
        Antes de finalizar a compra, recomendamos que o cliente leia atentamente a
        descrição do produto, confira o formato do arquivo, quantidade de páginas,
        dimensões, conteúdo e demais informações disponibilizadas.
      </p>
      <p>
        Após o acesso ou download do arquivo digital, não será possível realizar a
        devolução do arquivo ou o cancelamento da compra simplesmente por arrependimento,
        quando a legislação aplicável permitir essa condição, considerando a natureza
        digital do produto e a disponibilização imediata do conteúdo.
      </p>
      <p>
        Caso o arquivo apresente algum problema técnico, esteja corrompido ou não
        corresponda ao produto adquirido, entre em contato conosco para que possamos
        analisar a situação e oferecer a solução adequada.
      </p>
    </section>

    <section className="politica-bloco">
      <h2>Produtos personalizados</h2>
      <p>
        Os produtos personalizados são confeccionados especialmente de acordo com as
        informações fornecidas pelo cliente, como nome e idade.
      </p>
      <p>
        Por serem produtos confeccionados de forma personalizada, é muito importante que o
        cliente confira atentamente todas as informações enviadas antes da produção.
      </p>
      <p>
        Após a aprovação da arte ou início da produção, alterações poderão não ser
        possíveis ou poderão gerar custos adicionais, conforme o estágio de produção.
      </p>
      <p>
        Em caso de dúvidas ou necessidade de alteração, entre em contato com a loja antes
        da produção.
      </p>
    </section>

    <section className="politica-bloco" id="antes-de-comprar">
      <h2>Antes de finalizar sua compra</h2>
      <p>
        Para garantir que seu pedido seja produzido exatamente como você deseja, pedimos
        que todas as dúvidas sejam esclarecidas antes da finalização da compra.
      </p>
      <p>
        Nos produtos personalizados, é muito importante conferir atentamente todas as
        informações fornecidas no momento do pedido, especialmente nome, idade, data e
        demais dados de personalização. A produção será realizada exatamente de acordo com
        as informações enviadas pelo cliente.
      </p>
      <p className="politica-destaque">
        Atenção: por se tratar de produtos personalizados e produzidos especialmente para
        cada cliente, não realizamos trocas ou alterações por erros nas informações
        fornecidas no momento da compra.
      </p>
      <p>
        Antes do envio, todos os pedidos passam por um rigoroso processo de conferência e
        controle de qualidade, para garantir que o produto esteja de acordo com as
        especificações e informações solicitadas no pedido.
      </p>
      <p>
        Por isso, ao finalizar sua compra, confira cuidadosamente todos os detalhes. Você
        receberá exatamente o produto conforme as informações e características escolhidas
        no momento da compra.
      </p>
      <p>Em caso de dúvida, estamos à disposição para ajudar. Pergunte antes de comprar!</p>
    </section>

    <section className="politica-bloco">
      <h2>Precisa de ajuda?</h2>
      <p>
        Se tiver dúvidas sobre o uso dos arquivos, produtos personalizados, direitos de
        utilização, pedidos ou possibilidades de parceria, entre em contato com a Feito
        para Você Papelaria Personalizada pelos nossos canais oficiais.
      </p>
      <p>
        Estamos à disposição para ajudar e tornar sua experiência com a nossa loja a melhor
        possível!
      </p>
      <p>
        <Link href="/produtos/">Ver todos os produtos</Link>
      </p>
    </section>
        </Col>
      </Row>
    </Container>
  </div>
)

export default Politicas
