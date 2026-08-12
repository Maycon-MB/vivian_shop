# Arquitetura e escopo do MVP — design

**Data:** 2026-08-11
**Status:** aprovado
**Depende de:** [identidade visual](2026-08-10-identidade-visual-design.md)

---

## Contexto

A loja "Feito para você! Personalizados" substitui as duas lojas da cliente no Elo7. Contrato: R$ 2.400 de desenvolvimento (12x R$ 200) e R$ 100/mês de manutenção, que precisa cobrir a infraestrutura.

O orçamento é pequeno para um e-commerce do zero com pagamento, frete, produto digital e painel. A defesa não é trabalhar mais rápido — é a lista do que fica de fora, escrita e acordada antes de começar.

## Regras de negócio confirmadas pela cliente

| Regra | Valor |
|---|---|
| Linha física | Papelaria personalizada — sob encomenda |
| Mínimo | 10 unidades **por produto**. Não existe comprar 1 caneca |
| Produção | 5 dias úteis após a confirmação do pagamento |
| Linha digital | Papelaria pedagógica — arquivo, entrega imediata |
| Mistura | **Proibida.** Uma compra é de uma linha só |
| Transportadoras | Correios e Jadlog |
| Origem | Rio de Janeiro/RJ. O CEP fica em variável de ambiente, não no código — o repositório é público e o endereço de origem é a casa da cliente |

A proibição de misturar veio da cliente por um motivo correto: a declaração de conteúdo precisa bater com o que está dentro da caixa, e um arquivo digital declarado é um item que não está na embalagem.

Como consequência, o pedido inteiro tem uma linha só. Frete, prazo e forma de entrega passam a depender de um único campo em vez de varrer os itens — o checkout fica bem mais simples do que seria com carrinho misto.

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Front e API | Next.js na Vercel | SEO para o catálogo, rotas de API no mesmo projeto, plano gratuito suficiente |
| Banco e arquivos | Supabase | Postgres gerenciado, Storage para os PDFs, políticas de acesso por linha |
| Pagamento | Mercado Pago | A cliente já tem conta. Pix e cartão |
| Frete | Melhor Envio | Cobre Correios e Jadlog numa API só, gera etiqueta e declaração de conteúdo |
| E-mail | Resend | Plano gratuito cobre o volume esperado |

## Decisões

### Checkout transparente

O pagamento acontece na própria página, sem redirecionar para o Mercado Pago.

**Regra inegociável:** o número do cartão nunca passa pelo servidor. O SDK do Mercado Pago tokeniza no navegador e a API recebe apenas o token. Qualquer rota que aceite dado de cartão em texto claro é um defeito grave, não uma otimização.

Custo dessa escolha: tratamento de recusa vira trabalho nosso. Saldo insuficiente, dado inválido, antifraude e cartão expirado precisam de mensagem própria e testável. É a parte que falha em silêncio.

### Entrega digital por link com validade

E-mail com link assinado, validade de 7 dias e limite de downloads. O PDF é carimbado no momento do download com o nome de quem comprou.

Anexo em e-mail foi descartado: cai em spam, esbarra em limite de tamanho e circula sem nenhum rastro. Área de cliente com login foi adiada: resolve melhor a longo prazo, mas custa uma tela de login, recuperação de senha e sessão que não cabem na v1.

### WhatsApp semiautomático na v1

O e-mail é automático. O WhatsApp é um botão no painel que abre a conversa com a mensagem já escrita, para a cliente só enviar.

A WhatsApp Cloud API oficial foi adiada por dois motivos, e o segundo é o que pesa: exige um número dedicado que **sai do aplicativo normal**. A cliente atende pessoalmente pelo WhatsApp dela, e esse atendimento direto é um diferencial que ela vende. Automatizar custaria o canal.

### Painel mínimo

Produtos, pedidos e etiqueta. Chat interno, marketing com IA, calendário editorial e gráficos ficam fora — são o grosso do que existe no protótipo e nada disso a cliente usa nos primeiros meses.

## Modelo de dados

```
produtos          id, nome, descricao, preco, linha, ativo,
                  minimo, prazo_producao,
                  peso_g, alt_cm, larg_cm, comp_cm     -- linha física
                  arquivo_path                          -- linha digital

pedidos           id, numero, status, linha, total,
                  cliente_nome, cliente_email, cliente_whatsapp,
                  endereco_cep, endereco_logradouro, endereco_numero,
                  endereco_complemento, endereco_bairro,
                  endereco_cidade, endereco_uf,
                  frete_servico, frete_valor,
                  mp_payment_id, criado_em, prometido_para

itens_pedido      pedido_id, produto_id,
                  nome_snapshot, preco_snapshot, quantidade

entregas_digitais pedido_id, token, expira_em, downloads, ip_ultimo

envios            pedido_id, me_pedido_id, rastreio,
                  etiqueta_url, declaracao_url, postado_em

config            cep_origem, prazo_padrao, textos
```

**Por que `nome_snapshot` e `preco_snapshot`:** o item guarda cópia do nome e do preço no momento da compra. Sem isso, reajustar a caneca de R$ 32 para R$ 38 reescreve todos os pedidos antigos e a contabilidade da cliente deixa de fechar.

**Por que `linha` no pedido:** decorre da regra de não misturar. Frete, prazo e entrega leem um campo em vez de varrer itens.

**Por que `minimo` e `prazo_producao` no produto, e não constantes:** hoje valem 10 e 5 para toda a linha. Guardar por produto custa duas colunas agora e evita migração quando surgir a lembrancinha com mínimo diferente.

## Fluxos

### Pagamento

O webhook do Mercado Pago é a única fonte de verdade. O navegador do comprador nunca confirma pagamento — ele pode fechar a aba, perder conexão ou recarregar.

