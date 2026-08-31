-- Onde ficam as chaves da conta do Melhor Envio dela.
--
-- O frete de verdade precisa de um token que vale 30 dias e se renova
-- sozinho. Ele não pode viver nas variáveis do GitHub como as outras
-- chaves: aquelas são escritas por mim, uma vez, e esta muda sozinha a
-- cada renovação. Precisa de um lugar que a função consiga escrever.
--
-- ── Por que uma tabela sem política nenhuma ────────────────────────────
--
-- Esta tabela **não tem policy de select, insert, update nem delete**, e
-- isso é a proteção, não um esquecimento. Com RLS ligado e nenhuma
-- política, ninguém alcança a tabela: nem a chave anônima que vai dentro
-- da página, nem uma conta logada, nem a própria Vivian pelo painel.
--
-- Quem lê é a chave de serviço, que só existe dentro das funções do
-- Supabase e nunca chega ao navegador. É o mesmo desenho de `pedidos`.
--
-- O motivo de tanto cuidado: **quem tem esse token gasta o dinheiro
-- dela.** Ele compra etiqueta, movimenta o saldo da conta e cancela
-- envio. É mais perigoso que a chave de leitura do catálogo, e por isso
-- não recebe o mesmo tratamento.
--
-- ── Por que uma linha só ───────────────────────────────────────────────
--
-- É a conta dela, e é uma. A chave primária fixa em 'melhor-envio' faz o
-- `upsert` da renovação sobrescrever em vez de acumular: token velho
-- guardado é token velho vazado.

create table if not exists credenciais_do_frete (
  servico text primary key,

  token text not null,

  -- O que permite renovar sem ela autorizar de novo, a cada 30 dias.
  token_de_renovacao text not null,

  -- Quando o token para de valer. A função renova antes, e não depois:
  -- descobrir que venceu no meio de uma compra é perder a venda.
  expira_em timestamptz not null,

  atualizado_em timestamptz not null default now()
);

comment on table credenciais_do_frete is
  'Token do Melhor Envio. Sem política de acesso: só a chave de serviço alcança.';

comment on column credenciais_do_frete.token is
  'Quem tem este valor compra etiqueta e gasta o saldo da conta dela.';

alter table credenciais_do_frete enable row level security;

-- Nenhuma policy, de propósito. Ver o comentário do topo.

-- ── E o CEP de onde os pacotes saem? ──────────────────────────────────
--
-- Não fica aqui, e não fica em tabela nenhuma. Ele é o CEP da casa dela.
--
-- A primeira versão desta migração criava uma coluna para ele numa tabela
-- de configuração, o que teria posto o endereço residencial de uma mulher
-- que vende sozinha pela internet a um `select` de distância de qualquer
-- pessoa com a chave que vai dentro da página.
--
-- Quem precisa dele é só a função que cota o frete, então ele vive onde
-- vivem os outros segredos dela: nas variáveis da função, em
-- `MELHORENVIO_CEP_ORIGEM`.

-- ── O prazo que mata a integração em silêncio ─────────────────────────
--
-- O token vale 30 dias e o token de renovação vale 45. A renovação só
-- acontece quando alguém cota um frete.
--
-- Numa loja que acabou de abrir, passar 45 dias sem uma única cotação é
-- perfeitamente possível. Aí o token de renovação vence junto, e a única
-- saída é a Vivian autorizar tudo de novo.
--
-- **E ninguém perceberia.** A função cai para a estimativa de propósito,
-- para não derrubar o checkout, então a loja continuaria vendendo com o
-- frete inventado e a diferença sairia do bolso dela.
--
-- Uma vez por semana, esta rotina pede uma cotação de mentira. Isso
-- renova o token e, de quebra, prova que a integração ainda responde.
-- Sete dias de folga contra quarenta e cinco de prazo.

create extension if not exists pg_cron;

create or replace function manter_o_frete_vivo()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  endereco text;
begin
  select decrypted_secret into endereco
    from vault.decrypted_secrets where name = 'URL_DE_COTAR_FRETE';

  -- Sem o segredo, não faz nada e não reclama: é configuração pendente,
  -- e não erro que precise acordar alguém.
  if endereco is null then
    return;
  end if;

  begin
    perform net.http_post(
      url := endereco,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      /* Um pacote qualquer, entre dois CEPs que existem. O que importa
         não é o preço que volta: é a chamada obrigar a função a renovar
         o token antes de falar com eles. */
      body := jsonb_build_object(
        'cepDestino', '01310100',
        'pesoG', 1000,
        'altCm', 10,
        'largCm', 15,
        'compCm', 20
      )
    );
  exception when others then
    raise warning 'não consegui manter o frete vivo: %', sqlerrm;
  end;
end;
$$;

comment on function manter_o_frete_vivo is
  'Cota um frete de mentira por semana, só para o token não vencer por falta de uso.';

/* Segunda de manhã, e não domingo: se falhar, o aviso aparece num dia em
   que alguém está trabalhando para ver. O horário do banco é UTC. */
select cron.unschedule('manter-o-frete-vivo')
where exists (select 1 from cron.job where jobname = 'manter-o-frete-vivo');

select cron.schedule(
  'manter-o-frete-vivo',
  '0 12 * * 1',
  $$ select manter_o_frete_vivo(); $$
);
