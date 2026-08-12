'use client'

import { useState } from 'react'
import type { EstadoPedido } from '@/dominio/pedido'
import { Pacote, Download, Conversa } from '../icones'

/**
 * O que a cliente pode fazer com este pedido agora.
 *
 * Só aparece a ação do momento. Botão de gerar etiqueta num pedido que
 * ainda está em produção é convite para postar o que não ficou pronto, e
 * botão de etiqueta em pedido digital é confusão pura.
 */
export function AcoesPedido({
  estado,
  digital,
  whatsapp,
  rastreio,
}: {
  estado: EstadoPedido
  digital: boolean
  whatsapp: string
  rastreio?: string
}) {
  const [gerando, setGerando] = useState(false)
  const [gerou, setGerou] = useState(false)

  const gerarEtiqueta = () => {
    setGerando(true)
    setTimeout(() => {
      setGerando(false)
      setGerou(true)
    }, 1200)
  }

  const numeroLimpo = whatsapp.replace(/\D/g, '')
  const mensagem = rastreio
    ? `Oi! Seu pedido foi postado. O código de rastreio é ${rastreio}.`
    : 'Oi! Passando para avisar sobre o seu pedido.'
  const linkWhats = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`

  if (digital) {
    return (
      <Aviso cor="ok">
        <Download size={20} />
        <span>
          <strong>Nada a fazer aqui.</strong> O arquivo já foi entregue automaticamente quando o
          pagamento foi aprovado.
        </span>
      </Aviso>
    )
  }

  if (estado === 'em_producao') {
    return (
      <Aviso cor="atencao">
        <Pacote size={20} />
        <span>
          <strong>Este pedido está com você.</strong> Quando terminar de produzir, volte aqui
          para gerar a etiqueta.
        </span>
      </Aviso>
    )
  }

  if (estado === 'pronto_para_envio') {
    return (
      <section className="rounded-xl border-2 border-chalk bg-chalk/10 p-5">
        {gerou ? (
          <>
            <h2 className="font-semibold">Etiqueta e declaração prontas</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Nesta demonstração os arquivos não são gerados de verdade. Na loja pronta, os dois
              abririam para impressão agora.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Botao>Imprimir etiqueta</Botao>
              <Botao>Imprimir declaração de conteúdo</Botao>
              <a
                href={linkWhats}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm font-bold"
              >
                <Conversa size={16} /> Avisar no WhatsApp
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-semibold">Pronto para postar</h2>
            <p className="mt-1 text-sm text-ink-soft">
              A etiqueta e a declaração de conteúdo saem juntas, já preenchidas. É só imprimir,
              assinar a declaração e levar.
            </p>
            <button
              type="button"
              onClick={gerarEtiqueta}
              disabled={gerando}
              className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {gerando ? 'Gerando...' : 'Gerar etiqueta e declaração'}
            </button>
          </>
        )}
      </section>
    )
  }

  if (estado === 'enviado') {
    return (
      <Aviso cor="ok">
        <Pacote size={20} />
        <span>
          <strong>Já foi postado.</strong> O código de rastreio foi enviado por e-mail para quem
          comprou.
        </span>
      </Aviso>
    )
  }

  return (
    <Aviso cor="neutro">
      <Pacote size={20} />
      <span>Aguardando a confirmação do pagamento. Nada a fazer por enquanto.</span>
    </Aviso>
  )
}

function Aviso({
  cor,
  children,
}: {
  cor: 'ok' | 'atencao' | 'neutro'
  children: React.ReactNode
}) {
  const estilos = {
    ok: 'border-chalk bg-chalk/10',
    atencao: 'border-marker bg-marker/20',
    neutro: 'border-rule bg-surface',
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border-2 p-5 text-sm ${estilos[cor]}`}>
      <span className="mt-0.5 shrink-0">{children}</span>
    </div>
  )
}

function Botao({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
    >
      {children}
    </button>
  )
}
