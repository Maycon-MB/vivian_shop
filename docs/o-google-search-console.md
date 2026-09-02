# Cadastrar a loja no Google Search Console

Escrito em 02/09/2026, depois de o `sitemap.xml` entrar no ar. Ainda não
foi feito.

Registro meu. Não vira PDF.

---

## Para que serve, e o que não é

O sitemap já está no ar e o Google vai achá-lo sozinho, porque o
`robots.txt` aponta para ele. O Search Console faz duas coisas que isso
não faz:

1. **Avisa em vez de esperar.** Mandar o sitemap ali é dizer "leia agora",
   em vez de esperar a próxima passada do rastreador.
2. **Mostra o que ele achou e o que recusou.** É o único lugar onde dá
   para ver quantas das 342 páginas de produto foram indexadas, quais
   ficaram de fora, e por quê.

O segundo ponto é o que importa mais. Sem ele, "a loja não aparece no
Google" é uma frase sem diagnóstico, e a gente fica chutando.

**Não é anúncio, não custa nada, e não manda dado de cliente para lugar
nenhum.** É diferente do Google Analytics, que foi recusado em 27/08 por
mandar dado das clientes dela para o Google. O Search Console só fala
sobre as páginas, e não sobre quem as visita.

---

## Qual tipo de propriedade, e por quê

O Google oferece dois, e a escolha muda o que dá para ver.

| Tipo | Cobre | Como se prova |
|---|---|---|
| **Domínio** | `feitoparavocepapelaria.com.br`, com e sem `www`, http e https, e qualquer subdomínio | um registro TXT no DNS |
| Prefixo de URL | só o endereço exato que for digitado | arquivo no site, etiqueta na página, ou DNS |

**Vai de Domínio.** A loja responde nos dois endereços: a raiz pelos
quatro A e quatro AAAA, e o `www` pelo CNAME. Uma propriedade de prefixo
para `https://feitoparavocepapelaria.com.br/` **não enxergaria o `www`**,
e metade do diagnóstico ficaria de fora sem ninguém perceber.

E não depende da Vivian. O domínio está no CPF dela, mas eu entrei como
**contato técnico** (`MBMGC2`) em 21/08, e é esse papel que deixa editar a
zona. Ver [o-endereco-da-loja.md](o-endereco-da-loja.md).

---

## O cuidado que vem antes de tudo

**Mexer na zona é mexer no que mantém a loja no ar.**

O painel do registro.br edita o endereçamento em MODO AVANÇADO, e é ali
que estão os nove registros que fazem a loja responder. Se o editor pedir
a zona inteira, o TXT novo entra **junto com os nove**, e não no lugar
deles. Salvar só o TXT tira a loja do ar.

Esta é a zona de hoje, conferida em 02/09 por consulta ao DNS e não pela
tela:

```
feitoparavocepapelaria.com.br       A      185.199.108.153
feitoparavocepapelaria.com.br       A      185.199.109.153
feitoparavocepapelaria.com.br       A      185.199.110.153
feitoparavocepapelaria.com.br       A      185.199.111.153
feitoparavocepapelaria.com.br       AAAA   2606:50c0:8000::153
feitoparavocepapelaria.com.br       AAAA   2606:50c0:8001::153
feitoparavocepapelaria.com.br       AAAA   2606:50c0:8002::153
feitoparavocepapelaria.com.br       AAAA   2606:50c0:8003::153
www.feitoparavocepapelaria.com.br   CNAME  maycon-mb.github.io
```

Nenhum TXT existe hoje. O do Google será o primeiro.

---

## O passo a passo

**1. Abrir** [search.google.com/search-console](https://search.google.com/search-console)
e entrar com a conta Google que vai administrar isto.

Vale decidir agora de quem é essa conta. Se for a minha, ela some do
alcance dela no dia em que o contrato acabar. O certo é criar na conta
Google **dela** e me adicionar como usuário, que é o mesmo desenho do
domínio: dela, comigo com acesso técnico.

**2. Adicionar propriedade** → cartão da esquerda, **Domínio**.

Digitar sem `https://` e sem `www`:

```
feitoparavocepapelaria.com.br
```

**3. Ele devolve um registro TXT** parecido com:

```
google-site-verification=<uma sequência longa>
```

**4. No registro.br**: DNS → Configurar endereçamento → MODO AVANÇADO.

Acrescentar, **mantendo os nove que já estão lá**:

```
feitoparavocepapelaria.com.br   TXT   google-site-verification=<a sequência>
```

O editor não aceita `@`, então o nome vai completo, como nos outros.

**5. Conferir a propagação antes de clicar em verificar.** No PowerShell:

```powershell
Resolve-DnsName feitoparavocepapelaria.com.br -Type TXT
```

E conferir que a loja continua de pé, que é o que mais importa:

```powershell
(Resolve-DnsName feitoparavocepapelaria.com.br -Type A).IPAddress
curl.exe -s -o NUL -w "%{http_code}`n" https://feitoparavocepapelaria.com.br/
```

Quatro endereços e um `200`. Se der outra coisa, a zona foi salva sem os
nove, e é para voltar neles antes de qualquer outra coisa.

**6. Voltar ao Search Console e clicar em verificar.** Se reclamar,
esperar: a zona leva de minutos a algumas horas para propagar. Não é para
mexer no DNS de novo enquanto isso.

**7. Mandar o sitemap.** Menu da esquerda → **Sitemaps** → digitar:

```
sitemap.xml
```

Ele vai dizer quantos endereços leu. **Tem que dizer 487.** Se disser
menos, alguma coisa mudou no mapa e vale olhar antes de seguir.

---

## O que olhar depois, e quando

**Não é imediato.** Google leva de dias a algumas semanas para percorrer
342 páginas de um domínio sem histórico. Não adianta conferir no dia
seguinte e concluir que não funcionou.

Duas telas valem a visita, depois de uma ou duas semanas:

| Tela | A pergunta que ela responde |
|---|---|
| **Páginas** | quantas das 487 entraram, e o motivo das que ficaram de fora |
| **Desempenho** | o que as pessoas digitaram para chegar na loja |

A segunda é a que vira conversa com ela. Se as clientes chegam procurando
"lembrancinha personalizada" e não pelo nome da loja, isso muda o que vale
a pena escrever nas descrições dos produtos.

---

## O que não fazer

**Não apagar o TXT depois de verificar.** O Google reconfere de tempos em
tempos, e a propriedade cai junto com o registro. É para ele ficar lá,
para sempre.

**Não pedir indexação das 342 uma a uma.** A ferramenta de inspeção tem um
botão de "solicitar indexação", e ele serve para uma página específica que
mudou. Usado em massa, é trabalho manual que o sitemap já faz melhor.

**Não mexer na zona para mais nada na mesma sessão.** Uma mudança por vez,
com a conferência no meio. A loja no ar é o que paga o contrato.