```
1. Cliente preenche dados         → validação no cliente
2. SDK tokeniza o cartão          → o servidor recebe só o token
3. POST /api/pedidos              → grava pedido "aguardando"
4. POST para o Mercado Pago       → cria o pagamento
5. Webhook do MP                  → única transição para "pago"
6. Pago + linha digital           → gera token, envia e-mail
   Pago + linha física            → entra na fila de produção
```

**O webhook precisa ser idempotente.** O Mercado Pago reenvia o mesmo evento; sem proteção, o arquivo é entregue duas vezes e o pedido duplica. A chave é `mp_payment_id` com restrição de unicidade — não uma verificação em memória.

**O webhook precisa validar assinatura.** Um endpoint que aceita qualquer POST marcando pedido como pago é uma loja que entrega de graça para quem descobrir a URL.

### Entrega digital

```
Pagamento aprovado
  → gera token aleatório, validade 7 dias, limite de 5 downloads
  → e-mail com o link
  → painel mostra o botão de avisar no WhatsApp

No download
  → valida token, validade e contador
  → carimba o PDF com nome e e-mail do comprador
  → incrementa o contador, registra o IP
```

O carimbo é gerado no download, não no upload: um arquivo por produto no Storage, personalizado na saída.

### Frete e postagem

Cotação em tempo real do Melhor Envio, do CEP de origem para o CEP do comprador, com Correios e Jadlog lado a lado.

As medidas são cadastradas **por pacote fechado de 10**, não por peça — como o mínimo é 10, é o que a cliente realmente despacha. Ela pesa uma vez e não mexe mais.

Na postagem, o Melhor Envio devolve etiqueta e declaração de conteúdo juntas.

**Confirmado em 11/08/2026:** a Jadlog aceita declaração de conteúdo de MEI e pessoa física, sem exigir nota fiscal. Desde abril de 2026 o padrão é a DC-e, declaração eletrônica, no lugar do formulário em papel. A restrição de origem que existe — envios saindo do Paraná não podem usar declaração — não afeta a cliente, que despacha do Rio.

**O que isso custa, e precisa aparecer no painel:** o documento escolhido define a cobertura do seguro.

| | Declaração de conteúdo | Nota fiscal |
|---|---|---|
| Teto | R$ 1.500 | R$ 30.000 |
| Extravio | coberto | coberto |
| Avaria | **não coberto** | coberto |

Avaria não coberta é um risco concreto para esta cliente: produto personalizado que chega quebrado não pode ser revendido, porque cada peça tem o nome de alguém — ela perde a produção inteira dos 5 dias.

Como ela é MEI, pode emitir nota e ter a cobertura maior. Fica como decisão dela, a ser tomada antes do lançamento. O sistema deve suportar os dois documentos desde o começo, e não assumir declaração como única saída.

## Escopo da primeira versão

**Entra:**

- Catálogo com as duas linhas, filtro e página de produto
- Carrinho com mínimo por produto e bloqueio de mistura
- Checkout transparente com Pix e cartão
- Cotação de frete e escolha de transportadora
- Webhook de pagamento idempotente e assinado
- Entrega digital por link com validade e marca d'água
- Painel: cadastro de produtos, lista de pedidos, geração de etiqueta e declaração
- E-mail automático de confirmação, entrega digital e rastreio
- Botão de avisar no WhatsApp com mensagem pronta

**Fica de fora, e isso é explícito:**

- Chat interno no painel
- Marketing com IA e calendário editorial
- Gráficos e métricas de venda
- Área de cliente com login
- Nota fiscal automática
- Cupom de desconto e programa de indicação
- Retirada em mãos e entrega própria no Rio
- WhatsApp totalmente automático
- Avaliações de produto

## Custos mensais

| Item | Custo |
|---|---|
| Vercel | R$ 0 no plano gratuito |
| Supabase | R$ 0 até 500 MB de banco e 1 GB de arquivos |
| Resend | R$ 0 até 3.000 e-mails/mês |
| Domínio .com.br | ~R$ 40/ano |
| Mercado Pago | por venda, sem mensalidade |
| Melhor Envio | por envio, cobrado do comprador |

Cabe nos R$ 100/mês com folga larga. O primeiro limite a ser atingido é o armazenamento do Supabase, se o catálogo digital crescer muito — 1 GB comporta bastante PDF.

## Riscos

**Escopo maior que o orçamento.** É o risco principal. A lista do que fica de fora é a defesa; qualquer item que migrar para dentro precisa de conversa sobre prazo.

**Recusa de cartão mal tratada.** Consequência direta do checkout transparente. Precisa de teste para cada motivo de recusa, não só do caminho feliz.

**Vazamento do material digital.** A marca d'água inibe, não impede. Aceito conscientemente: proteção mais forte atrapalharia quem pagou.

**Jadlog sem nota fiscal.** Pode inviabilizar a transportadora como opção. Confirmar cedo.

**Volume de vendas desconhecido.** A cliente ainda não informou. Todo o dimensionamento assume volume baixo. Se ela vender muito mais que o esperado, os planos gratuitos precisam ser revistos — e o aviso precisa vir antes da conta, não depois.

## Pendências com a cliente

1. Formato do material digital — PDF? um arquivo por compra ou pacote?
2. Volume aproximado de vendas por mês
3. Confirmação da marca d'água com o nome do comprador
4. Catálogo com fotos, preços, medidas e peso dos pacotes
5. História de origem, para a página sobre

Nenhuma delas bloqueia o início da implementação.

## Próximo passo

Plano de implementação: ordem das tarefas, o que pode ser feito em paralelo e onde ficam os pontos de verificação.
