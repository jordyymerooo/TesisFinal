import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import {
  getPendingProperties,
  updatePropertyStatus,
  PendingProperty,
} from '../../services/api';

const WINE = '#8C1515';
const WINE_HOVER = '#6B1010';
const WINE_LIGHT = 'rgba(140, 21, 21, 0.08)';

export function PropertiesApproval() {
  // ── Tab Superior Activo ──
  const [activeTab, setActiveTab] = useState<'approval' | 'users' | 'reports'>('approval');

  // ── Datos de Propiedades ──
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSearch, setFilterSearch] = useState<string>('');

  // ── Modal de Revisión ──
  const [selectedProperty, setSelectedProperty] = useState<PendingProperty | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Cargar propiedades desde la API ──
  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getPendingProperties();
      setProperties(data);
    } catch (err) {
      console.error('[PropertiesApproval] Error al cargar propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // ── Estadísticas calculadas ──
  const pendingCount = properties.filter((p) => p.estado === 'borrador' || p.estado === 'pendiente').length;
  const inReviewCount = properties.filter((p) => p.estado === 'en_revision').length;
  const approvedCount = properties.filter((p) => p.estado === 'publicado').length;
  const rejectedCount = properties.filter((p) => p.estado === 'rechazado').length;

  // ── Filtro de búsqueda ──
  const filteredProperties = properties.filter((p) => {
    const term = filterSearch.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(term) ||
      p.arrendador.nombres.toLowerCase().includes(term) ||
      p.direccion.toLowerCase().includes(term) ||
      String(p.id).includes(term)
    );
  });

  // ── Manejador de Aprobación / Rechazo ──
  const handleUpdateStatus = async (status: 'publicado' | 'rechazado') => {
    if (!selectedProperty) return;

    try {
      setActionLoading(true);
      await updatePropertyStatus(selectedProperty.id, status);

      // Actualizar estado local reactivamente
      setProperties((prev) =>
        prev.map((item) =>
          item.id === selectedProperty.id ? { ...item, estado: status } : item
        )
      );

      setNotification({
        message:
          status === 'publicado'
            ? `¡Propiedad #${selectedProperty.id} aprobada y publicada exitosamente en el mapa estudiantil!`
            : `Propiedad #${selectedProperty.id} ha sido rechazada.`,
        type: status === 'publicado' ? 'success' : 'error',
      });

      setModalOpen(false);
      setSelectedProperty(null);

      // Desvanecer notificación después de 4 segundos
      setTimeout(() => setNotification(null), 4000);
    } catch (error: any) {
      console.error('[PropertiesApproval] Error al actualizar estado:', error);
      alert(error?.message || 'Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* ── Notificación Toast Flotante ── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 32,
            zIndex: 9999,
            backgroundColor: notification.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${notification.type === 'success' ? '#10B981' : '#EF4444'}`,
            borderRadius: 12,
            padding: '14px 20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} color="#10B981" />
          ) : (
            <XCircle size={20} color="#EF4444" />
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: notification.type === 'success' ? '#065F46' : '#991B1B',
            }}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* ── Header Principal con Título y Contexto ULEAM ── */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                backgroundColor: WINE_LIGHT,
                color: WINE,
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              MÓDULO 4 · FIGMA
            </span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Gestión de Inmuebles Móviles</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
            Aprobación y Auditoría de Propiedades
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0 0' }}>
            Revisa, aprueba o rechaza los alojamientos enviados por los arrendadores antes de que aparezcan en el mapa estudiantil.
          </p>
        </div>

        <button
          onClick={loadProperties}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={15} color={WINE} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar Lista
        </button>
      </div>

      {/* ── Paso 1: Submenú Superior Tipo 'Tabs' ── */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          borderBottom: '1px solid #E5E7EB',
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => setActiveTab('approval')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'approval' ? `3px solid ${WINE}` : '3px solid transparent',
            color: activeTab === 'approval' ? WINE : '#6B7280',
            fontWeight: activeTab === 'approval' ? 800 : 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Building2 size={18} color={activeTab === 'approval' ? WINE : '#6B7280'} />
          Aprobación de Propiedades
          <span
            style={{
              backgroundColor: activeTab === 'approval' ? WINE : '#E5E7EB',
              color: activeTab === 'approval' ? '#FFFFFF' : '#4B5563',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
            }}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? `3px solid ${WINE}` : '3px solid transparent',
            color: activeTab === 'users' ? WINE : '#6B7280',
            fontWeight: activeTab === 'users' ? 800 : 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Users size={18} color={activeTab === 'users' ? WINE : '#6B7280'} />
          Gestión de Usuarios
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reports' ? `3px solid ${WINE}` : '3px solid transparent',
            color: activeTab === 'reports' ? WINE : '#6B7280',
            fontWeight: activeTab === 'reports' ? 800 : 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <AlertTriangle size={18} color={activeTab === 'reports' ? WINE : '#6B7280'} />
          Centro de Reportes
        </button>
      </div>

      {/* ── Paso 1 (Continuación): Barra de Estadísticas Rápidas ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Card 1: Pendientes */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pendientes
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Por revisar en el sistema</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#F59E0B" />
          </div>
        </div>

        {/* Card 2: En revisión */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              En Revisión
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6', marginTop: 4 }}>
              {inReviewCount}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Inspección documental</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={24} color="#3B82F6" />
          </div>
        </div>

        {/* Card 3: Aprobadas hoy */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Aprobadas Hoy
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
              {approvedCount}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Visibles en mapa móvil</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#10B981" />
          </div>
        </div>

        {/* Card 4: Rechazadas */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Rechazadas
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444', marginTop: 4 }}>
              {rejectedCount}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Por inconsistencias</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} color="#EF4444" />
          </div>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros de la Tabla ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px 16px 0 0',
          padding: '18px 24px',
          border: '1px solid #E5E7EB',
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 400 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '8px 14px',
              width: '100%',
            }}
          >
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Filtrar por título, ID o arrendador..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: '#111827',
                width: '100%',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            Mostrando {filteredProperties.length} de {properties.length} propiedades
          </span>
        </div>
      </div>

      {/* ── Paso 2: Tabla de Propiedades ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0 0 16px 16px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Foto
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Título del anuncio
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Arrendador
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Dirección
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Fecha
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Estado
              </th>
              <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <RefreshCw size={24} color={WINE} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#4B5563' }}>Cargando propiedades...</div>
                </td>
              </tr>
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <Building2 size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>No se encontraron propiedades</div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                    Todas las publicaciones han sido atendidas o no coinciden con la búsqueda.
                  </div>
                </td>
              </tr>
            ) : (
              filteredProperties.map((prop) => {
                const isPending = prop.estado === 'borrador' || prop.estado === 'pendiente';
                const isPublished = prop.estado === 'publicado';
                const isRejected = prop.estado === 'rechazado';

                return (
                  <tr
                    key={prop.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FDF8F8')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Columna 1: Foto (Miniatura) */}
                    <td style={{ padding: '14px 20px' }}>
                      <img
                        src={prop.foto_url}
                        alt={prop.titulo}
                        style={{
                          width: 54,
                          height: 44,
                          borderRadius: 8,
                          objectFit: 'cover',
                          border: '1px solid #E5E7EB',
                        }}
                      />
                    </td>

                    {/* Columna 2: Título del anuncio (con ID) */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#6B7280',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          #INM-{prop.id}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                          {prop.titulo}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: WINE, fontWeight: 700, marginTop: 3 }}>
                        ${prop.precio} <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>/ mes · {prop.tipo?.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {/* Columna 3: Arrendador (Avatar e iniciales) */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {prop.arrendador.avatar ? (
                          <img
                            src={prop.arrendador.avatar}
                            alt={prop.arrendador.nombres}
                            style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 17,
                              backgroundColor: WINE_LIGHT,
                              color: WINE,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {prop.arrendador.nombres
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
                            {prop.arrendador.nombres}
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>
                            {prop.arrendador.correo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Columna 4: Dirección */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' }}>
                        <MapPin size={14} color={WINE} style={{ flexShrink: 0 }} />
                        <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prop.direccion}
                        </span>
                      </div>
                    </td>

                    {/* Columna 5: Fecha */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                        <Calendar size={13} color="#9CA3AF" />
                        <span>{prop.fecha}</span>
                      </div>
                    </td>

                    {/* Columna 6: Estado (Badge) */}
                    <td style={{ padding: '14px 20px' }}>
                      {isPending && (
                        <span
                          style={{
                            backgroundColor: '#FFFBEB',
                            color: '#D97706',
                            border: '1px solid #FDE68A',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#D97706' }} />
                          Pendiente
                        </span>
                      )}

                      {isPublished && (
                        <span
                          style={{
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Check size={11} color="#059669" />
                          Publicado
                        </span>
                      )}

                      {isRejected && (
                        <span
                          style={{
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <X size={11} color="#DC2626" />
                          Rechazado
                        </span>
                      )}
                    </td>

                    {/* Columna 7: Acciones (Botón outline 'Revisar' en rojo vino) */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedProperty(prop);
                          setModalOpen(true);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          color: WINE,
                          border: `1.5px solid ${WINE}`,
                          borderRadius: 8,
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = WINE;
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = WINE;
                        }}
                      >
                        <Eye size={14} />
                        Revisar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paso 4: Modal de Revisión y Aprobación ── */}
      {modalOpen && selectedProperty && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 560,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            {/* Cabecera del Modal */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: WINE_LIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} color={WINE} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    Revisión de Alojamiento Estudiantil
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    ID: #INM-{selectedProperty.id} · Enviado desde App Arrendador
                  </span>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '24px' }}>
              {/* Imagen Principal */}
              <div style={{ position: 'relative', marginBottom: 18, borderRadius: 14, overflow: 'hidden' }}>
                <img
                  src={selectedProperty.foto_url}
                  alt={selectedProperty.titulo}
                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ${selectedProperty.precio} / mes
                </div>
              </div>

              {/* Título y Dirección */}
              <h4 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#111827' }}>
                {selectedProperty.titulo}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4B5563', marginBottom: 16 }}>
                <MapPin size={14} color={WINE} />
                <span>{selectedProperty.direccion}</span>
              </div>

              {/* Tarjeta del Arrendador */}
              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid #E5E7EB',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selectedProperty.arrendador.avatar ? (
                    <img
                      src={selectedProperty.arrendador.avatar}
                      alt={selectedProperty.arrendador.nombres}
                      style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: WINE,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {selectedProperty.arrendador.nombres
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      {selectedProperty.arrendador.nombres}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {selectedProperty.arrendador.correo}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShieldCheck size={12} color="#059669" />
                  Arrendador Verificado
                </div>
              </div>

              {/* Pregunta de Confirmación */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '12px 16px',
                  backgroundColor: WINE_LIGHT,
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: WINE,
                  marginBottom: 20,
                }}
              >
                ¿Deseas aprobar y publicar esta propiedad en el mapa móvil estudiantil?
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleUpdateStatus('rechazado')}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    color: '#EF4444',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: 10,
                    padding: '12px 0',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <X size={16} />
                  Rechazar
                </button>

                <button
                  onClick={() => handleUpdateStatus('publicado')}
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    backgroundColor: WINE,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 0',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(140, 21, 21, 0.25)',
                  }}
                >
                  {actionLoading ? (
                    <RefreshCw size={16} color="#FFFFFF" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <Check size={18} />
                      Aprobar y Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesApproval;
