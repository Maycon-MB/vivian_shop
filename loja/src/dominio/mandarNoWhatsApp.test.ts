import { describe, it, expect } from 'vitest'
import { enderecoParaMandar, linkDoWhatsApp, textoParaMandar } from './mandarNoWhatsApp'

const pagina = 'https://feitoparavocepapelaria.com.br/produto/caderno-mickey/'

describe('mandar um produto no WhatsApp', () => {
  it('marca o endereço com origem whatsapp para a visita ser contada', () => {
    expect(enderecoParaMandar(pagina)).toBe(`${pagina}?origem=whatsapp`)
  })

  it('troca a origem que já estava no endereço', () => {
    expect(enderecoParaMandar(`${pagina}?origem=instagram#topo`)).toBe(
      `${pagina}?origem=whatsapp`,
    )
  })

  it('o texto leva o nome do produto e o endereço', () => {
    const texto = textoParaMandar('Caderno Mickey', pagina)
    expect(texto).toContain('Caderno Mickey')
    expect(texto).toContain(`${pagina}?origem=whatsapp`)
    expect(texto).not.toMatch(/[—–]/)
  })

  it('o link do wa.me leva o texto codificado', () => {
    const link = linkDoWhatsApp('Caderno & Agenda', pagina)
    expect(link.startsWith('https://wa.me/?text=')).toBe(true)
    const texto = decodeURIComponent(link.slice('https://wa.me/?text='.length))
    expect(texto).toBe(textoParaMandar('Caderno & Agenda', pagina))
  })
})
