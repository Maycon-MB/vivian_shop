# Ligar o Melhor Envio

O que falta para o frete deixar de ser estimativa. O código está pronto e
no ar desde 31/08; o que resta é criar o aplicativo e a Vivian autorizar.

---

## Por que não é "ela te manda um código"

Eu disse isso a ela em 28/08, e estava errado.

O Melhor Envio integra por OAuth: existe um **aplicativo**, cadastrado uma
vez por quem programa, e cada lojista **autoriza** esse aplicativo a agir
na conta dele. O que a loja guarda é um token de 30 dias que se renova
sozinho.

Os campos do cadastro são de desenvolvedor: URL de callback, e-mail
técnico, ambiente de testes. Pedir isso a ela seria mandar a mesma pessoa
que perguntou "onde vejo isso?" no Mercado Pago preencher um formulário
que não é dela.

**Por isso o aplicativo fica na conta do Maycon.** O segredo fica comigo,
e ela dá um clique.

---

## O que ela consegue fazer com isso

Cotar frete em Correios, Jadlog, Loggi e as outras, com o preço de
contrato do Melhor Envio, que é menor que o balcão. E imprimir etiqueta
em casa.

> **Quem tem o token compra etiqueta e gasta o saldo da conta dela.** É
> por isso que ele não fica no repositório, não fica numa tabela com
> leitura pública, e não passa pelo navegador. Ver
> [0017_credencial_do_frete.sql](../supabase/migracoes/0017_credencial_do_frete.sql).

---

## Passo 1: criar o aplicativo

Em [melhorenvio.com.br](https://melhorenvio.com.br), com a **sua** conta:
**Integrações → Área Dev. → Cadastrar aplicativo**.

| Campo | O que pôr |
|---|---|
| Nome do aplicativo | Loja Feito para Você |
| Site da plataforma | `https://feitoparavocepapelaria.com.br` |
| E-mail de contato | o seu |
| E-mail técnico | o seu |
| URL do ambiente de testes | `https://feitoparavocepapelaria.com.br` |
| **URL de redirecionamento** | `https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/frete-retorno` |
| Descrição | Loja própria de papelaria personalizada |

**A URL de redirecionamento tem que ser idêntica**, caractere por
caractere, à que vai na variável `MELHORENVIO_REDIRECT`. Eles comparam
como texto, e um `/` a mais recusa a autorização com uma mensagem que não
diz isso.

Escopos: `shipping-calculate` e `shipping-companies`. Comprar etiqueta
pela loja não está construído, e pedir permissão que não se usa é pedir a
mais. Trocar escopo depois exige nova autorização dela, então vale conferir
agora.

No fim aparecem **Client ID** e **Secret**.

---

## Passo 2: guardar os segredos

Nas variáveis das funções do Supabase, e em lugar nenhum além disso:

```
MELHORENVIO_CLIENT_ID       o Client ID
MELHORENVIO_CLIENT_SECRET   o Secret
MELHORENVIO_REDIRECT        https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/frete-retorno
MELHORENVIO_STATE           uma palavra sorteada, só sua
MELHORENVIO_CEP_ORIGEM      o CEP de onde ela posta
MELHORENVIO_BASE            https://melhorenvio.com.br
```

E um segredo no vault do banco, para a rotina semanal alcançar a função:

```
URL_DE_COTAR_FRETE = https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/cotar-frete
```

O `MELHORENVIO_STATE` é o que impede um estranho de plantar o token da
conta dele no lugar do dela. É sorteado por você, vai no link, e a função
confere na volta.

O `MELHORENVIO_CEP_ORIGEM` é o endereço da casa dela, e é por isso que
está aqui e não numa tabela.

Para testar antes, `MELHORENVIO_BASE` aponta para
`https://sandbox.melhorenvio.com.br`. Os dois ambientes são separados: a
conta do sandbox não é a mesma, e as credenciais não valem entre eles.

---

## Passo 3: aplicar a migração e subir as funções

```
supabase/migracoes/0017_credencial_do_frete.sql   no SQL Editor
supabase/funcoes/frete-retorno                    deploy
supabase/funcoes/cotar-frete                      deploy
```

---

## Passo 4: mandar o link para ela

Trocando `SEU_CLIENT_ID` e `SEU_STATE`:

```
https://melhorenvio.com.br/oauth/authorize
  ?client_id=SEU_CLIENT_ID
  &redirect_uri=https%3A%2F%2Fkbvgdnrymwfavgkxqvjh.supabase.co%2Ffunctions%2Fv1%2Ffrete-retorno
  &response_type=code
  &state=SEU_STATE
  &scope=shipping-calculate shipping-companies
```

Ela abre, entra com a conta dela, clica em autorizar, e cai numa página
dizendo que deu certo. É o único passo dela, e é um clique.

---

## Passo 5: ligar a bandeira

Na variável do GitHub:

```
NEXT_PUBLIC_MELHORENVIO_ATIVO = true
```

O `git push` seguinte publica com o frete de verdade, e o aviso de "valor
estimado" some sozinho.

---

## O que acontece quando a cotação falha

**A loja volta para a estimativa e continua vendendo.**

A cotação acontece no checkout, que é a última tela em que a cliente ainda
pode desistir. "Não consegui calcular o frete" ali custa a venda, e o
motivo nunca é culpa dela: pode ser a autorização vencida, a API deles
fora do ar, ou a internet do celular.

O preço dessa escolha é que a falha não aparece na tela de ninguém. Ela
aparece no registro da função `cotar-frete`, e é lá que se olha quando o
frete parecer estranho.

O token se renova sozinho um dia antes de vencer. Se a renovação falhar, a
função usa o token velho enquanto ele ainda valer, em vez de parar de
cotar na hora.

---

## O prazo que mata a integração em silêncio

O `access_token` vale **30 dias** e o `refresh_token` vale **45**.

A renovação acontece quando alguém cota um frete. Numa loja que acabou de
abrir, é perfeitamente possível passar 45 dias sem uma única cotação: aí o
`refresh_token` vence junto, e a única saída é ela autorizar de novo.

Ninguém perceberia. O frete voltaria a ser estimativa, a loja continuaria
vendendo, e a diferença sairia do bolso dela até alguém reparar.

Por isso existe o `manter-o-frete-vivo` na migração 0017: uma vez por
semana ele pede uma cotação de mentira, o que renova o token e, de quebra,
prova que a integração ainda funciona. Sete dias de folga contra
quarenta e cinco de prazo.
