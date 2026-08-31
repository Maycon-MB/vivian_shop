/**
 * O retorno da autorização do Melhor Envio.
 *
 * É para cá que eles mandam a Vivian depois de ela clicar em "autorizar"
 * na conta dela. Chega um `code` de uso único, esta função troca por um
 * token de 30 dias, guarda, e mostra uma página dizendo que deu certo.
 *
 * ── Por que uma função, e não uma página da loja ───────────────────────
 *
 * A troca do `code` por token exige o segredo do aplicativo. A loja é um
 * site estático: qualquer coisa que eu pusesse lá estaria dentro da
 * página, e quem tem esse segredo movimenta o saldo da conta dela, compra
 * etiqueta e cancela envio.
 *
 * Aqui o segredo fica na variável da função, que nunca sai do servidor.
 *
 * ── Por que ela é pública ──────────────────────────────────────────────
 *
 * Porque quem chega é o navegador da Vivian, vindo do site do Melhor
 * Envio, sem sessão nossa nenhuma. Não dá para exigir login.
 *
 * O que protege é o `state`: um valor que eu gero ao montar o link e
 * confiro aqui. Sem ele, qualquer um chamaria esta função com um `code`
 * da própria conta e plantaria o token dele no lugar do dela, e a loja
 * passaria a comprar etiqueta na conta de um estranho.
 */

/**
 * Para onde a Vivian é mandada depois de autorizar.
 *
 * ── Por que redirecionar, e não desenhar a página aqui ─────────────────
 *
 * A primeira versão devolvia HTML. **O Supabase não deixa:** ele força
 * `content-type: text/plain` com `nosniff` em resposta de função, para
 * ninguém hospedar página falsa num domínio dele.
 *
 * O resultado é que ela viu o código-fonte cru na tela, com os acentos
 * quebrados, logo depois de autorizar. Funcionou e pareceu quebrado, que
 * é o pior dos dois mundos numa tela de confirmação.
 *
 * Redirecionando, a página é da loja: tem a cara do site, o acento certo,
 * e é onde ela já sabe estar.
 */
const LOJA = 'https://feitoparavocepapelaria.com.br'

const paraALoja = (situacao: string) =>
  Response.redirect(`${LOJA}/admin/frete-ligado/?situacao=${situacao}`, 303)

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const esperado = Deno.env.get('MELHORENVIO_STATE')

  /* Confere antes de qualquer outra coisa, e responde igual nos dois
     casos de recusa: dizer "state errado" para quem tentou é ensinar o
     que falta acertar. */
  if (!code || !esperado || state !== esperado) {
    return paraALoja('link-invalido')
  }

  const base = Deno.env.get('MELHORENVIO_BASE') ?? 'https://melhorenvio.com.br'

  const resposta = await fetch(`${base}/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      /* Eles pedem nome e contato aqui, e usam isso para falar com quem
         integrou quando alguma coisa quebra do lado deles. */
      'User-Agent': 'Loja Feito para Você (mayconbruno.dev@gmail.com)',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: Deno.env.get('MELHORENVIO_CLIENT_ID'),
      client_secret: Deno.env.get('MELHORENVIO_CLIENT_SECRET'),
      redirect_uri: Deno.env.get('MELHORENVIO_REDIRECT'),
      code,
    }),
  })

  if (!resposta.ok) {
    /* O corpo do erro deles pode trazer pedaço do que foi enviado. Ele vai
       para o registro da função, e nunca para a tela: quem está olhando é
       a Vivian, e não tem o que ela fazer com isso. */
    console.error('troca de token recusada', resposta.status, await resposta.text())

    return paraALoja('recusado')
  }

  const { access_token, refresh_token, expires_in } = await resposta.json()

  const banco = Deno.env.get('SUPABASE_URL')
  const chave = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const gravou = await fetch(`${banco}/rest/v1/credenciais_do_frete`, {
    method: 'POST',
    headers: {
      apikey: chave ?? '',
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
      /* Sobrescreve a linha em vez de criar outra: token velho guardado é
         token velho vazado. */
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      servico: 'melhor-envio',
      token: access_token,
      token_de_renovacao: refresh_token,
      expira_em: new Date(Date.now() + Number(expires_in) * 1000).toISOString(),
      atualizado_em: new Date().toISOString(),
    }),
  })

  if (!gravou.ok) {
    console.error('não consegui guardar o token', gravou.status, await gravou.text())

    return paraALoja('nao-guardei')
  }

  return paraALoja('pronto')
})
