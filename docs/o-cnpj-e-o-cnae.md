# O CNPJ, o CNAE e o que isso custa

Levantado em 19/08/2026, a partir de fontes públicas. **Não sou contador**
e isto não substitui um. Serve para você chegar na conversa com um sabendo
o que perguntar, e para você não descobrir o problema numa fiscalização.

---

## A situação

Seu MEI está registrado em **9511-8/00, Reparação e manutenção de
computadores e de equipamentos periféricos**. É a única atividade, sem
CNAE secundário.

Isso é **conserto de máquina**. Não cobre desenvolvimento de site, de
sistema, nem manutenção de software.

## O problema

**Programador não pode ser MEI.** Não é questão de escolher o CNAE certo:
não existe CNAE de desenvolvimento que o MEI aceite.

Os CNAEs de TI (6201, 6202, 6203, 6204 e 6209) **são todos proibidos ao
MEI**, porque a lei trata desenvolvimento como atividade intelectual, e o
MEI não abrange atividade intelectual.

O que o MEI aceita em tecnologia é só:

| CNAE | O que é |
|---|---|
| 9511-8/00 | reparação de computadores, **o seu** |
| 6190-6/99 | outras atividades de telecomunicação |
| 4751-2/01 | comércio de equipamentos de informática |
| 8599-6/03 | instrução e treinamento |

Nenhum deles cobre "desenvolvi uma loja virtual".

> Existe um projeto de lei (o PLP 25/2026) propondo incluir atividades
> de tecnologia no MEI. **Não foi aprovado.** Não dá para contar com ele.

## O risco concreto

Não é multa imediata. É desenquadramento: a Receita pode entender que a
atividade exercida não é a declarada, tirar você do MEI **com efeito
retroativo**, e recalcular os tributos como empresa normal no período,
com juros e multa.

O gatilho costuma ser a nota fiscal: descrição de serviço que não bate com
o CNAE, repetida ao longo do tempo.

---

## A alternativa formal, e o que ela custa

O caminho correto é **SLU enquadrada como ME no Simples Nacional**, com
CNAE 6201-5/00 (desenvolvimento de programas sob encomenda).

O custo tem duas partes:

### 1. O imposto

| Situação | Alíquota inicial |
|---|---|
| **Anexo V** (padrão para desenvolvimento) | **15,5%** do faturamento |
| **Anexo III** (se o Fator R ≥ 28%) | **6%** do faturamento |

O **Fator R** é a razão entre a folha de pagamento (incluindo o seu
pró-labore) e o faturamento dos últimos 12 meses. Se você se paga o
suficiente, cai no Anexo III e paga menos que a metade.

Na prática, para quem trabalha sozinho, manter o Fator R acima de 28% é
questão de organizar o pró-labore. Isso é exatamente o tipo de coisa que
um contador resolve e que dá errado sem um.

### 2. O contador

Deixa de ser opcional: ME no Simples exige contabilidade.

| Faixa de preço em 2026 | |
|---|---|
| Contabilidade online | a partir de R$ 150/mês |
| Escritório tradicional | R$ 250 a R$ 600/mês |
| Média para faturamento até R$ 20 mil/mês | cerca de R$ 489/mês |

---

## A conta que importa

Com o faturamento de hoje:

| | MEI (hoje) | ME no Simples |
|---|---|---|
| Imposto sobre R$ 2.000/mês | DAS fixo, cerca de R$ 80 | 6% = R$ 120 (Anexo III) |
| Contador | não precisa | R$ 150 a R$ 489 |
| **Total mensal** | **~R$ 80** | **R$ 270 a R$ 609** |

**O contrato da Vivian inteiro é R$ 200 por mês.** Migrar para ME hoje
custaria mais do que ela paga, o enquadramento correto consumiria o
cliente inteiro e ainda sobraria conta.

Essa é a tensão real, e não adianta fingir que não existe.

## O ponto em que a conta vira

O ME passa a fazer sentido quando o custo fixo dele deixa de pesar:

| Faturamento mensal | ME (6% + contador de R$ 200) | Peso |
|---|---|---|
| R$ 2.000 | R$ 320 | 16% |
| R$ 5.000 | R$ 500 | 10% |
| R$ 10.000 | R$ 800 | 8% |

Perto de **R$ 5.000 por mês** o percentual começa a ficar aceitável.

---

## O que eu faria, sem ser contador

1. **Conversar com um contador antes de emitir a próxima nota.** Muitos
   fazem a primeira consulta sem cobrar, e contabilidade online costuma
   ser bem mais barata que escritório.

2. **Levar a pergunta certa**, que não é "posso continuar assim?" e sim:

   > *"Meu MEI está em 9511-8/00. Presto serviço de desenvolvimento e
   > manutenção de site. Qual o risco de desenquadramento, e a partir de
   > que faturamento compensa migrar para ME no Simples com Fator R?"*

3. **Perguntar sobre o que já foi emitido.** Se você já emitiu notas de
   desenvolvimento pelo MEI, isso precisa ser avaliado, inclusive o do
   outro projeto.

4. **Não parar de trabalhar por causa disso.** O risco é real, mas é de
   regularização, não de crime. O que não pode é ficar mais um ano sem
   olhar.

## A terceira porta, levantada em 25/08

A conversa até aqui tratava disto como escolha entre dois: continuar MEI
errado, ou migrar para ME. Existe uma terceira, e no faturamento de hoje
ela é provavelmente a certa.

