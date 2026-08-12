/**
 * Registro do que foi combinado com a cliente.
 *
 * Fonte única da página "Combinado", que a cliente e o Maycon acompanham
 * pelo mesmo link. O histórico do git carimba a data de cada mudança.
 *
 * Por que registrar: o problema não é lembrar o que foi conversado — é
 * evitar o "eu não pedi isso" daqui a alguns meses. Decisão com data e
 * autor encerra a discussão sem constranger ninguém.
 *
 * Como manter: quando a cliente responder, mude o `estado`. Se ela mudar
 * de ideia, marque a decisão antiga como `revisto`, preencha `virou` e
 * acrescente a nova embaixo. Nunca apague — decisão revista continua
 * sendo história, e o motivo de ter mudado costuma valer mais que a
 * decisão em si.
 *
 * O que NÃO entra aqui: risco de projeto, margem, e qualquer nota que
 * seja gestão interna. Esta página é lida pela cliente.
 */

export const ESTADOS = {
  aguardando: {
    rotulo: 'Preciso da sua resposta',
    titulo: 'O que eu preciso saber.',
    descricao: 'Só isso depende de você. Pode responder aos poucos, na ordem que quiser.',
  },
  proposto: {
    rotulo: 'Decidi por conta',
    titulo: 'O que eu resolvi sem te perguntar.',
    descricao: 'Coisas técnicas que não precisam te tomar tempo. Estão aqui para você saber — se discordar de alguma, é só falar.',
  },
  aprovado: {
    rotulo: 'Combinado',
    titulo: 'O que já está fechado.',
    descricao: 'Você confirmou e já está valendo. Se algo aqui estiver diferente do que você quis dizer, me avisa.',
  },
  revisto: {
    rotulo: 'Mudamos',
    titulo: 'O que mudou no caminho.',
    descricao: 'Já tinha sido decidido de outro jeito. Fica registrado o antes e o depois.',
  },
}

/** Ordem em que as seções aparecem: o que trava vem primeiro. */
export const ORDEM = ['aguardando', 'proposto', 'aprovado', 'revisto']

export const QUEM = {
  vivian: 'Você decidiu',
  maycon: 'Eu decidi',
}

export const ATUALIZADO_EM = '11 de agosto de 2026'

