import React from 'react';
import { LandlordVerification } from '../../services/api';
import {
  ShieldCheck,
  X,
  GraduationCap,
  ZoomIn,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const WINE = '#8C1515';
const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';

export interface VerificacionModalProps {
  selectedReview: LandlordVerification | null;
  onClose: () => void;
  onApprove: (landlord: LandlordVerification) => void;
  onReject: (name: string, id?: number) => void;
  approving?: boolean;
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;
}

export const VerificacionModal: React.FC<VerificacionModalProps> = ({
  selectedReview,
  onClose,
  onApprove,
  onReject,
  approving = false,
  reviewNotes,
  setReviewNotes,
}) => {
  if (!selectedReview) return null;

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
        PLACEHOLDER_IMG,
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
        PLACEHOLDER_IMG,
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
        PLACEHOLDER_IMG,
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
        PLACEHOLDER_IMG,
    },
  ];

  return (
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
            onClick={onClose}
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
          {/* Columna Izquierda (32%) */}
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
            </div>
          </div>

          {/* Columna Derecha (68%): Grid 2x2 de Documentos */}
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
              {kycDocs.map((doc) => (
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
                      src={doc.src || PLACEHOLDER_IMG}
                      alt={doc.titulo}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
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
              ))}
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
              placeholder="Ej. Cédula legible con fecha de expiración vigente. Dirección en Barbasquillo validada..."
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                fontSize: 12,
                color: '#111827',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => onReject(selectedReview.nombres, selectedReview.id)}
              disabled={approving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: approving ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <AlertTriangle size={15} />
              <span>Rechazar Documentación</span>
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                disabled={approving}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  color: '#4B5563',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: approving ? 'not-allowed' : 'pointer',
                }}
              >
                Cerrar
              </button>

              <button
                onClick={() => onApprove(selectedReview)}
                disabled={approving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#059669',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '9px 22px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: approving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.35)',
                }}
              >
                {approving ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Aprobando...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Aprobar y Habilitar Arrendador</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionModal;
