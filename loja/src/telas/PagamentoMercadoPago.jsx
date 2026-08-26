'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

/** O recado do Mercado Pago dito para a cliente, e não para o sistema. */
const RECADOS = {
  cc_rejected_insufficient_amount: 'O cartão não tem saldo para esse valor.',
  cc_rejected_bad_filled_card_number: 'Confira o número do cartão.',
  cc_rejected_bad_filled_date: 'Confira a validade do cartão.',
  cc_rejected_bad_filled_security_code: 'Confira o código de segurança.',
  cc_rejected_high_risk: 'O banco não autorizou. Tente outro cartão, ou pague no Pix.',
  cc_rejected_call_for_authorize: 'O seu banco precisa autorizar essa compra. Ligue para eles, ou pague no Pix.',
  cc_rejected_card_disabled: 'O cartão está desativado. Ligue para o seu banco.',
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
                  }),
                },
              );

              const resultado = await resposta.json();

              if (!resposta.ok) {
                const motivo = RECADOS[resultado?.detalhe?.status_detail]
                  ?? 'O pagamento não passou. Tente outro cartão, ou pague no Pix.';
                setErro(motivo);
                aoFalhar?.(motivo);
                throw new Error(motivo);
              }

              if (resultado.qr) {
                // Pix: o código fica na própria tela, com botão de copiar.
                setPix({ codigo: resultado.qr, imagem: resultado.qr_imagem });
                return;
              }

              if (resultado.estado === 'approved' || resultado.estado === 'aprovado') {
                aoAprovar?.(resultado);
                return;
              }

              const motivo = RECADOS[resultado.detalhe]
                ?? 'O pagamento ficou pendente. Assim que o banco confirmar, você recebe um e-mail.';
              setErro(motivo);
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
          Assim que o pagamento cair, a produção começa e você recebe um e-mail. Pode fechar
          esta página.
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
