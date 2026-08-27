# Quem entrou na loja

Como a loja conta visita, por que sem cookie, e o que ainda falta para o
número aparecer no painel dela.

Escrito em 27/08/2026.

---

## Por que isto existe

Sem contagem de visita, o painel dela mostra pedido, e pedido é o fim da
história. Entre o anúncio e a venda existem as pessoas que entraram e
foram embora, e são elas que dizem qual é o problema:

| O que o número mostra | O que fazer |
|---|---|
| Ninguém entrou | O anúncio não está aparecendo, ou o texto dele não convence |
| Entrou gente e ninguém comprou | Foto, preço ou descrição. Trazer mais gente não conserta |
| Entrou gente e comprou | Trazer mais gente vira mais venda |

São três consertos diferentes, e sem visita os três parecem iguais.
**É por isso que anúncio pago estava travado**: pagar sem esse número é
pagar para não descobrir nada.

---

## Como funciona

Cada página aberta na loja manda três coisas para o banco: a página, uma
palavra de origem, e se é a primeira página daquela visita. O banco soma
um contador.

Não vai nome, e-mail, telefone, IP, aparelho, nem identificador nenhum.
**Não existe como voltar do contador para uma pessoa**, nem para mim, nem
para ela, nem para quem invadir o banco.

### Por que sem cookie

Cookie de medição exige aviso de consentimento, e o aviso é a primeira
coisa que a cliente vê ao abrir a loja. Custa venda, e custa para
responder uma pergunta que não precisa de cookie nenhum.

O preço é honesto e está escrito na tela dela: **ela não vê quem visitou,
e nunca vai ver.** Vê quantos, de onde vieram e o que olharam.

### O que separa "cinco pessoas" de "uma pessoa em cinco páginas"

Uma marca no navegador de quem visita, que morre quando a aba fecha e
nunca sai dali. O banco recebe um verdadeiro ou falso, e não a marca.

Isso torna a contagem de pessoas **aproximada por baixo**: quem volta
amanhã conta de novo. É o número certo para a pergunta que ela faz, que é
"quanta gente o anúncio trouxe hoje".

---

## De onde a pessoa veio

A origem sai do site que mandou a pessoa para cá, e cai numa lista
fechada: Instagram, Facebook, WhatsApp, Google, Pinterest, TikTok,
YouTube, anúncio pago, digitou o endereço, e outros sites.

**A lista é fechada dos dois lados**, e não é frescura. A chamada sai de
dentro da página, e a chave anônima está lá dentro: quem quiser manda o
que quiser nela. Sem a lista, uma tarde de brincadeira enche a tabela de
milhões de origens inventadas e o relatório dela vira lixo ilegível. Com a
lista, o pior que alguém faz é inflar um número que já era aproximado.

### O clique pago e o post normal chegam iguais

Os dois chegam com `instagram.com`. A única forma de separar é marcar o
link do anúncio:

```
https://feitoparavocepapelaria.com.br/?origem=anuncio
```

Sem essa marca, o dinheiro do anúncio aparece misturado com o alcance do
post, e não dá para saber se valeu. **É o passo que ela precisa lembrar de
dar na hora de criar o anúncio**, e o único.

O `utm_source` que o gerenciador do Instagram gruda sozinho também é lido.

---

## O que a tela responde

O bloco fica em **Relatórios**, no alto, e aparece mesmo em mês sem venda:
mês sem venda é exatamente quando ela precisa saber se entrou gente.

- quantas pessoas e quantas páginas, em 7, 30 ou 90 dias
- quantas páginas cada pessoa abriu, que diz se a loja segura quem chega
- quantos pedidos no **mesmo período**, e a taxa
- de onde vieram, e o que mais olharam

A taxa compara com a mesma janela de dias, e não com o mês. Comparar
visita de sete dias com pedido de trinta infla a conta por quatro, e ela
desligaria um anúncio que estava dando certo.

Os pedidos que entram nessa conta são **só os de verdade**, e não os de
demonstração. Misturar pedido inventado faria a loja parecer converter bem
enquanto ninguém compra.

### Os cortes da leitura

Abaixo de 0,5% a tela diz para olhar foto e preço antes de anunciar; entre
0,5% e 2% diz que está no normal de loja pequena; acima disso diz que
trazer mais gente tende a virar mais venda.

São **referência de mercado, e não medida da loja dela**. Quando houver
três meses de número próprio, o certo é comparar com ela mesma.

---

## Quem pode ler

Só quem está em `donas_da_loja`. Não é segredo de estado, mas é informação
de negócio dela: quanto a loja recebe de gente e de onde. Concorrente
nenhum precisa ver, e a chave anônima está dentro da página.

A pergunta é feita **dentro de cada função do banco**, e não na tela. As
funções são `security definer`, que passa por cima da política de leitura:
sem a checagem lá dentro, qualquer um com a chave anônima leria o
movimento da loja.

Quem visita só escreve, e escreve por uma função que não devolve nada.

---

## O que falta

**Aplicar a migração `0016_contar_visita.sql` no Supabase da loja.**

Enquanto ela não for aplicada, a loja chama uma função que não existe, a
chamada falha em silêncio, e o bloco aparece dizendo que não há visita.
Nada quebra para quem compra: a contagem foi escrita para nunca derrubar a
página de quem está comprando.

Como aplicar: SQL Editor do projeto, colar o arquivo inteiro, rodar.

> A contagem só vale daí para frente. **O que passou não dá para
> recuperar**, e a tela diz isso em vez de mostrar zero como se fosse
> resposta.
