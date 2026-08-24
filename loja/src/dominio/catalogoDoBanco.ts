/**
 * De onde a vitrine tira os produtos.
 *
 * A loja tem dois catálogos possíveis: o de exemplo, escrito por mim, e o
 * dela, que veio da Elojinha e vive no banco. Trocar não é editar código —
 * é o que o banco responde na hora de gerar o site.
 *
 * Banco vazio não quer dizer "loja sem produtos": quer dizer "ela ainda
 * não publicou nada". Enquanto isso, mostrar os exemplos é mais honesto do
 * que uma vitrine em branco, porque a loja está em demonstração e o aviso
 * no topo diz exatamente isso.
 */
export const escolherCatalogo = <T>(doBanco: T[] | undefined | null, exemplos: T[]): T[] =>
  doBanco && doBanco.length ? doBanco : exemplos
