-- Quantas pessoas entraram na loja, sem cookie e sem seguir ninguém.
--
-- Sem isto ela não tem como saber se um anúncio deu retorno. Hoje o
-- painel mostra pedido, e pedido é o fim da história: entre o anúncio e a
-- venda existem as pessoas que entraram e saíram, e são elas que dizem se
-- o problema é o anúncio, a foto ou o preço. Anunciar sem esse número é
-- pagar para não descobrir nada.
--
-- ── Por que sem cookie ─────────────────────────────────────────────────
--
-- Cookie de medição exige aviso de consentimento, e aviso de consentimento
-- é a primeira coisa que a cliente vê ao abrir a loja. Custa venda, e
-- custa para responder uma pergunta que não precisa de cookie nenhum.
--
-- Aqui não há identificador de pessoa. Não se grava IP, não se grava
-- navegador, não se grava nada que ligue duas visitas à mesma pessoa. O
-- que existe é um contador por dia, por página e por origem, e um contador
-- não é dado pessoal: ninguém consegue voltar dele para uma pessoa, nem
-- eu, nem ela, nem quem invadir o banco.
--
-- O preço disso é honesto: **ela não vê "quem" visitou, e nunca vai ver.**
-- Vê quantos, de onde vieram e o que olharam, que é o que decide se o
-- anúncio continua.
--
-- ── Por que a lista fechada de origens ─────────────────────────────────
--
-- A função é chamada pela chave anônima, que vai dentro da página. Quem
-- quiser manda o que quiser nela. Sem uma lista fechada, uma tarde de
-- brincadeira enche a tabela de milhões de origens inventadas, e o
-- relatório dela vira lixo ilegível.
--
-- Com a lista, o pior que alguém faz é inflar um número que já era
-- aproximado. Ruim, e recuperável: o dado continua legível.

create table if not exists visitas (
  dia date not null default current_date,

  /* A página, e não a URL: sem `?`, sem `#`, sem o que vem colado num
     link de campanha. É o que impede a mesma página de virar dez linhas
     no relatório. */
  caminho text not null,

  /* De onde a pessoa veio, em palavra e não em endereço. É esta coluna
     que responde "o anúncio trouxe gente?". */
  origem text not null,

  /* Páginas abertas. Uma pessoa que olha cinco produtos conta cinco. */
  quantas integer not null default 0,

  /* Pessoas que chegaram. Conta uma vez por visita, na primeira página.
     A diferença entre as duas colunas é o quanto a loja segura quem
     entra. */
  visitantes integer not null default 0,

  primary key (dia, caminho, origem)
);

comment on table visitas is
  'Contagem de visita por dia, página e origem. Sem cookie e sem identificar ninguém.';

/* O relatório dela pergunta sempre "os últimos N dias", e é sempre o dia
   mais recente primeiro. */
create index if not exists visitas_por_dia on visitas (dia desc);

alter table visitas enable row level security;

/* Ninguém lê pela chave anônima.
 *
 * Não é segredo de estado, mas é informação de negócio dela: quanto a loja
 * recebe de gente, e de onde. Concorrente nenhum precisa ver isso, e a
 * chave anônima está dentro da página.
 *
 * A dona lê. Quem visita só escreve, e escreve pela função abaixo. */
drop policy if exists visitas_a_dona_le on visitas;
create policy visitas_a_dona_le on visitas
  for select
  using (exists (select 1 from donas_da_loja d where d.id = auth.uid()));

/**
 * Conta uma página aberta.
 *
 * `p_primeira` vem verdadeiro só na primeira página de cada visita, e é o
 * navegador de quem visita que sabe disso: guarda uma marca que morre ao
 * fechar a aba e nunca sai dali.
 */
