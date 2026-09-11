import React, { useState, useEffect } from 'react';
import { MessageCircle, Gift, CheckCircle } from 'lucide-react';
import { addRequest } from '../dataManager';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsappNumber: '',
    plan: 'Prueba Gratis (7 Días)',
    referralCode: '',
    customDomain: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Leer el código de referido de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addRequest(formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="container" style={{ paddingTop: '64px', paddingBottom: '64px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 32px' }}>
          <CheckCircle size={64} color="var(--whatsapp-color)" style={{ margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>¡Solicitud Recibida!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px' }}>
            Nuestro equipo está revisando los detalles de tu tienda. Te contactaremos pronto por WhatsApp para coordinar el alta de tu cuenta.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '64px', maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Suscribe tu Tienda</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Completa los datos para iniciar tu suscripción. Te enviaremos a nuestro WhatsApp para coordinar el pago por transferencia y darte tus credenciales.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Nombre de la Tienda</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>¿Qué vendes? (Breve descripción)</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Tu número de WhatsApp (para soporte)</label>
            <input 
              required
              type="text"
              value={formData.whatsappNumber}
              onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>Selecciona tu Plan de Suscripción</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Plan Gratuito */}
              <div 
                onClick={() => setFormData({...formData, plan: 'Prueba Gratis (7 Días)'})}
                style={{ border: formData.plan === 'Prueba Gratis (7 Días)' ? '2px solid var(--accent-color)' : '2px solid var(--border-color)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', background: formData.plan === 'Prueba Gratis (7 Días)' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Prueba Gratis (7 Días)</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Empieza hoy sin tarjeta de crédito</p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>$0</div>
              </div>

              {/* Plan Mensual */}
              <div 
                onClick={() => setFormData({...formData, plan: 'Mensual ($6.000)'})}
                style={{ border: formData.plan === 'Mensual ($6.000)' ? '2px solid var(--accent-color)' : '2px solid var(--border-color)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', background: formData.plan === 'Mensual ($6.000)' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Mensual</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paga mes a mes, sin compromiso</p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>$6.000</div>
              </div>

              {/* Plan Trimestral */}
              <div 
                onClick={() => setFormData({...formData, plan: 'Trimestral ($15.000)'})}
                style={{ border: formData.plan === 'Trimestral ($15.000)' ? '2px solid var(--accent-color)' : '2px solid var(--border-color)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', background: formData.plan === 'Trimestral ($15.000)' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Trimestral</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ahorras $3.000 (Ideal para empezar)</p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>$15.000</div>
              </div>

              {/* Plan Anual */}
              <div 
                onClick={() => setFormData({...formData, plan: 'Anual ($40.000)'})}
                style={{ position: 'relative', border: formData.plan === 'Anual ($40.000)' ? '2px solid var(--accent-color)' : '2px solid var(--border-color)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', background: formData.plan === 'Anual ($40.000)' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)' }}
              >
                <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--accent-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>MEJOR VALOR</div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Anual</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Te ahorras casi 5 meses enteros</p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>$40.000</div>
              </div>

            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '12px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)' }}>
              <input 
                type="checkbox" 
                checked={formData.customDomain} 
                onChange={(e) => setFormData({...formData, customDomain: e.target.checked})} 
                style={{ marginTop: '4px', transform: 'scale(1.2)', accentColor: 'var(--accent-color)' }}
              />
              <div>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Quiero Dominio Propio (+$10.000 / año)</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tendrás tu propio "mitienda.com.ar" exclusivo. El precio puede variar según disponibilidad anual.</span>
              </div>
            </label>
          </div>

          {formData.referralCode && (
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Gift size={20} color="var(--accent-color)" />
              <span>Vienes invitado por: <strong>{formData.referralCode}</strong></span>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '16px', fontSize: '1.1rem' }}>
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
}
