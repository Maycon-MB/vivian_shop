import type { NextConfig } from 'next'

/**
 * Exportação estática, para publicar no GitHub Pages junto do protótipo.
 *
 * O protótipo em Vite continua servido na raiz de /vivian_shop/, e esta
 * loja fica em /vivian_shop/loja/ — as duas coisas convivem enquanto a
 * cliente acompanha uma e a outra é construída.
 *
 * `basePath` só é aplicado na publicação: em `npm run dev` a loja roda na
 * raiz, sem prefixo, para não atrapalhar o desenvolvimento.
 */
const publicando = process.env.PUBLICAR_GITHUB_PAGES === 'true'

const base = publicando ? '/vivian_shop/loja' : ''

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
