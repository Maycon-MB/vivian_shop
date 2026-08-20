# Os documentos em PDF

Como os arquivos que vão para a Vivian são gerados e conferidos.

---

## Como gerar

```
node scripts/gerar-pdf.cjs --todos
node scripts/gerar-pdf.cjs docs/quanto-custa-a-loja.md "Nome do arquivo"
```

Os PDFs saem em `Documents/vivian-contrato/`, fora do repositório. O
contrato preenchido tem CPF, endereço e valores: não entra no Git.

O documento é HTML impresso pelo Chrome do Playwright. Isso dá CSS de
verdade: quebra de página controlada, bloco de assinatura que não racha ao
meio, viúvas e órfãs.

---

## Duas regras de escrita

**Tudo em preto.** Título colorido faz o contrato parecer peça de
marketing, e não instrumento jurídico. Fundo de tabela é cinza claro com
texto preto, só para separar o cabeçalho.

**Sem travessão.** Travessão em excesso é a marca visível de texto escrito
por IA, e estes documentos precisam parecer escritos por uma pessoa,
porque foram. No lugar dele:

| Onde estava | Vira |
|---|---|
| Título: `ANEXO I — ETAPAS` | dois-pontos: `ANEXO I: ETAPAS` |
| Aposto no meio da frase | parênteses |
| Emenda de frase | vírgula, ou ponto e frase nova |
| Célula de tabela vazia | hífen simples |

A troca foi feita caso a caso, e não por substituição automática: cada
travessão pedia uma pontuação diferente, e trocar tudo por vírgula deixaria
o português torto.

---

## Como conferir

```
node scripts/fotografar-pdf.cjs                       # todos
node scripts/fotografar-pdf.cjs "caminho/arquivo.pdf" # um só
```

As imagens saem em `vivian-contrato/preview/`, uma por página.

### Por que fotografar o PDF, e não a página HTML

A primeira versão desta conferência rolava o HTML de 1123 em 1123 pixels e
tirava um print a cada rolagem. Parecia certo, e não era: **rolagem ignora
as quebras de página do CSS**. Eu conferia uma paginação que não existia no
arquivo entregue.

Enquanto conferi assim, dois defeitos passaram:

- **um segundo rodapé**, impresso por uma caixa `@bottom-center` que se
  somava ao rodapé do próprio Chrome
- **o contrato com 9 páginas**, enquanto a conferência dizia 7

Agora o PDF é aberto de verdade, com o pdf.js dentro do Chromium, e cada
página vira imagem. O que eu olho é o que ela recebe.

O `--allow-file-access-from-files` no navegador existe por causa disso: sem
ele o Chrome recusa importar o pdf.js de `file://`, porque módulo carregado
de arquivo local cai em origem nula.

---

## O que fica junto na mesma folha

- cada bloco de assinatura, com linha, nome e CPF
- "Local e data" com as assinaturas logo abaixo
- título com o parágrafo que vem depois
- linha de tabela inteira

O anexo começa em folha própria: é documento à parte.
