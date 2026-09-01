# A primeira compra de verdade

Conferido em 01/09/2026. A loja cobra em produção desde 01/09, e **ninguém
comprou nada ainda**. Hoje quem descobre se o caminho inteiro funciona é a
primeira cliente dela.

Este documento separa três coisas: o que já está provado sem cobrar
ninguém, o que só a compra responde, e o que ela precisa conferir depois
de comprar.

Registro meu. Não vira PDF.

---

## Por que credencial válida não é o mesmo que fluxo testado

O que está ligado hoje foi conferido pela função, e não pelo documento:

```
curl -s https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/conferir-pagamento
{"configurado":true,"ambiente":"producao","valido":true,
 "conta":207270182,"apelido":"VIVIANQUINTELLA","pais":"MLB"}
```

Isso prova que o Access Token é de produção e é da conta dela. Não prova
que uma compra passa. Em produção entram três coisas que em teste não
existem: cartão de verdade, antifraude de verdade, e o aviso do Mercado
Pago chegando de fora pela internet. Nenhuma das três rodou uma vez.

---

## O que já está provado, sem cobrar ninguém

Tudo aqui foi verificado em 01/09, contra o projeto de produção, sem criar
pedido nenhum no banco dela.

| O quê | Como foi provado | Resultado |
|---|---|---|
| O token é de produção | `conferir-pagamento` | `ambiente: producao` |
| O token é da conta dela | mesma chamada | `apelido: VIVIANQUINTELLA` |
| É a aplicação que ela criou em 25/08 | `conta: 207270182` bate com o User ID em [ligar-o-pagamento.md](ligar-o-pagamento.md) | confere |
| A chave pública é de produção | prefixo no bundle do site no ar | começa com `APP_USR-` |
| O webhook está publicado | POST vazio em `aviso-do-pagamento` | `{"ok":true,"ignorado":"sem id"}` |
| O webhook não acredita no aviso | POST com id de pagamento inventado | `"não consegui confirmar com o Mercado Pago"` |
| As regras de decisão | testes de unidade de `avisoDePagamento.ts` | verdes na bateria |
| O preço não vem do navegador | `cobrar` lê o total da tabela `pedidos` | por desenho, e testado |

A terceira linha vale um parágrafo. O `conta: 207270182` que a API do
Mercado Pago devolve é o mesmo número que está anotado como User ID da
aplicação que a Vivian criou. São dois caminhos independentes chegando no
mesmo número. É o mais perto de "o dinheiro cai na conta dela" que dá para
chegar sem mover dinheiro.

A sexta linha também. Mandar um aviso de pagamento inventado e receber
recusa prova, em produção, a regra que está no `CLAUDE.md`: **o aviso do
Mercado Pago não é a verdade**. Ele diz "vá perguntar sobre o pagamento
tal", e quem responde é a API deles.

### Sobre o aviso assinado

O `aviso-do-pagamento` **não confere a assinatura** do Mercado Pago, e
isso é decisão, não esquecimento. Ele ignora o que o aviso diz e vai
perguntar o estado do pagamento à API, com a chave dela. Uma assinatura
provaria que o aviso veio deles; perguntar de volta prova o mesmo e mais,
porque também pega aviso verdadeiro e desatualizado. A defesa é a pergunta
de volta, e não o cabeçalho.

---

## O que só a compra responde

| O quê | Por que nada aqui alcança | O que acontece se estiver errado |
|---|---|---|
| A chave pública e o token são do mesmo par | `conferir-pagamento` valida só o token | O cartão é tokenizado e a cobrança falha com "token inválido" na cara da cliente |
| O antifraude do Mercado Pago | Só existe com cartão real | Conta nova costuma ter a primeira compra barrada ou posta em análise |
| **O endereço do aviso está cadastrado no painel do Mercado Pago** | Só dá para ver no painel dela | **Este é o pior.** O pagamento aprova, o dinheiro entra, e o pedido fica "esperando o pagamento" para sempre |
| O e-mail sai no fluxo real | O Resend está ligado e testado, mas nunca disparou por uma compra de verdade | Ela não fica sabendo do pedido |
| O dinheiro cai na conta dela | Nenhuma consulta mostra isso | Só o extrato dela responde |

