# Assinar o contrato, pelo gov.br

Escrito em 04/09/2026, quando a Vivian leu, aprovou e pediu para assinar.

Registro meu. Não vira PDF.

---

## Por que gov.br, e não papel nem plataforma paga

| | |
|---|---|
| Custo | **zero**, para os dois |
| Validade | Lei 14.063/2020, assinatura eletrônica **avançada** |
| O que ela precisa | conta gov.br **nível prata ou ouro**, que ela provavelmente já tem |
| Onde | `assinador.iti.br`, ou o app gov.br no celular |
| Conferir depois | `validar.iti.gov.br` |

Papel exigiria imprimir, assinar, digitalizar e devolver, duas vezes. As
plataformas pagas cobram por envelope e pedem cadastro dela numa empresa
que ela não conhece. O gov.br ela já usa para outras coisas.

**Ficou combinado no próprio contrato**, na cláusula 13.6, para não
depender de acordo verbal: as partes aceitam a assinatura eletrônica e
dispensam a via impressa.

---

## O que preencher antes de gerar o PDF

O `docs/contrato-modelo.md` é modelo e fica em branco de propósito: ele
está num repositório público. O preenchido vira `contrato-vivian.md`, na
raiz, **que não entra no Git**.

| Onde | O que falta | Já sabemos? |
|---|---|---|
| Qualificação do CONTRATADO | logradouro e número, em Nilópolis | você tem |
| Nome completo dela | **Vivian Velasco Quintella Fernandes** | **sim**, do RDAP do domínio |
| CPF dela | | **não**, e não está em lugar nenhum daqui |
| CNPJ dela, se houver | | **não**, e é a pergunta aberta desde 19/08 |
| Endereço dela | | **não** |
| Cláusula 3.1 | dia do vencimento e mês de início | decisão sua |
| Cláusula 4.1 | prazo do que falta | ver abaixo |
| Fecho | local e data | |

O nome completo veio do RDAP público do registro.br, porque o domínio está
no CPF dela: ela consta como `registrant`, e o Maycon como `technical`.

**O CPF não está no repositório, e não pode estar.** Ele é público, e o
que entra no Git fica no histórico para sempre. Pedir os três dados que
faltam numa mensagem só é mais rápido do que procurar.

### A cláusula 4.1 precisa de atenção

Ela diz "a loja será entregue em condições de operação em até **[___]**
dias contados da assinatura". **A loja está no ar desde 21/08 e cobrando
desde 01/09.** Assinar hoje prometendo entrega futura descreve uma
situação que não existe.

O preâmbulo já reconhece que os trabalhos começaram antes da assinatura.
O coerente é a 4.1 dizer o que ainda falta, e não repetir o que já está
pronto. Uma redação possível:

> 4.1. As partes reconhecem que a loja **já se encontra em operação** no
> endereço feitoparavocepapelaria.com.br, com catálogo, meio de pagamento,
> cálculo de frete e painel de administração em funcionamento. Permanecem
> pendentes os ajustes indicados no Anexo I, a serem concluídos em até
> **[___]** dias corridos, suspendendo-se a contagem enquanto pender
> entrega de material ou resposta da CONTRATANTE.

Isso protege os dois: ela não assina esperando algo que já recebeu, e
você não assume prazo sobre trabalho concluído.

---

## Gerar o PDF

```
node scripts/gerar-pdf.cjs contrato-vivian.md "Contrato - Vivian Quintella Fernandes"
```

Sai em `Documents/vivian-contrato/`, fora do repositório.

**Olhe o PDF antes de mandar.** O script tira foto de cada página, e é a
mesma regra das telas: bloco de assinatura rachado entre duas páginas, ou
uma cláusula sozinha na última folha, faz o documento parecer descuidado
justamente onde ele precisa parecer sério.

---

## A ordem de assinatura

1. **Você assina primeiro**, em `assinador.iti.br`.
2. Manda para ela **o PDF já assinado por você**.
3. **Ela assina o mesmo arquivo**, por cima. O assinador aceita adicionar
   a segunda assinatura sem invalidar a primeira.
