'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';
import { Loader2, MailCheck } from 'lucide-react';

import { conferirPedidoDeSenha } from '@/dominio/entrada';
import { pedirNovaSenha, temBanco } from '@/servicos/autenticacao';

/**
 * "Esqueci a minha senha."
 *
 * A escolha de ter senha obriga esta tela a existir. A Vivian entra aqui
 * poucas vezes por semana, do celular, e quem volta depois de meses não
 * lembra. Sem este caminho, esquecer a senha significa perder o acesso à
 * própria loja e depender de mim para voltar.
 *
 * **A resposta é a mesma para e-mail que existe e para e-mail que não
 * existe.** Dizer "esse e-mail não está cadastrado" seria entregar, a
 * quem quisesse perguntar, quem tem conta na loja dela.
 */
const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mandado, setMandado] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const conferencia = conferirPedidoDeSenha(email);
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

    await pedirNovaSenha(email);

    /* O erro do Supabase é ignorado de propósito. Ele diz coisas como
       "user not found", e mostrar isso contaria quem tem conta. Falha de
       rede também cai aqui, e o preço de a pessoa esperar um e-mail que
       não vem é menor do que o de vazar a lista de clientes dela. */
    setMandado(true);
    setEnviando(false);
  };

  if (mandado) {
    return (
      <div className="entrar">
        <Container className="py-5">
          <div className="entrar-caixa">
            <MailCheck size={34} className="entrar-icone" aria-hidden="true" />
            <h1 className="entrar-titulo">Olhe o seu e-mail</h1>

            <p className="entrar-sub">
              Se existe uma conta com <strong>{email.trim()}</strong>, o link para criar uma
              senha nova acabou de sair. Ele vale por uma hora.
            </p>

            <p className="entrar-seguranca">
              Não chegou em alguns minutos? Veja no spam. O remetente é
              avisos@feitoparavocepapelaria.com.br.
            </p>

            <Link href="/admin/entrar/" className="entrar-voltar" prefetch={false}>
              ← Voltar para entrar
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="entrar">
      <Container className="py-5">
        <div className="entrar-caixa">
          <div className="entrar-marca">
            <strong>Feito para você!</strong>
            <span>Personalizados</span>
          </div>

          <p className="entrar-sub">
            Escreva o seu e-mail e eu mando um link para você criar uma senha nova.
          </p>

          <Form onSubmit={enviar} className="entrar-form" noValidate>
            <Form.Group className="mb-3" controlId="esqueci-email">
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

            {erro && <p className="entrar-erro" role="alert">{erro}</p>}

            <Button type="submit" className="entrar-botao" disabled={enviando}>
              {enviando ? (
                <>
                  <Loader2 size={17} className="girando" aria-hidden="true" /> Mandando…
                </>
              ) : (
                'Mandar o link'
              )}
            </Button>
          </Form>

          <p className="entrar-criar">
            Lembrou? <Link href="/admin/entrar/" prefetch={false}>Voltar para entrar</Link>
          </p>
        </div>

        <Link href="/" className="entrar-voltar" prefetch={false}>
          ← Ver a loja
        </Link>
      </Container>
    </div>
  );
};

export default EsqueciSenha;
