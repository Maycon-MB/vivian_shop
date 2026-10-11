/**
 * O que vai quando alguém manda um produto no WhatsApp: nome e endereço
 * marcado com `origem=whatsapp`, para a visita entrar na conta certa.
 */

export const enderecoParaMandar = (endereco: string): string => {
  const url = new URL(endereco)
  url.hash = ''
  url.search = ''
  url.searchParams.set('origem', 'whatsapp')
  return url.toString()
}

export const textoParaMandar = (nome: string, endereco: string): string =>
  `Olha que lindo: ${nome}\n${enderecoParaMandar(endereco)}`

export const linkDoWhatsApp = (nome: string, endereco: string): string =>
  `https://wa.me/?text=${encodeURIComponent(textoParaMandar(nome, endereco))}`
