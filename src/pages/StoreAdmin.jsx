import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreBySlug, updateStore, getProductsByStore, getCategoriesByStore, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, updateCategory, addRequest, getOrdersByStore, updateOrderStatus, uploadImage } from '../dataManager';
import { ArrowLeft, Plus, Trash2, Link as LinkIcon, Gift, Pencil, X, Image, Users, ListFilter, ShoppingBag, CheckCircle, Clock, Check, Upload, Megaphone, Share2, Download, Copy } from 'lucide-react';
import { usePopup } from '../context/PopupContext';
import { compressImage } from '../utils/imageCompressor';

export default function StoreAdmin({ forceSlug }) {
  const params = useParams();
  const storeSlug = forceSlug || params.storeSlug;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();

  // Autenticación
  const authKey = `auth_${storeSlug}`;
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(authKey) === 'true');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // States for UI tabs
  const [activeTab, setActiveTab] = useState('orders');
  
  // States for Product CRUD
  const [editingProduct, setEditingProduct] = useState(null);
  
  // States for Category CRUD
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
  // States for Change Password
  const [newPassword, setNewPassword] = useState('');

  // Upgrade state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlanSelected, setUpgradePlanSelected] = useState('Anual ($40.000)');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Marketing state
  const [marketingSelectedProduct, setMarketingSelectedProduct] = useState('');
  const canvasRef = useRef(null);

  // Link de referido
  const referralLink = `${window.location.protocol}//${window.location.host}/register?ref=${storeSlug}`;

  const loadData = async () => {
    setLoading(true);
    const s = await getStoreBySlug(storeSlug);
    if (s) {
      setStore(s);
      if (isAuthenticated) {
        const [prods, cats, ords] = await Promise.all([
          getProductsByStore(s.id),
          getCategoriesByStore(s.id),
          getOrdersByStore(s.id)
        ]);
        setProducts(prods);
        setCategories(cats);
        setOrders(ords);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [storeSlug, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'marketing' && marketingSelectedProduct) {
      drawPost();
    }
  }, [activeTab, marketingSelectedProduct, products]);

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '100px', color: 'white' }}>Cargando panel...</div>;

  if (!store) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>Tienda no encontrada</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Verifica que la URL sea correcta o que la tienda exista.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Volver al inicio</Link>
    </div>
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username !== store.slug) {
      setLoginError('El usuario no corresponde a esta tienda.');
      return;
    }
    if (loginForm.password !== store.password) {
      setLoginError('Contraseña incorrecta.');
      return;
    }
    setLoginError('');
    sessionStorage.setItem(authKey, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(authKey);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Acceso al Panel</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{store.name}</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Usuario</label>
              <input 
                required 
                type="text" 
                placeholder="Nombre corto de tu tienda" 
                value={loginForm.username} 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Contraseña</label>
              <input 
                required 
                type="password" 
                placeholder="********" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} 
              />
            </div>
            {loginError && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{loginError}</div>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '14px', fontSize: '1.1rem' }}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    await updateStore(store.id, store);
    showPopup('Éxito', 'Configuración guardada correctamente', 'success');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    await updateStore(store.id, { password: newPassword });
    setNewPassword('');
    showPopup('Éxito', 'La contraseña de tu tienda ha sido cambiada.', 'success');
    await loadData();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    showPopup('Estado Actualizado', `El pedido ahora está marcado como ${newStatus}.`, 'success');
    await loadData();
  };

  const handleImageUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedFile = await compressImage(file);
      const publicUrl = await uploadImage(compressedFile);
      setter(publicUrl);
    } catch (err) {
      showPopup('Error', 'No se pudo subir la imagen.', 'error');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct({
      name: '',
      price: '',
      compareAtPrice: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const prodToSave = {
      ...editingProduct,
      price: parseFloat(editingProduct.price) || 0,
      compareAtPrice: editingProduct.compareAtPrice ? parseFloat(editingProduct.compareAtPrice) : null
    };

    if (prodToSave.id) {
      await updateProduct(prodToSave.id, prodToSave);
    } else {
      await addProduct({
        ...prodToSave,
        storeId: store.id,
        categoryId: prodToSave.categoryId || (categories[0]?.id || null)
      });
    }
    setEditingProduct(null);
    await loadData();
  };

  const handleDeleteProduct = async (id) => {
    if(window.confirm('¿Borrar producto? Esta acción no se puede deshacer.')) {
      await deleteProduct(id);
      await loadData();
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName, store.id);
    setNewCategoryName('');
    await loadData();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      await deleteCategory(id);
      showPopup('Categoría eliminada', 'La categoría ha sido eliminada correctamente.', 'success');
      await loadData();
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategoryName.trim()) return;
    await updateCategory(id, editingCategoryName);
    setEditingCategoryId(null);
    setEditingCategoryName('');
    showPopup('Éxito', 'La categoría ha sido actualizada.', 'success');
    await loadData();
  };

  const handleRequestUpgrade = async () => {
    await addRequest({
      type: 'UPGRADE',
      storeId: store.id,
      storeName: store.name,
      whatsappNumber: store.whatsappNumber,
      requestedPlan: upgradePlanSelected
    });
    setShowUpgradeModal(false);
    showPopup('Solicitud Enviada', 'Tu solicitud de mejora ha sido enviada con éxito. Te contactaremos pronto.', 'success');
  };

  // --- Marketing Logic ---
  const drawPost = async () => {
    if (!canvasRef.current || !marketingSelectedProduct) return;
    const product = products.find(p => p.id === marketingSelectedProduct);
    if (!product) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const drawRoundedRect = (c, x, y, width, height, radius) => {
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + width - radius, y);
      c.quadraticCurveTo(x + width, y, x + width, y + radius);
      c.lineTo(x + width, y + height - radius);
      c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      c.lineTo(x + radius, y + height);
      c.quadraticCurveTo(x, y + height, x, y + height - radius);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
    };

    const loadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    const primaryColor = store.themeColor || '#6366f1';
    
    // 1. Fondo Premium con Gradiente
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, '#0f172a'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.beginPath();
    ctx.arc(1080, 0, 700, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();

    // 2. Tarjeta principal (Borde fino: 1000x1000, margen 40px)
    const cardX = 40, cardY = 40, cardW = 1000, cardH = 1000;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 48);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Cargar Imágenes
    const [logoImg, productImg] = await Promise.all([
      loadImage(store.logoUrl),
      loadImage(product.imageUrl || 'https://via.placeholder.com/800')
    ]);

    // 3. Dibujar Imagen del Producto (cubriendo casi toda la tarjeta, conteniendo)
    if (productImg) {
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 48);
      ctx.clip();
      
      const scale = Math.min(cardW / productImg.width, cardH / productImg.height);
      const scaledW = productImg.width * scale;
      const scaledH = productImg.height * scale;
      const x = cardX + (cardW / 2) - (scaledW / 2);
      const y = cardY + (cardH / 2) - (scaledH / 2);
      
      ctx.drawImage(productImg, x, y, scaledW, scaledH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#f1f5f9';
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 48);
      ctx.fill();
    }

    // 4. Logo de la Tienda (Esquina superior izquierda)
    if (logoImg) {
      ctx.save();
      const logoSize = 120;
      const logoX = cardX + 40;
      const logoY = cardY + 40;
      
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.clip();
      
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // Función para textos atractivos superpuestos
    const drawTextAttractive = (text, x, y, font, fillColor, strokeColor, lineWidth = 12) => {
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeColor;
      
      // Sombra para darle profundidad extra al borde
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 8;
      
      ctx.strokeText(text, x, y);
      
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    // 5. Nombre del Producto (Superpuesto en la parte inferior)
    let text = product.name;
    if (text.length > 30) text = text.substring(0, 27) + '...';
    // Nombre con borde del color principal y relleno blanco
    drawTextAttractive(text, 540, 840, '900 68px "Inter", sans-serif', '#ffffff', primaryColor, 14);

    // 6. Precios con fuente distinta (Arial Black / Impact style)
    const hasOffer = product.compareAtPrice && product.compareAtPrice > product.price;
    const priceY = 960;
    const priceFont = '900 90px "Arial Black", "Impact", sans-serif'; // FUENTE DISTINTA PARA EL PRECIO

    if (hasOffer) {
      // Precio original tachado (Más chico y con borde rojo)
      const oldPrice = `$${(Number(product.compareAtPrice)||0).toFixed(2)}`;
      const oldPriceFont = '900 54px "Arial Black", "Impact", sans-serif';
      drawTextAttractive(oldPrice, 340, priceY - 10, oldPriceFont, '#f8fafc', '#ef4444', 10);
      
      // Línea de tachado gruesa
      const oldPriceW = ctx.measureText(oldPrice).width;
      ctx.beginPath();
      ctx.moveTo(340 - oldPriceW/2 - 15, priceY - 28);
      ctx.lineTo(340 + oldPriceW/2 + 15, priceY - 28);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Precio oferta normal (Grande y con borde oscuro)
      drawTextAttractive(`$${(Number(product.price)||0).toFixed(2)}`, 700, priceY, priceFont, '#ffffff', '#0f172a', 16);
      
      // Etiqueta ¡OFERTA! (Arriba a la derecha)
      drawTextAttractive('¡OFERTA!', cardX + cardW - 200, cardY + 120, '900 76px "Arial Black", "Impact", sans-serif', '#ef4444', '#ffffff', 16);
    } else {
      // Precio normal centrado
      drawTextAttractive(`$${(Number(product.price)||0).toFixed(2)}`, 540, priceY, priceFont, '#ffffff', '#0f172a', 16);
    }
  };



  const handleDownloadPost = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `post_${store.slug}_${marketingSelectedProduct}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      showPopup('Error', 'No se pudo descargar la imagen, probablemente por políticas de CORS en la URL original.', 'error');
    }
  };

  const getCopyText = (type) => {
    const product = products.find(p => p.id === marketingSelectedProduct);
    if (!product) return '';
    const link = `${window.location.protocol}//${window.location.host}/${store.slug}`;
    switch(type) {
      case 'promo':
        return `🔥 ¡NUEVO INGRESO! 🔥\n\nLlegó ${product.name} y está increíble. 😍\n\nConsíguelo por solo $${product.price} en nuestra tienda online.\n\n👉 ${link}\n\n#${store.name.replace(/\s+/g, '')} #Oferta #Novedad`;
      case 'urgency':
        return `⏳ ¡ÚLTIMAS UNIDADES! ⏳\n\nNo te quedes sin tu ${product.name}. ¡Vuelan! 🏃‍♂️💨\n\nPrecio especial: $${product.price}\n\n🛒 Comprá acá: ${link}\n\n#${store.name.replace(/\s+/g, '')} #Promo`;
      case 'minimal':
        return `✨ ${product.name} ✨\n\n$${product.price}\n\nEncontralo en nuestra web:\n🔗 ${link}`;
      default: return '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showPopup('Copiado', 'Texto copiado al portapapeles', 'success');
  };

  return (
    <div className="container" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.8rem' }}>
          <Link to={`/${store.slug}`} className="btn btn-outline" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          Panel: {store.name}
        </h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('orders'); setEditingProduct(null); }}>Pedidos</button>
          <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('products'); setEditingProduct(null); }}>Productos</button>
          <button className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('categories'); setEditingProduct(null); }}>Categorías</button>
          <button className={`btn ${activeTab === 'marketing' ? 'btn-primary' : 'btn-outline'}`} style={{ color: activeTab !== 'marketing' ? '#8b5cf6' : 'white', borderColor: activeTab !== 'marketing' ? '#8b5cf6' : 'transparent', backgroundColor: activeTab === 'marketing' ? '#8b5cf6' : 'transparent' }} onClick={() => { setActiveTab('marketing'); setEditingProduct(null); }}>Marketing</button>
          <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('settings'); setEditingProduct(null); }}>Configuración</button>
          <button className={`btn ${activeTab === 'referrals' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('referrals'); setEditingProduct(null); }}>Suscripción</button>
          <button className="btn btn-outline" onClick={handleLogout} style={{ borderColor: '#ef4444', color: '#ef4444' }}>Salir</button>
        </div>
      </div>

      {activeTab === 'marketing' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Megaphone size={28} color="#8b5cf6" />
                <h2 style={{ margin: 0 }}>Generador de Post</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Selecciona un producto para generar automáticamente un flyer para tus redes sociales (1080x1080).</p>
              
              <select 
                value={marketingSelectedProduct} 
                onChange={(e) => setMarketingSelectedProduct(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', marginBottom: '24px' }}
              >
                <option value="" disabled>Elegir un producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                ))}
              </select>

              {marketingSelectedProduct && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={1080} 
                    height={1080} 
                    style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                  <button className="btn btn-primary" onClick={handleDownloadPost} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none' }}>
                    <Download size={20} /> Descargar para Instagram
                  </button>
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Share2 size={28} color="#3b82f6" />
                <h2 style={{ margin: 0 }}>Difusión Rápida</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Comparte el enlace de tu tienda con tus clientes rápidamente.</p>
              
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button className="btn btn-outline" onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/${store.slug}`)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Copy size={20} /> Copiar URL de la Tienda
                </button>
                <a href={`https://wa.me/?text=¡Hola!%20Visita%20nuestra%20tienda%20online%20acá:%20${window.location.protocol}//${window.location.host}/${store.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', border: 'none', textDecoration: 'none' }}>
                  Compartir por WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            {marketingSelectedProduct ? (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '24px' }}>Textos para Redes Sociales (Copy)</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#10b981' }}>Estilo Promocional</h3>
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', whiteSpace: 'pre-wrap' }}>
                      {getCopyText('promo')}
                      <button className="btn btn-outline" onClick={() => copyToClipboard(getCopyText('promo'))} style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', background: 'var(--bg-color)' }} title="Copiar">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f59e0b' }}>Estilo Urgencia</h3>
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', whiteSpace: 'pre-wrap' }}>
                      {getCopyText('urgency')}
                      <button className="btn btn-outline" onClick={() => copyToClipboard(getCopyText('urgency'))} style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', background: 'var(--bg-color)' }} title="Copiar">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#3b82f6' }}>Estilo Minimalista</h3>
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', whiteSpace: 'pre-wrap' }}>
                      {getCopyText('minimal')}
                      <button className="btn btn-outline" onClick={() => copyToClipboard(getCopyText('minimal'))} style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', background: 'var(--bg-color)' }} title="Copiar">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Selecciona un producto a la izquierda para generar los textos publicitarios.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
          <h2>Configuración General</h2>
          <form onSubmit={handleUpdateStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Logo de la Tienda</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={store.logoUrl} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                  <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} /> {isUploading ? 'Subiendo...' : 'Subir Logo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(e, (url) => setStore({...store, logoUrl: url}))} />
                  </label>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Banner Principal</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <img src={store.bannerUrl} alt="Banner" style={{ width: '100%', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                    <Upload size={16} /> {isUploading ? 'Subiendo...' : 'Subir Banner'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(e, (url) => setStore({...store, bannerUrl: url}))} />
                  </label>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />

            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Nombre</label>
              <input type="text" value={store.name || ''} onChange={e => setStore({...store, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Número de WhatsApp</label>
              <input type="text" value={store.whatsappNumber || ''} onChange={e => setStore({...store, whatsappNumber: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Color del Tema</label>
              <input type="color" value={store.themeColor || '#6366f1'} onChange={e => setStore({...store, themeColor: e.target.value})} style={{ padding: '4px', borderRadius: '8px', border: 'none', background: 'transparent', height: '40px', width: '100%' }} />
            </div>
            
            <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
            <h3>Marketing y Redes (Pro)</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Barra de Anuncios Superior</label>
              <input type="text" placeholder="Ej: Envío gratis superando los $50.000" value={store.announcementText || ''} onChange={e => setStore({...store, announcementText: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Horarios de Atención</label>
              <input type="text" placeholder="Ej: Lunes a Viernes de 9 a 18hs" value={store.businessHours || ''} onChange={e => setStore({...store, businessHours: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Instagram (URL)</label>
                <input type="text" placeholder="https://instagram.com/..." value={store.instagramUrl || ''} onChange={e => setStore({...store, instagramUrl: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Facebook (URL)</label>
                <input type="text" placeholder="https://facebook.com/..." value={store.facebookUrl || ''} onChange={e => setStore({...store, facebookUrl: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
            <h3>Opciones Premium</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Dominio Personalizado (Ej: mitienda.com.ar)</label>
              <input type="text" placeholder="mitienda.com.ar" value={store.customDomain || ''} onChange={e => setStore({...store, customDomain: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Access Token (Mercado Pago)</label>
              <input type="password" placeholder="APP_USR-..." value={store.mercadoPagoToken || ''} onChange={e => setStore({...store, mercadoPagoToken: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Guardar Cambios</button>
          </form>

          <hr style={{ borderColor: 'var(--border-color)', margin: '40px 0' }} />
          
          <h2>Seguridad</h2>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Nueva Contraseña</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-outline" style={{ marginTop: '8px', width: 'fit-content', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>Actualizar Contraseña</button>
          </form>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '700px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Mi Suscripción</h2>
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Plan Actual</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {store.subscriptionPlan || 'Mensual ($6.000)'}
                </div>
                {store.customDomainRequested && <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginTop: '4px', fontWeight: 'bold' }}>+ Dominio Propio Activo</div>}
              </div>
              <button className="btn btn-primary" onClick={() => setShowUpgradeModal(true)}>Mejorar Plan</button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: `2px solid ${store.themeColor}`, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '50%', color: store.themeColor }}>
              <Users size={40} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Tus Afiliados Activos</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{store.affiliateCount || 0}</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiendas creadas usando tu enlace</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Gift size={32} color="var(--accent-color)" />
            <h2 style={{ margin: 0 }}>Programa de Referidos</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            ¡Trae a tus amigos emprendedores y gana beneficios! Si activas tu participación, podrás compartir tu Link Único. Cuando alguien se suscriba usándolo, participas automáticamente por:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', padding: '16px' }}>
            <li style={{ marginBottom: '12px', fontWeight: 'bold' }}>🥇 1er Premio: <span style={{ color: 'var(--accent-color)' }}>1 Mes Gratis</span></li>
            <li style={{ marginBottom: '12px', fontWeight: 'bold' }}>🥈 2do Premio: <span style={{ color: 'var(--accent-color)' }}>30% OFF en renovación</span></li>
            <li style={{ fontWeight: 'bold' }}>🥉 3er Premio: <span style={{ color: 'var(--accent-color)' }}>10% OFF en renovación</span></li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
              <div style={{ position: 'relative', width: '48px', height: '24px', backgroundColor: store.referralActive ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '24px', transition: 'background-color 0.3s' }}>
                <div style={{ position: 'absolute', top: '2px', left: store.referralActive ? '26px' : '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.3s' }}></div>
              </div>
              <input 
                type="checkbox" 
                checked={store.referralActive || false} 
                onChange={(e) => {
                  const updated = { ...store, referralActive: e.target.checked };
                  setStore(updated);
                  updateStore(store.id, updated);
                }} 
                style={{ display: 'none' }} 
              />
              <span style={{ fontWeight: 'bold' }}>
                {store.referralActive ? 'Participación Activada' : 'Activar Participación'}
              </span>
            </label>
          </div>

          {store.referralActive && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tu Link Único de Referido (Cópialo y compártelo)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink} 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--accent-color)', background: 'var(--bg-secondary)', color: 'white', outline: 'none' }} 
                />
                <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(referralLink); showPopup('¡Copiado!', 'Enlace copiado al portapapeles', 'success'); }}>
                  <LinkIcon size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '300px' }}>
            <h2 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><ListFilter size={24} /> Mis Categorías</h2>
            
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <input 
                required 
                type="text" 
                placeholder="Ej: Remeras, Pantalones, Accesorios..." 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                <Plus size={20} /> Crear Categoría
              </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px' }}>Nombre de Categoría</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>
                      {editingCategoryId === cat.id ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          autoFocus
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }}
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {editingCategoryId === cat.id ? (
                        <>
                          <button className="btn btn-outline" style={{ padding: '8px', marginRight: '8px', color: '#22c55e', borderColor: 'transparent' }} onClick={() => handleUpdateCategory(cat.id)}>
                            <Check size={18} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '8px', color: 'var(--text-secondary)', borderColor: 'transparent' }} onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}>
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline" style={{ padding: '8px', marginRight: '8px', borderColor: 'transparent' }} onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}>
                            <Pencil size={18} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No tienes categorías creadas. Organiza tus productos creándolas arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '50%', color: store.themeColor }}>
                <ShoppingBag size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Pedidos</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{orders.length}</div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '50%', color: '#ef4444' }}>
                <Clock size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Pendientes</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{orders.filter(o => o.status === 'PENDIENTE').length}</div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '16px', borderRadius: '50%', color: '#22c55e' }}>
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Completados</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{orders.filter(o => o.status === 'ENTREGADO').length}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Historial de Pedidos</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px' }}>Fecha / ID</th>
                  <th style={{ padding: '16px' }}>Cliente</th>
                  <th style={{ padding: '16px' }}>Artículos</th>
                  <th style={{ padding: '16px' }}>Total</th>
                  <th style={{ padding: '16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold' }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>#{String(order.id).split('-')[0]}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{order.customerPhone}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        {(Array.isArray(typeof order.items === 'string' ? JSON.parse(order.items || '[]') : order.items) ? (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : order.items) : []).map((item, i) => (
                          <div key={i}>{item?.quantity}x {item?.product?.name || 'Producto'}</div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: store.themeColor }}>
                      ${(Number(order.total) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '20px',
                          border: '1px solid var(--border-color)',
                          background: order.status === 'PENDIENTE' ? 'rgba(239, 68, 68, 0.2)' : 
                                      order.status === 'PAGADO' ? 'rgba(59, 130, 246, 0.2)' :
                                      order.status === 'ENTREGADO' ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-secondary)',
                          color: order.status === 'PENDIENTE' ? '#ef4444' : 
                                 order.status === 'PAGADO' ? '#3b82f6' :
                                 order.status === 'ENTREGADO' ? '#22c55e' : 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="PENDIENTE" style={{ color: 'black' }}>Pendiente</option>
                        <option value="PAGADO" style={{ color: 'black' }}>Pagado</option>
                        <option value="CONFIRMADO" style={{ color: 'black' }}>Confirmado</option>
                        <option value="ENVIADO" style={{ color: 'black' }}>Enviado</option>
                        <option value="ENTREGADO" style={{ color: 'black' }}>Entregado</option>
                        <option value="CANCELADO" style={{ color: 'black' }}>Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aún no tienes pedidos. Cuando un cliente realice una compra, aparecerá aquí.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Mis Productos</h2>
              {!editingProduct && (
                <button className="btn btn-primary" onClick={handleAddProductClick}>
                  <Plus size={20} /> Agregar Producto
                </button>
              )}
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '16px' }}>Imagen</th>
                    <th style={{ padding: '16px' }}>Producto</th>
                    <th style={{ padding: '16px' }}>Precio</th>
                    <th style={{ padding: '16px' }}>Oferta</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '12px 16px' }}>
                        <img src={product.imageUrl} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      </td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{product.name}</td>
                      <td style={{ padding: '16px' }}>${(Number(product.price) || 0).toFixed(2)}</td>
                      <td style={{ padding: '16px', color: '#ef4444' }}>
                        {product.compareAtPrice ? `$${(Number(product.compareAtPrice) || 0).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button className="btn btn-outline" style={{ padding: '8px', marginRight: '8px', borderColor: 'transparent' }} onClick={() => setEditingProduct(product)}>
                          <Pencil size={18} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No tienes productos. Haz clic en "Agregar Producto" para empezar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulario Lateral para Editar/Crear Producto */}
          {editingProduct && (
            <div className="glass-panel animate-fade-in" style={{ padding: '24px', width: '350px', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>{editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <button onClick={() => setEditingProduct(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Nombre del Producto</label>
                  <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Precio ($)</label>
                    <input required type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ef4444' }}>Precio Oferta</label>
                    <input type="number" step="0.01" placeholder="Tachado" value={editingProduct.compareAtPrice || ''} onChange={e => setEditingProduct({...editingProduct, compareAtPrice: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Categoría</label>
                  <select 
                    value={editingProduct.categoryId || ''} 
                    onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
                  >
                    <option value="" disabled>Seleccionar categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Descripción</label>
                  <textarea rows="3" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={16} /> Imagen del Producto
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <label className="btn btn-outline" style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Upload size={18} /> {isUploading ? 'Subiendo...' : 'Subir Foto'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(e, (url) => setEditingProduct({...editingProduct, imageUrl: url}))} />
                    </label>
                  </div>
                  <input type="text" placeholder="O pega una URL de imagen..." value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                  {editingProduct.imageUrl && (
                    <img src={editingProduct.imageUrl} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px' }} />
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isUploading} style={{ width: '100%', marginTop: '8px', padding: '12px', opacity: isUploading ? 0.5 : 1 }}>
                  {editingProduct.id ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Modal de Upgrade */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Mejorar Suscripción</h2>
              <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Selecciona el plan al que deseas subirte. Nuestro equipo lo habilitará en breve.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div 
                onClick={() => setUpgradePlanSelected('Mensual ($6.000)')}
                style={{ padding: '16px', border: `2px solid ${upgradePlanSelected === 'Mensual ($6.000)' ? 'var(--accent-color)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', background: upgradePlanSelected === 'Mensual ($6.000)' ? 'rgba(99,102,241,0.1)' : 'transparent' }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mensual ($6.000)</div>
              </div>
              <div 
                onClick={() => setUpgradePlanSelected('Trimestral ($15.000)')}
                style={{ padding: '16px', border: `2px solid ${upgradePlanSelected === 'Trimestral ($15.000)' ? 'var(--accent-color)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', background: upgradePlanSelected === 'Trimestral ($15.000)' ? 'rgba(99,102,241,0.1)' : 'transparent' }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Trimestral ($15.000)</div>
              </div>
              <div 
                onClick={() => setUpgradePlanSelected('Anual ($40.000)')}
                style={{ position: 'relative', padding: '16px', border: `2px solid ${upgradePlanSelected === 'Anual ($40.000)' ? 'var(--accent-color)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', background: upgradePlanSelected === 'Anual ($40.000)' ? 'rgba(99,102,241,0.1)' : 'transparent' }}
              >
                <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--accent-color)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>MEJOR VALOR</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Anual ($40.000)</div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }} onClick={handleRequestUpgrade}>
              Solicitar Cambio de Plan
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
