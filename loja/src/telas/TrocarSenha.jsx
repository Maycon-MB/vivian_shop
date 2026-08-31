'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';
import { KeyRound, Check, Loader2 } from 'lucide-react';

import { conferirNovaSenha, conferirEntrada } from '@/dominio/entrada';
import { entrar, trocarSenha, temBanco } from '@/servicos/autenticacao';

/**
 * Trocar a senha a partir da tela de entrada, sabendo a atual.
 *
 * Existe por causa de 31/08. A Vivian ficou sem acesso ao painel, o único
 * caminho de troca era o link do e-mail, e o desfecho foi eu definir uma
 * senha provisória e mandar pelo WhatsApp. Enquanto ela não trocar, aquela
 * senha está na conversa, no aparelho de duas pessoas e nos dois backups.
 *
 * ── Por que não bastava "esqueci a minha senha" ────────────────────────
 *
 * Porque aquele caminho depende de um e-mail chegar, e no dia em que ela
 * precisou os oito e-mails foram entregues no endereço errado sem ninguém
 * conseguir ver. **Quem sabe a senha de agora não devia precisar de
 * e-mail nenhum para trocá-la.**
 *
 * ── Por que aqui, e não só dentro do painel ────────────────────────────
 *
 * A tela do painel existe também. Esta é para quem acabou de receber uma
 * senha provisória e quer trocar antes de qualquer outra coisa: ela chega
 * na tela de entrada, e é ali que o caminho precisa estar.
 *
 * Não é atalho de segurança: para trocar é preciso entrar. O que muda é
 * que ela não precisa navegar até as configurações para fazer isso.
 */

const TrocarSenha = () => {
  const [email, setEmail] = useState('');
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [repetida, setRepetida] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (salvando) return;

    const entrada = conferirEntrada({ email, senha: atual });
    if (!entrada.ok) {
      setErro(entrada.aviso);
      return;
    }

    const conferencia = conferirNovaSenha({ senha: nova, repetida });
    if (!conferencia.ok) {
      setErro(conferencia.aviso);
      return;
    }

    if (!temBanco()) {
      setErro('O login ainda não está ligado neste ambiente.');
      return;
    }

    setErro('');
    setSalvando(true);

    /* Entrar é a conferência. A senha não é comparada por este código, e
       nem poderia: quem sabe dizer se confere é o Supabase. */
    const naoConfere = await entrar(email.trim(), atual);
    if (naoConfere) {
      setErro('E-mail ou senha de agora não conferem. Tente de novo.');
      setSalvando(false);
      return;
    }

    const problema = await trocarSenha(nova);
    setSalvando(false);

    if (problema) {
      setErro('Não consegui trocar agora. Tente de novo em instantes.');
      return;
    }

    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="entrar">
        <Container className="py-5">
          <div className="entrar-caixa">
            <Check size={34} className="entrar-icone" aria-hidden="true" />
            <h1 className="entrar-titulo">Senha trocada</h1>
            <p className="entrar-sub">
              Você já está conectada. Da próxima vez, entre com a senha nova.
            </p>
            <Link href="/admin/" className="entrar-botao d-inline-block text-center">
              Ir para o painel
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
          <KeyRound size={34} className="entrar-icone" aria-hidden="true" />
          <h1 className="entrar-titulo">Trocar a senha</h1>
          <p className="entrar-sub">
            Para quem sabe a senha de agora e quer trocar por outra. Não precisa de e-mail.
          </p>

          <Form onSubmit={enviar} noValidate>
            <Form.Group className="mb-3" controlId="trocar-email">
              <Form.Label>Seu e-mail</Form.Label>
              <Form.Control
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="trocar-atual">
              <Form.Label>Senha de agora</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={atual}
                onChange={(e) => setAtual(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="trocar-nova">
              <Form.Label>Nova senha</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={nova}
                onChange={(e) => setNova(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="trocar-repetida">
              <Form.Label>Repita a nova senha</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={repetida}
                onChange={(e) => setRepetida(e.target.value)}
              />
            </Form.Group>

            {erro && (
              <p className="entrar-erro" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" className="entrar-botao border-0 w-100" disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 size={16} className="girando" aria-hidden="true" /> Trocando…
                </>
              ) : (
                'Trocar a senha'
              )}
            </Button>
          </Form>

          <p className="entrar-esqueci">
            <Link href="/admin/entrar/" prefetch={false}>Voltar para entrar</Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default TrocarSenha;
