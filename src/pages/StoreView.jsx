import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreBySlug, getCategoriesByStore, getProductsByStore } from '../dataManager';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { ChevronLeft, ShoppingCart, Search, Clock, Camera, Globe, Gift, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function StoreView({ forceSlug }) {
  const params = useParams();
  const storeSlug = forceSlug || params.storeSlug;
  
  const [store, setStore] = useState(null);
  const [storeCategories, setStoreCategories] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { cartCount, toggleCart } = useCart();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    const s = getStoreBySlug(storeSlug);
    if (s) {
      setStore(s);
      setStoreCategories(getCategoriesByStore(s.id));
      setStoreProducts(getProductsByStore(s.id));
    }
  }, [storeSlug]);

  if (!store) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Tienda no encontrada</h2>
        {!forceSlug && <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Volver al inicio</Link>}
      </div>
    );
  }

  // Filter by category and search query
  const filteredProducts = storeProducts.filter(p => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {store.announcementText && (
        <div style={{ background: store.themeColor, color: 'white', textAlign: 'center', padding: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {store.announcementText}
        </div>
      )}
      
      {/* Install PWA Button (Si está disponible) */}
      {deferredPrompt && (
        <div style={{ background: 'var(--bg-secondary)', padding: '12px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleInstallClick}
            className="btn btn-primary animate-fade-in" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', borderRadius: '30px' }}
          >
            <Download size={18} /> Instalar Tienda en Inicio
          </button>
        </div>
      )}
      <Cart store={store} />
      
      {/* Botón flotante del carrito */}
      <button 
        onClick={toggleCart}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px',
          borderRadius: '50%', backgroundColor: store.themeColor, color: 'white',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 40, cursor: 'pointer', border: 'none'
        }}
      >
        <ShoppingCart size={28} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white',
            borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center',
            alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid var(--bg-primary)'
          }}>
            {cartCount}
          </span>
        )}
      </button>

      {/* Popup Flotante de Referidos (Solo para planes gratuitos) */}
      {store.subscriptionPlan === 'Prueba Gratis (7 Días)' && (
        <a 
          href={`/register?ref=${store.slug}`}
          target="_blank"
          rel="noreferrer"
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-color)',
            padding: '12px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            zIndex: 50,
            maxWidth: '260px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ background: 'var(--accent-color)', borderRadius: '50%', padding: '8px', display: 'flex' }}>
            <Gift size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Powered by MTShopi</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Crea tu tienda gratis ⚡</div>
          </div>
        </a>
      )}

      {/* Banner */}
      <div 
        style={{ 
          height: '350px', 
          backgroundImage: `url(${store.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }}></div>
      </div>

      <div className="container" style={{ position: 'relative', marginTop: '-120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
          <img 
            src={store.logoUrl} 
            alt={store.name} 
            style={{ width: '160px', height: '160px', borderRadius: '50%', border: `6px solid var(--bg-primary)`, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 10, position: 'relative' }}
          />
          <h1 style={{ fontSize: '3rem', margin: '24px 0 12px 0', letterSpacing: '-1px' }}>{store.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>{store.description}</p>
        </div>

        {/* Buscador y Filtros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search size={22} style={{ position: 'absolute', left: '20px', top: '14px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '14px 20px 14px 56px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', width: '100%', justifyContent: 'center' }}>
            <button 
              className="btn"
              onClick={() => setSelectedCategory(null)}
              style={{ 
                whiteSpace: 'nowrap', borderRadius: '40px', padding: '10px 24px', fontSize: '1rem', fontWeight: 'bold',
                backgroundColor: !selectedCategory ? store.themeColor : 'rgba(255,255,255,0.05)',
                border: `1px solid ${!selectedCategory ? store.themeColor : 'rgba(255,255,255,0.1)'}`,
                color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.2s'
              }}
            >
              Todos
            </button>
            {storeCategories.map(cat => (
              <button 
                key={cat.id}
                className="btn"
                onClick={() => setSelectedCategory(cat.id)}
                style={{ 
                  whiteSpace: 'nowrap', borderRadius: '40px', padding: '10px 24px', fontSize: '1rem', fontWeight: 'bold',
                  backgroundColor: selectedCategory === cat.id ? store.themeColor : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedCategory === cat.id ? store.themeColor : 'rgba(255,255,255,0.1)'}`,
                  color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid-responsive" style={{ paddingBottom: '64px' }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} storeSlug={!forceSlug ? store.slug : null} />
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No se encontraron productos.
            </div>
          )}
        </div>

      </div>
      
      {/* Footer Premium de la Tienda */}
      <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '64px 24px', marginTop: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>{store.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {store.businessHours && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Clock size={24} style={{ color: store.themeColor }} />
              <span>{store.businessHours}</span>
            </div>
          )}
          {store.instagramUrl && (
            <a href={store.instagramUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <Camera size={24} style={{ color: store.themeColor }} />
              <span>Instagram</span>
            </a>
          )}
          {store.facebookUrl && (
            <a href={store.facebookUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <Globe size={24} style={{ color: store.themeColor }} />
              <span>Facebook</span>
            </a>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        
        {store.referralActive && (
          <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: `1px solid ${store.themeColor || 'var(--accent-color)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>⚡ Crea tu propia tienda online y empieza a vender hoy</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Hazlo fácil, rápido y con beneficios usando nuestro código.</span>
            <a href={`/register?ref=${store.slug}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: store.themeColor || 'var(--accent-color)', color: 'white', padding: '12px 24px', borderRadius: '30px', marginTop: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              Crear mi Tienda
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
