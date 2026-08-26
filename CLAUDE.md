# A loja da Vivian

Loja virtual para substituir o Elo7, que saiu do ar em maio de 2026.
Cliente real, contrato de R$ 200 x 12 mais manutenção.

**No ar em https://feitoparavocepapelaria.com.br**

---

## Onde o projeto está

| Peça | Estado |
|---|---|
| Loja pública | no ar, com **342 produtos dela**, 140 temas e as 13 avaliações |
| Domínio | registrado no CPF dela, vence 21/08/2027 |
| Banco de dados | 12 migrações aplicadas e conferidas |
| Login | funciona; `/admin` só abre para quem está em `donas_da_loja` |
| Conta de quem compra | funciona; ela vê os próprios pedidos em `/minha-conta` |
| Pedido | **nasce no banco**, com o preço lido de lá e não do navegador |
| Painel: publicar produto | funciona, um a um ou o tipo inteiro |
| Painel: criar e editar produto | funciona, com foto de capa e galeria |
| Conversa com a cliente | dentro da loja, sem WhatsApp; falta o aviso por e-mail |
| Pagamento | **simulado**; aplicação criada, faltam as credenciais dela |
| Medição de visita | **não existe**, e trava anúncio pago |
| Frete | simulado |
| E-mail | **funcionando**, pelo Resend: aviso de mensagem e recuperar senha |

A loja e a área dela são dois lugares: `/` é de quem compra, `/admin` é
dela. Foi assim que a "cara de demonstração" saiu, e o desenho segue o do
`athos-gg`.

O que falta, em ordem: [docs/contas-e-conversas.md](docs/contas-e-conversas.md).

---

## Como rodar

```
cd loja && npm install
npm test                      # 357 testes de regra e de tela
npm run build

cd ..
DOMINIO_PRONTO=true node scripts/publicar.mjs    # monta o que vai ao ar
DOMINIO_PRONTO=true node scripts/servir.cjs 4173 # serve como o GitHub Pages serve
```

Contra o site montado, e não contra o `next dev`:

```
DOMINIO_PRONTO=true BASE_DA_LOJA=http://127.0.0.1:4173 node scripts/testar-navegacao.cjs
DOMINIO_PRONTO=true BASE_DA_LOJA=http://127.0.0.1:4173 node scripts/testar-acessibilidade.cjs
DOMINIO_PRONTO=true BASE_DA_LOJA=http://127.0.0.1:4173 node scripts/medir-desempenho.cjs
DOMINIO_PRONTO=true BASE_DA_LOJA=http://127.0.0.1:4173 node scripts/verificar-links.cjs
```

Publicar é `git push` na `main`. O workflow testa e publica sozinho.

**O catálogo entra no build, e não no navegador.** O `publicar.mjs` busca
os produtos publicados antes de gerar as páginas. Isso é o que faz a loja
abrir rápida no 4G e o Google ler as 342 páginas de produto — e significa
que publicar no painel só muda o site na publicação seguinte.

As telas da Vivian exigem login. Para rodar os testes de navegação contra
elas, defina `TESTE_DONA_EMAIL` e `TESTE_DONA_SENHA`; sem isso, elas são
puladas em vez de falharem.

---

## Como as coisas são escritas aqui

**Tudo em português**, inclusive nome de variável, de função e de coluna.
Quem mantém isto sou eu, e o vocabulário do negócio é português: "pedido"
é pedido, não `order`.

**Comentário explica o porquê, não o quê.** O que o código faz se lê no
código. O que não se lê é a razão de ele existir, e é isso que some da
cabeça em duas semanas.

**Sem travessão em texto que vai para ela ou para as clientes.** Existe
teste que varre as telas.

**O nome próprio dela não aparece nas telas de quem compra.** Também tem
teste ([nomeDaDona.test.ts](loja/src/dominio/nomeDaDona.test.ts)).

**Teste antes do código**, e o teste descreve a consequência para ela, não
a implementação: "não aprova quando pagaram menos do que o pedido", e não
"testa o if do valor".

**Mexeu em tela, tira print e olha.** Dois dos piores defeitos deste
projeto passaram por build, lint e teste de unidade: o menu coberto por
uma faixa fixa, que ficou dois dias no ar sem ninguém conseguir clicar, e
o botão de enviar respostas coberto pela tarja amarela.

---

## Cuidados que não são opcionais

**Chave secreta nunca entra no repositório.** Ele é público. As chaves
vivem nas variáveis do GitHub e no painel do Supabase; o código só lê
`process.env`.

**A chave anônima do Supabase vai dentro da página** e qualquer um a copia
em dez segundos. É por isso que `pedidos`, `itens_do_pedido` e
`eventos_de_pagamento` não têm política de leitura pública, e por isso o
projeto foi criado com RLS automático ligado.

**O aviso do Mercado Pago não é a verdade.** Ele diz "vá perguntar sobre o
pagamento tal"; quem responde é a API deles, e o que volta ainda passa
pelas regras de [avisoDePagamento.ts](loja/src/dominio/avisoDePagamento.ts).

**Nada é contratado sem a Vivian autorizar.** Está no contrato.

---

## Continuar de outra máquina

Ver [docs/como-continuar.md](docs/como-continuar.md). Resumo: o
repositório traz tudo do código, mas **as credenciais e os originais das
fotos não estão aqui** e precisam vir junto.
