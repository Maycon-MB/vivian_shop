# Ligar o Resend

Decidido em 25/08: a loja passa a mandar e-mail.

Isto é o que **só o Maycon pode fazer**, porque envolve criar conta e
mexer em DNS. O código do lado de cá já está pronto e esperando.

Registro meu. Não vira PDF.

---

## O que isso destrava, em ordem de valor

| O quê | Precisa de código? |
|---|---|
| Avisar a Vivian de que uma cliente quer falar | pronto, ver abaixo |
| Recuperar senha | não, é configuração |
| Confirmar cadastro | não, é configuração |
| Confirmar pedido | depois, junto com o pagamento |

As duas do meio são só um ajuste no painel do Supabase, e resolvem uma
pendência que está aberta desde 24/08: **hoje, se a Vivian esquecer a
senha, ela perde o acesso à própria loja.**

---

## 1. Criar a conta e verificar o domínio

Em [resend.com](https://resend.com), criar conta e adicionar o domínio
`feitoparavocepapelaria.com.br`.

O Resend mostra três registros de DNS. Eles entram no
[registro.br](https://registro.br), na mesma tela de onde saíram os nove
que já estão lá, na conta `MBMGC2`.

Sem isso o e-mail sai como remetente não verificado e cai em spam, que é
o mesmo que não sair.

A verificação leva de minutos a algumas horas.

---

## 2. Recuperar senha e confirmar cadastro

No painel do Supabase, em **Project Settings → Authentication → SMTP**:

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Porta | `465` |
| Usuário | `resend` |
| Senha | a chave da API do Resend |
| Remetente | `avisos@feitoparavocepapelaria.com.br` |

Feito isso, ligar de volta a **confirmação de e-mail** em
Authentication → Providers → Email. Ela está desligada desde 24/08
justamente porque, sem serviço de envio, a conta nascia travada esperando
um e-mail que nunca chegava.

E aproveitar a mesma tela para **desligar o cadastro público**: a Vivian
já é dona desde 24/08, e quem se cadastrar agora não vira nada, mas cria
conta na loja dela sem motivo.

---

## 3. O aviso de mensagem nova

Esta é a parte que tem código, e ela é a razão de o e-mail ser pedido à
cliente. Ver [a-conversa-dentro-da-loja.md](a-conversa-dentro-da-loja.md).

**a. Guardar os segredos no vault do Supabase**, no SQL Editor. O
`SEGREDO_DO_GATILHO` é inventado por você, qualquer texto longo, e serve
só para a função saber que quem chamou foi o nosso banco:

```sql
select vault.create_secret('re_sua_chave_do_resend', 'RESEND_API_KEY');
select vault.create_secret('um-texto-longo-qualquer', 'SEGREDO_DO_GATILHO');
select vault.create_secret(
  'https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/avisar-a-dona',
  'URL_DO_AVISO'
);
```

**b. Publicar a função:**

```
supabase functions deploy avisar-a-dona --project-ref kbvgdnrymwfavgkxqvjh
supabase secrets set RESEND_API_KEY=re_sua_chave
supabase secrets set SEGREDO_DO_GATILHO=o-mesmo-texto-longo
```

**c. Aplicar a migração**
[0009_avisar_a_dona.sql](../supabase/migracoes/0009_avisar_a_dona.sql) no
SQL Editor. Ela pode ser rodada duas vezes sem dar erro.

---

## As chaves nunca entram no repositório

Ele é público. A chave do Resend manda e-mail em nome do domínio dela: no
navegador, ou num arquivo daqui, qualquer pessoa a copiaria e mandaria
e-mail se passando pela loja.

Por isso ela vive em dois lugares, e só neles: os segredos da função e o
`vault` do Supabase. **O vault, e não uma tabela comum** — tabela sem
política de leitura ainda aparece inteira para quem tiver a chave de
serviço; o vault é cifrado em repouso.

Existe teste que varre os dois arquivos procurando chave escrita à mão.

---

## Se o aviso falhar, a mensagem não se perde

O gatilho não espera o Resend responder, e não derruba nada se o envio
falhar. Sem os segredos configurados, a conversa é salva do mesmo jeito e
o aviso simplesmente não sai.

Foi de propósito: a cliente não pode ver "não consegui enviar" por causa
de uma configuração nossa, e ir embora achando que a loja está quebrada.
O aviso é importante; a mensagem dela é mais.

---

## Conferir que funcionou

Abrir a loja, tocar em "Falar com a loja", mandar uma dúvida de teste. O
e-mail tem que chegar nas contas de **todas as donas**, não só na dela: a
Lilian resolve as coisas da loja junto.

Se não chegar, o caminho é este, nesta ordem:

1. domínio verificado no Resend?
2. os três segredos estão no vault, com esses nomes exatos?
3. a função foi publicada?
4. `select * from net._http_response order by created desc limit 5` no SQL
   Editor mostra o que o Supabase recebeu de volta.
