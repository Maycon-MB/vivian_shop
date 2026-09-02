# O backup do banco, e como restaurar

Feito em 02/09/2026. Até esta data **o banco da loja não tinha backup
nenhum**.

Registro meu. Não vira PDF.

---

## Por que isto existe

A loja roda no plano Free do Supabase, e o Free **não tem backup
automático**. A documentação deles é explícita: copiam diariamente só os
projetos Pro, Team e Enterprise, e recomendam que quem está no Free
exporte por conta própria.

Dentro daquele banco tem pedido, nome, e-mail, telefone e endereço de
entrega de cliente de verdade. Até 02/09, um delete errado ou uma
corrupção não tinha de onde voltar.

---

## Onde o backup roda, e por que não aqui

O workflow **não mora neste repositório**. Ele mora em
`Maycon-MB/vivian_shop_backups`, que é privado.

O motivo é direto: este repositório é público, e em repositório público
artifact é baixável por qualquer pessoa. Um dump com endereço das
clientes viraria download aberto para quem passasse.

Esse projeto já levou esse tapa uma vez. A branch `gh-pages` guardava 134
commits de build, e os antigos traziam o CEP da casa da Vivian compilado
dentro do JavaScript: o site atual estava limpo e o histórico continuava
servindo o dado.

Rodando no repositório privado, três coisas saem de graça:

| | |
|---|---|
| O artifact | nasce privado |
| A retenção de 30 dias | é o GitHub que aplica, não código meu |
| A senha do banco | não fica no cofre de segredos do repositório público |

---

## Como o dump é protegido

**`age`, com par de chaves.** O workflow tem só a chave **pública**.

Isso é o ponto todo. Com cifra simétrica, a senha que fecha é a mesma que
abre, e ela teria que viver no GitHub Secrets: um segredo vazado, um log
descuidado, e trinta dias de endereço de cliente abrem de uma vez.

Do jeito que está, **o workflow não consegue abrir nenhum backup, nem os
que ele mesmo gerou**. Quem obtiver acesso ao repositório privado leva
arquivos que não abrem.

### Onde a chave privada mora

| Onde | Por quê |
|---|---|
| No seu gerenciador de senhas | é você que restaura no dia a dia |
| Uma cópia com a Vivian | as cláusulas 7.3 e 11.1 prometem a ela "todos os acessos". Backup que só você abre não é backup dela |
| **Nunca** no GitHub | nem Secret, nem Variable, nem arquivo, nem este repositório |

Duas cópias é o mínimo. **Chave perdida é backup perdido**, e a descoberta
acontece no pior dia possível.

---

## O que configurar, uma vez

### 1. O par de chaves ~~gerar~~ feito em 02/09

Já existe. A chave pública está cadastrada como variável do repositório
privado:

```
age13fh9kkfzzny36nkz93840rk2cg3q7hn3a8fsa8fprjenwakrpyas2s9lt6
```

Ela foi gerada em Node, e não pelo binário `age`, porque esta máquina não
tem `age` nem `winget`. Bech32 escrito à mão passa o próprio checksum e
mesmo assim pode não ser o formato que o `age` espera, e isso só
apareceria na hora de cifrar o dump: o backup daquele dia não existiria.

Por isso existe o workflow `conferir a chave`, que cifra um arquivo
qualquer com ela e confere o cabeçalho. Rodado em 02/09: passou, e o
arquivo saiu com `age-encryption.org/v1`. Vale rodar de novo toda vez que
a chave mudar.

**A chave privada está em `Documentos\chave-do-backup-da-loja.txt`, em
texto puro.** Ela não passou por log nenhum e não está em repositório
nenhum, mas aquele arquivo é um lugar de passagem, e não de guarda:

1. copiar a linha `AGE-SECRET-KEY-1...` para o gerenciador de senhas
2. mandar uma cópia para a Vivian
3. **apagar o arquivo**

Enquanto o passo 3 não acontecer, quem tiver acesso a essa máquina abre
todos os backups.

### 2. A conexão do banco

No painel do Supabase, projeto `loja`, botão **Connect** no topo, aba
**Session pooler**. Copia a URI, que tem esta cara:

