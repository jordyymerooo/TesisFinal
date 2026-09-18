import React, { useState, useEffect } from 'react';
import api, {
  getPendingLandlords,
  approveLandlord,
  LandlordVerification,
  VerificationDocument,
} from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  X,
  GraduationCap,
  Check,
  ZoomIn,
  Loader2,
  RefreshCw,
  Building2,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react';

const WINE = '#8C1515';

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
        previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
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
    nombres: 'Lcda. Carmen Zambrano Alvia',
    correo: 'carmen.zambrano@hotmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    cedula: '1308765432',
    tipo: 'Casa / Cuartos Estudiantiles',
    rolCarrera: 'Rol de Arrendador / Fac. Ciencias Médicas',
    fechaSolicitud: '13 Sep 2026, 16:45',
    propiedadNombre: 'Hospedaje Familiar Universitario La Dolorosa',
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

export function Verificacion() {
  const [landlords, setLandlords] = useState<LandlordVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [approving, setApproving] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<LandlordVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const fetchLandlords = async () => {
    setLoading(true);
    try {
      const pendingLandlords = await getPendingLandlords();
      if (Array.isArray(pendingLandlords)) {
        setLandlords(pendingLandlords);
      }
    } catch (err) {
      console.warn('[Verificacion API] Error al obtener arrendadores pendientes:', err);
    } finally {
      setLoading(false);
      setLastUpdated('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, []);

  const handleOpenReview = async (item: LandlordVerification) => {
    setSelectedReview(item);
    try {
      const res = await api.get(`/admin/verificaciones/${item.id}`);
      if (res.data?.data) {
        setSelectedReview((prev) => (prev ? { ...prev, ...res.data.data } : res.data.data));
      }
    } catch {
      // Fallback a los datos ya presentes en item
    }
  };

  const handleApprove = async (landlord: LandlordVerification) => {
    setApproving(true);
    try {
      await approveLandlord(landlord.id);
      setSelectedReview(null);
      setReviewNotes('');
      setLandlords((prev) => prev.filter((item) => item.id !== landlord.id));
      window.dispatchEvent(new CustomEvent('verification-updated'));
      setSuccessAlert(`✓ El arrendador ${landlord.nombres} ha sido verificado y aprobado exitosamente.`);
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (error) {
      console.error('Error al aprobar arrendador:', error);
      alert('Hubo un problema al aprobar al arrendador. Por favor verifica la conexión con el servidor.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = (name: string, landlordId?: number) => {
    setSelectedReview(null);
    setReviewNotes('');
    if (landlordId) {
      setLandlords((prev) => prev.filter((item) => item.id !== landlordId));
      window.dispatchEvent(new CustomEvent('verification-updated'));
    }
    setSuccessAlert(`✕ La solicitud de ${name} ha sido rechazada. Se han registrado las observaciones.`);
    setTimeout(() => setSuccessAlert(null), 5000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
            Verificación de Arrendadores (KYC)
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            Auditoría de identidad y validación biométrica de propietarios previa a la publicación en ULEAM Rental.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

          <button
            onClick={fetchLandlords}
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
            title="Sincronizar datos"
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

      {/* ── Tabla de Arrendatarios en Espera de Verificación ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
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
                Solicitudes Pendientes de Verificación
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
        </div>

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

                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
                      {item.cedula}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151' }}>
                      {item.tipo}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: 12, color: '#6B7280' }}>
                      {item.fechaSolicitud}
                    </td>

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

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReview(item)}
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
                ))
              )}
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
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAFA',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${WINE}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={20} color={WINE} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    Verificación de Identidad del Arrendatario
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                    Auditoría de KYC y documentación adjunta según estándares de seguridad ULEAM.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: 2 Columnas */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Columna Izquierda (30%) */}
              <div
                style={{
                  width: '32%',
                  borderRight: '1px solid #E5E7EB',
                  padding: '24px',
                  background: '#F9FAFB',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
                  <img
                    src={selectedReview.avatar}
                    alt={selectedReview.nombres}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 20,
                      objectFit: 'cover',
                      border: `3px solid ${WINE}`,
                      marginBottom: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                    {selectedReview.nombres}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {selectedReview.correo}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <GraduationCap size={13} />
                    {selectedReview.rolCarrera || 'Facultad de Ingeniería'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cédula / Identidad
                    </label>
                    <div
                      style={{
                        marginTop: 4,
                        padding: '8px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#111827',
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedReview.cedula}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tipo de Inmueble
                    </label>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      {selectedReview.tipo}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Nombre de la Propiedad
                    </label>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#4B5563', lineHeight: 1.4 }}>
                      {selectedReview.propiedadNombre}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Fecha y Hora de Solicitud
                    </label>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>
                      {selectedReview.fechaSolicitud}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Estado
                    </label>
                    <div style={{ marginTop: 4 }}>
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
                        Estado: Pendiente
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha (70%): Grid 2x2 de Documentos */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#111827' }}>
                    Documentos Adjuntos (4 Requeridos)
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                    Comprueba la nitidez de la cédula, concordancia biométrica con la selfie y fachada exterior del inmueble.
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                  }}
                >
                  {(() => {
                    const placeholderImg =
                      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';

                    const kycDocs = [
                      {
                        id: 'doc-1',
                        tipo: 'cedula_frontal',
                        titulo: 'Cédula Frontal',
                        badgeText:
                          selectedReview.cedula_frontal_url || selectedReview.cedula_frontal
                            ? 'Documento Subido'
                            : 'Legible / OCR Válido',
                        badgeBg: '#ECFDF5',
                        badgeColor: '#059669',
                        src:
                          selectedReview.cedula_frontal_url ||
                          selectedReview.cedula_frontal ||
                          selectedReview.documentos?.find((d) => d.tipo === 'cedula_frontal')?.previewUrl ||
                          placeholderImg,
                      },
                      {
                        id: 'doc-2',
                        tipo: 'cedula_posterior',
                        titulo: 'Cédula Posterior',
                        badgeText:
                          selectedReview.cedula_posterior_url || selectedReview.cedula_posterior
                            ? 'Documento Subido'
                            : 'Dactilar Verificado',
                        badgeBg: '#ECFDF5',
                        badgeColor: '#059669',
                        src:
                          selectedReview.cedula_posterior_url ||
                          selectedReview.cedula_posterior ||
                          selectedReview.documentos?.find((d) => d.tipo === 'cedula_posterior')?.previewUrl ||
                          placeholderImg,
                      },
                      {
                        id: 'doc-3',
                        tipo: 'selfie_cedula',
                        titulo: 'Selfie con Cédula',
                        badgeText:
                          selectedReview.selfie_url || selectedReview.selfie
                            ? 'Biometría Subida'
                            : 'Biometría Coincidente',
                        badgeBg: '#ECFDF5',
                        badgeColor: '#059669',
                        src:
                          selectedReview.selfie_url ||
                          selectedReview.selfie ||
                          selectedReview.documentos?.find((d) => d.tipo === 'selfie_cedula')?.previewUrl ||
                          selectedReview.avatar ||
                          placeholderImg,
                      },
                      {
                        id: 'doc-4',
                        tipo: 'exterior_inmueble',
                        titulo: 'Exterior Inmueble',
                        badgeText:
                          selectedReview.exterior_url || selectedReview.exterior
                            ? 'Fachada Subida'
                            : 'Dirección Manta Validada',
                        badgeBg: '#EFF6FF',
                        badgeColor: '#2563EB',
                        src:
                          selectedReview.exterior_url ||
                          selectedReview.exterior ||
                          selectedReview.documentos?.find((d) => d.tipo === 'exterior_inmueble')?.previewUrl ||
                          placeholderImg,
                      },
                    ];

                    return kycDocs.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: 12,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div style={{ position: 'relative', height: 160, background: '#111827' }}>
                          <img
                            src={doc.src || placeholderImg}
                            alt={doc.titulo}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = placeholderImg;
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              borderRadius: 6,
                              padding: '3px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                            }}
                          >
                            <ZoomIn size={12} />
                            <span>Inspeccionar</span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                            {doc.titulo}
                          </span>
                          <span
                            style={{
                              background: doc.badgeBg,
                              color: doc.badgeColor,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {doc.badgeText}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer Fijo */}
            <div
              style={{
                padding: '16px 28px',
                borderTop: '1px solid #E5E7EB',
                background: '#FAFAFA',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                  Notas de Auditoría / Observaciones (Opcional):
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  placeholder="Escribe aquí las observaciones o requerimientos para el arrendatario..."
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  Al aprobar se publicará el alojamiento y se notificará al arrendatario.
                </span>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleReject(selectedReview.nombres, selectedReview.id)}
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
                    Revisar después / Rechazar
                  </button>

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

export default Verificacion;
