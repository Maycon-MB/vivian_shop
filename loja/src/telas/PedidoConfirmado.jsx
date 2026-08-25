'use client'

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import { Check, Download, Package, MessageCircle, Mail, Clock } from 'lucide-react';
import { useCarrinho } from './CarrinhoContexto';
import { PRAZO_PRODUCAO } from '../catalogo';
import { pedidos, estaTudoReal } from '@/servicos';

/**
 * Pedido confirmado.
 *
 * A pergunta de quem acabou de pagar é sempre a mesma: "e agora?". A tela
 * responde isso antes de qualquer outra coisa — o que acontece, quando, e
 * onde a pessoa acompanha.
 *
 * Muda com a linha, porque o "e agora" é diferente: material digital já
 * está no e-mail, encomenda entra em produção. Prometer prazo de produção
 * para um arquivo, ou entrega imediata para uma caneca, seria mentira nos
 * dois sentidos.
 *
 * O carrinho é esvaziado ao chegar aqui: deixar o pedido lá faria a pessoa
 * comprar de novo sem querer.
 */
const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PedidoConfirmado = () => {
  const { itens, ehDigital, esvaziar } = useCarrinho();
  const [linha, setLinha] = useState(null);
  const [pedido, setPedido] = useState(null);
  const jaLeu = useRef(false);

  useEffect(() => {
    // O React roda os efeitos duas vezes em desenvolvimento. Sem esta trava,
    // a segunda passada leria o carrinho que a primeira acabou de esvaziar.
    if (jaLeu.current) return;
    jaLeu.current = true;

    // Guarda o tipo antes de esvaziar, senão a tela perde o que dizer.
    setLinha(itens.length > 0 ? (ehDigital ? 'digital' : 'fisica') : 'fisica');
    esvaziar();

    // O número do pedido vem do endereço, e o pedido do repositório. Se a
    // pessoa chegou aqui sem ter comprado — link antigo, atualizou a página —
    // a tela ainda funciona: só não mostra número nem valor.
    const id = new URLSearchParams(window.location.search).get('pedido');
    if (id) pedidos.buscar(id).then(setPedido).catch(() => setPedido(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const digital = linha === 'digital';

  if (!linha) return null;

  return (
    <div className="confirmado">
      <Container className="py-5">
        <div className="confirmado-topo">
          <span className="confirmado-selo">
            <Check size={30} />
          </span>
          <h1>{estaTudoReal ? 'Pagamento aprovado' : 'Compra simulada com sucesso'}</h1>
          <p>
            {pedido ? (
              <>
                Pedido <strong>#{pedido.numero}</strong> · {moeda(pedido.total)}
                {estaTudoReal
                  ? ' · a confirmação foi para o seu e-mail.'
                  : ' · guardado só neste navegador.'}
              </>
            ) : (
              'Tudo certo com a sua compra.'
            )}
          </p>

          {!estaTudoReal && (
            <p className="confirmado-simulado">
              Esta loja ainda está em construção: <strong>nada foi cobrado</strong> e nenhum
              pedido de verdade foi criado. O pedido acima serve para você ver como a loja
              funciona.
            </p>
          )}
        </div>

        <section className="passos-pedido">
          <h2>E agora, o que acontece</h2>

          {digital ? (
            <ol>
              <li className="feito">
                <span className="marca">
                  <Check size={15} />
                </span>
                <div>
                  <strong>O arquivo já foi enviado</strong>
                  <p>Está no seu e-mail agora. Se não aparecer, olhe a caixa de spam.</p>
                </div>
              </li>
              <li className="feito">
                <span className="marca">
                  <Check size={15} />
                </span>
                <div>
                  <strong>Também mandamos no WhatsApp</strong>
                  <p>No número que você cadastrou, para não se perder no e-mail.</p>
                </div>
              </li>
              <li>
                <span className="marca">
                  <Download size={15} />
                </span>
                <div>
                  <strong>O link vale por 7 dias</strong>
                  <p>Baixe e guarde o arquivo. Depois disso é só me chamar que eu reenvio.</p>
                </div>
              </li>
            </ol>
          ) : (
            <ol>
              <li className="feito">
                <span className="marca">
                  <Check size={15} />
                </span>
                <div>
                  <strong>Pagamento confirmado</strong>
                  <p>O seu pedido já entrou na fila de produção.</p>
                </div>
              </li>
              <li className="agora">
                <span className="marca">
                  <Clock size={15} />
                </span>
                <div>
                  <strong>Produção: {PRAZO_PRODUCAO} dias úteis</strong>
                  <p>
                    Cada peça é feita uma a uma, com o seu nome. É o que leva esse tempo.
                  </p>
                </div>
              </li>
              <li>
                <span className="marca">
                  <Package size={15} />
                </span>
                <div>
                  <strong>Postagem e código de rastreio</strong>
                  <p>Assim que sair, o código chega no seu e-mail e no WhatsApp.</p>
                </div>
              </li>
            </ol>
          )}
        </section>

        {digital && (
          <section className="baixar">
            <div>
              <strong>Seu material está pronto</strong>
              <span>Também enviado para o seu e-mail</span>
            </div>
            <button type="button" className="baixar-botao">
              <Download size={17} /> Baixar agora
            </button>
          </section>
        )}

        <section className="confirmado-ajuda">
          <h2>Precisa de alguma coisa?</h2>
          <p>
            Quem responde é a mesma pessoa que faz as peças. Pode chamar a qualquer
            hora, ela responde quando puder.
          </p>

          <div className="confirmado-acoes">
            {/* A conversa da loja no lugar do WhatsApp, que levava a
                cliente para fora e caía num número de exemplo. */}
            <Link className="acao-conversa-grande" href="/?conversa=1" prefetch={false}>
              <MessageCircle size={17} /> Falar com a loja
            </Link>

            <Link href="/" className="acao-voltar">
              Voltar para a loja
            </Link>
          </div>

          <p className="confirmado-email">
            <Mail size={14} /> A confirmação e as próximas novidades chegam no e-mail que você
            cadastrou.
          </p>
        </section>
      </Container>
    </div>
  );
};

export default PedidoConfirmado;
