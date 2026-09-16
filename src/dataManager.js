import { supabase } from './supabase';
import { sendTelegramNotification } from './telegramService';

// --- API Tiendas ---
export const getStores = async () => {
  const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  return data || [];
};

export const getStoreBySlug = async (slug) => {
  const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single();
  if (error) console.error(error);
  return data || null;
};

export const getStoreById = async (id) => {
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
  if (error) console.error(error);
  return data || null;
};

export const addStore = async (storeData) => {
  // Convert camelCase to snake_case for Supabase
  const { themeColor, bannerUrl, logoUrl, subscriptionPlan, customDomainRequested, customDomain, mercadoPagoToken, announcementText, businessHours, instagramUrl, facebookUrl, referralActive, affiliateCount, whatsappNumber, ...rest } = storeData;
  const dbData = {
    ...rest,
    whatsapp_number: whatsappNumber,
    theme_color: themeColor,
    banner_url: bannerUrl,
    logo_url: logoUrl,
    subscription_plan: subscriptionPlan,
    custom_domain_requested: customDomainRequested,
    custom_domain: customDomain,
    mercado_pago_token: mercadoPagoToken,
    announcement_text: announcementText,
    business_hours: businessHours,
    instagram_url: instagramUrl,
    facebook_url: facebookUrl,
    referral_active: referralActive,
    affiliate_count: affiliateCount,
  };

  const { data, error } = await supabase.from('stores').insert([dbData]).select().single();
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
};

export const updateStore = async (id, updates) => {
  // Convert camelCase to snake_case
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.whatsappNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsappNumber;
  if (updates.themeColor !== undefined) dbUpdates.theme_color = updates.themeColor;
  if (updates.announcementText !== undefined) dbUpdates.announcement_text = updates.announcementText;
  if (updates.businessHours !== undefined) dbUpdates.business_hours = updates.businessHours;
  if (updates.instagramUrl !== undefined) dbUpdates.instagram_url = updates.instagramUrl;
  if (updates.facebookUrl !== undefined) dbUpdates.facebook_url = updates.facebookUrl;
  if (updates.customDomain !== undefined) dbUpdates.custom_domain = updates.customDomain;
  if (updates.mercadoPagoToken !== undefined) dbUpdates.mercado_pago_token = updates.mercadoPagoToken;
  if (updates.subscriptionPlan !== undefined) dbUpdates.subscription_plan = updates.subscriptionPlan;
  if (updates.referralActive !== undefined) dbUpdates.referral_active = updates.referralActive;
  if (updates.affiliateCount !== undefined) dbUpdates.affiliate_count = updates.affiliateCount;

  const { error } = await supabase.from('stores').update(dbUpdates).eq('id', id);
  if (error) console.error(error);
};

export const deleteStore = async (id) => {
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) console.error(error);
};

// --- API Categorías ---
export const getCategoriesByStore = async (storeId) => {
  const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('created_at', { ascending: true });
  if (error) console.error(error);
  return data || [];
};

export const addCategory = async (name, storeId) => {
  const { data, error } = await supabase.from('categories').insert([{ name, store_id: storeId }]).select().single();
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) console.error(error);
};

export const updateCategory = async (id, name) => {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) console.error(error);
};

// --- API Productos ---
export const getProductsByStore = async (storeId) => {
  const { data, error } = await supabase.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
  if (error) console.error(error);
  
  return data ? data.map(p => {
    let description = p.description || '';
    let variants = [];
    if (description.includes('===VARIANTS===')) {
      const parts = description.split('===VARIANTS===');
      description = parts[0].trim();
      try {
        variants = JSON.parse(parts[1].trim());
      } catch (e) { console.error('Error parsing variants'); }
    }
    
    return {
      ...p, 
      categoryId: p.category_id, 
      compareAtPrice: p.compare_at_price, 
      imageUrl: p.image_url, 
      storeId: p.store_id,
      description,
      variants
    };
  }) : [];
};

