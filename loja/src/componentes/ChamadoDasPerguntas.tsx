'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import { estaTudoReal } from '@/servicos'
import { situacaoDaDona, temBanco } from '@/servicos/autenticacao'

/**
 * Chama a Vivian para as perguntas, sem eu precisar mandar mensagem.
 *
 * Ela recebeu um link só — o da loja. As perguntas moram noutra página, e
 * o único caminho até lá era um item numa barra de navegação junto com
 * "Identidade" e "Andamento", que são nomes que não dizem nada para quem
 * não construiu isto. Contar com ela achar sozinha seria contar com sorte.
 *
 * Por isso a chamada aparece na própria loja, endereçada a ela pelo nome:
 * quem abrir o link vai ver, e quem precisa ver é ela.
 *
 * Some sozinha em três situações. Quando os serviços de verdade entrarem,
 * porque aí a loja é uma loja e não um lugar de conversa entre nós dois. E
 * quando ela já tiver respondido tudo, porque insistir depois disso vira
 * cobrança sem motivo.
 *
 * A terceira veio de uma auditoria em 26/08: **quem não é a dona não vê
 * nada disto.** A loja está no ar com 342 produtos e clientes de verdade,
 * e um recado interno endereçado à dona, no topo de toda página, é o tipo
 * de coisa que faz quem chega achar que entrou num site inacabado. O
 * recado só existe para uma pessoa; só ela precisa vê-lo.
 */

import { TOTAL as TOTAL_DE_PERGUNTAS } from '@/telas/Perguntas'

const CHAVE_RESPOSTAS = 'feito-para-voce:respostas-vivian'

export function ChamadoDasPerguntas() {
  const caminho = usePathname()
  const [respondidas, setRespondidas] = useState<number | null>(null)
  /* `null` enquanto não se sabe. Sem banco, não há como perguntar quem
     está do outro lado, e aí vale o comportamento antigo: é a loja de
     demonstração, que é dela e de mais ninguém. */
  const [ehADona, setEhADona] = useState<boolean | null>(temBanco() ? null : true)

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CHAVE_RESPOSTAS)
      const respostas = guardado ? JSON.parse(guardado) : {}
      const contadas = Object.entries(respostas).filter(
        ([chave, valor]) => chave !== 'corrigir' && String(valor ?? '').trim(),
      ).length
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRespondidas(contadas)
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRespondidas(0)
    }
  }, [])

  useEffect(() => {
    if (!temBanco()) return undefined

    let valendo = true

    situacaoDaDona()
      .then((situacao) => { if (valendo) setEhADona(situacao.estado === 'dentro') })
      .catch(() => { if (valendo) setEhADona(false) })

    return () => { valendo = false }
  }, [])

  if (estaTudoReal) return null
  // Quem não é a dona não vê recado endereçado à dona.
  if (ehADona !== true) return null
  if (caminho?.startsWith('/admin')) return null

  // Enquanto não sabe quantas foram respondidas, não mostra nada: aparecer
  // dizendo "19 perguntas" e trocar para "faltam 4" um instante depois faz
  // a página piscar e parece defeito.
  if (respondidas === null) return null
  if (respondidas >= TOTAL_DE_PERGUNTAS) return null

  const faltam = TOTAL_DE_PERGUNTAS - respondidas
  const comecou = respondidas > 0

  return (
    <div className="chamado-faixa">
      {/* O mesmo container do resto da loja: em tela larga o conteúdo
          acompanha as colunas da página em vez de encostar nas bordas. */}
      <div className="container">
        <div className="row align-items-center g-2">
          <div className="col-12 col-md-8 col-lg-9">
            <strong className="chamado-titulo">Você é a dona desta loja?</strong>
            <span className="chamado-detalhe">
              {comecou
                ? `Você já respondeu ${respondidas} das minhas perguntas. Faltam ${faltam}.`
                : 'Tenho algumas perguntas para a loja poder abrir. Dá para responder aos poucos.'}
            </span>
          </div>

          <div className="col-12 col-md-4 col-lg-3 d-flex justify-content-md-end">
            <Link href="/admin/perguntas/" className="chamado-botao" prefetch={false}>
              {comecou ? 'Continuar' : 'Ver as perguntas'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
