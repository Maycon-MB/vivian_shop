# Ligar o pagamento

Decidido em 25/08: **Mercado Pago com Checkout Bricks**, dentro da loja.

É o item que trava tudo. Enquanto ele não existir, a loja é vitrine: as
342 páginas, as 13 avaliações e o chat existem para levar a pessoa a um
botão que ainda não cobra ninguém.

Registro meu. Não vira PDF.

---

## Dentro da loja, e não redirecionando

O Maycon pediu em 25/08 que o pagamento acontecesse na própria loja, e não
mandando a cliente para o site do Mercado Pago. Tem razão: redirecionar
para outra marca no momento de pagar é onde a compra se perde.

**Checkout Bricks** faz isso. O SDK do Mercado Pago desenha os campos do
cartão dentro da nossa página, com a fonte e a cor da loja. O Pix aparece
com QR code na mesma tela.

### O detalhe que não é escolha de estilo

Os campos do cartão são iframes do Mercado Pago, e não `input` nossos.

Se eu desenhasse um campo de número de cartão, o dado passaria pelo nosso
código, e a loja dela entraria em **PCI-DSS**: auditoria, certificação e
responsabilidade legal. Para uma loja de lembrancinha isso é inviável, e o
risco ficaria no CPF dela.

Com Bricks, o número vai do navegador da cliente direto para o Mercado
Pago e volta como um token. Visualmente fica dentro da loja; tecnicamente
o cartão nunca toca em nada nosso.

---

## O que já está feito

**A aplicação existe.** A Vivian criou em 25/08, no painel de
desenvolvedor da conta dela:

| | |
|---|---|
| Nome | Loja Feito para voce |
| Integração | **CheckoutBricks** |
| User ID | 207270182 |
| Número da aplicação | 5857105788383796 |

Esses dois números são identificadores, e não segredo.

**A tela "Como eu recebo" existe**, no painel dela. Parcelas, quem paga os
juros, desconto no Pix e quais formas aceitar são decisões dela, editáveis
sem passar por mim. Ver
[a migração 0010](../supabase/migracoes/0010_como_ela_recebe.sql).

---

## O que falta

**As credenciais de produção**, que só saem de dentro da conta dela:

> Aplicação → menu lateral → **Credenciais de produção**

São duas, e elas não são iguais:

| | Onde vive | Pode ir por mensagem? |
|---|---|---|
| **Public Key** (`APP_USR-...`) | dentro da página | sim, é pública |
| **Access Token** | só no servidor | **não** |

**O Access Token é a chave do dinheiro dela.** Quem o tem movimenta a
conta. Ele vai para os segredos da Edge Function e nunca para o
repositório, que é público.

O certo é ela colar direto, com o Maycon guiando por telefone. Se vier por
WhatsApp, funciona, mas fica no aparelho dela, no dele e nos dois backups,
e aí ela precisa gerar outro depois.

**Não precisamos da agência e conta dela.** Isso é onde o Mercado Pago
deposita, e ela configura lá dentro. Se esses dados estiverem em alguma
conversa, vale apagar: não servem para nada aqui.

---

## O que vem depois das credenciais

Duas Edge Functions, pelo mesmo motivo do aviso de mensagem: o token não
pode ir ao navegador.

| Função | O que faz |
|---|---|
| `cobrar` | recebe o token do cartão e cria o pagamento |
| `aviso-do-pagamento` | recebe o retorno do MP e marca o pedido |

**O aviso do Mercado Pago não é a verdade.** Ele diz "vá perguntar sobre o
pagamento tal"; quem responde é a API deles, e o que volta ainda passa
pelas regras de
[avisoDePagamento.ts](../loja/src/dominio/avisoDePagamento.ts), que já
existem e têm teste.

---

## O checklist de 6 etapas do Mercado Pago

O painel dela mostra "Etapa 1 de 6" e um aviso de "você não passou".

**Não trava nada.** É o checklist de qualidade deles, que melhora a taxa
de aprovação de cartão: enviar dados do comprador, device fingerprint,
tratar erro direito. A gente cumpre naturalmente ao integrar.

Fica para depois de funcionar, e não antes.
