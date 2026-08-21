'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

/**
 * Entrar no painel.
 *
 * Uma pessoa só usa esta tela, então ela não tem cadastro nem escolha de
 * perfil — só o necessário para entrar e voltar quando esquecer a senha.
 *
 * O erro não diz se o e-mail existe. Mensagem do tipo "e-mail não
 * cadastrado" conta a quem está tentando invadir qual metade ele acertou.
 */
const Entrar = () => {
  const [erro, setErro] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const entrar = (evento) => {
    evento.preventDefault();
    setEnviando(true);

    // Demonstração: a verificação de verdade acontece no servidor.
    setTimeout(() => {
      setEnviando(false);
      setErro(true);
    }, 900);
  };

  return (
    <div className="entrar">
      <Container className="py-5">
        <div className="entrar-caixa">
          <div className="entrar-marca">
            <span>Feito para você!</span>
            <strong>Personalizados</strong>
          </div>

          <h1>Entrar no painel</h1>
          <p className="entrar-sub">A loja é sua. Este é o lugar de administrar ela.</p>

          <Form onSubmit={entrar} className="entrar-form">
            <Form.Group>
              <Form.Label htmlFor="entrar-email">E-mail</Form.Label>
              <Form.Control
                id="entrar-email"
                type="email"
                required
                placeholder="seu@email.com"
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group>
              {/* O rótulo precisa apontar para o campo. Sem o par
                  htmlFor/id, quem usa leitor de tela ouve "campo de senha"
                  sem saber de qual formulário, e clicar no texto "Senha"
                  não põe o cursor no campo. */}
              <Form.Label htmlFor="entrar-senha">Senha</Form.Label>
              <Form.Control
                id="entrar-senha"
                type="password"
                required
                autoComplete="current-password"
              />
            </Form.Group>

            {erro && (
              <p className="entrar-erro" role="alert">
                E-mail ou senha não conferem. Confira e tente de novo.
              </p>
            )}

            <Button type="submit" className="entrar-botao" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>

            <button type="button" className="entrar-esqueci">
              Esqueci minha senha
            </button>
          </Form>

          <p className="entrar-seguranca">
            <ShieldCheck size={15} /> Esta tela é uma demonstração: ainda não existe senha de
            verdade. Quando a loja entrar no ar, só você terá acesso.
          </p>
        </div>

        <Link href="/" className="entrar-voltar">
          <ArrowLeft size={15} /> Voltar para a loja
        </Link>
      </Container>
    </div>
  );
};

export default Entrar;
