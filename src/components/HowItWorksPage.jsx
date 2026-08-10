import React, { useEffect, useRef } from 'react';
import '../styles/identity.css';

/**
 * Como funciona a loja, explicado para a cliente.
 *
 * A dúvida real de quem sai do Elo7 não é "o site é bonito?" — é "quanto
 * trabalho sobra para mim?". Por isso cada passo do fluxo diz quem executa:
 * ela ou o sistema.
 *
 * Usa o mesmo sistema visual da identidade (identity.css).
 */

/** Quem executa cada passo. Define a cor e o rótulo do marcador. */
const ACTOR = {
  system: { label: 'Automático', className: 'by-system' },
  vivian: { label: 'Você faz', className: 'by-vivian' },
  buyer: { label: 'Quem compra', className: 'by-buyer' },
};

const FLOW = [
  {
    actor: ACTOR.buyer,
    title: 'A pessoa encontra a loja',
    detail: 'Pelo link na bio do Instagram, por um post, ou pesquisando no Google. O endereço é seu — não divide espaço com concorrente, como acontece na vitrine do Elo7.',
  },
  {
    actor: ACTOR.buyer,
    title: 'Escolhe o produto e paga',
    detail: 'Pix ou cartão em até 12x, direto na página. O frete é calculado na hora pelo CEP dela, com o prazo real dos Correios.',
  },
  {
    actor: ACTOR.system,
    title: 'O pedido aparece no seu painel',
    detail: 'No mesmo instante em que o pagamento é aprovado. Você recebe um aviso no WhatsApp. Não precisa ficar conferindo nada.',
  },
  {
    actor: ACTOR.system,
    title: 'O estoque baixa sozinho',
    detail: 'Vendeu, o número cai. Quando chega ao fim, o produto sai do ar automaticamente — ninguém compra o que você não tem.',
  },
  {
    actor: ACTOR.vivian,
    title: 'Você embala e clica em "Gerar etiqueta"',
    detail: 'A etiqueta sai pronta, com o endereço já preenchido e o código de rastreio. Só imprimir e colar. É o único passo que exige você.',
  },
  {
    actor: ACTOR.system,
    title: 'Quem comprou recebe o rastreio',
    detail: 'O código vai por e-mail e WhatsApp assim que a etiqueta é gerada. Acaba o "chegou meu pedido?" na sua caixa de mensagens.',
  },
  {
    actor: ACTOR.system,
    title: 'O dinheiro cai na sua conta',
    detail: 'Direto no seu Mercado Pago, sem passar por mim nem por ninguém. Pix cai na hora; cartão segue o prazo do Mercado Pago.',
  },
];

const ROUTINE = [
  { label: 'Cadastrar um produto novo', time: 'uns 3 minutos', note: 'Foto, nome, preço, quantidade.' },
  { label: 'Despachar um pedido', time: 'uns 2 minutos', note: 'Embalar, gerar etiqueta, imprimir.' },
  { label: 'Responder uma dúvida', time: 'quando quiser', note: 'As mensagens ficam no painel, junto do pedido.' },
  { label: 'Conferir quanto vendeu', time: 'nenhum', note: 'O painel já mostra ao abrir.' },
];

const COSTS = [
  {
    name: 'Mercado Pago',
    value: 'por venda',
    detail: 'Taxa cobrada só quando você vende. Cartão e Pix têm taxas diferentes, e o Mercado Pago publica os valores atualizados na conta dele.',
  },
  {
    name: 'Correios',
    value: 'por envio',
    detail: 'O frete é cobrado de quem compra no momento do pagamento. Não sai do seu bolso.',
  },
  {
    name: 'Endereço do site',
    value: 'anual',
    detail: 'Registro do domínio .com.br, pago uma vez por ano ao Registro.br.',
  },
  {
    name: 'Hospedagem',
    value: 'incluída',
    detail: 'Está dentro da manutenção mensal enquanto o volume de vendas couber no plano atual. Se crescer muito, eu aviso antes de qualquer mudança.',
  },
];

