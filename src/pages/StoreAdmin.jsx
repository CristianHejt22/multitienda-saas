import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreBySlug, updateStore, getProductsByStore, getCategoriesByStore, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addRequest } from '../dataManager';
import { ArrowLeft, Plus, Trash2, Link as LinkIcon, Gift, Pencil, X, Image, Users, ListFilter } from 'lucide-react';
import { usePopup } from '../context/PopupContext';

export default function StoreAdmin({ forceSlug }) {
  const params = useParams();
  const storeSlug = forceSlug || params.storeSlug;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { showPopup } = usePopup();

  // States for UI tabs
  const [activeTab, setActiveTab] = useState('products');
  
  // States for Product CRUD
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Upgrade state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlanSelected, setUpgradePlanSelected] = useState('Anual ($40.000)');

  // Link de referido
  const referralLink = `${window.location.protocol}//${window.location.host}/register?ref=${storeSlug}`;

  const loadData = () => {
    const s = getStoreBySlug(storeSlug);
    if (s) {
      setStore(s);
      setProducts(getProductsByStore(s.id));
      setCategories(getCategoriesByStore(s.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [storeSlug]);

  if (!store) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>Tienda no encontrada</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Verifica que la URL sea correcta o que la tienda haya sido creada en este navegador (base de datos local).</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Volver al inicio</Link>
    </div>
  );

  const handleUpdateStore = (e) => {
    e.preventDefault();
    updateStore(store.id, store);
    showPopup('Éxito', 'Configuración guardada correctamente', 'success');
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

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const prodToSave = {
      ...editingProduct,
      price: parseFloat(editingProduct.price) || 0,
      compareAtPrice: editingProduct.compareAtPrice ? parseFloat(editingProduct.compareAtPrice) : null
    };

    if (prodToSave.id) {
      updateProduct(prodToSave.id, prodToSave);
    } else {
      addProduct({
        ...prodToSave,
        storeId: store.id,
        categoryId: prodToSave.categoryId || (categories[0]?.id || null),
        variants: []
      });
    }
    setEditingProduct(null);
    loadData();
  };

  const handleDeleteProduct = (id) => {
    if(window.confirm('¿Borrar producto? Esta acción no se puede deshacer.')) {
      deleteProduct(id);
      loadData();
    }
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName, store.id);
    setNewCategoryName('');
    loadData();
  };

  const handleDeleteCategory = (id) => {
    if(window.confirm('¿Borrar categoría? Solo hazlo si está vacía.')) {
      deleteCategory(id);
      loadData();
    }
  };

  const handleRequestUpgrade = () => {
    addRequest({
      type: 'UPGRADE',
      storeId: store.id,
      storeName: store.name,
      whatsappNumber: store.whatsappNumber,
      requestedPlan: upgradePlanSelected
    });
    setShowUpgradeModal(false);
    showPopup('Solicitud Enviada', 'Tu solicitud de mejora ha sido enviada con éxito. Te contactaremos pronto.', 'success');
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('products'); setEditingProduct(null); }}>Productos</button>
          <button className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('categories'); setEditingProduct(null); }}>Categorías</button>
          <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('settings'); setEditingProduct(null); }}>Configuración</button>
          <button className={`btn ${activeTab === 'referrals' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('referrals'); setEditingProduct(null); }}>Suscripción & Referidos</button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
          <h2>Configuración General</h2>
          <form onSubmit={handleUpdateStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
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
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{cat.name}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 size={18} />
                      </button>
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
                      <td style={{ padding: '16px' }}>${product.price.toFixed(2)}</td>
                      <td style={{ padding: '16px', color: '#ef4444' }}>
                        {product.compareAtPrice ? `$${product.compareAtPrice.toFixed(2)}` : '-'}
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
                    <Image size={16} /> URL de Imagen
                  </label>
                  <input type="text" value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                  {editingProduct.imageUrl && (
                    <img src={editingProduct.imageUrl} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px' }} />
                  )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
                  Guardar Producto
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
