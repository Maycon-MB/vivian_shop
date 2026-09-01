/**
 * De quem é a conta que vai receber o dinheiro.
 *
 * Pergunta ao Mercado Pago quem é o dono do Access Token guardado aqui, e
 * devolve só a identificação da conta. **O token não sai desta função.**
 *
 * ── Por que isto existe ────────────────────────────────────────────────
 *
 * Em 01/09 a loja passou a cobrar de verdade, e a única forma de saber se
 * o dinheiro cai na conta certa era fazer uma compra: mínimo de dez peças,
 * uns R$ 135, e depois estornar.
 *
 * A pergunta que a compra responde é uma só: *este token é da conta da
 * Vivian?* Errar isso é o tipo de coisa que ninguém percebe até o
 * extrato, porque a loja funciona igual — aprova, grava o pedido, manda o
 * e-mail — só que o dinheiro entrou na conta de outra pessoa.
 *
 * Esta função responde a mesma pergunta sem cobrar ninguém.
 *
 * ── Por que devolve tão pouco ──────────────────────────────────────────
 *
 * Ela é pública, como as outras: quem chama é o navegador, sem sessão.
 * Então devolve o mínimo para responder "é a conta dela?" e nada além.
 * Nome do titular, e-mail e saldo não entram: é informação dela, e
 * ninguém precisa dela para conferir uma configuração.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const chave = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

  if (!chave) return json({ configurado: false, motivo: 'sem-token' })

  /* Qual ambiente, lido do próprio prefixo do token. É a mesma regra que
     decide se a loja mostra o aviso de demonstração. */
  const ambiente = chave.startsWith('TEST-') ? 'teste' : 'producao'

  const r = await fetch('https://api.mercadopago.com/users/me', {
    headers: { Authorization: `Bearer ${chave}` },
  })

  if (!r.ok) {
    /* Token vencido, revogado ou de outro tipo. O corpo vai para o
       registro; para fora sai só o código, porque a resposta deles pode
       trazer pedaço do que foi enviado. */
    console.error('users/me recusou', r.status, await r.text())
    return json({ configurado: true, ambiente, valido: false, http: r.status })
  }

  const conta = await r.json()

  return json({
    configurado: true,
    ambiente,
    valido: true,
    /* O id da conta é o que identifica quem recebe. Ele já aparece no
       fim do Access Token, então não é revelação nenhuma. */
    conta: conta.id,
    apelido: conta.nickname,
    pais: conta.site_id,
  })
})
