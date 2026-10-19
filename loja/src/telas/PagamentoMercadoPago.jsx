'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { recadoDoPagamento } from '@/dominio/recadoDoPagamento';

/**
 * O pagamento, dentro da loja.
 *
 * Os campos do cartão são iframes do Mercado Pago desenhados aqui dentro.
 * **Não são nossos, e isso não é detalhe de implementação.**
 *
 * Até 25/08 havia um `<input>` nosso chamado "Número do cartão", com
 * `autoComplete="cc-number"`. Nada era enviado, porque o pagamento era
 * simulado, mas o navegador preenchia cartão de verdade ali e a cliente
 * digitava o dela. Um campo nosso põe o dado no nosso código, e a loja
 * dela entra em PCI-DSS: auditoria, certificação e responsabilidade legal,
 * no CPF dela.
 *
 * Com o Brick, o número vai do navegador da cliente direto para o Mercado
 * Pago e volta como um token. Visualmente fica dentro da loja, com a cor e
 * a fonte dela; tecnicamente o cartão nunca toca em nada nosso.
 *
 * O valor que aparece aqui é o do pedido já gravado no banco, e o que
 * mandamos para cobrar é o **id do pedido**. Nunca quanto cobrar.
 */

const SDK = 'https://sdk.mercadopago.com/js/v2';

const carregarSdk = () =>
  new Promise((resolver, recusar) => {
    if (window.MercadoPago) return resolver(window.MercadoPago);

    const existente = document.querySelector(`script[src="${SDK}"]`);
    if (existente) {
      existente.addEventListener('load', () => resolver(window.MercadoPago));
      existente.addEventListener('error', () => recusar(new Error('sdk')));
      return;
    }

    const script = document.createElement('script');
    script.src = SDK;
    script.async = true;
    script.onload = () => resolver(window.MercadoPago);
    script.onerror = () => recusar(new Error('sdk'));
    document.head.appendChild(script);
  });

/* O SDK v2 não deixa o id do aparelho em `window`; este script do Mercado
   Pago deixa, em `MP_DEVICE_SESSION_ID`, e é o que vai em X-meli-session-id. */
const SEGURANCA = 'https://www.mercadopago.com/v2/security.js';

const carregarSeguranca = () => {
  if (document.querySelector(`script[src="${SEGURANCA}"]`)) return;
  const script = document.createElement('script');
  script.src = SEGURANCA;
  script.async = true;
  script.setAttribute('view', 'checkout');
  document.head.appendChild(script);
};

/* Fora do componente: a chave é a mesma para todo mundo, e lida aqui ela
   não vira estado marcado dentro do efeito. */
const CHAVE = process.env.NEXT_PUBLIC_MERCADOPAGO_CHAVE;