export const addProduct = async (productData) => {
  let desc = productData.description || '';
  if (productData.variants && productData.variants.length > 0) {
    desc += `\n\n===VARIANTS===\n${JSON.stringify(productData.variants)}`;
  }

  const dbData = {
    store_id: productData.storeId,
    category_id: productData.categoryId,
    name: productData.name,
    price: productData.price,
    compare_at_price: productData.compareAtPrice,
    description: desc,
    image_url: productData.imageUrl,
  };
  const { data, error } = await supabase.from('products').insert([dbData]).select().single();
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
};

export const updateProduct = async (id, updates) => {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.compareAtPrice !== undefined) dbUpdates.compare_at_price = updates.compareAtPrice;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;

  // Handle variants and description together
  let finalDesc = updates.description !== undefined ? updates.description : undefined;
  if (updates.variants !== undefined) {
    finalDesc = (finalDesc || '') + (updates.variants.length > 0 ? `\n\n===VARIANTS===\n${JSON.stringify(updates.variants)}` : '');
  }
  if (finalDesc !== undefined) {
    dbUpdates.description = finalDesc;
  }

  const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
  if (error) console.error(error);
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error(error);
};

// --- API Solicitudes (Suscripciones) ---
export const getRequests = async () => {
  const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  return data ? data.map(r => ({...r, whatsappNumber: r.whatsapp_number, requestedPlan: r.requested_plan, customDomain: r.custom_domain, referralCode: r.referral_code, storeName: r.store_name, storeId: r.store_id})) : [];
};

export const addRequest = async (requestData) => {
  const dbData = {
    type: requestData.type,
    store_id: requestData.storeId,
    name: requestData.name,
    whatsapp_number: requestData.whatsappNumber,
    description: requestData.description,
    plan: requestData.plan,
    requested_plan: requestData.requestedPlan,
    custom_domain: requestData.customDomain,
    referral_code: requestData.referralCode,
    store_name: requestData.storeName,
  };
  
  const { data, error } = await supabase.from('requests').insert([dbData]).select().single();
  if (error) {
    console.error(error);
    throw error;
  }
  
  // Enviar notificación a Telegram en segundo plano
  let tgMessage = '';
  if (requestData.type === 'UPGRADE') {
    tgMessage = `🔄 <b>NUEVO UPGRADE SOLICITADO</b>\n\n<b>Tienda:</b> ${requestData.storeName}\n<b>WhatsApp:</b> ${requestData.whatsappNumber}\n<b>Plan Solicitado:</b> ${requestData.requestedPlan}`;
  } else {
    tgMessage = `🎉 <b>NUEVA SUSCRIPCIÓN</b>\n\n<b>Tienda:</b> ${requestData.name}\n<b>WhatsApp:</b> ${requestData.whatsappNumber}\n<b>Plan:</b> ${requestData.plan}\n<b>Referido:</b> ${requestData.referralCode || 'Ninguno'}`;
  }
  
  sendTelegramNotification(tgMessage);
  
  return data;
};

export const deleteRequest = async (id) => {
  const { error } = await supabase.from('requests').delete().eq('id', id);
  if (error) console.error(error);
};

// --- API Pedidos (Orders) ---
export const getOrdersByStore = async (storeId) => {
  const { data, error } = await supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
  if (error) console.error(error);
  return data ? data.map(o => ({...o, storeId: o.store_id, customerName: o.customer_name, customerPhone: o.customer_phone})) : [];
};

export const getAllOrdersCount = async () => {
  const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  if (error) console.error(error);
  return count || 0;
};

export const addOrder = async (orderData) => {
  const dbData = {
    store_id: orderData.storeId,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    items: orderData.items,
    total: orderData.total,
    status: orderData.status || 'PENDIENTE'
  };
  const { data, error } = await supabase.from('orders').insert([dbData]).select().single();
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) console.error(error);
};

// --- Storage API ---
export const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

  if (uploadError) {
    console.error('Error al subir imagen:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
};
