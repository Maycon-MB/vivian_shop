import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { avisosSimulados, listarAvisos } from './avisosSimulados'
import type { Aviso } from './contratos'

const CHAVE = 'feito-para-voce:avisos'

const armazenamentoDeMentira = () => {
  const conteudo = new Map<string, string>()
  return {
    getItem: (chave: string) => conteudo.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void conteudo.set(chave, valor),
    removeItem: (chave: string) => void conteudo.delete(chave),
  } as unknown as Storage
}

const aviso = {
  tipo: 'pedido-confirmado',
  para: { nome: 'Ana Souza', email: 'ana@exemplo.com', whatsapp: '11999990000' },
  pedido: { numero: 'FPV-0001', total: 120 },
} as unknown as Aviso

const globalComJanela = globalThis as { window?: { localStorage: Storage } }

describe('avisos que a loja mandaria', () => {
  beforeEach(() => {
    globalComJanela.window = { localStorage: armazenamentoDeMentira() }
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    delete globalComJanela.window
  })

  it('na loja de verdade não deixa nome, e-mail e WhatsApp da cliente no navegador', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://loja.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chave')

    await avisosSimulados.enviar(aviso)

    expect(globalComJanela.window!.localStorage.getItem(CHAVE)).toBeNull()
  })

  it('na demonstração guarda o texto para o painel mostrar o que teria saído', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    await avisosSimulados.enviar(aviso)

    expect(listarAvisos()).toHaveLength(1)
  })
})
