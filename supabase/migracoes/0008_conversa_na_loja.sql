-- A conversa acontece dentro da loja, e não no WhatsApp.
--
-- A Vivian pediu isso em 24/08 e aprovou o desenho em 25/08. O que ela
-- quer resolver é real: no WhatsApp a pergunta "qual o prazo?" chega solta,
-- sem dizer de quem é nem de qual pedido, e ela procura no meio de conversa
-- pessoal. Aqui a conversa nasce colada à loja.
--
-- Rodar duas vezes não dá erro: tudo aqui é `if not exists` ou
-- `create or replace`. A primeira versão não era assim, e a segunda
-- execução parava em `relation "conversas" already exists` no meio,
-- deixando dúvida sobre o que tinha sido aplicado e o que não.
--
-- ── O problema difícil: quem compra não tem conta ──────────────────────
--
-- Ficou decidido que ninguém é obrigado a se cadastrar para perguntar. Só
-- que sem conta não existe `auth.uid()`, e sem `auth.uid()` a política do
-- Postgres não tem como dizer "esta conversa é sua".
--
-- A saída é uma chave de acesso por conversa: um `token` sorteado, que só
-- existe no navegador de quem abriu a conversa. Quem tem o token lê aquela
-- conversa; quem não tem não lê nenhuma.
--
-- E aqui está a parte que precisa estar certa: **filtrar pelo token na
-- consulta não protege nada.** Se a política de leitura fosse permissiva,
-- qualquer pessoa com a chave anônima -- que vai dentro da página e se
-- copia em dez segundos -- trocaria o filtro e leria as conversas de todo
-- mundo, com nome e e-mail dentro.
--
-- Por isso as duas tabelas são fechadas para quem não é dona, e o acesso
-- de quem compra passa só pelas funções abaixo. A função recebe o token,
-- confere ela mesma, e devolve apenas aquela conversa. Não há consulta
-- direta a fazer.

create table if not exists conversas (
  id uuid primary key default gen_random_uuid(),

  -- A chave de acesso de quem abriu a conversa. Vive no navegador dela,
  -- e é a única prova de que a conversa é sua.
  token uuid not null unique default gen_random_uuid(),

  -- Só preenchidos quando ela pede para falar com a loja. Enquanto os
  -- botões resolvem, ninguém precisa se identificar.
  nome text,
  email text,

  -- Verdadeiro quando a cliente pediu resposta humana. É o que faz a
  -- conversa aparecer no painel: as outras se resolveram sozinhas e não
  -- precisam da atenção dela.
  escalada boolean not null default false,

  -- Quando a dona respondeu pela última vez. Nulo enquanto não respondeu.
  respondida_em timestamptz,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table conversas is 'Uma conversa de quem compra, dentro da loja. Sem conta: quem tem o token é dona dela.';
comment on column conversas.token is 'Chave de acesso. Quem a tem lê a conversa; ela nunca sai do navegador de quem abriu.';
comment on column conversas.escalada is 'A cliente pediu para falar com a loja. Só estas aparecem no painel.';

create index if not exists conversas_para_o_painel on conversas (atualizado_em desc) where escalada;

create table if not exists mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references conversas (id) on delete cascade,

  quem text not null check (quem in ('cliente', 'loja')),

  -- 2000 é generoso para uma dúvida sobre lembrancinha e curto o
  -- suficiente para o campo não virar depósito de texto colado.
  texto text not null check (length(texto) between 1 and 2000),

  criado_em timestamptz not null default now()
);

comment on table mensagens is 'As falas de uma conversa. "loja" é a Vivian respondendo pelo painel.';

create index if not exists mensagens_da_conversa on mensagens (conversa_id, criado_em);

-- ── Quem pode ler ───────────────────────────────────────────────────────
--
-- Ninguém, por fora. Nem a chave anônima nem uma conta autenticada
-- qualquer: as conversas guardam nome e e-mail de clientes dela.

alter table conversas enable row level security;
alter table mensagens enable row level security;

drop policy if exists "só a dona lê as conversas" on conversas;
create policy "só a dona lê as conversas"
  on conversas for select
  to authenticated
  using (e_dona_da_loja());

