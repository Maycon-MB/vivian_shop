# Contas e conversas

Quem entra na loja, com o quê, e o que ainda falta construir.

Registro meu. Não vira PDF.

---

## O que já está de pé

O banco existe desde 21/08/2026, no projeto `loja`, em São Paulo. Quatro
migrações aplicadas e conferidas contra o banco de verdade, não no papel:

| Teste | Resultado |
|---|---|
| Chave pública lendo pedido com nome e endereço | `[]` |
| Chave pública gravando produto | recusado, `42501` |
| Chave pública lendo produto ativo | vê |
| Chave pública lendo produto rascunho | não vê |
| Conta autenticada **sem** permissão lendo pedido | `[]` |
| Conta autenticada **sem** permissão cadastrando | recusado, `42501` |
| Primeira conta criada | virou dona automaticamente |
| Segunda conta criada | não virou nada |

O último par é o que sustenta o resto: **não é o login que dá poder**. É
estar na tabela `donas_da_loja`. Quem criar conta amanhã continua sem ver
pedido de ninguém.

Os dados de teste foram apagados. O banco está vazio, esperando ela.

---

## A decisão sobre a conta de quem compra

**Decidido em 21/08 pelo Maycon: conta com e-mail e senha, para quem
compra e para quem administra.**

Eu havia proposto duas coisas diferentes, e as duas foram recusadas. Fica
registrado porque decisão sem o motivo vira discussão de novo daqui a três
meses.

**Primeiro eu propus não ter conta de comprador.** O argumento era que
e-mail mais número de pedido bastam para acompanhar, e que conta é mais
uma senha para esquecer e mais um lugar para vazar dado. O Maycon apontou
o furo, e ele tem razão: **chat sem conta não existe**. A conversa precisa
saber com quem está falando na semana que vem, e "quem tem o link" não é
identidade.

**Depois eu propus conta sem senha**, com código de seis dígitos por
e-mail. O raciocínio: a cliente dela compra uma vez a cada seis meses,
para a festa da filha, e ninguém lembra de senha nesse intervalo — mas
todo mundo acessa o próprio e-mail. Senha que ninguém lembra vira senha
repetida de outro site, que é o que vaza.

**O Maycon preferiu senha**, e é o que vale. A escolha tem defesas
próprias: é o que a maioria das pessoas espera de uma loja, funciona sem
depender de o e-mail chegar na hora, e não deixa a compra refém de caixa
de spam.

O que essa escolha obriga, e que precisa existir junto:

- **"Esqueci minha senha" desde o primeiro dia.** Com senha, isso deixa de
  ser conveniência e vira caminho principal para quem volta depois de
  meses.
- **Senha nunca chega ao nosso código.** Quem guarda é o Supabase Auth,
  com hash. Nem eu nem ela veem.
- **Mínimo de tamanho, e nada de regra de símbolo.** Exigir maiúscula,
  número e símbolo produz senha anotada em papel.

---

## O envio de e-mail: Resend

**Decidido: Resend.** O e-mail embutido do Supabase é limitado a poucos
por hora e existe para teste, não para produção. Com senha, ele ainda é
necessário para confirmar cadastro e recuperar senha; sem isso, quem
esquecer a senha perde o acesso à própria conta.

É o mesmo item que já está pendente na Etapa B do contrato, "contratação
de serviço de e-mail". Não é custo novo.

Plano gratuito: 3.000 e-mails por mês, 100 por dia. Para o volume dela é
folgado, e cobre confirmação de cadastro, recuperação de senha,
confirmação de pedido e entrega do material digital.

**Depende de domínio verificado**, e o domínio já existe desde ontem:
`feitoparavocepapelaria.com.br`. A verificação são três registros de DNS,
no mesmo painel do registro.br onde a gente cadastrou os nove.

---

## O que falta construir

Na ordem em que uma coisa destrava a outra.

### 1. Dono do pedido, no banco

`pedidos` precisa saber de quem é, para a política conseguir responder
"este pedido é seu". Hoje qualquer conta autenticada que não seja a dona
vê `[]`, inclusive quem comprou.

- coluna do comprador em `pedidos`
- política de leitura: quem compra lê o próprio, a dona lê todos
- o pedido nasce ligado à conta na hora da compra

### 2. As telas de entrar e de criar conta

Hoje `/entrar` é maquete: não tem senha, não tem sessão, e quem digitar
`/painel` entra. Precisa de:

- criar conta, entrar, sair
- recuperar senha
- `/painel` trancado atrás da sessão **e** da `donas_da_loja`
- desligar o cadastro público assim que ela assumir a loja

### 3. O cadastro de produtos por ela

- lista em tabela com busca, como ela usava no Elo7
- criar, editar, publicar e despublicar
- subir foto, com redução no navegador antes de enviar
  ([fotoDoProduto.ts](../loja/src/dominio/fotoDoProduto.ts), 14 testes)
- reordenar a vitrine

### 4. O chat dentro da loja

- conversa por cliente, mensagem por conversa
- ela responde pelo painel; a cliente responde na loja
- resposta parcial por IA, e é aqui que mora o risco: **uma IA que
  responde prazo, preço ou política cria obrigação para ela**. Se o robô
  disser "chega em 3 dias" e chegar em 8, quem responde é a Vivian. Então
  a IA só responde a partir do catálogo e das políticas dela, e o que sair
  disso vira "vou chamar a dona da loja".

### 5. Fora do escopo por ora

Busca na loja para quem compra, e o "Minhas vendas" apontando para o
painel de verdade. Dependem das telas de sessão existirem.