const NOT_YET = [
  'Emissão de nota fiscal — precisa ser configurada com seu contador.',
  'Retirada em mãos e frete próprio para a sua cidade.',
  'Cupom de desconto e programa de indicação.',
  'Assinatura mensal de kits pedagógicos.',
];

const useHighlightOnScroll = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const marks = root.querySelectorAll('[data-mark]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      marks.forEach((mark) => mark.classList.add('on'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.9 }
    );

    marks.forEach((mark) => observer.observe(mark));
    return () => observer.disconnect();
  }, []);

  return rootRef;
};

const HowItWorksPage = () => {
  const rootRef = useHighlightOnScroll();

  const bySystem = FLOW.filter((step) => step.actor === ACTOR.system).length;

  return (
    <div className="identity" ref={rootRef}>
      <header className="masthead">
        <div className="wrap">
          <h1>Como a loja funciona</h1>
          <span className="meta">Da venda ao envio · agosto de 2026</span>
        </div>
      </header>

      <section className="ruled">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Resumo</p>
            <h2>
              Dos {FLOW.length} passos de uma venda, {bySystem} acontecem{' '}
              <span className="mark" data-mark>sem você</span>.
            </h2>
            <p>
              Você embala e clica em um botão. O resto — cobrar, avisar, baixar estoque,
              mandar o rastreio, depositar — é o sistema que faz.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">O caminho de um pedido</p>
            <h2>O que acontece quando alguém compra.</h2>
          </div>

          <ol className="flow">
            {FLOW.map((step, i) => (
              <li className="flow-step" key={step.title}>
                <div className="flow-marker">
                  <span className="flow-n">{i + 1}</span>
                </div>
                <div className="flow-body">
                  <span className={`actor ${step.actor.className}`}>{step.actor.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Seu dia a dia</p>
            <h2>Quanto tempo cada coisa <span className="mark" data-mark>toma</span>.</h2>
            <p>
              O painel foi desenhado para você usar do celular, entre uma encomenda e outra.
              Nada aqui precisa de computador.
            </p>
          </div>

          <table className="routine">
            <thead>
              <tr>
                <th scope="col">Tarefa</th>
                <th scope="col">Tempo</th>
                <th scope="col">O que envolve</th>
              </tr>
            </thead>
            <tbody>
              {ROUTINE.map((task) => (
                <tr key={task.label}>
                  <th scope="row">{task.label}</th>
                  <td className="time">{task.time}</td>
                  <td className="note-cell">{task.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Custos</p>
            <h2>O que continua saindo do seu bolso.</h2>
            <p>
              Sair do Elo7 acaba com a comissão sobre cada venda. Não acaba com taxa de
              pagamento nem com frete — isso existe em qualquer loja.
            </p>
          </div>

          <div className="grid-2">
            {COSTS.map((cost) => (
              <div className="card" key={cost.name}>
                <div className="cost-head">
                  <h3>{cost.name}</h3>
                  <span className="cost-when">{cost.value}</span>
                </div>
                <p>{cost.detail}</p>
              </div>
            ))}
          </div>

          <div className="note">
            <strong>Não coloco valores exatos aqui de propósito.</strong> Taxa de cartão e
            preço de frete mudam, e número desatualizado numa página vira promessa quebrada.
            Os valores do momento eu te passo por escrito antes de a loja entrar no ar.
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Fora da primeira versão</p>
            <h2>O que fica para depois.</h2>
            <p>
              Prefiro entregar a loja vendendo cedo e crescer com ela, em vez de segurar tudo
              esperando ficar completa. Estes itens estão mapeados, não esquecidos:
            </p>
          </div>

          <ul className="later">
            {NOT_YET.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p>
            Dúvida sobre qualquer passo aqui, me chama. Se alguma parte parecer complicada
            demais para o seu dia a dia, é sinal de que eu preciso simplificar — não de que
            você precisa aprender.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;
