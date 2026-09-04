-- A Vivian é avisada por e-mail quando uma venda é paga.
--
-- Ela perguntou em 04/09 se o sistema avisa a cada compra. Não avisava: o
-- único gatilho de e-mail era o da 0009, em `conversas`, quando uma
-- cliente escreve.
--
-- Pior do que não avisar, a tela de Configurações dizia que sim, com a
-- opção "Pedido novo" marcada e prometendo mensagem no WhatsApp. Eram três
-- caixas de seleção sem estado, sem salvar e sem nada atrás. Ela ia
-- assinar o contrato acreditando que era avisada de cada venda.
--
-- ── Por que na aprovação, e não na criação do pedido ───────────────────
--
-- O pedido nasce no banco antes de a cliente pagar, com `aguardando`.
-- Avisar no nascimento encheria a caixa dela de carrinho abandonado, e o
-- aviso viraria ruído que ela aprende a ignorar.
--
-- E tem a razão que manda: **o teste de navegação cria pedido de verdade
-- no banco dela a cada push**. Já custou onze pedidos falsos em 25/08.
-- Gatilho em `insert` faria cada envio de código virar e-mail de venda
-- para ela. Pedido de teste nunca chega a `aprovado`, então a aprovação é
-- o único ponto que separa venda de tráfego nosso.
--
-- ── Onde os segredos ficam ─────────────────────────────────────────────
--
-- Os mesmos da 0009, e pelo mesmo motivo: este arquivo vai para um
-- repositório público. Vivem em `vault`, cifrados em repouso, e são lidos
-- no momento da chamada.

create or replace function avisar_venda_paga()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chave_do_gatilho text;
  endereco text;
  destinatarias text[];
begin
  /* Só na virada para aprovado. O Mercado Pago reenvia o mesmo aviso até
     receber 200, e cada reenvio reescreve esta linha: sem olhar o estado
     anterior, ela receberia o mesmo "vendeu" quatro vezes. */
  if new.estado_pagamento is distinct from 'aprovado' then
    return new;
  end if;

  if old.estado_pagamento = 'aprovado' then
    return new;
  end if;

  select decrypted_secret into chave_do_gatilho
    from vault.decrypted_secrets where name = 'SEGREDO_DO_GATILHO';

  select decrypted_secret into endereco
    from vault.decrypted_secrets where name = 'URL_DO_AVISO';

  /* Sem os segredos configurados, o pedido é aprovado do mesmo jeito e o
     aviso simplesmente não sai. Falhar aqui desfaria a aprovação de um
     pagamento que já aconteceu, por causa de uma configuração nossa: o
     dinheiro entrou e o pedido ficaria como não pago. */
  if chave_do_gatilho is null or endereco is null then
    return new;
  end if;

  select array_agg(u.email)
    into destinatarias
    from public.donas_da_loja d
    join auth.users u on u.id = d.id;

  if destinatarias is null or array_length(destinatarias, 1) = 0 then
    return new;
  end if;

  begin
    perform net.http_post(
      url := endereco,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-segredo-do-gatilho', chave_do_gatilho
      ),
      body := jsonb_build_object(
        'tipo', 'venda',
        'numero', new.numero,
        'total', new.total,
        'comprador', new.comprador_nome,
        'para', destinatarias
      )
    );
  exception when others then
    /* O aviso é consequência da venda, e não condição dela. Um erro de
       rede aqui não pode derrubar a aprovação do pagamento. */
    raise warning 'não consegui avisar a dona da venda: %', sqlerrm;
  end;

  return new;
end;
$$;

comment on function avisar_venda_paga is
  'Manda e-mail para as donas quando um pedido passa a aprovado. Só na virada, e nunca na criação: pedido de teste do CI não chega a aprovado.';

drop trigger if exists avisar_quando_vender on public.pedidos;

create trigger avisar_quando_vender
  after update of estado_pagamento on public.pedidos
  for each row
  execute function avisar_venda_paga();
