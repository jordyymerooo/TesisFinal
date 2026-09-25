import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Building2,
  User,
  Calendar,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import { getAdminReportes, updateReporteEstado } from '../../services/api';

const WINE = '#8C1515';

export interface ReporteItem {
  id: number;
  estudiante_id: number;
  arrendador_id: number;
  inmueble_id?: number | null;
  motivo: string;
  descripcion?: string | null;
  estado: 'pendiente' | 'resuelto' | 'descartado';
  created_at: string;
  updated_at: string;
  estudiante?: {
    id_usuario: number;
    nombres: string;
    correo: string;
    foto_perfil_url?: string;
  };
  arrendador?: {
    id_usuario: number;
    nombres: string;
    correo: string;
    foto_perfil_url?: string;
  };
  inmueble?: {
    id_inmueble: number;
    titulo: string;
    precio: number | string;
    tipo: string;
  };
}

export function Denuncias() {
  const [reportes, setReportes] = useState<ReporteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'pendiente' | 'resuelto' | 'descartado'>('todos');
  const [selectedReporte, setSelectedReporte] = useState<ReporteItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const data = await getAdminReportes();
      setReportes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[Denuncias] Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const handleCambiarEstado = async (id: number, nuevoEstado: 'resuelto' | 'descartado' | 'pendiente') => {
    setUpdatingId(id);
    try {
      await updateReporteEstado(id, nuevoEstado);
      setReportes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
      );
      if (selectedReporte && selectedReporte.id === id) {
        setSelectedReporte((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
      }
      setActionMessage({
        text: `Reporte #${id} marcado como "${nuevoEstado}".`,
        type: 'success',
      });
      // Notificar al Sidebar para actualizar el contador
      window.dispatchEvent(new CustomEvent('reportes-updated'));
    } catch (err: any) {
      setActionMessage({
        text: err?.response?.data?.message || 'Error al actualizar el reporte.',
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filtrado reactivo
  const filteredReportes = reportes.filter((r) => {
    const matchesEstado = filterEstado === 'todos' || r.estado === filterEstado;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesEstado;

    const estudiante = r.estudiante?.nombres?.toLowerCase() || '';
    const estudianteCorreo = r.estudiante?.correo?.toLowerCase() || '';
    const arrendador = r.arrendador?.nombres?.toLowerCase() || '';
    const arrendadorCorreo = r.arrendador?.correo?.toLowerCase() || '';
    const inmueble = r.inmueble?.titulo?.toLowerCase() || '';
    const motivo = r.motivo?.toLowerCase() || '';
    const desc = r.descripcion?.toLowerCase() || '';

    const matchesSearch =
      estudiante.includes(query) ||
      estudianteCorreo.includes(query) ||
      arrendador.includes(query) ||
      arrendadorCorreo.includes(query) ||
      inmueble.includes(query) ||
      motivo.includes(query) ||
      desc.includes(query);

    return matchesEstado && matchesSearch;
  });

  const pendientesCount = reportes.filter((r) => r.estado === 'pendiente').length;
  const resueltosCount = reportes.filter((r) => r.estado === 'resuelto').length;
  const descartadosCount = reportes.filter((r) => r.estado === 'descartado').length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Encabezado y Estadísticas Rápidas ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={20} color={WINE} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Gestión de Denuncias y Reportes
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Revisión y resolución de reportes emitidos por estudiantes de la ULEAM sobre alojamientos o arrendadores.
          </p>
        </div>

        <button
          onClick={fetchReportes}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 10,
            border: '1px solid #D1D5DB',
            background: '#FFFFFF',
            color: '#374151',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Alerta de feedback */}
      {actionMessage && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: 20,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: actionMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: actionMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${actionMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tarjetas de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            background: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 14,
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Total de Denuncias</span>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '6px 0 0' }}>
            {reportes.length}
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 14,
            border: '1px solid #FDE68A',
            backgroundColor: '#FFFDF5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#92400E', fontWeight: 700 }}>Pendientes de Revisión</span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#F59E0B',
                boxShadow: '0 0 6px #F59E0B',
              }}
            />
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#B45309', margin: '6px 0 0' }}>
            {pendientesCount}
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 14,
            border: '1px solid #A7F3D0',
            backgroundColor: '#F6FEF9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: 12, color: '#065F46', fontWeight: 700 }}>Casos Resueltos</span>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#047857', margin: '6px 0 0' }}>
            {resueltosCount}
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 14,
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 600 }}>Descartados / Sin Falta</span>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#6B7280', margin: '6px 0 0' }}>
            {descartadosCount}
          </p>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros de Estado ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F9FAFB',
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            flex: 1,
            maxWidth: 420,
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Buscar por estudiante, arrendador o inmueble..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              color: '#111827',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botones de Filtro por Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(['todos', 'pendiente', 'resuelto', 'descartado'] as const).map((est) => {
            const isActive = filterEstado === est;
            const labels = {
              todos: 'Todos',
              pendiente: 'Pendientes',
              resuelto: 'Resueltos',
              descartado: 'Descartados',
            };
            return (
              <button
                key={est}
                onClick={() => setFilterEstado(est)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? `1px solid ${WINE}` : '1px solid #E5E7EB',
                  background: isActive ? WINE : '#F9FAFB',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {labels[est]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabla de Denuncias ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px' }}>Fecha</th>
                <th style={{ padding: '14px 18px' }}>Denunciante (Estudiante)</th>
                <th style={{ padding: '14px 18px' }}>Reportado</th>
                <th style={{ padding: '14px 18px' }}>Motivo & Detalle</th>
                <th style={{ padding: '14px 18px' }}>Estado</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <RefreshCw size={24} className="animate-spin" color={WINE} />
                      <span>Cargando reportes del sistema...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReportes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={32} color="#10B981" />
                      <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                        No hay reportes {filterEstado !== 'todos' ? `con estado "${filterEstado}"` : ''}
                      </p>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        {searchQuery ? 'Prueba cambiando los criterios de búsqueda.' : 'La plataforma no cuenta con denuncias pendientes en este momento.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReportes.map((reporte) => {
                  const isUpdating = updatingId === reporte.id;

                  return (
                    <tr
                      key={reporte.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                      {/* Fecha */}
                      <td style={{ padding: '14px 18px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} color="#9CA3AF" />
                          <span>{formatDate(reporte.created_at)}</span>
                        </div>
                      </td>

                      {/* Denunciante */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              fontWeight: 700,
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              border: '1px solid #DBEAFE',
                            }}
                          >
                            {reporte.estudiante?.foto_perfil_url ? (
                              <img
                                src={reporte.estudiante.foto_perfil_url}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span>{(reporte.estudiante?.nombres || 'E')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                              {reporte.estudiante?.nombres || 'Estudiante'}
                            </p>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>
                              {reporte.estudiante?.correo || `ID: ${reporte.estudiante_id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reportado */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          {reporte.inmueble ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <Building2 size={14} color="#4B5563" />
                              <span style={{ fontWeight: 700, color: '#111827' }}>
                                {reporte.inmueble.titulo}
                              </span>
                            </div>
                          ) : null}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={12} color="#9CA3AF" />
                            <span style={{ fontSize: 12, color: '#4B5563' }}>
                              Arrendador: <strong>{reporte.arrendador?.nombres || `ID ${reporte.arrendador_id}`}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Motivo & Descripción */}
                      <td style={{ padding: '14px 18px', maxWidth: 280 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#FEF2F2',
                              color: '#991B1B',
                              border: '1px solid #FECACA',
                              width: 'fit-content',
                            }}
                          >
                            ⚠️ {reporte.motivo}
                          </span>
                          {reporte.descripcion ? (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: '#4B5563',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 260,
                              }}
                            >
                              "{reporte.descripcion}"
                            </p>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                              Sin comentarios adicionales
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedReporte(reporte)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#2563EB',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                              textAlign: 'left',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                              marginTop: 2,
                            }}
                          >
                            Ver detalles completos
                          </button>
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 18px' }}>
                        {reporte.estado === 'pendiente' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#FFFBEB',
                              color: '#B45309',
                              border: '1px solid #FDE68A',
                            }}
                          >
                            <Clock size={12} />
                            Pendiente
                          </span>
                        )}
                        {reporte.estado === 'resuelto' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#ECFDF5',
                              color: '#047857',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Resuelto
                          </span>
                        )}
                        {reporte.estado === 'descartado' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#F3F4F6',
                              color: '#4B5563',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            <XCircle size={12} />
                            Descartado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {reporte.estado === 'pendiente' ? (
                            <>
                              <button
                                onClick={() => handleCambiarEstado(reporte.id, 'resuelto')}
                                disabled={isUpdating}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  background: '#10B981',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.15s ease',
                                }}
                                title="Marcar como Resuelto"
                              >
                                <Check size={13} />
                                Resuelto
                              </button>
                              <button
                                onClick={() => handleCambiarEstado(reporte.id, 'descartado')}
                                disabled={isUpdating}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: '1px solid #D1D5DB',
                                  background: '#FFFFFF',
                                  color: '#4B5563',
                                  cursor: 'pointer',
                                }}
                                title="Descartar reporte"
                              >
                                <X size={13} />
                                Descartar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCambiarEstado(reporte.id, 'pendiente')}
                              disabled={isUpdating}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                border: '1px solid #D1D5DB',
                                background: '#F9FAFB',
                                color: '#4B5563',
                                cursor: 'pointer',
                              }}
                              title="Reabrir caso como pendiente"
                            >
                              Reabrir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Detalle Completo de la Denuncia ── */}
      {selectedReporte && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
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
              borderRadius: 16,
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F9FAFB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={20} color={WINE} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    Detalle de Denuncia #{selectedReporte.id}
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Registrado el {formatDate(selectedReporte.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReporte(null)}
                style={{
                  border: 'none',
                  background: '#E5E7EB',
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Motivo */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Motivo de la Denuncia
                </label>
                <div
                  style={{
                    marginTop: 6,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>{selectedReporte.motivo}</span>
                </div>
              </div>

              {/* Declaración / Descripción del Estudiante */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Descripción de los Hechos
                </label>
                <div
                  style={{
                    marginTop: 6,
                    padding: '14px',
                    borderRadius: 10,
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    fontSize: 13,
                    color: '#1F2937',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedReporte.descripcion || 'El estudiante no proporcionó detalles adicionales por escrito.'}
                </div>
              </div>

              {/* Información de las partes involucradas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Estudiante Denunciante
                  </span>
                  <p style={{ margin: '6px 0 2px', fontWeight: 700, fontSize: 13, color: '#111827' }}>
                    {selectedReporte.estudiante?.nombres || 'Desconocido'}
                  </p>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    {selectedReporte.estudiante?.correo}
                  </span>
                </div>

                <div style={{ padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Arrendador Reportado
                  </span>
                  <p style={{ margin: '6px 0 2px', fontWeight: 700, fontSize: 13, color: '#111827' }}>
                    {selectedReporte.arrendador?.nombres || 'Desconocido'}
                  </p>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    {selectedReporte.arrendador?.correo}
                  </span>
                </div>
              </div>

              {/* Inmueble si aplica */}
              {selectedReporte.inmueble && (
                <div style={{ padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Inmueble Involucrado
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111827' }}>
                        {selectedReporte.inmueble.titulo}
                      </p>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        Tipo: {selectedReporte.inmueble.tipo} • Tarifa: ${selectedReporte.inmueble.precio}/mes
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F9FAFB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Estado actual:</span>
                <strong style={{ fontSize: 12, textTransform: 'capitalize', color: '#111827' }}>
                  {selectedReporte.estado}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleCambiarEstado(selectedReporte.id, 'descartado')}
                  disabled={updatingId === selectedReporte.id}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  Descartar Denuncia
                </button>
                <button
                  onClick={() => handleCambiarEstado(selectedReporte.id, 'resuelto')}
                  disabled={updatingId === selectedReporte.id}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    background: '#10B981',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Marcar como Resuelto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Denuncias;
