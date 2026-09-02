# A loja da Vivian

Loja virtual para substituir o Elo7, que saiu do ar em maio de 2026.
Cliente real, contrato de R$ 200 x 12 mais manutenção.

**No ar em https://feitoparavocepapelaria.com.br**

---

## Onde o projeto está

| Peça | Estado |
|---|---|
| Loja pública | no ar: **342 produtos**, 140 temas, busca, e as clientes avaliam |
| Domínio | registrado no CPF dela, vence 21/08/2027 |
| Banco de dados | 17 migrações aplicadas e conferidas |
| Login | funciona; `/admin` só abre para quem está em `donas_da_loja` |
| Conta de quem compra | funciona; ela vê os próprios pedidos em `/minha-conta` |
| Pedido | **nasce no banco**, com o preço lido de lá e não do navegador |
| Painel: publicar produto | funciona, um a um ou o tipo inteiro |
| Painel: criar e editar produto | funciona, com foto de capa e galeria |
| Painel: ordem da vitrine | ela fixa produto no topo, um a um ou o tipo inteiro |
| Painel: trocar a senha | dentro de Configurações, sem depender de e-mail |
| Política da loja | página própria, com o texto que ela escreveu |
| Conversa com a cliente | dentro da loja, sem WhatsApp, e ela é avisada por e-mail |
| Pagamento | **cobra de verdade em produção** com Mercado Pago |
| Medição de visita | **no ar, sem cookie**: quantos, de onde e o que olharam |
| Frete | **de verdade**: Correios e Jadlog, e a cliente escolhe |
| E-mail | **funcionando**, pelo Resend: aviso de mensagem e recuperar senha |
| Google acha a loja | `sitemap.xml` com 487 endereços e `robots.txt`; a loja está no Search Console e o sitemap foi enviado |
| Backup do banco | **diário e cifrado**, em repositório privado, com 30 dias de retenção |
| Backup das fotos | **diário**, 684 arquivos versionados no git; sem cifra, porque já são públicas |

**O que ainda não está pronto**, e o documento já chegou a dizer que
estava:

| O quê | Estado |
|---|---|
| A primeira compra de verdade | **nunca foi feita**. A loja cobra; ninguém comprou. Roteiro em [docs/a-primeira-compra-de-verdade.md](docs/a-primeira-compra-de-verdade.md) |
| A conta sobrando no Supabase Auth | é a Vivian com dois logins de dona, não uma conta órfã. Precisa perguntar a ela qual usa |
| A restauração do backup | **nunca foi testada**: falta slot de projeto Free para restaurar dentro |

A loja e a área dela são dois lugares: `/` é de quem compra, `/admin` é
dela. Foi assim que a "cara de demonstração" saiu, e o desenho segue o do
`athos-gg`.

Onde tudo está, e quanto falta: [docs/onde-o-projeto-esta.md](docs/onde-o-projeto-esta.md).

O que falta, em ordem: [docs/contas-e-conversas.md](docs/contas-e-conversas.md).

Como a loja conta visita, e por que sem cookie:
[docs/a-contagem-de-visita.md](docs/a-contagem-de-visita.md).

Como ligar o frete de verdade, passo a passo:
[docs/ligar-o-melhor-envio.md](docs/ligar-o-melhor-envio.md).

O que a primeira compra de verdade precisa provar, e o que já foi provado
sem cobrar ninguém:
[docs/a-primeira-compra-de-verdade.md](docs/a-primeira-compra-de-verdade.md).

Como o Google acha as 342 páginas, e por que o mapa sai da publicação:
[docs/o-google-acha-a-loja.md](docs/o-google-acha-a-loja.md).

Por que o cadastro de `/admin` foi fechado sem levar a conta da cliente
junto: [docs/a-conta-que-sobrou.md](docs/a-conta-que-sobrou.md).

Como cadastrar a loja no Google Search Console, e o cuidado com a zona de
DNS: [docs/o-google-search-console.md](docs/o-google-search-console.md).

Como o banco é copiado todo dia, e como restaurar:
[docs/o-backup-do-banco.md](docs/o-backup-do-banco.md).

---

## Como rodar

