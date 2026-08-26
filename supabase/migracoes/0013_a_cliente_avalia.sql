-- A cliente que comprou avalia o produto que recebeu.
--
-- Até aqui a prova social dela eram 13 avaliações num arquivo do
-- repositório, todas de um marketplace que fechou. **Quem comprava hoje
-- não deixava rastro para quem chegasse amanhã**, e cada avaliação nova
-- exigiria eu editar um arquivo à mão.
--
-- Numa loja que ninguém conhece, isso é o que mais pesa: quem chega está
-- perguntando se o produto chega e se chega bom, e quem responde é quem já
-- comprou.
--
-- ── As três decisões, tomadas com o Maycon em 26/08 ────────────────────
--
--   1. **Só quem comprou avalia.** O convite sai por e-mail com uma chave
--      que vale para aquele pedido. Sem isso, uma loja de material
--      infantil com comentário anônimo aberto é convite para o que se
--      imagina.
--   2. **Ela decide o que vai ao ar, uma a uma.** A loja é dela.
--   3. **O convite sai alguns dias depois da entrega**, quando a cliente
--      já usou o produto na festa e tem o que dizer.
--
-- É por produto, e não por compra: quem está olhando a Lousa da Peppa quer
-- ler sobre a Lousa da Peppa. É onde a decisão acontece.

create table if not exists avaliacoes (
  id uuid primary key default gen_random_uuid(),

  /* Nulo quando a avaliação é sobre a loja, e não sobre um produto do
     catálogo. Uma das 13 antigas é assim: "Pedido Personalizado", uma
     encomenda sob medida que nunca virou produto. Forçá-la num produto
     qualquer seria inventar de qual ela falava. */
  produto_id uuid references produtos (id) on delete cascade,
  pedido_id uuid references pedidos (id) on delete set null,

  /* Só o primeiro nome, e a coluna existe para lembrar disso. Quem
     escreve está avaliando um produto, e não autorizando o nome inteiro
     numa vitrine pública. */
  primeiro_nome text not null check (length(trim(primeiro_nome)) between 1 and 40),

  nota integer not null check (nota between 1 and 5),
  texto text not null check (length(trim(texto)) between 3 and 1000),

  /* Nasce fora do ar. Ela publica uma a uma, e pode responder antes. */
  publicada boolean not null default false,
  resposta_da_loja text,

  criado_em timestamptz not null default now(),

  /* Uma avaliação por produto por pedido. Sem isto, recarregar a página
     do convite manda a mesma opinião duas vezes, e a vitrine repete. */
  unique (pedido_id, produto_id)
);

comment on table avaliacoes is
  'O que a cliente escreveu sobre o produto que recebeu. Só vai ao ar quando ela publica.';

create index if not exists avaliacoes_do_produto
  on avaliacoes (produto_id, criado_em desc)
  where publicada;

create index if not exists avaliacoes_esperando
  on avaliacoes (criado_em desc)
  where not publicada;

-- ── Quem lê o quê ───────────────────────────────────────────────────────

alter table avaliacoes enable row level security;

drop policy if exists "qualquer um lê avaliação publicada" on avaliacoes;
create policy "qualquer um lê avaliação publicada"
  on avaliacoes for select
  to anon, authenticated
  using (publicada);

drop policy if exists "a dona vê todas as avaliações" on avaliacoes;
create policy "a dona vê todas as avaliações"
  on avaliacoes for select
  to authenticated
  using (e_dona_da_loja());

drop policy if exists "a dona publica e responde" on avaliacoes;
create policy "a dona publica e responde"
  on avaliacoes for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

/* Sem política de insert, pelo mesmo motivo das conversas: quem escreve
   passa pela função abaixo, que confere a chave do pedido. Uma política
   de insert aberta deixaria qualquer um com a chave anônima encher a
   vitrine dela de texto. */

-- ── A chave do convite ──────────────────────────────────────────────────
--
-- O e-mail leva um endereço com esta chave. Ela prova que quem está
-- escrevendo é dona daquele pedido, sem exigir conta: a maioria compra sem
-- se cadastrar, e obrigar login para avaliar é perder a avaliação.

alter table pedidos
  add column if not exists chave_da_avaliacao uuid not null default gen_random_uuid(),
  add column if not exists convite_de_avaliacao_em timestamptz;

comment on column pedidos.chave_da_avaliacao is
  'Vai no link do e-mail de convite. Prova que quem escreve comprou, sem exigir conta.';

create unique index if not exists pedidos_pela_chave_da_avaliacao
  on pedidos (chave_da_avaliacao);

/**
 * O que a cliente pode avaliar com aquela chave.
 *
 * Devolve os produtos daquele pedido, e o que ela já escreveu. Sem isto a
 * tela do convite não teria como mostrar "avalie a Lousa Mágica" sem
 * pedir login.
 */
create or replace function produtos_para_avaliar(p_chave uuid)
returns table (produto_id uuid, nome text, imagem text, ja_avaliado boolean)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    select
      pr.id,
      pr.nome,
      pr.imagem_mini,
      exists (
        select 1 from public.avaliacoes a
        where a.pedido_id = pe.id and a.produto_id = pr.id
      )
    from public.pedidos pe
    join public.itens_do_pedido it on it.pedido_id = pe.id
    join public.produtos pr on pr.id = it.produto_id
    where pe.chave_da_avaliacao = p_chave
      -- Só pedido pago: quem não pagou não recebeu, e não tem o que dizer.
      and pe.estado_pagamento = 'aprovado';
end;
$$;

comment on function produtos_para_avaliar is
  'Os produtos daquele pedido, para a tela do convite montar a lista.';

create or replace function avaliar(
  p_chave uuid,
  p_produto_id uuid,
  p_nota integer,
  p_texto text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  o_pedido uuid;
  quem text;
begin
  select pe.id, split_part(trim(pe.comprador_nome), ' ', 1)
    into o_pedido, quem
    from public.pedidos pe
   where pe.chave_da_avaliacao = p_chave
     and pe.estado_pagamento = 'aprovado';

  if o_pedido is null then
    -- A mesma resposta para chave inventada e para pedido não pago: dizer
    -- qual dos dois é ensina quem está tentando adivinhar.
    raise exception 'não consegui encontrar esse pedido';
  end if;

  -- O produto tem que estar naquele pedido. Sem esta conferência, a chave
  -- de um pedido avaliaria o catálogo inteiro.
  if not exists (
    select 1 from public.itens_do_pedido it
    where it.pedido_id = o_pedido and it.produto_id = p_produto_id
  ) then
    raise exception 'esse produto não está nesse pedido';
  end if;

  insert into public.avaliacoes (produto_id, pedido_id, primeiro_nome, nota, texto)
  values (p_produto_id, o_pedido, quem, p_nota, trim(p_texto))
  /* Trocar a própria opinião é razoável; publicar duas não é. E volta a
     esperar aprovação, porque o texto mudou. */
  on conflict (pedido_id, produto_id) do update
    set nota = excluded.nota,
        texto = excluded.texto,
        publicada = false,
        criado_em = now();
end;
$$;

comment on function avaliar is 'Grava a avaliação de quem tem a chave daquele pedido.';

grant execute on function produtos_para_avaliar to anon, authenticated;
grant execute on function avaliar to anon, authenticated;
