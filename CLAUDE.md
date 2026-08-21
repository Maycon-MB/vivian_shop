# A loja da Vivian

Loja virtual para substituir o Elo7, que saiu do ar em maio de 2026.
Cliente real, contrato de R$ 200 x 12 mais manutenção.

**No ar em https://feitoparavocepapelaria.com.br**

---

## Onde o projeto está

| Peça | Estado |
|---|---|
| Loja pública | no ar, com 13 produtos e as fotos dela |
| Domínio | registrado no CPF dela, vence 21/08/2027 |
| Formulário de perguntas | no ar, respostas chegam por Apps Script |
| Banco de dados | criado, 4 migrações aplicadas e testadas, **vazio** |
| Login e cadastro | **não existe**, `/entrar` é maquete |
| Pagamento | simulado; conta Mercado Pago dela já existe |
| Frete e e-mail | simulados |

O que falta, em ordem: [docs/contas-e-conversas.md](docs/contas-e-conversas.md).

---

## Como rodar

```
cd loja && npm install
npm test                      # 278 testes de regra e de tela
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
