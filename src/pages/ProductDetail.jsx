import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoreBySlug, getProductsByStore } from '../dataManager';
import { ChevronLeft, ShoppingCart, Share2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import VariantSelector from '../components/VariantSelector';
import { usePopup } from '../context/PopupContext';

export default function ProductDetail({ forceSlug }) {
  const params = useParams();
  const storeSlug = forceSlug || params.storeSlug;
  const { productId } = params;
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { addToCart, toggleCart, cartCount } = useCart();
  const { showPopup } = usePopup();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const s = await getStoreBySlug(storeSlug);
      if (s) {
        setStore(s);
        const prods = await getProductsByStore(s.id);
        const found = prods.find(p => p.id === productId);
        if (found) {
          setProduct(found);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [storeSlug, productId]);

  if (loading) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Cargando producto...</div>;
  }

  if (!store || !product) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Producto no encontrado...</div>;
  }

  const handleVariantChange = (variantName, option) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: option
    }));
  };

  const allVariantsSelected = product.variants ? product.variants.every(v => selectedVariants[v.name]) : true;
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = () => {
    if (!allVariantsSelected) return;
    addToCart(product, selectedVariants);
    setSelectedVariants({});
    toggleCart();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira este producto: ${product.name}`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      showPopup('Enlace copiado', 'El enlace del producto ha sido copiado al portapapeles.', 'success');
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
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
          }}>{cartCount}</span>
        )}
      </button>

      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={24} /> Volver al catálogo
        </button>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          
          {/* Imagen grande */}
          <div>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', objectFit: 'cover', aspectRatio: '1/1' }} 
            />
          </div>

          {/* Detalles */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {product.name}
              {isSale && (
                <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '1rem', fontWeight: 'bold' }}>OFERTA</span>
              )}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: store.themeColor }}>
                ${(Number(product.price) || 0).toFixed(2)}
              </div>
              {isSale && (
                <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  ${(Number(product.compareAtPrice) || 0).toFixed(2)}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '40px' }}>
              <VariantSelector 
                variants={product.variants} 
                selectedVariants={selectedVariants} 
                onVariantChange={handleVariantChange} 
              />
            </div>

            <div style={{ marginTop: 'auto' }}>
              {!allVariantsSelected && (
                <p style={{ fontSize: '0.9rem', color: '#ef4444', marginBottom: '12px' }}>
                  Por favor, selecciona todas las opciones para continuar.
                </p>
              )}
              <button 
                className="btn"
                onClick={handleAddToCart}
                disabled={!allVariantsSelected}
                style={{ 
                  width: '100%', 
                  padding: '20px',
                  fontSize: '1.2rem',
                  opacity: !allVariantsSelected ? 0.6 : 1, 
                  cursor: !allVariantsSelected ? 'not-allowed' : 'pointer',
                  backgroundColor: store.themeColor,
                  color: 'white',
                  marginBottom: '24px'
                }}
              >
                <ShoppingCart size={24} style={{ marginRight: '8px' }} />
                Agregar al Carrito
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Compartir este producto:</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Mira este producto: ' + product.name + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: '#25D366', color: '#25D366', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px' }}>
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: '#1877F2', color: '#1877F2', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px' }}>
                    Facebook
                  </a>
                  <button onClick={handleShare} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px' }}>
                    <Share2 size={18} /> Compartir Enlace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Descripción debajo */}
        {product.description && (
          <div style={{ marginTop: '60px', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Descripción del Producto
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
