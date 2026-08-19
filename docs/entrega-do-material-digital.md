# Como o material digital é entregue

Corrige o que eu tinha assumido. Em 18/08/2026 a Vivian explicou como
funciona de verdade, e é diferente — e melhor — do que eu imaginava.

## O que eu tinha assumido

Que ela mandaria os arquivos e a loja guardaria os PDFs, entregando um
link de download com validade de 7 dias. Foi com base nisso que calculei
custo de armazenamento e de tráfego, e perguntei a ela quanto pesavam os
arquivos.

## Como ela realmente faz

> *"Eu guardo todas as atividades em um drive. Quando a pessoa compra, eu
> coloco o e-mail da pessoa no drive e envio. E fica ali naquele drive
> liberado o acesso durante sete dias. Depois eu retiro o acesso, mas todas
> as atividades ficam no meu drive."*

Os arquivos **nunca saem do Google Drive dela**. O que ela entrega é
acesso, não arquivo: adiciona o e-mail da compradora nas permissões,
manda o link, e depois de sete dias remove.

## Por que isso é melhor

**Some o custo que eu tinha projetado.** Sem PDF no banco, não há
armazenamento nem tráfego de download para pagar. O que sobra no banco são
pedidos e cadastro — texto, que cabe de sobra no plano gratuito por muitos
anos.

**Ela não perde o controle dos arquivos.** Continuam no Drive dela, onde
ela já organiza, atualiza e versiona.

**A validade de 7 dias já existe** e é a prática dela, não uma regra que
eu inventei.

## O problema que continua, e que a loja resolve

O trabalho hoje é manual, e prende ela:

> *"Dependia de mim pra liberar. Quando eu tava no trabalho e tinha uma
> compra e eu não via, eu tinha que esperar chegar em casa pra liberar, ou
> tentar abrir na escola. Ficava um pouco mais complicado, porque eu tinha
> que ficar sempre vendo se tinha alguma compra ou não."*

É o oposto do que material digital deveria ser. A cliente paga e espera
horas — às vezes até a Vivian chegar em casa.

**Isso a loja automatiza:** pagamento confirmado, a permissão é concedida
ao e-mail da compradora e o link sai na hora. Sete dias depois, o acesso
é removido sozinho. Ela recebe um aviso do que aconteceu, sem precisar
fazer nada.

## Como fazer, sem custo novo

O Google Apps Script — o mesmo tipo de script que já recebe as respostas
do formulário — tem acesso ao Drive. Dá para:

1. receber o aviso de pagamento aprovado;
2. conceder acesso ao e-mail da compradora na pasta ou arquivo do produto;
3. enviar o e-mail com o link;
4. agendar a remoção do acesso para sete dias depois;
5. avisar a Vivian do que foi feito.

Tudo dentro da conta Google dela, sem serviço pago, sem os arquivos
saírem do lugar onde já estão.

## O detalhe que ela levantou e precisa entrar na loja

> *"Se ela tiver hotmail, se ela tiver outro tipo de e-mail, ela vai ter
> que ficar solicitando acesso e eu liberar um novo e-mail. Porque tendo o
> e-mail [do Google], automaticamente já vai e ela já baixa."*

O compartilhamento do Drive funciona melhor com endereço Google. Com outro
provedor, a compradora cai numa tela de "solicitar acesso" — e aí a
automação quebra e volta a depender da Vivian.

**Na tela de compra do material digital, isso precisa estar escrito**,
antes do pagamento: pedir de preferência um e-mail do Gmail, explicando em
uma linha que é para o acesso sair na hora.

## O que muda no que já estava escrito

- A pergunta sobre o peso dos arquivos **sai do formulário**: não é mais
  relevante.
- A projeção de custo do banco cai. O cenário de R$ 130 a R$ 275 mensais
  era puxado pelo armazenamento e pelo tráfego de PDF, que não existem.
- A página de custos precisa refletir isso.
