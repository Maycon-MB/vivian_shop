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
| Regra de frete no Merchant Center | **a decidir com ela** |
| Fotos que o Google vai reprovar | 54 tubolatas, com 580 x 427 pixels |

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

---

## O que falta, e é dela

Com o **mesmo gmail que já é proprietário no Search Console**. É isso que
faz o site entrar verificado sem mexer no DNS: o Merchant Center considera
o site verificado "se qualquer um dos seus usuários for um proprietário
verificado no Search Console".

1. Entrar em `merchants.google.com` e criar a conta: nome da loja, país
   Brasil, site `feitoparavocepapelaria.com.br`.
2. O site aparece como verificado. Clicar em **reivindicar**, que liga o
   endereço à conta dela.
3. Criar a regra de frete para o Brasil (ver abaixo). O Google exige frete
   informado no Brasil, e sem ele os produtos não aparecem.
4. Adicionar os produtos por **arquivo buscado de um endereço**, com
   `https://feitoparavocepapelaria.com.br/google-shopping.xml`, buscado
   todo dia.
5. Conferir que as listagens gratuitas estão ligadas. Vêm ligadas por
   padrão na maioria dos casos.

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

## As 54 fotos que o Google vai reprovar

O mínimo do Google é **500 x 500 pixels**, e produto com foto menor "vai ser
reprovado". As tubolatas foram publicadas com **580 x 427**. As outras 288
fotos têm 580 x 580.

A lista manda as 54 assim mesmo: a reprovação é produto a produto e não
derruba os outros. O conserto é refazer as fotos das tubolatas em formato
quadrado. Os originais estão com ela, e não no repositório.

---

## De onde vieram as regras

Consultados em 25/09/2026, na Ajuda do Google Merchant Center:

- [Preço, com pedido mínimo](https://support.google.com/merchants/answer/6324371?hl=pt-BR)
- [Link da imagem: formatos e tamanho mínimo](https://support.google.com/merchants/answer/6324350?hl=pt-BR)
- [Listagens gratuitas: onde aparecem, e frete obrigatório no Brasil](https://support.google.com/merchants/answer/13889434?hl=pt-BR)
- [Verificação e reivindicação do site](https://support.google.com/merchants/answer/11586344?hl=pt-BR)
- [Frete da transportadora](https://support.google.com/merchants/answer/15449142?hl=pt-BR)
