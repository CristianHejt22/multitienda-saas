import { stores as initialStores, categories as initialCategories, products as initialProducts } from './data';
import { sendTelegramNotification } from './telegramService';

// Claves de localStorage
const STORES_KEY = 'multitienda_stores';
const CATS_KEY = 'multitienda_categories';
const PRODS_KEY = 'multitienda_products';
const REQ_KEY = 'multitienda_requests';

// Inicialización de datos
const initializeData = () => {
  if (!localStorage.getItem(STORES_KEY)) {
    localStorage.setItem(STORES_KEY, JSON.stringify(initialStores));
    localStorage.setItem(CATS_KEY, JSON.stringify(initialCategories));
    localStorage.setItem(PRODS_KEY, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(REQ_KEY)) {
    localStorage.setItem(REQ_KEY, JSON.stringify([]));
  }
};

initializeData();

// --- Utilidades CRUD genéricas ---
const getItems = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setItems = (key, items) => localStorage.setItem(key, JSON.stringify(items));
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- API Tiendas ---
export const getStores = () => getItems(STORES_KEY);
export const getStoreBySlug = (slug) => getStores().find(s => s.slug === slug);
export const getStoreById = (id) => getStores().find(s => s.id === id);
export const addStore = (storeData) => {
  const stores = getStores();
  const newStore = { id: generateId(), ...storeData };
  setItems(STORES_KEY, [...stores, newStore]);
  return newStore;
};
export const updateStore = (id, updates) => {
  let stores = getStores();
  stores = stores.map(s => s.id === id ? { ...s, ...updates } : s);
  setItems(STORES_KEY, stores);
};
export const deleteStore = (id) => {
  setItems(STORES_KEY, getStores().filter(s => s.id !== id));
  // También habría que borrar categorías y productos relacionados
};

// --- API Categorías ---
export const getCategories = () => getItems(CATS_KEY);
export const getCategoriesByStore = (storeId) => getCategories().filter(c => c.storeId === storeId);
export const addCategory = (name, storeId) => {
  const cats = getCategories();
  const newCat = { id: generateId(), name, storeId };
  setItems(CATS_KEY, [...cats, newCat]);
  return newCat;
};
export const deleteCategory = (id) => {
  setItems(CATS_KEY, getCategories().filter(c => c.id !== id));
};

// --- API Productos ---
export const getProducts = () => getItems(PRODS_KEY);
export const getProductsByStore = (storeId) => getProducts().filter(p => p.storeId === storeId);
export const addProduct = (productData) => {
  const prods = getProducts();
  const newProd = { id: generateId(), ...productData };
  setItems(PRODS_KEY, [...prods, newProd]);
  return newProd;
};
export const updateProduct = (id, updates) => {
  let prods = getProducts();
  prods = prods.map(p => p.id === id ? { ...p, ...updates } : p);
  setItems(PRODS_KEY, prods);
};
export const deleteProduct = (id) => {
  setItems(PRODS_KEY, getProducts().filter(p => p.id !== id));
};

// --- API Solicitudes (Suscripciones) ---
export const getRequests = () => getItems(REQ_KEY);
export const addRequest = (requestData) => {
  const reqs = getRequests();
  const newReq = { id: generateId(), createdAt: new Date().toISOString(), ...requestData };
  setItems(REQ_KEY, [...reqs, newReq]);
  
  // Enviar notificación a Telegram en segundo plano
  let tgMessage = '';
  if (requestData.type === 'UPGRADE') {
    tgMessage = `🔄 <b>NUEVO UPGRADE SOLICITADO</b>\n\n<b>Tienda:</b> ${requestData.storeName}\n<b>WhatsApp:</b> ${requestData.whatsappNumber}\n<b>Plan Solicitado:</b> ${requestData.requestedPlan}`;
  } else {
    tgMessage = `🎉 <b>NUEVA SUSCRIPCIÓN</b>\n\n<b>Tienda:</b> ${requestData.name}\n<b>WhatsApp:</b> ${requestData.whatsappNumber}\n<b>Plan:</b> ${requestData.plan}\n<b>Referido:</b> ${requestData.referralCode || 'Ninguno'}`;
  }
  
  sendTelegramNotification(tgMessage);
  
  return newReq;
};
export const deleteRequest = (id) => {
  setItems(REQ_KEY, getRequests().filter(r => r.id !== id));
};
