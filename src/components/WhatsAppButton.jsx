import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ phoneNumber, message, disabled }) {
  const handleClick = () => {
    if (disabled) return;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <button 
      className="btn btn-whatsapp" 
      onClick={handleClick}
      disabled={disabled}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%' }}
    >
      <MessageCircle size={20} />
      Pedir por WhatsApp
    </button>
  );
}
