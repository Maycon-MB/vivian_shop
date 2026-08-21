-- Pedidos, itens e avisos de pagamento.
--
-- Este é o pedaço privado do banco. Aqui moram nome, e-mail, telefone e
-- endereço de quem compra dela, e a regra é uma só: **a chave anônima não
-- enxerga nada disto**. Nem para ler, nem para escrever.
--
-- Isso não é excesso de zelo. A chave anônima vai dentro do JavaScript da
-- página, e qualquer pessoa que abra o código-fonte a copia em dez
-- segundos. Uma política de leitura frouxa aqui entrega o endereço
-- residencial de todas as clientes dela.
--
-- Quem escreve pedido é a função do servidor, com a credencial de serviço,
-- que nunca chega ao navegador. Quem lê é a Vivian, autenticada.

-- ── Pedidos ─────────────────────────────────────────────────────────────

create table pedidos (
  id uuid primary key default gen_random_uuid(),

  -- Curto e sequencial, porque ela atende no WhatsApp e a cliente vai
  -- ditar esse número em voz alta. Código longo não se dita.
  numero text not null unique,

  linha text not null check (linha in ('personalizada', 'pedagogica')),

  comprador_nome text not null,
  comprador_email text not null,
  comprador_whatsapp text not null,

  subtotal numeric(10, 2) not null check (subtotal >= 0),
  frete numeric(10, 2) not null default 0 check (frete >= 0),
  desconto numeric(10, 2) not null default 0 check (desconto >= 0),
  total numeric(10, 2) not null check (total >= 0),

  meio_pagamento text not null check (meio_pagamento in ('pix', 'cartao')),
  estado_pagamento text not null default 'aguardando'
    check (estado_pagamento in ('aguardando', 'aprovado', 'recusado', 'estornado')),

  -- O id do pagamento no Mercado Pago. Único porque o mesmo pagamento não
  -- pode acabar preso a dois pedidos.
  pagamento_externo_id text unique,

  -- Endereço só existe em pedido físico: pedir CEP para entregar um
  -- arquivo faz a pessoa desconfiar, e com razão.
  cep text,
  logradouro text,
  numero_endereco text,
  complemento text,
  bairro text,
  cidade text,
  uf text check (uf is null or char_length(uf) = 2),

  transportadora text,
  rastreio text,
  prometido_para date,

  -- Só em pedido digital: o acesso ao Drive dela, que expira em 7 dias.
  token_download text unique,
  expira_em timestamptz,

  -- Marcado quando um aviso chega estranho: valor que não bate, estado que
  -- o Mercado Pago inventou, pedido que não existe. Não trava nada, só
  -- pede olho humano.
  precisa_conferir text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint fisico_tem_endereco
    check (
      linha <> 'personalizada'
      or (cep is not null and logradouro is not null and numero_endereco is not null
          and bairro is not null and cidade is not null and uf is not null)
    )
);

create index pedidos_por_estado on pedidos (estado_pagamento, criado_em desc);
create index pedidos_por_producao on pedidos (prometido_para)
  where estado_pagamento = 'aprovado' and rastreio is null;

-- ── Itens ───────────────────────────────────────────────────────────────

create table itens_do_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete cascade,

  -- Referência solta de propósito: produto apagado do catálogo não pode
  -- apagar o histórico de venda.
  produto_id uuid references produtos (id) on delete set null,

  -- Nome e preço copiados no momento da compra. Reajuste de amanhã não
  -- reescreve o que foi vendido ontem, e é isso que faz o relatório do mês
  -- passado continuar verdadeiro.
  nome text not null,
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  quantidade integer not null check (quantidade > 0)
);

create index itens_por_pedido on itens_do_pedido (pedido_id);

-- ── Avisos de pagamento ─────────────────────────────────────────────────
-- Cada aviso do Mercado Pago, guardado cru e antes de qualquer decisão.
--
-- Guardar cru é o que permite entender depois o que aconteceu: sem isto, a
-- única prova de um pedido que mudou de estado sozinho seria a memória de
-- quem estava olhando.

create table eventos_de_pagamento (
  id uuid primary key default gen_random_uuid(),

  -- A dupla que impede processar duas vezes. O Mercado Pago reenvia o
  -- mesmo aviso até receber 200, e sem esta restrição o material digital
  -- sairia por e-mail a cada reenvio.
  provedor text not null default 'mercadopago',
  externo_id text not null,
  status_externo text not null,

  pedido_id uuid references pedidos (id) on delete set null,
  corpo jsonb not null,
  decisao text,
  recebido_em timestamptz not null default now(),

  unique (provedor, externo_id, status_externo)
);

create index eventos_por_pedido on eventos_de_pagamento (pedido_id, recebido_em desc);

-- ── Quem pode ler ───────────────────────────────────────────────────────

alter table pedidos enable row level security;
alter table itens_do_pedido enable row level security;
alter table eventos_de_pagamento enable row level security;

-- Só quem está autenticado, que é ela no painel. Não há política de
-- insert, update ou delete para ninguém: escrita passa inteira pelo
-- servidor, com credencial de serviço, que ignora RLS.
create policy "a dona da loja lê os pedidos"
  on pedidos for select
  to authenticated
  using (true);

create policy "a dona da loja lê os itens"
  on itens_do_pedido for select
  to authenticated
  using (true);

create policy "a dona da loja lê os avisos"
  on eventos_de_pagamento for select
  to authenticated
  using (true);

-- ── Atualizado em ───────────────────────────────────────────────────────

create or replace function marcar_atualizacao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger pedidos_atualizado_em
  before update on pedidos
  for each row execute function marcar_atualizacao();
