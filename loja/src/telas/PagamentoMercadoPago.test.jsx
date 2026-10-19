import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

/**
 * O que a cliente vê quando o Mercado Pago responde à cobrança.
 *
 * O Brick é trocado por um falso que entrega o formulário preenchido:
 * o que se testa é o que a loja faz com a resposta, e não o iframe deles.
 */

let envio;

const brickFalso = () => {
  window.MercadoPago = function MercadoPago() {
    return {
      bricks: () => ({
        create: async (_tipo, _id, { callbacks }) => {
          callbacks.onReady();
          envio = callbacks.onSubmit({
            formData: {
              token: 'tok',
              payment_method_id: 'visa',
              installments: 1,
              payer: { email: 'ana@example.com' },
            },
          });
          envio.catch(() => {});
          return { unmount: () => {} };
        },
      }),
    };
  };
};

const cobrancaResponde = (corpo, status = 200) => {
  global.fetch = vi.fn(async () => ({ ok: status < 400, status, json: async () => corpo }));
};

const abrirPagamento = async () => {
  vi.resetModules();
  const { default: PagamentoMercadoPago } = await import('./PagamentoMercadoPago');
  render(
    <PagamentoMercadoPago
      pedidoId="7c9e6679-7425-40de-944b-e07fc1f90ae7"
      total={145}
      email="ana@example.com"
      comoRecebe={{ aceita_credito: true, aceita_pix: true, parcelas_max: 3 }}
    />,
  );
};

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_MERCADOPAGO_CHAVE', 'TEST-chave-publica');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://banco.falso');
  window.MP_DEVICE_SESSION_ID = 'armor.abc123';
  brickFalso();
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.MercadoPago;
  delete window.MP_DEVICE_SESSION_ID;
});

describe('quando o cartão é recusado', () => {
  it('diz o motivo, e não que o pagamento está pendente', async () => {
    cobrancaResponde({ estado: 'rejected', detalhe: 'cc_rejected_bad_filled_security_code' });
    await abrirPagamento();

    expect(await screen.findByRole('alert')).toHaveTextContent(/código de segurança/);
    expect(screen.getByRole('alert')).not.toHaveTextContent(/pendente/i);
  });

  it('devolve erro ao Brick para ela poder tentar outro cartão', async () => {
    cobrancaResponde({ estado: 'rejected', detalhe: 'cc_rejected_other_reason' });
    await abrirPagamento();

    await waitFor(() => expect(envio).toBeDefined());
    await expect(envio).rejects.toThrow(/outro cartão/);
  });
});

describe('quando o pagamento fica em análise', () => {
  it('avisa que está em análise sem pedir outro cartão', async () => {
    cobrancaResponde({ estado: 'in_process', detalhe: 'pending_review_manual' });
    await abrirPagamento();

    expect(await screen.findByRole('alert')).toHaveTextContent(/em análise/);
    await expect(envio).resolves.toBeUndefined();
  });
});

describe('o que vai para a cobrança', () => {
  it('manda o identificador do aparelho junto com o pedido, e nunca o valor', async () => {
    cobrancaResponde({ estado: 'in_process', detalhe: 'pending_contingency' });
    await abrirPagamento();

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const corpo = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(corpo.dispositivo).toBe('armor.abc123');
    expect(corpo.pedido_id).toBe('7c9e6679-7425-40de-944b-e07fc1f90ae7');
    expect(corpo).not.toHaveProperty('transaction_amount');
    expect(corpo).not.toHaveProperty('total');
  });

  it('pede o script de aparelho do Mercado Pago na tela de pagamento', async () => {
    cobrancaResponde({ estado: 'in_process', detalhe: 'pending_contingency' });
    await abrirPagamento();

    const script = document.querySelector('script[src="https://www.mercadopago.com/v2/security.js"]');
    expect(script).not.toBeNull();
    expect(script.getAttribute('view')).toBe('checkout');
  });
});
