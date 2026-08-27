/**
 * De onde a pessoa veio, e qual página ela abriu.
 *
 * Estas duas respostas são o que a loja conta. Não se guarda quem, nem de
 * qual aparelho, nem nada que ligue duas visitas à mesma pessoa: o banco
 * recebe um dia, uma página e uma palavra de origem, e soma um.
 *
 * A conta mora aqui, fora do navegador, porque é regra e não tela: o que
 * conta como "veio do Instagram" muda com o tempo, e precisa ser
 * conferível sem abrir o site.
 */

/**
 * As origens que o banco aceita.
 *
 * É lista fechada dos dois lados. Aqui porque o relatório dela precisa de
 * poucas palavras para ser legível; lá porque a chamada sai de dentro da
 * página, e quem quiser manda o que quiser.
 */
export const ORIGENS = [
  'direto',
  'instagram',
  'facebook',
  'whatsapp',
  'google',
  'pinterest',
  'tiktok',
  'youtube',
  'anuncio',
  'outro',
] as const

export type Origem = (typeof ORIGENS)[number]

/* Um pedaço do endereço de quem mandou basta, e é o que sobrevive às
   trocas de domínio que essas empresas fazem sem avisar: `l.instagram.com`,
   `m.facebook.com`, `lm.facebook.com`, `google.com.br`. */
const POR_ENDERECO: [string, Origem][] = [
  ['instagram', 'instagram'],
  ['facebook', 'facebook'],
  ['fb.', 'facebook'],
  ['whatsapp', 'whatsapp'],
  ['wa.me', 'whatsapp'],
  ['google', 'google'],
  ['pinterest', 'pinterest'],
  ['tiktok', 'tiktok'],
  ['youtube', 'youtube'],
  ['youtu.be', 'youtube'],
]

const eOrigem = (valor: string): valor is Origem =>
  (ORIGENS as readonly string[]).includes(valor)

/**
 * A origem de uma visita.
 *
 * @param referencia  o endereço de quem mandou a pessoa para cá (o
 *                    `document.referrer`), vazio quando ela digitou a loja
 *                    ou veio de um lugar que não conta de onde veio.
 * @param busca       o que vem depois do `?` no endereço.
 * @param nosso       o domínio da loja, para não contar navegação interna
 *                    como visita nova.
 */
export const origemDaVisita = (
  referencia: string,
  busca = '',
  nosso = '',
): Origem => {
  /* O que ela escrever no link do anúncio vence o resto.
     É o único jeito de separar o clique pago do post normal: os dois
     chegam com `instagram.com` no referrer. */
  const parametros = new URLSearchParams(busca)
  const marcado = (
    parametros.get('origem') ??
    parametros.get('utm_source') ??
    ''
  )
    .trim()
    .toLowerCase()

  if (marcado) {
    if (eOrigem(marcado) && marcado !== 'direto') return marcado
    const conhecido = POR_ENDERECO.find(([pedaco]) => marcado.includes(pedaco))
    return conhecido ? conhecido[1] : 'outro'
  }

  const de = referencia.trim().toLowerCase()
  if (!de) return 'direto'

  /* Ir da vitrine para o produto não é uma visita nova. Sem esta linha, a
     loja contaria a si mesma como sua maior origem de tráfego, e o número
     que ela usa para decidir o anúncio ficaria inútil. */
  if (nosso && de.includes(nosso.trim().toLowerCase())) return 'direto'

  const achado = POR_ENDERECO.find(([pedaco]) => de.includes(pedaco))
  return achado ? achado[1] : 'outro'
}

/**
 * A página aberta, no formato que o relatório dela consegue ler.
 *
 * Sem `?` e sem `#`: um link de campanha com cinco parâmetros viraria uma
 * linha nova a cada clique, e a página mais vista da loja apareceria
 * quebrada em dezenas de pedaços.
 */
export const caminhoDaVisita = (endereco: string): string => {
  const semAncora = endereco.split('#')[0]
  const semBusca = semAncora.split('?')[0]

  /* O site é estático, e o servidor entrega a mesma página em `/produto/x`
     e em `/produto/x/index.html`. São a mesma linha no relatório. */
  const semArquivo = semBusca.replace(/\/index\.html?$/i, '/')

  const comBarra = semArquivo.startsWith('/') ? semArquivo : `/${semArquivo}`

  /* `/produto/x/` e `/produto/x` também. A raiz continua sendo `/`. */
  const semBarraFinal =
    comBarra.length > 1 ? comBarra.replace(/\/+$/, '') : comBarra

  return semBarraFinal || '/'
}

/**
 * Onde uma visita conta como visita.
 *
 * O teste de navegação percorre a loja inteira a cada push, contra o site
 * montado em `127.0.0.1` e apontando para o banco de verdade dela. Sem
 * esta regra, cada rodada do CI somaria dezenas de visitas e de páginas no
 * relatório, e o número que decide se o anúncio continua seria a soma do
 * que eu testei com o que as clientes fizeram.
 *
 * É o mesmo erro dos onze pedidos falsos de 25/08, e desta vez é pior:
 * pedido inventado dá para achar e apagar um a um, contador inflado não
 * tem como separar depois.
 *
 * Vale também para o `next dev`, e é de propósito: eu abro a loja dez
 * vezes por dia enquanto trabalho.
 */
const NAO_E_VISITA = ['127.0.0.1', 'localhost', '0.0.0.0', '::1']

export const contaComoVisita = (endereco: string): boolean => {
  const onde = (endereco ?? '').trim().toLowerCase()
  if (!onde) return false
  if (NAO_E_VISITA.includes(onde)) return false
  // `.local` é o que o macOS e algumas redes dão para máquina da casa.
  if (onde.endsWith('.local')) return false
  return true
}
