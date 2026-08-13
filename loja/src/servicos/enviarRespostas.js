'use client'

/**
 * Manda as respostas da Vivian para a planilha do Maycon.
 *
 * O botão do WhatsApp resolvia bem no celular e mal no computador: lá ele
 * abre uma página pedindo QR Code, e quem não usa o WhatsApp Web desiste
 * ali. Este caminho funciona igual nos dois, sem depender de aplicativo
 * nenhum estar conectado.
 *
 * Do outro lado há um script do Google, gratuito, na conta do Maycon. Como
 * montar está em docs/receber-respostas-da-vivian.md. Enquanto o endereço
 * não estiver configurado, `podeEnviar` é falso e a página nem mostra o
 * botão — melhor não oferecer do que oferecer algo que não funciona.
 */

const ENDERECO = process.env.NEXT_PUBLIC_FORMULARIO_URL ?? ''

export const podeEnviar = Boolean(ENDERECO)

/**
 * Devolve `{ ok: true }` quando deu certo, ou `{ ok: false, motivo }` com
 * um texto que a Vivian entenda — ela não tem o que fazer com "erro 500".
 *
 * O envio vai como texto puro de propósito. Um `application/json` faria o
 * navegador mandar antes uma requisição de permissão que o script do
 * Google não responde, e o envio falharia sempre. O script lê o corpo como
 * JSON de qualquer forma.
 */
export async function enviarRespostas(respostas) {
  if (!podeEnviar) {
    return { ok: false, motivo: 'O envio ainda não foi configurado.' }
  }

  const corpo = JSON.stringify({
    respostas,
    enviadoEm: new Date().toISOString(),
  })

  try {
    const resposta = await fetch(ENDERECO, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: corpo,
      redirect: 'follow',
    })

    if (!resposta.ok) {
      return {
        ok: false,
        motivo: 'O envio não completou. Suas respostas continuam guardadas aqui.',
      }
    }

    return { ok: true }
  } catch (falha) {
    /* O Google responde num endereço diferente do que recebeu, e alguns
       navegadores recusam ler essa resposta por segurança — mesmo tendo
       entregado a mensagem. Nesse caso a única saída é reenviar sem poder
       ler o resultado: o envio acontece, e a confirmação vira uma aposta
       informada. Por isso a tela também oferece o WhatsApp logo abaixo. */
    try {
      await fetch(ENDERECO, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: corpo,
      })

      return { ok: true, semConfirmacao: true }
    } catch {
      console.error('não consegui enviar as respostas:', falha)
      return {
        ok: false,
        motivo:
          'Não consegui enviar agora — pode ser a internet. Suas respostas continuam guardadas aqui, tente de novo em instantes ou use o WhatsApp.',
      }
    }
  }
}
