import TodosOsProdutos from '@/telas/TodosOsProdutos'
import '@/telas/prototipo.css'
import '@/telas/catalogo-todos.css'

export const metadata = {
  title: 'Todos os produtos · Feito para você! Personalizados',
  description:
    'Papelaria personalizada por encomenda: lousa mágica, álbum de figurinhas, revista de passatempo e caneca, com o nome de quem vai ganhar.',
}

export default function Pagina() {
  return <TodosOsProdutos />
}
