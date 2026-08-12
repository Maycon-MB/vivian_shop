'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import { Download, Clock, ShieldCheck, MessageCircle, FileText } from 'lucide-react';

/**
 * Baixar o material comprado.
 *
 * A pessoa chega aqui pelo link do e-mail. A tela precisa deixar claro,
 * antes de qualquer coisa, que o arquivo é dela e está ali — quem comprou
 * material digital costuma ficar em dúvida se a compra deu certo.
 *
 * Três informações honestas ficam à vista: quanto tempo o link vale,
 * quantas vezes ainda dá para baixar, e que o nome dela sai impresso no
 * arquivo. Descobrir o próprio nome no PDF depois, sem aviso, seria uma
 * surpresa ruim — avisado antes, vira o que é: um pedido para não repassar.
 */
const ARQUIVOS = [
  { nome: 'Apostila de alfabetização adaptada.pdf', paginas: 32, tamanho: '4,2 MB' },
  { nome: 'Cartões de apoio para recortar.pdf', paginas: 8, tamanho: '1,1 MB' },
];

const Baixar = () => {
  const [baixados, setBaixados] = useState([]);

  const baixar = (nome) => setBaixados((atual) => [...new Set([...atual, nome])]);

  return (
    <div className="baixar-pagina">
      <Container className="py-5">
        <div className="baixar-topo">
          <span className="baixar-selo">
            <Download size={28} />
          </span>
          <h1>Seu material está aqui</h1>
          <p>
            Pedido <strong>#0004</strong> · comprado em 12 de agosto
          </p>
        </div>

        <section className="baixar-lista">
          {ARQUIVOS.map((arquivo) => {
            const jaBaixou = baixados.includes(arquivo.nome);

            return (
              <div className="baixar-item" key={arquivo.nome}>
                <span className="baixar-icone">
                  <FileText size={22} />
                </span>

                <div className="baixar-info">
                  <strong>{arquivo.nome}</strong>
                  <span>
                    {arquivo.paginas} páginas · {arquivo.tamanho}
                  </span>
                </div>

                <button
                  type="button"
                  className={`baixar-acao ${jaBaixou ? 'feito' : ''}`}
                  onClick={() => baixar(arquivo.nome)}
                >
                  <Download size={16} /> {jaBaixou ? 'Baixar de novo' : 'Baixar'}
                </button>
              </div>
            );
          })}
        </section>

        <section className="baixar-avisos">
          <div className="baixar-aviso">
            <Clock size={17} />
            <div>
              <strong>Este link vale até 19 de agosto</strong>
              <p>
                Depois disso ele para de funcionar. Baixe e guarde o arquivo no seu computador
                ou celular — se perder, é só me chamar que eu reenvio.
              </p>
            </div>
          </div>

          <div className="baixar-aviso">
            <ShieldCheck size={17} />
            <div>
              <strong>Seu nome sai impresso no arquivo</strong>
              <p>
                Pequeno, no rodapé de cada página. É o que permite vender material digital sem
                que ele acabe circulando em grupo — e é o que mantém o preço baixo para quem
                compra.
              </p>
            </div>
          </div>
        </section>

        <section className="baixar-ajuda">
          <p>Deu algum problema para baixar, ou o arquivo abriu errado?</p>

          <div className="baixar-acoes-rodape">
            <a
              className="acao-whats-grande"
              href="https://wa.me/5521900000000"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} /> Me chamar no WhatsApp
            </a>

            <Link href="/" className="acao-voltar">
              Ver outros materiais
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Baixar;
