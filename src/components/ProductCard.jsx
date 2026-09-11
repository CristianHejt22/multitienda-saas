import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, storeSlug }) {
  // En subdominios, formamos la ruta relativa
  const detailUrl = storeSlug ? `/${storeSlug}/p/${product.id}` : `/p/${product.id}`;

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link to={detailUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-panel animate-fade-in product-card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', position: 'relative', cursor: 'pointer' }}>
        
        {isSale && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 2 }}>
            OFERTA
          </div>
        )}

        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '240px', objectFit: 'cover' }}
        />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{product.name}</h3>
          
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${product.price.toFixed(2)}
            </span>
            {isSale && (
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
