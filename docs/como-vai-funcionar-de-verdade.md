# Como a loja vai funcionar de verdade

O desenho da loja em produção: quais peças existem, o que cada uma faz,
como uma venda acontece de ponta a ponta, e o que falta configurar.

Escrito em 19/08/2026. O que hoje é simulado está marcado.

---

## As peças

Sete serviços, e nenhum deles é um servidor que a gente aluga e
administra. Isso é decisão de projeto, não acaso: servidor pede
manutenção, atualização de segurança e alguém acordando de madrugada
quando cai. Nada disso cabe em R$ 100 por mês.

| Peça | Para quê | Onde | Custo |
|---|---|---|---|
| **GitHub** | guarda o código, roda os testes e publica | já existe | R$ 0 |
| **GitHub Pages** | serve a vitrine e o painel | já existe | R$ 0 |
| **Domínio** | o endereço `.com.br` | registro.br | R$ 40/ano |
| **Supabase** | banco, login e as funções que recebem avisos | falta criar | R$ 0 |
| **Mercado Pago** | cobra e avisa quando o dinheiro cai | falta criar | taxa por venda |
| **Google Drive + Apps Script** | guarda e libera o material digital | já é dela | R$ 0 |
| **Serviço de e-mail** | confirmação e link para a compradora | falta criar | R$ 0 |

Falta também o **cálculo de frete e emissão de etiqueta** — Melhor Envio
ou equivalente. Hoje o frete é calculado com a regra real de peso cubado,
mas com tarifa aproximada.

---

## O desenho

```
     Quem compra                          A Vivian
          |                                   |
          v                                   v
  +---------------------------------------------------+
  |  GitHub Pages - vitrine, produto, carrinho,       |
  |  checkout e painel. Paginas prontas, R$ 0.        |
  +---------------------------------------------------+
          |                                   |
          | paga                              | entra com senha
          v                                   v
  +------------------+            +-----------------------+
  |  Mercado Pago    |            |  Supabase             |
  |  cobra e avisa   |---avisa--->|  banco + login +      |
  +------------------+            |  funcoes              |
                                  +-----------------------+
                                       |            |
                            grava      |            |  chama
                            pedido     |            v
                                       |   +------------------+
                                       |   | Apps Script      |
                                       |   | libera o Drive   |
                                       |   +------------------+
                                       v
                              +------------------+
                              | E-mail para      |
                              | quem comprou     |
                              +------------------+
```

O ponto do desenho: **a vitrine não fala com o banco.** Quem visita a loja
só baixa arquivos prontos. O banco só entra em cena quando alguém compra
ou quando a Vivian administra — uma fração mínima dos acessos.

É isso que mantém o custo em zero e a loja rápida.

---

## Uma venda física, passo a passo

**Caneca personalizada, 10 unidades**

| # | O que acontece | Quem resolve | Já existe? |
|---|---|---|---|
| 1 | A cliente navega e escolhe | GitHub Pages | **sim** |
| 2 | Põe no carrinho | o navegador dela | **sim** |
| 3 | Digita o CEP, vê frete e prazo | função no Supabase, via Melhor Envio | simulado |
| 4 | Preenche dados e paga | Mercado Pago | simulado |
| 5 | O Mercado Pago avisa que o dinheiro caiu | função no Supabase | falta |
| 6 | O pedido é gravado | banco no Supabase | simulado |
| 7 | A cliente recebe a confirmação | serviço de e-mail | simulado |
| 8 | A Vivian vê o pedido no painel | Supabase | simulado |
| 9 | Ela produz e gera a etiqueta | Melhor Envio | simulado |
| 10 | Marca como enviado, o rastreio vai por e-mail | Supabase e e-mail | simulado |

O passo 5 é o mais importante e o que menos se vê. É ele que garante que o
pedido só existe **depois** de o dinheiro entrar — e não quando alguém
clica em "pagar".

## Uma venda digital, passo a passo

**Atividade pedagógica em PDF**

