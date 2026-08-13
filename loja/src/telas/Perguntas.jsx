'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import { MessageCircle, Check, Copy, Save, Send, Loader2, AlertCircle } from 'lucide-react';
import { enviarRespostas, podeEnviar } from '@/servicos/enviarRespostas';

/**
 * As perguntas que faltam para a loja abrir.
 *
 * Existe porque as perguntas estavam espalhadas em conversa de WhatsApp, e
 * pergunta em conversa se perde: a resposta vem de uma, as outras somem
 * para cima. Aqui elas ficam todas no mesmo lugar, ela responde na ordem
 * que quiser, no dia que der, e o que já respondeu não se perde.
 *
 * Não há servidor: o que ela escreve fica no navegador dela e só sai
 * quando ela aperta para mandar. Isso é limitação e é também garantia —
 * nada é enviado sem ela mandar.
 *
 * Cada pergunta traz o motivo de estar sendo feita. Pergunta sem motivo
 * parece burocracia; com motivo, ela consegue responder melhor, e às vezes
 * responde uma coisa melhor do que a que foi perguntada.
 */

/* O WhatsApp do Maycon, e não o da loja: quem recebe estas respostas é
   quem está construindo, não quem vende. O 55 na frente é o país — sem
   ele o link não abre para quem estiver fora do Brasil. */
const WHATSAPP_DO_MAYCON = '5521974587181';

const CHAVE = 'feito-para-voce:respostas-vivian';

/**
 * O que a Vivian já me contou pelo WhatsApp.
 *
 * Aparece no topo, para leitura, por dois motivos. O primeiro é não
 * reperguntar: nada irrita mais do que responder de novo o que já foi
 * respondido, e ela responderia com menos vontade a partir dali. O
 * segundo é mais importante — é a chance de ela ver que eu entendi
 * errado antes de o erro virar código.
 *
 * O que está aqui saiu da conversa dos dias 10 e 11 de agosto de 2026.
 */
const JA_SEI = [
  {
    titulo: 'O nome e as duas linhas',
    texto:
      'A loja se chama "Feito para você! Personalizados". Tem duas linhas: papelaria personalizada, que são os produtos feitos à mão, e papelaria pedagógica, que são as atividades adaptadas e jogos, vendidos em arquivo digital.',
  },
  {
    titulo: 'Mínimo de 10 e prazo de 5 dias',
    texto:
      'Cada produto personalizado sai de 10 em 10 — não dá para comprar 1 caneca, o mínimo são 10 canecas. Nada é pronta entrega: a produção leva 5 dias úteis depois que o pagamento é confirmado.',
  },
  {
    titulo: 'Digital e personalizado não se misturam',
    texto:
      'São duas compras separadas. O digital sai na hora por e-mail e WhatsApp, sem etiqueta e sem declaração de conteúdo; o personalizado entra na produção. Juntar os dois faria o arquivo constar numa embalagem onde ele não está.',
  },
  {
    titulo: 'De onde sai e por onde vai',
    texto:
      'Os envios saem do Rio de Janeiro, do CEP [dado pessoal removido], por Correios ou Jadlog — as duas que você já usava. O endereço vai impresso como remetente em toda etiqueta, e quem compra consegue ver.',
  },
  {
    titulo: 'A declaração de conteúdo continua',
    texto:
      'Você perguntou se ela ainda existe: existe. O sistema gera junto com a etiqueta, já preenchida, e você só imprime.',
  },
]

/* Guarda quantas respostas já saíram daqui. É o que separa "escrevi" de
   "mandei" — e essa diferença é a única falha séria deste formulário:
   sem servidor, uma resposta que ela escreve e não envia é, para quem
   está do outro lado, idêntica a uma resposta que nunca existiu. */
const CHAVE_ENVIADO = 'feito-para-voce:respostas-enviadas';

