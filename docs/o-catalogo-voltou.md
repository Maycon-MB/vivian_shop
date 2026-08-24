# O catálogo voltou

Em 23/08/2026 a Vivian mencionou, de passagem, que tinha migrado a loja
para outra plataforma quando o Elo7 fechou:

> "quando o elo 7 acabou eu consegui transferir tudo da loja de papelaria
> personalizada para a plataforma ELOJINHA, vou te passar o login e senha
> e vc entra, acho que vai conseguir pegar todos os produtos"

Os 343 produtos que este projeto tratava como perdidos desde 19/08 estavam
inteiros, com descrição, preço, foto, peso e medidas.

Registro meu. Não vira PDF.

---

## A lição, antes dos detalhes

Eu passei quatro dias construindo em cima de "o catálogo não existe mais".
Escrevi um documento explicando que ele estava perdido, desenhei uma
planilha inteira para ela redigitar tudo, e escrevi preços que eram meus
para os produtos dela.

Nada disso era necessário. Bastava ter perguntado **"o que você fez com a
loja quando o Elo7 fechou?"** — e a resposta veio sozinha, numa conversa
sobre outro assunto.

O que eu confirmei sozinho foi que o Elo7 fechou. O que eu **supus** foi o
que isso significava para ela. Investigar bem a primeira metade não
compensa não perguntar a segunda.

---

## O que veio

| | |
|---|---|
| Produtos | **343** |
| Tipos diferentes | 104 |
| Temas | 140 |
| Com peso e medidas | 343 |
| Fotos | 2.055 arquivos, 105 MB |
| Faixa de preço | R$ 5,00 a R$ 28,00 |

A extração levou algumas horas e passou por três barreiras: a listagem
pública corta em 60 produtos, o painel usa identificadores internos em vez
dos nomes, e a lista de edição apaga da memória o que sai da tela. O
caminho que funcionou foi entrar no painel logado e percorrer produto a
produto.

---

## O que só existia no painel

O peso e as medidas. Nenhuma loja mostra isso em página pública, e sem
eles não há frete correto.

E veio com uma informação que muda a conta: o campo se chama **"Peso do
lote"**, e o dado traz `shipping_dimensions_per_unit: false`. São as
medidas do **pacote fechado**, não de uma peça. É como ela despacha, de
dez em dez. Se eu tivesse assumido peso unitário, o frete sairia errado em
todo pedido, e a diferença sairia do bolso dela.

Também de lá vieram dois números que eu tratava como suposição:
`min_quantity` e `production_time_days`. O mínimo de dez e o prazo de
cinco dias são dela, e agora estão provados — com uma correção: **12 dos
343 produtos têm mínimo 1**, e não 10. Fixar dez apagaria uma decisão dela
em cada um deles.

---

## Como o dado chegou até a loja

```
páginas salvas do painel  →  reconstruir-catalogo.mjs  →  CSV
CSV  →  importar-para-o-banco.mjs  →  Supabase
fotos locais  →  subir-fotos.mjs   →  balde, em dois tamanhos
banco  →  baixar-catalogo.mjs      →  build da loja
```

Cada etapa lê arquivo salvo em disco, e nenhuma depende de a loja de
origem continuar existindo. Foi de propósito: **o Elo7 fechou e levou
tudo junto**, e guardar endereço de CDN de uma plataforma que pode fechar
amanhã seria repetir o mesmo erro com outro nome.

Isso já se provou útil no meio do caminho: quando a extração truncou o CSV
ao recomeçar, o HTML salvo permitiu reconstruir tudo sem raspar a loja de
novo.

---

## Três erros de leitura, corrigidos relendo o arquivo

**O nome do produto vinha como "Feito para Você!"** nas 343 linhas. A
busca achava o nome da loja antes do nome do produto, dentro do mesmo
bloco de dado.

**A descrição chegava com `\n` e `>` escritos por extenso**, no meio
da frase, para a cliente ler. O texto vem escapado duas vezes: uma pelo
JSON do produto, outra pelo payload que o embrulha.

**Dois temas viravam o mesmo endereço.** "P.e.p.p.a P.i.g" e "Peppa Pig"
são o mesmo tema depois de tirar os pontos, e mandar os dois na mesma leva
fazia o banco recusar a importação inteira.

O terceiro tem uma origem que vale registrar: ela escrevia os nomes de
personagem com pontos entre as letras para escapar do filtro de marca do
marketplace. Na loja dela isso não é mais necessário, e atrapalha quem
procura — ninguém digita "P.e.p.p.a". A importação desfaz.

---

## O que a Elojinha não tinha

**O material pedagógico.** Os 37 produtos do Projeto Educar ficaram lá e
nunca migraram. Por isso a loja hoje só tem a linha personalizada, e o
filtro da linha pedagógica não aparece: botão que só mostra tela vazia faz
quem clica concluir que a loja está quebrada.

Recuperar esses 37 é o mesmo problema de novo, e provavelmente com a mesma
solução: perguntar a ela o que existe hoje, antes de supor que se perdeu.

---

## Sobre a senha que ela mandou

Ela enviou login e senha da Elojinha por WhatsApp, sem que eu pedisse.

Funcionou para o que precisávamos, e a extração foi só de leitura. Mas a
senha ficou no aparelho dela, no meu, e no backup dos dois. **Ela precisa
trocar**, e vale explicar por quê: a mesma senha costuma estar em outros
lugares.

Isso entra como uma conversa a ter, não como culpa dela. Quem manda senha
por mensagem faz isso porque quer resolver, e o trabalho de explicar o
risco é de quem sabe.
