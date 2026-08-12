/**
 * Prefixo dos caminhos públicos.
 *
 * Em produção a loja é servida de /vivian_shop/loja/, e imagens escritas
 * com `<img src="/foto.png">` cairiam na raiz do domínio. O Next aplica o
 * basePath sozinho em `<Image>` e em `<Link>`, mas não dentro de strings —
 * então este prefixo entra à mão nos caminhos montados como texto.
 *
 * Precisa começar com NEXT_PUBLIC_ para o valor chegar ao navegador.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH
  ? `${process.env.NEXT_PUBLIC_BASE_PATH}/`
  : '/'
