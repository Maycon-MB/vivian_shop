import Privacidade from '@/telas/Privacidade'
import '@/telas/paginas.css'

export const metadata = {
  title: 'Política de privacidade · Feito para você! Personalizados',
  description:
    'Quais dados a loja guarda, para que servem, com quem são compartilhados e como pedir para ver, corrigir ou apagar.',
}

export default function Pagina() {
  return <Privacidade />
}
