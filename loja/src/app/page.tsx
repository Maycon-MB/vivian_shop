import { obterCatalogo } from '@/dados'
import { Catalogo } from '@/componentes/Catalogo'

export default async function Home() {
  const catalogo = await obterCatalogo()
  const produtos = await catalogo.listar()

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Feito para você! <span className="text-chalk">Personalizados</span>
        </h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          Papelaria personalizada e material pedagógico para quem ensina.
        </p>
      </header>

      <Catalogo produtos={produtos} />

      <p className="mt-10 rounded-xl border border-rule bg-surface p-4 text-sm text-ink-soft">
        <strong className="text-ink">Esta é a loja em construção.</strong> Os produtos,
        preços e fotos acima são exemplos, para mostrar o formato — os reais entram
        quando o catálogo estiver pronto.
      </p>
    </main>
  )
}
