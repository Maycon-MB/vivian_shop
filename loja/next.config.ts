import type { NextConfig } from 'next'

/**
 * Exportação estática para o GitHub Pages.
 *
 * Onde a loja mora depende de uma variável, e não de uma branch parada.
 *
 * Sem domínio, o GitHub Pages serve um repositório em
 * maycon-mb.github.io/vivian_shop, e o prefixo precisa existir. Com o
 * domínio feitoparavocepapelaria.com.br, registrado no nome da Vivian em
 * 21/08/2026, o site passa a ser servido na raiz e o prefixo tem que
 * sumir: mantê-lo faria todo link apontar para
 * feitoparavocepapelaria.com.br/vivian_shop/, que não existe.
 *
 * A troca é `DOMINIO_PRONTO=true` nas variáveis do repositório, ligada
 * quando o DNS estiver de pé. Ficar esperando numa branch seria pior: o
 * trabalho some de vista, e quem der `git pull` na máquina errada não vê
 * nada disso.
 *
 * Em `npm run dev` a loja sempre roda na raiz, com ou sem domínio, para o
 * prefixo não atrapalhar o desenvolvimento.
 */
const publicando = process.env.PUBLICAR_GITHUB_PAGES === 'true'
const dominioProprio = process.env.DOMINIO_PRONTO === 'true'

const base = publicando && !dominioProprio ? '/vivian_shop' : ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath: base || undefined,
  // Chega ao navegador para montar caminhos de imagem escritos como texto.
  env: { NEXT_PUBLIC_BASE_PATH: base },
  // GitHub Pages não tem o otimizador de imagem do Next.
  images: { unoptimized: true },
  // Sem isso, /produto/x devolve 404 no Pages: ele espera /produto/x/index.html
  trailingSlash: true,
}

export default nextConfig
