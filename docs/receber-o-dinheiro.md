# Receber o dinheiro

Como a Vivian passa a receber pelas vendas, e por que não é igual ao Elo7.

Este documento é registro meu. **Não vira PDF e não vai para ela agora**:
enquanto o contrato não estiver respondido, nada de material novo. O que
ela precisa decidir está no formulário, em
[/perguntas](https://maycon-mb.github.io/vivian_shop/perguntas/), no grupo
"Receber o dinheiro".

---

## A diferença que ela ainda não sabe que existe

Ela contou que no Elo7 bastava informar os dados da conta do Bradesco e
pronto. Isso é verdade, e é a descrição exata de como funciona um
marketplace:

| No Elo7 | Na loja dela |
|---|---|
| Quem recebia da compradora era o **Elo7** | Quem recebe é **ela** |
| O Elo7 repassava para o Bradesco dela | O Mercado Pago deposita, e ela saca para o Bradesco |
| A conta bancária era o cadastro inteiro | A conta bancária é só o destino do saque |
| O Elo7 era o dono da relação com quem compra | Ela é |

Vender por conta própria significa virar quem recebe. Para isso é preciso
uma instituição de pagamento, que é o papel do Mercado Pago. Não é uma
escolha de conveniência: sem alguém licenciado no meio, não há como
processar cartão nem confirmar Pix automaticamente.

**A conta do Bradesco não entra em nenhum lugar do código.** Ela é
cadastrada dentro do Mercado Pago, e serve para o saque. Eu nunca preciso
ver número de conta, agência, chave Pix ou senha.

---

## O que ela ganha na troca

- **Pix cai na hora**, e não em D+30 como o repasse de marketplace
- **Comissão de 12% deixa de existir.** Sobra a taxa do meio de pagamento,
  que é 0% no Pix e cerca de 4% no cartão à vista
- Ela passa a ver **quem comprou**, coisa que o marketplace não entrega

E o que ela perde: o público que já estava lá dentro. Por isso a loja
nasce dependendo do Instagram e do WhatsApp dela, e não de busca.

---

## O que precisa ser decidido, e por quem

| Decisão | De quem | Onde está |
|---|---|---|
| Usar o Mercado Pago | dela | já respondido: pode |
| Conta para saque | dela | pergunta `pix` |
| A cliente sai da loja para pagar, ou não | dela | pergunta `checkout` |
| Aceitar cartão parcelado, e até quantas vezes | dela | pergunta `parcelas` |
| Desconto do Pix: 5%, 3% ou nenhum | dela | pergunta `descontopix` |
| Como o código conversa com o Mercado Pago | minha | depois das respostas |

### Por que a pergunta do checkout é dela, e não minha

As duas formas são igualmente seguras: o dinheiro cai no mesmo lugar, e em
nenhuma delas o número do cartão passa pelo meu código.

**Sair para o Mercado Pago** entrega uma tela que muita gente já conhece,
o que ajuda quem nunca comprou dela. É também o caminho mais curto para
abrir.

**Pagar dentro da loja** mantém a experiência inteira com a cara dela, do
carrinho até o "obrigada". Custa mais trabalho.

Isso é identidade de marca contra tempo de abertura. Quem responde isso é
a dona da marca.

---

## O que ainda não dá para fazer

Pagamento de verdade depende dos pedidos estarem num banco, e hoje o
pedido fica guardado no navegador de quem comprou
([pedidosLocais.ts](../loja/src/servicos/pedidosLocais.ts)). Quando o
Mercado Pago avisar "esta compra foi paga", precisa existir um lugar para
marcar isso. Então a ordem é:

1. Supabase de pé, com os pedidos
2. Um pedaço de servidor que guarde a chave secreta e receba o aviso de
   pagamento
3. O Mercado Pago entrando como outra implementação de
   `ServicoDePagamento`, sem tela nenhuma mudar

A chave secreta **não pode ficar no site**: o site é estático, e todo o
código que vai para o navegador é público. Essa é a razão técnica de o
Supabase vir antes, e não preferência minha.

Dá para construir e testar tudo isso **sem ela**, com as credenciais de
teste do Mercado Pago: cartão de teste, Pix de teste, dinheiro falso.
Quando a conta dela existir, trocam-se duas chaves.

---

## Quando chegar a hora: o que peço, e o que nunca peço

**Peço:** as duas credenciais da conta dela no Mercado Pago, geradas por
ela, revogáveis por ela a qualquer momento.

**Nunca peço:** senha do Mercado Pago, senha do banco, número da conta,
chave Pix, foto do cartão. Nada disso é necessário, e pedir é o começo de
um vazamento. O formulário diz isso na própria pergunta.
