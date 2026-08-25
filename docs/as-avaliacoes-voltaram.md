# As avaliações voltaram

As 13 avaliações que as clientes dela escreveram foram tiradas da Elojinha
em 25/08/2026 e estão na loja.

Registro meu. Não vira PDF.

---

## Por que isto vale mais do que parece

Quem chega numa loja que não conhece está fazendo duas perguntas: o
produto chega, e chega bom. Nada que eu escreva responde isso. Quem
responde é quem já comprou.

Era a única peça da página inicial que continuava vazia. No lugar do
depoimento havia um cartão dizendo "aqui entra um depoimento de verdade de
uma cliente sua", e ele ficou ali quatro meses de propósito: inventar a
fala de uma mãe para vender material infantil destrói exatamente a
confiança que a loja precisa construir.

---

## São 13, e não 26

As avaliações que eu havia transcrito dos prints do Elo7 e as que vieram
da Elojinha **são as mesmas**. Mesmos produtos, mesmos temas, mesmas
clientes, na mesma ordem; as datas diferem em um dia porque uma plataforma
mostra a data do pedido e a outra a da avaliação.

Elas migraram junto com o catálogo, como tudo o mais. É bom saber para não
contar duas vezes: ela tem treze provas sociais, de março de 2025 a
fevereiro de 2026.

---

## O que a loja mostra, e o que não mostra

**Não há estrela em lugar nenhum.** O marketplace guardava "Positiva" ou
"Negativa", e não nota. Cinco estrelinhas onde o dado não existe seria
número inventado justamente na parte da página que existe para provar que
ela cumpre o que promete.

A primeira versão do código lia esse campo como número, e `Number('Positiva')`
não é número: o resultado caía num valor padrão de 5. Funcionava, porque
as treze são positivas. Mas no dia em que aparecesse uma reclamação, a
loja publicaria cinco estrelas em cima dela. O teste que pegou isso está
em [avaliacoes.test.ts](../loja/src/dominio/avaliacoes.test.ts): "não
transforma uma avaliação negativa em elogio".

**Só o primeiro nome.** Quem escreveu avaliou uma loja em outra
plataforma, e não autorizou aparecer nesta. O nome completo não saiu de
lá, e o código corta o sobrenome de novo caso um dia venha junto.

**Nada é corrigido.** "Adorai" tem erro de digitação e continua assim.
Corrigir o depoimento de alguém é reescrever o que a pessoa disse.

---

## O que foi limpo, e por que isso não é corrigir

Duas coisas na tela vinham da nossa extração, e não das clientes:

**O emoji virou "??".** "muito capricho 🥰" saiu do marketplace como
"muito capricho ??". Deixar assim publica um defeito nosso como se fosse
coisa dela. A regra tira duas ou mais interrogações seguidas, em qualquer
lugar da frase; uma sozinha fica, porque "dá para encomendar de novo?" é
pergunta de verdade.

**Dois nomes vieram em maiúscula**, do jeito que as clientes preencheram o
formulário. "MICHELLE" numa página de depoimento lê como grito, e não é o
que ela quis dizer.

---

## O que ficou por conferir

**A avaliação da Claudia perdeu uma quebra de linha na extração** e está
na loja como "EU AMEIIIII SAO LINDOSOBRIGADA". O original provavelmente
tinha "SÃO LINDOS" e "OBRIGADA" em linhas separadas, mas isso é suposição
minha e eu não invento o que a cliente escreveu.

Está publicada assim. **Vale conferir com a Vivian contra o print
original** e corrigir a linha em
[avaliacoes.json](../loja/src/dados/avaliacoes.json), que é um arquivo, e
não banco.

---

## Onde o dado mora

No repositório, e não no banco:

```
Elojinha  →  antigravity  →  avaliacoes-elojinha.csv  (fora do repositório)
CSV  →  scripts/importar-avaliacoes.mjs  →  loja/src/dados/avaliacoes.json
```

São treze linhas que não mudam, e a página é gerada no build. Pôr isso no
banco seria uma consulta a mais no caminho de quem chega, para ler um dado
que é o mesmo desde fevereiro.

O CSV original fica em `Documents/vivian-elojinha`, fora do repositório,
porque tem os nomes como as clientes os escreveram.
