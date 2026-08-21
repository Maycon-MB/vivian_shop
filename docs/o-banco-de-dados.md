# O banco de dados

O que está escrito, o que falta, e como sai do papel em dez minutos quando
a conta existir.

Registro meu. Não vira PDF.

---

## O que já existe no repositório

| Arquivo | O quê |
|---|---|
| `supabase/migracoes/0001_catalogo.sql` | temas e produtos |
| `supabase/migracoes/0002_pedidos.sql` | pedidos, itens e avisos de pagamento |
| `supabase/funcoes/aviso-de-pagamento/index.ts` | o endereço que o Mercado Pago chama |
| [avisoDePagamento.ts](../loja/src/dominio/avisoDePagamento.ts) | as regras, com 30 testes |

Nada disso depende de conta para ser escrito, revisado ou testado.

---

## A separação que sustenta o resto

O banco tem duas metades com regras opostas.

**A metade pública** são temas e produtos. A vitrine lê com a chave
anônima, que vai dentro do JavaScript da página e qualquer pessoa copia em
dez segundos. Por isso a política só deixa ler o que está `ativo`: produto
rascunho, com preço pela metade, não aparece.

**A metade privada** são pedidos, itens e eventos. Ali moram nome, e-mail,
telefone e endereço das clientes dela. A chave anônima **não enxerga
nada**: nem lê, nem escreve. Quem escreve é a função do servidor, com a
credencial de serviço, que nunca sai de lá. Quem lê é a Vivian,
autenticada.

Uma política de leitura frouxa nessa metade entregaria o endereço
residencial de todas as compradoras a quem abrisse o código-fonte.

---

## Por que a decisão do pagamento é código puro

O aviso do Mercado Pago chega por HTTP, num endereço público, sem ordem
garantida e sem garantia de vir uma vez só. Três coisas acontecem de
verdade com quem integra isso:

- o mesmo aviso chega de novo, e o pedido é processado duas vezes
- um aviso antigo chega depois de um novo, e o estorno vira aprovação
- alguém descobre o endereço e manda um aviso inventado

A defesa é sempre a mesma: **o aviso não é a verdade**. Ele só diz "vá
perguntar sobre o pagamento tal". Quem responde é a API do Mercado Pago, e
o que volta ainda passa pelas regras antes de virar estado.

Essas regras ficam fora da função de propósito. O que roda em produção sem
teste automático precisa ser pequeno o bastante para caber na cabeça, e a
casca no Deno não tem `if` de negócio nenhum.

### As quatro regras que evitam prejuízo

**`authorized` não é aprovado.** É cartão reservado e não capturado: o
dinheiro ainda não é dela. Tratar como aprovado liberaria material digital
de uma compra que pode não acontecer.

**O estado nunca anda para trás.** Um "aguardando" atrasado não sobrescreve
um "aprovado". Sem isso, um pedido pago voltaria para a fila e ela pararia
de produzir uma peça já vendida. A única volta é o estorno, que é real.

**O valor precisa bater.** Só na entrada de dinheiro: reembolso parcial
devolve menos que o total, e isso não impede registrar o estorno.

**O mesmo aviso não é processado duas vezes.** Quem decide isso é a
restrição de unicidade do banco, e não uma consulta antes de inserir: dois
avisos iguais chegando ao mesmo tempo passariam pela consulta e só a
restrição segura.

---

## Quando a conta existir

**Uma organização só para a Vivian.** As cotas do plano gratuito são por
organização, não por projeto:

> "The quota is applied to your entire organization, independent of how
> many projects you launch within that organization."

Se o projeto dela entrar junto com outro, os dois dividem os mesmos 5 GB de
saída e 50 mil usuários por mês. Pior: um projeto que estoure derruba o
outro. Organização separada custa R$ 0 e resolve.

Limites confirmados em 21/08/2026: 2 projetos ativos por organização,
projeto pausa depois de 7 dias sem uso, pausado não conta no limite.

**Os passos:**

1. Criar a organização e o projeto, na conta dela
2. Colar `0001` e depois `0002` no editor SQL, nesta ordem
3. Preencher as variáveis, nenhuma delas no navegador:
   `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY`
4. Publicar a função e cadastrar o endereço dela no painel do Mercado Pago
5. `NEXT_PUBLIC_SUPABASE_URL` no build: é o que faz a loja trocar o
   catálogo de exemplo pelo banco, sem mudar uma linha de tela

---

## O que ainda não está escrito

**Criar a cobrança.** Depende do checkout que ela ainda não escolheu, em
[/perguntas](https://maycon-mb.github.io/vivian_shop/perguntas/). É a única
parte do pagamento que muda conforme a resposta.

**A escrita do pedido.** Hoje o pedido nasce no navegador
([pedidosLocais.ts](../loja/src/servicos/pedidosLocais.ts)). Passa a nascer
no servidor, junto com a cobrança, porque preço não pode vir do navegador:
quem cria a cobrança precisa recalcular o total a partir do banco.

**Teste de ponta a ponta contra um Postgres de verdade.** Hoje as regras
têm teste; o SQL, não. Quando o projeto existir, vale rodar as migrações
num banco local do CLI do Supabase e conferir que as políticas barram o que
prometem barrar.
