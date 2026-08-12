'use client'

import React, { useEffect, useRef } from 'react';
import '../identidade.css';
import {
  PERSONALIZADA,
  PEDAGOGICA,
  MINIMO_PERSONALIZADO,
  PRAZO_PRODUCAO,
  TRANSPORTADORAS,
} from '../catalogo';

/**
 * Como funciona a loja, explicado para a cliente.
 *
 * A dúvida real de quem sai do Elo7 não é "o site é bonito?" — é "quanto
 * trabalho sobra para mim?". Por isso cada passo diz quem executa: ela, o
 * sistema, ou quem compra.
 *
 * As duas linhas têm caminhos diferentes e precisam ser explicadas
 * separadamente: a personalizada passa por produção e frete, a pedagógica
 * é digital e não tem nenhum dos dois.
 */

const ACTOR = {
  system: { label: 'Automático', className: 'by-system' },
  vivian: { label: 'Você faz', className: 'by-vivian' },
  buyer: { label: 'Quem compra', className: 'by-buyer' },
};

const FLOW_FISICO = [
  {
    actor: ACTOR.buyer,
    title: 'A pessoa escolhe e vê as regras antes de pagar',
    detail: `O mínimo de ${MINIMO_PERSONALIZADO} unidades e o prazo de ${PRAZO_PRODUCAO} dias úteis aparecem no próprio produto, antes do carrinho. Ninguém descobre isso depois de pagar.`,
  },
  {
    actor: ACTOR.buyer,
    title: 'Coloca o CEP e escolhe a entrega',
    detail: `${TRANSPORTADORAS.join(' e ')} aparecem lado a lado, com preço e prazo de cada um. Ela escolhe. O cálculo sai do seu CEP no Rio.`,
  },
  {
    actor: ACTOR.buyer,
    title: 'Paga por Pix ou cartão',
    detail: 'Cartão pode ser parcelado. O Pix aprova na hora.',
  },
  {
    actor: ACTOR.system,
    title: 'O pedido cai no seu painel',
    detail: 'No instante em que o pagamento aprova, com aviso no seu WhatsApp. O prazo de produção começa a contar sozinho.',
  },
  {
    actor: ACTOR.vivian,
    title: 'Você produz',
    detail: `Os ${PRAZO_PRODUCAO} dias úteis combinados. O painel mostra a fila do que está em produção e para quando cada pedido está prometido.`,
  },
  {
    actor: ACTOR.vivian,
    title: 'Clica em "Gerar etiqueta"',
    detail: 'Saem a etiqueta e a declaração de conteúdo juntas, já preenchidas com os itens, a quantidade e o valor. Você imprime, assina a declaração e leva. É o único passo que exige você.',
  },
  {
    actor: ACTOR.system,
    title: 'Quem comprou recebe o rastreio',
    detail: 'O código vai por e-mail e WhatsApp assim que a etiqueta é gerada. Acaba o "chegou meu pedido?" na sua caixa de mensagens.',
  },
];

const FLOW_DIGITAL = [
  {
    actor: ACTOR.buyer,
    title: 'A pessoa compra o material',
    detail: 'Sem mínimo de unidades, sem frete, sem escolher transportadora. É bem mais rápido que o pedido físico.',
  },
  {
    actor: ACTOR.system,
    title: 'O arquivo chega na hora',
    detail: 'Assim que o pagamento aprova, o material vai para o e-mail e o WhatsApp cadastrados. Não passa por você.',
  },
  {
    actor: ACTOR.system,
    title: 'O nome de quem comprou vai no arquivo',
    detail: 'Escrito pequeno em cada página. Não atrapalha quem pagou e desanima quem pensaria em repassar no grupo. Se você preferir sem, é só me dizer.',
  },
  {
    actor: ACTOR.system,
    title: 'Você só vê a venda no painel',
    detail: 'Não tem o que fazer. Esse é o produto que vende enquanto você dorme.',
  },
];

const ROUTINE = [
  { label: 'Cadastrar um produto novo', time: 'uns 3 minutos', note: 'Foto, nome, preço, medidas do pacote.' },
  { label: 'Despachar um pedido', time: 'uns 2 minutos', note: 'Etiqueta e declaração saem juntas.' },
  { label: 'Vender material pedagógico', time: 'nenhum', note: 'É tudo automático.' },
  { label: 'Responder uma dúvida', time: 'quando quiser', note: 'As mensagens ficam no painel, junto do pedido.' },
  { label: 'Conferir quanto vendeu', time: 'nenhum', note: 'O painel já mostra ao abrir.' },
];

