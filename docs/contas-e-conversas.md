# Contas e conversas

Quem entra na loja, com o quê, e o que ainda falta construir.

Registro meu. Não vira PDF.

---

## O que já está de pé

O banco existe desde 21/08/2026, no projeto `loja`, em São Paulo. Sete
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

Os dados de teste foram apagados.

Desde 24/08 o banco não está mais vazio: guarda os **343 produtos** que
vieram da Elojinha, com peso, medidas e foto, e **140 temas**. Deles, 342
estão publicados e aparecem na loja.

Também desde 24/08, uma dona convida outra por e-mail. Fazia falta desde
que a Vivian avisou que a irmã, a Lilian, resolve as coisas da loja junto
com ela.

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

**Ligado em 25/08.** Ver [ligar-o-resend.md](ligar-o-resend.md).

**Depende de domínio verificado**, e o domínio já existe desde ontem:
`feitoparavocepapelaria.com.br`. A verificação são três registros de DNS,
no mesmo painel do registro.br onde a gente cadastrou os nove.

Em 25/08 o Maycon aprovou contratar. O código do nosso lado está pronto:
a função e o gatilho do aviso de mensagem nova existem e têm teste. O que
falta é criar a conta, verificar o domínio e guardar as chaves. Passo a
passo em [ligar-o-resend.md](ligar-o-resend.md).

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

### 2. ~~As telas de entrar e de criar conta~~ feito em 24/08

- ~~criar conta, entrar, sair~~
- ~~`/admin` trancado atrás da sessão **e** da `donas_da_loja`~~
- ~~uma dona convida outra, por e-mail~~
- ~~recuperar senha~~ feito em 25/08, com as telas de pedir o link e de
  escolher a senha nova
- **desligar o cadastro público**: assim que ela assumir a loja

A confirmação de e-mail está desligada no Supabase até o Resend existir.
Com ela ligada e sem serviço de envio, a conta nasce travada esperando um
e-mail que nunca chega.

### 3. O cadastro de produtos por ela

- ~~lista em tabela com busca, como ela usava no Elo7~~
- ~~publicar e despublicar, um a um ou o tipo inteiro~~
- ~~criar e editar~~ feito em 25/08, ver
  [ela-mexe-no-catalogo.md](ela-mexe-no-catalogo.md). Falta provar contra o
  banco de verdade, com uma conta de dona logada
- **subir foto**: falta a tela; as regras estão prontas em
  [fotoDoProduto.ts](../loja/src/dominio/fotoDoProduto.ts), com 14 testes.
  É o que ela vai sentir primeiro agora
- ~~reordenar a vitrine~~ feito em 27/08: ela fixa produto no topo,
  um a um ou o tipo inteiro. Fixar, e não arrastar: com 342 produtos, pôr
  um em primeiro seriam 341 arrastes no celular

Publicar em lote existe por causa dos números dela: são 58 Lousas Mágicas
iguais, variando só a arte. Uma a uma seriam 58 toques no celular.

### 4. ~~O chat dentro da loja~~ feito em 25/08

A Vivian aprovou o desenho, e ele está construído. Ver
[a-conversa-dentro-da-loja.md](a-conversa-dentro-da-loja.md).

**Falta aplicar a migração `0008` no Supabase**: sem ela, "falar com a
loja" falha, e só as perguntas de botão funcionam.

Falta também o aviso por e-mail, que depende do Resend, e ligar a conversa
ao pedido, que depende do item 1. O desenho combinado era este:

- **sem WhatsApp no meio.** A cliente conversa dentro do site, do início
  ao fim; a Vivian pediu isso explicitamente em 24/08.
- **botões prontos, não texto livre de IA.** A cliente clica em opções
  fixas (prazo de entrega, forma de pagamento, frete, "falar com a
  loja"), e a resposta de cada botão é escrita à mão, vinda do catálogo e
  das políticas dela. Zero geração de texto: elimina o risco que já
  estava registrado aqui, de um robô prometer prazo ou condição que ela
  não vai cumprir.
- **conversa por convidado, sem exigir conta.** Continua sem forçar
  cadastro pra comprar. O chat funciona por um identificador salvo no
  navegador (cookie), sem login.
- **nome e e-mail só pedidos na hora de escalar para humano.** Enquanto a
  dúvida é resolvida pelos botões, ninguém precisa se identificar. Só
  quando a cliente clica em "falar com a loja" é que o sistema pede nome
  e e-mail, antes de mandar a mensagem pro painel dela — assim, se ela
  não estiver online na hora, ainda dá pra responder depois por e-mail,
  em vez da conversa se perder.
- ela responde pelo painel; a cliente responde na loja.
- **não depende do item 1** ("dono do pedido"): como o chat de convidado
  não exige conta, essas duas pendências deixaram de estar amarradas uma
  à outra.

### 5. Medir visita e venda

Não existe, e trava o anúncio pago: sem saber quantos entram e quantos
compram, anunciar é apostar. Ver
[como-a-loja-ganha-visita.md](como-a-loja-ganha-visita.md).

### 6. Fora do escopo por ora

Busca na loja para quem compra. Os 37 produtos digitais do Projeto Educar,
que nunca foram para a Elojinha e por isso não estão na loja.
