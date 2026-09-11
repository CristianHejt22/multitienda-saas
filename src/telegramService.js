// Servicio para enviar notificaciones a Telegram
// IMPORTANTE: Para producción, este código debería ejecutarse en un backend.
// Aquí está simulado en el frontend para propósitos del prototipo SaaS.

const TELEGRAM_BOT_TOKEN = '8745926849:AAHuy2cRyaWvHR0r5evp6G1pXmEcnbNlpIE';
const TELEGRAM_CHAT_ID = '5666110035';

export const sendTelegramNotification = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram Bot Token o Chat ID no configurados. No se envió la notificación.');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Error enviando notificación a Telegram:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error de red al contactar con Telegram:', error);
    return false;
  }
};
