import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Search, Plus, X, Loader2, Globe, User as UserIcon } from 'lucide-react';

const WINE = '#8C1515';

interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'global' | 'individual';
  user_id?: number | null;
  created_at: string;
  user?: {
    id_usuario: number;
    nombres: string;
    correo: string;
  };
}

interface UserItem {
  id_usuario: number;
  nombres: string;
  correo: string;
  cedula: string;
}

export default function Avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tipo, setTipo] = useState<'global' | 'individual'>('global');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [userSearch, setUserSearch] = useState('');

  const fetchAvisos = async () => {
    try {
      const response = await api.get('/avisos/admin');
      setAvisos(response.data);
    } catch (error) {
      console.error('Error fetching avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/admin/usuarios');
      setUsuarios(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  useEffect(() => {
    fetchAvisos();
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tipo === 'individual' && !selectedUserId) {
      window.alert('Error: Debes seleccionar un usuario para el aviso individual.');
      return;
    }
    if (!titulo.trim() || !mensaje.trim()) {
      window.alert('Error: El título y el mensaje son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/avisos', {
        titulo,
        mensaje,
        tipo,
        user_id: tipo === 'individual' ? selectedUserId : null,
      });
      window.alert('¡Éxito! Aviso enviado correctamente.');
      setIsModalOpen(false);
      setTitulo('');
      setMensaje('');
      setTipo('global');
      setSelectedUserId('');
      fetchAvisos();
    } catch (error) {
      console.error(error);
      window.alert('Error: Ocurrió un error al enviar el aviso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = usuarios.filter((u) => 
    u.nombres?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.correo?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.cedula?.includes(userSearch)
  ).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            Gestión de Avisos y Comunicados
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>
            Envía notificaciones oficiales globales o a usuarios específicos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: WINE,
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: `0 4px 12px ${WINE}40`,
          }}
        >
          <Plus size={18} />
          Redactar Nuevo Aviso
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Fecha</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Título</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Destinatario</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="animate-spin" color={WINE} style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : avisos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: 14 }}>
                  No hay avisos registrados en el sistema.
                </td>
              </tr>
            ) : (
              avisos.map((aviso) => (
                <tr key={aviso.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px', fontSize: 13, color: '#6B7280' }}>
                    {new Date(aviso.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {aviso.titulo}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {aviso.tipo === 'global' ? (
                      <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={12} /> Global
                      </span>
                    ) : (
                      <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <UserIcon size={12} /> Individual
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 13, color: '#374151' }}>
                    {aviso.tipo === 'global' ? 'Todos los usuarios' : (aviso.user ? aviso.user.nombres : 'Usuario eliminado')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Redactar Aviso */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 17, 23, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header Modal */}
            <div style={{ padding: '24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={20} color={WINE} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Redactar Aviso</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>Soporte ULEAM Rental</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Tipo de Destinatario */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Tipo de Destinatario
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => {
                      setTipo(e.target.value as 'global' | 'individual');
                      setSelectedUserId('');
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }}
                  >
                    <option value="global">Todos los usuarios (Global)</option>
                    <option value="individual">Usuario Específico (Individual)</option>
                  </select>
                </div>

                {/* Búsqueda de Usuario (Si es individual) */}
                {tipo === 'individual' && (
                  <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      Buscar Usuario Destinatario
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', marginBottom: 12 }}>
                      <Search size={14} color="#9CA3AF" />
                      <input
                        type="text"
                        placeholder="Nombre, cédula o correo..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13 }}
                      />
                    </div>

                    <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id_usuario}
                          onClick={() => setSelectedUserId(u.id_usuario)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: selectedUserId === u.id_usuario ? '#FEF2F2' : '#fff',
                            border: `1px solid ${selectedUserId === u.id_usuario ? '#FECACA' : '#E5E7EB'}`,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.nombres}</div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>{u.correo} | {u.cedula}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Título */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Título del Aviso
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Actualización de Políticas"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Mensaje Oficial
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe el comunicado aquí..."
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Botones */}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: 8, background: '#F3F4F6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: WINE,
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Enviar Aviso Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