| # | O que acontece | Quem resolve |
|---|---|---|
| 1 a 4 | igual à física, sem frete nem endereço | |
| 5 | O Mercado Pago avisa que pagou | função no Supabase |
| 6 | O pedido é gravado | banco |
| 7 | **O acesso é concedido ao e-mail da compradora** | Apps Script no Drive dela |
| 8 | Ela recebe o link e baixa | e-mail |
| 9 | **Sete dias depois, o acesso é removido** | Apps Script, agendado |
| 10 | A Vivian recebe um aviso do que aconteceu | e-mail |

Os arquivos **nunca saem do Drive dela**. É o jeito que ela já usa — a
diferença é que os passos 7 e 9, que hoje ela faz na mão, passam a
acontecer sozinhos.

---

## O que precisa ser feito, na ordem

A ordem importa: cada item depende do anterior.

### 1. Domínio — **ela**, 30 minutos

Registrar no registro.br, **no CPF dela**. R$ 40 por ano.

Depois disso eu aponto o domínio para o GitHub Pages e configuro o
certificado de segurança — o cadeado do navegador. Leva algumas horas para
propagar.

> Enquanto isso não acontece, a loja funciona no endereço atual. O domínio
> é o que a faz parecer profissional, e o que ela leva com ela se um dia
> trocar de desenvolvedor.

### 2. Mercado Pago — **ela**, algumas horas a dias

Criar conta de vendedor, no CPF ou CNPJ dela, e passar pela verificação.
Depois, gerar as credenciais de integração e me passar.

**É o item que trava todo o resto.** Sem ele não há venda, e sem venda não
há pedido para gravar.

### 3. Supabase — **eu**, 1 dia

Criar o projeto, montar as tabelas, ligar o login do painel e escrever a
função que recebe o aviso do Mercado Pago.

A conta fica no nome dela, com você como colaborador. Assim a loja é dela
de verdade, e não fica presa a uma conta minha.

### 4. Serviço de e-mail — **eu**, algumas horas

Configurar o envio e verificar o domínio dela. Depende do item 1: e-mail
enviado de domínio não verificado cai em spam.

### 5. Entrega automática do material — **eu**, 1 dia

O Apps Script que concede e revoga o acesso no Drive. Depende de ela
autorizar o script na conta dela — um clique, que ela pode revogar quando
quiser.

Também depende de saber **como as pastas estão organizadas**. Está no
formulário.

### 6. Frete de verdade — **eu**, 1 dia

Ligar o cálculo à tarifa real e a emissão de etiqueta. Depende de ela criar
conta no Melhor Envio, e de me passar **peso e medidas do pacote fechado**
de cada produto.

### 7. Catálogo — **ela e eu**

Os produtos com foto. Não precisa dos 343 para abrir: **dez já vendem.**

---

## O que já está pronto

- Vitrine, página de produto, carrinho e checkout
- Painel com pedidos, fila de produção e relatórios
- Regras das duas linhas: mínimo de 10, prazo, digital separado
- Cálculo de frete com peso cubado, em tarifa aproximada
- Publicação automática com 152 testes, acessibilidade e desempenho
- Formulário de perguntas com envio para a planilha

Tudo o que está "simulado" na tabela acima **funciona de ponta a ponta**
hoje, com dados de mentira. A troca para o serviço real é uma linha em
cada caso, porque cada um está atrás de um contrato próprio no código.

Foi por isso que eu montei assim desde o começo.

---

## O caminho mais curto até a primeira venda

Se a ideia for abrir rápido — e deveria ser, porque ela está sem faturar
desde maio:

1. **Mercado Pago** (ela)
2. **Supabase e a função de pagamento** (eu, 1 dia)
3. **Dez produtos com foto** (ela)

Com esses três, a loja vende. Domínio, frete automático e entrega
automática do digital podem entrar depois, com a loja já no ar — enquanto
isso, o frete sai por combinação no WhatsApp e o material digital ela
libera na mão, como já fazia.

**Não é o ideal. É melhor do que continuar parada.**
