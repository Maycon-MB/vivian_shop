# A planilha do catálogo

Como a Vivian vai cadastrar os produtos dela sem depender de mim.

Virou o único caminho: o Elo7 fechou em maio e não há nada para extrair de
lá. Os 343 produtos e os 86 temas existem só com ela.

---

## Por que planilha, e não uma tela de cadastro

Uma tela de cadastro no painel precisa de banco, e o banco só entra depois
do Mercado Pago. A planilha funciona **hoje**, custa R$ 0, e ela edita do
celular.

Tem outras três vantagens que a tela não teria:

- **Corrigir preço em massa** é arrastar uma coluna, não abrir 40 telas
- **Colar de outro lugar** funciona: se ela achar alguma exportação antiga
- **Ver os 343 de uma vez**, coisa que nenhum painel faz bem

Quando o banco existir, a planilha vira uma importação única e o cadastro
passa para o painel. Nada do que ela escrever se perde.

---

## Como fica organizada

Três abas.

### Aba 1: `Comece por aqui`

Instruções em português, sem jargão, com um exemplo preenchido. É a
primeira coisa que ela vê ao abrir.

### Aba 2: `Temas`

| Coluna | O que vai | Exemplo |
|---|---|---|
| Nome do tema | como ela chama | Mickey |
| Descrição | uma frase para a página do tema | A turma do Mickey para festa e lembrancinha |

Uma linha por tema. São 86, mas ela pode mandar aos poucos, cada envio
publica o que já existe.

### Aba 3: `Produtos`

| Coluna | O que vai | Obrigatório? |
|---|---|---|
| Nome | como aparece na loja | **sim** |
| Linha | Personalizada ou Pedagógica | **sim**, lista suspensa |
| Tema | ela digita; o sistema reconhece | **sim** |
| Tipo | Caneca, Revista, Álbum, Jogo… | não |
| Preço | o preço normal | **sim** |
| Preço promocional | se estiver em oferta | não |
| Descrição | o texto que ela já usava | **sim** |
| Detalhes | medidas e material, um por linha | não |
| Peso do pacote de 10 | em gramas | só para personalizado |
| Medidas da caixa | altura × largura × comprimento, em cm | só para personalizado |
| Pasta no Drive | link da pasta da atividade | só para digital |

### O tema não é lista suspensa. É reconhecimento.

Lista suspensa fixa resolveria a duplicação e criaria três problemas
piores: ela teria que **cadastrar o tema antes** de usar no produto, 86
itens numa lista no celular é péssimo de usar, e colar de outro lugar
quebraria a validação.

Então ela digita o que quiser, e o sistema reconhece. Em três camadas:

**1. O que é obviamente o mesmo, junta calado.**

`mickey` · `MICKEY` · `  Mickey  ` · `Mickey!` · `Mickeý`

Tudo isso vira o tema **Mickey** que já existe. Sem aviso, sem pergunta: não há dúvida nenhuma aqui.

**2. O que é quase igual, pergunta antes de decidir.**

Se ela escrever `Primeira Eucarista` e já existir `Primeira Eucaristia`, o
sistema **não corrige sozinho**. Avisa:

> *Você escreveu "Primeira Eucarista", e já existe o tema "Primeira
> Eucaristia". É o mesmo? Se for, corrija para o nome que já existe. Se
> forem temas diferentes mesmo, pode deixar como está.*

E a publicação **acontece assim mesmo**. Segurar a loja inteira por uma
letra seria pior do que publicar com dois temas parecidos.

**3. O que é diferente, cria sozinho.**

Tema novo nasce do próprio produto. Ela não precisa cadastrar antes.

### As três coisas que impedem o sistema de ser burro

**Nome curto não se junta.** `Bela` e `Belo` diferem em uma letra, mas
provavelmente são temas diferentes: "A Bela e a Fera" e outra coisa
qualquer. Juntar apagaria um tema inteiro da loja, e ela poderia nem
perceber. Quanto mais curto o nome, menos tolerância.

