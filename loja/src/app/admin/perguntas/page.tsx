import Perguntas from '@/telas/Perguntas'
import { VoltarAoPainel } from '@/componentes/VoltarAoPainel'
import '@/telas/perguntas.css'

export const metadata = {
  title: 'O que ainda falta decidir · Feito para você! Personalizados',
  description:
    'As perguntas que faltam para a loja abrir. Responda no seu tempo: o que você escreve fica salvo neste aparelho.',
}

export default function Pagina() {
  return (
    <>
      <VoltarAoPainel />
      <Perguntas />
    </>
  )
}
