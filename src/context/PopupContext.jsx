import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

const PopupContext = createContext();

export function usePopup() {
  return useContext(PopupContext);
}

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  // type puede ser: 'success', 'info', 'error'
  const showPopup = (title, message, type = 'info') => {
    setPopup({ title, message, type });
  };

  const closePopup = () => {
    setPopup(null);
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      
      {/* Modal Render */}
      {popup && (
        <div 
          className="animate-fade-in"
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            zIndex: 9999, padding: '20px'
          }}
        >
          <div 
            style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '20px', 
              padding: '32px', 
              maxWidth: '450px', 
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
          >
            <button 
              onClick={closePopup}
              style={{ 
                position: 'absolute', top: '16px', right: '16px', 
                background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' 
              }}
            >
              <X size={24} />
            </button>

            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
              {popup.type === 'success' && <CheckCircle size={64} color="#10b981" />}
              {popup.type === 'info' && <Info size={64} color="var(--accent-color)" />}
              {popup.type === 'error' && <AlertCircle size={64} color="#ef4444" />}
            </div>

            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{popup.title}</h2>
            <p style={{ margin: '0 0 32px 0', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {popup.message}
            </p>

            <button 
              className="btn btn-primary" 
              onClick={closePopup}
              style={{ width: '100%', padding: '14px', fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}
