import Link from 'next/link'

/**
 * O caminho de volta, nas páginas da área dela que não são o painel.
 *
 * O painel tem barra lateral própria; estas páginas, não. Sem isto elas
 * viram beco sem saída: ela entra pelas perguntas, lê, e o único jeito de
 * sair é o botão de voltar do navegador — que em celular muita gente não
 * usa, porque não sabe que existe.
 */
export function VoltarAoPainel() {
  return (
    <p className="admin-voltar-linha">
      <Link href="/admin/" prefetch={false}>
        ← Voltar para as minhas vendas
      </Link>
    </p>
  )
}
