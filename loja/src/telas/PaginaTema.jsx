'use client'

import React from 'react'
import Link from 'next/link'
import { Container } from 'react-bootstrap'
import { ArrowLeft, Package } from 'lucide-react'

import { produtosDoTema, acharTema, precoAtual, temPromocao, MINIMO_PERSONALIZADO } from './catalogo'
import { PERSONALIZADA } from '../catalogo'

/**
 * Tudo de um tema, numa página só.
 *
 * Existe porque é assim que a cliente da Vivian compra. Ela não está
 * procurando uma caneca: está montando a festa do filho, e o que ela quer
 * ver junto é tudo do Mickey — a caneca, a revista, o álbum, a lousa.
 *
 * Era assim no Elo7, onde a loja tem 86 coleções e 343 produtos. Trocar
 * isso por "todas as canecas" obrigaria a Vivian a reaprender a própria
 * loja, e obrigaria a cliente dela a procurar de um jeito que ela não
 * procura.
 */

const moeda = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function PaginaTema({ slug }) {
  const tema = acharTema(slug)
  const produtos = produtosDoTema(slug)

  if (!tema) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h4 fw-bold mb-3">Tema não encontrado</h1>
        <Link href="/" className="btn btn-dark rounded-pill px-4 py-2">
          Ver a loja
        </Link>
      </Container>
    )
  }

  return (
    <div className="pagina-tema">
      <Container className="py-4 py-md-5">
        <Link href="/" className="voltar">
          <ArrowLeft size={16} /> Ver todos os temas
        </Link>

        <header className="tema-topo">
          <h1>{tema.nome}</h1>
          <p>{tema.descricao}</p>
          <span className="tema-conta">
            {produtos.length === 1 ? '1 produto' : `${produtos.length} produtos`} neste tema
          </span>
        </header>

        <ul className="tema-produtos">
          {produtos.map((produto) => {
            const emPromocao = temPromocao(produto)
            const personalizado = produto.category === PERSONALIZADA

            return (
              <li key={produto.id}>
                <Link href={`/produto/${produto.slug}/`} prefetch={false}>
                  <span className="tema-produto-foto">
                    {produto.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.mini || produto.image}
                        alt={produto.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>Aqui entra a foto</span>
                    )}
                    <span className="tema-produto-tipo">{produto.tipo}</span>
                  </span>

                  <span className="tema-produto-corpo">
                    <strong>{produto.name}</strong>
                    <span className="tema-produto-desc">{produto.description}</span>

                    <span className="tema-produto-preco">
                      {emPromocao && <s>{moeda(produto.price)}</s>}
                      <b>{moeda(precoAtual(produto))}</b>
                      {personalizado && <em>cada</em>}
                    </span>

                    {personalizado && (
                      <span className="tema-produto-minimo">
                        <Package size={13} /> mínimo de {MINIMO_PERSONALIZADO}:{' '}
                        {moeda(precoAtual(produto) * MINIMO_PERSONALIZADO)} o pacote
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </div>
  )
}
