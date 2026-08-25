import { describe, it, expect } from 'vitest'

import {
  MINIMO_DA_SENHA,
  conferirCadastro,
  conferirEntrada,
  conferirNovaSenha,
  conferirPedidoDeSenha,
  mensagemDoErro,
} from './entrada'

/**
 * O que a tela de entrar precisa dizer, e como.
 *
 * A Vivian e a Lilian vão usar isto poucas vezes por semana, no celular,
 * entre um pedido e outro. Quem erra a senha aqui não é atacante: é gente
 * com pressa, com o dedo grande e com o corretor do teclado mudando a
 * primeira letra.
 *
 * Por isso duas regras atravessam tudo:
 *
 *   - a mensagem diz o que fazer, e não o que houve. "E-mail inválido"
 *     não ajuda ninguém; "confira se falta o @" ajuda.
 *   - a mensagem nunca entrega se a conta existe. "Senha errada" conta a
 *     um estranho que aquele e-mail tem conta ali.
 */

describe('entrar', () => {
  it('aceita e-mail e senha preenchidos', () => {
    expect(conferirEntrada({ email: 'vivian@exemplo.com', senha: 'a-minha-senha' }).ok).toBe(true)
  })

  it('cobra o e-mail antes de tentar', () => {
    // Ir ao servidor para ouvir "faltou o e-mail" gasta o tempo dela e a
    // internet dela, e a resposta demora mais.
    const r = conferirEntrada({ email: '', senha: 'a-minha-senha' })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.campo).toBe('email')
  })

  it('reconhece e-mail sem arroba, que é o erro comum', () => {
    const r = conferirEntrada({ email: 'vivian.exemplo.com', senha: 'a-minha-senha' })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toMatch(/@/)
  })

  it('ignora espaço que o teclado do celular acrescenta', () => {
    // O corretor põe espaço depois do e-mail o tempo todo.
    expect(conferirEntrada({ email: ' vivian@exemplo.com ', senha: 'senha1234' }).ok).toBe(true)
  })

  it('cobra a senha sem dizer se o e-mail existe', () => {
    const r = conferirEntrada({ email: 'vivian@exemplo.com', senha: '' })

    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.campo).toBe('senha')
      expect(r.aviso).not.toMatch(/cadastrad|existe|conta/i)
    }
  })
})

describe('criar conta', () => {
  it('aceita nome, e-mail e senha suficiente', () => {
    expect(
      conferirCadastro({ nome: 'Vivian', email: 'vivian@exemplo.com', senha: 'uma senha boa' }).ok,
    ).toBe(true)
  })

  it('pede o nome, que é como ela vai aparecer para as outras donas', () => {
    const r = conferirCadastro({ nome: '', email: 'v@e.com', senha: 'uma senha boa' })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.campo).toBe('nome')
  })

  it('exige senha com tamanho mínimo', () => {
    const r = conferirCadastro({ nome: 'Vivian', email: 'v@e.com', senha: 'curta' })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toContain(String(MINIMO_DA_SENHA))
  })

  it('não exige maiúscula, número nem símbolo', () => {
    // Regra de símbolo produz senha anotada em papel, e senha em papel na
    // mesa da oficina é pior do que senha simples na cabeça.
    expect(
      conferirCadastro({ nome: 'Vivian', email: 'v@e.com', senha: 'quero vender mais' }).ok,
    ).toBe(true)
  })

  it('recusa senha que é só o e-mail dela', () => {
    const r = conferirCadastro({
      nome: 'Vivian',
      email: 'vivian@exemplo.com',
      senha: 'vivian@exemplo.com',
    })

    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toMatch(/e-mail/i)
  })
})

describe('o que o erro do servidor vira na tela', () => {
  it('traduz senha errada sem entregar se a conta existe', () => {
    const texto = mensagemDoErro('Invalid login credentials')

    expect(texto).toMatch(/e-mail ou senha/i)
    expect(texto).not.toMatch(/senha incorreta|não cadastrad/i)
  })

  it('explica o e-mail não confirmado, que trava sem dizer por quê', () => {
    expect(mensagemDoErro('Email not confirmed')).toMatch(/confirm/i)
  })

  it('avisa quando o e-mail já tem conta, no cadastro', () => {
    // Aqui contar é o certo: ela está tentando criar, e precisa saber que
    // já existe para ir entrar em vez de criar de novo.
    expect(mensagemDoErro('User already registered')).toMatch(/já tem conta|já existe/i)
  })

  it('diz o que fazer quando a internet cai', () => {
    expect(mensagemDoErro('Failed to fetch')).toMatch(/internet|conex/i)
  })

  it('não mostra erro em inglês para ela', () => {
    const texto = mensagemDoErro('AuthApiError: something exploded')

    expect(texto).not.toMatch(/AuthApiError|exploded/)
    expect(texto.length).toBeGreaterThan(10)
  })
})

describe('esqueci a minha senha', () => {
  /* Com senha, "esqueci a minha" deixa de ser conveniência e vira o
     caminho principal de quem volta depois de meses. Sem ele, a Vivian
     esquecer a senha significa perder o acesso à própria loja. */

  it('pede só o e-mail', () => {
    expect(conferirPedidoDeSenha('vivian@exemplo.com')).toEqual({ ok: true })
  })

  it('cobra o e-mail', () => {
    const r = conferirPedidoDeSenha('')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toContain('e-mail')
  })

  it('avisa quando o e-mail está pela metade', () => {
    const r = conferirPedidoDeSenha('vivian@')
    expect(r.ok).toBe(false)
  })
})

describe('a senha nova', () => {
  it('aceita quando as duas batem', () => {
    expect(conferirNovaSenha({ senha: 'chocolate1', repetida: 'chocolate1' })).toEqual({ ok: true })
  })

  it('recusa quando as duas não batem', () => {
    /* Ela não vê o que digita e não terá como conferir depois: errar aqui
       a tranca fora da loja de novo. */
    const r = conferirNovaSenha({ senha: 'chocolate1', repetida: 'chocolate2' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toContain('não são iguais')
  })

  it('cobra o tamanho mínimo', () => {
    const r = conferirNovaSenha({ senha: 'abc', repetida: 'abc' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.aviso).toContain(String(MINIMO_DA_SENHA))
  })

  it('não exige símbolo nem maiúscula', () => {
    // Regra de símbolo produz senha anotada em papel.
    expect(conferirNovaSenha({ senha: 'lembrancinha', repetida: 'lembrancinha' })).toEqual({ ok: true })
  })
})