const BLOCOS = [
  {
    id: 'produtos',
    titulo: 'Os seus produtos',
    resumo: 'Sem isso a loja continua mostrando produto de exemplo.',
    perguntas: [
      {
        id: 'catalogo',
        pergunta: 'Quais produtos você quer vender já na abertura?',
        porque:
          'Não precisa ser tudo. Cinco ou seis já dão uma loja cheia. Dá para ir somando depois, sem mexer em nada.',
        dica: 'nome do produto, preço, e quanto tempo você leva para fazer',
        linhas: 6,
      },
      {
        id: 'fotos',
        pergunta: 'De quais produtos você já tem foto?',
        porque:
          'A foto é o que vende. Onde não tiver, eu deixo um espaço reservado — melhor isso do que foto de banco de imagem, que a cliente percebe.',
        dica: 'pode mandar as fotos no WhatsApp mesmo, aos poucos',
        linhas: 3,
      },
      {
        id: 'medidas',
        pergunta: 'Quanto pesa e qual o tamanho da caixa de cada pacote de 10?',
        porque:
          'É o que faz o frete sair certo. Como o mínimo é 10, a gente cadastra o pacote fechado do jeito que você já envia — mede uma vez e nunca mais. Se errar para menos, a diferença sai do seu bolso em cada pedido.',
        dica: 'ex: 10 cadernos = 1,8 kg, caixa de 30 x 25 x 12 cm. Balança de cozinha e fita métrica resolvem.',
        linhas: 5,
      },
    ],
  },
  {
    id: 'digital',
    titulo: 'O material pedagógico',
    resumo: 'É a parte que entrega sozinha, sem você precisar fazer nada.',
    perguntas: [
      {
        id: 'formato',
        pergunta: 'O material digital é PDF para imprimir em casa?',
        porque:
          'Perguntei isso no WhatsApp e a conversa seguiu para outro assunto. PDF abre em qualquer celular e ninguém edita. Se for Canva ou arquivo editável, muda a entrega e muda a proteção.',
        dica: 'PDF / Canva / outro',
        linhas: 2,
      },
      {
        id: 'oquevem',
        pergunta: 'Cada compra digital é um arquivo só, ou um pacote com vários?',
        porque:
          'Também perguntei no WhatsApp e ficou para trás. Muda como o preço aparece na loja: "R$ 47 a atividade" é diferente de "R$ 47 o pacote com 12".',
        dica: 'um arquivo por compra / um pacote / depende do produto',
        linhas: 2,
      },
      {
        id: 'marcadagua',
        pergunta:
          'Tudo bem o arquivo sair com o nome de quem comprou impresso nele?',
        porque:
          'É o que segura o repasse: quem compra pensa duas vezes antes de passar adiante um arquivo com o próprio nome. Não atrapalha o uso — dá para imprimir e usar normalmente.',
        dica: 'pode / prefiro que não / quero ver como fica antes',
        linhas: 2,
      },
      {
        id: 'validade',
        pergunta: 'O link de download pode valer por 7 dias?',
        porque:
          'Sete dias é folgado para baixar e curto para o link circular por aí. Passando disso, quem comprou te chama e você reenvia.',
        dica: '7 dias está bom / prefiro mais tempo / prefiro sem prazo',
        linhas: 2,
      },
    ],
  },
  {
    id: 'dinheiro',
    titulo: 'Receber o dinheiro',
    resumo: 'Isso eu não consigo decidir por você — a conta é sua.',
    perguntas: [
      {
        id: 'cnpj',
        pergunta: 'Você tem CNPJ (MEI), ou vende como pessoa física?',
        porque:
          'Muda a nota fiscal, muda a taxa do Mercado Pago e muda o que precisa aparecer no rodapé da loja. É a primeira coisa que um contador vai perguntar.',
        dica: 'tenho MEI / não tenho / estou tirando',
        linhas: 2,
      },
      {
        id: 'pix',
        pergunta: 'Qual conta você quer que receba as vendas?',
        porque:
          'Não me mande a chave nem a senha por aqui. Só preciso saber se é a mesma conta que você já usa, para configurarmos junto quando chegar a hora.',
        dica: 'a conta de sempre / uma conta nova / ainda vou abrir',
        linhas: 2,
      },
      {
        id: 'taxaelo7',
        pergunta: 'Quanto o Elo7 ficava de cada venda sua?',
        porque:
          'O painel tem uma tela que mostra quanto você economiza saindo de lá. Hoje ela usa um chute meu de 12%, e chute não serve para você tomar decisão. Se lembrar mais ou menos, já vale.',
        dica: 'ex: uns 12% / não lembro, mas era bem alto',
        linhas: 2,
      },
      {
        id: 'volume',
        pergunta: 'Mais ou menos quantos pedidos por mês você fazia no Elo7?',
        porque:
          'É o que diz se a estrutura mais barata aguenta ou se vamos precisar de outra. Chute mesmo já ajuda — não precisa ser número exato.',
        dica: 'ex: uns 20 por mês, mais na volta às aulas',
        linhas: 2,
      },
    ],
  },
  {
    id: 'entrega',
    titulo: 'Envio e devolução',
    resumo: 'O que a loja promete aqui, você vai ter que cumprir.',
    perguntas: [
      {
        id: 'troca',
        pergunta: 'O que você faz hoje quando a peça chega com defeito?',
        porque:
          'Preciso escrever isso na loja com as suas palavras, não com as minhas. Produto personalizado não tem direito de arrependimento de 7 dias — mas defeito tem, e o que você já faz costuma ser melhor do que o mínimo da lei.',
        dica: 'ex: refaço sem custo e pago o frete de volta',
        linhas: 3,
      },
      {
        id: 'whatsapp',
        pergunta: 'Qual número aparece no botão de WhatsApp da loja?',
        porque:
          'Hoje está um número de exemplo. Se for o seu pessoal, vale pensar se você quer ele público — depois que sai no ar, sai.',
        dica: 'pode ser o meu de sempre / quero um número só da loja',
        linhas: 2,
      },
    ],
  },
  {
    id: 'endereco',
    titulo: 'O endereço da loja na internet',
    resumo: 'O nome que a pessoa digita no navegador.',
    perguntas: [
      {
        id: 'dominio',
        pergunta: 'Qual endereço você quer? Ex: feitoparavoce.com.br',
        porque:
          'Custa por volta de R$ 40 por ano e é seu, não meu — fica no seu nome. Se alguém registrar antes, perdemos o nome. Me diga dois ou três que você gosta, em ordem.',
        dica: 'primeira opção, segunda, terceira',
        linhas: 3,
      },
    ],
  },
  {
    id: 'livre',
    titulo: 'Qualquer outra coisa',
    resumo: '',
    perguntas: [
      {
        id: 'outros',
        pergunta: 'Tem alguma coisa que te preocupa, ou que você achou estranho na loja?',
        porque:
          'Isso costuma valer mais do que todas as perguntas acima. Se alguma coisa te incomodou, é melhor eu saber agora.',
        dica: '',
        linhas: 4,
      },
    ],
  },
];

