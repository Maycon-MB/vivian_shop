import Custos from '@/telas/Custos'
import { VoltarAoPainel } from '@/componentes/VoltarAoPainel'
import '@/telas/custos.css'

export const metadata = {
  title: 'O que a loja custa · Feito para você! Personalizados',
  description:
    'O que a Vivian paga, para quem, e a partir de que volume de vendas cada custo aparece.',
}

export default function Pagina() {
  return (
    <>
      <VoltarAoPainel />
      <Custos />
    </>
  )
}
