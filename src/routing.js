/**
 * Roteamento por hash do protótipo.
 *
 * Separado do App para poder ser testado sem montar a árvore React —
 * ver src/routing.test.js.
 */

export const VIEWS = [
  { id: 'landing', label: 'Loja', hash: '', className: 'landing' },
  { id: 'admin', label: 'Painel', hash: '#painel', className: 'admin' },
  { id: 'how', label: 'Como funciona', hash: '#como-funciona', className: 'how' },
  { id: 'identity', label: 'Identidade', hash: '#identidade', className: 'ident' },
]

/**
 * Endereços compartilhados antes desta versão. Continuam funcionando para
 * não quebrar links que já saíram por WhatsApp.
 *
 * As seções internas da antiga proposta caem em "Como funciona", que é o
 * conteúdo mais próximo do que elas explicavam.
 */
export const LEGACY_HASHES = {
  '#demo': 'landing',
  '#admin': 'admin',
  '#proposta': 'how',
  '#inicio': 'how',
  '#experiencia': 'how',
  '#confianca': 'how',
  '#instagram': 'how',
  '#comparacao': 'how',
  '#logistica': 'how',
  '#investimento': 'how',
  '#faq': 'how',
}

export const DEFAULT_VIEW = 'landing'

/** Endereço → view. Hash desconhecido cai na loja, nunca em tela em branco. */
export const viewForHash = (hash) => {
  if (!hash || hash === '#') return DEFAULT_VIEW

  const current = VIEWS.find((view) => view.hash === hash)
  if (current) return current.id

  return LEGACY_HASHES[hash] ?? DEFAULT_VIEW
}

/** View → endereço. A loja não usa hash: mora na raiz. */
export const hashForView = (id) => VIEWS.find((view) => view.id === id)?.hash ?? ''