const PagamentoMercadoPago = ({ pedidoId, total, email, comoRecebe, aoAprovar, aoFalhar }) => {
  const caixa = useRef(null);
  const [carregando, setCarregando] = useState(Boolean(CHAVE));
  const [erro, setErro] = useState(
    CHAVE ? '' : 'O pagamento ainda não está ligado nesta loja.',
  );
  const [pix, setPix] = useState(null);

  useEffect(() => {
    if (!CHAVE) return undefined;

    let brick;
    let valendo = true;

    // Sem ele a cobrança sai do mesmo jeito, só sem o aparelho.
    carregarSeguranca();

    carregarSdk()
      .then(async (MercadoPago) => {
        if (!valendo) return;

        const mp = new MercadoPago(CHAVE, { locale: 'pt-BR' });
        const construtor = mp.bricks();

        brick = await construtor.create('payment', 'pagamento-mercadopago', {
          initialization: {
            amount: total,
            payer: { email },
          },
          customization: {
            /* O que aparece vem da tela dela, em "Como eu recebo", e não
               daqui. Desligar o crédito no painel tem que desligar o
               crédito na loja: senão a cliente escolhe uma forma que ela
               não aceita e descobre no fim. */
            paymentMethods: {
              ...(comoRecebe.aceita_credito ? { creditCard: 'all' } : {}),
              ...(comoRecebe.aceita_debito ? { debitCard: 'all' } : {}),
              ...(comoRecebe.aceita_pix ? { bankTransfer: 'all' } : {}),
              /* Quantas vezes ela deixa parcelar. Sem este teto, o
                 Mercado Pago oferece o máximo da conta dela, e quem
                 recebe em 12 vezes é ela. */
              maxInstallments: comoRecebe.parcelas_max,
            },
            visual: {
              style: { theme: 'default' },
            },
          },
          callbacks: {
            onReady: () => { if (valendo) setCarregando(false); },

            onSubmit: async ({ formData }) => {
              /* Só o token vai daqui. O número do cartão ficou no iframe
                 do Mercado Pago e nunca passou por este código. */
              const resposta = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cobrar`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
                  },
                  body: JSON.stringify({
                    // O id do pedido, e nunca o valor: quem sabe quanto
                    // custa é o banco.
                    pedido_id: pedidoId,
                    token: formData.token,
                    meio: formData.payment_method_id,
                    parcelas: formData.installments,
                    email: formData.payer?.email ?? email,
                    documento: formData.payer?.identification
                      ? {
                          tipo: formData.payer.identification.type,
                          numero: formData.payer.identification.number,
                        }
                      : undefined,
                    // Gerado pelo security.js do Mercado Pago; o antifraude
                    // deles cruza o aparelho com o cartão.
                    dispositivo: window.MP_DEVICE_SESSION_ID,
                  }),
                },
              );

              const resultado = await resposta.json();

              if (!resposta.ok) {
                const { texto } = recadoDoPagamento({
                  estado: 'rejected',
                  detalhe: resultado?.detalhe?.status_detail,
                });
                setErro(texto);
                aoFalhar?.(texto);
                throw new Error(texto);
              }

              if (resultado.qr) {
                // Pix: o código fica na própria tela, com botão de copiar.
                setPix({ codigo: resultado.qr, imagem: resultado.qr_imagem });
                return;
              }

              const recado = recadoDoPagamento({
                estado: resultado.estado,
                detalhe: resultado.detalhe,
              });

              if (recado.tipo === 'aprovado' || resultado.estado === 'aprovado') {
                aoAprovar?.(resultado);
                return;
              }

              setErro(recado.texto);

              /* Recusa devolvida como erro reabre o formulário do Brick para
                 ela trocar de cartão; pendente não, porque já foi enviado. */
              if (recado.tipo === 'recusado') {
                aoFalhar?.(recado.texto);
                throw new Error(recado.texto);
              }
            },

            onError: () => {
              if (valendo) {
                setErro('Não consegui abrir o pagamento. Recarregue a página e tente de novo.');
                setCarregando(false);
              }
            },
          },
        });
      })
      .catch(() => {
        if (valendo) {
          setErro('Não consegui carregar o pagamento. Confira a sua internet e tente de novo.');
          setCarregando(false);
        }
      });

    return () => {
      valendo = false;
      // Sem desmontar, voltar para esta tela desenha um segundo formulário
      // por cima do primeiro.
      brick?.unmount?.();
    };
  }, [pedidoId, total, email, comoRecebe, aoAprovar, aoFalhar]);

  if (pix) {
    return (
      <div className="pix">
        <h3>Pague com Pix para confirmar</h3>
        <p>Abra o aplicativo do seu banco, escolha Pix e leia o código.</p>

        {pix.imagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`data:image/png;base64,${pix.imagem}`} alt="Código Pix para pagar" />
        )}

        <button
          type="button"
          className="pix-copiar"
          onClick={() => navigator.clipboard?.writeText(pix.codigo)}
        >
          Copiar o código
        </button>

        <p className="pix-aviso">
          Assim que o pagamento cair, a produção começa. Você acompanha o pedido em Minha conta ou
          pela conversa com a loja. Pode fechar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="pagamento-mp">
      {carregando && !erro && (
        <p className="pagamento-carregando">
          <Loader2 size={18} className="girando" aria-hidden="true" /> Abrindo o pagamento…
        </p>
      )}

      {erro && <p className="pagamento-erro" role="alert">{erro}</p>}

      <div id="pagamento-mercadopago" ref={caixa} />

      <p className="pagamento-seguranca">
        Os dados do seu cartão vão direto para o Mercado Pago. Eles não passam por esta loja
        em momento nenhum.
      </p>
    </div>
  );
};

export default PagamentoMercadoPago;
