import React from 'react';

export default function VariantSelector({ variants, selectedVariants, onVariantChange }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
      {variants.map((variant) => (
        <div key={variant.name}>
          <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Selecciona {variant.name}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {variant.options.map((option) => (
              <button
                key={option}
                className={`btn btn-outline ${selectedVariants[variant.name] === option ? 'active' : ''}`}
                onClick={() => onVariantChange(variant.name, option)}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
