# A conta que sobrou, e a porta que ficou aberta

Feito em 01/09/2026. O cadastro público de `/admin` foi fechado. Falta
apagar uma conta no Supabase, e isso depende do painel dela.

Registro meu. Não vira PDF.

---

## O que estava aberto

A tela `/admin/criar-conta` estava no ar, na internet, para qualquer
pessoa. Sobrou de um plano que a própria migração `0004` já descrevia e
que nunca foi executado:

> assim que ela entrar, o cadastro público é desligado no painel do
> Supabase, e ninguém mais cria conta

Conferido em 01/09, contra o projeto de produção, por leitura e sem criar
conta nenhuma:

```
GET /auth/v1/settings        →  disable_signup: false
POST /rest/v1/rpc/loja_ainda_sem_dona  →  false
```

Os dois juntos dizem tudo: o cadastro estava aberto, e a loja já tinha
dona. Quem se cadastrasse ali sairia com uma conta que **não enxerga
nada**, porque desde a `0004` só a primeira conta da loja é promovida.

Foi assim que apareceu a conta sobrando.

---

## A armadilha que quase me pegou

O caminho óbvio era desligar `disable_signup` no painel do Supabase. É o
que a `0004` mandava fazer, e teria sido errado.

`criarConta()` é **uma função só**, usada em dois lugares:

| Onde | Para quê |
|---|---|
| `/admin/criar-conta` | a conta da dona, a porta que sobrou aberta |
| [MinhaConta.jsx](../loja/src/telas/MinhaConta.jsx) | a conta de quem compra |

A conta de quem compra é o que responde "meu pedido saiu?" sem a cliente
precisar escrever para a Vivian. Está no `CLAUDE.md` como funcionando, e
está.

**Desligar o cadastro no Supabase fecharia as duas portas.** A loja
continuaria vendendo, o CI continuaria verde, e o sintoma apareceria dias
depois, com uma cliente sem conseguir criar conta e a pergunta voltando
toda para o WhatsApp dela.

A `0004` foi escrita em agosto, antes de a conta da cliente existir. O
conselho dela envelheceu, e o documento não avisou.

---

## O que foi feito

Fechar só a porta certa.

| | |
|---|---|
| Apagado | `loja/src/app/admin/criar-conta/page.tsx` |
| Apagado | `loja/src/telas/CriarConta.jsx` |
| Removido | o link "Criar a minha conta" da tela de entrar |
| Mantido | o cadastro do Supabase, ligado, para a conta da cliente |

Conferido contra o site montado, e não contra o `next dev`:

```
/admin/criar-conta/  →  404
/admin/entrar/       →  200
```

Print da tela de entrar tirado e olhado, no desktop e no celular: sem
buraco onde o link saiu, sem erro no console, e sobraram só os três links
certos (esqueci a senha, trocar a senha, ver a loja).

Três testes em
[cadastroDaDona.test.ts](../loja/src/dominio/cadastroDaDona.test.ts)
travam isso:

1. a rota e a tela não existem mais
2. nenhuma tela linka para `/admin/criar-conta`
3. **a conta de quem compra continua de pé**

O terceiro é o que impede alguém de "terminar o serviço" e levar a conta
da cliente junto.

---

## Como uma segunda dona entra agora

Pelo convite da migração `0006`, que continua valendo: uma dona registra
o e-mail em `convites`, a pessoa cria conta, e o gatilho a promove no
momento do cadastro.

O que mudou é o lugar. A conta nasce em `/minha-conta`, como qualquer
outra, em vez de numa tela de administração aberta na internet. Ou eu
convido pelo painel do Supabase, que é um caminho de administrador e não
passa pelo cadastro público.

Isso importa se a Lilian, irmã dela, for mexer na loja. Foi combinado em
23/08.

---

## O que falta, e depende do painel dela

**Apagar a conta que sobrou.** Não consigo fazer daqui: só tenho a chave
anônima do projeto, que não lista nem apaga usuário. O acesso de
administrador é dela.

O caminho:

1. Painel do Supabase, projeto `kbvgdnrymwfavgkxqvjh`
2. Authentication, aba Users
3. Ordenar por data de criação
4. Localizar a conta que **não** é a dela e **não** é a conta de teste do
   CI (`TESTE_DONA_EMAIL`)
5. Conferir na tabela `donas_da_loja` que aquele id não está lá
6. Apagar

### Antes de apagar, o cuidado

Conferir se a conta é mesmo órfã, e não de uma cliente.

Uma conta de cliente não aparece em `donas_da_loja` também, e por fora as
duas são iguais. A diferença está em `pedidos.comprador_id`.

```sql
select p.numero, p.criado_em, p.total
from pedidos p
where p.comprador_id = 'o-id-da-conta';
```

Se vier alguma linha, **é cliente, e não se apaga**. Apagar não destrói os
pedidos, porque a coluna é `on delete set null`, mas desliga a pessoa
deles: ela perde o acesso ao próprio histórico em `/minha-conta`, e o
sintoma chega como "sumiram os meus pedidos".

Se não vier nada e a conta não estiver em `donas_da_loja`, é órfã, e pode
ir.

---

## O que não mudou, e é de propósito

`mailer_autoconfirm` continua ligado: quem cria conta não precisa
confirmar o e-mail. Vale rever um dia, porque é o que deixa criar conta
com o e-mail de outra pessoa. Mas mexer nisso agora colocaria uma
confirmação por e-mail no meio do cadastro da cliente, e isso é mudança de
fluxo de quem compra. Não entra junto com uma correção de porta aberta.

Fica anotado aqui para não sumir.
