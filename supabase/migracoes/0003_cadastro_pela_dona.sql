-- O que a dona da loja precisa para cadastrar sozinha.
--
-- As duas migrações anteriores foram escritas para uma loja que só lia do
-- banco. Esta é a que deixa ela escrever: entrar com login próprio, criar
-- e editar produto, e subir foto.
--
-- A regra que atravessa tudo continua a mesma: a chave anônima vai dentro
-- do JavaScript da página e qualquer um a copia em dez segundos. Então ela
-- só pode **ler** o que é público. Escrita exige estar autenticado, e
-- autenticado só existe uma pessoa.

-- ── Quem pode administrar ───────────────────────────────────────────────
--
-- O Supabase já guarda os usuários em auth.users, que não é nossa. Esta
-- tabela é a lista de quem tem permissão de mexer na loja, e existe para a
-- resposta não ser "quem tiver conta", que é qualquer um que consiga se
-- cadastrar.

create table donas_da_loja (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

comment on table donas_da_loja is
  'Quem pode cadastrar produto e ver pedido. Hoje é uma pessoa só.';

alter table donas_da_loja enable row level security;

create policy "cada uma enxerga o próprio cadastro"
  on donas_da_loja for select
  to authenticated
  using (id = auth.uid());

/* A pergunta que toda política daqui para baixo faz.

   `security definer` com `search_path` vazio não é firula: sem isso, quem
   conseguir criar uma função chamada `donas_da_loja` num schema próprio
   faz esta consulta olhar para a tabela dele. */
create or replace function e_dona_da_loja()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.donas_da_loja where id = auth.uid()
  );
$$;

-- ── O produto passa a ter foto ──────────────────────────────────────────
--
-- Até aqui as fotos eram arquivo dentro do site, publicadas por mim a cada
-- envio. Vira dado, para ela trocar sem depender de ninguém.

alter table produtos
  add column imagem text,
  add column imagem_mini text,
  -- Ela manda três ou quatro fotos por produto: uma de capa e as outras
  -- mostrando ângulo, embalagem e detalhe.
  add column galeria text[] not null default '{}',
  add column posicao integer not null default 0;

comment on column produtos.imagem is 'Foto de capa, no tamanho da página do produto.';
comment on column produtos.imagem_mini is 'A mesma foto reduzida, para a vitrine não carregar tudo grande.';
comment on column produtos.posicao is 'Ordem escolhida por ela na vitrine. Empate cai para o mais recente.';

create index produtos_por_posicao on produtos (posicao, criado_em desc) where ativo;

-- ── Ela escreve; o resto do mundo lê ────────────────────────────────────
--
-- As políticas de leitura pública já existem desde 0001 e continuam
-- valendo só para o que está ativo. Estas acrescentam a escrita, e só para
-- quem está na lista.

create policy "a dona cadastra produto"
  on produtos for insert
  to authenticated
  with check (e_dona_da_loja());

create policy "a dona edita produto"
  on produtos for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

/* Sem `delete` de propósito.

   Produto apagado leva junto o histórico de quem comprou aquilo, e some
   dos relatórios do mês passado como se nunca tivesse existido. O que ela
   quer quando clica em "excluir" é parar de vender, e isso é `ativo =
   false`, que a política de update já cobre. Se um dia precisar apagar de
   verdade, é decisão consciente e passa por mim. */

create policy "a dona cadastra tema"
  on temas for insert
  to authenticated
  with check (e_dona_da_loja());

create policy "a dona edita tema"
  on temas for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

-- ── Onde as fotos ficam ─────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produtos',
  'produtos',
  -- Público para leitura: são fotos de vitrine, feitas para serem vistas.
  -- Deixá-las privadas exigiria uma URL assinada por foto, que expira, e
  -- quebraria o cache do navegador sem proteger nada.
  true,
  -- 2 MB por arquivo. O navegador já reduz antes de enviar; este limite é
  -- a rede contra o dia em que alguém subir a foto crua de 12 MB.
  2097152,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "qualquer um vê as fotos dos produtos"
  on storage.objects for select
  using (bucket_id = 'produtos');

create policy "a dona sobe foto"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos' and e_dona_da_loja());

create policy "a dona troca a própria foto"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produtos' and e_dona_da_loja());

create policy "a dona apaga foto"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos' and e_dona_da_loja());

-- ── Os pedidos, agora que existe quem os leia ───────────────────────────
--
-- A 0002 deixou a leitura de pedido para `authenticated`, que naquele
-- momento significava "ela". Agora que qualquer pessoa pode ter conta,
-- isso precisa ser explícito: só quem está na lista lê pedido de cliente.

drop policy if exists "a dona da loja lê os pedidos" on pedidos;
drop policy if exists "a dona da loja lê os itens" on itens_do_pedido;
drop policy if exists "a dona da loja lê os avisos" on eventos_de_pagamento;

create policy "só a dona lê os pedidos"
  on pedidos for select
  to authenticated
  using (e_dona_da_loja());

create policy "só a dona lê os itens"
  on itens_do_pedido for select
  to authenticated
  using (e_dona_da_loja());

create policy "só a dona lê os avisos"
  on eventos_de_pagamento for select
  to authenticated
  using (e_dona_da_loja());

-- A dona marca pedido como produzido, postado, e escreve o rastreio. O
-- estado do pagamento não entra aqui: quem muda aquilo é o aviso do
-- Mercado Pago, conferido contra a API deles.
create policy "a dona acompanha o pedido"
  on pedidos for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());
