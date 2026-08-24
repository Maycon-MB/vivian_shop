-- Uma dona convida outra.
--
-- O desenho anterior tinha um buraco: só a primeira conta virava dona, e
-- ninguém mais entrava. Isso bastaria se a loja tivesse uma pessoa só, e
-- em 23/08 a Vivian avisou que a irmã, a Lilian, trabalha com ela e vai
-- resolver as coisas da loja junto.
--
-- Também muda quem cria a primeira conta: o Maycon, e não ela. Assim
-- ninguém espera pela agenda de ninguém, e a janela em que "o primeiro que
-- chegar vira dono" fecha no mesmo dia, em vez de ficar aberta na internet
-- esperando a cliente ter tempo.
--
-- O convite é por e-mail e não cria conta: quem foi convidada se cadastra
-- normalmente, com a senha que ela escolher, e vira dona no momento do
-- cadastro. Ninguém nunca digita a senha de outra pessoa.

create table convites (
  email text primary key,
  convidada_por uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  usado_em timestamptz
);

comment on table convites is
  'E-mails autorizados a virar donas da loja. O convite se gasta ao ser usado.';

alter table convites enable row level security;

create policy "as donas veem os convites"
  on convites for select
  to authenticated
  using (e_dona_da_loja());

create policy "as donas convidam"
  on convites for insert
  to authenticated
  with check (e_dona_da_loja() and convidada_por = auth.uid());

-- Sem update: convite não se edita. Se errou o e-mail, apaga e convida de
-- novo, e o registro de quem convidou quem continua verdadeiro.
create policy "as donas cancelam convite não usado"
  on convites for delete
  to authenticated
  using (e_dona_da_loja() and usado_em is null);

/* O gatilho de cadastro passa a olhar duas coisas: se a loja ainda não tem
   dona, ou se aquele e-mail foi convidado. */
create or replace function promover_primeira_dona()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  convidada boolean;
begin
  select exists (
    select 1 from public.convites
    where lower(email) = lower(new.email) and usado_em is null
  ) into convidada;

  -- Primeira conta da loja, ou conta convidada por quem já é dona.
  if convidada or not exists (select 1 from public.donas_da_loja) then
    insert into public.donas_da_loja (id, nome)
    values (
      new.id,
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        new.email
      )
    )
    on conflict (id) do nothing;

    if convidada then
      update public.convites
        set usado_em = now()
      where lower(email) = lower(new.email) and usado_em is null;
    end if;
  end if;

  return new;
end;
$$;

comment on function promover_primeira_dona() is
  'A primeira conta vira dona. Depois disso, só quem foi convidada por uma dona.';
