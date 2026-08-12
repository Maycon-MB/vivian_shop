'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Download,
  Check,
  CreditCard,
  QrCode,
  Package,
} from 'lucide-react';
import { useCarrinho } from './CarrinhoContexto';
import { PRAZO_PRODUCAO } from '../catalogo';

/**
 * Fechar a compra.
 *
 * É uma página só, com tudo à vista, e não um assistente de várias etapas.
 * Cada etapa escondida é uma chance de desistir, e o pedido daqui tem
 * poucos campos — cabe numa tela.
 *
 * A tela muda inteira conforme a linha: material digital não tem endereço,
 * não tem frete e não tem prazo de produção. Pedir CEP para entregar um
 * arquivo é o tipo de campo que faz a pessoa desconfiar da loja.
 *
 * O frete aqui é simulado com valores fixos. Quando o Melhor Envio entrar,
 * troca a origem dos números e o resto da tela continua igual.
 */

const FRETES = [
  { id: 'pac', nome: 'Correios PAC', prazo: '8 a 12 dias úteis', valor: 28.9 },
  { id: 'sedex', nome: 'Correios SEDEX', prazo: '3 a 5 dias úteis', valor: 46.5 },
  { id: 'jadlog', nome: 'Jadlog .Package', prazo: '5 a 8 dias úteis', valor: 32.4 },
];

