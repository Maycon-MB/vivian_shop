-- As configurações da loja: o que era maquete na aba de Configurações.
--
-- A tela existia desde o começo, com os campos preenchidos e um botão de
-- salvar. Só que não salvava nada: ela digitava, saía da aba e voltava, e
-- estava tudo como antes. Isso é pior do que não ter a tela, porque ela
-- não tinha como desconfiar.
--
-- O que fica aqui é decisão de negócio, e não de programa: o nome que a
-- loja mostra, a frase da vitrine, por onde falam com ela, de onde o
-- pacote sai, quantas peças no mínimo e em quantos dias ela costuma
-- entregar. Mesma razão da `0010_como_ela_recebe.sql`: ela muda quando
-- precisar, sem depender de mim estar disponível.
--
-- ── Uma linha só ──────────────────────────────────────────────────────
--
-- Igual à tabela de pagamento. O `check (id)` é o que garante: sem ele um
-- segundo registro criaria duas verdades, e a loja mostraria uma coisa
-- enquanto o painel salvaria em outra.
--
-- ── Não existe campo de WhatsApp aqui, e é de propósito ────────────────
--
-- A `0008_conversa_na_loja.sql` decidiu em 25/08 que a conversa com a
-- cliente acontece dentro da loja, e a loja inteira foi construída em
-- cima disso: a cliente escreve na página do produto, a conversa nasce
-- colada ao pedido, e a Vivian é avisada por e-mail. Um campo de WhatsApp
-- não teria destino nenhum: nenhuma parte do sistema manda mensagem por
-- lá. Guardar o número só serviria para a tela dela prometer um canal que
-- não existe, que foi exatamente o defeito corrigido em 04/09 no aviso de
-- pedido novo.
--
-- ── Nada de secreto entra aqui ────────────────────────────────────────
--
-- A leitura é pública, porque tudo nesta tabela é o que a loja anuncia:
-- rodapé, contato, prazo e mínimo aparecem antes de qualquer login. Quem
-- for acrescentar coluna depois precisa lembrar disso. Token, chave e
-- senha não moram aqui; moram nas variáveis da função.

create table if not exists configuracoes_da_loja (
  -- Uma linha só. O `check` é o que impede a segunda.
  id boolean primary key default true check (id),

  -- O que a cliente lê na aba do navegador e no rodapé.
  nome_da_loja text not null default 'Feito para você! Personalizados',
  frase_da_loja text not null
    default 'Papelaria personalizada e material pedagógico para quem ensina.',

  -- Por onde falam com ela fora da loja. A conversa mesmo é lá dentro.
  email_de_contato text,

  /* De onde o pacote sai. O `cotar-frete` lê o CEP daqui, e cai para a
     variável da função se ela apagar o campo sem querer: frete que para
     de calcular derruba a venda na única tela em que a cliente ainda
     desiste. */
  cep_de_origem text,
  cidade_de_origem text,
  endereco_de_origem text,

  -- Quantas peças no mínimo por pedido, quando o produto não disser outra.
  minimo_padrao integer not null default 10 check (minimo_padrao >= 1),

  /* Em quantos dias ela costuma produzir. Zero é entrega no mesmo dia; o
     `check` existe porque prazo negativo prometeria entrega ontem, e
     passa por um dedo errado na tela dela. */
  prazo_padrao integer not null default 5 check (prazo_padrao >= 0),

  atualizado_em timestamptz not null default now()
);

comment on table configuracoes_da_loja is
  'As configurações da loja. Uma linha só, editada por ela no painel.';

/* A linha já nasce aqui. Sem ela, o primeiro `update` do painel não acha o
   que atualizar, não devolve erro, e a Vivian conclui de novo que salvar
   não funciona. */
insert into configuracoes_da_loja (id) values (true)
on conflict (id) do nothing;

-- ── Quem pode ler e escrever ────────────────────────────────────────────
--
-- Leitura é pública, e precisa ser: o nome da loja, a frase e o contato
-- aparecem na página antes de qualquer login, e o checkout usa o prazo.
--
-- Escrita é só dela. Com a chave anônima que vai dentro da página,
-- qualquer um trocaria o nome da loja ou o CEP de onde o pacote sai, e o
-- primeiro a descobrir seria quem estivesse comprando.

alter table configuracoes_da_loja enable row level security;

/* Leitura só da dona, e não pública como na 0010.
 *
 * A tabela de pagamento da 0010 é lida pela vitrine, porque a compradora
 * precisa ver parcelas, juros e desconto antes de comprar. Esta aqui
 * guarda outra coisa: `cep_de_origem` e `endereco_de_origem` são o
 * endereço da casa dela.
 *
 * A chave anônima vai dentro da página e qualquer um a copia em dez
 * segundos. Com `using (true)`, o endereço da casa dela sairia por uma
 * chamada de uma linha, para qualquer pessoa que abrisse a loja.
 *
 * Este projeto já pagou esse preço uma vez: a branch `gh-pages` guardava
 * builds antigos com o CEP da casa dela compilado dentro do JavaScript, e
 * o site atual já estava limpo enquanto o histórico continuava servindo o
 * dado.
 *
 * Ninguém além dela precisa ler isto no navegador: o nome e a frase da
 * loja são resolvidos no build, e o `cotar-frete` lê o CEP pelo servidor,
 * com a chave de serviço, que ignora RLS. */
drop policy if exists "qualquer um vê os dados da loja" on configuracoes_da_loja;

drop policy if exists "só a dona vê os dados da loja" on configuracoes_da_loja;
create policy "só a dona vê os dados da loja"
  on configuracoes_da_loja for select
  to authenticated
  using (e_dona_da_loja());

drop policy if exists "só a dona muda os dados da loja" on configuracoes_da_loja;
create policy "só a dona muda os dados da loja"
  on configuracoes_da_loja for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

/* Sem insert e sem delete de propósito, como na tabela de pagamento: a
   linha já existe e é uma só. Poder criar outra é poder criar uma segunda
   verdade. */
