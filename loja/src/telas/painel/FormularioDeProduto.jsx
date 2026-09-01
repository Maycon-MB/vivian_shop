'use client'

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ImagePlus, X } from 'lucide-react';

import {
  FORMULARIO_VAZIO,
  doBanco,
  paraOBanco,
  problemas,
} from '@/dominio/edicaoDeProduto';
import { buscarParaEditar, listarTemas, salvarProduto, medidasJaCadastradas } from '@/dados/produtosDaDona';
import { enviarFoto } from '@/dados/fotosDaDona';
import { enderecoDoNome } from '@/dominio/edicaoDeProduto';
import { medidasParecidas } from '@/dominio/medidasDoTipo';

/**
 * Onde ela cadastra um produto e muda o preço dos que já tem.
 *
 * Foi o primeiro pedido dela depois de ver a loja no ar, em 24/08:
 * "como faço para editar produtos, incluir um produto, modificar preços".
 *
 * O desenho segue três decisões:
 *
 *   1. **Uma tela, e não um modal.** Ela mexe nisso pelo celular, entre
 *      uma encomenda e outra. Modal em tela pequena esconde metade do
 *      formulário atrás do teclado.
 *   2. **O que é obrigatório vem primeiro.** Nome, preço e descrição são
 *      o que a cliente vê. Peso e caixa ficam embaixo, porque ela só sabe
 *      depois de embalar.
 *   3. **Salvar como rascunho sempre funciona.** Formulário que se recusa
 *      a guardar o que já foi digitado é como ela perde o trabalho e não
 *      volta.
 */

/** O erro do banco dito na língua dela, com o que fazer a respeito. */
const recadoDoErro = (bruto) => {
  const texto = String(bruto?.message ?? bruto ?? '').toLowerCase();

  if (texto.includes('produtos_slug_key') || texto.includes('duplicate key')) {
    return 'Já existe um produto com esse nome. Mude alguma coisa no nome, nem que seja o tema.';
  }

  if (texto.includes('publicado_tem_medidas')) {
    return 'Sem peso ou sem as medidas da caixa o frete sai errado. Preencha antes de colocar no ar.';
  }

  if (texto.includes('publicado_tem_pasta')) {
    return 'Falta a pasta do Drive. Sem ela, a loja não tem o que entregar depois do pagamento.';
  }

  if (texto.includes('promocional_menor_que_cheio')) {
    return 'O preço promocional precisa ser menor que o preço normal.';
  }

  if (texto.includes('row-level security') || texto.includes('42501')) {
    return 'A sua conta não tem permissão para mexer nos produtos. Entre de novo, ou me chame.';
  }

  return 'Não consegui salvar agora. Tente de novo em instantes.';
};

const Campo = ({ rotulo, ajuda, children }) => (
  <label className="produto-campo">
    <span className="produto-campo-rotulo">{rotulo}</span>
    {children}
    {ajuda && <small className="produto-campo-ajuda">{ajuda}</small>}
  </label>
);

/**
 * @param id  produto existente, ou vazio para cadastrar um novo
 */
