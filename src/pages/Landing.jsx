import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStores } from '../dataManager';
import { Store, Globe, CreditCard, MessageCircle, Zap, CheckCircle } from 'lucide-react';

export default function Landing() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const dbStores = await getStores();
      setStores(dbStores);
    };
    fetchStores();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decoración de fondo */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '400px', height: '400px', background: 'var(--accent-color)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '400px', height: '400px', background: '#009ee3', filter: 'blur(150px)', opacity: 0.1, zIndex: -1 }}></div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: '30px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '32px', fontWeight: 'bold' }}>
            <Zap size={18} style={{ marginRight: '8px' }} /> La plataforma #1 para Emprendedores
          </div>
          
          <h1 style={{ fontSize: '4.5rem', marginBottom: '24px', lineHeight: '1.1', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Vende por WhatsApp en automático.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '48px', lineHeight: '1.6' }}>
            Crea tu propio catálogo virtual en 5 minutos. Gestiona productos, talles y cobra con Mercado Pago desde un diseño profesional adaptado a tu marca.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={20} /> Crear mi Tienda Gratis
            </Link>
            <a href="#features" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '30px' }}>
              Ver Beneficios
            </a>
          </div>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} color="var(--accent-color)" /> Sin comisiones por venta</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} color="var(--accent-color)" /> Soporte técnico local</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container" style={{ padding: '80px 20px' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '64px' }}>Todo lo que tu negocio necesita</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <MessageCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Pedidos a WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Tu cliente arma su carrito y recibes un mensaje ordenado con el total a pagar y las variantes elegidas.</p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(0, 158, 227, 0.1)', color: '#009ee3', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <CreditCard size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Cobra con MercadoPago</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Opcionalmente integra tu cuenta de Mercado Pago para que tus clientes te paguen con tarjeta al instante.</p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <Globe size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Dominio Propio</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Tu tienda puede tener tu propia dirección web (ej: mitienda.com) para una imagen 100% profesional.</p>
          </div>

        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" style={{ padding: '80px 20px' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '16px' }}>Planes Simples y Transparentes</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '1.2rem' }}>Elige el plan que mejor se adapte al crecimiento de tu negocio.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Mensual */}
            <div className="glass-panel" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mensual</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px' }}>$6.000<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mes</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Catálogo ilimitado</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Pedidos por WhatsApp</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Soporte técnico</li>
              </ul>
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>Elegir Plan</Link>
            </div>

            {/* Trimestral */}
            <div className="glass-panel" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-color)', transform: 'scale(1.05)', zIndex: 10 }}>
              <div style={{ background: 'var(--accent-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>MÁS POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--accent-color)' }}>Trimestral</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px' }}>$15.000<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/3m</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Todo lo del plan Mensual</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Ahorras $3.000</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Sistema de Referidos Premium</li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>Elegir Plan</Link>
            </div>

            {/* Anual */}
            <div className="glass-panel" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Anual</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px' }}>$40.000<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/año</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Todo lo del plan Trimestral</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Ahorras $32.000</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} color="var(--accent-color)" /> Acceso anticipado a funciones</li>
              </ul>
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>Elegir Plan</Link>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '48px', padding: '24px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', maxWidth: '800px', margin: '48px auto 0 auto' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}><Globe size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Adicional: Dominio Propio</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Vincula tu propio dominio (ej: mitienda.com.ar) por solo <strong>$10.000 / año</strong>. <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(*Sujeto a modificaciones)</span></p>
          </div>
        </div>
      </div>

      {/* Showcase Section */}

      <div style={{ background: 'var(--bg-secondary)', padding: '80px 20px', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '16px' }}>Marcas que confían en nosotros</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px' }}>Explora el catálogo de algunos de nuestros clientes más exitosos.</p>
          
          <div className="grid-responsive">
            {stores.map(store => (
              <Link key={store.id} to={`/${store.slug}`} className="glass-panel animate-fade-in product-card-hover" style={{ display: 'block', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: '160px', backgroundImage: `url(${store.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={store.logoUrl} alt={store.name} style={{ width: '64px', height: '64px', borderRadius: '50%', border: `2px solid ${store.themeColor}`, marginTop: '-50px', background: 'var(--bg-primary)', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{store.name}</h3>
                    <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>Visitar Tienda &rarr;</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '80px 20px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>¿Listo para aumentar tus ventas?</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>Únete hoy y transforma la manera en que recibes pedidos.</p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: '30px' }}>
          Empezar Ahora
        </Link>
      </div>

    </div>
  );
}
