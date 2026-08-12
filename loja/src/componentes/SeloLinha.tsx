import { ehDigital, type Linha } from '@/dominio/linhas'

/**
 * Selo que identifica a linha do produto pela cor.
 *
 * Verde-água na personalizada, amarelo na pedagógica. No amarelo o texto é
 * tinta escura, nunca branco — branco sobre amarelo é ilegível.
 */
export function SeloLinha({ linha }: { linha: Linha }) {
  const digital = ehDigital(linha)

  return (
    <span
      className={`inline-block w-fit rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
        digital ? 'bg-marker text-ink' : 'bg-chalk text-white'
      }`}
    >
      {linha}
    </span>
  )
}
