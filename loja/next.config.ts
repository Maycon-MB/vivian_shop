import type { NextConfig } from 'next'

/**
 * Exportação estática para o GitHub Pages.
 *
 * A loja é servida na raiz de /vivian_shop/. Foi para lá quando passou a
 * ter tudo que o protótipo em Vite tinha — e mais: o protótipo entregava
 * HTML vazio, com o conteúdo aparecendo só depois do JavaScript, o que
 * deixava o Google vendo uma página em branco.
 *
 * `basePath` só é aplicado na publicação: em `npm run dev` a loja roda na
 * raiz, sem prefixo, para não atrapalhar o desenvolvimento.
 */
const publicando = process.env.PUBLICAR_GITHUB_PAGES === 'true'

const base = publicando ? '/vivian_shop' : ''

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
