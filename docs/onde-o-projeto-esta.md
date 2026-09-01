# Onde o projeto está

Fechamento de 01/09/2026. A loja está no ar em
[feitoparavocepapelaria.com.br](https://feitoparavocepapelaria.com.br)
desde 21/08, e cobra de verdade em produção desde 01/09.

Registro meu. Não vira PDF.

> **Correção de 01/09.** Este documento chegou a dizer "100% pronto e no
> ar". Não estava: itens foram apagados da lista de pendências sem terem
> sido feitos. O que sobrou de verdade está em
> [o que falta](#o-que-falta-de-verdade), abaixo, e a régua passou a ser
> outra: só sai da lista o que foi conferido rodando, e o documento diz
> como foi conferido.

---

## O que existe e funciona

| | |
|---|---|
| Catálogo | 342 produtos, 140 temas, com busca e filtro |
| Avaliações | 13 reais, e agora as clientes escrevem novas |
| Conversa | dentro da loja, com texto livre, sem WhatsApp |
| Conta de quem compra | vê os próprios pedidos |
| Pedido | nasce no banco, com o preço lido de lá |
| Pagamento | **cobra de verdade em produção** |
| E-mail | Resend ligado: aviso de mensagem e recuperar senha |
| Painel dela | produtos, fotos, mensagens, avaliações, como recebe |

## O que falta de verdade

Em ordem de quanto custa deixar como está.

| O quê | Estado | Trava |
|---|---|---|
| **A primeira compra de verdade** | nunca foi feita | depende dela comprar. Ver [a-primeira-compra-de-verdade.md](a-primeira-compra-de-verdade.md) |
| **A conta sobrando no Supabase Auth** | existe | depende do painel do Supabase, que é dela. Ver [a-conta-que-sobrou.md](a-conta-que-sobrou.md) |
| Descrição no cartão | três linhas, e o resto na página do produto | nada, é trabalho meu |
| Filtro no celular | corre de lado, e o produto sobe para a primeira tela | nada, é trabalho meu |

Feito em 01/09, e conferido rodando:

| O quê | Como foi conferido |
|---|---|
| Mapa do site e robots.txt | `verificar-links.cjs` abriu os 487 endereços do sitemap contra o site montado, e todos respondem. Ver [o-google-acha-a-loja.md](o-google-acha-a-loja.md) |
| Cadastro público em `/admin` | a rota devolve 404 no site montado, e três testes travam a porta fechada |
| Cobrança em produção | `conferir-pagamento` responde `producao`, `valido`, conta `207270182` |

---

## Quanto falta, em porcentagem

Este documento trazia dois números redondos, e os dois estavam errados.

- **Do que foi contratado**: no ar e funcionando, menos os dois primeiros
  itens da tabela acima.
- **Do que faz dinheiro entrar**: a loja **cobra** em produção. Ninguém
  **comprou** ainda.

A distinção da segunda linha é o ponto. Uma loja que cobra e nunca foi
usada não é uma loja que vende: é uma loja em que a primeira cliente é
quem descobre o que não funciona.

---

## O que decidir com ela, sem pressa

**O frete** saiu daqui. Foi resolvido em 31/08 pelo Melhor Envio: a loja
cota Correios e Jadlog de verdade, e a cliente escolhe. Ver
[o-frete-da-vivian.md](o-frete-da-vivian.md).

**A primeira compra.** É o único item que depende dela agora, e é o
maior. Roteiro pronto, com o que ela precisa conferir depois de comprar,
em [a-primeira-compra-de-verdade.md](a-primeira-compra-de-verdade.md).

**A medição de visita** foi resolvida em 27/08, e sem ela precisar
decidir nada: a loja conta sozinha, sem cookie e sem identificar ninguém,
e por isso não há aviso de cookies na primeira tela. Google Analytics
mandaria dado das clientes dela para o Google em troca de um detalhe que
ela não vai usar. Ver [a-contagem-de-visita.md](a-contagem-de-visita.md).

O que sobra dela aqui é uma linha só: **marcar o link do anúncio com
`?origem=anuncio`**, senão o clique pago aparece misturado com o alcance
do post.

**Como ela recebe.** Parcelas, juros e desconto no Pix já estão na tela
dela, em "Como eu recebo". Nasce à vista e sem desconto de propósito: um
padrão que parcelasse sozinho estaria decidindo por ela o que sai do
bolso dela.

---

## O peso da loja, medido

No 4G estrangulado que o `medir-desempenho.cjs` simula (1,6 Mb/s, 150 ms):

| Tela | Antes de 27/08 | Depois |
|---|---|---|
| A loja | 618 KB, 3.521 ms | **546 KB, 3.178 ms** |
| O checkout | 360 KB, 2.189 ms | **288 KB, 1.905 ms** |
| Um produto | 277 KB, 1.734 ms | **230 KB, 1.676 ms** |

O que saiu do caminho crítico foi o cliente do Supabase, 80 KB
comprimidos, que três componentes puxavam em toda página de quem compra.

**Correção de uma conta minha.** Eu vinha registrando "o Bootstrap são 225
KB por página" como o próximo alvo de peso. São 225 KB **sem compressão**;
gzip derruba CSS para uns 30 KB. O peso sempre foi JavaScript, e eu estava
mirando no lugar errado.

---

## O que eu erraria de novo se não estivesse escrito

**Perguntar antes de supor.** Passei quatro dias construindo em cima de "o
catálogo se perdeu", e bastava perguntar o que ela fez quando o Elo7
fechou. Ver [o-catalogo-voltou.md](o-catalogo-voltou.md).

**Olhar a tela.** Os piores defeitos daqui passaram por build, lint e
teste: o menu coberto por uma faixa, o campo de cartão que o navegador
preenchia, a etiqueta aparecendo escrita ao lado do campo. Nenhum teste
pegou; o print pegou os três.

**Testar de ponta a ponta.** O aviso de pagamento derrubava a mensagem da
cliente junto, e o comentário no meu próprio arquivo dizia que isso não
podia acontecer. Só apareceu com uma cliente de mentira escrevendo na loja
de verdade.

**Ouvir quem olha de fora.** Uma auditoria em 26/08 achou que 262 dos 342
produtos mandavam a cliente conferir o prazo no Elo7. Setenta e sete por
cento do catálogo, e eu não tinha visto.
