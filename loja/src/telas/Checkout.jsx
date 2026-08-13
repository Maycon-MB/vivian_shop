'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Download,
  Check,
  CreditCard,
  QrCode,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCarrinho } from './CarrinhoContexto';
import { PRAZO_PRODUCAO } from '../catalogo';
import { useCompra } from './useCompra';
import { situacaoDosServicos, estaTudoReal } from '@/servicos';
import { AvisoDemonstracao } from '@/componentes/AvisoDemonstracao';

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
 * O frete vem do serviço de frete, e o pagamento do serviço de pagamento.
 * Hoje os dois são simulados; a tela não sabe disso e não precisa saber —
 * ela só sabe pedir uma cotação e mandar cobrar. Quando o Melhor Envio e o
 * Mercado Pago entrarem, esta tela não muda uma linha.
 */

const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const soNumeros = (texto) => texto.replace(/\D/g, '');

/**
 * A validação é toda em português comum e diz o que fazer, não o que
 * está errado no sistema. "E-mail inválido" não ajuda ninguém a corrigir.
 */
const validar = ({ dados, precisaEndereco, frete }) => {
  const erros = {};

  if (dados.nome.trim().split(/\s+/).length < 2) {
    erros.nome = 'Escreva seu nome e sobrenome — é o que vai na etiqueta.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email.trim())) {
    erros.email = 'Confira o e-mail: é para lá que a confirmação vai.';
  }

  if (soNumeros(dados.whatsapp).length < 10) {
    erros.whatsapp = 'Escreva o WhatsApp com DDD, como em (21) 99999-0000.';
  }

  if (precisaEndereco) {
    if (soNumeros(dados.cep).length !== 8) {
      erros.cep = 'O CEP tem 8 números, como em [dado pessoal removido].';
    }
    if (!dados.logradouro.trim()) erros.logradouro = 'Falta a rua.';
    if (!dados.numero.trim()) erros.numero = 'Falta o número.';
    if (!frete) erros.frete = 'Escolha como quer receber.';
  }

  return erros;
};

