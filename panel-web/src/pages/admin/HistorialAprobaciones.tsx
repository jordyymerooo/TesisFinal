import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calendar,
  Search,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { api } from '../../services/api';

const WINE = '#8C1515';

interface ApprovedProperty {
  id_inmueble: number;
  titulo: string;
  tipo: string;
  precio: string | number;
  estado: string;
  aprobado_por: number | null;
  aprobado_en: string | null;
  created_at: string;
  arrendador: { id_usuario: number; nombres: string; correo: string } | null;
  aprobador: { id_usuario: number; nombres: string; correo: string } | null;
  fotografias: Array<{ url: string }>;
  ubicacion: { sector: string; direccion_referencial: string } | null;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = (hours % 12 || 12).toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hour12}:${mins} ${ampm}`;
  } catch { return iso; }
}

function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const TIPO_LABELS: Record<string, string> = {
  cuarto: 'Cuarto',
  mini_departamento: 'Mini Dept.',
  departamento_compartido: 'Dept. Compartido',
  suite: 'Suite',
};

export function HistorialAprobaciones() {
  const navigate = useNavigate();
  const [data, setData] = useState<ApprovedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inmuebles/historial');
      const items: ApprovedProperty[] = res.data?.data ?? res.data ?? [];
      setData(items);
      setTotal(res.data?.total ?? items.length);
    } catch (err) {
      console.error('[HistorialAprobaciones] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistorial(); }, []);

  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.titulo?.toLowerCase().includes(q) ||
      p.arrendador?.nombres?.toLowerCase().includes(q) ||
      p.aprobador?.nombres?.toLowerCase().includes(q) ||
      String(p.id_inmueble).includes(q)
    );
  });

  const th = (label: string) => (
    <th key={label} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </th>
  );

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={() => navigate('/propiedades')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13, fontWeight: 600, marginBottom: 10, padding: '4px 0' }}>
            <ArrowLeft size={15} />
            Volver a Auditoría
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={26} color={WINE} />
            Historial de Aprobaciones
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>
            Registro completo de propiedades aprobadas — incluye el administrador que las publicó y la fecha exacta.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10B981" />
            {total} aprobadas
          </div>
          <button onClick={fetchHistorial} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, color: '#374151', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <RefreshCw size={15} color={WINE} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '14px 18px', border: '1px solid #E5E7EB', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Search size={16} color="#9CA3AF" />
        <input type="text" placeholder="Buscar por propiedad, arrendador o administrador..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', width: '100%', background: 'transparent', fontFamily: 'inherit' }} />
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
            <Loader2 size={30} color={WINE} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Cargando historial...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
            <ClipboardList size={44} color="#E5E7EB" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>{search ? 'Sin resultados' : 'Aún no hay propiedades aprobadas'}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{search ? 'Intenta con otro término.' : 'Cuando apruebes propiedades, aparecerán aquí.'}</div>
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Propiedad', 'Arrendador', 'Aprobado Por', 'Fecha y Hora de Aprobación'].map(th)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const foto = p.fotografias?.[0]?.url;
                const ubicacion = p.ubicacion ? `${p.ubicacion.sector ? p.ubicacion.sector + ', ' : ''}${p.ubicacion.direccion_referencial || 'Manta'}` : 'Manta';
                return (
                  <tr key={p.id_inmueble} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {foto ? (
                          <img src={foto} alt={p.titulo} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #E5E7EB', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FDF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={20} color={WINE} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{p.titulo}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{ubicacion}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span style={{ background: '#F3F4F6', color: '#374151', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>{TIPO_LABELS[p.tipo] ?? p.tipo}</span>
                            <span style={{ background: '#ECFDF5', color: '#059669', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>Publicada</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {p.arrendador ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FDF2F8', border: `1px solid ${WINE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WINE, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{getInitials(p.arrendador.nombres)}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.arrendador.nombres}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.arrendador.correo}</div>
                          </div>
                        </div>
                      ) : <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {p.aprobador ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                            <ShieldCheck size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>{p.aprobador.nombres}</div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#2563EB', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, marginTop: 2 }}>
                              <ShieldCheck size={9} /> Administrador
                            </span>
                          </div>
                        </div>
                      ) : <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Sin registrar</span>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={15} color={p.aprobado_en ? '#10B981' : '#D1D5DB'} style={{ flexShrink: 0 }} />
                        {p.aprobado_en ? (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>{formatDateTime(p.aprobado_en)}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Aprobada antes del historial</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default HistorialAprobaciones;
