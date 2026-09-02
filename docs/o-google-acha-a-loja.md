# O Google acha a loja

Feito em 01/09/2026. A loja passou a publicar `sitemap.xml` e
`robots.txt`, gerados junto com as páginas.

Registro meu. Não vira PDF.

---

## O que estava errado

`https://feitoparavocepapelaria.com.br/sitemap.xml` devolvia a página de
erro da loja. `robots.txt` não existia. O `dist/` não gerava nenhum dos
dois.

Isso contradizia a razão de a loja ser estática. Está escrito no
`CLAUDE.md`: o catálogo entra no build para o Google conseguir ler as 342
páginas de produto. Ler ele conseguia. **Achar, não.** Sem mapa, ele
precisa descobrir as 342 navegando link a link.

E a loja não tem de onde ser descoberta. Ela saiu do Elo7 em maio e não
herdou nada: nenhum link de fora apontando para cá, nenhum histórico de
busca, ninguém procurando pelo nome dela ainda. Era o item de maior
retorno pelo menor trabalho.

---

## Onde o mapa é gerado, e por quê

No `scripts/publicar.mjs`, junto com as páginas.

Não é escolha de arrumação. A lista de endereços **é** o catálogo: o
`baixar-catalogo.mjs` acabou de trazer do banco o que ela publicou, e as
páginas foram geradas a partir do mesmo arquivo. Gerar o mapa de outra
fonte, ou escrevê-lo à mão, criaria duas verdades que divergem no primeiro
dia em que ela despublicar um produto.

Do jeito que ficou, **produto despublicado no painel some do site e do
mapa na mesma publicação**, sem ninguém precisar lembrar de nada. Isso
tem teste próprio, e o teste quebra se um dia o mapa passar a ler outro
lugar.

### O que o mapa tem

487 endereços:

| | Quantos |
|---|---|
| Páginas fixas (`/`, `/produtos/`, `/sobre/`, `/como-funciona/`, `/politicas/`) | 5 |
| Páginas de produto | 342 |
| Páginas de tema | 140 |

### O que ele não tem, de propósito

`/admin/`, `/checkout/`, `/minha-conta/`, `/pedido-confirmado/`,
`/avaliar/` e `/baixar/`.

O painel é dela. O resto é meio de caminho de uma compra: quem chega pelo
Google direto no checkout chega num carrinho vazio, e `/baixar/` e
`/avaliar/` só fazem sentido com o código que foi mandado por e-mail para
uma cliente específica. Os mesmos caminhos estão barrados no `robots.txt`.

### Sem `lastmod`, `changefreq` nem `priority`

Os dois últimos o Google ignora, e diz isso na documentação dele.

O `lastmod` seria pior do que ausente. O catálogo publicado não guarda
data de alteração, e a única data à mão é a da publicação. Como a loja
republica sozinha duas vezes por dia, o mapa carimbaria as 342 páginas com
o mesmo instante, duas vezes por dia, para sempre. Sitemap que jura que
tudo mudou hoje é sitemap que o Google aprende a não acreditar.

---

## Por que o arquivo de regras é `.mjs`, e não `.ts`

[mapaDoSite.mjs](../loja/src/dominio/mapaDoSite.mjs) é o único arquivo em
`dominio/` que não é TypeScript, e isso tem um motivo estreito.

Quem monta o sitemap é o `publicar.mjs`, que roda no Node cru, sem passar
por compilador nenhum. Quem confere as regras é o vitest. **Os dois
precisam carregar o mesmo arquivo.** Em `.ts`, ou o script de publicação
não conseguia importar, ou a regra teria que ser escrita duas vezes, e
regra escrita duas vezes é regra que diverge.

Os tipos vêm por JSDoc, e o `tsc --noEmit` do CI confere o teste que o
importa.

---

## Como isso é conferido, e não só testado

Duas camadas, e as duas rodam no CI a cada push.

**As regras**, em [mapaDoSite.test.ts](../loja/src/dominio/mapaDoSite.test.ts),
16 testes. Eles falam da consequência, e não do formato: produto publicado
aparece, produto despublicado some, painel dela não vira resultado de
busca, endereço não se repete.

**Os 487 endereços**, no `verificar-links.cjs`. Ele passou a ler o
`<loc>` do sitemap e a abrir cada um contra o site montado.

A segunda camada é a que importa mais, e por um motivo: **nenhuma página
da loja aponta para o sitemap**. O rastreador daqui nunca chegaria nele
sozinho, e ele poderia sumir da publicação sem nada ficar vermelho, que é
exatamente como o endereço passou meses devolvendo página de erro.

E sitemap que aponta para 404 é pior do que sitemap nenhum: o Google acha
o erro antes de achar a loja.

Conferido em 01/09, contra o site montado em `127.0.0.1`:

```
DOMINIO_PRONTO=true node scripts/publicar.mjs
  sitemap.xml e robots.txt escritos em https://feitoparavocepapelaria.com.br (482 páginas de catálogo)

DOMINIO_PRONTO=true BASE_DA_LOJA=http://127.0.0.1:4173 node scripts/verificar-links.cjs
  paginas verificadas: 495
  todos os links respondem
```

---

## O detalhe do `/vivian_shop`

O endereço da loja depende de `DOMINIO_PRONTO`, como tudo aqui. O mapa
precisa de endereço absoluto e completo, então ele lê a mesma variável.

O `robots.txt` tem uma armadilha a mais: os caminhos barrados nele valem
do alto do domínio para baixo, e não da pasta onde a loja mora. Escrever
`Disallow: /admin/` num site servido em `github.io/vivian_shop/` estaria
barrando o admin de outra pessoa, e deixando o dela aberto. Por isso o
prefixo entra nos dois lados, e existe teste para isso.

---

## O que ainda depende de gente

O arquivo existe e responde. Falta **cadastrar a loja no Google Search
Console** e mandar o sitemap lá, que é o que acelera a leitura e é o único
lugar onde dá para ver o que ele achou e o que recusou.

**Correção de 02/09.** Eu tinha escrito aqui que isso dependia da Vivian,
porque o domínio está no CPF dela. Não depende: eu entrei como contato
técnico em 21/08, e é esse papel que deixa editar a zona de DNS, que é
como o Google confere quem é dono.

Passo a passo, e o cuidado de não derrubar a loja mexendo na zona:
[o-google-search-console.md](o-google-search-console.md).
