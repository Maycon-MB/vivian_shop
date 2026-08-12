'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA, type Linha } from '@/dominio/linhas'
import { moeda } from '@/formato'

/**
 * Cadastro de produto.
 *
 * O formulário muda conforme a linha, porque as duas vendem de formas
 * diferentes: personalizado precisa de peso, medida, mínimo e prazo;
 * pedagógico precisa do arquivo e mais nada. Mostrar os campos dos dois
 * ao mesmo tempo faria ela preencher coisa que não existe no produto dela.
 *
 * O aviso do valor do pacote aparece enquanto ela digita: com mínimo de 10
 * unidades, o menor pedido possível de um produto de R$ 32 é R$ 320, e é
 * melhor ela ver isso na hora de precificar do que descobrir na primeira
 * reclamação de preço alto.
 */
export function FormularioProduto() {
  const [linha, setLinha] = useState<Linha>(LINHA_PERSONALIZADA)
  const [preco, setPreco] = useState('')
  const [minimo, setMinimo] = useState('10')
  const [salvo, setSalvo] = useState(false)

  const digital = linha === LINHA_PEDAGOGICA
  const precoNum = Number(preco.replace(',', '.')) || 0
  const minimoNum = Number(minimo) || 1
  const pacote = precoNum * minimoNum

  const salvar = (evento: React.FormEvent) => {
    evento.preventDefault()
    setSalvo(true)
  }

  if (salvo) {
    return (
      <div className="rounded-xl border border-chalk bg-chalk/10 p-6">
        <h2 className="text-lg font-semibold">Produto publicado</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Nesta demonstração nada é gravado ainda. Na loja pronta, o produto já apareceria
          para quem estivesse navegando.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSalvo(false)}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
          >
            Cadastrar outro
          </button>
          <Link
            href="/painel/produtos"
            className="rounded-full border border-rule px-5 py-2.5 text-sm font-bold"
          >
            Ver meus produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6">
      <Bloco titulo="De qual linha é este produto?">
        <div className="grid gap-3 sm:grid-cols-2">
          <EscolhaLinha
            ativa={!digital}
            onClick={() => {
              setLinha(LINHA_PERSONALIZADA)
              setMinimo('10')
            }}
            titulo={LINHA_PERSONALIZADA}
            detalhe="Feito sob encomenda, enviado pelos Correios ou Jadlog."
            cor="chalk"
          />
          <EscolhaLinha
            ativa={digital}
            onClick={() => {
              setLinha(LINHA_PEDAGOGICA)
              setMinimo('1')
            }}
            titulo={LINHA_PEDAGOGICA}
            detalhe="Arquivo digital, entregue por e-mail na hora do pagamento."
            cor="marker"
          />
        </div>
      </Bloco>

      <Bloco titulo="O básico">
        <Campo rotulo="Nome do produto" dica="É o que aparece na loja.">
          <input required className={entrada} placeholder="Caderno personalizado" />
        </Campo>

        <Campo
          rotulo="Descrição"
          dica="Uma ou duas frases. Diga o que a pessoa recebe."
        >
          <textarea
            rows={3}
            className={entrada}
            placeholder="Capa com o nome de quem vai usar."
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            rotulo={digital ? 'Preço do arquivo' : 'Preço de cada unidade'}
            dica={digital ? undefined : 'O valor de uma peça, não do pacote.'}
          >
            <input
              required
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className={entrada}
              placeholder="32,00"
            />
          </Campo>

          {!digital && (
            <Campo rotulo="Mínimo de unidades" dica="Quantas peças no menor pedido.">
              <input
                required
                inputMode="numeric"
                value={minimo}
                onChange={(e) => setMinimo(e.target.value)}
                className={entrada}
              />
            </Campo>
          )}
        </div>

        {!digital && pacote > 0 && (
          <p className="rounded-lg bg-marker/25 px-4 py-3 text-sm">
            Com esse preço, o menor pedido deste produto sai por{' '}
            <strong>{moeda(pacote)}</strong> — {minimoNum} unidades de {moeda(precoNum)}.
          </p>
        )}
      </Bloco>

      <Bloco titulo="Foto">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rule bg-paper px-4 py-10 text-center">
          <p className="text-sm font-bold">Arraste a foto aqui ou toque para escolher</p>
          <p className="text-xs text-ink-soft">
            Uma foto boa vende mais que qualquer texto. Luz do dia já resolve.
          </p>
        </div>
      </Bloco>

      {digital ? (
        <Bloco
          titulo="O arquivo"
          dica="É o que a pessoa recebe por e-mail assim que o pagamento é aprovado."
        >
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rule bg-paper px-4 py-10 text-center">
            <p className="text-sm font-bold">Escolher o PDF</p>
            <p className="text-xs text-ink-soft">
              Sai com o nome de quem comprou escrito em cada página.
            </p>
          </div>
        </Bloco>
      ) : (
        <Bloco
          titulo="Medidas do pacote fechado"
          dica={`Do pacote com ${minimoNum} unidades, do jeito que você envia — não da peça solta. Pesa uma vez e não mexe mais.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Peso (gramas)">
              <input required inputMode="numeric" className={entrada} placeholder="4000" />
            </Campo>
            <Campo rotulo="Altura (cm)">
              <input required inputMode="numeric" className={entrada} placeholder="20" />
            </Campo>
            <Campo rotulo="Largura (cm)">
              <input required inputMode="numeric" className={entrada} placeholder="30" />
            </Campo>
            <Campo rotulo="Comprimento (cm)">
              <input required inputMode="numeric" className={entrada} placeholder="30" />
            </Campo>
          </div>

          <Campo
            rotulo="Prazo de produção (dias úteis)"
            dica="Contados da confirmação do pagamento. Aparece na loja antes da compra."
          >
            <input
              required
              inputMode="numeric"
              defaultValue="5"
              className={`${entrada} sm:max-w-32`}
            />
          </Campo>
        </Bloco>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          Publicar produto
        </button>
        <Link
          href="/painel/produtos"
          className="rounded-full border border-rule px-6 py-3 text-sm font-bold"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

const entrada =
  'w-full rounded-lg border border-rule bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-chalk focus:ring-2 focus:ring-chalk/25'

function Bloco({
  titulo,
  dica,
  children,
}: {
  titulo: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-rule bg-surface p-5">
      <div>
        <h2 className="font-corpo text-sm font-bold uppercase tracking-wider text-ink-soft">
          {titulo}
        </h2>
        {dica && <p className="mt-1 text-sm text-ink-soft">{dica}</p>}
      </div>
      {children}
    </section>
  )
}

function Campo({
  rotulo,
  dica,
  children,
}: {
  rotulo: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{rotulo}</span>
      {children}
      {dica && <span className="text-xs text-ink-soft">{dica}</span>}
    </label>
  )
}

function EscolhaLinha({
  ativa,
  onClick,
  titulo,
  detalhe,
  cor,
}: {
  ativa: boolean
  onClick: () => void
  titulo: string
  detalhe: string
  cor: 'chalk' | 'marker'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      className={`rounded-xl border-2 p-4 text-left transition ${
        ativa
          ? cor === 'chalk'
            ? 'border-chalk bg-chalk/10'
            : 'border-marker bg-marker/15'
          : 'border-rule bg-paper hover:border-ink-soft'
      }`}
    >
      <strong className="block text-sm">{titulo}</strong>
      <span className="mt-1 block text-sm text-ink-soft">{detalhe}</span>
    </button>
  )
}