export const DECISOES = [
  {
    id: 15,
    assunto: 'O visual da loja',
    decisao: 'As cores saíram das suas duas logos do Elo7: o verde-água e o rosa vieram do "Feito para você", o amarelo veio do "Projeto Educar", e o azul que as duas tinham virou a cor do texto.',
    quem: 'maycon',
    data: '10/08/2026',
    estado: 'aguardando',
    pergunta: 'Está parecendo a sua marca? Essa é a hora de mudar — depois que a loja estiver construída em cima disso, fica bem mais caro.',
  },
  {
    id: 10,
    assunto: 'Formato do material pedagógico',
    decisao: 'Ainda não definido.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'As atividades são PDF para a pessoa imprimir em casa? Cada compra é um arquivo só ou um pacote com vários? E o preço é por arquivo?',
  },
  {
    id: 9,
    assunto: 'Nome de quem comprou no arquivo',
    decisao: 'O material digital sairia com o nome de quem comprou escrito pequeno em cada página.',
    porque: 'Material digital corre o risco de ser repassado em grupo. O nome não atrapalha quem pagou, mas desanima quem ia repassar.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'Você topa? Se preferir sem, é só dizer — mas é melhor decidir agora, porque depois teria que refazer tudo que já foi vendido.',
  },
  {
    id: 14,
    assunto: 'Seu endereço na etiqueta',
    decisao: 'Os envios saem do seu endereço, e ele aparece como remetente em toda etiqueta.',
    porque: 'Os Correios exigem remetente real em toda encomenda.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'Quem compra consegue ver esse endereço. Era assim no Elo7 também, mas prefiro que você saiba. Se quiser usar outro endereço, dá para trocar.',
  },
  {
    id: 13,
    assunto: 'O que o painel faz no começo',
    decisao: 'Cadastrar produto, ver pedidos e gerar etiqueta. Chat dentro do painel, marketing automático e gráficos de venda ficam para depois.',
    porque: 'Prefiro entregar a loja vendendo cedo e ir crescendo com ela, em vez de segurar tudo esperando ficar completa.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'Alguma dessas coisas que ficaram para depois faz falta desde o primeiro dia para você?',
  },
  {
    id: 16,
    assunto: 'Quantas vendas por mês',
    decisao: 'Ainda não definido.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'Mais ou menos quantas vendas por mês você fazia no Elo7? Pode ser um chute. Serve para eu deixar a loja do tamanho certo e o custo mensal baixo.',
  },
  {
    id: 19,
    assunto: 'Seguro do frete',
    decisao: 'Com declaração de conteúdo, o seguro cobre extravio mas não cobre avaria, e o teto é R$ 1.500. Com nota fiscal cobre os dois, com teto de R$ 30 mil.',
    porque: 'Como você é MEI, pode escolher. Isso importa porque produto personalizado que chega quebrado não dá para revender: cada peça tem o nome de alguém.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aguardando',
    pergunta: 'Não precisa decidir agora. Mas se você vender coisa que quebra fácil, vale a gente pensar nisso antes de a loja abrir.',
  },

  {
    id: 8,
    assunto: 'Medidas para calcular o frete',
    decisao: 'Você cadastra o peso e o tamanho do pacote fechado de 10, e não da peça solta.',
    porque: 'Como o mínimo é 10 unidades, é isso que você realmente despacha. Pesa uma vez, numa balança de cozinha, e nunca mais pensa nisso.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'proposto',
  },
  {
    id: 11,
    assunto: 'Como o material digital chega',
    decisao: 'Por um link no e-mail, que vale por 7 dias. Não vai anexado.',
    porque: 'Arquivo anexado costuma cair na caixa de spam e tem limite de tamanho.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'proposto',
  },
  {
    id: 12,
    assunto: 'Aviso por WhatsApp',
    decisao: 'No começo, o e-mail sai sozinho e o WhatsApp é um botão que abre a conversa com a mensagem já escrita, para você só enviar.',
    porque: 'Para o envio ser totalmente automático, seria preciso um número dedicado que sai do WhatsApp normal. Você perderia o número que usa para atender pessoalmente — e esse atendimento direto é uma das melhores coisas que a sua loja tem.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'proposto',
  },
  {
    id: 17,
    assunto: 'Como funciona o pagamento',
    decisao: 'A pessoa paga sem sair da sua loja, em vez de ser mandada para a tela do Mercado Pago.',
    porque: 'Menos gente desiste no meio do caminho. O dinheiro cai igual na sua conta do Mercado Pago.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'proposto',
  },
  {
    id: 18,
    assunto: 'Custo para manter a loja no ar',
    decisao: 'Hospedagem, banco de dados e envio de e-mail ficam nos planos gratuitos. O único custo fixo é o endereço do site, cerca de R$ 40 por ano.',
    porque: 'Cabe com folga no valor mensal que combinamos. Se um dia o movimento crescer a ponto de sair do gratuito, eu te aviso antes de qualquer conta chegar.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'proposto',
  },

  {
    id: 1,
    assunto: 'Nome da loja',
    decisao: 'A loja se chama "Feito para você! Personalizados", com as duas linhas dentro, em vez de dois sites separados.',
    quem: 'vivian',
    data: '10/08/2026',
    estado: 'aprovado',
  },
  {
    id: 2,
    assunto: 'As duas linhas',
    decisao: 'Papelaria personalizada, que é feita sob encomenda, e papelaria pedagógica, que é digital. Cada uma tem sua cor na loja: verde-água e amarelo.',
    quem: 'vivian',
    data: '10/08/2026',
    estado: 'aprovado',
  },
  {
    id: 3,
    assunto: 'Pedido mínimo',
    decisao: 'Mínimo de 10 unidades de cada produto. Não dá para comprar 1 caneca — o mínimo são 10 canecas. Quem quiser dois modelos leva 10 de cada.',
    quem: 'vivian',
    data: '11/08/2026',
    estado: 'aprovado',
  },
  {
    id: 4,
    assunto: 'Prazo de produção',
    decisao: '5 dias úteis para produzir, contados de quando o pagamento é confirmado. O prazo aparece no produto, antes de a pessoa comprar.',
    quem: 'vivian',
    data: '10/08/2026',
    estado: 'aprovado',
  },
  {
    id: 5,
    assunto: 'Compras separadas',
    decisao: 'Material digital e personalizado não vão na mesma compra. Quem quiser os dois faz dois pedidos.',
    porque: 'A declaração de conteúdo precisa bater com o que está dentro da caixa, e um arquivo digital declarado seria um item que não está na embalagem.',
    quem: 'vivian',
    data: '11/08/2026',
    estado: 'aprovado',
  },
  {
    id: 6,
    assunto: 'Transportadoras',
    decisao: 'Correios e Jadlog, as mesmas que você já usava. Aparecem lado a lado com preço e prazo, e quem compra escolhe.',
    quem: 'vivian',
    data: '10/08/2026',
    estado: 'aprovado',
  },
  {
    id: 7,
    assunto: 'Declaração de conteúdo',
    decisao: 'Continua existindo, e vale para as duas transportadoras. Sai junto com a etiqueta, já preenchida com os itens, a quantidade e o valor.',
    porque: 'Confirmado: a Jadlog aceita declaração de conteúdo de MEI, sem precisar de nota fiscal. Desde abril de 2026 ela é eletrônica, então nem precisa mais preencher no papel.',
    quem: 'maycon',
    data: '11/08/2026',
    estado: 'aprovado',
  },
]

