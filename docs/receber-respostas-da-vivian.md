# Como ligar o recebimento das respostas

O formulário em `/perguntas/` manda as respostas da Vivian direto para uma
planilha sua. Isto aqui é o que falta montar do seu lado — uma vez só,
cerca de 10 minutos.

Enquanto não estiver montado, a página funciona igual e o botão do
WhatsApp continua sendo a saída. Nada quebra.

---

## 1. Criar a planilha

Crie uma planilha no Google Drive. Nome sugerido: **Respostas da Vivian**.

Não precisa criar coluna nenhuma — o script cria o cabeçalho sozinho na
primeira resposta.

## 2. Abrir o editor de script

Na planilha: **Extensões → Apps Script**.

Apague o que estiver lá e cole o código abaixo inteiro.

```javascript
/**
 * Recebe as respostas do formulário da loja e grava numa linha.
 *
 * Cada envio vira uma linha nova, e não uma atualização da anterior: a
 * Vivian responde em partes, e ver a evolução ("dia 13 respondeu 3, dia
 * 15 respondeu mais 4") vale mais do que ter uma linha só sempre certa.
 */

function doPost(requisicao) {
  try {
    var dados = JSON.parse(requisicao.postData.contents);
    var planilha = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    var chaves = Object.keys(dados.respostas || {}).sort();

    // Na primeira vez, escreve o cabeçalho. Depois disso, respeita o que
    // já existe: reescrever o cabeçalho embaralharia as linhas antigas.
    if (planilha.getLastRow() === 0) {
      planilha.appendRow(['Quando', 'Respondidas'].concat(chaves));
      planilha.setFrozenRows(1);
    }

    var cabecalho = planilha
      .getRange(1, 1, 1, planilha.getLastColumn())
      .getValues()[0];

    // Uma pergunta nova entra como coluna nova, no fim, sem mexer no que
    // já foi respondido.
    for (var i = 0; i < chaves.length; i++) {
      if (cabecalho.indexOf(chaves[i]) === -1) {
        planilha.getRange(1, planilha.getLastColumn() + 1).setValue(chaves[i]);
        cabecalho.push(chaves[i]);
      }
    }

    var linha = [];
    for (var c = 0; c < cabecalho.length; c++) {
      if (cabecalho[c] === 'Quando') linha.push(new Date());
      else if (cabecalho[c] === 'Respondidas') linha.push(chaves.length);
      else linha.push(dados.respostas[cabecalho[c]] || '');
    }

    planilha.appendRow(linha);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (erro) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, erro: String(erro) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Só para conferir no navegador que o endereço está no ar. */
function doGet() {
  return ContentService.createTextOutput('pronto para receber');
}
```

## 3. Publicar

No editor: **Implantar → Nova implantação**.

- Tipo: **App da Web**
- Executar como: **Eu**
- Quem pode acessar: **Qualquer pessoa**

> **Sobre "qualquer pessoa":** é necessário, porque quem envia é o navegador
> da Vivian, sem conta nenhuma. O endereço gerado é longo e aleatório, e
> ninguém que não o tenha consegue mandar nada. O script só escreve na
> planilha — não lê, não apaga, não devolve o que já está lá. O risco real
> é alguém que descobrisse o endereço poder escrever linhas de lixo, e
> nesse caso basta gerar outra implantação.

Copie o endereço que aparece no fim. É algo como:

```
https://script.google.com/macros/s/AKfycb.../exec
```

Confira colando no navegador: deve aparecer **pronto para receber**.

## 4. Ligar na loja

Crie o arquivo `loja/.env.local` com:

```
NEXT_PUBLIC_FORMULARIO_URL=https://script.google.com/macros/s/AKfycb.../exec
```

Este arquivo **não vai para o Git** — está no `.gitignore`. Para o site
publicado receber a variável, ela também precisa existir no GitHub:

**Settings → Secrets and variables → Actions → Variables → New variable**

- Nome: `NEXT_PUBLIC_FORMULARIO_URL`
- Valor: o mesmo endereço

O CI já passa essa variável para o build.

## 5. Conferir

Abra `/perguntas/`, responda uma pergunta, aperte **Enviar minhas
respostas**. A linha deve aparecer na planilha em segundos.

---

## O que acontece se der errado

A página tenta enviar e, se não conseguir, diz isso em vez de fingir que
deu certo — e oferece o botão do WhatsApp como saída. A resposta continua
guardada no aparelho dela, então nada se perde.

Se você ver a Vivian dizendo que enviou e a planilha estiver vazia:

1. Confira se o endereço do passo 3 ainda responde "pronto para receber"
2. Uma **nova implantação** gera um endereço novo — editar o script e
   publicar de novo pode ter trocado o endereço. Atualize a variável.
