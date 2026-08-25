'use client'

import React, { useState, useEffect, useRef } from 'react';
import Grafico from './painel/Grafico';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Plus, 
  CheckCircle, 
  Eye, 
  Printer,
  User,
  Send,
  Menu,
  X
} from 'lucide-react';
import { Row, Col, Card, Button, Modal, Form, Toast, ToastContainer } from 'react-bootstrap';
import Sidebar from './dashboard/Sidebar';
import StatsCard from './dashboard/StatsCard';
import OrderTable from './dashboard/OrderTable';
import MarketingIA from './dashboard/MarketingIA';
import LogisticsCard from './dashboard/LogisticsCard';
import CatalogSection from './dashboard/sections/CatalogSection';
import CartaoKpi from './painel/CartaoKpi';
import CartaoPainel from './painel/CartaoPainel';
import AbaPedidos from './painel/AbaPedidos';
import AbaProdutos from './painel/AbaProdutos';
import MeusProdutos from './painel/MeusProdutos';
import './painel/produtos.css';
import { temBanco } from '@/servicos/autenticacao';
import AbaMensagens from './painel/AbaMensagens';
import MinhasConversas from './painel/MinhasConversas';
import AbaMarketing from './painel/AbaMarketing';
import AbaConfiguracoes from './painel/AbaConfiguracoes';
import AbaRelatorios from './painel/AbaRelatorios';
import { VendasPorDia, ProporcaoLinhas, MaisVendidos } from './painel/GraficosVisaoGeral';
import FilaProducao from './painel/FilaProducao';
import './painel.css';
import './painel-abas.css';
import { BASE } from '../base'

const ABAS = ['dashboard', 'pedidos', 'catalogo', 'relatorios', 'mensagens', 'marketing', 'config'];

/**
 * A aba aberta vem do endereço (?aba=pedidos) e volta para ele a cada
 * troca. Assim a cliente pode salvar o link da tela que mais usa, e um
 * link mandado no WhatsApp abre onde deveria.
 *
 * A leitura acontece depois de montar, e não no estado inicial: a página
 * é gerada como arquivo estático, então o HTML entregue não conhece a
 * consulta do endereço. Decidir a aba antes da hidratação faria a primeira
 * renderização do navegador divergir do HTML e o React reclamar.
 */
const abaDoEndereco = () => {
  const aba = new URLSearchParams(window.location.search).get('aba');
  return ABAS.includes(aba) ? aba : 'dashboard';
};

const AdminDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showManualSale, setShowManualSale] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [approving, setApproving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(false);

  /**
   * Abre na aba pedida pelo endereço, uma vez, depois de montar.
   *
   * A trava com ref existe porque em desenvolvimento o React roda os
   * efeitos duas vezes de propósito. Sem ela, a segunda execução leria um
   * endereço que o efeito de sincronia já tinha limpado, e a tela voltava
   * para a visão geral sozinha.
   */
  const enderecoLido = useRef(false);

  useEffect(() => {
    if (enderecoLido.current) return;
    enderecoLido.current = true;
    setActiveTab(abaDoEndereco());
  }, []);

  // Só escreve no endereço depois de ter lido dele.
  useEffect(() => {
    if (!enderecoLido.current) return;
    const url = new URL(window.location.href);
    if (activeTab === 'dashboard') url.searchParams.delete('aba');
    else url.searchParams.set('aba', activeTab);
    window.history.replaceState(null, '', url);
  }, [activeTab]);

  /**
   * Pedidos de exemplo, para mostrar como a tela se comporta. Os status
   * são os reais das duas linhas: a personalizada passa por produção, a
   * pedagógica é entregue na hora do pagamento.
   */
  const [orders, setOrders] = useState([
    { id: '#0003', customer: 'Exemplo: pedido digital', items: 'Apostila de alfabetização adaptada', total: 47.00, status: 'Entregue por e-mail', date: 'Hoje, 14:20', niche: 'Papelaria pedagógica' },
    { id: '#0002', customer: 'Exemplo: pedido personalizado', items: '10x Caderno personalizado', total: 320.00, status: 'Em produção', date: 'Hoje, 11:05', niche: 'Papelaria personalizada' },
    { id: '#0001', customer: 'Exemplo: pronto para envio', items: '10x Cartela de adesivos', total: 180.00, status: 'Pronto para envio', date: 'Ontem, 19:30', niche: 'Papelaria personalizada' },
  ]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const handleApprovePost = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      triggerToast('Post agendado com sucesso no Instagram!');
    }, 1500);
  };

  const handleAddManualSale = (e) => {
    e.preventDefault();
    const newOrder = {
        id: `#${Math.floor(Math.random() * 1000) + 5000}`,
        customer: 'Venda Manual (WhatsApp)',
        items: 'Produto Personalizado',
        total: 150.00,
        status: 'Pago',
        date: 'Agora',
        niche: 'Papelaria personalizada'
    };
    setOrders([newOrder, ...orders]);
    setShowManualSale(false);
    triggerToast('Venda manual registrada com sucesso!');
  };

  const salesChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      axisLine: { lineStyle: { color: '#eee' } }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f5f5f5' } } },
    series: [
      {
        name: 'Personalizada (R$)',
        data: [5200, 6320, 5010, 7340, 8900, 9300],
        type: 'line',
        smooth: true,
        color: '#1F736F',
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(46, 155, 150, 0.1)' }
      },
      {
        name: 'Pedagógica (R$)',
        data: [3000, 3000, 4000, 4000, 4000, 4000],
        type: 'line',
        smooth: true,
        color: '#FFD400',
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(255, 212, 0, 0.1)' }
      }
    ]
  };

  /**
   * Números da visão geral.
   *
   * Zerados de propósito: loja nova começa em zero, e número inventado no
   * painel da própria dona não ajuda a decidir nada — só cria expectativa
   * que a primeira semana real desmente.
   *
   * Cada um carrega a própria explicação, porque a cliente não é técnica e
   * painel sem explicação vira enfeite: ela olha, não entende, e volta a
   * controlar tudo no caderno.
   */
  const indicadores = [
    {
      rotulo: 'Esperando você',
      valor: 3,
      icone: <Package size={20} />,
      cor: '#FFD400',
      nota: '2 em produção, 1 pronto para postar',
      info: 'Pedidos já pagos que dependem de você produzir ou postar. É por onde começar o dia.',
    },
    {
      rotulo: 'Vendas do mês',
      valor: 16768,
      prefixo: 'R$ ',
      casas: 2,
      icone: <ShoppingBag size={20} />,
      cor: '#1F736F',
      nota: 'sem contar o frete',
      info: 'Soma dos pedidos pagos neste mês, sem contar o frete, o frete é dos Correios, não seu.',
    },
    {
      rotulo: 'Clientes',
      valor: 47,
      icone: <Users size={20} />,
      cor: '#12305B',
      nota: '12 compraram mais de uma vez',
      info: 'Quantas pessoas diferentes já compraram. Cliente que volta conta uma vez só.',
    },
    {
      rotulo: 'Economizado em taxas',
      valor: 3186,
      prefixo: 'R$ ',
      casas: 2,
      icone: <TrendingUp size={20} />,
      cor: '#C4436B',
      nota: 'comissão que você não pagou',
      info: 'Quanto você teria pago de comissão se estas vendas tivessem passado pelo Elo7. É o que a loja própria te devolve.',
    },
  ];

  return (
    <div className="painel d-flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        recolhida={sidebarRecolhida}
        onAlternarRecolhida={() => setSidebarRecolhida((v) => !v)}
      />

      <div className="flex-grow-1 p-3 p-md-5 overflow-auto w-100">
        {activeTab === 'dashboard' && (
          <>
            <header className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="link"
                  className="p-0 text-dark mobile-only"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu size={24} />
                </Button>
                <div>
                  <h1 className="painel-titulo">Bem-vinda, Vivian</h1>
                  <p className="painel-subtitulo">
                    Papelaria personalizada e material pedagógico, no mesmo lugar.
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {/* Com banco, este botão leva ao catálogo de verdade, onde o
                    cadastro grava. O formulário do modal abaixo é da tela de
                    demonstração e não salva nada: deixá-lo aqui faria ela
                    preencher um produto inteiro e ver "cadastrado" sem
                    produto nenhum ter sido criado. */}
                <Button onClick={() => (temBanco() ? setActiveTab('catalogo') : setShowNewProduct(true))} variant="outline-dark" className="px-3 rounded-pill fw-bold d-flex align-items-center gap-2 small">
                  <Plus size={16} /> <span className="d-none d-sm-inline">Novo produto</span>
                </Button>
                <Button onClick={() => setShowManualSale(true)} variant="outline-primary" className="px-3 rounded-pill fw-bold d-flex align-items-center gap-2 small" style={{ color: '#1F736F', borderColor: '#1F736F' }}>
                  <CheckCircle size={16} /> <span className="d-none d-sm-inline">Lançar venda</span>
                </Button>
                <Button onClick={() => window.open(BASE, '_blank', 'noopener')} variant="primary" className="px-3 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 small" style={{ backgroundColor: '#1F736F', borderColor: '#1F736F' }}>
                  <Eye size={16} /> <span className="d-none d-sm-inline">Ver a loja</span>
                </Button>
              </div>
            </header>

            {/* Grid de 12 colunas: 4 números lado a lado no computador,
                2 no tablet, 1 no celular. */}
            <Row className="g-3 mb-4">
              {indicadores.map((indicador, i) => (
                <Col xxl={3} lg={6} key={indicador.rotulo}>
                  <CartaoKpi {...indicador} atraso={i * 60} />
                </Col>
              ))}
            </Row>

            <Row className="g-3 mb-3">
              <Col xxl={8}>
                <CartaoPainel
                  titulo="Quanto entrou por dia"
                  subtitulo="Escolha o período, ou veja em que dias da semana você mais vende."
                  cor="#1F736F"
                  info="Serve para ver se a loja está crescendo ou parando, e para descobrir em que dia da semana você vende mais, dá para postar no Instagram justamente nesse dia."
                  acao={
                    <span className="d-flex align-items-center gap-3">
                      <span className="d-flex gap-3 small fw-bold" style={{ color: '#5F6F80' }}>
                        <span className="d-flex align-items-center gap-1">
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#1F736F' }} />
                          Personalizada
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFD400' }} />
                          Pedagógica
                        </span>
                      </span>
                      <span className="selo-exemplo">exemplo</span>
                    </span>
                  }
                >
                  <VendasPorDia />
                </CartaoPainel>
              </Col>

              <Col xxl={4}>
                <CartaoPainel
                  titulo="De onde vem o dinheiro"
                  subtitulo="Peso de cada linha no mês."
                  cor="#FFD400"
                  info="A linha pedagógica é digital: não tem frete nem produção, então quase tudo que entra ali é lucro. Se ela crescer, você trabalha menos para ganhar o mesmo."
                  acao={<span className="selo-exemplo">exemplo</span>}
                >
                  <ProporcaoLinhas />
                </CartaoPainel>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xxl={4} lg={6}>
                <CartaoPainel
                  titulo="Na sua bancada"
                  subtitulo="O que produzir primeiro."
                  cor="#C4436B"
                  info="A barra mostra quanto do prazo combinado já passou, não quanto do trabalho está feito. Vermelho é pedido que passou do prazo."
                  acao={<span className="selo-exemplo">exemplo</span>}
                >
                  <FilaProducao />
                </CartaoPainel>
              </Col>

              <Col xxl={4} lg={6}>
                <CartaoPainel
                  titulo="O que mais sai"
                  subtitulo="Unidades vendidas no mês."
                  cor="#12305B"
                  info="Use para decidir o que vale ter pronto e o que fotografar melhor. Produto que quase não aparece aqui talvez precise de foto nova, não de desconto."
                  acao={<span className="selo-exemplo">exemplo</span>}
                >
                  <MaisVendidos />
                </CartaoPainel>
              </Col>

              <Col xxl={4}>
                <CartaoPainel
                  titulo="Marketing"
                  subtitulo="Post sugerido para esta semana."
                  cor="#1F736F"
                  info="A sugestão sai do que você já vendeu. Você lê, ajusta o texto se quiser, e agenda, nada vai para o seu Instagram sem você aprovar."
                  semPadding
                >
                  <MarketingIA approving={approving} onApprove={handleApprovePost} />
                </CartaoPainel>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12}>
                <CartaoPainel
                  titulo="Para despachar"
                  subtitulo="Etiqueta e declaração de conteúdo saem juntas, prontas para imprimir."
                  cor="#FFD400"
                  info="A declaração vale para Correios e Jadlog: como você é MEI, ela substitui a nota fiscal no transporte."
                  semPadding
                >
                  <LogisticsCard onShowLabel={() => setShowLabelPreview(true)} />
                </CartaoPainel>
              </Col>
            </Row>

            <Row className="g-3">
              <Col xs={12}>
                <CartaoPainel
                  titulo="Últimos pedidos"
                  subtitulo="O que precisa de você aparece primeiro."
                  cor="#1F736F"
                  info="Pedido em produção está com você. Pronto para envio espera a etiqueta. Pedido digital já foi entregue sozinho, sem você fazer nada."
                  acao={
                    <button type="button" className="painel-card-acao" onClick={() => setActiveTab('pedidos')}>
                      Ver todos os pedidos
                    </button>
                  }
                >
                  <div className="table-responsive">
                    <OrderTable orders={orders} onSelectOrder={setSelectedOrder} />
                  </div>
                </CartaoPainel>
              </Col>
            </Row>

          </>
        )}

        {activeTab === 'pedidos' && (
          <AbaPedidos onAbrirEtiqueta={() => setShowLabelPreview(true)} />
        )}

        {/* Com banco, são as conversas de verdade, escaladas pela cliente
            dentro da loja. Sem banco, fica a caixa de exemplo, que é o
            que roda na demonstração. */}
        {activeTab === 'mensagens' &&
          (temBanco() ? <MinhasConversas /> : <AbaMensagens />)}

        {activeTab === 'marketing' && <AbaMarketing />}

        {/* Com banco, a lista é a do catálogo dela: 343 produtos vindos da
            Elojinha, com busca e publicação em lote. Sem banco, fica a tela
            de exemplo, que é o que roda na demonstração. */}
        {activeTab === 'catalogo' &&
          (temBanco() ? (
            <MeusProdutos />
          ) : (
            <AbaProdutos onNovoProduto={() => setShowNewProduct(true)} />
          ))}

        {activeTab === 'relatorios' && <AbaRelatorios />}

        {activeTab === 'config' && <AbaConfiguracoes />}

      </div>

      {/* Modals & Toasts */}
      <Modal show={showNewProduct} onHide={() => setShowNewProduct(false)} centered>
        <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-black">Cadastrar Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
            <Form className="d-flex flex-column gap-3">
                <Form.Group>
                    <Form.Label className="small fw-bold">Nome do Produto</Form.Label>
                    <Form.Control placeholder="Ex: Planner 2026" className="py-2" />
                </Form.Group>
                <Row>
                    <Col md={6}>
                        <Form.Label className="small fw-bold">Preço (R$)</Form.Label>
                        <Form.Control type="number" placeholder="0,00" />
                    </Col>
                    <Col md={6}>
                        <Form.Label className="small fw-bold">Nicho</Form.Label>
                        <Form.Select>
                            <option>Feito para Você</option>
                            <option>Projeto Educar</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Form.Group>
                    <Form.Label className="small fw-bold">Descrição</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>
                <Button className="w-100 py-3 rounded-pill fw-bold mt-2" variant="dark" onClick={() => { setShowNewProduct(false); triggerToast('Produto cadastrado nas duas lojas!'); }}>
                    Publicar Produto
                </Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showManualSale} onHide={() => setShowManualSale(false)} centered>
        <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-black">Lançar Venda Manual</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
            <Form onSubmit={handleAddManualSale} className="d-flex flex-column gap-3">
                <Form.Group>
                    <Form.Label className="small fw-bold">Nome do Cliente</Form.Label>
                    <Form.Control placeholder="Ex: João via WhatsApp" required />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="small fw-bold">Valor da Venda</Form.Label>
                    <Form.Control type="number" placeholder="150,00" required />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="small fw-bold">Origem</Form.Label>
                    <Form.Select>
                        <option>WhatsApp</option>
                        <option>Instagram DM</option>
                        <option>Indicação</option>
                    </Form.Select>
                </Form.Group>
                <Button type="submit" className="w-100 py-3 rounded-pill fw-bold mt-2" variant="primary" style={{ backgroundColor: '#1F736F', borderColor: '#1F736F' }}>
                    Registrar e Atualizar Dashboard
                </Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showLabelPreview} onHide={() => setShowLabelPreview(false)} size="md" centered>
        <Modal.Body className="p-0">
            <div className="p-5 bg-white">
                <div className="border border-dark p-4 d-flex flex-column gap-2" style={{ minHeight: '400px' }}>
                    <div className="d-flex justify-content-between align-items-start border-bottom border-dark pb-3 mb-3">
                        <div className="fw-black fs-4">CORREIOS</div>
                        <div className="text-end">
                            <div className="fw-bold">SEDEX</div>
                            <small>Contrato: 99123456</small>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fw-bold small mb-1">DESTINATÁRIO:</div>
                        <div className="h5 fw-black mb-0">MARIANA SILVA SANTOS</div>
                        <div>Rua das Flores, 123 - Apto 42</div>
                        <div>Bairro Jardim, São Paulo - SP</div>
                        <div className="fw-bold">CEP: 01234-567</div>
                    </div>
                    <div className="mt-auto border-top border-dark pt-3 d-flex justify-content-between">
                         <div className="small">
                            <div className="fw-bold">REMETENTE:</div>
                            <div>FEITO PARA VOCE / PROJETO EDUCAR</div>
                            <div></div>
                         </div>
                         <div className="bg-dark text-white p-2 d-flex align-items-center">
                            <span className="fw-bold">PLP: 12345678</span>
                         </div>
                    </div>
                </div>
                <Button className="w-100 mt-4 py-3 rounded-pill fw-bold" onClick={() => window.print()}>
                    <Printer size={18} className="me-2"/> Imprimir Agora
                </Button>
            </div>
        </Modal.Body>
      </Modal>

      <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} centered>
        <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-black">Pedido {selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
            <div className="mb-4">
                <p className="text-muted small mb-1">Cliente:</p>
                <p className="fw-bold fs-5">{selectedOrder?.customer}</p>
            </div>
            <div className="p-3 bg-light rounded-4 mb-4">
                <p className="text-muted small mb-2">Itens do Pedido:</p>
                <p className="fw-bold mb-0">{selectedOrder?.items}</p>
            </div>
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <div>
                    <p className="text-muted small mb-0">Total:</p>
                    <p className="fw-black fs-4 mb-0 text-primary" style={{ color: '#1F736F' }}>R$ {selectedOrder?.total.toFixed(2)}</p>
                </div>
                <Button variant="success" className="rounded-pill px-4 fw-bold">Enviar WhatsApp</Button>
            </div>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-end" className="p-4" style={{ zIndex: 1000 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={4000} autohide className="border-0 shadow-lg rounded-4">
          <Toast.Header className="border-0 rounded-top-4 bg-white py-3">
            <CheckCircle className="text-success me-2" size={18} />
            <strong className="me-auto">Ação Concluída</strong>
          </Toast.Header>
          <Toast.Body className="bg-white rounded-bottom-4 py-3 px-4 fw-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AdminDashboard;
