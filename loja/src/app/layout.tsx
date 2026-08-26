import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../telas/prototipo.css'
import './globals.css'
import { ProvedorCarrinho } from '@/telas/CarrinhoContexto'

/* A Inter no corpo, trocada em 26/08.

   Antes era a Atkinson Hyperlegible, escolhida pelo motivo certo: ela foi
   desenhada pelo Braille Institute para diferenciar caracteres que se
   confundem. O preço apareceu numa auditoria: **o zero dela é cortado**, e
   a loja inteira mostrava "R$ 27Ø,ØØ" e "14Ø temas". Numa loja de
   lembrancinha de festa infantil, preço com zero cortado lê como erro de
   sistema, e preço é o que a cliente olha primeiro.

   A Inter mantém a distinção entre I, l e 1, que era metade do motivo, e
   escreve número como as pessoas esperam. A Fraunces continua nos
   títulos: é a personalidade da marca. */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  /* Dois pesos, como a fonte anterior tinha. Com quatro, quatro telas
     passaram do limite de peso de uma vez: cada peso é um arquivo, e a
     loja abre no 4G. O 600 que o CSS pede o navegador aproxima do 700. */
  weight: ['400', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Feito para você! Personalizados',
  description: 'Papelaria personalizada e material pedagógico para quem ensina.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <ProvedorCarrinho>
          {/* Sem faixas e sem botão de WhatsApp aqui: eles são da loja, e
              cada área traz o que é seu. Ver (loja)/layout.tsx e
              admin/layout.tsx. */}
          <div className="app-container">{children}</div>
        </ProvedorCarrinho>
      </body>
    </html>
  )
}
