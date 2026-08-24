'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Form, Button } from 'react-bootstrap';
import { Loader2 } from 'lucide-react';

import { conferirCadastro, mensagemDoErro, MINIMO_DA_SENHA } from '@/dominio/entrada';
import { bancoDoNavegador, criarConta, temBanco } from '@/servicos/autenticacao';

/**
 * Criar a conta de quem administra a loja.
 *
 * Não é cadastro aberto: só vira dona quem cria a primeira conta da loja
 * ou quem foi convidada por uma dona. Quem chegar aqui sem convite cria
 * uma conta que não enxerga nada — e a tela diz isso antes, para a pessoa
 * não descobrir depois de preencher tudo.
 *
 * A senha vai direto para o Supabase. Este código nunca a guarda, nunca a
 * envia para outro lugar e nunca a mostra.
 */
const CriarConta = () => {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [semDona, setSemDona] = useState(null);

  /* Pergunta ao banco se a loja já tem dona. A resposta muda o que a tela
     promete: "você será a dona desta loja" é muito diferente de "sua conta
     não terá permissão nenhuma", e prometer errado é pior que não
     prometer. */
  useEffect(() => {
    if (!temBanco()) return;

    let valendo = true;

    bancoDoNavegador()
      .rpc('loja_ainda_sem_dona')
      .then(({ data }) => {
        if (valendo) setSemDona(data === true);
      })
      .catch(() => {});

    return () => {
      valendo = false;
    };
  }, []);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const conferencia = conferirCadastro({ nome, email, senha });
    if (!conferencia.ok) {
      setErro(conferencia.aviso);
      return;
    }

    if (!temBanco()) {
      setErro('O cadastro ainda não está ligado neste ambiente.');
      return;
    }

    setErro('');
    setEnviando(true);

    const problema = await criarConta(nome, email, senha);

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

          {semDona === true && (
            <p className="entrar-aviso" role="status">
              Esta loja ainda não tem dona. A conta que você criar aqui vai administrar tudo.
            </p>
          )}

          {semDona === false && (
            <p className="entrar-aviso" role="status">
              Esta loja já tem dona. Você só vai conseguir administrar se tiver sido convidada.
            </p>
          )}

          <Form onSubmit={enviar} className="entrar-form" noValidate>
            <Form.Group className="mb-3" controlId="criar-nome">
              <Form.Label>Seu nome</Form.Label>
              <Form.Control
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={enviando}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="criar-email">
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

            <Form.Group className="mb-3" controlId="criar-senha">
              <Form.Label>Uma senha</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={enviando}
              />
              <Form.Text>
                Pelo menos {MINIMO_DA_SENHA} letras. Pode ser uma frase, que é mais fácil de
                lembrar do que letra com número e símbolo.
              </Form.Text>
            </Form.Group>

            {erro && (
              <p className="entrar-erro" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" className="entrar-botao" disabled={enviando}>
              {enviando ? (
                <>
                  <Loader2 size={17} className="girando" aria-hidden="true" /> Criando…
                </>
              ) : (
                'Criar a minha conta'
              )}
            </Button>
          </Form>

          <p className="entrar-criar">
            Já tem conta? <Link href="/admin/entrar/" prefetch={false}>Entrar</Link>
          </p>
        </div>

        <Link href="/" className="entrar-voltar" prefetch={false}>
          ← Ver a loja
        </Link>
      </Container>
    </div>
  );
};

export default CriarConta;
