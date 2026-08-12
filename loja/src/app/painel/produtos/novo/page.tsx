import Link from 'next/link'
import { FormularioProduto } from '@/componentes/painel/FormularioProduto'

export default function NovoProduto() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/painel/produtos" className="text-sm font-bold text-chalk hover:underline">
          ← Meus produtos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Cadastrar produto</h1>
        <p className="mt-1 text-ink-soft">
          Leva uns três minutos. Você pode salvar e ajustar depois.
        </p>
      </div>

      <FormularioProduto />
    </div>
  )
}
