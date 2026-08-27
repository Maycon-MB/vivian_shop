# Onde o projeto está

Fechamento de 27/08/2026. A loja está no ar em
[feitoparavocepapelaria.com.br](https://feitoparavocepapelaria.com.br)
desde 21/08, e hoje ela vende de verdade em tudo menos numa coisa: as
credenciais de produção do Mercado Pago.

Registro meu. Não vira PDF.

---

## O que existe e funciona

| | |
|---|---|
| Catálogo | 342 produtos, 140 temas, com busca e filtro |
| Avaliações | 13 reais, e agora as clientes escrevem novas |
| Conversa | dentro da loja, com texto livre, sem WhatsApp |
| Conta de quem compra | vê os próprios pedidos |
| Pedido | nasce no banco, com o preço lido de lá |
| Pagamento | **cobra de verdade, em ambiente de teste** |
| E-mail | Resend ligado: aviso de mensagem e recuperar senha |
| Painel dela | produtos, fotos, mensagens, avaliações, como recebe |

## O que falta, e o que trava cada coisa

| O quê | Trava |
|---|---|
| **Credenciais de produção** | só saem da conta dela |
| Frete real | decisão dela: Correios ou Melhor Envio |
| E-mail de convite de avaliação | uma função, sem depender de ninguém |
| Medição de visita | falta aplicar a migração 16 no Supabase |
| Descrição no cartão | três linhas, e o resto na página do produto |
| Filtro no celular | corre de lado, e o produto sobe para a primeira tela |

---

## Quanto falta, em porcentagem

Um número só engana, porque as partes não valem igual. Duas contas:

**Do que foi contratado**, a loja substituindo o Elo7: **93%.**
O que falta é o frete real e a virada das credenciais.

**Do que faz dinheiro entrar**: **96% construído, 0% cobrando.**
Enquanto a chave for `TEST-`, nenhum cartão é debitado. É uma troca de
duas linhas, e depende de três minutos dela.

O segundo número é o que importa. Uma loja 90% pronta que não cobra
fatura o mesmo que uma loja 0% pronta.

---

## O caminho até cobrar de verdade

1. **Ela gera as credenciais de produção** no painel de desenvolvedor do
   Mercado Pago. A aplicação já existe, criada por ela em 25/08.
2. **A Public Key vai na variável do GitHub**, e o Access Token nos
   segredos da função. O aviso de "loja em construção" some sozinho quando
   a chave deixar de começar com `TEST-`.
3. **Uma compra de teste com cartão real**, de valor baixo, feita por
   você. É o único jeito de saber que o dinheiro cai na conta dela.

Depois disso a loja vende.

---

## O que decidir com ela, sem pressa

**O frete.** Correios direto exige contrato dela; Melhor Envio e Kangu dão
preço melhor sem contrato. É o último item grande, e é decisão de negócio.

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
