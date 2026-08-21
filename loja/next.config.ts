import type { NextConfig } from 'next'

/**
 * Exportação estática para o GitHub Pages.
 *
 * A loja mora na raiz do domínio próprio, feitoparavocepapelaria.com.br,
 * registrado no nome da Vivian em 21/08/2026.
 *
 * Antes disso ela morava em /vivian_shop, que é o caminho que o GitHub
 * Pages dá a um repositório sem domínio. Com domínio próprio o site passa
 * a ser servido na raiz, e o prefixo deixa de existir: mantê-lo faria todo
 * link e toda imagem apontarem para feitoparavocepapelaria.com.br/vivian_shop/,
 * que não existe.
 *
 * Os endereços antigos continuam funcionando: o próprio GitHub redireciona
 * maycon-mb.github.io/vivian_shop/... para o domínio novo.
 */
const base = ''

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
