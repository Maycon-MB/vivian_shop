# Identidade visual da loja — design

**Data:** 2026-08-10
**Status:** aprovado, publicado em https://maycon-mb.github.io/vivian_shop/
**Escopo:** direção visual da loja online. Não cobre arquitetura, backend nem escopo funcional — esses vêm em spec própria.

---

## Contexto

O projeto deixou de ser proposta comercial e virou contrato: 12x R$200 de desenvolvimento e R$100/mês de manutenção. A cliente pediu, em ordem de prioridade declarada por ela: loja online, posts de Instagram, tráfego pago.

Ela opera hoje duas marcas no Elo7:

| Marca | O que vende | Cores da logo |
|---|---|---|
| **Feito para Você** | Papelaria personalizada | Azul-bebê, verde-água, rosa, script magenta |
| **Projeto Educar** | Atividades pedagógicas e psicopedagógicas, inclusão escolar | Azul vivo, amarelo, preto |

Decisão de produto já fechada: **uma loja com duas seções**, não duas lojas. Reduz custo de infra, concentra o tráfego pago numa campanha e permite venda cruzada entre as linhas.

## Problema

Duas marcas com paletas incompatíveis precisam dividir uma página só. Três saídas erradas foram descartadas:

1. **Escolher um azul de compromisso entre os dois.** Resultado é um azul genérico que não pertence a nenhuma das marcas.
2. **Criar uma terceira identidade guarda-chuva.** Apaga o reconhecimento que ela construiu no Elo7 desde 2024.
3. **Manter o protótipo atual** (lilás `#9B89B3`, Pearl, Mint, Playfair Display). Essa paleta não veio das marcas dela — foi inventada. Não tem relação com nada que ela publica.

## Direção adotada

**A loja é um caderno.** As duas linhas ocupam páginas opostas do mesmo caderno: mesmo papel, mesma pauta, cores de destaque próprias.

A metáfora não é decorativa. As artes que ela mesma publica no Instagram já usam papel colado com percevejo, bloco de notas, corações desenhados à mão e lápis. A estética já existia; faltava sistematizá-la.

A pauta do caderno é a **grade real do layout** — 32px de baseline — não uma textura de fundo.

### Paleta

> **Refeita em 31/08/2026**, e a razão é dela: "o site tem como ficar mais
> colorido? Estou achando tão mortinho... pálido."
>
> Não era falta de cor. Era a cor errada. A paleta abaixo saía das duas
> logos antigas do Elo7, e o azul-marinho era "a raiz comum" delas. A logo
> nova, que ela mandou no mesmo dia, **não tem azul-marinho em lugar
> nenhum**: o site estava usando a cor de uma marca que ela não usa mais.
>
> Os valores agora são medidos dentro do arquivo da logo, e não escolhidos
> por mim. Ver o cabeçalho de `loja/src/app/globals.css`.

| Token | Hex | Função | Origem na logo nova |
|---|---|---|---|
| `paper` | `#FBFAF7` | Fundo | Sulfite, não papel envelhecido |
| `ink` | `#7B1E4B` | Todo o texto e a marca | O vinho do "Feito para você!" escrito à mão |
| `chalk` | `#237C79` | Acento, links | O anel de fora, escurecido para alcançar contraste |
| `ceu` | `#C1ECFD` | Fundo do herói | O fundo do círculo, medido no canto do arquivo |
| `rosa` | `#F8C1CC` | Fundo de seção | O anel de dentro |
| `heart` | `#D93B54` | Preço e promoção | Os corações |
| `marker` | `#F2C14E` | Preenchimento, linha pedagógica | O lápis |

**A cor entra nos fundos, não no texto.** Rosa e azul-claro não carregam
letra; é assim que a loja ganha cor sem perder contraste. O coral é o
único saturado que aparece escrito, e só em preço: cor forte usada em tudo
para de significar alguma coisa.

<details>
<summary>A paleta antiga, de 10/08 a 31/08</summary>

| Token | Hex | Origem |
|---|---|---|
| `ink` | `#12305B` | Azul de caneta, a raiz comum dos azuis das duas logos do Elo7 |
| `rule` | `#A8C6E8` | Azul-bebê do fundo da logo antiga |
| `chalk` | `#2E9B96` | Anel da logo antiga |
| `heart` | `#C4436B` | Script magenta da logo antiga |
| `marker` | `#FFD400` | Lápis e respingos da logo antiga |

</details>

Preto puro e branco puro não entram. `ink` faz o trabalho do preto e mantém a temperatura da página.

**Regra dura do amarelo:** sobre branco ele tem contraste de 1.3:1 — reprova em qualquer critério de acessibilidade. Ele nunca é cor de texto. Entra só como preenchimento, com `ink` escrito por cima.

### Tema escuro

O fundo escuro é a própria tinta da marca, escurecida: `#121A26`. `ink` e `paper` trocam de papel, e `chalk` e `heart` clareiam para manter contraste sobre o novo fundo. O amarelo não muda; o texto sobre ele vira `ink`.

