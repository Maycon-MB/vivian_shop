-- Quem compra passa a ter conta, e a ver os próprios pedidos.
--
-- Estava pendente desde 21/08, quando ficou decidido que a conta tem
-- e-mail e senha. Até aqui existia metade: a pessoa conseguia criar conta,
-- e a conta não servia para nada. **Hoje quem compra não consegue ver o
-- próprio pedido**, porque a política responde `[]` para toda conta que
-- não seja dona.
--
-- É o item que estava travando dois outros: ligar a conversa ao pedido, e
-- a cliente acompanhar a entrega sem escrever para ela.
--
-- ── O cuidado que manda aqui ───────────────────────────────────────────
--
-- A tabela `pedidos` guarda nome, e-mail, WhatsApp e endereço de casa das
-- clientes dela. Uma política frouxa aqui não vaza "dados": vaza onde as
-- pessoas moram.
--
-- Por isso a regra é por identidade, e não por e-mail digitado. Deixar
-- alguém ver um pedido por informar o e-mail do dono seria entregar a
-- lista inteira a quem tivesse paciência de tentar endereços.

alter table pedidos
  -- Nulo de propósito: comprar sem conta continua valendo, e foi decisão
  -- de 24/08. Quem cria conta depois não perde o que já comprou, porque a
  -- ligação é feita pelo e-mail na hora do cadastro.
  add column if not exists comprador_id uuid references auth.users (id) on delete set null;

comment on column pedidos.comprador_id is
  'A conta de quem comprou. Nulo quando a compra foi feita sem cadastro.';

create index if not exists pedidos_do_comprador
  on pedidos (comprador_id, criado_em desc)
  where comprador_id is not null;

-- ── Quem lê o quê ───────────────────────────────────────────────────────

drop policy if exists "quem comprou lê o próprio pedido" on pedidos;
create policy "quem comprou lê o próprio pedido"
  on pedidos for select
  to authenticated
  using (comprador_id = (select auth.uid()));

drop policy if exists "quem comprou lê os próprios itens" on itens_do_pedido;
create policy "quem comprou lê os próprios itens"
  on itens_do_pedido for select
  to authenticated
  using (
    exists (
      select 1 from pedidos p
      where p.id = itens_do_pedido.pedido_id
        and p.comprador_id = (select auth.uid())
    )
  );

/* Sem política de update para quem compra, e sem delete.

   Não é esquecimento. Pedido não é editável por quem o fez: mudar
   endereço depois de a etiqueta sair, ou apagar um pedido que ela já
   produziu, são coisas que ela resolve conversando, e não coisas que o
   sistema deve permitir em silêncio. */

-- ── A conta que nasce depois da compra ──────────────────────────────────
--
-- A cliente compra sem cadastro, recebe o e-mail com o número do pedido, e
-- semanas depois resolve criar conta. Sem isto, ela entra e vê uma lista
-- vazia, com os pedidos dela do lado de fora.
--
-- A ligação é feita pelo e-mail **confirmado pelo Supabase**, e não pelo
-- que a pessoa digitou: é a diferença entre "provei que este e-mail é meu"
-- e "escrevi o e-mail de alguém".

create or replace function ligar_pedidos_a_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pedidos
     set comprador_id = new.id
   where comprador_id is null
     and lower(comprador_email) = lower(new.email);

  return new;
end;
$$;

comment on function ligar_pedidos_a_conta is
  'Liga à conta nova os pedidos feitos antes dela, pelo e-mail confirmado.';

drop trigger if exists ligar_pedidos_quando_confirmar on auth.users;

/* Dispara na confirmação do e-mail, e não na criação da conta. Criar
   conta com o e-mail de outra pessoa é fácil; confirmar exige abrir a
   caixa dela. É essa confirmação que autoriza a ligação. */
create trigger ligar_pedidos_quando_confirmar
  after update on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function ligar_pedidos_a_conta();
