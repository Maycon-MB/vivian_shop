-- O pedido passa a nascer no banco, e o preço deixa de vir do navegador.
--
-- Até aqui o pedido era gravado no `localStorage` de quem comprava. Isso
-- serviu para desenhar as telas, e não serve para vender: fechar a aba
-- apagava a compra, e a Vivian não via nada.
--
-- ── Por que uma função, e não uma política de insert ────────────────────
--
-- Com uma política de `insert`, o navegador manda a linha inteira, o total
-- inclusive. **Quem edita o JavaScript da própria página paga R$ 1 num
-- pedido de R$ 137.** Não é ataque sofisticado: é abrir as ferramentas do
-- navegador e trocar um número.
--
-- Aqui o navegador manda **o que ela quer comprar**, e nunca quanto custa.
-- A função busca o preço na tabela `produtos`, soma, e é esse valor que
-- vai para o Mercado Pago. O preço que a loja mostra e o preço que ela
-- cobra passam a vir do mesmo lugar.
--
-- O frete ainda vem de fora porque é simulado. Quando o cálculo real
-- entrar, ele passa a ser feito aqui pela mesma razão.

create or replace function criar_pedido(
  p_itens jsonb,
  p_nome text,
  p_email text,
  p_whatsapp text,
  p_meio text,
  p_frete numeric default 0,
  p_endereco jsonb default null
)
returns table (id uuid, numero text, subtotal numeric, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo_id uuid;
  novo_numero text;
  soma numeric(10, 2) := 0;
  quantos integer;
  linha_do_pedido text;
  item jsonb;
  preco_de_verdade numeric(10, 2);
  minimo_do_produto integer;
  nome_do_produto text;
begin
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'pedido sem itens';
  end if;

  if coalesce(trim(p_nome), '') = '' then
    raise exception 'falta o nome de quem está comprando';
  end if;

  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'e-mail não parece certo';
  end if;

  if p_meio not in ('pix', 'cartao') then
    raise exception 'forma de pagamento desconhecida';
  end if;

  /* O preço vem daqui, e não do navegador. Junto vem a conferência do
     mínimo: a loja mostra "mínimo 10" na página, e sem conferir de novo
     bastaria mandar 1 pela mão. */
  for item in select * from jsonb_array_elements(p_itens)
  loop
    quantos := coalesce((item->>'quantidade')::integer, 0);

    if quantos < 1 then
      raise exception 'quantidade inválida';
    end if;

    select p.preco_reais, p.minimo, p.nome, p.linha
      into preco_de_verdade, minimo_do_produto, nome_do_produto, linha_do_pedido
      from public.produtos p
     where p.id = (item->>'produto_id')::uuid
       and p.ativo;

    if preco_de_verdade is null then
      -- Produto tirado do ar enquanto a pessoa preenchia o checkout.
      raise exception 'um dos produtos não está mais à venda';
    end if;

    if quantos < minimo_do_produto then
      raise exception '% precisa de pelo menos % unidades', nome_do_produto, minimo_do_produto;
    end if;

    soma := soma + (preco_de_verdade * quantos);
  end loop;

  /* Número curto e sequencial: ela atende por mensagem e a cliente vai
     ditar isso em voz alta. Código longo não se dita. */
  select lpad((coalesce(max(p.numero::integer), 0) + 1)::text, 4, '0')
    into novo_numero
    from public.pedidos p
   where p.numero ~ '^[0-9]+$';

  insert into public.pedidos (
    numero, linha, comprador_id, comprador_nome, comprador_email, comprador_whatsapp,
    subtotal, frete, total, meio_pagamento,
    cep, logradouro, numero_endereco, complemento, bairro, cidade, uf
  )
  values (
    novo_numero,
    linha_do_pedido,
    -- Nulo quando a compra é sem conta, que continua valendo.
    auth.uid(),
    trim(p_nome), lower(trim(p_email)), trim(p_whatsapp),
    soma, coalesce(p_frete, 0), soma + coalesce(p_frete, 0), p_meio,
    p_endereco->>'cep', p_endereco->>'logradouro', p_endereco->>'numero',
    p_endereco->>'complemento', p_endereco->>'bairro', p_endereco->>'cidade',
    upper(p_endereco->>'uf')
  )
  returning pedidos.id into novo_id;

  insert into public.itens_do_pedido (pedido_id, produto_id, nome, preco_unitario, quantidade)
  select
    novo_id,
    (i->>'produto_id')::uuid,
    p.nome,
    p.preco_reais,
    (i->>'quantidade')::integer
  from jsonb_array_elements(p_itens) i
  join public.produtos p on p.id = (i->>'produto_id')::uuid;

  return query select novo_id, novo_numero, soma, soma + coalesce(p_frete, 0);
end;
$$;

comment on function criar_pedido is
  'Cria o pedido com o preço lido da tabela de produtos, e nunca o que o navegador mandou.';

grant execute on function criar_pedido to anon, authenticated;

/* Sem política de insert em `pedidos` e `itens_do_pedido`, de propósito.

   Quem compra fala com a função acima, e nunca com a tabela. Se um dia
   alguém acrescentar aqui um "qualquer um insere", volta a ser possível
   escolher o próprio preço. */
