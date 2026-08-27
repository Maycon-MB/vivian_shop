-- O convite de avaliação sai sozinho, duas semanas depois do pagamento.
--
-- Sem isto, a tela de avaliar existe e ninguém chega nela: o link carrega
-- uma chave que só aquele pedido tem, e ela não está em lugar nenhum além
-- do e-mail. A funcionalidade inteira que entrou em 26/08 seria código
-- morto.
--
-- ── Por que duas semanas, e não no dia da entrega ──────────────────────
--
-- A loja não sabe quando o pacote chegou. Sabe quando o pagamento foi
-- aprovado, e sabe que dali saem 5 dias úteis de produção mais o prazo dos
-- Correios. Convidar antes disso é pedir opinião sobre um pacote que ainda
-- não chegou, e a resposta seria sobre a espera.
--
-- Quatorze dias cobre produção e entrega com folga, e cai depois da festa,
-- que é quando a cliente tem o que contar. É um número escolhido, não
-- medido: quando houver rastreio de verdade, o certo passa a ser contar da
-- entrega.

create extension if not exists pg_cron;

/**
 * Manda o convite dos pedidos que já podem ser avaliados.
 *
 * Roda uma vez por dia. Um pedido entra quando o pagamento foi aprovado há
 * mais de quatorze dias e o convite ainda não saiu; `convite_de_avaliacao_em`
 * é marcado na mesma passada, e é o que impede a cliente de receber o
 * mesmo pedido de opinião todo dia até responder.
 */
create or replace function convidar_para_avaliar()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  chave_do_gatilho text;
  endereco text;
  pedido record;
  quantos integer := 0;
begin
  select decrypted_secret into chave_do_gatilho
    from vault.decrypted_secrets where name = 'SEGREDO_DO_GATILHO';

  select decrypted_secret into endereco
    from vault.decrypted_secrets where name = 'URL_DO_CONVITE';

  -- Sem os segredos, não faz nada e não reclama: é configuração pendente,
  -- e não erro que precise acordar alguém.
  if chave_do_gatilho is null or endereco is null then
    return 0;
  end if;

  for pedido in
    select
      pe.id,
      pe.comprador_nome,
      pe.comprador_email,
      pe.chave_da_avaliacao,
      array_agg(pr.nome) as produtos
    from public.pedidos pe
    join public.itens_do_pedido it on it.pedido_id = pe.id
    join public.produtos pr on pr.id = it.produto_id
    where pe.estado_pagamento = 'aprovado'
      and pe.convite_de_avaliacao_em is null
      /* De `criado_em`, e não de `atualizado_em`.

         Existe um gatilho que reescreve `atualizado_em` a cada toque no
         pedido. Contando dali, marcar o código de rastreio reiniciaria a
         contagem, e o convite seria adiado a cada vez que ela mexesse no
         pedido: quem cuida bem do pedido nunca receberia o convite.

         `criado_em` não se move, e o pagamento cai minutos depois da
         compra. A diferença entre os dois é irrelevante ao lado de
         quatorze dias. */
      and pe.criado_em < now() - interval '14 days'
      /* Nunca para endereço de exemplo.

         O teste de compra do CI cria um pedido de verdade a cada push,
         com `ana@exemplo.com.br`. Sem esta linha, em quatorze dias o
         convite sairia para um endereço que não existe, e cada devolução
         derruba a reputação de um domínio recém-verificado: o e-mail dela
         para as clientes de verdade passa a cair em spam.

         `exemplo.com` e `example.com` são reservados por norma justamente
         para isso, e nunca recebem nada. */
      and pe.comprador_email !~* '@(exemplo|example)\.(com|com\.br|org|net)$'
      and pe.comprador_email !~* '@testuser\.com$'
    group by pe.id
    /* Teto por rodada. Se um dia acumular pedido antigo sem convite, o
       envio se espalha por vários dias em vez de disparar centenas de
       e-mails de uma vez, que é o que faz um domínio novo ser marcado
       como spam e derruba a entrega de tudo. */
    limit 30
  loop
    begin
      perform net.http_post(
        url := endereco,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-segredo-do-gatilho', chave_do_gatilho
        ),
        body := jsonb_build_object(
          'para', pedido.comprador_email,
          'nome', pedido.comprador_nome,
          'chave', pedido.chave_da_avaliacao,
          'produtos', pedido.produtos
        )
      );

      update public.pedidos
         set convite_de_avaliacao_em = now()
       where id = pedido.id;

      quantos := quantos + 1;
    exception when others then
      -- Um pedido que falhou não pode derrubar os outros vinte e nove.
      raise warning 'não consegui convidar o pedido %: %', pedido.id, sqlerrm;
    end;
  end loop;

  return quantos;
end;
$$;

comment on function convidar_para_avaliar is
  'Manda o convite de avaliação dos pedidos aprovados há mais de 14 dias.';

/* Nove da manhã, e não de madrugada: se algo der errado, o erro aparece
   num horário em que alguém está acordado para ver. O horário do banco é
   UTC, então 12h aqui são 9h no Brasil. */
select cron.unschedule('convidar-para-avaliar')
where exists (select 1 from cron.job where jobname = 'convidar-para-avaliar');

select cron.schedule(
  'convidar-para-avaliar',
  '0 12 * * *',
  $$ select convidar_para_avaliar(); $$
);
