-- Como ela recebe: parcelas, juros e desconto no Pix.
--
-- O Maycon pediu em 25/08 que isto ficasse na tela dela, e não no código.
-- Está certo, e o motivo é o mesmo do preço do produto: são decisões de
-- negócio, não de programa. Ela muda quando a taxa do Mercado Pago mudar,
-- quando entrar numa temporada de festa, ou quando quiser incentivar Pix,
-- sem depender de mim estar disponível.
--
-- Cada linha aqui mexe direto no quanto entra no bolso dela:
--
--   - parcelar ajuda a fechar venda de R$ 137, que é o pedido típico dela
--     (10 lousas), e custa taxa maior
--   - quem paga os juros muda quem sente: a cliente vê "3x de R$ 48" ou
--     "3x de R$ 45,67 sem juros", e no segundo caso a diferença sai dela
--   - desconto no Pix é o que mais muda a conta: taxa menor e dinheiro na
--     hora, em vez de 30 dias

create table if not exists configuracoes_de_pagamento (
  -- Uma linha só. O `check` garante isso: sem ele, um segundo registro
  -- criaria duas verdades e a loja mostraria uma e cobraria outra.
  id boolean primary key default true check (id),

  -- Até quantas vezes a cliente pode parcelar no crédito. 1 é à vista.
  parcelas_max integer not null default 1 check (parcelas_max between 1 and 12),

  /* Verdadeiro: a cliente vê "sem juros" e a diferença sai do bolso dela.
     Falso: a cliente paga os juros e ela recebe o valor cheio. */
  juros_por_conta_da_loja boolean not null default false,

  -- Desconto para quem paga no Pix, em porcento. Zero é sem desconto.
  desconto_pix numeric(5, 2) not null default 0
    check (desconto_pix >= 0 and desconto_pix <= 30),

  aceita_credito boolean not null default true,
  aceita_debito boolean not null default true,
  aceita_pix boolean not null default true,

  atualizado_em timestamptz not null default now()
);

comment on table configuracoes_de_pagamento is
  'Como ela recebe. Uma linha só, editada por ela no painel.';

insert into configuracoes_de_pagamento (id) values (true)
on conflict (id) do nothing;

-- ── Quem pode ler e escrever ────────────────────────────────────────────
--
-- Leitura é pública, e precisa ser: a página do produto diz "em até 3x
-- sem juros" antes de qualquer login, e é isso que ajuda a fechar a
-- venda. Não há nada de secreto aqui, é o que a loja anuncia.
--
-- Escrita é só dela. Se qualquer um pudesse escrever, alguém poria
-- desconto de 30% no Pix e ela descobriria pelo extrato.

alter table configuracoes_de_pagamento enable row level security;

drop policy if exists "qualquer um vê como pagar" on configuracoes_de_pagamento;
create policy "qualquer um vê como pagar"
  on configuracoes_de_pagamento for select
  to anon, authenticated
  using (true);

drop policy if exists "só a dona muda como recebe" on configuracoes_de_pagamento;
create policy "só a dona muda como recebe"
  on configuracoes_de_pagamento for update
  to authenticated
  using (e_dona_da_loja())
  with check (e_dona_da_loja());

/* Sem insert e sem delete de propósito: a linha já existe e é uma só.
   Poder criar outra é poder criar uma segunda verdade. */
