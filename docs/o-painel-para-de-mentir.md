# O painel para de mentir

Em 12/09 a Vivian perguntou uma coisa que ninguém tinha perguntado ainda:

> e aquele monte de dados que tem lá no admin, vai zerar quando começar a
> vender de verdade?

A resposta curta é **não, não ia zerar sozinho**. E a pergunta dela achou
um defeito maior do que ela imaginava.

---

## O que ela estava vendo

Duas coisas diferentes, que é fácil confundir:

**Dado guardado no banco dela.** Nenhum. Conferido em 12/09, no projeto
`kbvgdnrymwfavgkxqvjh`:

```sql
select
  (select count(*) from produtos)             as produtos,
  (select count(*) from pedidos)              as pedidos,
  (select count(*) from itens_do_pedido)      as itens,
  (select count(*) from eventos_de_pagamento) as avisos_mp;
```

```
produtos: 343   pedidos: 0   itens: 0   avisos_mp: 0
```

Os onze pedidos falsos que o teste de navegação criou em 25/08, contados
em [a-primeira-compra-de-verdade.md](a-primeira-compra-de-verdade.md), já
não estão lá. O banco dela está limpo, e **nenhum `DELETE` precisou ser
rodado**.

**Dado escrito no código.** Todo o resto. Os sete pedidos de
`dadosPedidos.js`, os quatro números do topo da Visão Geral, os gráficos,
a fila de produção, os mais vendidos, as sugestões de post. Nada disso
está guardado em lugar nenhum: está digitado nos arquivos da tela.

É por isso que não zerava. Não era dado velho esperando ser substituído.
Era desenho, e desenho só sai quando alguém tira.

---

## Por que existia

Foi decisão consciente, e por um tempo foi a certa. Antes de existir
banco, a tela precisava mostrar como ficaria cheia: gráfico vazio não
deixa ninguém julgar se o gráfico serve. O mesmo motivo do catálogo em
memória de [`catalogoMemoria.ts`](../loja/src/dados/catalogoMemoria.ts).

O erro não foi criar. Foi não ter previsto a saída. Mensagens, Produtos,
Avaliações e Como eu recebo já trocavam para a versão de verdade sozinhas,
olhando `temBanco()`. Pedidos, Relatórios e a Visão Geral inteira ficaram
para trás, e ninguém percebeu porque o selo `exemplo` em cima de cada
bloco parecia resolver.

Não resolvia. Selo funciona em um bloco solto numa tela de verdade. Numa
tela em que tudo é exemplo, ele vira papel de parede.

---

## O que estava em jogo

Não é acabamento. São três estragos, em ordem de gravidade.

**O primeiro é dinheiro.** Os Relatórios somavam os pedidos inventados no
faturamento, no ticket médio e na comparação com o Elo7. É com esses
números que ela decide preço, decide se continua pagando o fixo e decide
se volta para um marketplace. Receita inflada empurra as três decisões
para o lado errado, e o erro só aparece meses depois, no extrato.

**O segundo é confiança.** No dia da primeira venda ela abriria Pedidos e
veria oito: o dela e sete de gente que não existe. Ou acredita, e produz
encomenda inventada, ou desconfia da tela inteira, inclusive da venda que
é dela. A segunda é pior: painel em que não se confia não se usa, e aí
todo o resto do projeto perde o sentido.

**O terceiro é o pior, e não era dado: era botão.** "Lançar venda", na
Visão Geral, fabricava um pedido de R$ 150 com número sorteado, mostrava
"Venda manual registrada com sucesso!" e não gravava nada. É exatamente o
que [as-telas-que-salvam.md](as-telas-que-salvam.md) manda não existir.
Ela ia usar aquilo para lançar as vendas que fecha no WhatsApp, ler o
visto verde, e o pedido não existiria. "Agendar post no Instagram" era
igual.

E a aba de Pedidos ainda dizia, por escrito, que **"nada foi cobrado"** e
que o pedido ficava **"só neste navegador"**. Verdade até o Mercado Pago
de produção entrar. Depois disso, mentira sobre o dinheiro da cliente.

---

## O que passou a valer

A mesma chave que o resto do painel já usava:

```js
const naLoja = temBanco()
```

