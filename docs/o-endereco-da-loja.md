# O endereço da loja

**No ar em https://feitoparavocepapelaria.com.br desde 21/08/2026.**

Registro meu. Não vira PDF.

---

## O que está feito

| | |
|---|---|
| Domínio | `feitoparavocepapelaria.com.br` |
| Titular | [dado pessoal removido], CPF [dado pessoal removido] |
| Contato técnico | Maycon, ID `MBMGC2` |
| Registrado em | 21/08/2026 |
| **Vence em** | **21/08/2027** |
| Servidores DNS | os do próprio registro.br (`a.auto.dns.br`, `b.auto.dns.br`) |
| Pago por | ela, no cartão dela, direto no registro.br |

Conferido no RDAP do registro.br, não na tela: `rdap.registro.br/domain/feitoparavocepapelaria.com.br`.

### Por que no nome dela

A cláusula 6.3 do contrato promete que a loja é dela. Domínio registrado
no meu CPF tornaria essa promessa falsa: se um dia a gente parasse de
trabalhar junto, ela perderia o endereço, e com ele todo link que já
circulou.

Quem paga não define o titular; quem define é o CPF no cadastro. Por isso
recusei receber os R$ 40 por Pix e pedi que ela pagasse direto.

Eu entrei como **contato técnico**, que é o papel que deixa editar o DNS
sem tocar em titularidade e sem nunca precisar da senha dela.

---

## O nome que não deu

O primeiro escolhido foi `feitoparavocepersonalizados.com.br`, igual ao
Instagram dela. Não existe: **o `.com.br` aceita no máximo 26 caracteres**,
e esse tem 27.

O `feitoparavoce.com.br` sozinho é do Itaú desde 2004.

E teve um susto pelo caminho: a busca foi feita com `feitopravoce`, sem o
"a", que **está registrado** desde 2024 por outra pessoa. Uma letra a menos
e o pagamento teria ido para o endereço errado, sem volta. Foi o que fez a
regra de conferir o nome escrito, letra por letra, antes de pagar.

`papelaria` acabou melhor do que o nome original: as duas linhas dela são
"papelaria personalizada" e "papelaria pedagógica". Cobre as duas.

---

## A mudança de código que o domínio obrigou

Sem domínio, o GitHub Pages serve um repositório em
`maycon-mb.github.io/vivian_shop`. Com domínio, serve **na raiz**.

Manter o `basePath` faria todo link e toda imagem apontarem para
`feitoparavocepapelaria.com.br/vivian_shop/`, que não existe. O site
publicaria "com sucesso" e abriria quebrado.

Por isso a ordem é **código, DNS, publicação**, e nunca publicação antes do
DNS: no instante em que o CNAME entra no ar, o GitHub passa a redirecionar
o endereço antigo para o domínio, e se ele ainda não resolver, a loja fica
inacessível até a propagação terminar.

### A chave: `DOMINIO_PRONTO`

O código dos dois mundos vive na `main`, e quem decide qual vale é uma
variável do repositório:

| `DOMINIO_PRONTO` | Onde a loja mora | CNAME |
|---|---|---|
| ausente ou `false` | `maycon-mb.github.io/vivian_shop` | não escrito |
| `true` | raiz de `feitoparavocepapelaria.com.br` | escrito a cada build |

Isso existe porque a alternativa era deixar a mudança numa branch esperando
o DNS. Branch parada é trabalho invisível: quem der `git pull` em outra
máquina não vê nada, e o que está pendente só existe na cabeça de quem
criou.

Ligar em **Settings → Secrets and variables → Actions → aba Variables**,
que é a mesma aba do `NEXT_PUBLIC_FORMULARIO_URL`. Não é segredo: o valor
aparece no HTML publicado de qualquer forma.

A próxima publicação depois de ligar já vira a chave. Nenhum merge, nenhuma
branch, nenhum comando local.

Os dois modos têm teste: montei e rodei a navegação completa nos dois, 25
de 25 em cada um.

O `CNAME` é escrito pelo `publicar.mjs` a cada build. Não pode ser
commitado à mão na branch de publicação: o `gh-pages` apaga o que não está
em `dist/`, e o domínio se "desconfigura sozinho" a cada deploy.

Os endereços antigos continuam abrindo: o próprio GitHub redireciona
`maycon-mb.github.io/vivian_shop/...` para o domínio.

---

## O DNS, quando o domínio sair da transição

Domínio recém-registrado fica algumas horas "em transição" e não aceita
edição de zona. Em 21/08/2026 às 13h faltavam ~2h.

No painel: **DNS → Configurar endereçamento → MODO AVANÇADO**. A tela
simples não serve: aceita um endereço só, e são nove registros.

O editor **não aceita `@`**, então o nome vai completo:

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

Sem MX e sem TXT: ela não tem e-mail no domínio, e mexer no que não precisa
só cria chance de erro.

Os quatro IPv4 são do GitHub Pages e existem para redundância. Os quatro
IPv6 não são enfeite: sem eles, quem estiver em rede só-IPv6 não abre a
loja. Endereços conferidos na documentação do GitHub em 21/08/2026.

---

## Como ficou, e o que foi conferido

Tudo feito em 21/08/2026, no mesmo dia:

1. ~~Registrar o domínio~~
2. ~~Contato técnico~~ `MBMGC2`
3. ~~Tirar o `basePath` do código~~ na `main`, atrás de `DOMINIO_PRONTO`
4. ~~Cadastrar os nove registros~~
5. ~~Conferir a propagação~~
6. ~~`DOMINIO_PRONTO=true`~~
7. ~~Publicar~~
8. ~~HTTPS obrigatório~~

Conferido contra o site no ar, e não presumido:

| O quê | Resultado |
|---|---|
| `https://feitoparavocepapelaria.com.br/` | 200 |
| `https://www.feitoparavocepapelaria.com.br/` | 200 |
| `http://` | 301 para `https://` |
| Certificado | válido, emitido no mesmo dia |
| Endereço antigo | 301 para o domínio |
| Links com o prefixo velho | zero |
| Navegação completa | 25 de 25 |
| Links | 37 páginas, todas respondem |

### Os dois erros do caminho

**Um IP com uma letra a menos.** O `185.199.110.15` estava sem o `3` final.
Pegou porque conferi a tela linha por linha em vez de aceitar o "feito".
Um IP errado no meio de quatro não derruba o site: ele fica lento e falha
em uma tentativa a cada quatro, que é o tipo de defeito que ninguém
associa a DNS.

**CNAME na raiz.** A nona entrada tinha sido criada em
`feitoparavocepapelaria.com.br` em vez de `www`. CNAME não pode conviver
com registros A no mesmo nome: não é preciosismo, é inválido, e o
resultado é imprevisível.

**E um terceiro, meu:** o botão "Run workflow" não publicava. A condição
do job exigia `push`, então ligar a variável rodou os testes verdes e não
mudou nada no ar. Eu tinha documentado esse passo errado aqui mesmo.
Corrigido: agora publica também no `workflow_dispatch`, o que vale para
qualquer variável futura.

---

## Renovação

**21 de agosto de 2027**, R$ 40, no cartão dela.

Se vencer, o endereço volta a ficar livre para qualquer um, e o que estava
no ar sai. O contrato me obriga a avisar antes, mas a conta é dela e o
controle também.
