import type { Metadata } from 'next'
import { Fraunces, Atkinson_Hyperlegible } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../telas/prototipo.css'
import './globals.css'
import { Navegacao } from '@/componentes/Navegacao'
import { ProvedorCarrinho } from '@/telas/CarrinhoContexto'

/* A Atkinson Hyperlegible é escolha funcional, não estética: foi desenhada
   pelo Braille Institute para diferenciar caracteres que se confundem —
   i maiúsculo, l minúsculo e o número 1 têm formas distintas, e o zero é
   cortado. Boa parte de quem compra a linha pedagógica compra justamente
   por acessibilidade. */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
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
    <html lang="pt-BR" className={`${fraunces.variable} ${atkinson.variable}`}>
      <body>
        <ProvedorCarrinho>
          <div className="app-container">
            <Navegacao />
            <main>{children}</main>
          </div>
        </ProvedorCarrinho>
      </body>
    </html>
  )
}
