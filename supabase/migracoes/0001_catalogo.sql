-- Catálogo: temas e produtos.
--
-- É o que a loja lê hoje do catálogo de exemplo em memória. As colunas são
-- exatamente as que loja/src/dados/catalogoSupabase.ts já espera, para o
-- código não precisar mudar quando o banco existir.
--
-- Nada aqui identifica comprador. Este é o pedaço público do banco: a
-- vitrine lê com a chave anônima, que qualquer pessoa consegue ler no
-- JavaScript da página.

create extension if not exists "pgcrypto";

-- ── Temas ───────────────────────────────────────────────────────────────
-- São 86 dela. O tema é como a cliente dela compra: quer alguma coisa do
-- Mickey para a festa, não uma caneca.

create table temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null default '',
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

comment on table temas is 'Coleções por personagem ou ocasião, como no Elo7.';

-- ── Produtos ────────────────────────────────────────────────────────────

create table produtos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null default '',

  -- numeric, e nunca float: dinheiro em ponto flutuante gera centavo que
  -- não fecha, e quem descobre é a cliente no extrato.
  preco_reais numeric(10, 2) not null check (preco_reais >= 0),
  preco_promocional_reais numeric(10, 2) check (preco_promocional_reais >= 0),

  linha text not null check (linha in ('personalizada', 'pedagogica')),
  tema_id uuid references temas (id) on delete set null,

  -- O mínimo de 10 é regra dela, e vale por produto para o dia em que
  -- algum item tiver mínimo diferente.
  minimo integer not null default 1 check (minimo >= 1),
  prazo_producao integer not null default 5 check (prazo_producao >= 0),

  -- Peso e medidas do pacote fechado, que é como ela envia. Só o
  -- personalizado tem: o digital não vai pelos Correios.
  peso_g integer check (peso_g > 0),
  alt_cm numeric(6, 2) check (alt_cm > 0),
  larg_cm numeric(6, 2) check (larg_cm > 0),
  comp_cm numeric(6, 2) check (comp_cm > 0),

  -- A pasta do Drive dela. O arquivo nunca sai de lá: a loja libera o
  -- acesso para o e-mail de quem comprou.
  pasta_drive text,

  ativo boolean not null default true,
  criado_em timestamptz not null default now(),

  -- Promoção que não é promoção confunde e corrói confiança.
  constraint promocional_menor_que_cheio
    check (preco_promocional_reais is null or preco_promocional_reais < preco_reais),

  -- Produto físico sem medida faz o frete sair errado, e a diferença sai
  -- do bolso dela em cada pedido.
  constraint personalizado_tem_medidas
    check (
      linha <> 'personalizada'
      or (peso_g is not null and alt_cm is not null
          and larg_cm is not null and comp_cm is not null)
    ),

  -- Digital sem pasta não tem o que entregar depois do pagamento.
  constraint pedagogico_tem_pasta
    check (linha <> 'pedagogica' or pasta_drive is not null)
);

create index produtos_por_linha on produtos (linha) where ativo;
create index produtos_por_tema on produtos (tema_id) where ativo;

-- ── Quem pode ler ───────────────────────────────────────────────────────
-- A vitrine é pública, mas só do que está ativo. Produto rascunho, com
-- preço pela metade, não aparece para ninguém enquanto ela não publicar.

alter table temas enable row level security;
alter table produtos enable row level security;

create policy "qualquer um lê tema ativo"
  on temas for select
  using (ativo);

create policy "qualquer um lê produto ativo"
  on produtos for select
  using (ativo);

-- Escrita não tem política nenhuma de propósito: com RLS ligado e sem
-- policy de insert/update, a chave anônima não escreve. Quem cadastra é a
-- Vivian pelo painel, autenticada, ou a importação da planilha, que roda
-- no servidor com credencial de serviço.
