import React, { useState, useEffect } from 'react';
import { History, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const WINE = '#8C1515';

interface UserAuditLog {
  id: number;
  admin_id: number;
  action: string;
  target_user_name: string;
  created_at: string;
  admin?: {
    id_usuario: number;
    nombres: string;
  };
}

export default function HistorialUsuarios() {
  const [history, setHistory] = useState<UserAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/usuarios/historial');
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching user audit history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.target_user_name?.toLowerCase().includes(search.toLowerCase()) || 
    item.admin?.nombres?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link 
          to="/usuarios"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: 'white', border: '1px solid #E5E7EB',
            color: '#4B5563', textDecoration: 'none', transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={28} color={WINE} />
            Historial de Acciones
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0 0' }}>
            Auditoría de modificaciones, suspensiones y eliminaciones de usuarios.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Buscar por afectado o administrador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 38px',
              borderRadius: 10, border: '1px solid #E5E7EB',
              fontSize: 14, outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Fecha y Hora</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Administrador</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Acción Realizada</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Usuario Afectado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center' }}>
                    <Loader2 size={32} color={WINE} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ marginTop: 12, color: '#6B7280', fontSize: 14 }}>Cargando auditoría...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                    No hay registros en la auditoría.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#4B5563' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                      {item.admin?.nombres || 'Administrador (Sistema)'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: item.action === 'eliminó' ? '#FEE2E2' : 
                                       (item.action === 'suspendió' ? '#FEF3C7' : '#DBEAFE'),
                        color: item.action === 'eliminó' ? '#991B1B' : 
                             (item.action === 'suspendió' ? '#92400E' : '#1E40AF')
                      }}>
                        {item.action.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#4B5563', fontWeight: 500 }}>
                      {item.target_user_name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
