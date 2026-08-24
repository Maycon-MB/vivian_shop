'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  Package,
  Download,
  Truck,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { PERSONALIZADA, MINIMO_PERSONALIZADO, PRAZO_PRODUCAO } from '../catalogo';
import { precoAtual, temPromocao, REGRAS_DO_PERSONALIZADO, acharTema } from './catalogo';
import { useCarrinho } from './CarrinhoContexto';

/**
 * Página de um produto.
 *
 * Existe por três motivos: dá um endereço próprio para mandar no WhatsApp,
 * deixa o Google indexar cada peça, e é onde cabe a informação que não
 * cabe no card — o que vem junto, como é feito, quanto demora.
 *
 * A regra de venda aparece antes do botão e o total já vem calculado. Numa
 * linha de mínimo 10, o menor pedido de um caderno de R$ 32 é R$ 320: quem
 * descobre isso só no carrinho desiste ali, e a loja perde a venda sem
 * saber por quê.
 */
const PaginaProduto = ({ produto }) => {
  const { adicionar } = useCarrinho();
  const personalizado = produto.category === PERSONALIZADA;
  const tema = acharTema(produto.tema);
  /* O mínimo é o daquele produto, e não uma constante da loja.

     Enquanto o catálogo era o meu arquivo de exemplo, dez valia para tudo
     e a constante bastava. O catálogo dela mostra que 12 dos 342 produtos
     têm mínimo 1: exigir dez neles impediria a venda de coisa que ela
     vende avulsa. */
  const minimo = produto.minimo ?? (personalizado ? MINIMO_PERSONALIZADO : 1);

  const [quantidade, setQuantidade] = useState(minimo);
  const [adicionado, setAdicionado] = useState(false);

  const total = precoAtual(produto) * quantidade;

  const alterar = (delta) => {
    setQuantidade((atual) => Math.max(minimo, atual + delta));
  };

  const [barrado, setBarrado] = useState(null);

  const aoComprar = () => {
    const entrou = adicionar(produto, quantidade);

    if (!entrou) {
      // Carrinho com a outra linha: explicar em vez de apenas não fazer nada.
      setBarrado(
        'Material digital e produtos personalizados vão em compras separadas. Finalize a compra que já está no carrinho e faça outra para este.'
      );
      return;
    }

    setBarrado(null);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2600);
  };

  return (
    <div className="produto-pagina">
      <Container className="py-4 py-md-5">
        <Link href="/" className="voltar" prefetch={false}>
          <ArrowLeft size={16} /> Voltar para a loja
        </Link>

        <Row className="g-4 g-lg-5 mt-1">
          <Col lg={6}>
            <div className={`produto-imagem ${personalizado ? 'fisico' : 'digital'}`}>
              {produto.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={produto.image} alt={produto.name} />
              ) : (
                <span>Aqui entra a foto deste produto</span>
              )}

              <span className={`produto-etiqueta ${personalizado ? 'fisico' : 'digital'}`}>
                {personalizado ? <Package size={13} /> : <Download size={13} />}
                {produto.category}
              </span>
            </div>
          </Col>

          <Col lg={6}>
            <h1 className="produto-titulo">{produto.name}</h1>
            <p className="produto-descricao">{produto.description}</p>

            <div className="produto-preco-bloco">
              <span className="produto-valor">
                {temPromocao(produto) && (
                  <s className="produto-preco-cheio">
                    R$ {produto.price.toFixed(2).replace('.', ',')}
                  </s>
                )}
                R$ {precoAtual(produto).toFixed(2).replace('.', ',')}
              </span>
              {personalizado && <span className="produto-unidade">cada unidade</span>}
            </div>

            {personalizado ? (
              <div className="produto-regra-bloco">
                <p>
                  <strong>Mínimo de {minimo} unidades.</strong> É feito sob
                  encomenda, uma a uma, por isso o pedido tem uma quantidade mínima.
                </p>
                <p className="produto-prazo">
                  Fica pronto em <strong>{PRAZO_PRODUCAO} dias úteis</strong> depois do
                  pagamento. O frete é calculado pelo seu CEP na hora de fechar a compra.
                </p>
              </div>
            ) : (
              <div className="produto-regra-bloco digital">
                <p>
                  <strong>É um arquivo digital.</strong> Chega no seu e-mail assim que o
                  pagamento é aprovado, sem frete e sem espera.
                </p>
                <p className="produto-prazo">
                  Você imprime quantas vezes precisar, em casa ou na gráfica.
                </p>
              </div>
            )}

            {/* O tema é o caminho de volta para o resto da festa: quem
                está comprando a caneca do Mickey provavelmente também quer
                a revista e o álbum. */}
            {tema && tema.slug !== 'sem-tema' && (
              <Link href={`/tema/${tema.slug}/`} className="produto-tema" prefetch={false}>
                Ver tudo do tema <strong>{tema.nome}</strong>
              </Link>
            )}

            {personalizado && (
              <ul className="produto-regras">
                {REGRAS_DO_PERSONALIZADO.map((regra) => (
                  <li key={regra}>{regra}</li>
                ))}
              </ul>
            )}

            {produto.detalhes?.length > 0 && (
              <ul className="produto-detalhes">
                {produto.detalhes.map((detalhe) => (
                  <li key={detalhe}>
                    <Check size={15} /> {detalhe}
                  </li>
                ))}
              </ul>
            )}

            <div className="produto-compra">
              {personalizado && (
                <div className="quantidade" role="group" aria-label="Quantidade">
                  <button
                    type="button"
                    onClick={() => alterar(-1)}
                    disabled={quantidade <= minimo}
                    aria-label="Diminuir"
                  >
                    <Minus size={16} />
                  </button>
                  <span aria-live="polite">{quantidade}</span>
                  <button type="button" onClick={() => alterar(1)} aria-label="Aumentar">
                    <Plus size={16} />
                  </button>
                </div>
              )}

              <Button className="comprar" onClick={aoComprar}>
                {adicionado ? (
                  <>
                    <Check size={18} /> Adicionado
                  </>
                ) : (
                  <>Adicionar · R$ {total.toFixed(2).replace('.', ',')}</>
                )}
              </Button>
            </div>

            {barrado && <p className="produto-barrado">{barrado}</p>}

            {!barrado && adicionado && (
              <p className="produto-no-carrinho">
                No carrinho. <Link href="/checkout/" prefetch={false}>Fechar a compra →</Link>
              </p>
            )}

            {personalizado && quantidade === minimo && !adicionado && (
              <p className="produto-aviso-minimo">
                {minimo} unidades é o pedido mínimo deste produto.
              </p>
            )}

            <ul className="produto-garantias">
              <li>
                <ShieldCheck size={17} /> Pagamento seguro pelo Mercado Pago
              </li>
              <li>
                {personalizado ? <Truck size={17} /> : <Download size={17} />}
                {personalizado ? 'Correios e Jadlog, com rastreio' : 'Entrega imediata por e-mail'}
              </li>
              <li>
                <MessageCircle size={17} /> Dúvida? Fale direto com quem faz
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaginaProduto;
