-- O teste de compra limpa o que ele mesmo criou.
--
-- O teste de ponta a ponta percorre uma compra inteira a cada push, e
-- desde 25/08 o pedido nasce no banco de verdade. Em dois dias juntaram
-- onze pedidos falsos no banco dela, todos de `ana@exemplo.com.br`.
--
-- Não é sujeira inofensiva: eles aparecem no painel dela, contam nos
-- relatórios, e em quatorze dias o convite de avaliação sairia para um
-- endereço que não existe. Cada devolução derruba a reputação do domínio,
-- e o e-mail dela para as clientes de verdade passa a cair em spam.
--
-- ── Por que isto, e não um projeto separado para teste ─────────────────
--
-- Um segundo projeto no Supabase é o conserto certo, e é decisão do
-- Maycon: mexe no limite do plano gratuito e cria mais um lugar para
-- manter. Enquanto ele não existir, esta função tira o dano.
--
-- ── Por que ela pode ser chamada por qualquer um ───────────────────────
--
-- Porque **ela não consegue apagar dado de verdade.** O `where` só alcança
-- endereços em domínios reservados para exemplo, que por norma não
-- pertencem a ninguém e nunca recebem nada. Não há parâmetro, não há como
-- apontá-la para outro pedido, e a lista de domínios está aqui, não em
-- quem chama.
--
-- É a diferença entre dar uma chave que abre tudo e deixar aberta a porta
-- de uma sala vazia.

create or replace function limpar_pedidos_de_teste()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  quantos integer;
begin
  with de_teste as (
    select id from public.pedidos
    /* `exemplo.com`, `example.com` e `testuser.com` são reservados por
       norma justamente para isto. Nenhuma cliente dela vai ter um. */
     where comprador_email ~* '@(exemplo|example)[.](com|com[.]br|org|net)$'
        or comprador_email ~* '@testuser[.]com$'
  ),
  apagadas as (
    delete from public.avaliacoes
     where pedido_id in (select id from de_teste)
    returning 1
  ),
  eventos as (
    delete from public.eventos_de_pagamento
     where pedido_id in (select id from de_teste)
    returning 1
  ),
  itens as (
    delete from public.itens_do_pedido
     where pedido_id in (select id from de_teste)
    returning 1
  ),
  pedidos as (
    delete from public.pedidos
     where id in (select id from de_teste)
    returning 1
  )
  select count(*) into quantos from pedidos;

  return quantos;
end;
$$;

comment on function limpar_pedidos_de_teste is
  'Apaga os pedidos que o teste de ponta a ponta cria. Só alcança endereços de exemplo.';

grant execute on function limpar_pedidos_de_teste to anon, authenticated;