```
cd loja && npm install
npm test                      # 760 testes de regra e de tela
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

**As funções do Supabase não sobem com o push.** Elas vão por:

```
node scripts/subir-funcoes.mjs [nome]
```

O CLI do Supabase procura em `supabase/functions/` e as nossas moram em
`supabase/funcoes/`, em português como o resto. O script faz a ponte. Sem
ele, o deploy não reclama e não sobe: foi assim que a Vivian recebeu um
404 no meio da autorização do frete, em 31/08.

Para saber se alguma ficou para trás:

```
node scripts/conferir-funcoes.cjs
```

Ele roda no CI a cada push. Na primeira execução achou uma função morta,
`aviso-de-pagamento`, que estava no repositório desde agosto com um nome a
uma letra de distância da que funciona.

**O catálogo entra no build, e não no navegador.** O `publicar.mjs` busca
os produtos publicados antes de gerar as páginas. Isso é o que faz a loja
abrir rápida no 4G e o Google ler as 342 páginas de produto — e significa
que publicar no painel só muda o site na publicação seguinte.

**O `sitemap.xml` e o `robots.txt` saem do mesmo catálogo**, no
`publicar.mjs`, e não à mão: produto que ela despublicar some do site e do
mapa na mesma publicação. As regras estão em
[mapaDoSite.mjs](loja/src/dominio/mapaDoSite.mjs), em JavaScript puro
porque o script de publicação e o vitest precisam carregar o mesmo
arquivo. O `verificar-links.cjs` abre os 487 endereços do mapa a cada
conferência: sitemap apontando para 404 é pior do que sitemap nenhum.

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

**Máquina minha e CI não são cliente dela.** O teste de navegação
percorre a loja inteira a cada push, contra o site montado em `127.0.0.1`
e apontando para o banco de verdade. Já custou onze pedidos falsos no
banco dela em 25/08; a contagem de visita nasceu com a guarda em
[origemDaVisita.ts](loja/src/dominio/origemDaVisita.ts), porque contador
inflado, ao contrário de pedido inventado, não tem como ser separado
depois.

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

**O endereço do aviso vai na própria cobrança**, em `notification_url`, e
não no painel do Mercado Pago. Lá o campo é separado por ambiente, e um
campo de produção vazio é falha silenciosa: o pagamento aprova, o dinheiro
entra, e o pedido fica "esperando o pagamento" para sempre. Montado a
partir de `SUPABASE_URL` para uma cópia da loja não avisar o projeto da
outra ([paraOndeOMercadoPagoAvisa.test.ts](loja/src/dominio/paraOndeOMercadoPagoAvisa.test.ts)).

**Não existe cadastro aberto em `/admin`.** A tela `/admin/criar-conta`
foi apagada em 01/09: a loja já tem dona, e desde a migração `0004` quem
se cadastrava ali saía com uma conta que não enxerga nada. Uma segunda
dona entra pelo convite da `0006`.

**Mas o cadastro do Supabase continua ligado, e tem que continuar.** O
mesmo `signUp` atende a conta de quem compra, em `/minha-conta`, que é
como a cliente vê o próprio pedido sem escrever para ela. Desligar
`disable_signup` no painel fecharia as duas portas. Existe teste que
reprova se alguém levar a conta da cliente junto
([cadastroDaDona.test.ts](loja/src/dominio/cadastroDaDona.test.ts)).

**O banco não tem backup do Supabase.** O plano Free não copia nada: só
Pro, Team e Enterprise. A cópia é nossa, diária, e roda em
`Maycon-MB/vivian_shop_backups`, que é **privado** porque este aqui é
público e artifact de repositório público qualquer um baixa. O dump é
cifrado com chave pública `age`, e a chave privada nunca entra no GitHub.
Ver [docs/o-backup-do-banco.md](docs/o-backup-do-banco.md).

**Nada é contratado sem a Vivian autorizar.** Está no contrato.

---

## Continuar de outra máquina

Ver [docs/como-continuar.md](docs/como-continuar.md). Resumo: o
repositório traz tudo do código, mas **as credenciais e os originais das
fotos não estão aqui** e precisam vir junto.
