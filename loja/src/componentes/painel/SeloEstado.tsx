import { ESTADOS_PEDIDO, type EstadoPedido } from '@/dominio/pedido'

/**
 * Estado do pedido, com cor.
 *
 * A cor é semântica e não decorativa: amarelo é o que exige ela hoje,
 * verde é o que já saiu, cinza é o que espera terceiros. Bate o olho na
 * lista e sabe onde mexer.
 */

const CORES: Record<string, string> = {
  neutro: 'bg-rule-faint text-ink-soft',
  atencao: 'bg-marker text-ink',
  acao: 'bg-chalk text-white',
  ok: 'bg-chalk/15 text-chalk',
  problema: 'bg-heart/15 text-heart',
}

export function SeloEstado({ estado }: { estado: EstadoPedido }) {
  const info = ESTADOS_PEDIDO[estado]

  return (
    <span
      className={`inline-block w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
        CORES[info.cor]
      }`}
    >
      {info.rotulo}
    </span>
  )
}