4. Ela te devolve o arquivo com as duas.
5. Confira em `validar.iti.gov.br` que as duas aparecem.

Assinar primeiro não é formalidade: ela recebe um documento que já está
comprometido do seu lado, e não um pedido para ela se comprometer sozinha.

---

## A mensagem para ela

Ela disse ter medo de ser difícil. Então a mensagem é curta de propósito:
instrução longa já parece difícil antes de a pessoa começar.

Sem travessão, como todo texto que ela lê.

> oi vivian! o contrato está aqui, já assinei do meu lado.
>
> pra assinar é de graça, no site do governo mesmo, e leva uns dois minutos.
>
> no celular:
>
> 1. salva o pdf que eu mandei
> 2. abre o aplicativo gov.br
> 3. procura "assinatura digital"
> 4. escolhe o arquivo que você salvou
> 5. confirma
> 6. me manda o arquivo de volta aqui
>
> é a mesma senha que você usa pra ver imposto de renda e essas coisas.
>
> se preferir no computador, entra em assinador.iti.br, faz login com o seu
> cpf e escolhe o arquivo. é igual.
>
> se travar em qualquer passo me liga que eu faço junto com você.

### Por que essas três frases estão ali

**"no site do governo mesmo"** tira o medo de ser plataforma estranha
pedindo dado dela.

**"é a mesma senha que você usa pra ver imposto de renda"** é o que
transforma "vou ter que criar conta" em "já tenho conta". A maioria das
pessoas tem gov.br e não lembra.

**"me liga que eu faço junto"** porque quem tem medo de travar precisa
saber, antes de começar, que travar não é problema.

### O que ficou de fora, e por quê

Nível prata ou ouro, Lei 14.063, `validar.iti.gov.br` e a diferença entre
assinatura avançada e qualificada. Nada disso ajuda ela a assinar, e tudo
isso faz parecer complicado. Se ela travar no nível da conta, resolve no
telefone, com você junto.

### Sobre o CNPJ

A assinatura sai no **CPF**, e está certo: o gov.br é identidade de pessoa
e não existe login por CNPJ. Quem assina é a pessoa; o documento é que diz
em que condição, e a qualificação no topo já traz o CNPJ.

No caso do MEI isso é ainda mais direto, porque o CNPJ está amarrado ao
CPF e não há representante legal separado.

Assinatura que carrega o CNPJ dentro do certificado existe, é o e-CNPJ da
ICP-Brasil, e custa de R$ 200 a R$ 400 por ano. Para um contrato entre
duas pessoas, com a cláusula 13.6 aceitando a eletrônica, não acrescenta
nada.

---

## Se a conta dela não for prata ou ouro

É o único ponto onde ela pode travar. O nível sobe por dois caminhos, os
dois na hora:

| Como | Onde |
|---|---|
| Pelo banco | internet banking dos bancos conveniados, opção de validar conta gov.br |
| Por reconhecimento facial | aplicativo gov.br, com a CNH ou o título de eleitor |

Se nenhum dos dois funcionar, o caminho de sempre continua valendo:
imprimir, assinar à mão, fotografar e mandar de volta. A cláusula 13.6
aceita a eletrônica, não obriga.

---

## Sobre testemunhas

O contrato tem espaço para duas, marcado como opcional, e continua
opcional: a validade entre as partes não depende delas.

O que elas mudam é execução. Um contrato particular assinado por duas
testemunhas é título executivo extrajudicial pelo art. 784, III do CPC, o
que encurta a cobrança de uma parcela não paga. Sem elas, cobrar exige
ação de conhecimento antes.

Para R$ 2.400 em doze parcelas, é decisão de quanto atrito você quer
colocar numa assinatura que precisa ser fácil. Duas assinaturas
eletrônicas a mais, de gente que também precisa de conta gov.br, não é
mais "dois minutos".

**Eu deixaria sem.** Mas fica registrado que a escolha existe e o que ela
custa.
