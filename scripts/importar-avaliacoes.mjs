/**
 * Traz as avaliações das clientes dela para dentro da loja.
 *
 *     node scripts/importar-avaliacoes.mjs [entrada.csv]
 *
 * São 13, escritas entre março de 2025 e fevereiro de 2026. Vieram do
 * Elo7 e migraram para a Elojinha junto com o catálogo, e foram tiradas de
 * lá em 25/08/2026 antes que a segunda plataforma também fechasse.
 *
 * Elas entram no repositório, e não no banco, de propósito: são treze
 * linhas que não mudam, e a página que as mostra é gerada no build. Pôr
 * isso no banco seria uma consulta a mais no caminho de quem chega, para
 * ler um dado que é o mesmo desde fevereiro.
 *
 * **Só o primeiro nome atravessa este script.** Quem escreveu avaliou uma
 * loja em outra plataforma e não autorizou aparecer nesta. A extração já
 * foi feita assim, e aqui é conferido de novo: se um sobrenome vier junto,
 * ele é cortado antes de virar arquivo.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const entrada =
  process.argv[2] ??
  path.join(process.env.USERPROFILE ?? '', 'Documents', 'vivian-elojinha', 'avaliacoes-elojinha.csv')

const saida = path.join(
  path.dirname(new URL(import.meta.url).pathname.slice(1)),
  '..',
  'loja',
  'src',
  'dados',
  'avaliacoes.json',
)

/** CSV com aspas, aspas dobradas por dentro e quebra de linha no campo. */
const lerCsv = (texto) => {
  const linhas = []
  let campo = ''
  let linha = []
  let dentroDeAspas = false

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]

    if (dentroDeAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++ }
        else dentroDeAspas = false
      } else campo += c
      continue
    }

    if (c === '"') { dentroDeAspas = true; continue }
    if (c === ',') { linha.push(campo); campo = ''; continue }
    if (c === '\r') continue
    if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; continue }

    campo += c
  }

  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }

  const [cabecalho, ...resto] = linhas
  return resto
    .filter((l) => l.some((v) => v.trim()))
    .map((l) => Object.fromEntries(cabecalho.map((coluna, i) => [coluna, l[i] ?? ''])))
}

const cruas = lerCsv(readFileSync(entrada, 'utf8'))

const limpas = cruas.map((a) => ({
  data: a.data,
  produto: a.produto,
  nota: a.nota,
  // Segunda conferência do primeiro nome: se um sobrenome escapou da
  // extração, ele não passa daqui.
  primeiro_nome: (a.primeiro_nome ?? '').trim().split(/\s+/)[0],
  texto: a.texto,
  resposta_da_loja: a.resposta_da_loja ?? '',
}))

writeFileSync(saida, `${JSON.stringify(limpas, null, 2)}\n`, 'utf8')

const comSobrenome = cruas.filter((a) => (a.primeiro_nome ?? '').trim().includes(' '))

console.log(`${limpas.length} avaliações escritas em ${saida}`)
console.log(`  ${limpas.filter((a) => a.resposta_da_loja).length} com resposta da loja`)
if (comSobrenome.length) console.log(`  ${comSobrenome.length} vinham com sobrenome, e ele foi cortado`)
