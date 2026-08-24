/**
 * Sobe as fotos dos produtos para o balde e liga cada uma ao seu produto.
 *
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/subir-fotos.mjs [pasta-das-fotos]
 *
 * As fotos vêm da extração da Elojinha, em resolução cheia. Sobem em dois
 * tamanhos, pelo mesmo motivo que já valia no site: a vitrine mostra
 * dezenas de uma vez e a página do produto mostra uma. Servir o arquivo
 * grande nas duas levou a vitrine a 1,3 MB no celular.
 *
 * Roda de novo sem duplicar: o caminho no balde é derivado do produto e
 * da ordem, então subir a mesma foto duas vezes sobrescreve em vez de
 * acumular.
 */

import { readdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from '../loja/node_modules/sharp/dist/index.mjs'
import { createClient } from '../loja/node_modules/@supabase/supabase-js/dist/index.mjs'

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const url = process.env.SUPABASE_URL
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !chave) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const pasta = process.argv[2]
  ?? path.join(process.env.USERPROFILE, 'Documents', 'vivian-elojinha', 'fotos')

const TAMANHOS = { cheia: 900, mini: 440 }

const banco = createClient(url, chave)

const { data: produtos, error: erroLeitura } = await banco.from('produtos').select('id, slug')
if (erroLeitura) throw erroLeitura

let enviadas = 0
let semFoto = []

for (const produto of produtos) {
  const dela = path.join(pasta, produto.slug)
  if (!existsSync(dela)) {
    semFoto.push(produto.slug)
    continue
  }

  const arquivos = readdirSync(dela).filter((a) => /\.(jpe?g|png|webp)$/i.test(a)).sort()
  if (!arquivos.length) {
    semFoto.push(produto.slug)
    continue
  }

  // Só a primeira por enquanto: é a capa, e é o que a loja mostra hoje.
  // A galeria entra quando a tela do produto souber exibir mais de uma.
  const original = readFileSync(path.join(dela, arquivos[0]))
  const endereços = {}

  for (const [nome, largura] of Object.entries(TAMANHOS)) {
    const convertida = await sharp(original)
      .resize({ width: largura, withoutEnlargement: true })
      .webp({ quality: nome === 'mini' ? 76 : 82 })
      .toBuffer()

    const caminho = `${produto.slug}/1-${nome}.webp`

    const { error } = await banco.storage.from('produtos').upload(caminho, convertida, {
      contentType: 'image/webp',
      upsert: true,
    })
    if (error) throw error

    endereços[nome] = banco.storage.from('produtos').getPublicUrl(caminho).data.publicUrl
  }

  const { error } = await banco.from('produtos')
    .update({ imagem: endereços.cheia, imagem_mini: endereços.mini })
    .eq('id', produto.id)
  if (error) throw error

  enviadas++
}

console.log(`${enviadas} fotos no balde, ligadas ao produto`)
if (semFoto.length) console.log(`${semFoto.length} produtos sem foto local: ${semFoto.slice(0, 5).join(', ')}`)