**Número não é erro de digitação.** `Turma 1` e `Turma 2` diferem em um
caractere, mas ninguém digita 2 querendo 1. Sem essa regra, uma planilha
com temas numerados viraria uma parede de avisos, e ela pararia de ler
todos, inclusive os que importam.

**Avisa uma vez, não quarenta.** Se o mesmo tema errado aparece em 40
produtos, o aviso sai uma vez. Repetido 40 vezes vira ruído, e ruído se
ignora.

### A regra que atravessa tudo

**Nunca juntar dois temas por conta própria quando há dúvida.**

Juntar errado é silencioso: um tema some da loja e ninguém percebe.
Perguntar custa uma linha de aviso. Entre os dois erros, o segundo é
sempre preferível.

---

## Como o que ela escreve chega na loja

1. Ela preenche a planilha, quando der, no ritmo dela
2. Aperta um botão dentro da própria planilha: **"Publicar na loja"**
3. O sistema confere se está tudo certo
4. Se estiver, a loja se atualiza sozinha em poucos minutos

### O botão, e não uma atualização automática

O botão existe de propósito. Sem ele, a loja publicaria a planilha no meio
de uma edição (produto sem preço, tema pela metade), e quem estivesse
comprando naquele instante veria a bagunça.

Com o botão, ela decide quando o que escreveu está pronto para o público.

### Quando alguma coisa estiver errada

O sistema não publica pela metade. Ele avisa, na própria planilha, em
português:

> *"A linha 34 está sem preço."*
> *"O tema 'Mikey' não existe na aba Temas. Você quis dizer 'Mickey'?"*
> *"O produto 'Caneca' aparece duas vezes."*

Nada vai ao ar até ela corrigir. É melhor a loja não atualizar do que
atualizar errado.

---

## O que isso muda para ela

Hoje, para trocar um preço, ela me manda mensagem e espera. Depois disso,
ela troca e publica, em dois minutos, no domingo à noite, sem mim.

**É a diferença entre ter um site e ter uma loja.**

---

## O que já está escrito

A leitura da planilha existe e tem teste:
[planilha.ts](../loja/src/dominio/planilha.ts), com 31 testes. Ela não
depende de banco, de conta contratada nem da planilha existir ainda.

### O que ela entende sem reclamar

Porque é o que uma pessoa digita de verdade, no celular, ao longo de
semanas:

| Ela escreve | Vira |
|---|---|
| `R$ 39,99`, `39,99`, `39.99`, `1.299,90` | 39.99 e 1299.90 |
| coluna fora de ordem, colada de outro lugar | achada pelo nome |
| `Preço`, `preco`, ` PREÇO ` | a mesma coluna |
| `Personalizada`, `Pedagógica` | as duas linhas de venda |
| `30 x 25 x 12` | altura, largura e comprimento |
| linha em branco no meio | ignorada, não é produto |
| `mickey`, `MICKEY`, `Mickey!` | o tema **Mickey** |

### O que faz a publicação parar

Sempre com o número da linha, para ela achar na tela:

- produto sem nome, ou sem preço
- preço promocional maior ou igual ao cheio
- o mesmo produto duas vezes, que senão um sobrescreveria o outro calado
- personalizado sem peso ou sem medida, que faz o frete sair errado
- digital sem a pasta do Drive, que não teria o que entregar

**Nada vai ao ar enquanto houver um erro.** Melhor a loja não atualizar do
que atualizar errado.

Uma decisão que vale registrar: célula vazia devolve "nada", e nunca zero.
Preço vazio é erro; preço zero seria produto de graça. Confundir os dois
publicaria a loja inteira valendo R$ 0,00.

---

## O que falta para eu montar

Só uma resposta, que está no formulário: **como as pastas do Drive estão
organizadas**, uma por atividade, ou tudo junto. É o que define a coluna
do material digital.

O resto eu monto sem depender de nada: a planilha, as listas suspensas, as
instruções e o botão de publicar.
