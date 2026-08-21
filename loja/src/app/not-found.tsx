import Link from 'next/link'
import { Container, Row, Col } from 'react-bootstrap'
import { MessageCircle, ArrowLeft, Search } from 'lucide-react'

/* POR QUE ESTA PÁGINA EXISTE
   Sem ela, um endereço que não existe cai na tela preta padrão do Next, com
   "404 This page could not be found". Quem compra aqui é mãe, professora,
   psicopedagoga, quase sempre no celular, muitas vindas de um link antigo do
   Instagram. Essa tela preta parece site fora do ar: a pessoa fecha e vai embora.

   DECISÃO DE TOM
   Nada de "erro 404", "recurso não encontrado" ou "URL inválida", isso não quer
   dizer nada para o público dela e ainda assusta. O texto fala como a Vivian
   falaria atendendo: assume a bagunça do nosso lado ("esse endereço mudou de
   lugar"), não culpa quem clicou, e em uma frase já diz o que fazer agora.

   O WHATSAPP É O CAMINHO PRINCIPAL, não a última opção: quem cai aqui vindo de
   um link de produto que saiu do ar geralmente quer justamente aquele produto,
   e como tudo é feito sob encomenda, a conversa resolve, a Vivian refaz.

   A ordem do texto é a ordem em que um leitor de tela vai ler: o que aconteceu,
   o que fazer, e só então os caminhos. Tudo com estilo inline de propósito,
   porque os arquivos de CSS estão sendo mexidos por outra pessoa. */

/* Sem export de metadata aqui de propósito: na versão 16 o título customizado
   dessa tela só vale em global-not-found.js, que não usamos. O título do layout
   já serve, e o Next marca a página como noindex sozinho. */

const PAPEL = '#FBFAF7'
const TINTA = '#12305B'
const VERDE_ESCURO = '#1F736F'
const AMARELO = '#FFD400'
const CINZA = '#5F6F80'
const LINHA = '#DCE9F6'

/* 44px de alvo de toque é o mínimo para quem clica com o polegar, de pé,
   segurando criança. Vale para os três botões. */
const baseAcao: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  minHeight: 44,
  padding: '0.75rem 1.25rem',
  borderRadius: 999,
  fontWeight: 700,
  textDecoration: 'none',
  width: '100%',
}

export default function NaoEncontrada() {
  return (
    <div style={{ backgroundColor: PAPEL, padding: '3rem 0 4rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 999,
                backgroundColor: AMARELO,
                marginBottom: '1.25rem',
              }}
            >
              <Search size={26} color={TINTA} strokeWidth={2.25} />
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                color: TINTA,
                fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                lineHeight: 1.15,
                marginBottom: '1rem',
              }}
            >
              Não encontramos esta página
            </h1>

            <p
              style={{
                color: TINTA,
                fontSize: '1.125rem',
                lineHeight: 1.6,
                marginBottom: '0.75rem',
              }}
            >
              Esse endereço mudou de lugar ou saiu do ar. Pode ser um link antigo.
              A loja está no ar normalmente, é só voltar para o começo e continuar
              de lá.
            </p>

            <p
              style={{
                color: CINZA,
                fontSize: '1rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              Se você veio atrás de um produto específico, me chama no WhatsApp com
              o link que você clicou. Tudo aqui é feito sob encomenda, então quase
              sempre dá para refazer.
            </p>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
              <a
                href="https://wa.me/5521900000000"
                style={{
                  ...baseAcao,
                  backgroundColor: VERDE_ESCURO,
                  color: '#FFFFFF',
                }}
              >
                <MessageCircle size={20} strokeWidth={2.25} aria-hidden="true" />
                Falar com a Vivian no WhatsApp
              </a>

              <Link
                href="/"
                prefetch={false}
                style={{
                  ...baseAcao,
                  backgroundColor: '#FFFFFF',
                  color: TINTA,
                  border: `2px solid ${TINTA}`,
                }}
              >
                <ArrowLeft size={20} strokeWidth={2.25} aria-hidden="true" />
                Voltar para a loja
              </Link>
            </div>

            <p
              style={{
                borderTop: `1px solid ${LINHA}`,
                paddingTop: '1.5rem',
                color: CINZA,
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Primeira vez por aqui?{' '}
              <Link
                href="/sobre/"
                prefetch={false}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 44,
                  color: TINTA,
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                Conheça quem faz cada peça
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
