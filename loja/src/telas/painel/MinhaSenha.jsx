'use client'

import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { KeyRound, Check, Loader2 } from 'lucide-react';

import CartaoPainel from './CartaoPainel';
import { conferirNovaSenha } from '@/dominio/entrada';
import { donaDaVez, entrar, trocarSenha, temBanco } from '@/servicos/autenticacao';

/**
 * Trocar a senha estando dentro do painel.
 *
 * Nasceu de um problema de verdade, em 31/08. Ela ficou sem acesso, o
 * único caminho para trocar senha era o link do e-mail, e a saída foi eu
 * definir uma senha provisória e mandar pelo WhatsApp.
 *
 * Enquanto ela não trocar, aquela senha está numa conversa de WhatsApp,
 * no aparelho de duas pessoas e no backup das duas. **A tela existe para
 * essa troca não depender de e-mail chegar.**
 *
 * Vale também para o dia em que ela desconfiar que alguém viu a senha:
 * hoje a resposta seria "pede o link e espera", e naquele momento esperar
 * é justamente o que não dá.
 *
 * ── Por que pede a senha de agora ──────────────────────────────────────
 *
 * Porque a sessão fica aberta no navegador. Sem essa conferência, quem
 * pegar o computador dela destravado troca a senha e toma a conta, e ela
 * descobre quando não conseguir mais entrar.
 *
 * A conferência é feita entrando de novo com a senha digitada. É o próprio
 * Supabase dizendo se confere; a senha não é comparada por este código, e
 * nem poderia.
 */

const MinhaSenha = () => {
  const [email, setEmail] = useState('');
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [repetida, setRepetida] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let valendo = true;
    donaDaVez()
      .then((dona) => {
        if (valendo && dona?.email) setEmail(dona.email);
      })
      .catch(() => {});
    return () => {
      valendo = false;
    };
  }, []);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (salvando) return;

    /* A conferência do formato vem antes de qualquer ida ao servidor:
       senha curta não precisa de viagem para ser recusada, e cada
       tentativa conta no limite de entradas do Supabase. */
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

    const naoConfere = await entrar(email, atual);
    if (naoConfere) {
      setErro('A senha de agora não confere. Tente de novo.');
      setSalvando(false);
      return;
    }

    const problema = await trocarSenha(nova);
    setSalvando(false);

    if (problema) {
      setErro('Não consegui trocar agora. Tente de novo em instantes.');
      return;
    }

    setAtual('');
    setNova('');
    setRepetida('');
    setPronto(true);
  };

  return (
    <CartaoPainel
      titulo="Sua senha"
      subtitulo="Trocar a senha de entrada, sem depender de e-mail."
      info={
        'Se alguém mais souber a sua senha, troque por aqui. A troca vale na hora, ' +
        'e você continua conectada neste aparelho.'
      }
    >
      {pronto ? (
        <p className="d-flex align-items-center gap-2 mb-0" style={{ color: 'var(--color-chalk)' }}>
          <Check size={18} aria-hidden="true" />
          <strong>Senha trocada.</strong> Da próxima vez, entre com a nova.
        </p>
      ) : (
        <Form onSubmit={enviar} noValidate style={{ maxWidth: '420px' }}>
          <Form.Group className="mb-3" controlId="senha-de-agora">
            <Form.Label>Senha de agora</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="senha-nova">
            <Form.Label>Nova senha</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="senha-repetida">
            <Form.Label>Repita a nova senha</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
            />
          </Form.Group>

          {erro && (
            <p className="mb-3" role="alert" style={{ color: 'var(--color-heart)' }}>
              {erro}
            </p>
          )}

          <Button type="submit" className="acao-principal border-0" disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 size={16} className="girando" aria-hidden="true" /> Trocando…
              </>
            ) : (
              <>
                <KeyRound size={16} aria-hidden="true" /> Trocar a senha
              </>
            )}
          </Button>
        </Form>
      )}
    </CartaoPainel>
  );
};

export default MinhaSenha;