```
postgresql://postgres.kbvgdnrymwfavgkxqvjh:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

Troca `[SENHA]` pela senha do banco. Se você não a tiver, Settings →
Database → **Reset database password**.

**Session pooler, e não os outros dois.** A conexão direta
(`db.<ref>.supabase.co`) só responde em IPv6 no plano Free, e runner do
GitHub é IPv4: a conexão simplesmente não fecha. O Transaction pooler
responde, mas não aguenta `pg_dump`.

### 3. Cadastrar no repositório privado

Em `github.com/Maycon-MB/vivian_shop_backups` → Settings → Secrets and
variables → Actions:

| Aba | Nome | Valor |
|---|---|---|
| **Secrets** | `URL_DO_BANCO` | a URI do Session pooler, com a senha |
| **Variables** | `CHAVE_PUBLICA_DO_BACKUP` | o `age1...` do passo 1 |

A chave pública vai em Variables e não em Secrets de propósito: ela é
pública, e guardá-la como segredo daria uma falsa sensação de proteção,
além de mascarar o valor no log quando você precisar conferir qual chave
foi usada.

---

## Como restaurar

### 1. Achar e baixar o backup do dia

```powershell
gh run list -R Maycon-MB/vivian_shop_backups --workflow "backup do banco" --limit 10
gh run download -R Maycon-MB/vivian_shop_backups <ID_DA_EXECUCAO> -n banco-2026-09-02
```

### 2. Abrir

```powershell
age -d -i chave-do-backup.txt -o banco.tar.gz banco-2026-09-02.tar.gz.age
tar -xzf banco.tar.gz
```

Saem dois arquivos:

| Arquivo | O que é |
|---|---|
| `banco.sql` | o schema `public` inteiro: produtos, temas, pedidos, itens, clientes, conversas, avaliações, visitas, e as políticas de RLS |
| `logins.sql` | só os dados de `auth.users`, para referência |

### 3. Restaurar

**Contra o destino, e nunca contra produção sem ter certeza:**

```powershell
psql "postgresql://postgres.<ref>:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" -f banco.sql
```

### 4. Conferir

```powershell
psql "$URL" -c "select count(*) from produtos;"    # 342
psql "$URL" -c "select count(*) from temas;"       # 140
psql "$URL" -c "select count(*) from pedidos;"
```

### Sobre os logins

`logins.sql` **não se restaura com `psql`**. A tabela `auth.users` é do
Supabase, e escrever nela na mão quebra coisas que não aparecem na hora.

Ele existe para responder *quem tinha conta*. Restaurada a loja, as donas
voltam por convite (migração `0006`), e as clientes criam conta de novo em
`/minha-conta`. Os pedidos delas não se perdem: a migração `0011` religa
pelo e-mail confirmado.

---

## Testar a restauração sem tocar em produção

**Backup que nunca foi restaurado não é backup.** Este é o teste, e ele
não chega perto do banco da loja.

Não usa Docker, porque nesta máquina não há e não vai haver.

1. **Criar um projeto Supabase novo**, no plano Free, com um nome que
   deixe óbvio o que é: `restauracao-de-teste`.
2. Pegar a URI do **Session pooler** dele.
3. Rodar os passos 1 a 4 acima contra essa URI.
4. Conferir que os números batem: 342 produtos, 140 temas.
5. **Apagar o projeto de teste.**

O passo 5 não é opcional. Um projeto esquecido com cópia dos dados das
clientes é exatamente o tipo de coisa que a LGPD trata como incidente, e
ninguém lembraria dele em três meses.

> O plano Free costuma permitir dois projetos ativos por organização. Se
> ele reclamar, vale criar uma organização nova só para o teste, e apagá-la
> junto no passo 5.

---

## O que o workflow faz falhar em vermelho

Um workflow verde escondendo backup que não aconteceu é pior do que não
ter backup. Cada ponto onde isso poderia acontecer em silêncio tem uma
parada:

| Se acontecer | O que reprova |
|---|---|
| `URL_DO_BANCO` vazio ou apagado | passo do dump, antes de tentar conectar |
| `pg_dump` falha | `set -euo pipefail` |
| Dump sai vazio | teste de arquivo vazio |
| Falta uma tabela | procura por `CREATE TABLE` de cada uma |
| Dump veio só com o schema, sem dado | procura pelo `COPY public.produtos` |
| Dump veio truncado | conta os produtos e exige pelo menos 300 |
| `CHAVE_PUBLICA_DO_BACKUP` vazia | passo da cifragem, **antes** de gerar qualquer coisa |
| A cifragem não gerou arquivo | teste de arquivo vazio |
| O arquivo cifrado não é `age` | procura pelo cabeçalho `age-encryption.org` |
| Não há nada para subir | `if-no-files-found: error` |

Falha em execução agendada gera e-mail do GitHub para o dono do
repositório.

### A armadilha do cron parado

O GitHub **desliga workflow agendado em repositório sem atividade por 60
dias**. Um repositório que só guarda backup nunca recebe commit, então ele
se desligaria sozinho, em silêncio, que é justamente a falha que tudo
isto existe para evitar.

Por isso o job grava `ULTIMO-BACKUP.txt` a cada execução. Serve para duas
coisas: mantém o repositório ativo, e põe na primeira tela a data do
último backup. **Se aquela data estiver velha, o backup parou.**

---

## O que este backup não cobre

**As fotos dos produtos.** Elas vivem no Storage do Supabase, não no
banco, e `pg_dump` não as alcança. Os originais estão com a Vivian, e o
`docs/como-continuar.md` já registra que eles não estão no repositório.

Fica anotado como o próximo item, e não como resolvido.
