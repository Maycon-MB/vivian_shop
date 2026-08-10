import React, { useEffect, useRef } from 'react';
import '../styles/identity.css';

/**
 * Documento de direção visual da loja, apresentado à cliente.
 *
 * Unifica as duas marcas dela — Feito para Você (papelaria personalizada) e
 * Projeto Educar (atividades pedagógicas e psicopedagógicas) — numa única
 * loja, sem apagar nenhuma das duas.
 *
 * Conceito: a loja é um caderno. As duas linhas ocupam páginas opostas do
 * mesmo caderno; a pauta é a grade real do layout.
 */

const PALETTE = [
  {
    name: 'Papel',
    hex: '#FBFAF7',
    use: 'Fundo de tudo. Sulfite, não papel envelhecido.',
    needsBorder: true,
  },
  {
    name: 'Tinta',
    hex: '#12305B',
    use: 'Todo o texto e a marca. Azul de caneta, no lugar do preto.',
  },
  {
    name: 'Pauta',
    hex: '#A8C6E8',
    use: 'Linhas, bordas e divisões entre seções.',
  },
  {
    name: 'Verde-água',
    hex: '#2E9B96',
    use: 'Destaque da linha Feito para Você.',
  },
  {
    name: 'Marca-texto',
    hex: '#FFD400',
    use: 'Destaque da linha Projeto Educar. Sempre como fundo, com texto escuro por cima.',
  },
  {
    name: 'Rosa',
    hex: '#C4436B',
    use: 'Favoritos, promoções e avisos. Usada com parcimônia.',
  },
];

const SAMPLE_PRODUCTS = [
  { line: 'st', badge: 'Feito para Você', name: 'Caderno personalizado com nome', price: 'R$ 68,00', stock: '7 em estoque' },
  { line: 'st', badge: 'Feito para Você', name: 'Cartela de adesivos escolares', price: 'R$ 24,00', stock: 'Última unidade' },
  { line: 'ed', badge: 'Projeto Educar', name: 'Quadro de rotina visual imantado', price: 'R$ 125,00', stock: '12 em estoque' },
  { line: 'ed', badge: 'Projeto Educar', name: 'Jogo das emoções', price: 'R$ 58,00', stock: '4 em estoque' },
];

const OPEN_QUESTIONS = [
  {
    title: 'O nome do site',
    detail: 'As duas marcas continuam existindo dentro da loja. Falta decidir qual nome fica na porta de entrada e no endereço: Feito para Você, Projeto Educar, ou o seu nome reunindo as duas.',
  },
  {
    title: 'Quantas vendas por mês, mais ou menos',
    detail: 'Serve para dimensionar a loja e o custo mensal. Um número aproximado dos últimos meses no Elo7 já resolve.',
  },
  {
    title: 'A lista de produtos com foto, preço e quantidade',
    detail: 'É o que enche a loja. Pode vir em planilha, ou eu monto a partir do que já está publicado no Elo7.',
  },
  {
    title: 'Sua história',
    detail: 'Como o Projeto Educar começou, para quem você faz esse material, o que mudou para alguma família. Loja nova não tem reputação — tem história. É o que constrói confiança em quem chega pela primeira vez.',
  },
  {
    title: 'De onde você envia',
    detail: 'Cidade e estado, para calcular frete e prazo corretos já na primeira versão.',
  },
];

/**
 * O marca-texto preenche quando a frase entra na tela — o gesto de destacar
 * acontece durante a leitura, não antes dela.
 */
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

