import type { Etapa } from '@/dominio/funil'

/** Conta a etapa sem pôr o cliente do Supabase no peso inicial da página. Nunca lança. */
export const marcarEtapa = (etapa: Etapa): void => {
  void import('@/dados/visitasNoBanco')
    .then(({ contarEtapa }) => contarEtapa(etapa))
    .catch(() => {})
}
