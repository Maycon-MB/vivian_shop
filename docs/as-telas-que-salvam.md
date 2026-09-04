# As telas que salvam, e a armadilha do banco

Escrito em 04/09/2026, depois de a Vivian perguntar se o sistema avisa a
cada compra e a resposta ter destapado um problema maior.

Registro meu. Não vira PDF.

---

## O que estava acontecendo

A aba de Configurações do painel era **maquete**. Campos com valor fixo,
sem estado, e um botão "Salvar alterações" que era um `<button>` sem
`onClick`. Ela podia digitar, clicar, fechar a tela, e nada tinha
acontecido.

O pior campo era o CEP. A tela dizia:

> **De onde você envia** — usado para calcular o frete de quem compra.

E o cálculo do frete lia o CEP de uma variável de ambiente que só eu
mexia. Ela preencheria o endereço da casa dela, veria o botão de salvar, e
iria embora achando que tinha configurado o frete da própria loja.

Ninguém tinha olhado aquela tela. O `fotografar-painel.cjs` fotografava
catálogo, mensagens, recebimento e relatórios, e pulava Configurações.
Agora fotografa.

---

## A armadilha que apareceu no meio do caminho

Esta parte vale para **toda tela de salvar deste projeto**, e é a razão de
este documento existir.

> **Quando a política de segurança do Postgres barra um `update`, o banco
> não devolve erro. Devolve zero linhas alteradas.**

Um código que só olha `error` conclui que deu certo:

```ts
const { error } = await banco.from('tabela').update(...).eq('id', true)
if (error) throw new Error(error.message)   // nunca dispara
```

Isso é pior do que o botão que não fazia nada. O botão morto pelo menos
não mentia: ela clicava e nada acontecia na tela. Com este, ela clica, vê
o visto verde, e vai embora confiando numa configuração que o banco
recusou.

### O conserto

Pedir as linhas de volta e conferir que veio alguma:

```ts
const { data, error } = await banco
  .from('tabela')
  .update({ ...campos })
  .eq('id', true)
  .select('id')

if (error) throw new Error(error.message)

if (!Array.isArray(data) || data.length === 0) {
  throw new Error('O banco não alterou nenhuma linha.')
}
```

### Onde isso já está aplicado

| Arquivo | Tela | O que estaria em jogo |
|---|---|---|
| [configuracoesNoBanco.ts](../loja/src/dados/configuracoesNoBanco.ts) | Configurações | o CEP de onde o pacote sai |
| [comoElaRecebeNoBanco.ts](../loja/src/dados/comoElaRecebeNoBanco.ts) | Como eu recebo | **quanto sai do bolso de quem compra** |

O segundo foi achado por causa do primeiro, e é o que doeria mais: ela
ajustaria parcelas, juros ou desconto no Pix, veria "salvo", e a loja
seguiria cobrando o de antes. O sintoma chegaria como ela desconfiando da
própria memória, e não do sistema.

**Toda tela nova que grave no banco tem que fazer isso.** Não é detalhe de
implementação: é a diferença entre a tela dizer a verdade e mentir com
confiança.

---

## O CEP saiu da variável e entrou no banco

O `cotar-frete` lê `cep_de_origem` da tabela `configuracoes_da_loja`, pelo
servidor e com a chave de serviço. O que ela digita vale na cotação
seguinte, sem passar por mim.

A variável `MELHORENVIO_CEP_ORIGEM` continua, como rede: se o campo ficar
vazio, o frete não pode parar de funcionar por causa de um campo apagado
sem querer.

Conferido em 04/09, com o campo ainda vazio no painel:

```
POST /functions/v1/cotar-frete   ->  200
Jadlog .Package  R$ 19,93   6 dias
Jadlog .Com      R$ 20,43   5 dias
Correios PAC     R$ 26,28   5 dias
Correios SEDEX   R$ 37,52   2 dias
```

---

## A tabela não tem leitura pública, e isso foi de propósito

Eu tinha mandado seguir o padrão da migração `0010`, a de pagamento. Era o
padrão errado.

A `0010` tem leitura pública porque a **vitrine** precisa dela: a página do
produto diz "em até 3x sem juros" antes de qualquer login, e isso ajuda a
fechar a venda.

A `0019` guarda outra coisa. `cep_de_origem` e `endereco_de_origem` são **o
endereço da casa dela**. A chave anônima vai dentro da página e qualquer um
a copia em dez segundos: com `using (true)`, o endereço dela sairia numa
chamada de uma linha, para quem abrisse a loja.

Este projeto já pagou esse preço. A branch `gh-pages` guardava 134 commits
de build, e os antigos traziam o CEP da casa dela compilado dentro do
JavaScript: o site atual estava limpo e o histórico continuava servindo o
dado.

Conferido depois da migração:

```
GET /rest/v1/configuracoes_da_loja?select=cep_de_origem,endereco_de_origem
com a chave anônima  ->  []
```

Ninguém além dela precisa ler isto no navegador: o nome e a frase da loja
são resolvidos no build, e o `cotar-frete` lê pelo servidor.

---

## O que a tela avisa, e por quê

Duas coisas que ela não teria como adivinhar:

**O nome e a frase da loja não mudam na hora.** São metadata resolvida
quando o site é montado, e a loja republica sozinha duas vezes por dia.
Sem esse aviso, a gente trocaria um engano por outro.

**Se o CEP ficar em branco, o frete continua saindo**, pelo endereço
guardado comigo. É o único campo da tela que muda a loja na hora, e por
isso é o único com aviso.

---

## O aviso de venda, que começou tudo

A pergunta dela foi se o sistema avisa a cada compra. Não avisava: o único
gatilho de e-mail era em `conversas`, quando uma cliente escreve.

E a tela dizia que sim, com três caixas marcadas, uma delas prometendo
**mensagem no WhatsApp** — canal que este projeto decidiu não usar, na
migração `0008`.

Agora avisa de verdade, pela migração `0018`, e o gatilho é **na virada
para pagamento aprovado**, e não na criação do pedido. Duas razões:

1. O pedido nasce antes de a cliente pagar. Avisar no nascimento encheria a
   caixa dela de carrinho abandonado.
2. **O teste de navegação cria pedido de verdade no banco a cada push.** Já
   custou onze pedidos falsos em 25/08. Gatilho em `insert` faria cada
   envio de código virar e-mail de venda para ela. Pedido de teste nunca
   chega a aprovado.

O cartão "Quando eu te aviso" agora **descreve** o que acontece, em vez de
oferecer escolha que não salva. Caixa que não grava é pior do que ausência
de caixa: promete e some no próximo carregamento.
