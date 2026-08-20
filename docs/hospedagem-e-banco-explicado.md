# Hospedagem e banco de dados, sem jargão

Escrito porque a diferença entre as duas coisas não é óbvia para quem não
trabalha com isso, e ela decide metade do custo mensal da loja.

Serve para explicar à Vivian, e serve para eu não me confundir de novo:
foi justamente por embaralhar as duas que eu disse "hospedagem R$ 0 para
sempre" e tive que voltar atrás.

---

## As duas coisas, em uma frase cada

**Hospedagem** é onde ficam as páginas. Como um cardápio impresso: você
imprime uma vez, todo mundo que entra lê o mesmo papel, ninguém escreve
nada nele.

**Banco de dados** é onde ficam as anotações. Como a comanda: cada cliente
gera uma anotação nova, diferente da anterior, que precisa ser consultada
depois.

Você não anota comanda no cardápio. É por isso que são serviços separados.

---

## Quem faz o quê numa venda

Uma cliente compra 10 canecas:

| Passo | Quem resolve |
|---|---|
| Ela vê a caneca na vitrine | hospedagem, a página já estava pronta |
| Clica e lê a descrição | hospedagem |
| Põe no carrinho | o navegador dela, sem servidor nenhum |
| Preenche o endereço e paga | Mercado Pago |
| **O pedido é gravado** | **banco de dados** |
| A Vivian abre o painel e vê | **banco de dados** |
| Ela marca como enviado | **banco de dados** |

Sem hospedagem, ninguém vê a loja. **Sem banco, ninguém consegue comprar**
e o pedido não teria onde ficar.

---

## O que fica em cada um

**Hospedagem** guarda o que é igual para todo mundo:

- a vitrine e as páginas de produto
- as fotos
- os textos e os preços publicados

**Banco** guarda o que muda a cada pessoa:

- os pedidos
- os endereços de entrega
- a senha da Vivian
- o estoque
- o cadastro de quem já comprou

**E o material pedagógico não fica em nenhum dos dois:** continua no Drive
dela. A loja só concede e revoga o acesso.

---

## Por que a hospedagem não custa

Entregar página pronta é barato para quem hospeda, é mandar um arquivo, o
mesmo arquivo, para todo mundo. O GitHub Pages dá 100 GB de tráfego por
mês sem cobrar.

Cada visita à loja consome cerca de 574 KB. Isso dá:

> 100 GB ÷ 574 KB ≈ **180 mil visitas por mês**

Ela está duas ou três ordens de grandeza abaixo disso. Não é "de graça por
enquanto": é de graça na escala dela, com folga que não acaba.

## Por que o banco pode custar um dia

Porque ele **trabalha** a cada acesso (procura, grava, atualiza) e
precisa estar ligado o tempo todo, esperando.

O plano gratuito do Supabase dá 500 MB. Um pedido ocupa mais ou menos o
tamanho de uma mensagem de texto, então cabem mais de 100 mil pedidos. A
50 por mês, isso passa de um século.

**Na prática ela não vai pagar isso.** Está na conta porque, se um dia
acontecer, ela precisa já saber que existe, não porque seja provável.

---

## A tabela que resume

| | Hoje | Se a loja crescer muito |
|---|---|---|
| Hospedagem (páginas) | R$ 0 | **R$ 0**, não muda |
| Banco (pedidos) | R$ 0 | cerca de R$ 130/mês |
| Material pedagógico | R$ 0 | R$ 0, fica no Drive dela |

---

## Onde eu errei, para não repetir

Duas vezes:

**Primeira:** tratei o GitHub Pages como solução completa. Ele hospeda as
páginas, e eu concluí que a loja inteira custaria zero para sempre. Faltou
o banco, e loja que vende precisa de um.

**Segunda:** ao corrigir, projetei que os PDFs do material pedagógico
ficariam guardados na loja, e calculei armazenamento e tráfego de download
em cima disso. Só que ela entrega acesso ao Drive, não arquivo. Aquele
custo nunca vai existir.

As duas vezes o erro foi o mesmo: **assumir como a coisa funciona em vez de
perguntar.** A segunda só apareceu porque ela explicou por áudio, sem eu
ter perguntado direito.
