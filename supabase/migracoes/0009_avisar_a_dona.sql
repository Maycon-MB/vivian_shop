-- Quando uma cliente pede para falar com a loja, a Vivian é avisada.
--
-- É a última parte do que foi prometido a ela em 24/08, e a que faltava:
--
--   "eu peço nome e e-mail dela antes de mandar a mensagem pra você.
--    Assim, se você não estiver online no momento, ainda dá pra responder
--    depois por e-mail, em vez de perder a cliente"
--
-- Até aqui, "mandar a mensagem pra você" queria dizer deixá-la no painel.
-- Se ela não abrisse o painel, não ficava sabendo, e a cliente esperava
-- uma resposta que ninguém sabia que era para dar.
--
-- ── Onde os segredos ficam ─────────────────────────────────────────────
--
-- A chave do Resend e o segredo do gatilho NÃO ficam aqui. Este arquivo
-- vai para um repositório público. Eles vivem em `vault`, do Supabase,
-- e são lidos no momento da chamada.
--
-- Guardar em `vault`, e não numa tabela comum, importa: uma tabela sem
-- política de leitura ainda aparece inteira para quem tiver a chave de
-- serviço, e o vault é cifrado em repouso.
--
--     select vault.create_secret('re_...', 'RESEND_API_KEY');
--     select vault.create_secret('...',    'SEGREDO_DO_GATILHO');
--     select vault.create_secret('https://<ref>.supabase.co/functions/v1/avisar-a-dona', 'URL_DO_AVISO');

-- No Supabase o pg_net já vem instalado, no schema `net`.
create extension if not exists pg_net;

create or replace function avisar_a_dona()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chave_do_gatilho text;
  endereco text;
  pergunta text;
  destinatarias text[];
begin
  /* Só quando a conversa acaba de ser escalada. Sem esta guarda, cada
     mensagem seguinte da mesma cliente dispara outro e-mail, e ela para
     de abrir os avisos. */
  if new.escalada is not true or old.escalada is true then
    return new;
  end if;

  select decrypted_secret into chave_do_gatilho
    from vault.decrypted_secrets where name = 'SEGREDO_DO_GATILHO';

  select decrypted_secret into endereco
    from vault.decrypted_secrets where name = 'URL_DO_AVISO';

  /* Sem os segredos configurados, a conversa é salva do mesmo jeito e o
     aviso simplesmente não sai. Falhar aqui faria a cliente ver "não
     consegui enviar" por causa de uma configuração nossa, e ela iria
     embora achando que a loja está quebrada. */
  if chave_do_gatilho is null or endereco is null then
    return new;
  end if;

  select m.texto into pergunta
    from public.mensagens m
   where m.conversa_id = new.id and m.quem = 'cliente'
   order by m.criado_em desc
   limit 1;

  -- Todas as donas: a Vivian avisou que a irmã, a Lilian, resolve as
  -- coisas da loja junto com ela.
  select array_agg(u.email) into destinatarias
    from public.donas_da_loja d
    join auth.users u on u.id = d.id
   where u.email is not null;

  if destinatarias is null or array_length(destinatarias, 1) is null then
    return new;
  end if;

  /* Assíncrono de propósito. Se o envio fosse esperado aqui, a cliente
     ficaria olhando o botão girar enquanto o Resend responde.

     O `begin ... exception` não é zelo: sem ele, qualquer problema aqui
     derruba a transação inteira e a cliente recebe "não consegui enviar"
     por causa de um aviso que era só nosso. Aconteceu no primeiro teste
     de ponta a ponta, com um nome de schema errado, e a mensagem dela se
     perdeu junto. O aviso é importante; a mensagem é mais.

     `net.http_post`, e não `extensions.net.http_post`: no Supabase o
     pg_net já vem instalado no schema `net`, e o nome com três partes é
     lido como banco.schema.função. */
  begin
    perform net.http_post(
      url := endereco,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-segredo-do-gatilho', chave_do_gatilho
      ),
      body := jsonb_build_object(
        'nome', new.nome,
        'email', new.email,
        'pergunta', coalesce(pergunta, '(sem texto)'),
        'para', destinatarias
      )
    );
  exception when others then
    -- Fica no log do Postgres, e a mensagem da cliente segue gravada.
    raise warning 'não consegui avisar a dona: %', sqlerrm;
  end;

  return new;
end;
$$;

comment on function avisar_a_dona is
  'Manda e-mail para as donas quando uma cliente pede para falar com a loja.';

drop trigger if exists avisar_quando_escalar on conversas;

create trigger avisar_quando_escalar
  after update on conversas
  for each row
  execute function avisar_a_dona();