Com banco configurado, exemplo nenhum aparece. Sem banco, a demonstração
continua inteira, porque ela ainda serve para mostrar a loja a alguém
antes de qualquer conta existir.

| Tela | Antes | Agora |
|---|---|---|
| Pedidos | 7 exemplos somados à lista e à conta dos filtros | só o que veio do banco |
| Pedidos, tela vazia | "Experimente Todos, ou limpe a busca" | "Nenhuma venda ainda" |
| Pedidos, aviso | "nada foi cobrado", "só neste navegador" | some com a loja no ar |
| Relatórios | exemplos no faturamento, no ticket e na fila | só as vendas dela |
| Visão Geral | 4 números, 2 gráficos, fila, mais vendidos, tabela | visitas reais e um cartão dizendo que não houve venda |
| Lançar venda | fabricava pedido e confirmava | não aparece com a loja no ar |
| Agendar post | dizia ter postado no Instagram | não aparece com a loja no ar |

A Visão Geral com a loja no ar mostra o único número que ela tem de
verdade antes da primeira venda: a contagem de visita, que já estava no ar
e é medida real. Ver [a-contagem-de-visita.md](a-contagem-de-visita.md).

A escolha ali foi entre tela vazia e número inventado. Tela vazia ela
desconfia uma vez e pergunta; número inventado ela só descobre no extrato.

---

## Por que a chave é `temBanco()`, e não "já tem venda"

A alternativa óbvia, e o Maycon levantou ela na hora: deixar o mostruário
no ar enquanto não houvesse venda nenhuma, e trocar pelo dado de verdade
quando a primeira entrasse. Parece melhor — a tela nunca fica vazia, e a
demonstração vive até o último minuto em que ainda é útil.

Foi descartada por três motivos, em ordem de peso.

**A troca cairia no pior dia possível.** Com a chave em "já tem venda", a
primeira compra faria a tela pular de "R$ 16.768 este mês" para "R$ 320".
No dia mais importante do projeto ela leria que perdeu dinheiro, ou que
alguma coisa quebrou. Com a chave em `temBanco()`, o pulo é de "nenhuma
venda ainda" para "R$ 320", que é exatamente o que aconteceu na vida dela.

**Painel cheio esconde falha; painel vazio denuncia.** Se uma cliente
comprar e o pedido não chegar a ser gravado, com mostruário no ar a tela
continua movimentada e ninguém nota. É a mesma classe do `notification_url`
vazio descrita em
[a-primeira-compra-de-verdade.md](a-primeira-compra-de-verdade.md): o pagamento
aprova, o dinheiro entra, e o painel segue dizendo o que dizia antes. Zero
na tela é um sinal que funciona; número bonito não é sinal de nada.

**O dado de exemplo já tinha cumprido a função.** Ele existe para ela
julgar o desenho antes de existir banco. A loja cobra de verdade desde
agosto: o painel deixou de ser folheto e virou instrumento, e instrumento
que marca número inventado é pior do que instrumento marcando zero.

O custo dessa escolha é real e não vale esconder: ela perde a sensação de
painel farto, e tela vazia desanima. Foi por isso que o lugar dos quatro
números falsos não ficou em branco, e sim com a contagem de visita, que é
medida de verdade e diz uma coisa que o mostruário estava escondendo dela:
entrou gente e ninguém comprou.

Se um dia a demonstração fizer falta, o caminho combinado é um botão em
Configurações, "ver como o painel fica quando estiver vendendo", que liga
o mostruário de propósito e com tarja. A diferença não é técnica, é de
quem aperta a chave: ela sabendo, e não ela achando que são os números
dela. Ficou fora por ora, por decisão de 12/09.

---

## O que isto ensinou

**Dado de exemplo precisa nascer com a saída escrita.** Quem coloca
mostruário numa tela tem que colocar, no mesmo commit, a condição que o
tira. Não existe "depois eu limpo": duas semanas depois ninguém lembra
onde estava, e o que sobra é uma tela que mente com confiança.

**Selo `exemplo` não é substituto de guarda.** Ele avisa; não protege. E
numa tela em que tudo é exemplo, ele deixa de ser lido.

