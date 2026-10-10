import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import Privacidade from './Privacidade'
import { metadata } from '@/app/(loja)/privacidade/page'

const abrir = () => render(<Privacidade />)

const textoDaPagina = () => document.body.textContent ?? ''

describe('a política de privacidade', () => {
  it('responde as perguntas de quem compra, uma seção para cada', () => {
    abrir()

    const titulos = screen
      .getAllByRole('heading', { level: 2 })
      .map((titulo) => titulo.textContent)

    expect(titulos).toEqual([
      'Quem cuida dos seus dados',
      'O que a loja guarda e para quê',
      'Quem recebe os seus dados',
      'O que fica no seu navegador',
      'Por quanto tempo',
      'Seus direitos',
      'Crianças',
      'Mudanças nesta política',
    ])
  })

  it('diz quem responde pelos dados e leva à conversa da loja para pedir qualquer coisa', () => {
    abrir()

    expect(textoDaPagina()).toContain('Feito para você! Personalizados')

    const conversas = screen.getAllByRole('link', { name: /conversa da loja/i })
    expect(conversas.length).toBeGreaterThan(0)
    for (const link of conversas) expect(link).toHaveAttribute('href', '/?conversa=1')
  })

  it('conta o que fica guardado na compra, na conta, na conversa e na avaliação', () => {
    abrir()
    const texto = textoDaPagina()

    expect(texto).toMatch(/nome, e-mail e WhatsApp/)
    expect(texto).toMatch(/endereço de entrega/)
    expect(texto).toMatch(/nome, e-mail e senha/)
    expect(texto).toMatch(/nome, e-mail e a sua mensagem/)
    expect(texto).toMatch(/primeiro nome, a nota/)
    expect(texto).toMatch(/depois que a loja aprova/)
    expect(texto).toMatch(/14 dias/)
  })

  it('garante que o número do cartão nunca passa pela loja', () => {
    abrir()

    expect(textoDaPagina()).toMatch(/número do cartão nunca passa pela loja/)
  })

  it('explica que a contagem de visita não identifica ninguém', () => {
    abrir()

    expect(textoDaPagina()).toMatch(/nada identifica quem visitou/)
  })

  it('diz com quem divide os dados, e que parte deles sai do Brasil', () => {
    abrir()
    const texto = textoDaPagina()

    for (const servico of ['Supabase', 'Mercado Pago', 'Resend', 'Melhor Envio', 'GitHub']) {
      expect(texto).toContain(servico)
    }
    expect(texto).toMatch(/São Paulo/)
    expect(texto).toMatch(/Estados Unidos/)
  })

  it('promete que a loja não vende dados nem usa rastreamento de propaganda', () => {
    abrir()

    expect(textoDaPagina()).toMatch(/não vende os seus dados/)
    expect(textoDaPagina()).toMatch(/rastreamento de propaganda/)
  })

  it('cita a lei e a base de cada uso, sem pedir consentimento para o que é contrato', () => {
    abrir()
    const texto = textoDaPagina()

    expect(texto).toMatch(/Lei 13\.709\/2018/)
    expect(texto).toMatch(/art\. 7º, V\)/)
    expect(texto).toMatch(/art\. 7º, II\)/)
    expect(texto).toMatch(/art\. 7º, I\)/)
    // Caixa de marcar faria o pedido depender de consentimento, e a base dele é o contrato.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('não inventa um prazo em anos para guardar o pedido', () => {
    // O prazo depende de regra fiscal que a loja não confirmou: número inventado vira promessa.
    abrir()

    expect(textoDaPagina()).toMatch(/pelo tempo que a lei exige/)
    expect(textoDaPagina()).not.toMatch(/\d+\s+anos/)
  })

  it('promete resposta em até 15 dias a quem pedir para ver, corrigir ou apagar', () => {
    abrir()
    const texto = textoDaPagina()

    expect(texto).toMatch(/art\. 18/)
    expect(texto).toMatch(/corrigir/)
    expect(texto).toMatch(/apagar/)
    expect(texto).toMatch(/portabilidade/)
    expect(texto).toMatch(/em até 15 dias/)
  })

  it('mostra quando o texto mudou pela última vez', () => {
    abrir()

    expect(textoDaPagina()).toMatch(/Última atualização: \d{1,2} de [a-zç]+ de \d{4}/)
  })

  it('aparece na aba e no Google como a política de privacidade da loja', () => {
    expect(metadata.title).toMatch(/^Política de privacidade/)
    expect(metadata.title).toMatch(/Feito para você! Personalizados/)
  })
})
