'use client'

import React from 'react';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { ShieldCheck, Truck, RotateCcw, MessageCircle, MapPin } from 'lucide-react';

/**
 * Rodapé de confiança.
 *
 * Quem chega aqui vindo do Instagram nunca comprou nesta loja. Antes de
 * gastar trezentos e poucos reais com uma pessoa que ele não conhece, ele
 * rola até o fim da página procurando três coisas: como se paga, como
 * chega, e o que acontece se der errado. No Elo7 quem respondia isso era
 * a plataforma. Aqui não tem plataforma — então o rodapé responde.
 *
 * Por isso ele não é uma tira de links: cada coluna é uma dessas perguntas,
 * escrita em palavras de gente. O prazo de 7 dias aparece com o artigo da
 * lei do lado não por formalidade, mas porque é o que faz a frase parar de
 * soar como promessa de vendedor e passar a soar como direito.
 *
 * Decisão consciente: CNPJ e razão social ficam como lacuna VISÍVEL. Não
 * inventamos número de documento. Um CNPJ fictício num rodapé é o tipo de
 * coisa que ninguém revisa e vai ao ar — melhor a falta gritar do que a
 * mentira passar despercebida.
 */

const cores = {
  aguaLinhaPersonalizada: '#1F736F',
  amareloLinhaPedagogica: '#FFD400',
  azulTinta: '#12305B',
  papel: '#FBFAF7',
  cinzaApoio: '#5F6F80',
  borda: '#DCE9F6',
};

const WHATSAPP = 'https://wa.me/5521900000000';
const anoAtual = new Date().getFullYear();

const estiloTituloColuna = {
  fontSize: '.82rem',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: cores.azulTinta,
  fontWeight: 700,
  marginBottom: '.9rem',
};

const estiloItem = {
  display: 'flex',
  gap: '.6rem',
  alignItems: 'flex-start',
  marginBottom: '.85rem',
  color: cores.cinzaApoio,
  fontSize: '.94rem',
  lineHeight: 1.55,
};

const estiloLink = {
  color: cores.azulTinta,
  textDecoration: 'none',
  borderBottom: `1px solid ${cores.borda}`,
  paddingBottom: '1px',
};

const RodapeConfianca = () => (
  <footer
    style={{
      background: cores.papel,
      borderTop: `1px solid ${cores.borda}`,
      color: cores.azulTinta,
      paddingTop: '3rem',
      paddingBottom: '2rem',
      // Espaço extra embaixo: a barra de navegação fixa do rodapé cobre
      // a faixa inferior da tela no celular e comeria a última linha.
      marginBottom: 0,
    }}
  >
    <Container>
      <Row className="gy-4">
        {/* Quem é a loja */}
        <Col xs={12} md={4}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              lineHeight: 1.3,
              marginBottom: '.6rem',
            }}
          >
            Feito para você!{' '}
            <span style={{ color: cores.aguaLinhaPersonalizada }}>Personalizados</span>
          </div>
          <p style={{ color: cores.cinzaApoio, fontSize: '.94rem', lineHeight: 1.6, margin: 0 }}>
            Papelaria personalizada feita à mão, sob encomenda, e material pedagógico em arquivo
            digital para quem trabalha com crianças.
          </p>
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '.5rem',
              flexWrap: 'wrap',
              fontSize: '.8rem',
            }}
          >
            <span
              style={{
                background: cores.aguaLinhaPersonalizada,
                color: '#FFFFFF',
                borderRadius: 999,
                padding: '.2rem .7rem',
              }}
            >
              Personalizados
            </span>
            <span
              style={{
                background: cores.amareloLinhaPedagogica,
                color: cores.azulTinta,
                borderRadius: 999,
                padding: '.2rem .7rem',
                fontWeight: 600,
              }}
            >
              Pedagógicos
            </span>
          </div>
        </Col>

        {/* O que a pessoa quer saber antes de pagar */}
        <Col xs={12} md={4}>
          <h2 style={estiloTituloColuna}>Comprar com segurança</h2>

          <div style={estiloItem}>
            <ShieldCheck size={18} color={cores.aguaLinhaPersonalizada} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              O pagamento é feito pelo <strong style={{ color: cores.azulTinta }}>Mercado Pago</strong>.
              Seus dados de cartão ficam com eles, não comigo.
            </span>
          </div>

          <div style={estiloItem}>
            <Truck size={18} color={cores.aguaLinhaPersonalizada} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Envio pelos <strong style={{ color: cores.azulTinta }}>Correios</strong> ou{' '}
              <strong style={{ color: cores.azulTinta }}>Jadlog</strong>, com código de rastreio
              mandado assim que a encomenda sai.
            </span>
          </div>

          <div style={estiloItem}>
            <RotateCcw size={18} color={cores.aguaLinhaPersonalizada} style={{ flexShrink: 0, marginTop: 2 }} />
            {/* PENDENTE-LANCAMENTO: este texto precisa de validação de um
                contador ou advogado antes de a loja abrir.
                O art. 49 do Código de Defesa do Consumidor dá 7 dias de
                arrependimento em compra pela internet e não abre exceção
                escrita para produto personalizado. Só que uma peça feita
                com o nome de outra criança não pode ser revendida: se a
                devolução acontecer, o prejuízo é inteiro da Vivian.
                Por isso o texto informa o direito sem prometer nada além
                dele, e pede contato antes, o acerto caso a caso protege
                os dois lados melhor que uma promessa larga demais. */}
            <span>
              Comprou pela internet e se arrependeu? O Código de Defesa do Consumidor te dá{' '}
              <strong style={{ color: cores.azulTinta }}>7 dias</strong> a partir do recebimento
              (art. 49). Nos materiais digitais é só avisar. Nos produtos personalizados, que
              são feitos com o nome de alguém, me chame antes: a gente resolve conversando, do
              jeito que for melhor para você.
            </span>
          </div>
        </Col>

        {/* Onde tirar dúvida */}
        <Col xs={12} md={4}>
          <h2 style={estiloTituloColuna}>Dúvidas</h2>

          <div style={estiloItem}>
            <MessageCircle size={18} color={cores.aguaLinhaPersonalizada} style={{ flexShrink: 0, marginTop: 2 }} />
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={estiloLink}>
              Falar comigo no WhatsApp
            </a>
          </div>

          <div style={estiloItem}>
            <span style={{ width: 18, flexShrink: 0 }} />
            <Link href="/sobre/" style={estiloLink}>
              Quem faz
            </Link>
          </div>

          <div style={estiloItem}>
            <span style={{ width: 18, flexShrink: 0 }} />
            <Link href="/como-funciona/" style={estiloLink}>
              Como funciona a compra
            </Link>
          </div>
        </Col>
      </Row>

      {/* Linha final: origem, identificação da empresa e ano */}
      <div
        style={{
          borderTop: `1px solid ${cores.borda}`,
          marginTop: '2.2rem',
          paddingTop: '1.2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '.4rem 1.4rem',
          alignItems: 'center',
          color: cores.cinzaApoio,
          fontSize: '.85rem',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
          <MapPin size={15} color={cores.cinzaApoio} />
          Enviado do Rio de Janeiro, RJ
        </span>

        {/* Lacuna proposital, ver comentário do topo do arquivo. */}
        <span style={{ fontStyle: 'italic', fontSize: '.8rem' }}>
          CNPJ e razão social entram aqui assim que a loja informar os dados.
        </span>

        <span style={{ marginLeft: 'auto' }}>© {anoAtual} Feito para você! Personalizados</span>
      </div>
    </Container>
  </footer>
);

export default RodapeConfianca;
