'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { situacaoDaDona, temBanco } from '@/servicos/autenticacao'

/**
 * Deixa passar só quem administra a loja.
 *
 * Até 24/08 o painel era público: quem digitasse o endereço via a tela de
 * pedidos das clientes. As políticas do banco já barravam os dados, mas a
 * tela abria — e tela de administração aberta é convite para tentar.
 *
 * A pergunta não é "está logada?". É **"está na tabela de donas?"**.
 * Enquanto o cadastro estiver aberto, qualquer pessoa cria conta, e isso
 * não pode dar acesso a nada.
 *
 * Este guarda é conveniência, não segurança: ele esconde a tela. Quem
 * segura os dados é a política do banco, que roda no servidor e não dá
 * para enganar pelo navegador. Se um dia este componente falhar, a pessoa
 * vê um painel vazio, e não os dados de ninguém.
 *
 * É por isso que "não consegui perguntar ao servidor" deixa passar em vez
 * de expulsar: sem resposta do banco não há dado para mostrar, e expulsar
 * quem tem sessão só porque a internet oscilou é transformar conexão ruim
 * em "fui deslogada de novo".
 */
export function ExigirDona({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [liberado, setLiberado] = useState(false)

  useEffect(() => {
    /* Sem banco configurado, a área continua aberta como sempre foi. É o
       caso do ambiente de demonstração, onde não há dado de ninguém: as
       telas mostram exemplos. */
    if (!temBanco()) {
      setLiberado(true)
      return
    }

    let valendo = true

    situacaoDaDona()
      .then((situacao) => {
        if (!valendo) return

        /* "Não consegui perguntar" não é "não pode entrar". Com sessão
           guardada no aparelho e o servidor fora de alcance, a tela abre:
           quem segura os dados é a política do banco, e sem resposta do
           banco não há dado nenhum para vazar — só a moldura vazia.

           O contrário disso expulsaria a Vivian para o login toda vez que
           a internet oscilasse, que no celular dela é o normal. */
        if (situacao.estado === 'fora') router.replace('/admin/entrar/')
        else setLiberado(true)
      })
      .catch(() => {
        if (valendo) setLiberado(true)
      })

    return () => {
      valendo = false
    }
  }, [router])

  // Nada enquanto não se sabe: mostrar o painel no intervalo entre a
  // página carregar e o servidor responder entregaria a tela a quem não
  // deveria vê-la, ainda que por um segundo.
  if (!liberado) return null

  return <>{children}</>
}
