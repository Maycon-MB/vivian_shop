/**
 * A descrição do produto, tirada a poeira do marketplace.
 *
 * As 342 descrições vieram inteiras da Elojinha, que as recebeu do Elo7, e
 * trazem junto tudo o que aquele anúncio precisava e esta loja não:
 *
 *   - **262 delas mandam a cliente conferir o prazo "no ELO7"**, que é a
 *     loja concorrente e está fechada. Setenta e sete por cento do
 *     catálogo mandando a cliente para outro lugar.
 *   - filetes de cinquenta hifens separando parágrafo
 *   - setas "-->" no lugar de marcador de lista
 *   - "no anúncio", que é palavra de marketplace: aqui é a página do
 *     produto dela
 *
 * Achado numa auditoria em 26/08. Não foi visto antes porque a descrição
 * é longa e ninguém rola até o fim de 342 produtos.
 *
 * **O que ela escreveu continua.** O que sai é o que a plataforma antiga
 * exigia, e o que sobra é o texto dela sobre o produto dela.
 */

const NADA_A_VER_COM_A_LOJA_DELA = [
  // O prazo agora aparece na página, calculado. A frase mandava somar dois
  // números que a cliente não tem mais como olhar.
  /\(?Some o prazo de produção ao prazo de entrega[^\n]*\n?/gi,
  /\*?\s*Para mais informações, consulte nossas Políticas da Loja[^\n]*\n?/gi,
]

export const limparDescricao = (bruta: string): string => {
  let texto = String(bruta ?? '')

  for (const padrao of NADA_A_VER_COM_A_LOJA_DELA) texto = texto.replace(padrao, '')

  /* Rede: qualquer linha que ainda cite a concorrente sai inteira.
     A primeira versão listava as frases conhecidas e deixou uma passar,
     porque numa das 342 ela vinha grudada no texto anterior. Apagar a
     linha toda é mais grosseiro e não deixa sobra: o nome da loja
     concorrente não pode aparecer na loja dela por descuido meu. */
  const QUEBRA = String.fromCharCode(10)
  texto = texto
    .split(QUEBRA)
    .filter((linha) => !/ELO\s?7/i.test(linha))
    .join(QUEBRA)

  return (
    texto
      // Filete de hifens virando separador de parágrafo.
      .replace(/^\s*-{4,}\s*$/gm, '')
      // "--> " era marcador de lista no editor deles.
      .replace(/^\s*-->\s*/gm, '• ')
      .replace(/\s*-->\s*/g, ' ')
      /* "no anúncio" é palavra de marketplace. Aqui não há anúncio, há a
         página do produto dela. */
      .replace(/\bno anúncio\b/gi, 'na foto')
      .replace(/\bdo anúncio\b/gi, 'da foto')
      // O que sobrar do nome da concorrente, em qualquer grafia.
      .replace(/\bELO\s?7\b/gi, '')
      // Espaço solto no fim da linha, que o editor deles deixava.
      .replace(/[ \t]+$/gm, '')
      // Três linhas vazias viram uma.
      .replace(/\n{3,}/g, '\n\n')
      // Parênteses que ficaram sozinhos depois de a frase sair.
      .replace(/\(\s*\)/g, '')
      .trim()
  )
}
