# Decisões que tomei sem perguntar

Este documento existe porque esperar resposta para tudo trava o trabalho, e
perguntar tudo cansa quem responde. Onde havia uma escolha razoável, eu
escolhi e segui. Aqui está o que escolhi, por quê, e o que custa mudar.

Nada aqui é irreversível. A coluna "custo de mudar" é honesta: onde estiver
escrito "cinco minutos", é cinco minutos mesmo.

As perguntas que eu **não** consegui decidir sozinho estão em
[/perguntas](https://maycon-mb.github.io/vivian_shop/perguntas/) — são as
que dependem de dinheiro, de conta bancária ou do que ela promete às
clientes dela.

---

## Loja

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Mínimo de 10 unidades por produto personalizado | Foi ela quem disse. A loja impede fechar com menos, em vez de só avisar. | — |
| Não deixar misturar material digital com produto personalizado no mesmo carrinho | Um sai por e-mail na hora, o outro leva 5 dias e paga frete. Juntos, a loja teria que prometer as duas coisas ao mesmo tempo. Ela também pediu isso. | — |
| Prazo de produção de 5 dias úteis para tudo | Foi o número que ela deu. Está num lugar só do código: muda um valor e muda em toda a loja. | 5 minutos |
| Desconto de 5% no Pix, só sobre os produtos | Pix é o meio mais barato de receber, e o desconto puxa para ele. **Sobre o frete não incide**: o frete é repassado inteiro à transportadora, então desconto ali sairia do bolso dela. | 5 minutos |
| Três opções de frete: PAC, Jadlog e SEDEX | Uma barata e lenta, uma no meio, uma rápida. Mais que isso vira tabela e a pessoa desiste. | 15 minutos |
| A opção mais barata já vem marcada | É a que a maioria escolhe. Deixar nada marcado trava o botão de pagar sem a pessoa entender por quê. | 2 minutos |
| Checkout numa página só, sem etapas | Cada etapa escondida é uma chance de desistir, e este pedido tem poucos campos. | meio dia |
| Loja não pede CEP quando a compra é só digital | Pedir endereço para entregar um arquivo faz a pessoa desconfiar. | — |

## Material digital

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Link de download válido por 7 dias | Folgado para baixar, curto para circular. Passando disso, ela reenvia. | 2 minutos |
| Nome de quem comprou impresso no arquivo | É o que segura o repasse, sem atrapalhar o uso. **Ainda não implementado** — precisa da confirmação dela, está em /perguntas. | — |
| PDF como formato assumido | Abre em qualquer celular e não dá para editar. Se for Canva, muda a entrega. Está em /perguntas. | — |

## Texto e promessas

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Tirei "Satisfação 100% garantida" | Junto com a promessa de devolução em 7 dias, virava obrigação sobre produto personalizado — que por lei não tem direito de arrependimento. Era uma armadilha jurídica. | — |
| A loja fala "eu", como a Vivian | Quem compra de artesã espera falar com gente. "Nossa equipe" seria mentira: a equipe é ela. | — |
| Toda mensagem de erro diz o que fazer, não só o que houve | "E-mail inválido" não ajuda ninguém. "Confira o e-mail: é para lá que a confirmação vai" ajuda. | — |
| Nenhum texto legal definitivo foi escrito | Política de troca, devolução e privacidade precisam de advogado. Eu não sou advogado e não vou fingir que sou. Estão marcados no código como `PENDENTE-LANCAMENTO`. | — |

## Painel dela

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Abre em "Precisa de você", não em "Todos" | Ela abre o painel para descobrir o que fazer hoje, não para admirar números. | 2 minutos |
| Pedido atrasado sobe para o topo, com borda vermelha | É o único caso em que a tela grita. | — |
| Cada pedido carrega o próprio botão de ação | Entrar no pedido para descobrir o que fazer custaria um toque a mais em cada um, todo dia. | — |
| Número de pedido curto: 0001, 0002 | Ela atende no WhatsApp e a cliente vai digitar esse número na conversa. Código longo não se dita em voz alta. | — |
| Botão "i" ao lado de cada termo do sistema | Ela não é de tecnologia. Explicação escondida atrás de um toque não atrapalha quem já sabe. | — |
| Produtos em grade com foto, não em tabela | Ela pensa nos produtos como coisas que faz, e reconhece pela foto antes do nome. | — |

## Como está montado por dentro

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Nada contratado ainda: pagamento, frete, e-mail e banco são simulados | Enquanto o pagamento não entra, não dá para gastar. A loja funciona inteira assim. | — |
| Cada serviço externo tem um contrato próprio | Quando o Mercado Pago entrar, ele entra num arquivo só. Nenhuma tela muda. | — |
| A troca de simulado para real é por configuração, não por edição de código | Dá para ter a loja de verdade no ar e a demonstração rodando ao mesmo tempo. | — |
| Aviso de "loja em construção" em toda página, e mais forte no checkout | Sem ele, alguém completaria uma compra, veria "aprovado" e esperaria um pacote que ninguém vai postar. Isso é pior do que não ter loja. | some sozinho |
| Site estático no GitHub Pages | Custa R$ 0 e aguenta o volume dela com folga. Cabe na manutenção de R$ 100. | — |
| Código e comentários em português | Quem vai manter isso sou eu, e o vocabulário do negócio é português. "Pedido" é pedido, não `order`. | — |

## Acessibilidade e aparência

| Decisão | Por quê | Custo de mudar |
|---|---|---|
| Escureci o verde e o cinza da marca | O verde original com texto branco dava 3,36:1 de contraste, abaixo do mínimo de 4,5:1. Muita cliente dela usa celular no sol. | — |
| Campo de texto com 16px no celular | Abaixo disso o iPhone dá zoom sozinho ao focar o campo, e a pessoa perde o lugar na tela. | — |
| Animações desligadas para quem pediu menos movimento no sistema | Preferência do aparelho, não minha. | — |

---

## O que ainda não dá para decidir sem ela

Estas dependem de dinheiro, de conta bancária ou do que ela promete às
clientes. Estão todas no formulário em `/perguntas`:

- CNPJ ou pessoa física — muda taxa, nota fiscal e o rodapé da loja
- Qual conta recebe as vendas
- Quantos pedidos por mês — decide se a estrutura barata aguenta
- O que ela faz hoje quando a peça chega com defeito
- Qual número de WhatsApp vai público
- Qual endereço `.com.br` registrar
- Quais produtos e fotos entram na abertura
- Se o nome de quem compra pode sair impresso no material digital
