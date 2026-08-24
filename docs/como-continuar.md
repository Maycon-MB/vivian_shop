# Continuar de outra máquina

O que o `git clone` traz, o que ele não traz, e o que fazer com isso.

---

## O que o repositório traz

Código, testes, migrações do banco, documentos, e as fotos dos produtos já
convertidas. Isso basta para rodar a loja inteira, com serviços simulados,
sem conta em lugar nenhum.

```
git clone https://github.com/Maycon-MB/vivian_shop.git
cd vivian_shop/loja
npm install
npx playwright install chromium
npm test
```

Precisa de **Node 22**. É a versão que a publicação usa.

---

## O que o repositório NÃO traz

### 1. As credenciais

Nenhuma chave está aqui, e é de propósito: o repositório é público.

| O quê | Onde pegar |
|---|---|
| Token do Supabase | supabase.com/dashboard/account/tokens |
| Chave de serviço do banco | painel do projeto → Settings → API |
| Login do registro.br | conta `MBMGC2` |
| Acesso ao GitHub | `gh auth login` |
| Login da Elojinha | com a Vivian, e **a senha precisa ser trocada** |

Guarde no Bitwarden, não em arquivo.

**O `.env.local` não vem no clone**, e sem ele a loja roda em modo de
demonstração: catálogo de exemplo, e a área da dona abre sem pedir senha.
Copie `loja/.env.example` para `loja/.env.local` e preencha com as duas
chaves públicas do projeto, que estão no painel do Supabase em
Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://kbvgdnrymwfavgkxqvjh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Essas duas não são segredo: elas vão dentro do JavaScript da página de
qualquer forma. O que nunca sai do servidor é a chave de serviço.

### 2. O MCP do Supabase

A configuração fica em `.claude.json`, que é da máquina e não do
repositório. Em cada máquina nova:

```
claude mcp add supabase -e SUPABASE_ACCESS_TOKEN=sbp_seu_token -- \
  npx -y @supabase/mcp-server-supabase@latest --project-ref=kbvgdnrymwfavgkxqvjh
```

Depois de adicionar, **feche e abra o Claude Code**: as ferramentas só
entram numa sessão nova.

### 3. Os originais das fotos

**Este é o único item sem cópia.** As 56 imagens que ela mandou em 16/08
existem em `Documents/vivian-16-08/anexos`, nesta máquina, e em mais lugar
nenhum. O repositório tem as versões convertidas e reduzidas, que servem
para o site e não servem para refazer nada com mais qualidade.

Junto delas está a `conversa.md`, que é o que permitiu ligar cada foto ao
produto certo, e 15 prints do Elo7: um do painel de produtos e catorze das
avaliações.

**O conteúdo desses prints já está transcrito** em
[o-que-sobrou-do-elo7.md](o-que-sobrou-do-elo7.md), então a informação
sobrevive mesmo que os arquivos se percam. O que se perde são as imagens
em si e a possibilidade de reler o que ficou cortado na tela.

**Sobe para o Drive antes de qualquer coisa.** Não entra no repositório
porque é material dela, e o repositório é público.

### 4. O contrato

`Documents/vivian-contrato`, também fora do repositório: tem CPF, endereço
e valores. Existe um repositório git local ali, criado e não enviado a
lugar nenhum.

---

## O estado que não está em arquivo nenhum

**O banco está cheio.** Projeto `loja`, organização `Feito para você`, em
São Paulo, com sete migrações aplicadas, 343 produtos e 140 temas vindos
da Elojinha. Desses, 342 estão publicados e aparecem na loja.

**Existe uma conta de dona, e ela é de teste**:
`testes@feitoparavocepapelaria.com.br`. Serve para os testes de navegação
entrarem no painel; a senha está nos segredos do repositório, em
`TESTE_DONA_EMAIL` e `TESTE_DONA_SENHA`.

**O cadastro público ainda está aberto**, e a primeira conta criada numa
loja sem dona vira a dona. Como já existe uma, quem se cadastrar agora não
vira nada — mas o cadastro precisa ser desligado quando a Vivian assumir.

**A confirmação de e-mail está desligada** no Supabase até o Resend
existir. Com ela ligada e sem serviço de envio, a conta nasce travada
esperando um e-mail que nunca chega.

**O catálogo entra no build.** O `publicar.mjs` roda o
`baixar-catalogo.mjs` antes de gerar as páginas, e o resultado fica em
`loja/src/dados/catalogo-publicado.json`. Esse arquivo é versionado de
propósito: sem ele, quem clonar sem credencial construiria uma loja vazia
em vez de uma loja de demonstração.

---

## O interruptor que muda onde a loja mora

`DOMINIO_PRONTO`, nas variáveis do repositório no GitHub:

| Valor | Loja em | CNAME |
|---|---|---|
| ausente ou `false` | maycon-mb.github.io/vivian_shop | não escrito |
| `true` (hoje) | raiz de feitoparavocepapelaria.com.br | escrito a cada build |

Localmente, é a mesma variável no comando. Montar sem ela e servir com ela
faz a página abrir sem JavaScript, e o efeito é uma tela que não responde
a nada — já perdi tempo com isso.