const FormularioDeProduto = ({ id = '', aoSair, aoSalvar }) => {
  const [form, setForm] = useState(id ? null : FORMULARIO_VAZIO);

  /* O que já está cadastrado, para responder o peso da caixa por ela.
     Ver `medidasDoTipo.ts`: a pergunta é a mesma que a gente decidiu não
     fazer a ela em 27/08, e a tela faz assim mesmo. */
  const [jaCadastradas, setJaCadastradas] = useState([]);
  const [medidasSugeridas, setMedidasSugeridas] = useState(null);
  const [slugAtual, setSlugAtual] = useState('');
  const [temas, setTemas] = useState([]);
  const [erro, setErro] = useState('');
  const [avisos, setAvisos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  useEffect(() => {
    let valendo = true;

    listarTemas()
      .then((lista) => { if (valendo) setTemas(lista); })
      .catch(() => { /* Sem tema, a lista fica vazia e o produto salva sem tema. */ });

    if (id) {
      buscarParaEditar(id)
        .then((linha) => {
          if (!valendo) return;
          setForm(doBanco(linha));
          setSlugAtual(String(linha.slug ?? ''));
        })
        .catch((e) => { if (valendo) { setForm(FORMULARIO_VAZIO); setErro(recadoDoErro(e)); } });
    }

    return () => { valendo = false; };
  }, [id]);

  useEffect(() => {
    let valendo = true;
    medidasJaCadastradas()
      .then((linhas) => { if (valendo) setJaCadastradas(linhas); })
      /* Falhar aqui não pode atrapalhar o cadastro: sem a sugestão ela
         preenche à mão, que é o que acontecia antes. */
      .catch(() => {});
    return () => { valendo = false; };
  }, []);

  /**
   * Preenche a caixa a partir dos produtos parecidos.
   *
   * Só quando os quatro campos estão vazios: mexer no que ela digitou
   * seria pior que não ajudar.
   */
  const sugerirMedidas = (nome) => {
    const achou = medidasParecidas(nome, jaCadastradas);
    if (!achou) return;

    setForm((atual) => {
      const vazios = ['peso_g', 'alt_cm', 'larg_cm', 'comp_cm'].every((c) => !String(atual[c] ?? '').trim());
      if (!vazios) return atual;

      setMedidasSugeridas(achou);
      return {
        ...atual,
        peso_g: String(achou.peso_g),
        alt_cm: String(achou.alt_cm),
        larg_cm: String(achou.larg_cm),
        comp_cm: String(achou.comp_cm),
      };
    });
  };

  const mudar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  /* A foto sobe na hora de escolher, e não junto com o resto.
     Se esperasse o "salvar", ela ficaria olhando a tela parada sem saber
     se a foto foi ou não, e um erro de rede levaria junto tudo o que ela
     já tinha digitado.

     O endereço do produto precisa existir antes: é a pasta onde a foto
     mora. Em produto novo ele vem do nome, e por isso o nome é cobrado
     aqui antes da foto. */
  const escolherFoto = async (evento) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const pasta = slugAtual || enderecoDoNome(form.nome);

    if (!pasta) {
      setErro('Dê um nome ao produto antes de mandar a foto: é o nome que diz onde ela fica guardada.');
      evento.target.value = '';
      return;
    }

    /* A capa é a de ordem 0, e as outras seguem. A ordem também é o nome
       do arquivo no balde: sem ela, a segunda foto sobrescreveria a
       primeira e ela ficaria vendo a mesma imagem duas vezes. */
    const capa = evento.target.dataset.capa === 'sim';
    const ordem = capa ? 0 : form.galeria.length + 1;

    setErro('');
    setEnviandoFoto(true);

    try {
      const { cheia, mini } = await enviarFoto(arquivo, pasta, ordem);

      setForm((atual) =>
        capa
          ? { ...atual, imagem: cheia, imagem_mini: mini }
          : { ...atual, galeria: [...atual.galeria, cheia] },
      );
    } catch (e) {
      setErro(e?.message ?? 'Não consegui enviar a foto agora. Tente de novo.');
    } finally {
      setEnviandoFoto(false);
      // Sem isto, escolher a mesma foto de novo não dispara nada.
      evento.target.value = '';
    }
  };

  /* Tira da lista, e não do balde. O arquivo fica lá, ocupando pouco, e
     some da loja na hora. Apagar de verdade é irreversível, e um toque
     errado no celular dela não pode custar a foto. */
  const tirarDaGaleria = (endereco) =>
    setForm((atual) => ({
      ...atual,
      galeria: atual.galeria.filter((f) => f !== endereco),
    }));

  const enviar = async (evento) => {
    evento.preventDefault();
    setErro('');

    const achados = problemas(form);
    setAvisos(achados);
    if (achados.length) return;

    setSalvando(true);

    try {
      const salvo = await salvarProduto(paraOBanco(form, slugAtual), id);
      aoSalvar?.(salvo);
    } catch (e) {
      setErro(recadoDoErro(e));
    } finally {
      setSalvando(false);
    }
  };

  if (!form) {
    return (
      <p className="produtos-carregando">
        <Loader2 size={18} className="girando" aria-hidden="true" /> Abrindo o produto…
      </p>
    );
  }

  const digital = form.linha === 'pedagogica';

  return (
    <section className="produto-formulario">
      <header className="produto-formulario-topo">
        <button type="button" className="produto-voltar" onClick={aoSair}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para os produtos
        </button>
        <h2>{id ? 'Editar produto' : 'Cadastrar produto'}</h2>
      </header>

      {erro && <p className="produtos-erro" role="alert">{erro}</p>}

      {avisos.length > 0 && (
        <div className="produtos-erro" role="alert">
          <strong>Falta preencher:</strong>
          <ul>{avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}</ul>
        </div>
      )}

      <form onSubmit={enviar} noValidate>
        <Campo
          rotulo="Nome do produto"
          ajuda="É o que a cliente lê na loja e o que ela digita no Google. Vale escrever o tipo e o tema, como em Lousa Mágica - Peppa Pig."
        >
          {/* A sugestão sai quando ela termina de escrever, e não a cada
              letra: preencher no meio da digitação é a tela mexendo
              sozinha enquanto a pessoa ainda está pensando. */}
          <input
            type="text"
            value={form.nome}
            onChange={mudar('nome')}
            onBlur={(e) => sugerirMedidas(e.target.value)}
            required
          />
        </Campo>

        <div className="produto-foto-campo">
          <span className="produto-campo-rotulo">Foto do produto</span>

          {form.imagem_mini ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imagem_mini} alt="" className="produto-foto-previa" />
          ) : (
            <p className="produto-foto-vazia">Nenhuma foto ainda</p>
          )}

          <label className="produto-foto-botao">
            <ImagePlus size={16} aria-hidden="true" />
            {enviandoFoto
              ? 'Enviando…'
              : form.imagem_mini
                ? 'Trocar a foto'
                : 'Escolher a foto'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={escolherFoto}
              disabled={enviandoFoto}
              data-capa="sim"
            />
          </label>

          <small className="produto-campo-ajuda">
            É a foto que aparece na vitrine. Pode mandar do celular do jeito que ela sai:
            ela é reduzida aqui mesmo antes de subir, para a loja abrir rápido no 4G.
          </small>
        </div>

        <div className="produto-foto-campo">
          <span className="produto-campo-rotulo">Outras fotos</span>

          {form.galeria.length > 0 && (
            <ul className="produto-galeria">
              {form.galeria.map((endereco) => (
                <li key={endereco}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={endereco} alt="" />
                  <button
                    type="button"
                    onClick={() => tirarDaGaleria(endereco)}
                    aria-label="Tirar esta foto do produto"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label className="produto-foto-botao">
            <ImagePlus size={16} aria-hidden="true" />
            {enviandoFoto ? 'Enviando…' : 'Adicionar outra foto'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={escolherFoto}
              disabled={enviandoFoto}
            />
          </label>

          <small className="produto-campo-ajuda">
            O ângulo, a embalagem, o detalhe. É o que você mandava no Elo7, e é o que
            responde a dúvida da cliente antes de ela precisar perguntar.
          </small>
        </div>

        <Campo rotulo="Descrição" ajuda="O que vem junto, o tamanho, como você personaliza.">
          <textarea rows={5} value={form.descricao} onChange={mudar('descricao')} />
        </Campo>

        <div className="produto-linha-dupla">
          <Campo rotulo="Preço de cada peça" ajuda="Pode escrever com vírgula: 13,70.">
            <input
              type="text"
              inputMode="decimal"
              value={form.preco}
              onChange={mudar('preco')}
              required
            />
          </Campo>

          <Campo rotulo="Preço promocional" ajuda="Deixe vazio se não houver promoção.">
            <input
              type="text"
              inputMode="decimal"
              value={form.preco_promocional}
              onChange={mudar('preco_promocional')}
            />
          </Campo>
        </div>

        <div className="produto-linha-dupla">
          <Campo rotulo="Tipo">
            <select value={form.linha} onChange={mudar('linha')}>
              <option value="personalizada">Personalizado, enviado pelos Correios</option>
              <option value="pedagogica">Material digital, baixado na hora</option>
            </select>
          </Campo>

          <Campo rotulo="Tema">
            <select value={form.tema_id} onChange={mudar('tema_id')}>
              <option value="">Sem tema</option>
              {temas.map((tema) => (
                <option key={tema.id} value={tema.id}>{tema.nome}</option>
              ))}
            </select>
          </Campo>
        </div>

        <div className="produto-linha-dupla">
          <Campo rotulo="Mínimo por pedido" ajuda="Quantas peças a cliente precisa levar.">
            <input type="text" inputMode="numeric" value={form.minimo} onChange={mudar('minimo')} />
          </Campo>

          <Campo rotulo="Pronto em quantos dias">
            <input
              type="text"
              inputMode="numeric"
              value={form.prazo_producao}
              onChange={mudar('prazo_producao')}
            />
          </Campo>
        </div>

        {digital ? (
          <Campo
            rotulo="Pasta do Drive"
            ajuda="O arquivo continua no seu Drive. A loja libera o acesso para o e-mail de quem comprou."
          >
            <input type="text" value={form.pasta_drive} onChange={mudar('pasta_drive')} />
          </Campo>
        ) : (
          <fieldset className="produto-caixa">
            <legend>A caixa fechada, como você envia</legend>
            <p className="produto-campo-ajuda">
              É o pacote com as {form.minimo || 10} peças dentro, e não uma peça só. É com isso
              que os Correios calculam o frete.
            </p>

            {/* De onde os números vieram, escrito na tela.
                Preencher em silêncio é pior: ela não saberia se pode
                confiar, e o campo é justamente o que ela não sabe
                responder sozinha. */}
            {medidasSugeridas && (
              <p className="produto-campo-sugerido">
                Peguei de {medidasSugeridas.quantos === 1 ? 'outro produto' : `outros ${medidasSugeridas.quantos}`}{' '}
                do tipo <strong>{medidasSugeridas.familia}</strong>. Se esta caixa for diferente,
                é só corrigir.
              </p>
            )}

            <div className="produto-linha-quadrupla">
              <Campo rotulo="Peso (g)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.peso_g}
                  onChange={mudar('peso_g')}
                />
              </Campo>
              <Campo rotulo="Altura (cm)">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.alt_cm}
                  onChange={mudar('alt_cm')}
                />
              </Campo>
              <Campo rotulo="Largura (cm)">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.larg_cm}
                  onChange={mudar('larg_cm')}
                />
              </Campo>
              <Campo rotulo="Comprimento (cm)">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.comp_cm}
                  onChange={mudar('comp_cm')}
                />
              </Campo>
            </div>
          </fieldset>
        )}

        <label className="produto-no-ar">
          <input type="checkbox" checked={form.ativo} onChange={mudar('ativo')} />
          <span>
            <strong>Deixar no ar</strong>
            <small>
              Desmarcado, o produto fica guardado só para você e não aparece na loja. Dá para
              cadastrar agora e publicar depois.
            </small>
          </span>
        </label>

        <div className="produto-acoes-formulario">
          <button type="submit" className="produtos-publicar" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar produto'}
          </button>
          <button type="button" className="produtos-tirar" onClick={aoSair} disabled={salvando}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormularioDeProduto;