Uma primeira versão usava verde-ardósia `#1B2723`, na ideia de "claro = caderno, escuro = lousa". Foi descartada: em tela cheia o verde lia como fundo esverdeado sujo, e trazia uma cor que não existe em nenhuma das duas logos. Derivar o escuro da cor de marca mantém a página reconhecível nos dois temas.

### Tipografia

| Papel | Família | Justificativa |
|---|---|---|
| Títulos | **Fraunces** 500/600 | Serif com cantos amaciados. Carrega o "feito à mão" sem virar cursiva. Substitui Playfair Display, que é a escolha previsível. Usada com parcimônia — só títulos |
| Texto e interface | **Atkinson Hyperlegible** 400/700 | Desenhada pelo Braille Institute para diferenciar caracteres ambíguos (I/l/1, O/0) |
| Números | Atkinson com `font-variant-numeric: tabular-nums` | Preços, estoque e códigos de pedido alinham em coluna |

A escolha da Atkinson é **funcional, não estética**. Parte relevante do público da linha Projeto Educar compra justamente por acessibilidade — famílias atípicas, psicopedagogas, professores de educação inclusiva. Uma loja de material inclusivo usar a fonte projetada para legibilidade é argumento comercial, não selo.

### Hero

Duas páginas de um caderno aberto, separadas por um vinco com a espiral. O visitante se auto-seleciona no primeiro olhar, sem passar pelo menu. Em telas abaixo de 760px as páginas empilham e o vinco vira divisória horizontal.

O split 50/50 é honesto com o negócio: são dois públicos distintos (quem compra planner e quem compra material adaptado) e forçar um só caminho aumentaria o atrito para metade dos visitantes.

### Elemento de assinatura

**O marca-texto.** A palavra-chave de cada seção recebe um traço de marca-texto amarelo com borda irregular, que preenche da esquerda quando a frase entra na tela.

É um sistema, não um enfeite: destaca a palavra-chave da seção, marca preço promocional e marca "última unidade". É o gesto de uma professora destacando o que importa.

Sob `prefers-reduced-motion: reduce` o traço já aparece preenchido, sem animação.

Foi descartado um fundo quadriculado que diferenciaria a linha Educar. Duas texturas competindo poluiriam justamente a página que mais precisa de calma visual.

## Implementação

| Arquivo | Papel |
|---|---|
| `src/styles/identity.css` | Tokens e componentes, todos escopados sob `.identity` para não colidir com o Bootstrap carregado globalmente em `main.jsx` |
| `src/components/IdentityPage.jsx` | O documento apresentado à cliente |
| `src/App.jsx` | A identidade é a view padrão |
| `index.html` | Carrega Fraunces e Atkinson Hyperlegible via Google Fonts |

### Roteamento

A identidade é o que abre no endereço raiz. Os protótipos anteriores continuam acessíveis mas **não são oferecidos na entrada** — ainda usam a paleta lilás antiga, e mostrá-los ao lado da identidade nova passaria incoerência à cliente.

| Endereço | View |
|---|---|
| `/` | Identidade |
| `/#demo` | Loja demo (protótipo antigo) |
| `/#admin` | Painel administrativo (protótipo antigo) |
| `/#proposta` | Proposta comercial (protótipo antigo) |

A barra de navegação entre protótipos aparece em todas as views **exceto** a identidade.

## Dívida conhecida

Registrada aqui para não se perder, resolvida na spec de arquitetura:

1. **Bundle de 1,5 MB** (489 kB gzip) num chunk único. ECharts, Bootstrap e Framer Motion inteiros, carregados mesmo para quem só abre a identidade — que não usa nenhum dos três.
2. **Os protótipos antigos ainda usam a paleta inventada.** Serão substituídos, não retrabalhados.
3. **`ideia.md` descreve Next.js + Tailwind + Supabase**, e o código é Vite + Bootstrap sem backend. A stack alvo confirmada é Next + Supabase + Mercado Pago; o `ideia.md` está correto e o código é que ainda não chegou lá.
4. **Imagens externas hotlinked** em `LandingPage.jsx` (Unsplash, `logodownload.org`, pravatar). Se qualquer uma cair, a página quebra na frente da cliente.

## Perguntas em aberto

Estão publicadas na própria página, na seção "O que eu preciso de você":

1. **Nome do site e endereço.** Feito para Você, Projeto Educar, ou o nome dela reunindo as duas. Decisão dela.
2. **Volume aproximado de vendas/mês no Elo7.** Dimensiona infra e custo mensal.
3. **Catálogo com foto, preço e quantidade.**
4. **História de origem.** Loja nova não tem reputação — tem história.
5. **Cidade e estado de origem dos envios.** Necessário para frete e prazo corretos.

Os itens 1, 2 e 5 bloqueiam decisões técnicas. Os itens 3 e 4 bloqueiam o lançamento, não o desenvolvimento.

## Próximo passo

Spec de arquitetura e escopo do MVP: modelo de dados, checkout, frete, painel e o que fica de fora da primeira versão.
