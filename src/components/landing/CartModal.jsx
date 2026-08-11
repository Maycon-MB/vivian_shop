import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ShoppingCart, X, Plus, Minus, Package, Download } from 'lucide-react';
import {
  isDigital,
  quantidadeMinima,
  permiteVariasUnidades,
  subtotalItem,
  PRAZO_PRODUCAO,
} from '../../catalogo';

const moeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

/**
 * Carrinho.
 *
 * Uma linha por produto, com quantidade. O mínimo de cada produto fica
 * visível e o botão de diminuir para nele — quem quiser tirar o produto
 * usa o X, que é explícito, em vez de descobrir que o item sumiu ao
 * clicar em "menos" uma vez a mais.
 */
const CartModal = ({ show, onHide, cart, removeFromCart, onChangeQuantity, cartTotal, cartCount, onCheckout }) => {
  const temPersonalizado = cart.some((item) => !isDigital(item.category));

  return (
    <Modal show={show} onHide={onHide} className="p-0">
      <Modal.Header closeButton className="border-0 p-4">
        <Modal.Title className="fw-black fs-4">
          Seu carrinho
          {cartCount > 0 && (
            <span className="fw-normal fs-6 text-muted ms-2">
              {cartCount} {cartCount === 1 ? 'item' : 'itens'}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <ShoppingCart size={64} className="mb-3" style={{ color: '#A8C6E8' }} />
            <p className="text-muted mb-0">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {cart.map((item) => {
              const minimo = quantidadeMinima(item.category);
              const digital = isDigital(item.category);
              const noMinimo = item.quantidade <= minimo;

              return (
                <div key={item.id} className="p-3 rounded-4 border" style={{ borderColor: '#A8C6E8', backgroundColor: '#FBFAF7' }}>
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                    <div>
                      <p className="fw-bold mb-1 small">{item.name}</p>
                      <p className="small mb-0 text-muted d-flex align-items-center gap-1">
                        {digital ? <Download size={13} /> : <Package size={13} />}
                        {moeda(item.price)} cada
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-sm btn-link p-0"
                      style={{ color: '#C4436B' }}
                      aria-label={`Tirar ${item.name} do carrinho`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3">
                    {permiteVariasUnidades(item.category) ? (
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-circle d-flex align-items-center justify-content-center p-0"
                          style={{ width: 30, height: 30 }}
                          disabled={noMinimo}
                          onClick={() => onChangeQuantity(item.id, item.quantidade - 1)}
                          aria-label={`Diminuir ${item.name}`}
                        >
                          <Minus size={14} />
                        </Button>

                        <span className="fw-bold" style={{ minWidth: 28, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                          {item.quantidade}
                        </span>

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-circle d-flex align-items-center justify-content-center p-0"
                          style={{ width: 30, height: 30 }}
                          onClick={() => onChangeQuantity(item.id, item.quantidade + 1)}
                          aria-label={`Aumentar ${item.name}`}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    ) : (
                      <span className="small text-muted">Arquivo digital</span>
                    )}

                    <span className="fw-black" style={{ color: '#12305B', fontVariantNumeric: 'tabular-nums' }}>
                      {moeda(subtotalItem(item))}
                    </span>
                  </div>

                  {noMinimo && !digital && (
                    <p className="small text-muted mb-0 mt-2">
                      Mínimo de {minimo} unidades deste produto.
                    </p>
                  )}
                </div>
              );
            })}

            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-muted">Subtotal</span>
                <span className="fw-black fs-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {moeda(cartTotal)}
                </span>
              </div>

              <p className="small text-muted">
                {temPersonalizado
                  ? `O frete é calculado na próxima etapa, pelo seu CEP. Produção em ${PRAZO_PRODUCAO} dias úteis após o pagamento.`
                  : 'Material digital não tem frete. Chega no seu e-mail e WhatsApp assim que o pagamento for aprovado.'}
              </p>

              <Button
                onClick={onCheckout}
                className="w-100 py-3 rounded-pill fw-bold border-0"
                style={{ backgroundColor: '#12305B' }}
              >
                Finalizar compra
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CartModal;
