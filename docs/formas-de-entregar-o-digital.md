# Como vender arquivo para download: as formas possíveis

Escrito para a conversa de 19/08/2026. A Vivian já tem um jeito de
trabalhar que funciona, e a pergunta não é "qual é o certo", e sim **qual
tira trabalho dela sem quebrar o que já dá certo**.

Cinco caminhos, do mais próximo do que ela faz hoje ao mais distante.

---

## 1. Como é hoje, no Elo7: manual

A pessoa compra. A Vivian vê a notificação, pega o e-mail da compradora,
entra no Drive, adiciona esse e-mail nas permissões da pasta, manda o
link. Sete dias depois, volta lá e remove o acesso.

**A favor:** ela controla tudo, os arquivos ficam no lugar dela, custo
zero, e ela já sabe fazer.

**Contra, e é grave:** prende ela.

> *"Quando eu tava no trabalho e tinha uma compra e eu não via, eu tinha
> que esperar chegar em casa pra liberar, ou tentar abrir na escola."*

Quem compra material digital espera receber na hora. Esperar até a
vendedora chegar em casa é a pior parte da experiência, e é o oposto do
que o produto promete.

---

## 2. Drive automatizado: o que eu recomendo

Igual ao de hoje, **com a Vivian tirada do meio**.

Pagamento aprovado → um script concede acesso ao e-mail da compradora →
manda o e-mail com o link → sete dias depois remove o acesso sozinho →
avisa a Vivian do que foi feito.

**A favor:**

- Os arquivos **não saem do Drive dela**. Continuam onde ela organiza,
  atualiza e versiona.
- Custo **zero**: o Apps Script roda na conta Google dela, sem servidor,
  sem armazenamento pago.
- A regra dos 7 dias já é a dela, não é invenção minha.
- Entrega em segundos, a qualquer hora, sem ela fazer nada.
- Se o automático falhar, o caminho manual continua existindo.

**Contra:**

- **Depende do e-mail da compradora ser do Google.** Com Hotmail ou
  Yahoo, a pessoa cai numa tela de "solicitar acesso" e volta a depender
  da Vivian liberar na mão.
- O Google impõe limites de compartilhamento por dia. Para o volume dela,
  folgado, mas existe.
- Se ela mover ou renomear a pasta no Drive, o link quebra.

**Mitigação do problema do e-mail:** pedir preferência por Gmail na tela
de compra, antes do pagamento, explicando em uma linha o motivo. **Já
está implementado.**

---

## 3. Link temporário gerado pela loja

Os arquivos ficam num armazenamento da loja, e cada compra gera um
endereço único que expira em 7 dias. Não depende de e-mail nenhum: quem
tem o link, baixa.

**A favor:**

- Funciona com **qualquer e-mail**: some o problema do Gmail.
- Some também a tela de "solicitar acesso".
- A loja controla o prazo com precisão.

**Contra:**

- Os arquivos passam a ficar **fora do Drive dela**, e ela perde a
  organização que já tem.
- Volta o custo que a gente acabou de eliminar: armazenamento e tráfego
  de download.
- Ela teria que subir cada arquivo de novo, e manter dois lugares em
  sincronia, ou abandonar o Drive.
- Link sem dono é mais fácil de repassar num grupo de WhatsApp do que
  acesso ligado a um e-mail.

**Quando eu mudaria para esse:** se muita compradora reclamar de não
conseguir acessar por não ter Gmail. É medível, dá para contar quantas
pedem ajuda.

---

## 4. Anexar o arquivo no próprio e-mail

O material vai anexado na mensagem de confirmação.

**A favor:** chega para qualquer e-mail, sem link, sem acesso, sem tela
intermediária. É o mais simples de entender.

**Contra:**

- A maioria dos provedores corta anexo acima de 20 a 25 MB. Apostila
  ilustrada passa disso com facilidade.
- Anexo grande cai em spam com frequência.
- **Some o prazo de 7 dias**: quem recebeu tem o arquivo para sempre, e
  pode repassar à vontade.
- Se ela corrigir uma página da apostila, quem já comprou fica com a
  versão velha.

**Não recomendo**, exceto para materiais pequenos.

---

## 5. Área de acesso na própria loja

A compradora cria uma senha e passa a ter uma página com tudo que
comprou, para baixar quando quiser.

**A favor:**

- Mais profissional, e é o que loja grande faz.
- Ela não perde o material se apagar o e-mail.
- Abre caminho para vender assinatura ou pacote depois.

**Contra:**

- É o mais caro de construir e de manter.
- Mais uma senha para a compradora esquecer, e mais um motivo para ela
  chamar a Vivian no WhatsApp.
- Exige guardar os arquivos fora do Drive, com os mesmos custos do item 3.
- **Some o prazo de 7 dias**, salvo se a página também expirar.

**Quando faria sentido:** se ela passar a vender pacotes ou assinatura, ou
quando a mesma cliente comprar muitas vezes.

---

## O quadro

| | Custo | Prazo de 7 dias | Funciona com qualquer e-mail | Tira trabalho dela |
|---|---|---|---|---|
| 1. Manual (hoje) | R$ 0 | sim | sim | **não** |
| **2. Drive automático** | **R$ 0** | **sim** | **não** | **sim** |
| 3. Link temporário | tem custo | sim | sim | sim |
| 4. Anexo no e-mail | R$ 0 | **não** | sim | sim |
| 5. Área de acesso | mais alto | opcional | sim | sim |

## A recomendação

**Começar pelo 2**, que é o jeito dela sem o trabalho dela.

É o único que não pede para ela mudar nada do que já faz, não custa nada,
e resolve o problema que ela mesma relatou. O ponto fraco (o e-mail que
não é do Google) é o único, é conhecido, e dá para medir: se virar
reclamação frequente, a gente migra para o 3 sem jogar fora o que foi
construído.

Trocar depois é barato porque a entrega fica atrás de um contrato próprio
no código, como o pagamento e o frete. Muda a implementação, não a loja.

## O que precisa dela para o 2 funcionar

1. **Como as pastas do Drive estão organizadas**: uma por atividade, ou
   tudo junto? Já está no formulário.
2. **Autorizar o script** a mexer nas permissões do Drive dela. É um
   clique, na conta dela, e ela pode revogar quando quiser.
3. **Confirmar o prazo de 7 dias**: corridos ou úteis. Hoje a política
   dela diz "7 dias úteis".