const COSTS = [
  {
    name: 'Mercado Pago',
    value: 'por venda',
    detail: 'Cobrado só quando você vende. Cartão e Pix têm taxas diferentes, publicadas na sua conta.',
  },
  {
    name: 'Correios e Jadlog',
    value: 'por envio',
    detail: 'Cobrado de quem compra, no momento do pagamento. Não sai do seu bolso. Material pedagógico não tem frete nenhum.',
  },
  {
    name: 'Endereço do site',
    value: 'anual',
    detail: 'Registro do domínio .com.br, pago uma vez por ano ao Registro.br.',
  },
  {
    name: 'Hospedagem',
    value: 'incluída',
    detail: 'Dentro da manutenção mensal enquanto o volume couber no plano atual. Se crescer muito, eu aviso antes de mudar qualquer coisa.',
  },
];

const NOT_YET = [
  'Nota fiscal automática — precisa ser configurada junto com seu contador.',
  'Retirada em mãos e entrega própria no Rio.',
  'Cupom de desconto e programa de indicação.',
  'Área de cliente para rebaixar o material comprado.',
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

const Flow = ({ steps }) => (
  <ol className="flow">
    {steps.map((step, i) => (
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
);

const HowItWorksPage = () => {
  const rootRef = useHighlightOnScroll();

  const manual = [...FLOW_FISICO, ...FLOW_DIGITAL].filter((step) => step.actor === ACTOR.vivian).length;
  const total = FLOW_FISICO.length + FLOW_DIGITAL.length;

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
              De {total} passos, só {manual} precisam de <span className="mark" data-mark>você</span>.
            </h2>
            <p>
              Produzir a encomenda e clicar em um botão para imprimir a etiqueta. Cobrar, avisar,
              entregar o material digital, mandar o rastreio e depositar o dinheiro é o sistema
              que faz.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>{PERSONALIZADA}</h3>
              <p>
                Feita sob encomenda. Mínimo de {MINIMO_PERSONALIZADO} unidades, {PRAZO_PRODUCAO} dias
                úteis de produção depois do pagamento, e envio por {TRANSPORTADORAS.join(' ou ')}.
              </p>
            </div>
            <div className="card">
              <h3>{PEDAGOGICA}</h3>
              <p>
                Digital. Vai para o e-mail e o WhatsApp na hora em que o pagamento aprova. Sem
                mínimo, sem frete, sem produção — e sem trabalho seu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Caminho 1</p>
            <h2>Quando alguém compra um personalizado.</h2>
          </div>
          <Flow steps={FLOW_FISICO} />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Caminho 2</p>
            <h2>Quando alguém compra material pedagógico.</h2>
          </div>
          <Flow steps={FLOW_DIGITAL} />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Uma regra importante</p>
            <h2>Cada compra é de uma linha <span className="mark" data-mark>só</span>.</h2>
            <p>
              Material digital e personalizado não vão na mesma compra. Se a pessoa quiser os
              dois, faz dois pedidos.
            </p>
            <p>
              O motivo é a declaração de conteúdo: ela precisa bater com o que está dentro da
              caixa. Um arquivo digital listado numa declaração de encomenda física é um item
              declarado que não está na embalagem.
            </p>
            <p>
              Na loja isso é automático. Se já tem personalizado no carrinho e a pessoa tenta
              somar um material digital, aparece um aviso explicando que são compras separadas —
              ela não descobre isso só no fim.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Seu dia a dia</p>
            <h2>Quanto tempo cada coisa <span className="mark" data-mark>toma</span>.</h2>
            <p>
              O painel foi feito para você usar do celular, entre uma encomenda e outra. Nada aqui
              precisa de computador.
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
              Sair do Elo7 acaba com a comissão sobre cada venda. Não acaba com taxa de pagamento
              nem com frete — isso existe em qualquer loja.
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
            <strong>Não coloco valores exatos aqui de propósito.</strong> Taxa de cartão e preço de
            frete mudam, e número desatualizado numa página vira promessa quebrada. Os valores do
            momento eu te passo por escrito antes de a loja entrar no ar.
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
            Dúvida sobre qualquer passo aqui, me chama. Se alguma parte parecer complicada demais
            para o seu dia a dia, é sinal de que eu preciso simplificar — não de que você precisa
            aprender.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;
