# Infraestrutura e custos reais

Correção de uma análise anterior minha, que tratava o GitHub Pages como
solução final. Ele não é: é a vitrine da demonstração. **Uma loja que
vende precisa de banco de dados** — produtos, pedidos, login, estoque,
histórico de clientes — e isso tem custo.

Os valores abaixo são de agosto de 2026 e **precisam ser conferidos na
hora de contratar**: preço de nuvem muda, e plano gratuito muda mais
ainda.

---

## O que a loja precisa de verdade

| Peça | Para quê | Dá para ser estático? |
|---|---|---|
| Vitrine e páginas de produto | mostrar o catálogo | **sim** |
| Catálogo (343 produtos, 86 temas) | dados dos produtos | sim, gerado no build |
| Carrinho | montar o pedido | sim, fica no navegador |
| **Pedidos** | guardar o que foi comprado | **não** |
| **Login da Vivian** | acesso ao painel | **não** |
| **Confirmação de pagamento** | o Mercado Pago avisa que pagou | **não** — precisa de endereço que receba o aviso |
| **Estoque** | não vender o que acabou | **não** |
| **Entrega do material digital** | link com validade de 7 dias | **não** |
| **Clientes** | histórico, para ela vender de novo | **não** |

As cinco últimas exigem servidor e banco. Não tem como contornar sem
mentir para a cliente.

---

## A arquitetura que eu recomendo

Manter a vitrine estática e colocar o banco atrás dela, em vez de mover a
loja inteira para um servidor.

```
  Vitrine e catálogo   ->  arquivos estáticos, gerados no build
  Pedidos, login,      ->  Supabase (Postgres + autenticação + arquivos)
  clientes, estoque
  Aviso de pagamento   ->  função do Supabase, chamada pelo Mercado Pago
```

**Por que assim, e não uma aplicação inteira num servidor:**

1. A vitrine é o que mais recebe visita e o que menos muda. Servida como
   arquivo, é rápida, barata e não cai.
2. O banco só é acionado por quem compra ou por quem administra — uma
   fração das visitas.
3. O catálogo dela muda pouco: gerar no build e republicar resolve, e
   ainda deixa a loja funcionando mesmo se o banco estiver fora do ar.
4. Reaproveita tudo que já está construído. A separação por contratos que
   fiz desde o começo existia exatamente para este momento.

---

## Os custos, por fase

### Fase 1 — hoje, demonstração

| Item | Custo |
|---|---|
| Vitrine (GitHub Pages) | R$ 0 |
| Publicação automática | R$ 0 |
| Formulário de perguntas | R$ 0 |
| **Total** | **R$ 0/mês** |

### Fase 2 — vendendo, volume inicial

| Item | Plano | Custo |
|---|---|---|
| Vitrine | GitHub Pages | R$ 0 |
| Banco, login e arquivos | Supabase, plano gratuito | R$ 0 |
| Envio de e-mail | Resend ou similar, plano gratuito | R$ 0 |
| Domínio | registro.br | R$ 40/ano |
| **Total** | | **cerca de R$ 3/mês** |

O plano gratuito do Supabase, em agosto de 2026, oferecia algo em torno de
500 MB de banco, 1 GB de arquivos e 50 mil usuários ativos por mês. Para
uma loja com dezenas de pedidos mensais, sobra muito.

**Mas ele tem um risco que precisa ser dito:** planos gratuitos costumam
pausar projetos inativos e podem mudar de regra sem aviso. Para uma loja
que fatura, isso é risco de negócio, não economia.

### Fase 3 — loja estabelecida

| Item | Custo mensal |
|---|---|
| Banco e autenticação (Supabase Pro) | cerca de US$ 25 → **R$ 130 a R$ 150** |
| Envio de e-mail (plano pago) | cerca de US$ 20 → **R$ 100 a R$ 120**, se o volume exigir |
| Vitrine | R$ 0 |
| Domínio | R$ 3/mês |
| **Total** | **R$ 135 a R$ 275/mês** |

---

## O que isso muda para ela

A conta que eu tinha apresentado antes estava incompleta. A real:

| Fase | Manutenção | Infraestrutura | **Total por mês** |
|---|---|---|---|
| Demonstração | R$ 200* | R$ 0 | R$ 200 |
| Vendendo, início | R$ 200* | R$ 3 | R$ 203 |
| Depois do 12º mês, início | R$ 100 | R$ 3 | **R$ 103** |
| Depois do 12º mês, estabelecida | R$ 100 | R$ 135 a R$ 275 | **R$ 235 a R$ 375** |

*\* nos 12 primeiros meses, o valor é o do desenvolvimento.*

### O ponto de virada muda

Com comissão hipotética de 12% no Elo7:

| Custo mensal aqui | Faturamento que empata |
|---|---|
| R$ 103 (início) | cerca de R$ 860 |
| R$ 235 (estabelecida) | cerca de R$ 1.960 |
| R$ 375 (volume alto) | cerca de R$ 3.125 |

A boa notícia: **ela só chega na fase 3 se estiver vendendo bem**. Com
R$ 5.000 de faturamento, a comissão do Elo7 seria R$ 600 contra R$ 235
aqui — a diferença continua grande.

A má notícia: **existe uma faixa em que a loja própria sai mais cara**, e
é honesto dizer isso a ela antes, não depois.

---

## O que isso muda no contrato

A cláusula 6.3 lista "hospedagem — R$ 0,00 na configuração atual". Está
correto para hoje, mas incompleto para o que vem.