drop policy if exists "só a dona lê as mensagens" on mensagens;
create policy "só a dona lê as mensagens"
  on mensagens for select
  to authenticated
  using (e_dona_da_loja());

drop policy if exists "a dona responde" on mensagens;
create policy "a dona responde"
  on mensagens for insert
  to authenticated
  with check (e_dona_da_loja() and quem = 'loja');

drop policy if exists "a dona marca a conversa" on conversas;
create policy "a dona marca a conversa"
  on conversas for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

/* Sem política de insert para quem compra, e sem select.

   Não é esquecimento: é o desenho. Quem compra não fala com a tabela,
   fala com as funções abaixo. Se um dia alguém acrescentar aqui um
   "qualquer um insere", a chave anônima passa a escrever conversa em nome
   de quem quiser. */

-- ── O que quem compra pode fazer ────────────────────────────────────────
--
-- Estas funções rodam com poder da dona (`security definer`) e por isso
-- cada uma confere sozinha o que pode. `set search_path = ''` é
-- obrigatório: sem isso, quem chamar a função pode apontar `mensagens`
-- para uma tabela dele e fazer a função escrever no lugar errado.

create or replace function abrir_conversa()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo uuid;
begin
  insert into public.conversas default values returning token into novo;
  return novo;
end;
$$;

comment on function abrir_conversa is 'Cria uma conversa e devolve a chave de acesso dela.';

create or replace function ler_conversa(p_token uuid)
returns table (quem text, texto text, criado_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    select m.quem, m.texto, m.criado_em
    from public.mensagens m
    join public.conversas c on c.id = m.conversa_id
    where c.token = p_token
    order by m.criado_em;
end;
$$;

comment on function ler_conversa is 'As mensagens de uma conversa, para quem tem a chave dela.';

create or replace function enviar_mensagem(p_token uuid, p_texto text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid;
  quantas integer;
begin
  select id into alvo from public.conversas where token = p_token;

  -- Token que não existe não recebe resposta diferente de token que
  -- existe e está vazio: dizer "essa conversa não existe" ensina quem
  -- está tentando adivinhar token que está perto.
  if alvo is null then
    raise exception 'conversa não encontrada';
  end if;

  /* Teto por conversa. Sem ele, um laço automático enche a tabela e o
     custo do banco dela sobe sozinho, sem ninguém perceber até a conta
     chegar. Cinquenta mensagens é muito mais do que qualquer dúvida
     sobre lembrancinha precisa. */
  select count(*) into quantas from public.mensagens where conversa_id = alvo;
  if quantas >= 50 then
    raise exception 'esta conversa já tem mensagens demais';
  end if;

  insert into public.mensagens (conversa_id, quem, texto)
  values (alvo, 'cliente', p_texto);

  update public.conversas set atualizado_em = now() where id = alvo;
end;
$$;

comment on function enviar_mensagem is 'Grava uma fala da cliente, para quem tem a chave da conversa.';

create or replace function falar_com_a_loja(p_token uuid, p_nome text, p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid;
begin
  select id into alvo from public.conversas where token = p_token;
  if alvo is null then
    raise exception 'conversa não encontrada';
  end if;

  if coalesce(trim(p_nome), '') = '' then
    raise exception 'falta o nome';
  end if;

  -- Conferência simples de propósito: e-mail só é validado de verdade
  -- quando alguém responde. O que isto evita é o campo vazio e o erro de
  -- digitação óbvio, sem recusar endereço estranho que existe.
  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'e-mail não parece certo';
  end if;

  update public.conversas
     set nome = trim(p_nome),
         email = lower(trim(p_email)),
         escalada = true,
         atualizado_em = now()
   where id = alvo;
end;
$$;

comment on function falar_com_a_loja is 'A cliente pede resposta humana e deixa nome e e-mail.';

-- Só estas quatro. `anon` não recebe nada além delas nestas tabelas.
grant execute on function abrir_conversa to anon, authenticated;
grant execute on function ler_conversa to anon, authenticated;
grant execute on function enviar_mensagem to anon, authenticated;
grant execute on function falar_com_a_loja to anon, authenticated;