const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const Checkout = () => {
  const { itens, total, ehDigital, pronto } = useCarrinho();

  const [cepConsultado, setCepConsultado] = useState(false);
  const [frete, setFrete] = useState(null);
  const [pagamento, setPagamento] = useState('pix');

  const precisaEndereco = !ehDigital;
  const valorFrete = precisaEndereco ? (frete?.valor ?? 0) : 0;

  /* O desconto do Pix incide só sobre os produtos, nunca sobre o frete.
     O frete é repassado inteiro aos Correios ou à Jadlog: dar desconto
     sobre ele significa a Vivian pagar do próprio bolso a diferença de
     cada pedido. */
  const desconto = pagamento === 'pix' ? total * 0.05 : 0;
  const totalGeral = total + valorFrete - desconto;

  if (!pronto) return null;

  if (itens.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h4 fw-bold mb-3">Seu carrinho está vazio</h1>
        <p className="text-muted mb-4">Escolha alguma coisa na loja para continuar.</p>
        <Link href="/" className="btn btn-dark rounded-pill px-4 py-2">
          Ver a loja
        </Link>
      </Container>
    );
  }

  return (
    <div className="checkout">
      <Container className="py-4 py-md-5">
        <Link href="/" className="voltar">
          <ArrowLeft size={16} /> Continuar comprando
        </Link>

        <h1 className="checkout-titulo">Fechar a compra</h1>

        <Row className="g-4 g-lg-5">
          <Col lg={7}>
            <section className="bloco">
              <h2>
                <span className="numero">1</span> Seus dados
              </h2>

              <div className="campos">
                <Form.Group className="largo">
                  <Form.Label>Nome completo</Form.Label>
                  <Form.Control placeholder="Como está no documento" />
                </Form.Group>

                <Form.Group>
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control type="email" placeholder="para receber a confirmação" />
                </Form.Group>

                <Form.Group>
                  <Form.Label>WhatsApp</Form.Label>
                  <Form.Control placeholder="(00) 00000-0000" />
                </Form.Group>
              </div>

              {ehDigital && (
                <p className="dica">
                  <Download size={15} /> O arquivo chega neste e-mail assim que o pagamento for
                  aprovado.
                </p>
              )}
            </section>

            {precisaEndereco && (
              <section className="bloco">
                <h2>
                  <span className="numero">2</span> Entrega
                </h2>

                <div className="campos">
                  <Form.Group>
                    <Form.Label>CEP</Form.Label>
                    <div className="cep">
                      <Form.Control
                        placeholder="00000-000"
                        inputMode="numeric"
                        onChange={(e) => setCepConsultado(e.target.value.replace(/\D/g, '').length >= 8)}
                      />
                    </div>
                  </Form.Group>

                  {cepConsultado && (
                    <>
                      <Form.Group>
                        <Form.Label>Cidade</Form.Label>
                        <Form.Control defaultValue="São Paulo — SP" readOnly />
                      </Form.Group>

                      <Form.Group className="largo">
                        <Form.Label>Rua</Form.Label>
                        <Form.Control defaultValue="Rua de exemplo" />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Número</Form.Label>
                        <Form.Control placeholder="123" inputMode="numeric" />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Complemento</Form.Label>
                        <Form.Control placeholder="apto, bloco (opcional)" />
                      </Form.Group>
                    </>
                  )}
                </div>

                {cepConsultado ? (
                  <div className="fretes">
                    <p className="fretes-titulo">Como você quer receber</p>

                    {FRETES.map((opcao) => (
                      <label
                        key={opcao.id}
                        className={`frete ${frete?.id === opcao.id ? 'escolhido' : ''}`}
                      >
                        <input
                          type="radio"
                          name="frete"
                          checked={frete?.id === opcao.id}
                          onChange={() => setFrete(opcao)}
                        />
                        <span className="frete-nome">
                          <strong>{opcao.nome}</strong>
                          <span>
                            {opcao.prazo} · depois dos {PRAZO_PRODUCAO} dias de produção
                          </span>
                        </span>
                        <span className="frete-valor">{moeda(opcao.valor)}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="dica">
                    <Truck size={15} /> Digite o CEP para ver o frete e o prazo.
                  </p>
                )}
              </section>
            )}

            <section className="bloco">
              <h2>
                <span className="numero">{precisaEndereco ? 3 : 2}</span> Pagamento
              </h2>

              <div className="pagamentos">
                <label className={`pagamento ${pagamento === 'pix' ? 'escolhido' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    checked={pagamento === 'pix'}
                    onChange={() => setPagamento('pix')}
                  />
                  <QrCode size={20} />
                  <span>
                    <strong>Pix</strong>
                    <span>5% de desconto, aprova na hora</span>
                  </span>
                </label>

                <label className={`pagamento ${pagamento === 'cartao' ? 'escolhido' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    checked={pagamento === 'cartao'}
                    onChange={() => setPagamento('cartao')}
                  />
                  <CreditCard size={20} />
                  <span>
                    <strong>Cartão de crédito</strong>
                    <span>em até 12 vezes</span>
                  </span>
                </label>
              </div>

              {pagamento === 'cartao' && (
                <div className="campos mt-3">
                  <Form.Group className="largo">
                    <Form.Label>Número do cartão</Form.Label>
                    <Form.Control placeholder="0000 0000 0000 0000" inputMode="numeric" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Validade</Form.Label>
                    <Form.Control placeholder="MM/AA" inputMode="numeric" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Código de segurança</Form.Label>
                    <Form.Control placeholder="000" inputMode="numeric" />
                  </Form.Group>
                </div>
              )}
            </section>
          </Col>

          <Col lg={5}>
            <aside className="resumo">
              <h2>Seu pedido</h2>

              <ul className="resumo-itens">
                {itens.map((item) => (
                  <li key={item.id}>
                    <span>
                      <strong>{item.quantidade}x</strong> {item.name}
                    </span>
                    <span className="valor">{moeda(item.price * item.quantidade)}</span>
                  </li>
                ))}
              </ul>

              <dl className="resumo-contas">
                <div>
                  <dt>Produtos</dt>
                  <dd>{moeda(total)}</dd>
                </div>
                <div>
                  <dt>Frete</dt>
                  <dd>
                    {ehDigital ? 'não tem' : frete ? moeda(frete.valor) : 'informe o CEP'}
                  </dd>
                </div>
                {desconto > 0 && (
                  <div className="desconto">
                    <dt>Desconto do Pix (5% nos produtos)</dt>
                    <dd>− {moeda(desconto)}</dd>
                  </div>
                )}
                <div className="total">
                  <dt>Total</dt>
                  <dd>{moeda(totalGeral)}</dd>
                </div>
              </dl>

              <Link
                href="/pedido-confirmado/"
                className={`finalizar ${precisaEndereco && !frete ? 'travado' : ''}`}
                aria-disabled={precisaEndereco && !frete}
                onClick={(e) => {
                  if (precisaEndereco && !frete) e.preventDefault();
                }}
              >
                {precisaEndereco && !frete ? 'Escolha o frete para continuar' : 'Pagar'}
              </Link>

              <p className="prazo-aviso">
                {ehDigital ? (
                  <>
                    <Download size={15} /> Entrega imediata por e-mail.
                  </>
                ) : (
                  <>
                    <Package size={15} /> Produção de {PRAZO_PRODUCAO} dias úteis, e depois o
                    prazo do envio.
                  </>
                )}
              </p>

              <ul className="resumo-garantias">
                <li>
                  <ShieldCheck size={15} /> Pagamento processado pelo Mercado Pago
                </li>
                <li>
                  <Check size={15} /> Seus dados de cartão não ficam guardados na loja
                </li>
              </ul>
            </aside>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Checkout;