const IdentityPage = () => {
  const rootRef = useHighlightOnScroll();

  return (
    <div className="identity" ref={rootRef}>
      <header className="masthead">
        <div className="wrap">
          <h1>Identidade da loja</h1>
          <span className="meta">Proposta de direção visual · v1 · agosto de 2026</span>
        </div>
      </header>

      <div className="spread ruled">
        <div className="page page--stationery">
          <p className="eyebrow">Linha 1</p>
          <h2>Feito para&nbsp;Você</h2>
          <span className="line" />
          <p className="tagline">Papelaria personalizada, feita peça por peça.</p>
          <div className="ghost-cards">
            <div className="ghost">foto do produto</div>
            <div className="ghost">foto do produto</div>
          </div>
          <a className="go" href="#linhas">Ver papelaria →</a>
        </div>

        <div className="spine" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} />)}
        </div>

        <div className="page page--education">
          <p className="eyebrow">Linha 2</p>
          <h2>Projeto Educar</h2>
          <span className="line" />
          <p className="tagline">Atividades pedagógicas e psicopedagógicas para quem ensina.</p>
          <div className="ghost-cards">
            <div className="ghost">foto do produto</div>
            <div className="ghost">foto do produto</div>
          </div>
          <a className="go" href="#linhas">Ver atividades →</a>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">A ideia</p>
            <h2>A loja é um <span className="mark" data-mark>caderno</span>.</h2>
            <p>
              Duas marcas com paletas diferentes não cabem numa página só sem brigar. Em vez de
              inventar uma terceira identidade e apagar o que já foi construído no Elo7, as duas
              linhas ocupam páginas opostas do mesmo caderno: mesmo papel, mesma pauta, cores de
              destaque próprias. O visitante escolhe o lado dele no primeiro olhar, sem precisar
              do menu.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>O que veio de cada marca</h3>
              <p>
                O verde-água e o rosa saíram do anel e do coração da logo <strong>Feito para
                Você</strong>. O amarelo saiu do lápis e dos respingos do <strong>Projeto
                Educar</strong>. As duas logos já eram azuis — esse azul virou a tinta do site
                inteiro.
              </p>
            </div>
            <div className="card">
              <h3>Por que caderno, e não outra coisa</h3>
              <p>
                As artes que você já publica usam papel colado, percevejo, bloco de notas e
                coração desenhado à mão. A estética já existia; ela só não estava organizada num
                sistema. A pauta que aparece atrás desta página é a mesma grade que alinha todo o
                conteúdo do site.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Cores</p>
            <h2>Seis cores, cada uma com uma <span className="mark" data-mark>função</span>.</h2>
            <p>Nenhuma cor entra por enfeite. Se não tem trabalho para fazer, não entra na paleta.</p>
          </div>

          <div className="swatches">
            {PALETTE.map((color) => (
              <div className="swatch" key={color.hex}>
                <div
                  className="fill"
                  style={{
                    background: color.hex,
                    borderBottom: color.needsBorder ? '1px solid var(--rule)' : undefined,
                  }}
                />
                <div className="info">
                  <span className="name">{color.name}</span>
                  <span className="hex">{color.hex}</span>
                  <span className="use">{color.use}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="note">
            <strong>Sobre o amarelo:</strong> amarelo puro sobre branco é praticamente invisível
            para quem enxerga pouco. Por isso ele nunca vira cor de letra — só preenchimento, com
            a tinta azul escrita por cima. É a diferença entre usar a cor da marca e usar a cor
            errado.
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Letras</p>
            <h2>Duas famílias, três <span className="mark" data-mark>trabalhos</span>.</h2>
          </div>

          <div className="specimen">
            <div className="spec-row">
              <span className="spec-label">Títulos<br />Fraunces</span>
              <div>
                <div className="spec-display">Cada pequena descoberta</div>
                <p className="spec-note">
                  Serif com cantos levemente amaciados — carrega o feito à mão sem virar letra
                  cursiva. Aparece só em títulos, nunca em texto corrido.
                </p>
              </div>
            </div>

            <div className="spec-row">
              <span className="spec-label">Texto<br />Atkinson&nbsp;Hyperlegible</span>
              <div>
                <p className="spec-body">
                  Todo o texto da loja, do nome do produto ao botão de finalizar compra. Esta
                  fonte foi desenhada pelo Braille Institute para que letras parecidas não se
                  confundam: o i maiúsculo, o l minúsculo e o número 1 têm formas diferentes —
                  Il1 — e o zero é cortado.
                </p>
                <p className="spec-note">
                  Isso não é detalhe de designer. Boa parte de quem compra a linha Projeto Educar
                  está comprando justamente por acessibilidade. A loja usar a fonte feita para ser
                  legível é um argumento de venda, não um enfeite.
                </p>
              </div>
            </div>

            <div className="spec-row">
              <span className="spec-label">Números</span>
              <div>
                <div className="spec-util">
                  R$ 125,00 · R$ 58,00 · R$ 189,90<br />
                  Pedido 4829 · 12 em estoque · 5 dias úteis
                </div>
                <p className="spec-note">
                  Preços, quantidades e códigos de pedido usam algarismos de largura fixa, para
                  que as colunas do painel fiquem alinhadas mesmo com valores diferentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="linhas">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Aplicação</p>
            <h2>Como as duas linhas <span className="mark" data-mark>convivem</span>.</h2>
            <p>
              Mesma estrutura de card, mesma tipografia, mesmo espaçamento. Só a cor da etiqueta
              muda. Quem navega entende a que linha o produto pertence sem ler nada.
            </p>
          </div>

          <div className="products">
            {SAMPLE_PRODUCTS.map((product) => (
              <article className={`product product--${product.line}`} key={product.name}>
                <div className="thumb">foto do produto</div>
                <div className="body">
                  <span className="badge">{product.badge}</span>
                  <h4>{product.name}</h4>
                  <span className="price">{product.price}</span>
                  <span className="stock">{product.stock}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="note">
            <strong>Nomes, preços e estoques acima são exemplos</strong> para mostrar o formato.
            Os produtos reais entram com as suas fotos e os seus valores.
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Para seguir</p>
            <h2>O que eu preciso de <span className="mark" data-mark>você</span>.</h2>
            <p>Cada item aqui destrava uma parte da loja. Pode responder aos poucos.</p>
          </div>

          <ol className="asks">
            {OPEN_QUESTIONS.map((question, i) => (
              <li key={question.title}>
                <span className="n">{i + 1}</span>
                <div>
                  <strong>{question.title}</strong>
                  <span>{question.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p>
            Direção visual da loja · documento de trabalho, aberto a ajuste. A página muda de
            aparência conforme o tema do seu celular ou computador — no modo escuro, o caderno
            vira lousa.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IdentityPage;