const TOTAL = BLOCOS.reduce((soma, bloco) => soma + bloco.perguntas.length, 0);

/** Monta o texto que vai para o WhatsApp, só com o que ela respondeu. */
const montarTexto = (respostas) => {
  const partes = ['Respostas sobre a loja:', ''];

  if (respostas.corrigir?.trim()) {
    partes.push('*Corrigindo o que você tinha entendido*');
    partes.push(respostas.corrigir.trim());
    partes.push('');
  }

  BLOCOS.forEach((bloco) => {
    const respondidas = bloco.perguntas.filter((p) => respostas[p.id]?.trim());
    if (respondidas.length === 0) return;

    partes.push(`*${bloco.titulo}*`);
    respondidas.forEach((p) => {
      partes.push(`${p.pergunta}`);
      partes.push(`— ${respostas[p.id].trim()}`);
      partes.push('');
    });
  });

  const naoRespondidas = TOTAL - Object.values(respostas).filter((r) => r?.trim()).length;
  if (naoRespondidas > 0) {
    partes.push(`(faltam ${naoRespondidas} — respondo depois)`);
  }

  return partes.join('\n');
};

const Perguntas = () => {
  const [respostas, setRespostas] = useState({});
  const [copiado, setCopiado] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const [jaEnviadas, setJaEnviadas] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [demorando, setDemorando] = useState(false);
  const [envio, setEnvio] = useState(null);
  const primeiraGravacao = useRef(true);

  /* Lido depois da montagem porque o site é estático: ler o navegador
     durante a renderização faria o HTML entregue divergir da tela. */
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CHAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (guardado) setRespostas(JSON.parse(guardado));

      const enviadas = Number(window.localStorage.getItem(CHAVE_ENVIADO));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isFinite(enviadas) && enviadas > 0) setJaEnviadas(enviadas);
    } catch {
      // Sem armazenamento, o formulário funciona igual: só não sobrevive
      // a fechar a aba. Não é motivo para não deixar ela responder.
    }
    /* O lint prefere que nada mude de estado na montagem. Mas o site é
       estático: o HTML sai do build sem saber o que ela já respondeu, e a
       única hora de ler o navegador é agora. Renderizar antes de ler
       mostraria o formulário vazio por um instante e daria a impressão de
       que o que ela escreveu se perdeu. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregado(true);
  }, []);

  /* Grava a cada tecla. Ela vai responder no celular, entre uma coisa e
     outra, e vai fechar a aba no meio — perder o que já escreveu é o tipo
     de coisa que faz alguém não voltar a preencher. */
  useEffect(() => {
    if (!carregado) return;
    if (primeiraGravacao.current) {
      primeiraGravacao.current = false;
      return;
    }
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(respostas));
    } catch {
      // Idem: sem espaço, segue sem gravar.
    }
  }, [respostas, carregado]);

  const IDS_DAS_PERGUNTAS = useMemo(
    () => BLOCOS.flatMap((bloco) => bloco.perguntas.map((p) => p.id)),
    [],
  );

  const respondidas = useMemo(
    () => IDS_DAS_PERGUNTAS.filter((id) => respostas[id]?.trim()).length,
    [respostas, IDS_DAS_PERGUNTAS],
  );

  /* A correção conta para "tem coisa não enviada", mas não para o "X de
     15": ela não é uma das perguntas, é um aviso de que eu errei. */
  const temCorrecao = Boolean(respostas.corrigir?.trim());

  /* Ter o que mandar é diferente de ter pergunta respondida: só a correção
     já basta, e é justamente a mensagem que eu menos posso perder. */
  const temOQueMandar = respondidas > 0 || temCorrecao;

  const texto = useMemo(() => montarTexto(respostas), [respostas]);

  const pendentes = Math.max(respondidas + (temCorrecao ? 1 : 0) - jaEnviadas, 0);

  /* Se ela fechar a aba com resposta escrita e não enviada, o navegador
     pergunta antes. É a última chance de avisar: depois de fechar, o
     texto continua guardado, mas ninguém do outro lado sabe que existe. */
  useEffect(() => {
    if (pendentes === 0) return;

    const perguntarAntesDeSair = (evento) => {
      evento.preventDefault();
      // Os navegadores ignoram a mensagem e mostram a própria, mas exigem
      // que alguma coisa seja devolvida para a pergunta aparecer.
      evento.returnValue = '';
    };

    window.addEventListener('beforeunload', perguntarAntesDeSair);
    return () => window.removeEventListener('beforeunload', perguntarAntesDeSair);
  }, [pendentes]);

  /* Chamado quando ela usa o botão do WhatsApp ou copia o texto. Não
     prova que a mensagem foi enviada — o envio acontece dentro do
     WhatsApp, fora daqui — mas é o ponto a partir do qual cobrar de novo
     seria implicância. */
  const marcarComoEnviadas = () => {
    const total = respondidas + (temCorrecao ? 1 : 0);
    setJaEnviadas(total);
    try {
      window.localStorage.setItem(CHAVE_ENVIADO, String(total));
    } catch {
      // Sem armazenamento, o aviso volta na próxima visita. Insistir de
      // novo é melhor do que deixar passar.
    }
  };

  const enviar = async () => {
    setEnviando(true);
    setDemorando(false);
    setEnvio(null);

    /* O primeiro envio do dia costuma passar de 20 segundos: o serviço que
       recebe fica adormecido e precisa acordar. Sem dizer nada, a Vivian
       vê "Enviando…" parado e conclui que travou — e aí aperta de novo, ou
       fecha a página achando que não foi. */
    const avisarDemora = setTimeout(() => setDemorando(true), 6000);

    const resultado = await enviarRespostas(respostas);

    clearTimeout(avisarDemora);

    if (resultado.ok) marcarComoEnviadas();
    setEnvio(resultado);
    setDemorando(false);
    setEnviando(false);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      marcarComoEnviadas();
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Alguns navegadores bloqueiam a cópia automática. O link do
      // WhatsApp continua valendo, então não é um beco sem saída.
      setCopiado(false);
    }
  };

  if (!carregado) return null;

  return (
    <div className={`perguntas ${pendentes > 0 ? "tem-pendente" : ""}`}>
      <Container className="py-4 py-md-5">
        <header className="perguntas-topo">
          <p className="perguntas-etiqueta">Para a Vivian</p>
          <h1>O que ainda falta decidir</h1>
          <p className="perguntas-intro">
            São {TOTAL} perguntas. Não precisa responder tudo hoje, nem na ordem: o que você
            escrever fica guardado neste aparelho, e você volta quando der. Quando quiser
            mandar, tem um botão no fim que me envia o que você já respondeu.
          </p>

          <div className="perguntas-progresso" role="status">
            <div className="perguntas-barra">
              <span style={{ width: `${(respondidas / TOTAL) * 100}%` }} />
            </div>
            <span>
              {respondidas} de {TOTAL} respondidas
            </span>
          </div>

          <p className="perguntas-guardado">
            <Save size={14} /> Salvo sozinho enquanto você escreve, neste aparelho. Nada é
            enviado até você apertar o botão lá embaixo.
          </p>
        </header>

        {/* O que ela já respondeu vem antes das perguntas novas, e para
            conferir, não para responder de novo. É aqui que um mal-entendido
            meu aparece enquanto ainda é barato de corrigir. */}
        <section className="perguntas-jasei">
          <h2>O que você já me contou</h2>
          <p className="perguntas-jasei-intro">
            Isto veio das nossas conversas. Dá uma lida rápida: se eu entendi alguma coisa
            errada, me fala — é melhor descobrir agora do que depois de a loja estar pronta.
          </p>

          <ul>
            {JA_SEI.map((item) => (
              <li key={item.titulo}>
                <Check size={16} aria-hidden="true" />
                <div>
                  <strong>{item.titulo}</strong>
                  <span>{item.texto}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="pergunta">
            <label htmlFor="p-corrigir">Tem alguma coisa errada aí em cima?</label>
            <p className="pergunta-porque">
              Se estiver tudo certo, pula esta e vai para as perguntas de baixo.
            </p>
            <textarea
              id="p-corrigir"
              rows={3}
              value={respostas.corrigir ?? ''}
              placeholder="o que eu entendi errado"
              onChange={(e) =>
                setRespostas((atual) => ({ ...atual, corrigir: e.target.value }))
              }
            />
          </div>
        </section>

        {BLOCOS.map((bloco) => (
          <section key={bloco.id} className="perguntas-bloco">
            <h2>{bloco.titulo}</h2>
            {bloco.resumo && <p className="perguntas-bloco-resumo">{bloco.resumo}</p>}

            {bloco.perguntas.map((p) => {
              const respondida = Boolean(respostas[p.id]?.trim());

              return (
                <div key={p.id} className={`pergunta ${respondida ? 'respondida' : ''}`}>
                  <label htmlFor={`p-${p.id}`}>
                    {respondida && <Check size={15} aria-hidden="true" />}
                    {p.pergunta}
                  </label>

                  <p className="pergunta-porque">{p.porque}</p>

                  <textarea
                    id={`p-${p.id}`}
                    rows={p.linhas}
                    value={respostas[p.id] ?? ''}
                    placeholder={p.dica}
                    onChange={(e) =>
                      setRespostas((atual) => ({ ...atual, [p.id]: e.target.value }))
                    }
                  />
                </div>
              );
            })}
          </section>
        ))}

        {pendentes > 0 && (
          <div className="perguntas-pendente" role="status">
            <strong>
              {pendentes === 1
                ? 'Você tem 1 resposta que ainda não me chegou.'
                : `Você tem ${pendentes} respostas que ainda não me chegaram.`}
            </strong>
            <span>
              Elas estão guardadas neste aparelho, mas eu só recebo quando você apertar o botão
              de enviar, no fim da página.
            </span>
          </div>
        )}

        <section className="perguntas-fim">
          <h2>Pronto para mandar?</h2>
          <p>
            Pode mandar com o que já respondeu — o resto fica guardado aqui e você manda de novo
            depois. O texto vai listar só o que você preencheu.
          </p>

          {envio?.ok && (
            <p className="perguntas-recebido" role="status">
              <Check size={17} />
              {envio.semConfirmacao
                ? 'Enviei! Se eu não confirmar por aqui em algumas horas, me chama no WhatsApp.'
                : 'Recebi, obrigado! Pode continuar respondendo o resto quando der.'}
            </p>
          )}

          {envio && !envio.ok && (
            <p className="perguntas-falhou" role="alert">
              <AlertCircle size={17} /> {envio.motivo}
            </p>
          )}

          {demorando && (
            <p className="perguntas-demora" role="status">
              Está demorando mais que o normal, mas não fechei nada — pode esperar mais um
              pouquinho. Suas respostas continuam guardadas aqui de qualquer jeito.
            </p>
          )}

          <div className="perguntas-acoes">
            {/* O envio direto é a ação principal porque funciona igual no
                computador e no celular. O WhatsApp fica ao lado, para quem
                prefere conversar — e como saída se o envio falhar. */}
            {podeEnviar && (
              <button
                type="button"
                className={`perguntas-enviar ${temOQueMandar ? '' : 'travado'}`}
                onClick={enviar}
                disabled={!temOQueMandar || enviando}
              >
                {enviando ? (
                  <>
                    <Loader2 size={17} className="girando" />
                    {demorando ? 'Ainda enviando, aguenta aí…' : 'Enviando…'}
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    {temOQueMandar ? 'Enviar minhas respostas' : 'Responda alguma coisa primeiro'}
                  </>
                )}
              </button>
            )}

            <a
              className={`${podeEnviar ? 'perguntas-whats' : 'perguntas-enviar'} ${temOQueMandar ? '' : 'travado'}`}
              href={`https://wa.me/${WHATSAPP_DO_MAYCON}?text=${encodeURIComponent(texto)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!temOQueMandar}
              onClick={(e) => {
                if (!temOQueMandar) {
                  e.preventDefault();
                  return;
                }
                marcarComoEnviadas();
              }}
            >
              <MessageCircle size={17} />
              {!temOQueMandar && !podeEnviar
                ? 'Responda alguma coisa primeiro'
                : 'Mandar pelo WhatsApp'}
            </a>

            <button
              type="button"
              className="perguntas-copiar"
              onClick={copiar}
              disabled={!temOQueMandar}
            >
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? 'Copiado' : 'Copiar o texto'}
            </button>
          </div>

          <Link href="/" className="perguntas-voltar">
            Voltar para a loja
          </Link>
        </section>
      </Container>
    </div>
  );
};

export default Perguntas;
