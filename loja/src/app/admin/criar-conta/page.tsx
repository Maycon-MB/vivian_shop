import CriarConta from '@/telas/CriarConta'
import '@/telas/paginas.css'

export const metadata = {
  title: 'Criar conta · Feito para você! Personalizados',
  robots: { index: false, follow: false },
}

export default function Pagina() {
  return <CriarConta />
}
