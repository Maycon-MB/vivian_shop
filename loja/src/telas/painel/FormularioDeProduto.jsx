'use client'

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

import {
  FORMULARIO_VAZIO,
  doBanco,
  paraOBanco,
  problemas,
} from '@/dominio/edicaoDeProduto';
import { buscarParaEditar, listarTemas, salvarProduto } from '@/dados/produtosDaDona';

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
  const [slugAtual, setSlugAtual] = useState('');
  const [temas, setTemas] = useState([]);
  const [erro, setErro] = useState('');
  const [avisos, setAvisos] = useState([]);
  const [salvando, setSalvando] = useState(false);

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

  const mudar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

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
          <input type="text" value={form.nome} onChange={mudar('nome')} required />
        </Campo>

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
