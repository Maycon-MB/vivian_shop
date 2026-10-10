# O Google Shopping gratuito

Como os produtos dela vão para a aba Shopping do Google sem custo, e o que
falta para ligar.

---

## Onde está

| O quê | Estado |
|---|---|
| A lista de produtos | **no ar** em `https://feitoparavocepapelaria.com.br/google-shopping.xml` |
| Produtos na lista | 342, todos os publicados |
| Preço bate com a página | **342 de 342**, conferido em 25/09 |
| Conta no Merchant Center | **não criada**: depende dela, uns 15 minutos |
| Regra de frete no Merchant Center | **a decidir com ela**: fixo ou por peso |
| Dados do produto dentro da página | cada página de produto leva o mesmo preço e o mesmo título da lista |
| Fotos abaixo do mínimo de 2027 | 54 tubolatas, com 580 x 427 pixels; refazer antes de 31/01/2027 |

Registro meu. Não vira PDF.

---

## Por que isto, e não anúncio

Em 25/09 ela relatou zero venda e, no mesmo dia, disse que não tem verba
para anúncio nem tempo para alimentar o Instagram. As listagens gratuitas
do Google mostram o produto com foto e preço na busca, no Shopping, nas
Imagens, no YouTube e no Lens, sem custo, e o Merchant Center busca a lista
sozinho todo dia. Depois de ligado, não pede nada dela.

---

## Como a lista é feita

Sai do `publicar.mjs`, do mesmo catálogo que gera as páginas e o
`sitemap.xml`. As regras estão em
[listaDoGoogleShopping.mjs](../loja/src/dominio/listaDoGoogleShopping.mjs),
em JavaScript puro pelo mesmo motivo do `mapaDoSite.mjs`.

Três regras do Google decidiram o formato:

**O preço é o do pedido mínimo.** O Google manda enviar "o preço do número
mínimo de produtos que o usuário precisa comprar". Um álbum de R$ 13,50 com
mínimo de 10 vai como **R$ 135,00**, e o título ganha "(pedido mínimo de 10
unidades)". Mandar R$ 13,50 seria preço enganoso, e o Google reprova.

**O preço da lista tem de estar na página.** Ele está: o botão da página
de produto nasce com a quantidade mínima e diz "Adicionar · R$ 135,00" já
no HTML estático, que é o que o robô do Google lê. Conferido produto a
produto em 25/09: 342 iguais, nenhum diferente.

**Peça personalizada não tem código de barras.** Vai com
`identifier_exists` = `no` e a loja como marca. Sem isso o Google cobra
GTIN e segura o produto como incompleto.

O prazo de produção vai como tempo de preparo (`min_handling_time` e
`max_handling_time`), e o peso do pedido mínimo vai em `shipping_weight`.

**A página diz o mesmo preço em dados estruturados.** A página destaca
"R$ 13,50 cada unidade", e a lista manda R$ 135,00. O botão já mostrava o
total, mas cada página de produto também leva um bloco `Product` em
JSON-LD com o preço do pedido mínimo, o título com "(pedido mínimo de 10
unidades)" e o mesmo código da lista. Os dois saem da mesma função,
`camposParaOGoogle`, então não têm como divergir. De quebra, o Google pode
mostrar preço e disponibilidade no resultado comum da busca.

---

## O que falta, e é dela

Com o **mesmo gmail que já é proprietário no Search Console**. É isso que
faz o site entrar verificado sem mexer no DNS: o Merchant Center considera
o site verificado "se qualquer um dos seus usuários for um proprietário
verificado no Search Console".

1. Entrar em `merchants.google.com` com esse gmail e criar a conta: nome
   da loja, país Brasil, site `feitoparavocepapelaria.com.br`.
2. O site aparece como verificado. Clicar em **reivindicar**, que liga o
   endereço à conta dela.
3. Adicionar os produtos por **arquivo buscado de um endereço**, com
   `https://feitoparavocepapelaria.com.br/google-shopping.xml`, com busca
   **diária**.
4. Criar a regra de frete para o Brasil (ver abaixo). O Google exige frete
   informado no Brasil, e sem ele os produtos não aparecem. Antes disso ela
   precisa decidir: valor fixo ou por faixa de peso.
5. Preencher a política de devolução: prazo e quem paga a volta. Peça
   personalizada costuma ter regra própria, e o texto tem de bater com o
   da página de política da loja.
6. Ligar as **listagens gratuitas**. Vêm ligadas por padrão na maioria dos
   casos, mas é bom conferir.
7. Um ou dois dias depois, abrir **Diagnóstico** e ver se algum produto foi
   reprovado, e por quê.

---

## O frete, que ainda não está decidido

Os Correios não estão entre as transportadoras que o Google calcula
sozinho. A regra fica na conta do Merchant Center, e precisa de um valor
que ela aceite mostrar: fixo, ou por faixa de peso. O peso de cada pedido
mínimo já vai na lista.

O valor não deve ficar muito abaixo do que o checkout cobra, porque a
cliente veria um frete no Google e outro na loja. Decidir com ela, a partir
do frete real de um pedido típico saindo do CEP de origem.

---

## As 54 fotos que ficam abaixo do mínimo em 2027

A página oficial do Google, conferida em 10/10/2026, diz: "We recently
announced new image size requirements of at least 500 x 500 pixels for all
products beginning January 31, 2027." Ou seja, o mínimo de **500 x 500
pixels para todo produto vale a partir de 31/01/2027**, e não hoje. Ela
recomenda fotos de uns 1500 x 1500.

As tubolatas foram publicadas com **580 x 427**: passam hoje e ficam abaixo
do mínimo em 31/01/2027. As outras 288 fotos têm 580 x 580.

A lista manda as 54 assim mesmo: a reprovação é produto a produto e não
derruba os outros. O conserto é refazer as fotos das tubolatas em formato
quadrado **antes de 31/01/2027**. Os originais estão com ela, e não no
repositório.

---

## De onde vieram as regras

Consultados em 25/09/2026, na Ajuda do Google Merchant Center:

- [Preço, com pedido mínimo](https://support.google.com/merchants/answer/6324371?hl=pt-BR)
- [Link da imagem: formatos e tamanho mínimo](https://support.google.com/merchants/answer/6324350?hl=pt-BR), conferido de novo em 10/10/2026
- [Listagens gratuitas: onde aparecem, e frete obrigatório no Brasil](https://support.google.com/merchants/answer/13889434?hl=pt-BR)
- [Verificação e reivindicação do site](https://support.google.com/merchants/answer/11586344?hl=pt-BR)
- [Frete da transportadora](https://support.google.com/merchants/answer/15449142?hl=pt-BR)
