import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import StoreView from './pages/StoreView';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import StoreAdmin from './pages/StoreAdmin';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import { PopupProvider, usePopup } from './context/PopupContext';
import { getStores } from './dataManager';
import './index.css';
import { Store } from 'lucide-react';

const GlobalNavbar = () => (
  <nav style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', marginBottom: '32px' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Store size={24} color="var(--accent-color)" /> MultiTienda
      </Link>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/register" className="btn btn-outline" style={{ padding: '8px 16px' }}>Suscribir Tienda</Link>
      </div>
    </div>
  </nav>
);

function AppRouter() {
  const [customStoreSlug, setCustomStoreSlug] = useState(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);
  const { showPopup } = usePopup();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const simulatedDomain = urlParams.get('domain');
    const hostname = simulatedDomain || window.location.hostname;

    // Dominios principales de la plataforma (incluyendo tu dominio de Vercel)
    const baseDomains = ['localhost', '127.0.0.1', 'misuperplataforma.com', 'web-murex.vercel.app'];

    if (baseDomains.includes(hostname)) {
      setIsCheckingDomain(false);
      return;
    }

    let isSubdomain = false;
    let extractedSlug = null;
    
    for (const base of baseDomains) {
      if (hostname.endsWith(`.${base}`)) {
        isSubdomain = true;
        extractedSlug = hostname.replace(`.${base}`, '');
        break;
      }
    }

    if (isSubdomain && extractedSlug) {
      setCustomStoreSlug(extractedSlug);
    } else {
      const stores = getStores();
      const matchedStore = stores.find(s => s.customDomain === hostname);
      if (matchedStore) {
        setCustomStoreSlug(matchedStore.slug);
      } else if (simulatedDomain) {
        showPopup('Dominio no encontrado', `No se encontró ninguna tienda vinculada al dominio: ${simulatedDomain}`, 'error');
      }
    }
    
    setIsCheckingDomain(false);
  }, []);

  if (isCheckingDomain) return <div style={{ color: 'white', padding: '40px' }}>Verificando dominio...</div>;

  if (customStoreSlug) {
    return (
      <Routes>
        <Route path="/" element={<StoreView forceSlug={customStoreSlug} />} />
        <Route path="/p/:productId" element={<ProductDetail forceSlug={customStoreSlug} />} />
        <Route path="/admin" element={<StoreAdmin forceSlug={customStoreSlug} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <GlobalNavbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        
        {/* Rutas normales de plataforma */}
        <Route path="/:storeSlug" element={<StoreView />} />
        <Route path="/:storeSlug/p/:productId" element={<ProductDetail />} />
        <Route path="/:storeSlug/admin" element={<StoreAdmin />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <PopupProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </PopupProvider>
  );
}

export default App;
