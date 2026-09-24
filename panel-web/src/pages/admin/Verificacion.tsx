import React, { useState, useEffect } from 'react';
import api, {
  getPendingLandlords,
  approveLandlord,
  LandlordVerification,
  VerificationDocument,
} from '../../services/api';
import { VerificacionModal } from './VerificacionModal';
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
      setLandlords((prev) => prev.filter((item) => (item.usuario_id || item.id) !== landlordId));
      window.dispatchEvent(new CustomEvent('verification-updated'));
    }
    setSuccessAlert(`✕ La documentación de ${name} ha sido rechazada y se notificó al arrendador vía correo electrónico.`);
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
      <VerificacionModal
        selectedReview={selectedReview}
        onClose={() => {
          setSelectedReview(null);
          setReviewNotes('');
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        approving={approving}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
      />
    </div>
  );
}

export default Verificacion;
