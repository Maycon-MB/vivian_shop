'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Form, Button } from 'react-bootstrap';
import { Loader2 } from 'lucide-react';

import { conferirEntrada, mensagemDoErro } from '@/dominio/entrada';
import { entrar as entrarNoBanco, temBanco } from '@/servicos/autenticacao';

/**
 * A porta da área da loja.
 *
 * Quem entra aqui são a Vivian e a Lilian, no celular, poucas vezes por
 * semana. O caminho feliz é fácil; o que decide se elas voltam é o que
 * acontece quando dá errado.
 *
 * Por isso três coisas que parecem detalhe e não são:
 *
 *   - o que dá para conferir antes de enviar é conferido aqui, para o
 *     "faltou o e-mail" não custar dez segundos de internet ruim
 *   - o botão trava enquanto tenta, senão dois toques viram duas
 *     tentativas e o servidor começa a barrar por excesso
 *   - o erro chega em português e sem dizer se a conta existe
 *
 * A senha não passa por este código: vai direto para o Supabase, que
 * guarda o hash. Nem eu nem ela veem.
 */
const Entrar = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const conferencia = conferirEntrada({ email, senha });
    if (!conferencia.ok) {
      setErro(conferencia.aviso);
      return;
    }

    if (!temBanco()) {
      setErro('O login ainda não está ligado neste ambiente.');
      return;
    }

    setErro('');
    setEnviando(true);

    const problema = await entrarNoBanco(email, senha);

    if (problema) {
      setErro(mensagemDoErro(problema));
      setEnviando(false);
      return;
    }

    router.replace('/admin/');
  };

  return (
    <div className="entrar">
      <Container className="py-5">
        <div className="entrar-caixa">
          <div className="entrar-marca">
            <strong>Feito para você!</strong>
            <span>Personalizados</span>
          </div>

          <p className="entrar-sub">A loja é sua. Este é o lugar de administrar ela.</p>

          <Form onSubmit={enviar} className="entrar-form" noValidate>
            <Form.Group className="mb-3" controlId="entrar-email">
              <Form.Label>Seu e-mail</Form.Label>
              <Form.Control
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={enviando}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="entrar-senha">
              <Form.Label>Sua senha</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={enviando}
              />
            </Form.Group>

            {erro && (
              <p className="entrar-erro" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" className="entrar-botao" disabled={enviando}>
              {enviando ? (
                <>
                  <Loader2 size={17} className="girando" aria-hidden="true" /> Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </Form>

          {/* Antes do "criar conta", e não depois: quem chega aqui travado
              esqueceu a senha muito mais vezes do que nunca teve conta. */}
          <p className="entrar-criar">
            <Link href="/admin/esqueci-a-senha/" prefetch={false}>Esqueci a minha senha</Link>
            {/* Para quem sabe a senha e quer trocar. Em 31/08 a única
                troca possível era pelo link do e-mail, e no dia em que
                ela precisou os e-mails foram parar no endereço errado. */}
            {' · '}
            <Link href="/admin/trocar-senha/" prefetch={false}>Trocar a minha senha</Link>
          </p>

          {/* Sem "criar a minha conta".

              A loja já tem dona, e desde a migração 0004 quem se cadastra
              depois da primeira conta fica sem permissão nenhuma. O link
              só levava a uma tela que criava conta inútil, e foi o que
              deixou uma sobrando no Supabase em 01/09.

              Uma segunda dona entra pelo convite da migração 0006, que
              continua valendo. */}

          <p className="entrar-seguranca">
            A sua senha fica guardada embaralhada, e nem eu consigo ver.
          </p>
        </div>

        <Link href="/" className="entrar-voltar" prefetch={false}>
          ← Ver a loja
        </Link>
      </Container>
    </div>
  );
};

export default Entrar;
