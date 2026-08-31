'use client'

import React from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import { Check, AlertCircle } from 'lucide-react';

/**
 * O que a Vivian vê depois de autorizar o Melhor Envio.
 *
 * A função `frete-retorno` faz a troca do código por token e manda ela
 * para cá. A página é da loja, e não da função, porque o Supabase força
 * `content-type: text/plain` em resposta de função: na primeira vez ela
 * viu o código-fonte cru na tela, com os acentos quebrados, logo depois
 * de autorizar. Funcionou e pareceu quebrado.
 *
 * ── Por que não tem `useSearchParams` ──────────────────────────────────
 *
 * O site é estático. `useSearchParams` obrigaria esta página a esperar o
 * JavaScript para decidir o que dizer, e ela existe justamente para dizer
 * uma coisa só, rápido, no fim de um processo que a deixou insegura.
 *
 * A situação é lida direto do endereço, na montagem. Sem ela, a página
 * assume que deu certo: é o caso comum, e o caminho de erro sempre chega
 * com a explicação no endereço.
 */

const RECADOS = {
  pronto: {
    ok: true,
    titulo: 'Pronto, obrigado!',
    texto:
      'A sua conta do Melhor Envio está ligada à loja. O frete que aparece para as clientes passa a ser o de verdade, com Correios e Jadlog lado a lado.',
  },
  'link-invalido': {
    ok: false,
    titulo: 'Esse link não vale mais',
    texto:
      'Ele funciona uma vez só, e já foi usado ou expirou. Me chame que eu mando outro na hora.',
  },
  recusado: {
    ok: false,
    titulo: 'O Melhor Envio recusou',
    texto: 'A autorização não foi aceita. Já estou vendo o que aconteceu, não precisa fazer nada.',
  },
  'nao-guardei': {
    ok: false,
    titulo: 'Autorizou, mas não guardei',
    texto: 'A autorização deu certo e eu não consegui salvar aqui. Me chame, o problema é meu.',
  },
};

const FreteLigado = () => {
  const situacao =
    typeof window === 'undefined'
      ? 'pronto'
      : new URLSearchParams(window.location.search).get('situacao') || 'pronto';

  const recado = RECADOS[situacao] ?? RECADOS.pronto;

  return (
    <div className="entrar">
      <Container className="py-5">
        <div className="entrar-caixa">
          {recado.ok ? (
            <Check size={38} className="entrar-icone" aria-hidden="true" />
          ) : (
            <AlertCircle size={38} className="entrar-icone" aria-hidden="true" />
          )}

          <h1 className="entrar-titulo">{recado.titulo}</h1>
          <p className="entrar-sub">{recado.texto}</p>

          <Link href="/admin/" className="entrar-botao d-inline-block text-center">
            Ir para o painel
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default FreteLigado;
