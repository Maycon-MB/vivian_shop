'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, LogOut } from 'lucide-react';

import { conferirCadastro, conferirEntrada, mensagemDoErro } from '@/dominio/entrada';
import {
  criarConta,
  entrar,
  sair,
  temBanco,
} from '@/servicos/autenticacao';
import { pedidos as repositorioDePedidos } from '@/servicos';

/**
 * A conta de quem compra.
 *
 * Ficou decidido em 21/08 que a conta tem e-mail e senha, e até 25/08
 * existia metade: dava para criar conta, e a conta não servia para nada.
 * **Quem comprava não conseguia ver o próprio pedido.**
 *
 * O que ela resolve é uma pergunta que hoje chega para a Vivian por
 * mensagem, sempre a mesma: "meu pedido saiu?". Com a conta, a cliente
 * olha sozinha.
 *
 * Três decisões:
 *
 *   1. **Entrar e criar conta na mesma tela.** Quem chega aqui não sabe
 *      se já tem cadastro, e mandar a pessoa escolher entre duas portas
 *      antes de saber qual é a dela é onde ela desiste.
 *   2. **Comprar continua sem exigir conta.** Foi decisão de 24/08. A
 *      conta é para acompanhar, e não para comprar.
 *   3. **Quem compra antes e cria conta depois não perde nada.** O banco
 *      liga os pedidos antigos pelo e-mail confirmado, no gatilho da
 *      migração 0011.
 */

const emReais = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const QUANDO = { day: '2-digit', month: '2-digit', year: 'numeric' };

/** O estado do pagamento dito para a cliente, e não para o sistema. */
const COMO_ESTA = {
  aguardando: 'Esperando o pagamento',
  aprovado: 'Pagamento confirmado',
  recusado: 'O pagamento não passou',
  estornado: 'Pagamento devolvido',
};

const MinhaConta = () => {
  const [entrando, setEntrando] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  /* Sem banco a resposta já é conhecida, e decidir aqui evita marcar
     estado dentro do efeito, que dispara render em cascata. */
  const [meusPedidos, setMeusPedidos] = useState(() => (temBanco() ? null : []));

  const carregar = () =>
    repositorioDePedidos
      .listar()
      .then(setMeusPedidos)
      .catch(() => setMeusPedidos([]));

  useEffect(() => {
    if (temBanco()) carregar();
  }, []);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const conferencia = entrando
      ? conferirEntrada({ email, senha })
      : conferirCadastro({ nome, email, senha });

    if (!conferencia.ok) {
      setErro(conferencia.aviso);
      return;
    }

    if (!temBanco()) {
      setErro('A conta ainda não está ligada neste ambiente.');
      return;
    }

    setErro('');
    setEnviando(true);

    const problema = entrando
      ? await entrar(email, senha)
      : await criarConta(nome, email, senha);

    setEnviando(false);

    if (problema) {
      setErro(mensagemDoErro(problema));
      return;
    }

    if (entrando) {
      setSenha('');
      await carregar();
      return;
    }

    /* Cadastro pede confirmação de e-mail. Sem este aviso, ela cria a
       conta, não acontece nada visível, e tenta de novo achando que
       falhou. */
    setConfirmar(true);
  };

  const deslogar = async () => {
    await sair();
    setMeusPedidos([]);
    setEmail('');
    setSenha('');
  };

  if (meusPedidos === null) {
    return (
      <div className="conta">
        <p className="conta-carregando">
          <Loader2 size={18} className="girando" aria-hidden="true" /> Um instante…
        </p>
      </div>
    );
  }

  if (confirmar) {
    return (
      <div className="conta">
        <div className="conta-caixa">
          <h1>Confirme o seu e-mail</h1>
          <p>
            Mandei um link para <strong>{email.trim()}</strong>. Clique nele e a sua conta
            fica pronta.
          </p>
          <p className="conta-nota">
            Se você já comprou aqui antes com esse e-mail, os seus pedidos vão aparecer
            sozinhos assim que confirmar.
          </p>
        </div>
      </div>
    );
  }

  /* Com pedido na lista, ela está logada: a política do banco só devolve
     pedido para a dona dele. Não é preciso perguntar quem é. */
  if (meusPedidos.length > 0) {
    return (
      <div className="conta">
        <header className="conta-topo">
          <h1>Meus pedidos</h1>
          <button type="button" className="conta-sair" onClick={deslogar}>
            <LogOut size={15} aria-hidden="true" /> Sair
          </button>
        </header>

        <ul className="conta-pedidos">
          {meusPedidos.map((pedido) => (
            <li key={pedido.id}>
              <div className="conta-pedido-topo">
                <strong>Pedido {pedido.numero}</strong>
                <span>{new Date(pedido.criadoEm).toLocaleDateString('pt-BR', QUANDO)}</span>
              </div>

              <p className={`conta-estado ${pedido.estadoPagamento}`}>
                {COMO_ESTA[pedido.estadoPagamento] ?? pedido.estadoPagamento}
              </p>

              <ul className="conta-itens">
                {pedido.itens.map((item, i) => (
                  <li key={i}>
                    {item.quantidade}x {item.nome}
                  </li>
                ))}
              </ul>

              <p className="conta-total">{emReais(pedido.total)}</p>

              {pedido.rastreio && (
                <p className="conta-rastreio">
                  <Package size={14} aria-hidden="true" /> {pedido.transportadora}: {pedido.rastreio}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="conta">
      <div className="conta-caixa">
        <h1>{entrando ? 'Entrar' : 'Criar a minha conta'}</h1>
        <p className="conta-sub">
          {entrando
            ? 'Para acompanhar os seus pedidos.'
            : 'Para acompanhar os seus pedidos sem precisar perguntar.'}
        </p>

        <form onSubmit={enviar} noValidate>
          {!entrando && (
            <label>
              <span>Seu nome</span>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
            </label>
          )}

          <label>
            <span>Seu e-mail</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <span>Sua senha</span>
            <input
              type="password"
              autoComplete={entrando ? 'current-password' : 'new-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          {erro && <p className="conta-erro" role="alert">{erro}</p>}

          <button type="submit" className="conta-botao" disabled={enviando}>
            {enviando ? 'Um instante…' : entrando ? 'Entrar' : 'Criar a conta'}
          </button>
        </form>

        <p className="conta-trocar">
          {entrando ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <button type="button" onClick={() => { setEntrando(!entrando); setErro(''); }}>
            {entrando ? 'Criar agora' : 'Entrar'}
          </button>
        </p>

        {entrando && (
          <p className="conta-trocar">
            <Link href="/admin/esqueci-a-senha/" prefetch={false}>Esqueci a minha senha</Link>
          </p>
        )}

        {/* Comprar sem conta continua valendo, e foi decisão de 24/08.
            Dizer isso aqui evita que ela ache que precisa se cadastrar
            para fechar a compra. */}
        <p className="conta-nota">
          Você não precisa de conta para comprar. Ela serve para acompanhar o pedido depois.
        </p>
      </div>
    </div>
  );
};

export default MinhaConta;
