'use client'

import { bancoDoNavegador, temBanco } from '@/servicos/autenticacao'
import {
  caminhoDaVisita,
  contaComoVisita,
  origemDaVisita,
  type Origem,
} from '@/dominio/origemDaVisita'
import type { Etapa, PessoasNaEtapa } from '@/dominio/funil'

/**
 * A contagem de visita, do lado do navegador.
 *
 * O que sai daqui são três coisas: a página, uma palavra de origem, e se
 * é a primeira página desta visita. Nada mais. Não há identificador, não
 * há impressão digital do aparelho, não há como ligar duas visitas à mesma
 * pessoa, e é de propósito: sem isso não é preciso pedir consentimento de
 * cookie, e a cliente abre a loja e vê a loja.
 *
 * ── Por que `sessionStorage`, e não cookie ─────────────────────────────
 *
 * Para separar "cinco pessoas" de "uma pessoa olhando cinco produtos", a
 * loja precisa saber se esta é a primeira página da visita. A marca que
 * responde isso morre quando a aba fecha, nunca sai do navegador de quem
 * visita, e não é enviada a lugar nenhum: o que o banco recebe é um
 * verdadeiro ou falso, e não a marca.
 *
 * Isso torna a contagem de visitante aproximada por baixo: quem volta
 * amanhã conta de novo. É o número certo para a pergunta que ela faz, que
 * é "quanta gente o anúncio trouxe hoje".
 */

const MARCA = 'visita-contada'
const MARCA_DA_ORIGEM = 'visita-origem'
const marcaDaEtapa = (etapa: Etapa) => `etapa-contada:${etapa}`

/** Se esta é a primeira vez que a marca aparece nesta visita. */
const primeiraVez = (marca: string): boolean => {
  try {
    if (window.sessionStorage.getItem(marca)) return false
    window.sessionStorage.setItem(marca, '1')
    return true
  } catch {
    /* Navegador anônimo com armazenamento bloqueado cai aqui. A página
       ainda conta; o visitante não. Perder um número é melhor que quebrar
       a loja de quem navega assim. */
    return false
  }
}

/**
 * Conta uma página aberta.
 *
 * Nunca lança. Uma falha na medição não pode derrubar a página de quem
 * está comprando: o pior que pode acontecer é ela ter um número menor no
 * relatório, e isso não custa uma venda.
 */
export const contarVisita = async (
  caminho: string,
  referencia = '',
  busca = '',
): Promise<void> => {
  if (!temBanco()) return

  /* Antes de qualquer coisa: máquina minha e CI não são cliente dela.
     A regra mora no domínio, com teste. */
  if (typeof window === 'undefined') return
  if (!contaComoVisita(window.location.hostname)) return

  const origem: Origem = origemDaVisita(
    referencia,
    busca,
    typeof window === 'undefined' ? '' : window.location.hostname,
  )

  const primeira = primeiraVez(MARCA)
  if (primeira) guardarOrigem(origem)

  try {
    await bancoDoNavegador().rpc('contar_visita', {
      p_caminho: caminhoDaVisita(caminho),
      p_origem: origem,
      p_primeira: primeira,
    })
  } catch {
    // Medição que quebra a loja não mede nada.
  }
}

/* As etapas acontecem depois de navegar dentro da loja, quando o referrer já é ela mesma. */
const guardarOrigem = (origem: Origem) => {
  try {
    window.sessionStorage.setItem(MARCA_DA_ORIGEM, origem)
  } catch {
    // Sem armazenamento, a etapa conta como direto.
  }
}

const origemGuardada = (): string => {
  try {
    return window.sessionStorage.getItem(MARCA_DA_ORIGEM) ?? 'direto'
  } catch {
    return 'direto'
  }
}

/**
 * Conta uma etapa do funil, uma vez por visita.
 *
 * Nunca lança, e não conta fora da loja publicada, pelas mesmas guardas de `contarVisita`.
 */
export const contarEtapa = async (etapa: Etapa): Promise<void> => {
  if (!temBanco()) return
  if (typeof window === 'undefined') return
  if (!contaComoVisita(window.location.hostname)) return
  if (!primeiraVez(marcaDaEtapa(etapa))) return

  try {
    await bancoDoNavegador().rpc('contar_etapa', { p_etapa: etapa, p_origem: origemGuardada() })
  } catch {
    // Medição que quebra a loja não mede nada.
  }
}

/**
 * Quantas pessoas chegaram a cada etapa nos últimos `dias`, mais os pedidos pagos
 * (etapa `pago`). Só responde para a dona; falha vira lista vazia.
 */
export const funilDaLoja = async (dias = 30): Promise<PessoasNaEtapa[]> => {
  if (!temBanco()) return []

  try {
    const { data } = await bancoDoNavegador().rpc('funil_da_loja', { p_dias: dias })
    return (data ?? []) as PessoasNaEtapa[]
  } catch {
    return []
  }
}

export interface DiaDeVisita {
  dia: string
  visitantes: number
  paginas: number
}

export interface OrigemDeVisita {
  origem: string
  visitantes: number
  paginas: number
}

export interface PaginaVista {
  caminho: string
  paginas: number
}

/**
 * O movimento da loja, para o painel dela.
 *
 * As três perguntas vão juntas porque a tela mostra as três juntas, e três
 * idas ao banco pelo 4G dela demoram mais que uma.
 *
 * Só responde para quem é dona: quem decide isso é o banco, dentro de cada
 * função, e não este arquivo.
 */
export const movimentoDaLoja = async (
  dias = 30,
): Promise<{
  porDia: DiaDeVisita[]
  porOrigem: OrigemDeVisita[]
  maisVistas: PaginaVista[]
}> => {
  const vazio = { porDia: [], porOrigem: [], maisVistas: [] }
  if (!temBanco()) return vazio

  const banco = bancoDoNavegador()

  try {
    const [dia, origem, paginas] = await Promise.all([
      banco.rpc('resumo_de_visitas', { p_dias: dias }),
      banco.rpc('visitas_por_origem', { p_dias: dias }),
      banco.rpc('paginas_mais_vistas', { p_dias: dias, p_quantas: 10 }),
    ])

    return {
      porDia: (dia.data ?? []) as DiaDeVisita[],
      porOrigem: (origem.data ?? []) as OrigemDeVisita[],
      maisVistas: (paginas.data ?? []) as PaginaVista[],
    }
  } catch {
    return vazio
  }
}
