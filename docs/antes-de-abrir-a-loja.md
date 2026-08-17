# Antes de abrir a loja

Lista do que precisa sair, entrar ou ser confirmado antes de a loja receber
a primeira venda de verdade.

Existe porque a loja tem, de propósito, textos escritos para a Vivian ler
durante a construção — recados do tipo "me manda um print e eu coloco". São
úteis agora e seriam vergonhosos no ar.

A alternativa seria preencher com texto sem sentido, mas aí ela abriria a
loja e não entenderia o que está vendo. O recado explicando o que falta vale
mais durante a construção; esta lista é o que garante que ele não fique.

**Como achar tudo:** procure por `PENDENTE-LANCAMENTO` no código. Todo ponto
que precisa de ação está marcado assim.

---

## Textos que precisam sair

| Onde | O que está lá | O que entra |
|---|---|---|
| Loja, sobre a foto do hero | "Aqui entra um depoimento de verdade de uma cliente sua" | Print de um elogio real, com o nome de quem escreveu |
| Loja e painel, nos cartões | "Aqui entra sua foto" | As fotos dos produtos dela |
| Página Quem faz | "Vivian, este texto é um esboço" | A história contada por ela |
| Painel, em todas as abas | Selos "exemplo" e avisos de que os dados são de mentira | Somem quando o banco entrar |
| Rodapé | "CNPJ e razão social entram aqui" | Os dados reais do MEI dela |

## Dados que faltam

Atualizado em 17/08/2026, depois das 83 mensagens dela de 16/08.

- [x] ~~Descrições dos produtos~~ — chegaram, e estão na loja com as palavras dela
- [x] ~~Formato do material pedagógico~~ — PDF
- [x] ~~Logos em qualidade boa~~ e ~~Instagram~~ — `@feito.paravocepersonalizados`
- [x] ~~Políticas da loja~~ — inclusive o atendimento de segunda a sexta, das 9h às 17h

- [ ] **Preços dos personalizados.** Os que estão na loja hoje são **meus**, provisórios: ela mandou lista de preço só do material pedagógico. Estão marcados em `telas/catalogo.js` como `PENDENTE-VIVIAN`. **Nenhum deles pode cobrar de cliente.**
- [ ] **Os 86 temas.** Existem 3 cadastrados. Entram pela extração da loja dela no Elo7.
- [ ] **Os 343 produtos.** Existem 21. Mesma origem.
- [ ] **CNPJ e razão social** do MEI — vão no rodapé, é o que dá segurança a quem nunca comprou
- [ ] **Fotos dos produtos** — nenhuma; todo produto está com espaço reservado
- [ ] **Peso e medidas do pacote fechado de 10.** Ela mandou o tamanho da peça, que é outra coisa. Sem isso o frete sai errado e a diferença sai do bolso dela em cada pedido.
- [ ] **Arquivos** da linha pedagógica, em PDF
- [ ] **História dela**, para a página Quem faz
- [ ] **Autorização dos depoimentos.** Os 15 prints chegaram, e todos trazem o nome de clientes dela. Publicar nome de terceiro sem essa pessoa saber é problema, mesmo sendo elogio.
- [ ] **Número de WhatsApp verdadeiro** — hoje está `5521900000000` em toda a loja

## Precisa de validação profissional

- [ ] **Política de devolução.** O art. 49 do Código de Defesa do Consumidor
      dá 7 dias de arrependimento em compra pela internet e não abre exceção
      escrita para produto personalizado. Só que uma peça feita com o nome de
      outra criança não pode ser revendida: se a devolução acontecer, o
      prejuízo é inteiro da Vivian.

      O texto no rodapé hoje informa o direito sem prometer nada além dele e
      pede contato antes, mas **isso precisa passar por um contador ou
      advogado antes de a loja abrir**. Prometer menos que a lei pode ser
      cláusula abusiva; prometer mais custa dinheiro dela em cada devolução.

      Eu não sou advogado e não tenho como decidir isso.

## Decisões dela que ainda faltam

- [ ] Formato do material pedagógico: um arquivo por compra ou pacote com vários?
- [ ] Aceita o nome do comprador impresso no PDF?
- [ ] Quantas vendas por mês, aproximadamente
- [ ] Documento fiscal: declaração de conteúdo ou nota fiscal? A declaração não
      cobre avaria, e produto personalizado quebrado não dá para revender

## Do meu lado

- [ ] Registrar o domínio .com.br
- [ ] Confirmar com o Melhor Envio se a Jadlog aceita a declaração de conteúdo
      no formato eletrônico atual
- [ ] Ligar o Mercado Pago à conta dela
- [ ] Ligar o Melhor Envio, com o CEP de origem
- [ ] Trocar os dados de exemplo pelo banco de verdade
- [ ] Configurar o envio de e-mail
- [ ] Conferir a loja inteira no celular, com a lista acima na mão

## Antes de anunciar

- [ ] `npm run verificar` passando (links e navegação)
- [ ] Uma compra de teste de ponta a ponta, com dinheiro de verdade e estorno
- [ ] Uma compra digital de teste, conferindo se o arquivo chega mesmo
- [ ] Uma etiqueta de teste gerada e conferida no balcão dos Correios
