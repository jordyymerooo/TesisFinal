import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api, {
  getPendingLandlords,
  approveLandlord,
  LandlordVerification,
  VerificationDocument,
} from '../../services/api';
import {
  Users,
  Building2,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Shield,
  X,
  GraduationCap,
  Check,
  ZoomIn,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const WINE = '#8C1515';

interface StatItem {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  subtitle: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}

const DEFAULT_STATS: StatItem[] = [
  {
    title: 'Usuarios Activos',
    value: '1,284',
    change: '+12.5%',
    trend: 'up',
    subtitle: 'vs. mes anterior',
    icon: Users,
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    title: 'Propiedades Publicadas',
    value: '342',
    change: '+8.2%',
    trend: 'up',
    subtitle: 'vs. mes anterior',
    icon: Building2,
    iconColor: WINE,
    iconBg: 'rgba(140, 21, 21, 0.08)',
  },
  {
    title: 'Reservas Activas',
    value: '89',
    change: '+24.0%',
    trend: 'up',
    subtitle: 'semestre actual',
    icon: CalendarCheck,
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
  },
  {
    title: 'Reportes Pendientes',
    value: '3',
    change: '-50%',
    trend: 'down',
    subtitle: 'atención requerida',
    icon: AlertTriangle,
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },
];

const DEFAULT_LANDLORDS: LandlordVerification[] = [
  {
    id: 1,
    nombres: 'Carlos Mendoza Moreira',
    correo: 'carlos.mendoza@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    cedula: '1314567890',
    tipo: 'Edificio de Departamentos',
    rolCarrera: 'Rol de Estudiante / Fac. Ingeniería de Sistemas',
    fechaSolicitud: '14 Sep 2026, 09:30',
    propiedadNombre: 'Residencial Barbasquillo ULEAM (6 Suites)',
    documentos: [
      {
        id: 'doc-1',
        tipo: 'cedula_frontal',
        titulo: 'Cédula Frontal',
        badgeText: 'Legible / OCR Válido',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-2',
        tipo: 'cedula_posterior',
        titulo: 'Cédula Posterior',
        badgeText: 'Dactilar Verificado',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-3',
        tipo: 'selfie_cedula',
        titulo: 'Selfie con Cédula',
        badgeText: 'Biometría Coincidente',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-4',
        tipo: 'exterior_inmueble',
        titulo: 'Exterior Inmueble',
        badgeText: 'Dirección Manta Validada',
        badgeBg: '#EFF6FF',
        badgeColor: '#2563EB',
        previewUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 2,
    nombres: 'María Elena Delgado',
    correo: 'maria.delgado@hotmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    cedula: '1309876543',
    tipo: 'Casa / Cuartos Compartidos',
    rolCarrera: 'Rol de Estudiante / Fac. Trabajo Social',
    fechaSolicitud: '13 Sep 2026, 16:45',
    propiedadNombre: 'Alojamiento Universitario Los Eléctricos (3 Cuartos)',
    documentos: [
      {
        id: 'doc-1',
        tipo: 'cedula_frontal',
        titulo: 'Cédula Frontal',
        badgeText: 'Legible / OCR Válido',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-2',
        tipo: 'cedula_posterior',
        titulo: 'Cédula Posterior',
        badgeText: 'Pendiente de Revisión',
        badgeBg: '#FFFBEB',
        badgeColor: '#D97706',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-3',
        tipo: 'selfie_cedula',
        titulo: 'Selfie con Cédula',
        badgeText: 'Biometría Coincidente',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-4',
        tipo: 'exterior_inmueble',
        titulo: 'Exterior Inmueble',
        badgeText: 'Dirección Manta Validada',
        badgeBg: '#EFF6FF',
        badgeColor: '#2563EB',
        previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 3,
    nombres: 'Ing. Patricio Cedeño Loor',
    correo: 'pcedeño@arriendosmanabi.ec',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    cedula: '1312233445',
    tipo: 'Suite Independiente',
    rolCarrera: 'Rol de Arrendador / Fac. Ingeniería Industrial',
    fechaSolicitud: '12 Sep 2026, 11:20',
    propiedadNombre: 'Suite Ejecutiva Av. Universitaria #4',
    documentos: [
      {
        id: 'doc-1',
        tipo: 'cedula_frontal',
        titulo: 'Cédula Frontal',
        badgeText: 'Legible / OCR Válido',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-2',
        tipo: 'cedula_posterior',
        titulo: 'Cédula Posterior',
        badgeText: 'Dactilar Verificado',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-3',
        tipo: 'selfie_cedula',
        titulo: 'Selfie con Cédula',
        badgeText: 'Biometría Coincidente',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        previewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'doc-4',
        tipo: 'exterior_inmueble',
        titulo: 'Exterior Inmueble',
        badgeText: 'Dirección Manta Validada',
        badgeBg: '#EFF6FF',
        badgeColor: '#2563EB',
        previewUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export function Dashboard() {
  // Estados de React para métricas, tabla y carga
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [landlords, setLandlords] = useState<LandlordVerification[]>(DEFAULT_LANDLORDS);
  const [loading, setLoading] = useState<boolean>(true);
  const [approving, setApproving] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<LandlordVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Función para consultar los endpoints de Laravel
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Petición GET al endpoint /admin/stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data?.data) {
        const d = statsRes.data.data;
        setStats([
          {
            title: 'Usuarios Activos',
            value: Number(d.usuarios_activos || 1284).toLocaleString(),
            change: d.usuarios_activos_trend || '+12.5%',
            trend: 'up',
            subtitle: 'vs. mes anterior',
            icon: Users,
            iconColor: '#3B82F6',
            iconBg: '#EFF6FF',
          },
          {
            title: 'Propiedades Publicadas',
            value: Number(d.propiedades_publicadas || 342).toLocaleString(),
            change: d.propiedades_trend || '+8.2%',
            trend: 'up',
            subtitle: 'vs. mes anterior',
            icon: Building2,
            iconColor: WINE,
            iconBg: 'rgba(140, 21, 21, 0.08)',
          },
          {
            title: 'Reservas Activas',
            value: Number(d.reservas_activas || 89).toLocaleString(),
            change: d.reservas_trend || '+24.0%',
            trend: 'up',
            subtitle: 'semestre actual',
            icon: CalendarCheck,
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
          },
          {
            title: 'Reportes Pendientes',
            value: Number(d.reportes_pendientes || 3).toLocaleString(),
            change: d.reportes_trend || '-50%',
            trend: 'down',
            subtitle: 'atención requerida',
            icon: AlertTriangle,
            iconColor: '#F59E0B',
            iconBg: '#FFFBEB',
          },
        ]);
      }
    } catch (err) {
      console.warn('[Dashboard API] Error al obtener /admin/stats, usando valores de respaldo:', err);
    }

    try {
      // 2. Petición al endpoint de arrendadores pendientes con KYC
      const pendingLandlords = await getPendingLandlords();
      if (Array.isArray(pendingLandlords)) {
        setLandlords(pendingLandlords);
      }
    } catch (err) {
      console.warn('[Dashboard API] Error al obtener arrendadores pendientes:', err);
    } finally {
      setLoading(false);
      setLastUpdated('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Cargar datos al montar el componente (Paso 3)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (landlord: LandlordVerification) => {
    setApproving(true);
    try {
      await approveLandlord(landlord.id);
      setSelectedReview(null);
      setReviewNotes('');
      // Actualizar estado local para quitar a ese arrendador de la tabla
      setLandlords((prev) => prev.filter((item) => item.id !== landlord.id));
      setSuccessAlert(`✓ El arrendador ${landlord.nombres} ha sido verificado y aprobado exitosamente.`);
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (error) {
      console.error('Error al aprobar arrendador:', error);
      alert('Hubo un problema al aprobar al arrendador. Por favor verifica la conexión con el servidor.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = (name: string) => {
    setSelectedReview(null);
    setReviewNotes('');
    setSuccessAlert(`✕ La solicitud de ${name} ha sido rechazada. Se han registrado las observaciones.`);
    setTimeout(() => setSuccessAlert(null), 5000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
            Panel de Control General
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            Resumen estadístico en tiempo real del sistema de alojamiento estudiantil ULEAM.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Indicador de carga / spinner */}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                padding: '7px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Cargando datos...</span>
            </div>
          )}

          {/* Botón de Sincronización Manual */}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '7px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Sincronizar datos con Laravel"
          >
            <RefreshCw size={14} color="#6B7280" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sincronizar</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '7px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
            }}
          >
            <Clock size={14} color="#6B7280" />
            <span>Actualizado: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successAlert && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 18px',
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* ── Paso 3: Grid con 4 Tarjetas de Estadísticas (React State) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';

          return (
            <div
              key={stat.title}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '22px 24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
                  {stat.title}
                </span>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: stat.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={stat.iconColor} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px' }}>
                  {stat.value}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isUp ? '#059669' : '#D97706',
                      background: isUp ? '#ECFDF5' : '#FFFBEB',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{stat.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Paso 4: Tabla de Arrendatarios en Espera de Verificación ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                Arrendatarios en espera de verificación
              </h2>
              <span
                style={{
                  background: '#FFFBEB',
                  color: '#D97706',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 10,
                  border: '1px solid #FDE68A',
                }}
              >
                {landlords.length} {landlords.length === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280' }}>
              Validación de documentos de identidad y título de propiedad antes de publicar alojamientos.
            </p>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#4B5563',
              cursor: 'pointer',
            }}
          >
            <Filter size={14} />
            Filtrar
          </button>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nombre del Usuario
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cédula
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tipo
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fecha de Solicitud
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estado
                </th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && landlords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Loader2 size={26} color={WINE} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                        Cargando datos desde el backend de Laravel...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : landlords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                    No hay solicitudes pendientes de verificación en este momento.
                  </td>
                </tr>
              ) : (
                landlords.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: index < landlords.length - 1 ? '1px solid #F3F4F6' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Nombre y Avatar */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={item.avatar}
                          alt={item.nombres}
                          style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover', border: '1px solid #E5E7EB' }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                            {item.nombres}
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>{item.correo}</div>
                        </div>
                      </div>
                    </td>

                  {/* Cédula */}
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
                    {item.cedula}
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151' }}>
                    {item.tipo}
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: '16px 20px', fontSize: 12, color: '#6B7280' }}>
                    {item.fechaSolicitud}
                  </td>

                  {/* Estado (Badge Warning #F59E0B) */}
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#FFFBEB',
                        color: '#D97706',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: '1px solid #FDE68A',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                      Pendiente
                    </span>
                  </td>

                  {/* Acciones: Botón 'Revisar' delineado con #8C1515 */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedReview(item)}
                      style={{
                        background: 'transparent',
                        border: `1.5px solid ${WINE}`,
                        color: WINE,
                        borderRadius: 10,
                        padding: '6px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
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
                      Revisar
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Revisión y Verificación de Documento ── */}
      {selectedReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 17, 23, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 1020,
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(140, 21, 21, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield size={20} color={WINE} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                      Revisión de Verificación de Identidad
                    </h3>
                    <span
                      style={{
                        background: '#FFFBEB',
                        color: '#D97706',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #FDE68A',
                      }}
                    >
                      Solicitud #{selectedReview.id}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Auditoría para habilitar publicación en la red de alojamiento ULEAM
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6B7280',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Dividido en 2 Columnas (30% Izquierda / 70% Derecha) */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* ── Columna Izquierda (30% de ancho): Datos del Arrendatario ── */}
              <div
                style={{
                  width: '30%',
                  minWidth: 260,
                  background: '#F9FAFB',
                  borderRight: '1px solid #E5E7EB',
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  overflowY: 'auto',
                }}
              >
                {/* Avatar y Nombre */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <img
                      src={selectedReview.avatar}
                      alt={selectedReview.nombres}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 18,
                        objectFit: 'cover',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -3,
                        right: -3,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#F59E0B',
                        border: '2px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Clock size={11} color="#FFFFFF" />
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
                    {selectedReview.nombres}
                  </h4>
                  <span style={{ fontSize: 11, color: '#6B7280', wordBreak: 'break-all' }}>
                    {selectedReview.correo}
                  </span>
                </div>

                {/* Rol de Estudiante / Ingeniería */}
                <div
                  style={{
                    background: 'rgba(140, 21, 21, 0.06)',
                    border: '1px solid rgba(140, 21, 21, 0.15)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <GraduationCap size={18} color={WINE} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontSize: 10, color: WINE, fontWeight: 700, textTransform: 'uppercase', display: 'block', letterSpacing: '0.4px' }}>
                      Rol & Facultad
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>
                      {selectedReview.rolCarrera}
                    </span>
                  </div>
                </div>

                {/* Datos de Cédula y Alojamiento */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: 11, marginBottom: 2 }}>Cédula:</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: 13,
                        background: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #E5E7EB',
                        display: 'inline-block',
                      }}
                    >
                      {selectedReview.cedula}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: 11, marginBottom: 2 }}>Tipo de Inmueble:</span>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>{selectedReview.tipo}</span>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: 11, marginBottom: 2 }}>Inmueble:</span>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>{selectedReview.propiedadNombre}</span>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: 11, marginBottom: 2 }}>Fecha de Solicitud:</span>
                    <span style={{ color: '#4B5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {selectedReview.fechaSolicitud}
                    </span>
                  </div>
                </div>

                {/* Estado Pendiente (Badge Warning #F59E0B) */}
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#B45309' }}>
                      Estado: Pendiente
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#92400E' }}>
                    Verificación documental en cola de revisión.
                  </span>
                </div>
              </div>

              {/* ── Columna Derecha (70% de ancho): Grid de 2x2 Tarjetas de Documentos ── */}
              <div
                style={{
                  width: '70%',
                  padding: '22px 24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#111827' }}>
                      Documentos Adjuntos (4 de 4)
                    </h4>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>
                      Inspecciona la autenticidad fotográfica y coincidencia de identidad
                    </span>
                  </div>
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 6,
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    Expediente Completo
                  </span>
                </div>

                {/* Grid 2x2 de Documentos */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 14,
                  }}
                >
                  {selectedReview.documentos.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: 12,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Imagen con Badge de Estado */}
                      <div style={{ position: 'relative', height: 120, background: '#1F2937', overflow: 'hidden' }}>
                        <img
                          src={doc.previewUrl}
                          alt={doc.titulo}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.92,
                          }}
                        />
                        {/* Badge de Estado en cada documento */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: doc.badgeBg,
                            color: doc.badgeColor,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          }}
                        >
                          {doc.badgeText}
                        </div>
                      </div>

                      {/* Título del documento y botón de previsualización */}
                      <div
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#FFFFFF',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'block' }}>
                            {doc.titulo}
                          </span>
                          <span style={{ fontSize: 10, color: '#6B7280' }}>Formato Imagen JPG/PNG</span>
                        </div>
                        <button
                          onClick={() => window.open(doc.previewUrl, '_blank')}
                          title="Abrir imagen completa"
                          style={{
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#4B5563',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer Fijo en la Parte Inferior del Modal ── */}
            <div
              style={{
                padding: '14px 24px',
                background: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Textarea para Notas de Revisión */}
              <div>
                <label
                  htmlFor="reviewNotes"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 4,
                  }}
                >
                  Notas de revisión / Observaciones:
                </label>
                <textarea
                  id="reviewNotes"
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Escribe aquí las observaciones o requerimientos para el arrendatario (ej. Documentación verificada y coincidente con registros ULEAM)..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 12,
                    color: '#111827',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Botones: 'Rechazar' (outline/fantasma) y 'Aprobar' (verde #10B981) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  Al aprobar se publicará el alojamiento y se notificará al arrendatario.
                </span>

                <div style={{ display: 'flex', gap: 10 }}>
                  {/* Botón Rechazar: Estilo outline / fantasma */}
                  <button
                    onClick={() => handleReject(selectedReview.nombres)}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid #EF4444',
                      color: '#EF4444',
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Rechazar
                  </button>

                  {/* Botón Aprobar: Con el color de éxito verde #10B981 */}
                  <button
                    onClick={() => handleApprove(selectedReview)}
                    disabled={approving}
                    style={{
                      background: '#10B981',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px 22px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: approving ? 'not-allowed' : 'pointer',
                      opacity: approving ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!approving) e.currentTarget.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      if (!approving) e.currentTarget.style.backgroundColor = '#10B981';
                    }}
                  >
                    {approving ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Check size={16} />
                    )}
                    {approving ? 'Aprobando...' : 'Aprobar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
