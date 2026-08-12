import { Escudo, Conversa, Caminhao } from './icones'

/**
 * Rodapé.
 *
 * As três garantias vêm antes dos links porque loja nova não tem
 * reputação: quem chega pelo Instagram precisa de motivo para confiar
 * antes de digitar o cartão.
 */
export function Rodape() {
  return (
    <footer className="mt-16 border-t border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Garantia icone={<Escudo size={22} />} titulo="Pagamento seguro">
            Processado pelo Mercado Pago. Os dados do seu cartão não ficam guardados na loja.
          </Garantia>
          <Garantia icone={<Caminhao size={22} />} titulo="Envio para todo o Brasil">
            Correios e Jadlog, com o código de rastreio no e-mail assim que o pedido é postado.
          </Garantia>
          <Garantia icone={<Conversa size={22} />} titulo="Atendimento direto">
            Quem responde é a Vivian, a mesma pessoa que faz as peças.
          </Garantia>
        </div>

        <div className="mt-10 border-t border-rule-faint pt-6 text-sm text-ink-soft">
          <p className="font-display text-base font-semibold text-ink">
            Feito para você! Personalizados
          </p>
          <p className="mt-1">
            Papelaria personalizada e material pedagógico · Rio de Janeiro, RJ
          </p>
        </div>
      </div>
    </footer>
  )
}

function Garantia({
  icone,
  titulo,
  children,
}: {
  icone: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-chalk">{icone}</span>
      <strong className="text-sm">{titulo}</strong>
      <p className="text-sm text-ink-soft">{children}</p>
    </div>
  )
}