**Pessoa física, com recibo e carnê-leão.** Sem CNPJ, sem contador, sem
DAS. Emite recibo, paga IRPF pela tabela progressiva.

E vale desfazer uma confusão que apareceu na conversa: **MEI e PJ não são
a mesma coisa.** Quando um programador diz "trabalho como PJ", ele quase
sempre é **ME no Simples Nacional**, com CNAE 6201. Não é MEI. MEI é o
degrau mais baixo, e é o único que não aceita desenvolvimento.

### Por que ME funciona para eles e não para você hoje

ME tem custo fixo que o MEI não tem: contador obrigatório, uns R$ 200 a
R$ 300 por mês, mais o imposto sobre faturamento.

| Faturamento | Custo fixo do ME | Peso |
|---|---|---|
| R$ 10.000/mês | ~R$ 430 | 4,3% |
| R$ 3.000/mês | ~R$ 430 | **14%** |

O Maycon confirmou em 25/08 que fatura **menos da metade de R$ 10 mil**.
Nesse volume, o custo fixo do ME come o contrato da Vivian inteiro.

### O que decide não é o imposto, é o INSS

Essa é a parte que quase não se menciona.

Como **PF autônomo**, o INSS é 20% sobre o que declara, ou 11% no plano
simplificado, que corta a aposentadoria por tempo de contribuição.

Como **ME**, o INSS incide só sobre o pró-labore. Com o pró-labore em 28%
do faturamento, que é o que ativa o Fator R, o INSS efetivo fica em torno
de 3% do faturamento.

Então a comparação real é: PF não tem custo fixo mas tem INSS pesado; ME
tem custo fixo alto mas INSS leve. **Existe um ponto de virada, e só um
contador com os números dele acha.**

### As três perguntas para levar ao contador

Levar como três opções para ele escolher, e não como pergunta aberta:

1. No meu volume, PF com carnê-leão ou ME com Fator R?
2. A partir de que faturamento o ME passa a valer?
3. Qual o risco do que já foi faturado no CNAE 9511-8?

Em 03/09 entrou uma quarta, e é a mais urgente das quatro porque tem data:

4. **A primeira parcela da Vivian vence agora. Recebo pelo MEI ou como
   PF?** Ver [a chave Pix sai da decisão](#a-chave-pix-sai-da-decisão-e-não-o-contrário).

### O que não é problema de enquadramento

R$ 200 por mês por cliente não paga a estrutura que o trabalho exige. O
contrato da Vivian está fechado e vale honrar; a observação é sobre o
próximo. Uma loja com catálogo, pagamento, chat, painel e e-mail é
trabalho de vários milhares de reais.

Nenhum enquadramento conserta preço.

---

## O que isso muda no contrato da Vivian

Nada no valor. Mas a cláusula 3.2 diz "mediante recibo ou nota fiscal", e
qual dos dois é obrigatório depende de uma resposta dela que ainda não
veio: **se ela tem CNPJ.**

- Se ela for **pessoa física**: recibo basta, a menos que ela peça nota
- Se ela tiver **MEI ou empresa**: a nota é obrigatória, e aí o CNAE volta
  a importar

### Como perguntar isso a ela, sem parecer burocracia

Vai junto com qualquer mensagem, e a resposta resolve:

> me manda como você quer no recibo.
> se você tem cnpj, manda o cnpj e a razão social.
> se não tem, é só o cpf.

---

## A chave Pix sai da decisão, e não o contrário

Levantado em 03/09, de uma dúvida que apareceu na hora de cobrar a
primeira parcela: *"mando a chave Pix do meu CNPJ?"*

A ordem natural parece ser mandar a chave e resolver o resto depois. É ao
contrário: **dinheiro que cai na conta do CNPJ é faturamento do CNPJ**, e o
registro nasce no instante da transferência, com ou sem ela pedir nota.

| Como você declarar | Que chave mandar |
|---|---|
| Pelo MEI | a do CNPJ, e aí o CNAE 9511-8 volta para a mesa |
| Como PF, com recibo e carnê-leão | a do CPF, e o CNAE sai da história |

Então a decisão de enquadramento vem **antes** da primeira cobrança, e não
depois de doze.

## Sobre "isso conta para o meu score PJ?"

Vale desfazer, porque a resposta é não do jeito que se imagina.

| O que parece | O que é |
|---|---|
| Pix recebido aumenta o score | **Não.** Score PJ, na Serasa e na Boa Vista, olha dívida, protesto e conta paga em dia. Receita não entra |
| Faturar constrói crédito | Em parte, e em outro lugar: constrói **movimentação e faturamento comprovado**, que o próprio banco usa na análise interna dele, para limite, capital de giro e taxa de maquininha |
| Basta receber pelo CNPJ | O que formaliza faturamento de MEI é a **DASN-SIMEI** anual. O Pix sozinho é extrato, não é declaração |

E o ponto que fecha o raciocínio: **não existe faturamento que conte para o
banco e não conte para a Receita.** É o mesmo CNPJ, o mesmo extrato e a
mesma declaração. Querer que o dinheiro construa histórico é querer que
ele seja visível, e visível vale para os dois lados.

> Atenção ao teto do MEI, R$ 81 mil por ano. R$ 200 mensais não chegam
> perto, mas o teto é do CNPJ e não do contrato: se outros recebimentos
> passam por ali, somam. Esse número já esteve em discussão para aumentar,
> então confirme o vigente.
