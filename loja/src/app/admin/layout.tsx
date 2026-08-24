import '@/telas/admin.css'

export const metadata = {
  title: 'A sua loja · Feito para você! Personalizados',
  // Área da dona: não interessa a buscador, e não deve aparecer em busca.
  robots: { index: false, follow: false },
}

/**
 * O que envolve as telas da Vivian.
 *
 * Aqui não entram as faixas da loja nem o botão de WhatsApp: ela não
 * precisa de aviso dizendo que a loja é demonstração, nem de um botão
 * para chamar a si mesma.
 *
 * A separação entre loja e administração segue o desenho do athos-gg, que
 * o Maycon já usa em outro projeto: `/admin` com layout próprio e a loja
 * intacta do lado de fora.
 *
 * A navegação não fica aqui: o painel já tinha a barra lateral dele, e
 * criar outra no layout repetia na área dela o erro que eu tinha acabado
 * de corrigir na loja — duas navegações competindo na mesma tela. Os
 * documentos do projeto entraram naquela barra, ver dashboard/Sidebar.
 */
export default function LayoutDoAdmin({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-area">{children}</div>
  )
}
