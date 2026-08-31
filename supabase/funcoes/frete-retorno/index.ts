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

const cabecalhos = {
  'Content-Type': 'text/html; charset=utf-8',
}

const pagina = (titulo: string, recado: string, cor: string) =>
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <title>${titulo}</title></head>
   <body style="font-family: system-ui, sans-serif; background:#FBFAF7; margin:0;
                display:flex; align-items:center; justify-content:center; min-height:100vh;">
     <div style="max-width:420px; padding:32px; text-align:center;">
       <h1 style="color:${cor}; font-size:22px; margin:0 0 12px;">${titulo}</h1>
       <p style="color:#5F5560; line-height:1.6; margin:0;">${recado}</p>
     </div>
   </body></html>`

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const esperado = Deno.env.get('MELHORENVIO_STATE')

  /* Confere antes de qualquer outra coisa, e responde igual nos dois
     casos de recusa: dizer "state errado" para quem tentou é ensinar o
     que falta acertar. */
  if (!code || !esperado || state !== esperado) {
    return new Response(
      pagina(
        'Não consegui concluir',
        'O link expirou ou foi aberto fora de ordem. Me chama que eu te mando outro.',
        '#D93B54',
      ),
      { status: 400, headers: cabecalhos },
    )
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

    return new Response(
      pagina(
        'Não consegui concluir',
        'O Melhor Envio recusou a autorização. Já estou vendo o que aconteceu.',
        '#D93B54',
      ),
      { status: 502, headers: cabecalhos },
    )
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

    return new Response(
      pagina(
        'Autorizou, mas não guardei',
        'A autorização deu certo e eu não consegui salvar aqui. Me chama, é comigo.',
        '#D93B54',
      ),
      { status: 500, headers: cabecalhos },
    )
  }

  return new Response(
    pagina(
      'Pronto, obrigado!',
      'A sua conta do Melhor Envio está ligada à loja. O frete que aparece para as clientes passa a ser o de verdade.',
      '#237C79',
    ),
    { status: 200, headers: cabecalhos },
  )
})
