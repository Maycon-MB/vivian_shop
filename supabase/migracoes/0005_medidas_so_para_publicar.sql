-- Peso e medida passam a ser exigidos só para publicar, não para cadastrar.
--
-- A regra original recusava qualquer produto personalizado sem peso e sem
-- medidas. O motivo continua bom: sem eles o frete sai errado, e a
-- diferença sai do bolso dela em cada pedido.
--
-- Mas a regra impedia o passo anterior. O catálogo dela veio da Elojinha
-- com nome, preço, descrição e foto; peso e medida só existem no painel
-- logado e chegam depois. Com a regra como estava, não dava para guardar
-- nada até estar tudo pronto — e catálogo pela metade no banco é melhor
-- do que catálogo nenhum, desde que não vá ao ar assim.
--
-- Descoberto rodando a importação de verdade, com 61 produtos reais.
-- Nenhum teste tinha pego, porque todos os meus casos já vinham com peso.
--
-- A troca: rascunho pode estar incompleto, publicado não pode.

alter table produtos drop constraint if exists personalizado_tem_medidas;

alter table produtos add constraint publicado_tem_medidas
  check (
    not ativo
    or linha <> 'personalizada'
    or (peso_g is not null and alt_cm is not null
        and larg_cm is not null and comp_cm is not null)
  );

comment on constraint publicado_tem_medidas on produtos is
  'Produto personalizado só vai ao ar com peso e medidas. Rascunho pode estar incompleto.';

-- Pela mesma razão, a pasta do Drive vale para o digital publicado.
alter table produtos drop constraint if exists pedagogico_tem_pasta;

alter table produtos add constraint publicado_tem_pasta
  check (
    not ativo
    or linha <> 'pedagogica'
    or pasta_drive is not null
  );

comment on constraint publicado_tem_pasta on produtos is
  'Material digital só vai ao ar com a pasta do Drive: sem ela não há o que entregar.';
