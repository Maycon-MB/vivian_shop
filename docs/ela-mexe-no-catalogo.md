# Ela mexe no catálogo

Em 24/08/2026 a Vivian pediu, depois de ver a loja no ar:

> "Amanhã vc me mostra como faço para editar produtos... incluir um
> produto... modificar preços...ok"

Até então o painel sabia publicar e tirar do ar o que veio da Elojinha, e
mais nada. Agora ela cadastra e edita.

Registro meu. Não vira PDF.

---

## O que ela consegue fazer

| | |
|---|---|
| Cadastrar produto | sim |
| Mudar preço, nome, descrição | sim |
| Mudar peso e medidas da caixa | sim |
| Trocar o tema | sim |
| Publicar e tirar do ar | já existia |
| Apagar produto | **não, de propósito** |
| Trocar a foto | ainda não |

**Apagar não existe e não é esquecimento.** Produto apagado leva junto o
histórico de quem comprou aquilo e some do relatório do mês passado como
se nunca tivesse existido. O que ela quer quando pensa em "excluir" é
parar de vender, e isso é tirar do ar. O banco nem tem política de
`delete`.

---

## As três decisões que moldaram a tela

**Uma tela inteira, e não um modal.** Ela administra a loja pelo celular,
entre uma encomenda e outra. Modal em tela pequena fica atrás do teclado, e
metade do formulário some na hora de digitar.

**Rascunho pode estar incompleto; publicado não.** Ela cadastra o produto
antes de embalar, e o peso da caixa ela só sabe depois. Um formulário que
se recusa a guardar o que já foi digitado é como ela perde o trabalho e
não volta. Quando marca "deixar no ar", aí sim peso e medidas são
cobrados — e o recado diz o porquê, e não só a regra:

> Para colocar no ar, falta o peso, a altura da caixa fechada. Sem isso o
> frete sai errado, e a diferença sai do seu bolso.

**O preço aceita vírgula.** "13,70" é como se escreve preço em português e
é o que o teclado do celular oferece. Recusar isso seria culpar a pessoa
por escrever certo.

---

## O que não muda quando ela edita

**O endereço do produto.** Ele nasce do nome e fica. Se ela corrigir uma
letra em "Lousa Mágica - Peppa Pigg", o link continua
`/produto/lousa-magica-peppa-pig/` — que é o que a cliente salvou e o que
o Google já indexou. Mudar o endereço quebraria os dois de uma vez, em
silêncio.

O endereço também desfaz os pontos que ela usava no marketplace:
"P.e.p.p.a P.i.g" vira `peppa-pig`. Os pontos existiam para escapar do
filtro de marca do Elo7; aqui só atrapalham quem procura, porque ninguém
digita "p.e.p.p.a".

---

## O que já estava pronto no banco, e por isso não teve migração

Nada foi criado para isto. As políticas de escrita entraram na migração
[0003](../supabase/migracoes/0003_cadastro_pela_dona.sql), quando o painel
ainda não tinha formulário nenhum, e a
[0005](../supabase/migracoes/0005_medidas_so_para_publicar.sql) já tinha
afrouxado a exigência de peso para valer só na publicação.

Conferido contra o banco de verdade em 25/08, e não no papel:

| Teste | Resultado |
|---|---|
| As 16 colunas que o formulário grava existem | sim |
| Chave pública tentando cadastrar produto | recusado, `42501` |

A segunda linha é a que importa: a chave anônima vai dentro da página e
qualquer um a copia em dez segundos. Ela não escreve nada. Quem escreve é
quem está na tabela `donas_da_loja`, e é o Postgres que decide isso, não o
JavaScript da tela.

**O que ainda não foi provado contra o banco:** que a conta dela consegue
gravar de verdade. Isso exige entrar com a senha de uma dona, e a da conta
de teste vive nos segredos do repositório, não nesta máquina. As telas
foram conferidas com o banco respondido por dados de teste. É o primeiro
item a fazer na máquina que tiver a credencial.

---

## O modal que mentia

Havia um botão "Novo produto" no topo do painel que abria um formulário de
demonstração. Ele preenchia bonito, mostrava "Produto cadastrado nas duas
lojas!" e não gravava nada.

Isso passou meses ali porque a tela de demonstração e a tela de verdade
convivem no mesmo painel: com banco configurado ela vê a de verdade, sem
banco vê a de exemplo. O botão do topo não olhava para isso.

Com banco, ele agora leva para o catálogo de verdade. Sem banco, continua
abrindo o exemplo, que é o que a demonstração precisa.

---

## Como conferir a tela sem a senha dela

A regra do projeto é olhar a tela, e não confiar no teste. Os dois piores
defeitos daqui passaram por build, lint e teste de unidade.

```
cd loja && DOMINIO_PRONTO=true npx next dev -p 4100
node scripts/fotografar-painel.cjs http://localhost:4100
```

O script põe uma sessão de mentira no navegador e responde no lugar do
banco. Não afrouxa nada: o que protege os dados são as políticas do
Postgres, e ali o banco nem chega a ser consultado. O que se confere é o
desenho.

**Use `localhost`, e não `127.0.0.1`.** O Next 16 recusa os arquivos da
página quando a origem não bate, e o resultado é uma tela em branco sem
erro nenhum no console. Já perdi tempo com isso.

Esta rodada pegou um defeito que teste nenhum pegaria: o cabeçalho do
formulário herdou o `space-between` da lista e jogou o título contra a
borda direita, onde no celular ele saía cortado.
