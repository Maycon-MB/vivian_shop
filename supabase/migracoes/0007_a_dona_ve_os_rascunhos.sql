-- A dona enxerga o catálogo inteiro, e não só o que está no ar.
--
-- Faltava. A migração 0003 deu a ela permissão de criar e editar produto,
-- e eu não percebi que ler continuava valendo a regra pública: "qualquer
-- um lê produto ativo". Com os 343 produtos importados como rascunho, a
-- tela de produtos dela abria vazia — ela não conseguia ver justamente o
-- que precisava publicar.
--
-- O defeito só apareceu com dado de verdade na tela. Nenhum teste pegaria:
-- os de unidade usam lista em memória, e o do banco só provava que a chave
-- pública não vê o que não deve.

create policy "a dona vê todos os produtos"
  on produtos for select
  to authenticated
  using (e_dona_da_loja());

create policy "a dona vê todos os temas"
  on temas for select
  to authenticated
  using (e_dona_da_loja());

comment on policy "a dona vê todos os produtos" on produtos is
  'Inclui rascunho: é o que ela precisa ver para decidir o que publicar.';
