/**
 * Convida a cliente a avaliar o que comprou.
 *
 * Sem este e-mail, a tela de avaliar existe e ninguém chega nela: o link
 * carrega uma chave que só o pedido dela tem, e essa chave não está em
 * lugar nenhum além daqui.
 *
 * ── Por que só depois de duas semanas ──────────────────────────────────
 *
 * O pedido dela leva 5 dias úteis de produção mais o prazo dos Correios.
 * Convidar antes disso é pedir opinião sobre um pacote que ainda não
 * chegou, e a resposta seria sobre a espera.
 *
 * Duas semanas depois do pagamento é quando a festa já aconteceu e a
 * cliente tem o que contar. Quem decide quando disparar é o gatilho do
 * banco; esta função só escreve e manda.
 *
 * Publicar:
 *
 *     supabase functions deploy convite-de-avaliacao
 */

const DOMINIO = 'feitoparavocepapelaria.com.br'
const DE = `Feito para Você! <avisos@${DOMINIO}>`

interface Convite {
  para: string
  nome: string
  chave: string
  produtos: string[]
}

/**
 * O texto do convite.
 *
 * Curto, e pedindo uma coisa só. Pedido de avaliação que explica o quanto
 * é importante para a loja é sobre a loja; este é sobre o que ela achou.
 *
 * Sem travessão, como todo texto que a cliente lê. Existe teste que varre
 * este arquivo.
 */
export const corpoDoConvite = ({ nome, chave, produtos }: Convite) => {
  const primeiro = nome.trim().split(/\s+/)[0] || 'tudo bem'
  const oQue = produtos.length === 1 ? produtos[0] : 'o que você pediu'
  const quebra = String.fromCharCode(10)

  return {
    assunto: `${primeiro}, o que você achou?`,
    texto: [
      `Oi, ${primeiro}!`,
      '',
      `Espero que ${oQue} tenha ficado do jeito que você imaginou.`,
      '',
      'Se puder contar em uma frase o que achou, ajuda muito quem está pensando',
      'em comprar e ainda não conhece a loja:',
      '',
      `https://${DOMINIO}/avaliar/?pedido=${chave}`,
      '',
      'Leva menos de um minuto, e só o seu primeiro nome aparece.',
      '',
      'Obrigada!',
      'Feito para Você! Papelaria Personalizada',
    ].join(quebra),
  }
}

const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

Deno.serve(async (req: Request) => {
  const chaveDoResend = Deno.env.get('RESEND_API_KEY')
  const segredo = Deno.env.get('SEGREDO_DO_GATILHO')

  /* O mesmo segredo do aviso de mensagem. A função está publicada na
     internet: sem esta conferência, qualquer um dispara e-mail em nome da
     loja dela, e com um link de avaliação dentro. */
  if (!segredo || req.headers.get('x-segredo-do-gatilho') !== segredo) {
    return responder({ erro: 'não autorizado' }, 401)
  }

  if (!chaveDoResend) return responder({ erro: 'falta a chave do Resend' }, 500)

  let convite: Convite
  try {
    convite = await req.json()
  } catch {
    return responder({ erro: 'corpo inválido' }, 400)
  }

  if (!convite?.para || !convite?.chave) {
    return responder({ erro: 'falta o destinatário ou a chave' }, 400)
  }

  const { assunto, texto } = corpoDoConvite(convite)

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${chaveDoResend}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: DE,
      to: [convite.para],
      subject: assunto,
      text: texto,
    }),
  })

  if (!resposta.ok) return responder({ erro: await resposta.text() }, 502)

  return responder({ enviado: true })
})
