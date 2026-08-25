# A conversa dentro da loja

O botão de WhatsApp saiu. No lugar dele, a cliente conversa dentro do
site, do início ao fim.

A Vivian pediu isso em 24/08 e aprovou o desenho em 25/08.

Registro meu. Não vira PDF.

---

## O que ela queria resolver

No WhatsApp a pergunta "qual o prazo?" chega solta. Não diz de quem é, nem
de qual pedido, e cai no meio da conversa pessoal dela. Ela responde a
mesma coisa dez vezes por semana e ainda assim perde alguma.

E havia um detalhe que só apareceu ao mexer no código: **o número do
WhatsApp da loja era de exemplo**, `5521900000000`. Estava em sete telas,
inclusive na página de endereço não encontrado, onde o comentário dizia
que aquele era o caminho principal. Quem clicava caía numa conversa com
ninguém.

---

## O desenho, e o que cada escolha evita

**Botão, e não campo de texto livre.** A cliente escolhe entre perguntas
prontas, e cada resposta foi escrita à mão a partir do catálogo e das
políticas dela. Nada é gerado.

Isso não é economia de esforço, é o que permite a coisa existir. Um robô
que escreve sozinho acaba prometendo prazo, desconto ou condição que ela
não vai cumprir, e quem fica com a promessa na mão é ela, sozinha, na
frente de uma cliente com razão.

O preço é que a lista é curta e alguém sempre vai querer algo fora dela.
Para esse alguém existe "falar com a loja".

**Ninguém se identifica para perguntar o prazo.** Nome e e-mail só são
pedidos quando a cliente toca em "falar com a loja", e a tela diz por quê:
a resposta chega por e-mail. Pedir dado sem dizer para quê é o que faz a
pessoa desistir ali.

**A saída para um humano fica sempre visível.** A hora em que a cliente
cansa dos botões é imprevisível, e escondê-la atrás de "não achei minha
resposta" é como se perde a venda.

**Os números vêm de `regras.ts`.** O prazo de cinco dias e o mínimo de dez
não estão digitados nas frases: se ela mudar de ideia, muda num lugar e a
conversa acompanha. Existe teste para isso, porque uma resposta prometendo
o prazo antigo é pior do que resposta nenhuma.

---

## A parte difícil: quem compra não tem conta

Ficou decidido que ninguém é obrigado a se cadastrar para perguntar. Sem
conta não existe `auth.uid()`, e sem ele a política do Postgres não tem
como dizer "esta conversa é sua".

A saída é uma chave por conversa, sorteada pelo banco, que vive só no
navegador de quem abriu.

**E aqui está o que precisa estar certo: filtrar pelo token na consulta
não protege nada.** Se a política de leitura fosse permissiva, qualquer
pessoa com a chave anônima, que vai dentro da página e se copia em dez
segundos, trocaria o filtro e leria as conversas de todo mundo, com nome e
e-mail dentro.

Por isso as duas tabelas são **fechadas** para quem não é dona, e o acesso
de quem compra passa por quatro funções `security definer`, cada uma com
`set search_path = ''`. A função recebe a chave, confere ela mesma, e
devolve só aquela conversa. Não há consulta direta a fazer.

| Função | Quem chama | O que faz |
|---|---|---|
| `abrir_conversa` | quem compra | cria a conversa e devolve a chave |
| `ler_conversa` | quem compra | as mensagens daquela conversa |
| `enviar_mensagem` | quem compra | grava a fala da cliente |
| `falar_com_a_loja` | quem compra | pede resposta humana, com nome e e-mail |

Três coisas de defesa que valem o registro:

- **Chave que não existe e conversa vazia dão a mesma resposta.** Dizer
  "essa conversa não existe" ensina quem está adivinhando que está perto.
- **Teto de 50 mensagens por conversa.** Sem isso, um laço automático
  enche a tabela e a conta do banco dela sobe sozinha até a fatura chegar.
- **Sem política de `insert` para quem compra.** Se alguém acrescentar uma
  ali um dia, a chave anônima passa a escrever conversa em nome de quem
  quiser.

Se a cliente limpar o navegador ou trocar de aparelho, a conversa fica
para trás e uma nova começa. Sem conta não há como ligar as duas, e
inventar essa ligação seria exatamente o que o cadastro obrigatório existe
para fazer.

---

## O lado dela

Só as conversas escaladas aparecem no painel. As que os botões resolveram
não entram: caixa de entrada cheia de conversa resolvida é caixa que ela
para de abrir, e aí a que importava passa batida.

Quem ainda espera vem primeiro, e não a mais recente. A dúvida antes da
compra tem validade curta: a cliente está montando a festa hoje.

---

## O que falta

**O aviso por e-mail.** Hoje a resposta dela aparece na loja quando a
cliente voltar, e a tela do painel diz isso com todas as letras para ela
não achar que a cliente foi avisada. O e-mail entra com o Resend, que já
está na fila em [contas-e-conversas.md](contas-e-conversas.md).

**Ligar a conversa ao pedido.** Era metade do que ela reclamou do
WhatsApp. Depende do item "dono do pedido", que continua pendente.

---

## Antes de publicar: a migração

O código chama funções que só existem depois de a migração `0008` ser
aplicada. **Enquanto ela não for, "falar com a loja" falha** e as
perguntas de botão continuam funcionando.

Aplicar é colar
[0008_conversa_na_loja.sql](../supabase/migracoes/0008_conversa_na_loja.sql)
no SQL Editor do Supabase.

Depois, para conferir que a porta está fechada de verdade:

```sql
-- Deve devolver zero linhas: a chave anônima não lê conversa nenhuma.
set role anon;
select count(*) from conversas;
reset role;
```