create or replace function contar_visita(
  p_caminho text,
  p_origem text default 'direto',
  p_primeira boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caminho_limpo text;
  origem_limpa text;
begin
  /* Só caminho com cara de caminho.
     Qualquer outra coisa vira uma linha só, em vez de uma linha nova por
     tentativa. */
  caminho_limpo := case
    when p_caminho ~ '^/[a-z0-9/_-]{0,120}$' then p_caminho
    else '/outro'
  end;

  /* Lista fechada. O que não estiver aqui é 'outro', e não uma linha nova
     na tabela dela. */
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

  insert into public.visitas (dia, caminho, origem, quantas, visitantes)
  values (
    current_date,
    caminho_limpo,
    origem_limpa,
    1,
    case when p_primeira then 1 else 0 end
  )
  on conflict (dia, caminho, origem) do update
     set quantas = public.visitas.quantas + 1,
         visitantes = public.visitas.visitantes
                    + case when p_primeira then 1 else 0 end;
end;
$$;

comment on function contar_visita is
  'Soma uma página aberta. Não grava quem, nem de onde: só quantos.';

/* Quem visita não tem conta, e é justamente quem precisa chamar isto. */
grant execute on function contar_visita to anon, authenticated;

/**
 * O resumo que o painel dela mostra.
 *
 * Vem pronto do banco em vez de o painel somar no navegador: são linhas
 * demais para trafegar por 4G, e a soma é a mesma toda vez.
 */
create or replace function resumo_de_visitas(p_dias integer default 30)
returns table (
  dia date,
  visitantes bigint,
  paginas bigint
)
language sql
security definer
set search_path = ''
as $$
  select
    v.dia,
    sum(v.visitantes)::bigint,
    sum(v.quantas)::bigint
  from public.visitas v
  where v.dia >= current_date - (least(greatest(p_dias, 1), 365) || ' days')::interval
    /* Só a dona. `security definer` passa por cima da política de leitura,
       então a pergunta tem que ser feita aqui dentro: sem isto, qualquer
       um com a chave anônima leria o movimento da loja dela. */
    and exists (select 1 from public.donas_da_loja d where d.id = auth.uid())
  group by v.dia
  order by v.dia desc;
$$;

comment on function resumo_de_visitas is
  'Visitantes e páginas por dia, dos últimos N dias. Só para a dona.';

grant execute on function resumo_de_visitas to authenticated;

/**
 * De onde veio a gente, no período.
 *
 * É esta que responde se vale continuar pagando o anúncio.
 */
create or replace function visitas_por_origem(p_dias integer default 30)
returns table (
  origem text,
  visitantes bigint,
  paginas bigint
)
language sql
security definer
set search_path = ''
as $$
  select
    v.origem,
    sum(v.visitantes)::bigint,
    sum(v.quantas)::bigint
  from public.visitas v
  where v.dia >= current_date - (least(greatest(p_dias, 1), 365) || ' days')::interval
    and exists (select 1 from public.donas_da_loja d where d.id = auth.uid())
  group by v.origem
  order by sum(v.visitantes) desc;
$$;

comment on function visitas_por_origem is
  'Quanta gente veio de cada origem. Só para a dona.';

grant execute on function visitas_por_origem to authenticated;

/**
 * As páginas mais abertas do período.
 *
 * Diz qual produto puxa gente para a loja, que é de onde sai a próxima
 * foto e o próximo post.
 */
create or replace function paginas_mais_vistas(
  p_dias integer default 30,
  p_quantas integer default 10
)
returns table (
  caminho text,
  paginas bigint
)
language sql
security definer
set search_path = ''
as $$
  select
    v.caminho,
    sum(v.quantas)::bigint
  from public.visitas v
  where v.dia >= current_date - (least(greatest(p_dias, 1), 365) || ' days')::interval
    and exists (select 1 from public.donas_da_loja d where d.id = auth.uid())
  group by v.caminho
  order by sum(v.quantas) desc
  limit least(greatest(p_quantas, 1), 100);
$$;

comment on function paginas_mais_vistas is
  'As páginas mais abertas no período. Só para a dona.';

grant execute on function paginas_mais_vistas to authenticated;
