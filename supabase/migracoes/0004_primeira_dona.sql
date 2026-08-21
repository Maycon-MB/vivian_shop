-- A primeira pessoa que se cadastrar é a dona da loja.
--
-- Sem isto, alguém precisaria entrar no banco e inserir a linha à mão
-- depois que ela criasse a conta. Dois passos, e o segundo esquecido
-- deixa a Vivian com conta criada e sem conseguir administrar nada, sem
-- entender por quê.
--
-- A janela de risco é conhecida e curta: enquanto a tabela estiver vazia,
-- quem se cadastrar primeiro vira dono. Ela fecha de duas formas ao mesmo
-- tempo, e as duas são necessárias:
--
--   1. a partir do segundo cadastro, ninguém mais é promovido
--   2. assim que ela entrar, o cadastro público é desligado no painel do
--      Supabase, e ninguém mais cria conta
--
-- O nome sai do que a pessoa digitou no cadastro. Se não digitou nada,
-- fica o e-mail: melhor um rótulo feio do que uma linha sem identificação
-- na tabela que decide quem manda na loja.

create or replace function promover_primeira_dona()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- `insert ... select ... where not exists` numa transação só: duas
  -- pessoas cadastrando no mesmo segundo não viram duas donas, porque a
  -- segunda enxerga a linha da primeira.
  insert into public.donas_da_loja (id, nome)
  select
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      new.email
    )
  where not exists (select 1 from public.donas_da_loja);

  return new;
end;
$$;

comment on function promover_primeira_dona() is
  'Faz da primeira conta criada a dona da loja. Não promove ninguém depois disso.';

create trigger primeira_conta_vira_dona
  after insert on auth.users
  for each row execute function promover_primeira_dona();

-- ── Como saber, de fora, se a porta ainda está aberta ───────────────────
--
-- A tela de cadastro precisa dizer à pessoa o que vai acontecer: "você
-- será a dona desta loja" é uma frase muito diferente de "sua conta não
-- terá permissão nenhuma". Sem isto, a tela teria que consultar uma tabela
-- que ela não pode ler.

create or replace function loja_ainda_sem_dona()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.donas_da_loja);
$$;

comment on function loja_ainda_sem_dona() is
  'Verdadeiro enquanto ninguém tiver assumido a loja. A tela de cadastro usa para avisar quem está entrando.';

grant execute on function loja_ainda_sem_dona() to anon, authenticated;
