import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Search, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const WINE = '#8C1515';

interface KycHistoryItem {
  id: number;
  id_arrendador?: number;
  id_admin?: number;
  accion: 'aprobado' | 'rechazado' | string;
  observaciones?: string | null;
  created_at: string;
  arrendador?: {
    id_usuario: number;
    nombres: string;
    cedula?: string;
  };
  admin?: {
    id_usuario: number;
    nombres: string;
  };
  // Retrocompatibilidad
  nombres?: string;
  cedula?: string;
  identificacion?: string;
  estado_kyc?: string;
  verified_at?: string;
  verified_by_admin?: {
    id_usuario: number;
    nombres: string;
  };
}

export default function HistorialVerificaciones() {
  const [history, setHistory] = useState<KycHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/verificaciones/historial');
      const data = response.data.data || response.data;
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching verification history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const arrendadorNombre = item.arrendador?.nombres || item.nombres || '';
    const arrendadorCedula = item.arrendador?.cedula || item.cedula || item.identificacion || '';
    const adminNombre = item.admin?.nombres || item.verified_by_admin?.nombres || '';
    const obs = item.observaciones || '';
    const term = search.toLowerCase();

    return (
      arrendadorNombre.toLowerCase().includes(term) ||
      arrendadorCedula.includes(term) ||
      adminNombre.toLowerCase().includes(term) ||
      obs.toLowerCase().includes(term)
    );
  });

  const totalAprobados = history.filter(h => (h.accion || h.estado_kyc) === 'aprobado').length;
  const totalRechazados = history.filter(h => (h.accion || h.estado_kyc) === 'rechazado').length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link 
            to="/verificacion"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: 'white', border: '1px solid #E5E7EB',
              color: '#4B5563', textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={28} color={WINE} />
              Historial de Verificaciones
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0 0' }}>
              Registro de auditoría inmutable de aprobaciones y rechazos KYC.
            </p>
          </div>
        </div>

        {/* Botón Refrescar */}
        <button
          onClick={fetchHistory}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: 'white', border: '1px solid #E5E7EB',
            borderRadius: 10, padding: '9px 16px', fontSize: 13,
            fontWeight: 600, color: '#374151', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refrescar
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: 'white', padding: 18, borderRadius: 14, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#4B5563" />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Total Auditorías</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{history.length}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: 18, borderRadius: 14, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#166534" />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Aprobados</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>{totalAprobados}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: 18, borderRadius: 14, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} color="#991B1B" />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#991B1B', textTransform: 'uppercase' }}>Rechazados</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#991B1B' }}>{totalRechazados}</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Buscar por arrendador, cédula u observación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 38px',
              borderRadius: 10, border: '1px solid #E5E7EB',
              fontSize: 14, outline: 'none', backgroundColor: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Arrendador</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cédula</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Acción</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Observación / Motivo</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Verificado Por</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <Loader2 size={32} color={WINE} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ marginTop: 12, color: '#6B7280', fontSize: 14 }}>Cargando historial de auditoría...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>
                    No hay registros en el historial de verificaciones.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, index) => {
                  const nombre = item.arrendador?.nombres || item.nombres || 'Arrendador';
                  const cedula = item.arrendador?.cedula || item.cedula || item.identificacion || 'N/A';
                  const adminNombre = item.admin?.nombres || item.verified_by_admin?.nombres || 'Administrador (Sistema)';
                  const accion = (item.accion || item.estado_kyc || '').toLowerCase();
                  const isAprobado = accion === 'aprobado';
                  const fechaRaw = item.created_at || item.verified_at;
                  const fechaStr = fechaRaw ? new Date(fechaRaw).toLocaleString('es-EC', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';

                  return (
                    <tr key={item.id ? `kyc-${item.id}` : `kyc-row-${index}`} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                        {nombre}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#4B5563' }}>
                        {cedula}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: isAprobado ? '#DCFCE7' : '#FEE2E2',
                          color: isAprobado ? '#166534' : '#991B1B'
                        }}>
                          {isAprobado ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {isAprobado ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#4B5563', maxWidth: 300 }}>
                        <div style={{
                          backgroundColor: isAprobado ? '#F9FAFB' : '#FEF2F2',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: `1px solid ${isAprobado ? '#E5E7EB' : '#FECACA'}`,
                          color: isAprobado ? '#374151' : '#991B1B',
                          lineHeight: 1.4
                        }}>
                          {item.observaciones || (isAprobado ? 'Documentación validada' : 'Sin observaciones')}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#4B5563' }}>
                        {adminNombre}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#6B7280' }}>
                        {fechaStr}
                      </td>
                    </tr>
                  );
                })
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

