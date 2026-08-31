/**
 * Quanto custa mandar o pacote até o CEP da cliente.
 *
 * Chamada pela loja na hora do checkout. Devolve as transportadoras com
 * preço e prazo, já ordenadas da mais barata para a mais cara.
 *
 * ── Por que o token não vai para o navegador ───────────────────────────
 *
 * Porque quem tem o token do Melhor Envio **compra etiqueta e gasta o
 * saldo da conta dela**. A loja é um site estático: qualquer coisa posta
 * lá está dentro da página, à vista de quem abrir as ferramentas do
 * navegador.
 *
 * Por isso a função existe. O que a loja manda é CEP e tamanho do pacote,
 * e o que volta é preço. O token nunca sai daqui.
 *
 * ── O CEP de origem também não ─────────────────────────────────────────
 *
 * É o endereço da casa dela. Fica na variável da função, junto do resto
 * dos segredos, e não numa tabela que a chave da página alcança.
 *
 * ── Por que renova antes de vencer ─────────────────────────────────────
 *
 * O token vale 30 dias. Descobrir que venceu no meio de uma compra é
 * perder a venda: a cliente vê "não consegui calcular o frete" na única
 * tela em que ela ainda pode desistir.
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

const base = () => Deno.env.get('MELHORENVIO_BASE') ?? 'https://melhorenvio.com.br'

const cabecalhosDeles = (token: string) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'Loja Feito para Você (mayconbruno.dev@gmail.com)',
})

interface Credencial {
  token: string
  token_de_renovacao: string
  expira_em: string
}

const banco = () => ({
  url: Deno.env.get('SUPABASE_URL') ?? '',
  chave: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
})

const lerCredencial = async (): Promise<Credencial | null> => {
  const { url, chave } = banco()

  const r = await fetch(
    `${url}/rest/v1/credenciais_do_frete?servico=eq.melhor-envio&select=token,token_de_renovacao,expira_em`,
    { headers: { apikey: chave, Authorization: `Bearer ${chave}` } },
  )

  if (!r.ok) return null

  const linhas = await r.json()
  return linhas?.[0] ?? null
}

const guardar = async (dados: Record<string, unknown>) => {
  const { url, chave } = banco()

  await fetch(`${url}/rest/v1/credenciais_do_frete`, {
    method: 'POST',
    headers: {
      apikey: chave,
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ servico: 'melhor-envio', ...dados }),
  })
}

/* Uma folga de um dia antes do vencimento. Renovar no limite depende de o
   relógio dos dois lados bater, e quando não bate quem descobre é a
   cliente no checkout. */
const FOLGA_MS = 24 * 60 * 60 * 1000

const tokenValido = async (): Promise<string | null> => {
  const credencial = await lerCredencial()
  if (!credencial) return null

  const vence = Date.parse(credencial.expira_em)
  if (Number.isFinite(vence) && vence - Date.now() > FOLGA_MS) return credencial.token

  const r = await fetch(`${base()}/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Loja Feito para Você (mayconbruno.dev@gmail.com)',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: Deno.env.get('MELHORENVIO_CLIENT_ID'),
      client_secret: Deno.env.get('MELHORENVIO_CLIENT_SECRET'),
      refresh_token: credencial.token_de_renovacao,
    }),
  })

  if (!r.ok) {
    console.error('não consegui renovar o token', r.status, await r.text())
    /* O token velho ainda pode valer por até um dia. Devolver ele é
       melhor que devolver nada: a loja continua cotando enquanto eu vejo
       o que houve. */
    return credencial.token
  }

  const novo = await r.json()

  await guardar({
    token: novo.access_token,
    token_de_renovacao: novo.refresh_token,
    expira_em: new Date(Date.now() + Number(novo.expires_in) * 1000).toISOString(),
    atualizado_em: new Date().toISOString(),
  })

  return novo.access_token
}

const soNumero = (cep: unknown) => String(cep ?? '').replace(/\D/g, '')

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const { cepDestino, pesoG, altCm, largCm, compCm } = await req.json().catch(() => ({}))

  const destino = soNumero(cepDestino)
  const origem = soNumero(Deno.env.get('MELHORENVIO_CEP_ORIGEM'))

  if (destino.length !== 8 || origem.length !== 8) {
    return json({ opcoes: [], motivo: 'cep' }, 400)
  }

  const token = await tokenValido()

  /* Sem token, a loja volta para a estimativa em vez de mostrar erro. A
     cliente no checkout não tem nada a ver com a autorização estar
     pendente, e uma tela de erro ali custa a venda. */
  if (!token) return json({ opcoes: [], motivo: 'sem-autorizacao' })

  const r = await fetch(`${base()}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: cabecalhosDeles(token),
    body: JSON.stringify({
      from: { postal_code: origem },
      to: { postal_code: destino },
      products: [
        {
          id: 'pacote',
          width: Number(largCm),
          height: Number(altCm),
          length: Number(compCm),
          // Quilo, e não grama.
          weight: Number(pesoG) / 1000,
          insurance_value: 0,
          quantity: 1,
        },
      ],
    }),
  })

  if (!r.ok) {
    console.error('cotação recusada', r.status, await r.text())
    return json({ opcoes: [], motivo: 'recusado' })
  }

  const resposta = await r.json()

  /* A mesma regra que roda nos testes do domínio, repetida aqui porque
     esta função é Deno e não importa de `loja/src`. Se uma mudar, a outra
     tem que mudar junto: `freteDoMelhorEnvio.ts` é a que tem teste. */
  const opcoes = (Array.isArray(resposta) ? resposta : [])
    .filter((linha: Record<string, unknown>) => !linha?.error)
    .map((linha: Record<string, unknown>) => ({
      id: String(linha.id ?? ''),
      transportadora: (linha.company as { name?: string })?.name ?? '',
      servico: String(linha.name ?? ''),
      valor: Number(linha.price),
      prazoDias: Number(linha.delivery_time ?? 0),
    }))
    .filter((o) => Number.isFinite(o.valor) && o.valor > 0)
    .sort((a, b) => a.valor - b.valor)

  return json({ opcoes })
})
