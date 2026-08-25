/**
 * As regras da entrada: o que conferir antes de tentar, e o que dizer
 * quando dá errado.
 *
 * Quem usa isto são a Vivian e a Lilian, poucas vezes por semana, no
 * celular, entre um pedido e outro. Quem erra a senha aqui não é atacante:
 * é gente com pressa, com o dedo grande e com o corretor do teclado
 * trocando a primeira letra.
 *
 * Duas regras atravessam o arquivo:
 *
 *   1. A mensagem diz o que fazer, não o que houve. "E-mail inválido" não
 *      ajuda ninguém; "confira se falta o @" ajuda.
 *   2. A mensagem nunca entrega se a conta existe. "Senha errada" conta a
 *      um estranho que aquele e-mail tem conta aqui — e como a loja é
 *      pública, o e-mail dela é fácil de descobrir.
 */

/** Curto o bastante para caber na cabeça, longo o bastante para não ser adivinhado. */
export const MINIMO_DA_SENHA = 8

export type Conferencia =
  | { ok: true }
  | { ok: false; campo: 'nome' | 'email' | 'senha'; aviso: string }

const limpo = (texto: string): string => (texto ?? '').trim()

const pareceEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const conferirEntrada = ({
  email,
  senha,
}: {
  email: string
  senha: string
}): Conferencia => {
  const endereco = limpo(email)

  if (!endereco) {
    return { ok: false, campo: 'email', aviso: 'Escreva o seu e-mail.' }
  }

  if (!pareceEmail(endereco)) {
    return {
      ok: false,
      campo: 'email',
      aviso: 'Confira o e-mail: parece que falta o @ ou o final, como .com.',
    }
  }

  // Nada sobre a conta existir: quem está do outro lado pode não ser ela.
  if (!senha) {
    return { ok: false, campo: 'senha', aviso: 'Escreva a sua senha.' }
  }

  return { ok: true }
}

export const conferirCadastro = ({
  nome,
  email,
  senha,
}: {
  nome: string
  email: string
  senha: string
}): Conferencia => {
  if (!limpo(nome)) {
    return {
      ok: false,
      campo: 'nome',
      aviso: 'Escreva o seu nome: é assim que você vai aparecer para quem cuida da loja com você.',
    }
  }

  const daEntrada = conferirEntrada({ email, senha })
  if (!daEntrada.ok && daEntrada.campo === 'email') return daEntrada

  if (senha.length < MINIMO_DA_SENHA) {
    return {
      ok: false,
      campo: 'senha',
      aviso: `A senha precisa ter pelo menos ${MINIMO_DA_SENHA} letras. Pode ser uma frase, que é mais fácil de lembrar.`,
    }
  }

  /* Sem exigir maiúscula, número e símbolo de propósito: essa regra produz
     senha anotada em papel, e papel na mesa da oficina é pior do que senha
     simples na cabeça. O que vale a pena barrar é a senha óbvia. */
  if (limpo(senha).toLowerCase() === limpo(email).toLowerCase()) {
    return {
      ok: false,
      campo: 'senha',
      aviso: 'A senha não pode ser o seu e-mail: é a primeira coisa que alguém tentaria.',
    }
  }

  return { ok: true }
}

/**
 * O que o servidor respondeu, dito em português e com uma saída.
 *
 * O Supabase responde em inglês e com vocabulário de quem programa. Ela
 * não vai entender "Invalid login credentials", e pior: vai achar que
 * quebrou alguma coisa.
 */
export const mensagemDoErro = (bruto: string): string => {
  const texto = (bruto ?? '').toLowerCase()

  if (texto.includes('invalid login credentials')) {
    // Um só recado para os dois casos, de propósito: dizer "senha errada"
    // confirmaria a um estranho que aquele e-mail tem conta aqui.
    return 'E-mail ou senha não conferem. Tente de novo, e olhe se o teclado não trocou a primeira letra.'
  }

  if (texto.includes('email not confirmed')) {
    return 'Falta confirmar o seu e-mail. Procure a mensagem que enviamos, inclusive no lixo eletrônico.'
  }

  if (texto.includes('already registered') || texto.includes('already exists')) {
    return 'Este e-mail já tem conta. Vá em "Entrar" em vez de criar outra.'
  }

  if (texto.includes('failed to fetch') || texto.includes('network')) {
    return 'Não consegui falar com o servidor. Confira a sua internet e tente de novo.'
  }

  if (texto.includes('rate limit') || texto.includes('too many')) {
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'
  }

  return 'Não consegui entrar agora. Tente de novo em instantes, e me chame se continuar.'
}

/**
 * O e-mail para onde mandar o link de nova senha.
 *
 * Só o e-mail: quem chegou aqui é porque não lembra a senha, e pedir
 * qualquer outra coisa é obstáculo em cima de quem já está travado.
 */
export const conferirPedidoDeSenha = (email: string): Conferencia => {
  const endereco = limpo(email)

  if (!endereco) return { ok: false, campo: 'email', aviso: 'Escreva o seu e-mail.' }

  if (!pareceEmail(endereco)) {
    return {
      ok: false,
      campo: 'email',
      aviso: 'Confira o e-mail: parece que falta o @ ou o final, como .com.',
    }
  }

  return { ok: true }
}

/**
 * A senha nova, digitada duas vezes.
 *
 * Duas vezes porque ela não vê o que digita e não terá como conferir
 * depois: errar aqui a tranca fora da própria loja de novo, e o caminho
 * de volta é o mesmo e-mail outra vez.
 *
 * Mínimo de tamanho e nada de exigir símbolo: maiúscula, número e
 * caractere especial produzem senha anotada em papel.
 */
export const conferirNovaSenha = ({
  senha,
  repetida,
}: {
  senha: string
  repetida: string
}): Conferencia => {
  if (!senha) return { ok: false, campo: 'senha', aviso: 'Escreva a sua senha nova.' }

  if (senha.length < MINIMO_DA_SENHA) {
    return {
      ok: false,
      campo: 'senha',
      aviso: `A senha precisa ter pelo menos ${MINIMO_DA_SENHA} letras ou números.`,
    }
  }

  if (senha !== repetida) {
    return {
      ok: false,
      campo: 'senha',
      aviso: 'As duas senhas não são iguais. Confira antes de salvar.',
    }
  }

  return { ok: true }
}