export const porEstado = (estado) => DECISOES.filter((d) => d.estado === estado)

/* ── Andamento da construção ──────────────────────────────────────────────
 *
 * O que existe hoje é protótipo: telas para a cliente ver e opinar, com
 * produtos de exemplo. A loja que vende de verdade ainda não existe, e a
 * página precisa dizer isso com todas as letras — cliente que acha que a
 * loja está pronta cobra o lançamento na semana seguinte.
 */

export const FASES = {
  pronto: { rotulo: 'Pronto', ordem: 1 },
  fazendo: { rotulo: 'Fazendo agora', ordem: 2 },
  proximo: { rotulo: 'Vem a seguir', ordem: 3 },
  depois: { rotulo: 'Mais para frente', ordem: 4 },
}

export const ETAPAS = [
  {
    nome: 'Identidade visual',
    detalhe: 'Cores, letras e o jeito da loja, tirados das suas duas logos.',
    fase: 'pronto',
    prototipo: true,
  },
  {
    nome: 'Telas da loja para você ver',
    detalhe: 'Catálogo, carrinho e as regras de venda funcionando, com produtos de exemplo.',
    fase: 'pronto',
    prototipo: true,
  },
  {
    nome: 'Explicação de como tudo funciona',
    detalhe: 'O passo a passo de uma venda, do pagamento até o envio.',
    fase: 'pronto',
    prototipo: true,
  },
  {
    nome: 'Esta página de acompanhamento',
    detalhe: 'Para nós dois vermos o que já ficou decidido e o que falta.',
    fase: 'pronto',
  },
  {
    nome: 'Loja de verdade, começando a ficar de pé',
    detalhe: 'Já dá para ver e navegar, ainda com produtos de exemplo. O link está logo acima desta lista.',
    fase: 'fazendo',
    link: 'loja/',
  },
  {
    nome: 'Catálogo com os seus produtos',
    detalhe: 'Sair do exemplo e montar o catálogo real, com as suas fotos e os seus preços.',
    fase: 'proximo',
  },
  {
    nome: 'Pagamento por Pix e cartão',
    detalhe: 'Ligar a loja à sua conta do Mercado Pago para o dinheiro cair direto para você.',
    fase: 'proximo',
  },
  {
    nome: 'Cálculo de frete e etiqueta',
    detalhe: 'Correios e Jadlog calculando na hora, e a etiqueta com a declaração saindo prontas.',
    fase: 'proximo',
  },
  {
    nome: 'Entrega do material pedagógico',
    detalhe: 'O arquivo indo sozinho para o e-mail assim que o pagamento é aprovado.',
    fase: 'proximo',
  },
  {
    nome: 'Seu painel de verdade',
    detalhe: 'Cadastrar produto, ver pedidos e gerar etiqueta, tudo pelo celular.',
    fase: 'proximo',
  },
  {
    nome: 'Endereço próprio e loja no ar',
    detalhe: 'Registrar o endereço do site e abrir a loja para o público.',
    fase: 'depois',
  },
  {
    nome: 'Posts no Instagram',
    detalhe: 'Começa depois que a loja estiver vendendo, para o post ter para onde mandar as pessoas.',
    fase: 'depois',
  },
  {
    nome: 'Anúncios pagos',
    detalhe: 'Por último, quando já soubermos o que mais vende.',
    fase: 'depois',
  },
]

export const ORDEM_FASES = ['fazendo', 'proximo', 'pronto', 'depois']

export const porFase = (fase) => ETAPAS.filter((e) => e.fase === fase)
