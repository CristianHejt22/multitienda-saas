import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoreBySlug, getProductsByStore } from '../dataManager';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import VariantSelector from '../components/VariantSelector';

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
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: store.themeColor }}>
                ${product.price.toFixed(2)}
              </div>
              {isSale && (
                <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  ${product.compareAtPrice.toFixed(2)}
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
                  color: 'white'
                }}
              >
                <ShoppingCart size={24} style={{ marginRight: '8px' }} />
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
