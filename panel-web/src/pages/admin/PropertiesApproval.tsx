import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ClipboardList,
} from 'lucide-react';
import {
  getPendingProperties,
  updatePropertyStatus,
  deleteProperty,
  PendingProperty,
} from '../../services/api';

const WINE = '#8C1515';
const WINE_HOVER = '#6B1010';
const WINE_LIGHT = 'rgba(140, 21, 21, 0.08)';

export function PropertiesApproval() {
  // ── Tab Superior Activo ──
  const [activeTab, setActiveTab] = useState<'approval' | 'users' | 'reports'>('approval');
  const navigate = useNavigate();

  // ── Datos de Propiedades ──
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoActivo, setEstadoActivo] = useState('Todos'); // 'Todos', 'Pendiente', 'En Revision', 'Aprobado', 'Rechazado'
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginaActual(1);
  };

  const handleCardClick = (estado: string) => {
    if (estadoActivo === estado) {
      setEstadoActivo('Todos'); // Deseleccionar
    } else {
      setEstadoActivo(estado);
    }
    setPaginaActual(1); // Siempre regresar a la página 1 al filtrar
  };

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

  // ── Filtro de búsqueda, Tarjeta activa y Paginación ──
  const propiedadesFiltradas = properties.filter((prop) => {
    // 1. Filtro de búsqueda (título, arrendador, etc.)
    const searchLower = searchTerm.toLowerCase();
    const coincideTexto =
      !searchTerm ||
      prop.titulo?.toLowerCase().includes(searchLower) ||
      prop.id?.toString().toLowerCase().includes(searchLower) ||
      (prop as any).codigo?.toLowerCase().includes(searchLower) ||
      prop.arrendador?.nombres?.toLowerCase().includes(searchLower) ||
      prop.direccion?.toLowerCase().includes(searchLower);

    // 2. Filtro de la tarjeta activa
    let coincideEstado = estadoActivo === 'Todos';
    if (!coincideEstado) {
      const estadoProp = (prop.estado || '').toLowerCase();
      if (estadoActivo === 'Pendiente') {
        coincideEstado = estadoProp === 'pendiente' || estadoProp === 'borrador';
      } else if (estadoActivo === 'En Revision') {
        coincideEstado = estadoProp === 'en_revision' || estadoProp === 'en revision';
      } else if (estadoActivo === 'Aprobado') {
        coincideEstado = estadoProp === 'publicado' || estadoProp === 'aprobado';
      } else if (estadoActivo === 'Rechazado') {
        coincideEstado = estadoProp === 'rechazado';
      } else {
        coincideEstado = prop.estado === estadoActivo;
      }
    }

    return coincideTexto && coincideEstado;
  });

  const indiceUltimaProp = paginaActual * itemsPorPagina;
  const indicePrimeraProp = indiceUltimaProp - itemsPorPagina;
  const propiedadesPaginadas = propiedadesFiltradas.slice(indicePrimeraProp, indiceUltimaProp);
  const totalPaginas = Math.ceil(propiedadesFiltradas.length / itemsPorPagina);

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

  // ── Manejador para Eliminar Propiedad Publicada ──
  const handleEliminarPropiedad = async () => {
    if (!selectedProperty) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la propiedad #${selectedProperty.id} (${selectedProperty.titulo})?`
    );
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await deleteProperty(selectedProperty.id);

      // Remover de la lista reactivamente
      setProperties((prev) => prev.filter((p) => p.id !== selectedProperty.id));

      setNotification({
        message: `Propiedad #${selectedProperty.id} ha sido eliminada exitosamente.`,
        type: 'success',
      });

      setModalOpen(false);
      setSelectedProperty(null);

      setTimeout(() => setNotification(null), 4000);
    } catch (error: any) {
      console.error('[PropertiesApproval] Error al eliminar propiedad:', error);
      alert(error?.response?.data?.message || error?.message || 'Error al eliminar la propiedad.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Generar URL de Google Maps forzando PIN rojo exacto con coordenadas ──
  const getGoogleMapsUrl = (propiedad: any) => {
    // Ajusta 'latitud' y 'longitud' según cómo lleguen desde tu API de Laravel
    const lat = propiedad.latitud || propiedad.lat; 
    const lng = propiedad.longitud || propiedad.lng;

    if (lat && lng) {
      // Este formato fuerza un PIN rojo en las coordenadas exactas sin mostrar listas
      return `https://maps.google.com/?q=${lat},${lng}`;
    }

    // Fallback solo en caso de que la propiedad antigua no tenga coordenadas guardadas
    const query = encodeURIComponent(`${propiedad.direccion || propiedad.sector || ''}, Manta, Ecuador`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
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

        <button
          onClick={() => navigate('/propiedades/historial')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
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
          <ClipboardList size={15} color="#374151" />
          Historial de Aprobaciones
        </button>
      </div>

      {/* ── Paso 1: Barra de Estadísticas Rápidas (Filtros Interactivos) ── */}
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
          onClick={() => handleCardClick('Pendiente')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between ${
            estadoActivo === 'Pendiente'
              ? 'border-yellow-400 ring-2 ring-yellow-100 shadow-md'
              : 'border-gray-100 hover:shadow-md hover:border-yellow-200'
          }`}
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
          onClick={() => handleCardClick('En Revision')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between ${
            estadoActivo === 'En Revision'
              ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
              : 'border-gray-100 hover:shadow-md hover:border-blue-200'
          }`}
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
          onClick={() => handleCardClick('Aprobado')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between ${
            estadoActivo === 'Aprobado'
              ? 'border-green-400 ring-2 ring-green-100 shadow-md'
              : 'border-gray-100 hover:shadow-md hover:border-green-200'
          }`}
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
          onClick={() => handleCardClick('Rechazado')}
          className={`bg-white rounded-xl p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between ${
            estadoActivo === 'Rechazado'
              ? 'border-red-400 ring-2 ring-red-100 shadow-md'
              : 'border-gray-100 hover:shadow-md hover:border-red-200'
          }`}
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
              value={searchTerm}
              onChange={handleSearchChange}
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

        {estadoActivo !== 'Todos' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Filtro activo:</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor:
                  estadoActivo === 'Pendiente'
                    ? '#FEF3C7'
                    : estadoActivo === 'En Revision'
                    ? '#DBEAFE'
                    : estadoActivo === 'Aprobado'
                    ? '#D1FAE5'
                    : '#FEE2E2',
                color:
                  estadoActivo === 'Pendiente'
                    ? '#B45309'
                    : estadoActivo === 'En Revision'
                    ? '#1D4ED8'
                    : estadoActivo === 'Aprobado'
                    ? '#047857'
                    : '#B91C1C',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {estadoActivo === 'Pendiente'
                ? 'Pendientes'
                : estadoActivo === 'En Revision'
                ? 'En Revisión'
                : estadoActivo === 'Aprobado'
                ? 'Aprobadas'
                : 'Rechazadas'}
              <button
                onClick={() => {
                  setEstadoActivo('Todos');
                  setPaginaActual(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Quitar filtro"
              >
                <X size={12} />
              </button>
            </span>
          </div>
        )}
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
            ) : propiedadesFiltradas.length === 0 ? (
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
              propiedadesPaginadas.map((prop) => {
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

        {/* Footer Estándar de Paginación (Siempre visible) */}
        <div className="flex items-center justify-end px-6 py-4 bg-white border-t border-gray-100 rounded-b-xl w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1 || propiedadesFiltradas.length === 0}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Anterior
            </button>

            <div className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg border border-gray-100">
              {propiedadesFiltradas.length > 0 ? paginaActual : 0} / {totalPaginas || 1}
            </div>

            <button
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas || totalPaginas === 0 || propiedadesFiltradas.length === 0}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
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

            {/* Contenido Scrolleable del Modal */}
            <div className="overflow-y-auto max-h-[65vh] pr-2" style={{ padding: '24px 24px 0 24px' }}>
              {/* Galería de Imágenes (Carousel) */}
              <div className="flex overflow-x-auto snap-x gap-2 mb-4" style={{ paddingBottom: '8px' }}>
                {selectedProperty.fotos && selectedProperty.fotos.length > 0 ? (
                  selectedProperty.fotos.map((foto: any, index: number) => (
                    <div key={foto.id || index} className="relative shrink-0 snap-center">
                      <img
                        src={foto.url || foto.foto_url}
                        alt={`${selectedProperty.titulo} - Foto ${index + 1}`}
                        className="w-64 h-40 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold">
                          ${selectedProperty.precio} / mes
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="relative shrink-0 snap-center w-full">
                    <img
                      src={selectedProperty.foto_url}
                      alt={selectedProperty.titulo}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold">
                      ${selectedProperty.precio} / mes
                    </div>
                  </div>
                )}
              </div>

              {/* Título y Dirección */}
              <h4 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#111827' }}>
                {selectedProperty.titulo}
              </h4>
              {/* Dirección interactiva con enlace directo a Google Maps */}
              <div className="mb-4">
                <a
                  href={getGoogleMapsUrl(selectedProperty)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 p-2 -ml-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Ver ubicación en Google Maps"
                >
                  <MapPin size={18} className="text-red-600 mt-0.5 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-600 group-hover:underline flex items-center gap-1.5">
                      Ver ubicación en el mapa
                      <ExternalLink size={13} className="inline opacity-70 group-hover:opacity-100" />
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.sector && selectedProperty.referencia
                        ? `${selectedProperty.sector} - ${selectedProperty.referencia}`
                        : selectedProperty.direccion}
                    </p>
                  </div>
                </a>
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

              {/* Descripción */}
              <div className="mb-4">
                <h5 className="font-bold text-gray-800 text-sm mb-1">📝 Descripción del Alojamiento</h5>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedProperty.descripcion || 'No especificado'}
                </p>
              </div>

              {/* Reglas */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-800 text-sm mb-1">⚖️ Reglas y Normativas</h5>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedProperty.reglas || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Footer Fijo con Botones de Acción */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              {/* Renderizado Condicional de Acciones */}
              {selectedProperty.estado?.toLowerCase() === 'pendiente' ||
              selectedProperty.estado?.toLowerCase() === 'en_revision' ||
              selectedProperty.estado?.toLowerCase() === 'borrador' ? (
                <>
                  <div className="bg-red-50 p-3 rounded-lg text-center mb-4">
                    <p className="text-sm font-semibold text-red-800">
                      ¿Deseas aprobar y publicar esta propiedad en el mapa móvil estudiantil?
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleUpdateStatus('rechazado')}
                      disabled={actionLoading}
                      className="flex-1 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      ✕ Rechazar
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('publicado')}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : '✓ Aprobar y Publicar'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 p-3 rounded-lg text-center mb-4 border border-green-200">
                    <p className="text-sm font-semibold text-green-800 flex items-center justify-center gap-2">
                      <span>✓</span> Esta propiedad ya se encuentra publicada y visible.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setModalOpen(false)}
                      disabled={actionLoading}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cerrar Detalles
                    </button>
                    <button 
                      onClick={handleEliminarPropiedad}
                      disabled={actionLoading}
                      className="flex-1 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <><span>🗑️</span> Eliminar Publicación</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesApproval;
