-- Quantas pessoas chegaram a cada etapa da compra, sem cookie e sem identificar ninguém.
-- Mesmo desenho da 0016: contador por dia, etapa e origem, escrito e lido só por função.

create table if not exists etapas_do_funil (
  dia date not null default current_date,
  etapa text not null,
  origem text not null,
  quantas integer not null default 0,
  primary key (dia, etapa, origem)
);

comment on table etapas_do_funil is
  'Pessoas por dia, etapa da compra e origem. Sem cookie e sem identificar ninguém.';

/* Sem política e sem grant de tabela: só as funções abaixo leem e escrevem.
   É também o que mantém a tabela funcionando depois que o Supabase parar de expô-la sozinho. */
alter table etapas_do_funil enable row level security;

create or replace function contar_etapa(
  p_etapa text,
  p_origem text default 'direto'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  origem_limpa text;
begin
  /* A chave anônima está na página: etapa fora da lista não vira linha nova na tabela dela. */
  if p_etapa is null or p_etapa not in ('produto', 'carrinho', 'checkout', 'pagamento') then
    return;
  end if;

  origem_limpa := case lower(coalesce(p_origem, 'direto'))
    when 'direto' then 'direto'
    when 'instagram' then 'instagram'
    when 'facebook' then 'facebook'
    when 'whatsapp' then 'whatsapp'
    when 'google' then 'google'
    when 'pinterest' then 'pinterest'
    when 'tiktok' then 'tiktok'
    when 'youtube' then 'youtube'
    when 'anuncio' then 'anuncio'
    else 'outro'
  end;

  insert into public.etapas_do_funil (dia, etapa, origem, quantas)
  values (current_date, p_etapa, origem_limpa, 1)
  on conflict (dia, etapa, origem) do update
     set quantas = public.etapas_do_funil.quantas + 1;
end;
$$;

comment on function contar_etapa is
  'Soma uma pessoa numa etapa da compra. Não grava quem: só quantos.';

grant execute on function contar_etapa(text, text) to anon, authenticated;

create or replace function funil_da_loja(p_dias integer default 30)
returns table (
  etapa text,
  pessoas bigint
)
language sql
security definer
set search_path = ''
as $$
  select e.etapa, sum(e.quantas)::bigint
  from public.etapas_do_funil e
  where e.dia >= current_date - (least(greatest(p_dias, 1), 365) || ' days')::interval
    and exists (select 1 from public.donas_da_loja d where d.id = auth.uid())
  group by e.etapa

  union all

  /* Pago vem do pedido aprovado, e não do navegador: só o servidor sabe que o dinheiro entrou. */
  select 'pago', count(*)::bigint
  from public.pedidos p
  where p.estado_pagamento = 'aprovado'
    and p.criado_em >= current_date - (least(greatest(p_dias, 1), 365) || ' days')::interval
    and not (
      p.comprador_email ~* '@(exemplo|example)[.](com|com[.]br|org|net)$'
      or p.comprador_email ~* '@testuser[.]com$'
    )
  having exists (select 1 from public.donas_da_loja d where d.id = auth.uid());
$$;

comment on function funil_da_loja is
  'Pessoas por etapa e pedidos pagos dos últimos N dias. Só para a dona.';

grant execute on function funil_da_loja(integer) to authenticated;