**Precisa entrar:**

1. Banco de dados e autenticação na lista de serviços contratados por ela,
   em nome dela, com a faixa de custo estimada.
2. A confirmação de que nada pago é contratado sem autorização dela — já
   está na 6.2, e é o que a protege.
3. Que a mensalidade de manutenção **não inclui** os custos de
   infraestrutura, para não haver dúvida depois.

Sem isso, daqui a seis meses aparece uma cobrança de R$ 150 que ela não
esperava, e a conversa fica ruim por um mal-entendido meu.

---

## O que isso muda para o Maycon

Nada, financeiramente — as contas ficam no nome dela e o custo é dela.

O que muda é **o que precisa ser dito antes de assinar**. Vender uma loja
dizendo "hospedagem R$ 0" e depois cobrar R$ 150 de infraestrutura é o
tipo de coisa que destrói confiança, mesmo sendo tecnicamente verdade nas
duas vezes.

---

## O que fazer agora

1. **Conferir os preços** antes de qualquer promessa. Os daqui são de
   agosto de 2026 e podem estar diferentes.
2. **Corrigir a cláusula 6.3** do contrato, com a faixa realista.
3. **Explicar a ela**, com a tabela de fases: hoje R$ 0, no começo quase
   nada, e uma faixa entre R$ 135 e R$ 275 quando a loja estiver
   estabelecida — que é quando ela vai estar faturando o suficiente para
   isso caber.

---

## Corrigido em 18/08/2026

Os números de download deste documento **não valem mais**, e o motivo é
bom: os arquivos do material pedagógico ficam no Google Drive da Vivian, e
ela libera acesso por e-mail em vez de entregar arquivo. Nada disso passa
pela loja.

Sem PDF no meio, o que o banco guarda é texto — pedidos e cadastro. O
plano gratuito leva anos para encher, e o cenário de R$ 130 a R$ 275
mensais deixa de ser previsão para virar hipótese distante.

Como isso funciona, e o que a loja automatiza, está em
[entrega-do-material-digital.md](entrega-do-material-digital.md).

---

## Uma armadilha confirmada: Vercel não serve

Verificado nos termos oficiais em 19/08/2026: **o plano gratuito da Vercel
(Hobby) proíbe uso comercial.** Site que vende não pode usá-lo.

Isso importa porque a Vercel é o lugar mais óbvio para publicar um projeto
Next.js — é a empresa que faz o Next. Muita gente sobe lá por padrão, sem
ler os termos, e fica em situação irregular sem saber. O plano seguinte
custa cerca de US$ 20 por mês, por pessoa.

A loja não depende disso: a vitrine é estática e está no GitHub Pages, que
não tem essa restrição. Mas fica registrado para o dia em que alguém —
inclusive eu — pensar em "só mover para a Vercel, que é mais fácil".

---

# Levantamento de preços — verificado em 19/08/2026

Os números abaixo saíram das páginas oficiais de cada serviço, não de
memória. As URLs estão ao lado de cada bloco.

## Banco de dados

| | Supabase | Neon | Turso | Cloudflare D1 |
|---|---|---|---|---|
| Grátis — tamanho | 500 MB | 0,5 GB | 5 GB | 5 GB |
| Grátis — uso | 5 GB de saída, 50 mil usuários ativos/mês | 100 CU-horas/mês | 500 mi leituras/mês | 5 mi leituras/dia |
| Primeiro pago | **US$ 25/mês** | paga o uso, sem mensalidade | US$ 4,99/mês | US$ 5/mês mínimo |
| Pausa por inatividade | **sim, após 1 semana** | dorme em 5 min, acorda sozinho | não confirmado | não pausa |
| Risco de fatura surpresa | baixo — teto de gasto vem ligado | baixo — suspende em vez de cobrar | médio | médio |

Fontes: [supabase.com/pricing](https://supabase.com/pricing) ·
[neon.com/pricing](https://neon.com/pricing) ·
[turso.tech/pricing](https://turso.tech/pricing) ·
[developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/platform/pricing/)

### Uso comercial no plano gratuito

Pergunta mais importante do levantamento, e a que nenhuma página de preço
responde. Fui aos termos:

- **Supabase: permitido.** Os Termos de Serviço não restringem o plano
  gratuito a uso pessoal ou de teste, e a seção 2(a) fala em "uso para
  propósitos comerciais internos do Cliente".
  [supabase.com/terms](https://supabase.com/terms)
- **Vercel: proibido.** O plano Hobby veda uso comercial de forma
  explícita. Por isso está fora, apesar de ser o lugar mais óbvio para
  publicar um projeto Next.js.

### A escolha: Supabase, com uma ressalva

Postgres, autenticação e API num pacote só — é o que menos exige
construir. Para dezenas de pedidos por mês guardando texto, 500 MB não
enche em anos.

**A ressalva é a pausa por inatividade.** Projeto gratuito do Supabase
pausa depois de 7 dias sem acesso, e a loja sairia do ar até alguém
religar no painel. Uma loja com movimento nunca chega lá — mas "nunca"
depende de haver movimento, e uma semana fraca é plausível.

**Solução, sem custo:** a publicação automática já roda no GitHub Actions.
Um agendamento semanal que faz uma consulta boba ao banco mantém o projeto
vivo. Custa zero e resolve o problema antes de ele existir.

Se um dia isso não bastar, o Pro a US$ 25/mês remove a pausa — e o teto de
gasto vem ligado por padrão, o que protege contra fatura surpresa.
