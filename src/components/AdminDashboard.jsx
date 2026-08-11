import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
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

  /**
   * Pedidos de exemplo, para mostrar como a tela se comporta. Os status
   * são os reais das duas linhas: a personalizada passa por produção, a
   * pedagógica é entregue na hora do pagamento.
   */
  const [orders, setOrders] = useState([
    { id: '#0003', customer: 'Exemplo — pedido digital', items: 'Apostila de alfabetização adaptada', total: 47.00, status: 'Entregue por e-mail', date: 'Hoje, 14:20', niche: 'Papelaria pedagógica' },
    { id: '#0002', customer: 'Exemplo — pedido personalizado', items: '10x Caderno personalizado', total: 320.00, status: 'Em produção', date: 'Hoje, 11:05', niche: 'Papelaria personalizada' },
    { id: '#0001', customer: 'Exemplo — pronto para envio', items: '10x Cartela de adesivos', total: 180.00, status: 'Pronto para envio', date: 'Ontem, 19:30', niche: 'Papelaria personalizada' },
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
        color: '#2E9B96',
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
   * Zerado de propósito. Loja nova começa em zero, e número inventado no
   * painel da própria dona não ajuda ninguém a decidir nada — só cria
   * expectativa que a primeira semana real desmente.
   */
  const stats = [
    { label: 'Vendas do mês', value: 'R$ 0,00', grow: 'primeiro mês', icon: <ShoppingBag color="#2E9B96"/> },
    { label: 'Clientes', value: '0', grow: 'começa agora', icon: <Users color="#FFD400"/> },
    { label: 'Pedidos a enviar', value: '0', grow: 'nada na fila', icon: <Package color="#C4436B"/> },
    { label: 'Economia em taxas', value: 'R$ 0,00', grow: 'contra o Elo7', icon: <TrendingUp color="#2E9B96"/> },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F0F2F5', color: '#12305B' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-grow-1 p-3 p-md-5 overflow-auto w-100">
        {activeTab === 'dashboard' && (
          <>
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5">
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="link" 
                  className="p-0 text-dark mobile-only" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </Button>
                <div>
                  <h1 className="fw-black fs-2 mb-1" style={{ fontFamily: 'Fraunces' }}>Bem-vinda, Vivian</h1>
                  <p className="text-muted mb-0 small">Papelaria personalizada e material pedagógico, no mesmo lugar.</p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button onClick={() => setShowNewProduct(true)} variant="outline-dark" className="px-3 px-md-4 rounded-pill fw-bold d-flex align-items-center gap-2 small">
                    <Plus size={18}/> <span className="d-none d-sm-inline">Novo Produto</span>
                </Button>
                <Button onClick={() => setShowManualSale(true)} variant="outline-primary" className="px-3 px-md-4 rounded-pill fw-bold d-flex align-items-center gap-2 small" style={{ color: '#2E9B96', borderColor: '#2E9B96' }}>
                    <CheckCircle size={18}/> <span className="d-none d-sm-inline">Lançar Venda</span>
                </Button>
                {/* BASE_URL, não '/': em produção o site vive em
                    /vivian_shop/ e a barra sozinha cai fora do projeto. */}
                <Button onClick={() => window.open(import.meta.env.BASE_URL, '_blank', 'noopener')} variant="primary" className="px-3 px-md-4 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 small" style={{ backgroundColor: '#2E9B96', borderColor: '#2E9B96' }}>
                    <Eye size={18}/> <span className="d-none d-sm-inline">Ver Lojas</span>
                </Button>
              </div>
            </header>

            <Row className="g-3 g-md-4 mb-5">
              {stats.map((stat, i) => (
                <Col xl={3} md={6} key={i}>
                  <StatsCard {...stat} />
                </Col>
              ))}
            </Row>

            <Row className="g-4">
              <Col lg={8}>
                <Card className="border-0 rounded-5 shadow-sm p-4 p-md-5 bg-white mb-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-5">
                    <h3 className="fw-black fs-4 mb-0">Receita por linha</h3>
                    <div className="d-flex gap-2 text-muted small fw-bold">
                        <span className="d-flex align-items-center gap-1"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2E9B96' }}></div> Personalizada</span>
                        <span className="d-flex align-items-center gap-1 ms-3"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFD400' }}></div> Pedagógica</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <ReactECharts option={salesChartOption} style={{ height: '380px', minWidth: '500px' }} />
                  </div>
                </Card>

                <Card className="border-0 rounded-5 shadow-sm p-4 p-md-5 bg-white mb-4 mb-lg-0 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-black fs-4 mb-0">Pedidos Recentes</h3>
                        <Button variant="link" className="text-primary fw-bold text-decoration-none p-0">Ver todos</Button>
                    </div>
                    <div className="table-responsive">
                      <OrderTable orders={orders} onSelectOrder={setSelectedOrder} />
                    </div>
                </Card>
              </Col>
              <Col lg={4}>
                <div className="d-flex flex-column gap-4 h-100">
                  <MarketingIA approving={approving} onApprove={handleApprovePost} />
                  <LogisticsCard onShowLabel={() => setShowLabelPreview(true)} />
                </div>
              </Col>
            </Row>
          </>
        )}

        {activeTab === 'pedidos' && (
           <Card className="border-0 rounded-5 shadow-sm p-5 bg-white">
                <h3 className="fw-black fs-4 mb-4">Gerenciamento de Pedidos</h3>
                <OrderTable orders={orders} onSelectOrder={setSelectedOrder} />
           </Card>
        )}

        {activeTab === 'mensagens' && (
           <Row className="g-4">
             <Col lg={4}>
               <Card className="border-0 p-4 bg-white h-100" style={{ borderRadius: '32px', border: '1px solid #2E9B9666', boxShadow: '0 15px 35px rgba(46,155,150,0.12)' }}>
                 <h4 className="fw-black mb-4">Conversas</h4>
                 <div className="d-flex flex-column gap-2">
                    {[
                      { name: 'Ana Silva', msg: 'Qual o prazo do planner?', time: '2m', active: true },
                      { name: 'Carlos Lima', msg: 'Gostei do kit de atividades', time: '1h' },
                      { name: 'Mariana P.', msg: 'Faz personalizado?', time: '3h' }
                    ].map((chat, i) => (
                      <div key={i} className={`p-3 rounded-4 cursor-pointer transition-all ${chat.active ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20' : 'bg-light hover-bg-light-80'}`} style={{ cursor: 'pointer' }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold small">{chat.name}</span>
                          <span className="text-muted" style={{ fontSize: '10px' }}>{chat.time}</span>
                        </div>
                        <p className="text-muted small mb-0 text-truncate">{chat.msg}</p>
                      </div>
                    ))}
                 </div>
               </Card>
             </Col>
             <Col lg={8}>
               <Card className="border-0 p-4 bg-white h-100 d-flex flex-column" style={{ borderRadius: '32px', border: '1px solid #2E9B9666', boxShadow: '0 15px 35px rgba(46,155,150,0.12)', minHeight: '500px' }}>
                  <div className="border-bottom pb-3 mb-3 d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', color: '#2E9B96' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Ana Silva</h5>
                      <span className="text-success small">● Online</span>
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-auto mb-3 p-3 bg-light rounded-4 d-flex flex-column gap-3">
                    <div className="bg-white p-3 rounded-4 shadow-sm align-self-start" style={{ maxWidth: '80%' }}>
                      <p className="small mb-0">Olá Vivian! Vi o seu Kit de Rotina Visual. Qual o prazo de entrega para o CEP 04571-010?</p>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-4 shadow-sm align-self-end" style={{ maxWidth: '80%', backgroundColor: '#2E9B96' }}>
                      <p className="small mb-0">Olá Ana! Para esse CEP o prazo é de 5 dias úteis após a produção.</p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Form.Control placeholder="Escreva sua resposta..." className="rounded-pill py-2" />
                    <Button variant="dark" className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                      <Send size={18} />
                    </Button>
                  </div>
               </Card>
             </Col>
           </Row>
        )}

        {activeTab === 'marketing' && (
           <Row className="g-4">
               <Col lg={6}><MarketingIA approving={approving} onApprove={handleApprovePost} /></Col>
               <Col lg={6}>
                  <Card className="border-0 rounded-5 shadow-sm p-5 bg-white h-100">
                     <h4 className="fw-black mb-4">Calendário Editorial</h4>
                     <p className="text-muted">A IA agendou 4 posts para esta semana nos seus dois nichos.</p>
                  </Card>
               </Col>
           </Row>
        )}

        {activeTab === 'catalogo' && (
            <CatalogSection onNewProduct={() => setShowNewProduct(true)} />
        )}

        {activeTab === 'config' && (
           <Card className="border-0 rounded-5 shadow-sm p-5 bg-white">
                <h3 className="fw-black fs-4 mb-4" style={{ fontFamily: 'Fraunces' }}>Configurações da Loja</h3>
                <Form className="d-flex flex-column gap-4" style={{ maxWidth: '600px' }}>
                    <div className="p-4 rounded-4 bg-light bg-opacity-50">
                        <h5 className="fw-bold fs-6 mb-3">Perfil das Lojas</h5>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Label className="small fw-bold">Nome de Exibição Principal</Form.Label>
                                <Form.Control defaultValue="Feito para Você e Projeto Educar" className="py-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-bold">E-mail de Contato</Form.Label>
                                <Form.Control defaultValue="contato@feitoparavoce.com.br" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-bold">WhatsApp Comercial</Form.Label>
                                <Form.Control defaultValue="(11) 98765-4321" />
                            </Col>
                        </Row>
                    </div>
                    
                    <div className="p-4 rounded-4 bg-light bg-opacity-50">
                        <h5 className="fw-bold fs-6 mb-3">Notificações Inteligentes</h5>
                        <Form.Check type="switch" id="notif-1" label="Avisar no WhatsApp sobre novos pedidos" defaultChecked className="mb-2" />
                        <Form.Check type="switch" id="notif-2" label="Relatório semanal de desempenho por nicho" defaultChecked className="mb-2" />
                        <Form.Check type="switch" id="notif-3" label="Sugerir posts no Instagram quando o estoque baixar" defaultChecked />
                    </div>

                    <Button variant="dark" className="rounded-pill py-3 fw-bold" onClick={() => triggerToast('Configurações salvas com sucesso!')}>
                        Salvar Alterações
                    </Button>
                </Form>
           </Card>
        )}

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
                <Button type="submit" className="w-100 py-3 rounded-pill fw-bold mt-2" variant="primary" style={{ backgroundColor: '#2E9B96', borderColor: '#2E9B96' }}>
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
                    <p className="fw-black fs-4 mb-0 text-primary" style={{ color: '#2E9B96' }}>R$ {selectedOrder?.total.toFixed(2)}</p>
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
