'use client'

import React from 'react';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { Heart, Package, Download, MessageCircle } from 'lucide-react';

/**
 * Sobre.
 *
 * Loja nova não tem reputação — tem história. Quem chega pelo Instagram e
 * nunca comprou aqui decide pela pessoa, não pelo site.
 *
 * O texto ainda é um esboço, e está marcado como tal na tela: a história
 * é dela, e inventar passado de alguém para vender seria a pior coisa que
 * esta página poderia fazer. A estrutura fica pronta; as palavras entram
 * quando ela contar.
 */
const Sobre = () => (
  <div className="sobre">
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <p className="sobre-eyebrow">Quem faz</p>
          <h1 className="sobre-titulo">
            Cada peça sai da minha mesa, uma a uma.
          </h1>

          {/* PENDENTE-LANCAMENTO: este aviso e o texto abaixo saem quando a Vivian mandar a história dela. */}
          <div className="sobre-rascunho">
            <strong>Vivian, este texto é um esboço.</strong> Escrevi para a página não ficar
            vazia, mas quem tem que contar essa história é você. Me manda do seu jeito, mesmo
            desorganizado, que eu ajeito.
          </div>

          <div className="sobre-texto">
            <p>
              Comecei fazendo material para as crianças que eu atendia. Cada uma precisava de
              uma coisa diferente, uma rotina que desse para ver, uma atividade com menos
              informação na folha, uma letra maior. Como não achava pronto, eu fazia.
            </p>

            <p>
              Aí uma mãe pediu uma cópia. Depois uma professora. Depois uma clínica inteira.
              Foi assim que virou loja, e é por isso que até hoje eu faço peça por peça, com o
              nome de quem vai usar.
            </p>

            <p>
              Hoje são duas linhas. A <strong>papelaria personalizada</strong>, que sai daqui
              feita à mão e chega pelo correio. E a <strong>papelaria pedagógica</strong>, que
              é digital, para você imprimir quantas vezes precisar, porque material de
              criança rasga, molha e some, e você não deveria comprar de novo por isso.
            </p>
          </div>

          <div className="sobre-linhas">
            <div className="sobre-linha">
              <span className="sobre-icone fisico">
                <Package size={20} />
              </span>
              <div>
                <strong>Papelaria personalizada</strong>
                <p>
                  Feita sob encomenda, com o nome de quem vai usar. Mínimo de 10 peças, prontas
                  em 5 dias úteis.
                </p>
              </div>
            </div>

            <div className="sobre-linha">
              <span className="sobre-icone digital">
                <Download size={20} />
              </span>
              <div>
                <strong>Papelaria pedagógica</strong>
                <p>
                  Atividades adaptadas em arquivo digital. Chegam no seu e-mail na hora e você
                  imprime quantas vezes precisar.
                </p>
              </div>
            </div>
          </div>

          <div className="sobre-fechamento">
            <Heart size={22} />
            <p>
              Se você chegou até aqui, provavelmente cuida de alguém que aprende de um jeito
              próprio. Eu também. É para isso que este material existe.
            </p>
          </div>

          <div className="sobre-acoes">
            <Link href="/" className="sobre-botao">
              Ver os produtos
            </Link>

            {/* Ia para o WhatsApp, num número de exemplo. */}
            <Link className="sobre-conversa" href="/?conversa=1" prefetch={false}>
              <MessageCircle size={17} /> Falar com a loja
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Sobre;
