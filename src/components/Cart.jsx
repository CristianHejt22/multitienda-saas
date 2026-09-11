import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { usePopup } from '../context/PopupContext';

export default function Cart({ store }) {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { showPopup } = usePopup();

  if (!isCartOpen) return null;

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    let msg = `🛍️ *NUEVO PEDIDO* - ${store.name}\n\n`;
    msg += `Hola! Quiero confirmar mi compra con los siguientes artículos:\n\n`;
    
    cartItems.forEach(item => {
      msg += `▪️ ${item.quantity}x *${item.product.name}*\n`;
      if (Object.keys(item.variants).length > 0) {
        msg += `   Opciones: `;
        for (const [key, value] of Object.entries(item.variants)) {
          msg += `[${key}: ${value}] `;
        }
        msg += `\n`;
      }
      msg += `   Subtotal: $${(item.product.price * item.quantity).toFixed(2)}\n\n`;
    });

    msg += `💳 *TOTAL: $${cartTotal.toFixed(2)}*\n\n`;
    msg += `Por favor, envíame los datos para realizar el pago. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(msg);
    const url = `https://wa.me/${store.whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    
    // Opcional: limpiar carrito después de enviar
    clearCart();
    toggleCart();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out forwards'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Tu Carrito</h2>
          <button onClick={toggleCart} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cartItems.map((item) => (
                <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                  <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{item.product.name}</h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {Object.values(item.variants).join(' • ')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', padding: '2px 4px' }}>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ color: 'white' }}><Minus size={14} /></button>
                        <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ color: 'white' }}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} style={{ color: '#ef4444', padding: '4px', height: 'fit-content' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {store.mercadoPagoToken ? (
                <button 
                  className="btn" 
                  onClick={() => {
                    toggleCart();
                    showPopup(
                      'Conexión Segura',
                      'Redirigiendo a pasarela segura de Mercado Pago...\n\n(Simulación exitosa con Token: ' + store.mercadoPagoToken.substring(0, 10) + '...)',
                      'success'
                    );
                    clearCart();
                  }}
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', backgroundColor: '#009ee3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ShieldCheck size={20} />
                  Pagar con Mercado Pago
                </button>
              ) : null}

              <button 
                className="btn btn-whatsapp" 
                onClick={handleWhatsAppOrder}
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
              >
                <MessageCircle size={20} />
                Acordar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
