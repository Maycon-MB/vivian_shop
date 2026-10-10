import Link from 'next/link'

/**
 * Uma linha, perto do botão de enviar, dizendo para que serve o dado pedido ali.
 * `paraQue` completa a frase "Seus dados servem só para…".
 */
export function AvisoDePrivacidade({
  paraQue,
  className,
}: {
  paraQue: string
  className?: string
}) {
  return (
    <p className={className}>
      Seus dados servem só para {paraQue}. Veja a{' '}
      {/* Outra aba: na mesma, o formulário já preenchido se perderia. */}
      <Link href="/privacidade/" target="_blank" rel="noopener noreferrer" prefetch={false}>
        política de privacidade
        <span className="visualmente-oculto"> (abre em outra aba)</span>
      </Link>
      .
    </p>
  )
}