A linha do meio é a que eu mais temo. É uma falha **silenciosa**: nada dá
erro, nada fica vermelho, o CI continua verde. Se o endereço não estiver
cadastrado, o sintoma é um pedido pago aparecendo como não pago.

O endereço que precisa estar lá:

```
https://kbvgdnrymwfavgkxqvjh.supabase.co/functions/v1/aviso-do-pagamento
```

---

## A compra mais barata possível

O comentário dentro do `conferir-pagamento` supõe que a compra de teste
custa uns R$ 135, porque o mínimo do catálogo seria dez peças. **Não é
verdade para o catálogo todo.**

Oitenta produtos têm mínimo 1. Os mais baratos custam **R$ 28,00**, mais o
frete:

| Produto | Mínimo | Preço |
|---|---|---|
| Bloquinho Destacável (Professor, Medicina, Enfermagem, e outros) | 1 | R$ 28,00 |

Então a compra de teste é de R$ 28 mais frete, e não de R$ 135. Vale
escolher um desses.

---

## O roteiro

**Antes de ela comprar, eu confiro no painel do Mercado Pago dela** que o
endereço do aviso está cadastrado em Webhooks, no ambiente de produção.
Sem isso, a compra não testa a metade que importa.

Depois disso, o que ela faz:

1. Abre a loja como qualquer cliente, sem estar logada no painel.
2. Escolhe um Bloquinho Destacável, que tem mínimo 1.
3. Compra com o cartão dela, de verdade.
4. Escolhe o frete e finaliza.

### O que ela confere depois de comprar

| Onde | O que tem que aparecer | Quanto tempo |
|---|---|---|
| Na tela, ao terminar | "Pagamento confirmado" | na hora |
| No e-mail dela | o aviso do pedido novo | até uns minutos |
| Em `/admin` | o pedido na lista, com o número e o valor certo | na hora |
| Em `/admin`, no pedido | o estado **"Pagamento confirmado"**, e não "esperando" | até uns minutos |
| No app do Mercado Pago | o valor de R$ 28 mais frete, creditado | conforme o meio |

A quarta linha é a que testa o aviso. Se o pedido aparecer em `/admin` mas
ficar preso em "esperando o pagamento" enquanto o Mercado Pago mostra
aprovado, o endereço do webhook não está cadastrado, e é só isso. Conserto
em minutos, e é exatamente o que a compra existe para descobrir.

### Depois

Ela estorna pelo app do Mercado Pago. O estorno tem caminho de volta:
`refunded` e `charged_back` já estão mapeados em `aviso-do-pagamento` e
viram `estornado`. Então o estorno testa mais uma coisa de graça, e o
pedido em `/admin` tem que mudar sozinho para "Pagamento devolvido".

Depois disso eu apago o pedido de teste do banco, para ele não contar como
venda nos relatórios dela.

---

## A mensagem para ela

Sem travessão, como todo texto que ela lê.

> vivian, a loja já cobra de verdade.
>
> antes de sair divulgando, preciso que você faça uma compra de teste.
> uma só, e do jeito que uma cliente compraria.
>
> escolhe um bloquinho destacável, que pode comprar 1 unidade.
> são 28 reais mais o frete.
> paga com o seu cartão mesmo.
>
> depois me diz quatro coisas:
>
> 1. apareceu "pagamento confirmado" na tela?
> 2. chegou o e-mail avisando do pedido?
> 3. o pedido apareceu no seu painel, em /admin?
> 4. no painel, ele está como "pagamento confirmado" ou como "esperando o pagamento"?
>
> a quarta é a mais importante.
> se ficar preso em "esperando", me avisa que eu conserto no mesmo dia.
> é justamente por isso que a gente testa antes.
>
> quando terminar, você estorna pelo app do mercado pago e o dinheiro volta.
> eu apago o pedido de teste depois, para ele não contar como venda sua.

---

## A regra que vale aqui

**Máquina minha e CI não são cliente dela.** Nada nesta conferência criou
pedido no banco de produção: as chamadas de 01/09 foram todas de leitura,
ou de aviso sem id, que a função descarta. A compra de teste é a única
coisa que grava, e é de propósito, com ela sabendo e com o Maycon sabendo.

Onze pedidos falsos já entraram no banco dela em 25/08, por um teste de
navegação apontando para produção. Não se repete.
