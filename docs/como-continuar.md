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

Guarde no Bitwarden, não em arquivo.

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
produto certo, e os 15 prints do painel do Elo7 — que são a única cópia
que sobrou do catálogo de 343 produtos dela.

**Sobe para o Drive antes de qualquer coisa.** Não entra no repositório
porque é material dela, e o repositório é público.

### 4. O contrato

`Documents/vivian-contrato`, também fora do repositório: tem CPF, endereço
e valores. Existe um repositório git local ali, criado e não enviado a
lugar nenhum.

---

## O estado que não está em arquivo nenhum

**O banco está vazio.** Projeto `loja`, organização `Feito para você`, em
São Paulo. As quatro migrações estão aplicadas, mas não há nenhum produto,
nenhum pedido e **nenhuma dona cadastrada**.

A primeira conta que se cadastrar vira a dona da loja, automaticamente. A
tela para isso ainda não existe.

**A loja no ar não usa o banco ainda.** Ela lê o catálogo de um arquivo,
`loja/src/telas/catalogo.js`. A troca acontece quando
`NEXT_PUBLIC_SUPABASE_URL` existir no build, e em nenhum outro lugar.

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
