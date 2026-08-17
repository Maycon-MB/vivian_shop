# O financeiro do projeto

O que entra e o que sai, dos dois lados, com os números que existem hoje.

**O que é estimativa está marcado.** As taxas de meio de pagamento e o
valor do imposto mudam, e o que o Elo7 cobrava dela ninguém aqui sabe
ainda — é uma das perguntas em aberto.

---

## Do lado do Maycon

### O que entra

| Quando | Valor | Total no período |
|---|---|---|
| Meses 1 a 12 | R$ 200/mês | **R$ 2.400** |
| Mês 13 em diante | R$ 100/mês | **R$ 1.200/ano** |

### O que sai

| Item | Custo | Observação |
|---|---|---|
| Hospedagem | **R$ 0** | GitHub Pages, sem limite prático para o volume dela |
| Publicação automática | **R$ 0** | GitHub Actions, dentro da cota gratuita |
| Recebimento das respostas dela | **R$ 0** | Google Apps Script |
| Domínio | **R$ 0** | pago por ela, no nome dela |
| Meio de pagamento | **R$ 0** | conta dela, taxa descontada das vendas dela |
| **Total mensal** | **R$ 0** | |

O DAS do MEI não entra nesta conta porque já é pago de qualquer forma,
independentemente deste contrato. O custo marginal deste projeto é zero.

### O que isso significa por hora

Até 17/08/2026: **67 commits em 7 dias de trabalho**, resultando em cerca
de 24.700 linhas entre código, testes e documentação.

Se o desenvolvimento tiver custado 60 horas, os R$ 2.400 dão **R$ 40 por
hora**. Se tiver custado 100, dão R$ 24.

Isso está **abaixo do mercado** para desenvolvimento de e-commerce sob
medida com testes automatizados, acessibilidade auditada e publicação
contínua. Não é crítica ao acordo — é o número, para ficar registrado.

Onde a conta melhora: a manutenção. R$ 100 por mês para um site estático
que se publica sozinho, com testes que rodam a cada envio, tende a custar
**pouca ou nenhuma hora em muitos meses**. O trabalho pesado é agora.

### O risco financeiro real

Não é o preço. É o **escopo aberto**: "manutenção" sem limite escrito vira
funcionalidade nova toda semana pelos mesmos R$ 100.

O contrato trata disso na cláusula 2.5 — funcionalidade nova, mudança de
escopo e redesenho ficam fora da manutenção e são orçados à parte. **Essa
cláusula é o que faz a diferença entre R$ 100/mês e trabalho de graça.**

---

## Do lado da Vivian

### O que ela paga fixo

| Quando | Para quem | Valor |
|---|---|---|
| Meses 1 a 12 | Maycon | R$ 200/mês |
| Mês 13 em diante | Maycon | R$ 100/mês |
| Uma vez por ano | registro.br | cerca de R$ 40 |

No primeiro ano: **R$ 2.440**. A partir do segundo: **R$ 1.240 por ano**,
ou cerca de R$ 103 por mês.

### O que ela paga por venda

*(estimativas — as taxas variam por meio de pagamento, prazo de
recebimento e negociação)*

| Meio | Taxa aproximada | Em R$ 100 de venda |
|---|---|---|
| Pix | cerca de 1% | cerca de R$ 1 |
| Cartão à vista | cerca de 5% | cerca de R$ 5 |
| Cartão parcelado | mais que isso, cresce com o número de parcelas | — |

O frete não é custo dela: é cobrado do comprador e repassado à
transportadora. Por isso ele **nunca entra no faturamento** dos relatórios
— somar frete ao que ela ganhou é o jeito mais comum de fechar o mês
achando que lucrou.

O desconto de 5% no Pix sai da margem dela, e existe para empurrar a
venda para o meio mais barato de receber. Em R$ 100: ela abre mão de R$ 5
para economizar cerca de R$ 4 de taxa. **Empata quase.** O ganho real é
receber na hora, sem esperar 30 dias do cartão.

### Comparando com o Elo7

Aqui está a única conta que interessa a ela, e ela depende de um número
que ainda não temos: **quanto o Elo7 cobrava por venda**.

Com uma comissão hipotética de 12%:

| Faturamento no mês | Comissão do Elo7 | Custo aqui | Diferença |
|---|---|---|---|
| R$ 500 | R$ 60 | R$ 103 | **−R$ 43** (aqui sai mais caro) |
| R$ 860 | R$ 103 | R$ 103 | empata |
| R$ 2.000 | R$ 240 | R$ 103 | +R$ 137 |
| R$ 5.000 | R$ 600 | R$ 103 | +R$ 497 |
| R$ 10.000 | R$ 1.200 | R$ 103 | **+R$ 1.097** |

*Valores do segundo ano em diante, com a mensalidade de R$ 100 e o domínio
diluído. As taxas do meio de pagamento existem nos dois cenários e por
isso não entram na comparação.*

**O ponto de virada fica perto de R$ 860 por mês.** Abaixo disso, a
comissão do Elo7 é mais barata que a mensalidade fixa. Acima, a diferença
cresce e não para de crescer — porque a mensalidade é fixa e a comissão
não.

A tela de relatórios da loja mostra essa conta com os números reais dela,
e diz na cara quando o mês foi fraco demais para compensar o fixo.

### O que ela ganha e não aparece na conta

- A loja é dela: catálogo, clientes, textos, endereço
- Nenhuma plataforma pode mudar as regras, aumentar comissão ou tirar a
  loja do ar
- Os dados de quem compra ficam com ela, e servem para vender de novo
- A vitrine não mostra concorrente ao lado do produto dela

Nada disso vira número numa planilha, mas é a razão de estar saindo do
Elo7.

---

## O que muda essa conta

| Se acontecer | Efeito |
|---|---|
| Ela vender muito acima do previsto | a hospedagem continua R$ 0 até um volume bem maior que o dela |
| Precisar de banco de dados | Supabase tem plano gratuito; acima dele, cerca de US$ 25/mês, e a decisão passa a ser dela |
| Ela pedir funcionalidade nova | orçamento à parte, cláusula 2.5 |
| O Elo7 cobrar menos do que 12% | o ponto de virada sobe, e a loja própria demora mais a compensar |

## As duas perguntas em aberto

1. **Quanto o Elo7 cobrava por venda?** Está no formulário. Sem isso, a
   comparação acima é ilustração, não conta.
2. **Quantos pedidos por mês ela fazia?** Também está no formulário. É o
   que diz de que lado do ponto de virada ela está hoje.