**O script de print tem que passar por todas as telas.** As duas telas
mais mentirosas do painel, Visão Geral e Pedidos, eram justamente as duas
que [fotografar-painel.cjs](../scripts/fotografar-painel.cjs) não abria.
A regra do projeto é olhar a tela, e ela só vale para as telas que o
script olha. As duas entraram.

Ao tirar o primeiro print da Visão Geral corrigida, o cartão novo saiu
branco: o conteúdo do painel vive num `div` com rolagem própria, e
`fullPage` estica a página, não o que rola dentro dela. A altura do print
virou regulável por causa disso. O código estava certo; era o print que
mentia, o que é a mesma classe de problema vista do outro lado.

---

## Dois vizinhos, achados pela mesma pergunta

Enquanto o painel era corrigido, a mesma conversa de 12/09 desencavou mais
dois, que não são do painel mas são exatamente da mesma família: coisa
errada no ar há semanas porque ninguém olhou.

**A loja se acusava de um defeito que não tinha.** A primeira linha da
página pública, acima do nome da loja, dizia "Alguns avisos por e-mail
ainda não são enviados". Quem entrasse para comprar lia isso antes de
qualquer outra coisa.

A causa era uma variável que nunca existiu. `NEXT_PUBLIC_EMAIL_ATIVO` é
lida em [`servicos/index.ts`](../loja/src/servicos/index.ts), mas faltava
no bloco `env:` do workflow e nas variáveis do repositório, onde as outras
três irmãs estão desde agosto. Com ela falsa, `estaTudoReal` nunca fechava.
O e-mail funciona desde 25/08, com domínio verificado e teste de ponta a
ponta ([ligar-o-resend.md](ligar-o-resend.md)): a loja passou dezoito dias
desmentindo a si mesma.

**A aba do navegador anunciava o framework.** O `favicon.ico` era o padrão
do Next.js, círculo preto com triângulo branco, desde o primeiro commit do
projeto. A loja de uma cliente pagante levava a marca da ferramenta que eu
uso para construí-la.

O ícone novo sai da marca dela, e não de desenho meu: os dois corações
recortados de `marca-feito-para-voce.webp`, sobre o azul claro da arte. A
marca inteira é circular e cheia de texto, e a 16×16 vira borrão; os
corações são o único elemento que sobrevive nesse tamanho.

Os dois ganharam guarda no [teste de
navegação](../scripts/testar-navegacao.cjs), pelo mesmo motivo: apagar o
`favicon.ico` faz o Next repor o dele sozinho, sem erro nenhum, e a marca
sumiria calada outra vez.

E ficou um aviso caro para quem for gerar ícone aqui: o `.ico` tem que
sair em **RGBA**. Com PNG em RGB dentro dele o Turbopack recusa o arquivo
e derruba o build inteiro, com `The PNG is not in RGBA format!`. Foi o que
aconteceu na primeira tentativa, e só apareceu porque o `publicar.mjs`
rodou antes do commit.

---

## O que dizer a ela

> Os pedidos, os gráficos e os números que você vê no painel não estão
> guardados em lugar nenhum. Eles são desenho, feitos para a tela não
> ficar vazia enquanto a loja não vendia.
>
> Não iam sumir sozinhos quando a primeira venda entrasse, porque nunca
> foram dados: eu é que tinha que tirá-los, e tirei. Seu banco está limpo,
> sem uma venda falsa sequer.
>
> Aproveitei e tirei do ar dois botões que estavam mentindo. O "Lançar
> venda" dizia "registrada com sucesso" e não guardava nada, e o de
> agendar post dizia que tinha ido para o seu Instagram. Nenhum dos dois
> fazia o que prometia. Eles voltam quando funcionarem de verdade.
>
> Sua loja também estava dizendo, na primeira linha da página, que alguns
> avisos por e-mail não eram enviados. Isso estava errado desde agosto: os
> e-mails funcionam. A frase saiu.
>
> E o desenho da abinha do navegador, aquele quadradinho que aparece ao
> lado do nome do site, era o símbolo do programa que eu uso para construir
> a loja, não o seu. Agora são os dois corações da sua marca.
>
> Foi uma pergunta muito boa. Se tiver outra dessas, manda.
