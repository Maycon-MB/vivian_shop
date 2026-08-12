import { Cabecalho } from '@/componentes/Cabecalho'
import { Rodape } from '@/componentes/Rodape'

/** Tudo que o comprador vê: cabeçalho fixo e rodapé. O painel tem o seu. */
export default function LayoutLoja({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />
      <div className="flex-1">{children}</div>
      <Rodape />
    </div>
  )
}
