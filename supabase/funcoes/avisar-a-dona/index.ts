/**
 * Avisa a Vivian de que uma cliente pediu para falar com ela.
 *
 * É a última parte do que foi prometido a ela em 24/08:
 *
 *   > "eu peço nome e e-mail dela antes de mandar a mensagem pra você"
 *
 * Até aqui, "mandar a mensagem pra você" queria dizer deixá-la no painel.
 * Se ela não abrisse o painel, não ficava sabendo. Agora chega no e-mail
 * dela, e o painel deixa de ser o único jeito de descobrir.
 *
 * ── Por que isto roda no servidor, e não no navegador ─────────────────
 *
 * A chave do Resend manda e-mail em nome do domínio dela. No navegador
 * ela iria dentro da página, e qualquer pessoa a copiaria em dez segundos
 * para mandar e-mail se passando pela loja. Aqui ela vive nos segredos do
 * projeto e nunca sai do servidor.
 *
 * É a mesma razão de a chave de serviço do Supabase nunca ir ao navegador.
 *
 * ── Como é chamada ────────────────────────────────────────────────────
 *
 * Por um gatilho do Postgres, quando uma conversa passa a `escalada`. Ver
 * a migração 0009. Ninguém a chama de fora: ela confere o segredo
 * combinado antes de fazer qualquer coisa.
 *
 * Publicar:
 *
 *     supabase functions deploy avisar-a-dona
 *     supabase secrets set RESEND_API_KEY=re_...
 *     supabase secrets set SEGREDO_DO_GATILHO=...
 */

const DOMINIO = 'feitoparavocepapelaria.com.br'
const PAINEL = `https://${DOMINIO}/admin/?aba=mensagens`
const PAINEL_DE_PEDIDOS = `https://${DOMINIO}/admin/?aba=pedidos`

/* O remetente precisa ser do domínio verificado no Resend. Um endereço de
   Gmail aqui faz o e-mail cair em spam ou ser recusado. */
const DE = `Loja <avisos@${DOMINIO}>`

interface Aviso {
  nome: string
  email: string
  pergunta: string
  para: string[]
}

/**
 * O aviso de venda paga, mandado pelo gatilho da migração 0018.
 *
 * Chega no mesmo endereço do aviso de mensagem, e não numa função nova,
 * porque a chave do Resend, o segredo do gatilho e o remetente verificado
 * são os mesmos. Duas funções seriam dois lugares para configurar e dois
 * para esquecer de publicar.
 */
interface Venda {
  tipo: 'venda'
  numero: string
  total: number | string
  comprador?: string
  para: string[]
}

const ehVenda = (corpo: Aviso | Venda): corpo is Venda =>
  (corpo as Venda)?.tipo === 'venda'

/** Em reais, como ela lê no painel e no extrato. */
const emReais = (valor: number | string) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * O texto do aviso.
 *
 * A pergunta da cliente vai inteira, e não resumida: com ela no corpo, a
 * Vivian decide do celular se responde agora ou depois, sem abrir o
 * painel para descobrir do que se trata.
 *
 * Sem travessão, como todo texto que ela lê. Existe teste que varre este
 * arquivo.
 */
export const corpoDoAviso = ({ nome, email, pergunta }: Aviso) => ({
  assunto: `${nome} quer falar com você`,
  texto: [
    `${nome} deixou uma mensagem na loja:`,
    '',
    `"${pergunta}"`,
    '',
    `Para responder, é só responder para ${email}.`,
    '',
    `A conversa também está no seu painel: ${PAINEL}`,
  ].join(String.fromCharCode(10)),
})

/**
 * O texto do aviso de venda.
 *
 * Número e valor no corpo, e não só no assunto: é o que ela precisa para
 * decidir do celular se corre produzir agora ou se olha depois, sem abrir
 * o painel para descobrir do que se trata.
 *
 * Sem travessão, como todo texto que ela lê. Existe teste que varre este
 * arquivo.
 */
export const corpoDaVenda = ({ numero, total, comprador }: Venda) => ({
  assunto: `Venda nova: pedido ${numero}`,
  texto: [
    comprador
      ? `${comprador} acabou de comprar na sua loja.`
      : 'Você acabou de vender na sua loja.',
    '',
    `Pedido ${numero}`,
    `Valor ${emReais(total)}`,
    '',
    'O pagamento já foi confirmado pelo Mercado Pago.',
    '',
    `Os detalhes estão no seu painel: ${PAINEL_DE_PEDIDOS}`,
  ].join(String.fromCharCode(10)),
})

const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

Deno.serve(async (req: Request) => {
  const chaveDoResend = Deno.env.get('RESEND_API_KEY')
  const segredo = Deno.env.get('SEGREDO_DO_GATILHO')

  /* Sem o segredo combinado, ninguém entra. A função está publicada na
     internet: sem esta conferência, qualquer um dispara e-mail em nome da
     loja dela. */
  if (!segredo || req.headers.get('x-segredo-do-gatilho') !== segredo) {
    return responder({ erro: 'não autorizado' }, 401)
  }

  if (!chaveDoResend) return responder({ erro: 'falta a chave do Resend' }, 500)

  let aviso: Aviso | Venda
  try {
    aviso = await req.json()
  } catch {
    return responder({ erro: 'corpo inválido' }, 400)
  }

  if (!aviso?.para?.length) return responder({ erro: 'sem destinatária' }, 400)

  const daVenda = ehVenda(aviso)
  const { assunto, texto } = daVenda ? corpoDaVenda(aviso) : corpoDoAviso(aviso)

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${chaveDoResend}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: DE,
      to: aviso.para,
      /* A cliente responde no e-mail dela quando a Vivian apertar
         "responder", sem precisar copiar endereço nenhum.

         No aviso de venda não há para quem responder: o endereço de quem
         comprou está no painel, junto do pedido, e responder ao aviso
         mandaria e-mail para a loja dela mesma. */
      ...(daVenda ? {} : { reply_to: (aviso as Aviso).email }),
      subject: assunto,
      text: texto,
    }),
  })

  if (!resposta.ok) {
    return responder({ erro: await resposta.text() }, 502)
  }

  return responder({ enviado: true })
})
