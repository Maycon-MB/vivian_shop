'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Form, Button } from 'react-bootstrap';
import { Loader2 } from 'lucide-react';

import { conferirNovaSenha } from '@/dominio/entrada';
import { situacaoDaDona, temBanco, trocarSenha } from '@/servicos/autenticacao';

/**
 * Onde o link do e-mail cai.
 *
 * O Supabase abre esta página já com uma sessão de recuperação, e é por
 * isso que aqui não se pede a senha antiga: ela é justamente a que a
 * pessoa não lembra.
 *
 * A senha é pedida duas vezes. Ela não vê o que digita e não terá como
 * conferir depois: errar aqui a tranca fora da loja de novo, e o caminho
 * de volta é pedir outro e-mail.
 */
const NovaSenha = () => {
  const router = useRouter();

  const [senha, setSenha] = useState('');
  const [repetida, setRepetida] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  /* Sem banco a resposta já é conhecida, e decidir aqui evita marcar
     estado dentro do efeito, que dispara render em cascata. */
  const [temSessao, setTemSessao] = useState(() => (temBanco() ? null : false));

  /* O link do e-mail vale por uma hora. Depois disso a página abre sem
     sessão, e sem este aviso ela digitaria a senha nova, apertaria salvar
     e receberia um erro do Supabase em inglês sem entender o motivo. */
  useEffect(() => {
    if (!temBanco()) return undefined;

    let valendo = true;

    situacaoDaDona()
      .then((situacao) => { if (valendo) setTemSessao(situacao.estado !== 'fora'); })
      .catch(() => { if (valendo) setTemSessao(false); });

    return () => { valendo = false; };
  }, []);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (salvando) return;

    const conferencia = conferirNovaSenha({ senha, repetida });
    if (!conferencia.ok) {
      setErro(conferencia.aviso);
      return;
    }

    setErro('');
    setSalvando(true);

    const problema = await trocarSenha(senha);

    if (problema) {
      setErro('Não consegui salvar a senha. O link pode ter passado da hora: peça outro.');
      setSalvando(false);
      return;
    }

    router.replace('/admin/');
  };

  if (temSessao === false) {
    return (
      <div className="entrar">
        <Container className="py-5">
          <div className="entrar-caixa">
            <h1 className="entrar-titulo">Este link não vale mais</h1>

            <p className="entrar-sub">
              O link de senha nova vale por uma hora, e depois disso ele expira. Peça outro,
              que chega na hora.
            </p>

            <Link href="/admin/esqueci-a-senha/" className="entrar-botao" prefetch={false}>
              Pedir outro link
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

          <p className="entrar-sub">Escolha a sua senha nova. Depois disso você já entra.</p>

          <Form onSubmit={enviar} className="entrar-form" noValidate>
            <Form.Group className="mb-3" controlId="nova-senha">
              <Form.Label>Senha nova</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={salvando}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="nova-senha-repetida">
              <Form.Label>Escreva de novo</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={repetida}
                onChange={(e) => setRepetida(e.target.value)}
                disabled={salvando}
              />
            </Form.Group>

            {erro && <p className="entrar-erro" role="alert">{erro}</p>}

            <Button type="submit" className="entrar-botao" disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 size={17} className="girando" aria-hidden="true" /> Salvando…
                </>
              ) : (
                'Salvar a senha nova'
              )}
            </Button>
          </Form>

          <p className="entrar-seguranca">
            A sua senha fica guardada embaralhada, e nem eu consigo ver.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default NovaSenha;
