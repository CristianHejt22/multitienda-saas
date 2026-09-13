import React, { useState, useEffect } from 'react';
import { getStores, deleteStore, addStore, getRequests, deleteRequest, getStoreBySlug, updateStore } from '../dataManager';
import { Trash2, ExternalLink, Settings, PlusCircle, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePopup } from '../context/PopupContext';

export default function SuperAdmin() {
  const [stores, setStores] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', whatsappNumber: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();

  const loadData = async () => {
    setLoading(true);
    const [dbStores, dbRequests] = await Promise.all([
      getStores(),
      getRequests()
    ]);
    setStores(dbStores);
    setRequests(dbRequests);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta tienda y todo su contenido?")) {
      await deleteStore(id);
      await loadData();
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    const slug = newStore.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const generatedPassword = Math.random().toString(36).slice(-8); // Random 8 char password

    const storeToAdd = {
      ...newStore,
      slug,
      password: generatedPassword, // Guardamos la credencial
      themeColor: '#6366f1',
      bannerUrl: 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&q=80&w=1200',
      logoUrl: `https://ui-avatars.com/api/?name=${newStore.name}&background=6366f1&color=fff&size=128`
    };

    await addStore(storeToAdd);
    showPopup(
      'Tienda Creada Exitosamente',
      `Slug: /${slug}\nContraseña: ${generatedPassword}\n\nEnvíale estos datos al cliente para que acceda a su panel.`,
      'success'
    );
    setNewStore({ name: '', whatsappNumber: '', description: '' });
    setShowAddForm(false);
    await loadData();
  };

  const handleApproveRequest = async (req) => {
    if (req.type === 'UPGRADE') {
      await updateStore(req.storeId, { subscriptionPlan: req.requestedPlan });
      await deleteRequest(req.id);
      showPopup('Plan Actualizado', `La tienda "${req.storeName}" ha sido actualizada a: ${req.requestedPlan}`, 'success');
      await loadData();
      return;
    }

    // Flujo normal para Nueva Tienda
    const slug = req.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const generatedPassword = Math.random().toString(36).slice(-8);

    const storeToAdd = {
      name: req.name,
      whatsappNumber: req.whatsappNumber,
      description: req.description,
      subscriptionPlan: req.plan,
      customDomainRequested: req.customDomain,
      slug,
      password: generatedPassword,
      themeColor: '#6366f1',
      bannerUrl: 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&q=80&w=1200',
      logoUrl: `https://ui-avatars.com/api/?name=${req.name}&background=6366f1&color=fff&size=128`
    };

    await addStore(storeToAdd);

    if (req.referralCode) {
      const refStore = await getStoreBySlug(req.referralCode);
      if (refStore) {
        await updateStore(refStore.id, { affiliateCount: (refStore.affiliateCount || 0) + 1 });
      }
    }

    await deleteRequest(req.id);
    showPopup(
      'Solicitud Aprobada',
      `La tienda ha sido creada.\nContraseña generada: ${generatedPassword}\n\nYa puedes enviarle los accesos por WhatsApp al número: ${req.whatsappNumber}`,
      'success'
    );
    await loadData();
  };

  const handleRejectRequest = async (id) => {
    if (window.confirm('¿Rechazar y eliminar esta solicitud?')) {
      await deleteRequest(id);
      await loadData();
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '40px', color: 'white' }}>Cargando panel...</div>;

  const sendWhatsAppWelcome = (store) => {
    if (!store.whatsappNumber) {
      alert("Esta tienda no tiene un número de WhatsApp registrado.");
      return;
    }
    const text = `¡Hola! 🎉 Tu tienda online en MTShopi ha sido creada con éxito.\n\n📍 URL de tu tienda: https://mtshopi.vercel.app/${store.slug}\n⚙️ Panel de Administración: https://mtshopi.vercel.app/${store.slug}/admin\n\n🔑 Tus accesos:\nUsuario: ${store.slug}\nContraseña: ${store.password}\n\n¡Mucho éxito con tus ventas! 🚀`;
    const url = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Panel de Control Global (Privado)</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle size={20} /> Crear Tienda Aprobada
        </button>
      </div>
      
      {showAddForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
          <h2>Dar de Alta Nueva Tienda</h2>
          <form onSubmit={handleAddStore} style={{ display: 'flex', gap: '16px', marginTop: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Nombre</label>
              <input required type="text" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>WhatsApp (Cliente)</label>
              <input required type="text" value={newStore.whatsappNumber} onChange={e => setNewStore({...newStore, whatsappNumber: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Confirmar Alta</button>
          </form>
        </div>
      )}

      <div className="grid-responsive" style={{ marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--accent-color)' }}>{stores.length}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tiendas Activas</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: '#eab308' }}>{requests.length}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Solicitudes Pendientes</p>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '40px' }}>
          <h2 style={{ padding: '24px 24px 0 24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={24} color="#eab308" /> Solicitudes Pendientes
          </h2>
          <div style={{ overflow: 'auto', padding: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px' }}>Cliente</th>
                  <th style={{ padding: '16px' }}>Plan</th>
                  <th style={{ padding: '16px' }}>Extras</th>
                  <th style={{ padding: '16px' }}>Referido por</th>
                  <th style={{ padding: '16px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const isUpgrade = req.type === 'UPGRADE';
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)', background: isUpgrade ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: isUpgrade ? 'var(--accent-color)' : '#10b981', color: 'white', fontWeight: 'bold' }}>
                            {isUpgrade ? 'UPGRADE' : 'NUEVA'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{isUpgrade ? req.storeName : req.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>WA: {req.whatsappNumber}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {isUpgrade ? req.requestedPlan : req.plan}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {req.customDomain ? <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>+ Dominio Propio</span> : '-'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{req.referralCode || '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => handleApproveRequest(req)} title={isUpgrade ? "Aprobar Cambio de Plan" : "Aprobar y Crear Tienda"}>
                            <CheckCircle size={16} /> Aprobar
                          </button>
                          <button className="btn btn-outline" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleRejectRequest(req.id)} title="Rechazar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '16px' }}>Tiendas Aprobadas</h2>
      <div className="glass-panel" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px' }}>Tienda</th>
              <th style={{ padding: '16px' }}>URL / Slug</th>
              <th style={{ padding: '16px' }}>Credencial</th>
              <th style={{ padding: '16px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={store.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  {store.name}
                </td>
                <td style={{ padding: '16px' }}>/{store.slug}</td>
                <td style={{ padding: '16px', color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                  {store.password || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/${store.slug}`} className="btn btn-outline" style={{ padding: '8px' }} title="Ver tienda">
                      <ExternalLink size={16} />
                    </Link>
                    <Link to={`/${store.slug}/admin`} className="btn btn-outline" style={{ padding: '8px' }} title="Administrar tienda">
                      <Settings size={16} />
                    </Link>
                    <button className="btn btn-outline" style={{ padding: '8px', color: '#10b981', borderColor: 'transparent' }} onClick={() => sendWhatsAppWelcome(store)} title="Enviar Accesos por WhatsApp">
                      <MessageCircle size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleDelete(store.id)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
