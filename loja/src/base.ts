/**
 * Prefixo dos caminhos públicos.
 *
 * Com domínio próprio a loja mora na raiz, e este prefixo é vazio. Ele
 * continua existindo porque o Next aplica o basePath sozinho em `<Image>`
 * e em `<Link>`, mas não dentro de strings: se um dia o site voltar a
 * morar sob um caminho, é aqui que os caminhos montados como texto
 * continuam certos.
 *
 * Precisa começar com NEXT_PUBLIC_ para o valor chegar ao navegador.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH
  ? `${process.env.NEXT_PUBLIC_BASE_PATH}/`
  : '/'