const VAZIO = {
  nome: '',
  email: '',
  whatsapp: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

const Checkout = () => {
  const router = useRouter();
  const { itens, total, ehDigital, pronto } = useCarrinho();
  const { finalizar, cotarFrete, processando, erro, limparErro } = useCompra();

  const [dados, setDados] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [cotacao, setCotacao] = useState(null);
  const [cotando, setCotando] = useState(false);
  const [erroFrete, setErroFrete] = useState(null);
  const [escolhido, setEscolhido] = useState(null);
  const [pagamento, setPagamento] = useState('pix');

  const precisaEndereco = !ehDigital;
  const cepCompleto = soNumeros(dados.cep).length === 8;

  /* As opções e o frete escolhido são calculados a partir da cotação, e não
     guardados à parte: um CEP diferente do cotado simplesmente não tem
     opções, sem ninguém precisar lembrar de limpar. */
  const opcoesFrete = cotacao && cotacao.cep === dados.cep ? cotacao.opcoes : null;
  const frete = opcoesFrete?.find((opcao) => opcao.id === escolhido) ?? null;

  const valorFrete = precisaEndereco ? (frete?.valor ?? 0) : 0;

  /* O desconto do Pix incide só sobre os produtos, nunca sobre o frete.
     O frete é repassado inteiro aos Correios ou à Jadlog: dar desconto
     sobre ele significa a Vivian pagar do próprio bolso a diferença de
     cada pedido. */
  const desconto = pagamento === 'pix' ? total * 0.05 : 0;
  const totalGeral = total + valorFrete - desconto;

  /* A cotação sai sozinha quando o CEP fica completo. Pedir para a pessoa
     clicar em "calcular frete" depois de já ter digitado o CEP é trabalho
     que o computador podia ter feito.

     A cotação guarda junto o CEP que a originou. Assim, quando a pessoa
     apaga um dígito, o preço some sozinho — sem o efeito precisar limpar
     nada. Preço de frete que sobrevive à troca do CEP é o tipo de erro que
     só aparece depois de a pessoa já ter pago pelo valor errado. */
  useEffect(() => {
    if (!precisaEndereco || !cepCompleto) return;

    let cancelado = false;
    /* O aviso do lint é sobre renderizar em cascata. Aqui é o contrário do
       problema que ele previne: marcar "calculando" antes de sair pedindo a
       cotação é justamente o que evita a tela ficar parada sem explicação
       enquanto a rede responde. É um render a mais, de propósito. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCotando(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErroFrete(null);

    const cepPedido = dados.cep;

    cotarFrete(cepPedido, itens)
      .then((opcoes) => {
        if (cancelado) return;
        setCotacao({ cep: cepPedido, opcoes });
        // A mais barata já vem marcada: é a que a maioria escolhe, e
        // deixar nada marcado trava o botão sem a pessoa entender por quê.
        setEscolhido(opcoes.reduce((a, b) => (a.valor <= b.valor ? a : b)).id);
      })
      .catch((falha) => {
        if (cancelado) return;
        setErroFrete(
          falha?.message ??
            'Não conseguimos calcular o frete agora. Tente de novo, ou me chame no WhatsApp que eu faço o cálculo na mão.',
        );
      })
      .finally(() => {
        if (!cancelado) setCotando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.cep, precisaEndereco, cepCompleto, itens.length]);

  const preencher = (campo) => (evento) => {
    setDados((atual) => ({ ...atual, [campo]: evento.target.value }));
    setErros((atual) => {
      if (!atual[campo]) return atual;
      const proximo = { ...atual };
      delete proximo[campo];
      return proximo;
    });
    limparErro();
  };

  const pagar = async () => {
    const encontrados = validar({ dados, precisaEndereco, frete });
    setErros(encontrados);

    if (Object.keys(encontrados).length > 0) {
      // Levar a pessoa até o primeiro campo com problema, em vez de
      // deixá-la procurar o que a loja não aceitou.
      const primeiro = document.querySelector('[data-erro="sim"]');
      primeiro?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      primeiro?.focus?.();
      return;
    }

    const pedido = await finalizar({
      itens,
      // A linha vem do próprio carrinho: ele já impede misturar as duas.
      linha: itens[0]?.category,
      comprador: {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        whatsapp: dados.whatsapp.trim(),
      },
      endereco: precisaEndereco
        ? {
            cep: dados.cep.trim(),
            logradouro: dados.logradouro.trim(),
            numero: dados.numero.trim(),
            complemento: dados.complemento.trim() || undefined,
            bairro: dados.bairro.trim(),
            cidade: dados.cidade.trim(),
            uf: dados.uf.trim(),
          }
        : null,
      opcaoFrete: frete,
      meio: pagamento,
      subtotal: total,
      desconto,
    });

    if (pedido) router.push(`/pedido-confirmado/?pedido=${pedido.id}`);
  };

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

  const campoErro = (campo) =>
    erros[campo] ? (
      <span className="campo-erro" role="alert">
        <AlertCircle size={13} /> {erros[campo]}
      </span>
    ) : null;

  return (
    <div className="checkout">
      <AvisoDemonstracao onde="checkout" />

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
                  <Form.Label htmlFor="campo-nome">Nome completo</Form.Label>
                  <Form.Control
                    id="campo-nome"
                    value={dados.nome}
                    onChange={preencher('nome')}
                    data-erro={erros.nome ? 'sim' : undefined}
                    isInvalid={Boolean(erros.nome)}
                    autoComplete="name"
                    placeholder="Como está no documento"
                  />
                  {campoErro('nome')}
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="campo-email">E-mail</Form.Label>
                  <Form.Control
                    id="campo-email"
                    type="email"
                    value={dados.email}
                    onChange={preencher('email')}
                    data-erro={erros.email ? 'sim' : undefined}
                    isInvalid={Boolean(erros.email)}
                    autoComplete="email"
                    placeholder="para receber a confirmação"
                  />
                  {campoErro('email')}
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="campo-whatsapp">WhatsApp</Form.Label>
                  <Form.Control
                    id="campo-whatsapp"
                    value={dados.whatsapp}
                    onChange={preencher('whatsapp')}
                    data-erro={erros.whatsapp ? 'sim' : undefined}
                    isInvalid={Boolean(erros.whatsapp)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                  />
                  {campoErro('whatsapp')}
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
                    <Form.Label htmlFor="campo-cep">CEP</Form.Label>
                    <Form.Control
                      id="campo-cep"
                      value={dados.cep}
                      onChange={preencher('cep')}
                      data-erro={erros.cep ? 'sim' : undefined}
                      isInvalid={Boolean(erros.cep)}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="00000-000"
                    />
                    {campoErro('cep')}
                  </Form.Group>

                  {cepCompleto && (
                    <>
                      <Form.Group>
                        <Form.Label htmlFor="campo-cidade">Cidade e estado</Form.Label>
                        <Form.Control
                          id="campo-cidade"
                          value={dados.cidade}
                          onChange={preencher('cidade')}
                          autoComplete="address-level2"
                          placeholder="Rio de Janeiro — RJ"
                        />
                      </Form.Group>

                      <Form.Group className="largo">
                        <Form.Label htmlFor="campo-rua">Rua</Form.Label>
                        <Form.Control
                          id="campo-rua"
                          value={dados.logradouro}
                          onChange={preencher('logradouro')}
                          data-erro={erros.logradouro ? 'sim' : undefined}
                          isInvalid={Boolean(erros.logradouro)}
                          autoComplete="address-line1"
                          placeholder="[dado pessoal removido]"
                        />
                        {campoErro('logradouro')}
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="campo-numero">Número</Form.Label>
                        <Form.Control
                          id="campo-numero"
                          value={dados.numero}
                          onChange={preencher('numero')}
                          data-erro={erros.numero ? 'sim' : undefined}
                          isInvalid={Boolean(erros.numero)}
                          inputMode="numeric"
                          placeholder="123"
                        />
                        {campoErro('numero')}
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="campo-complemento">Complemento</Form.Label>
                        <Form.Control
                          id="campo-complemento"
                          value={dados.complemento}
                          onChange={preencher('complemento')}
                          autoComplete="address-line2"
                          placeholder="apto, bloco (opcional)"
                        />
                      </Form.Group>
                    </>
                  )}
                </div>

                {!cepCompleto && (
                  <p className="dica">
                    <Truck size={15} /> Digite o CEP para ver o frete e o prazo.
                  </p>
                )}

                {cotando && (
                  <p className="dica" role="status">
                    <Loader2 size={15} className="girando" /> Calculando o frete para esse CEP…
                  </p>
                )}

                {erroFrete && (
                  <p className="campo-erro" role="alert">
                    <AlertCircle size={14} /> {erroFrete}
                  </p>
                )}

                {opcoesFrete && !cotando && (
                  <div className="fretes">
                    <p className="fretes-titulo">Como você quer receber</p>

                    {opcoesFrete.map((opcao) => (
                      <label
                        key={opcao.id}
                        className={`frete ${frete?.id === opcao.id ? 'escolhido' : ''}`}
                      >
                        <input
                          type="radio"
                          name="frete"
                          checked={frete?.id === opcao.id}
                          onChange={() => setEscolhido(opcao.id)}
                        />
                        <span className="frete-nome">
                          <strong>
                            {opcao.transportadora} {opcao.servico}
                          </strong>
                          <span>
                            {opcao.prazoDias} dias úteis · depois dos {PRAZO_PRODUCAO} dias de
                            produção
                          </span>
                        </span>
                        <span className="frete-valor">{moeda(opcao.valor)}</span>
                      </label>
                    ))}

                    {campoErro('frete')}
                  </div>
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
                    <Form.Label htmlFor="campo-cartao">Número do cartão</Form.Label>
                    <Form.Control
                      id="campo-cartao"
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label htmlFor="campo-validade">Validade</Form.Label>
                    <Form.Control
                      id="campo-validade"
                      placeholder="MM/AA"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label htmlFor="campo-cvv">Código de segurança</Form.Label>
                    <Form.Control
                      id="campo-cvv"
                      placeholder="000"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
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
                  <dd>{ehDigital ? 'não tem' : frete ? moeda(frete.valor) : 'informe o CEP'}</dd>
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

              {erro && (
                <div className="pagamento-recusado" role="alert">
                  <strong>
                    <AlertCircle size={16} /> {erro.titulo}
                  </strong>
                  <p>{erro.saida}</p>
                </div>
              )}

              <button
                type="button"
                className={`finalizar ${processando ? 'travado' : ''}`}
                onClick={pagar}
                disabled={processando}
              >
                {processando ? (
                  <>
                    <Loader2 size={16} className="girando" /> Processando o pagamento…
                  </>
                ) : (
                  'Pagar'
                )}
              </button>

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
                  <ShieldCheck size={15} />{' '}
                  {estaTudoReal
                    ? 'Pagamento processado pelo Mercado Pago'
                    : `Pagamento ${situacaoDosServicos.pagamento}: nada é cobrado`}
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
