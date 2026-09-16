import { X, CheckCircle, XCircle, User, CreditCard, Camera, Home, Eye } from "lucide-react";

const WINE = "#8C1515";

const DOC_SLOTS = [
  { icon: <CreditCard size={24} color="#3B82F6" />, label: "Cédula Frontal", bg: "#EFF6FF", borderColor: "#BFDBFE", img: null },
  { icon: <CreditCard size={24} color="#8B5CF6" />, label: "Cédula Posterior", bg: "#F5F3FF", borderColor: "#DDD6FE", img: null },
  { icon: <Camera size={24} color="#F59E0B" />, label: "Selfie con Cédula", bg: "#FFFBEB", borderColor: "#FDE68A", img: null },
  { icon: <Home size={24} color="#10B981" />, label: "Exterior del Inmueble", bg: "#ECFDF5", borderColor: "#A7F3D0", img: "https://images.unsplash.com/photo-1658874286769-ac34bec90fa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  { icon: <Eye size={24} color="#EF4444" />, label: "Interior del Inmueble", bg: "#FEF2F2", borderColor: "#FECACA", img: "https://images.unsplash.com/photo-1680492260834-11e9edc1c59a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
];

interface AdminVerificationModalProps {
  onClose: () => void;
}

export function AdminVerificationModal({ onClose }: AdminVerificationModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20,
        width: 900, maxHeight: "90vh",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        display: "flex", flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAFA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: `${WINE}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={20} color={WINE} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Verificación de Arrendatario</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Revisión de documentos e información personal</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color="#555" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", gap: 0 }}>
          {/* LEFT COLUMN – User Info (30%) */}
          <div style={{ width: "30%", background: "#FAFAFA", padding: "24px 22px", borderRight: "1px solid #f0f0f0", flexShrink: 0 }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, background: `${WINE}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `2.5px solid ${WINE}40` }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: WINE }}>MG</span>
              </div>
              <h3 style={{ margin: "12px 0 2px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>María González Torres</h3>
              <span style={{ fontSize: 12, padding: "3px 12px", background: "#FFFBEB", color: "#F59E0B", borderRadius: 20, fontWeight: 600 }}>● Pendiente</span>
            </div>

            {/* Info Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Cédula de Identidad", value: "1308456789", icon: <CreditCard size={14} color="#888" /> },
                { label: "Correo electrónico", value: "m.gonzalez@live.uleam.edu.ec", icon: <User size={14} color="#888" /> },
                { label: "Teléfono", value: "+593 98 765 4321", icon: <User size={14} color="#888" /> },
                { label: "Tipo de Usuario", value: "Arrendatario", icon: <User size={14} color="#888" /> },
                { label: "Fecha de Solicitud", value: "02 Mayo 2026", icon: <User size={14} color="#888" /> },
                { label: "Carrera", value: "Ingeniería en Sistemas", icon: <User size={14} color="#888" /> },
              ].map((field) => (
                <div key={field.label}>
                  <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: 0.5 }}>{field.label.toUpperCase()}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#333" }}>{field.value}</p>
                  <div style={{ height: 1, background: "#f0f0f0", marginTop: 10 }} />
                </div>
              ))}
            </div>

            {/* Status Badge */}
            <div style={{ marginTop: 20, padding: "12px 14px", background: "#FEF2F2", borderRadius: 12, border: "1px solid #FECACA" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#EF4444" }}>⚠ Atención</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>El usuario no ha verificado su correo institucional.</p>
            </div>
          </div>

          {/* RIGHT COLUMN – Documents (70%) */}
          <div style={{ flex: 1, padding: "24px 26px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Documentos adjuntos</h3>

            {/* Document Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {DOC_SLOTS.map((doc, i) => (
                <div
                  key={doc.label}
                  style={{
                    borderRadius: 14, border: `2px dashed ${doc.borderColor}`,
                    background: doc.img ? "#000" : doc.bg,
                    overflow: "hidden",
                    position: "relative",
                    height: i === 4 ? "auto" : 160,
                    gridColumn: i === 4 ? "span 1" : "auto",
                  }}
                >
                  {doc.img ? (
                    <>
                      <img src={doc.img} alt={doc.label} style={{ width: "100%", height: 160, objectFit: "cover", opacity: 0.85 }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "20px 14px 10px" }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff" }}>{doc.label}</p>
                        <span style={{ fontSize: 10, padding: "2px 8px", background: "#10B981", color: "#fff", borderRadius: 10, fontWeight: 600 }}>✓ Cargado</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 16 }}>
                      <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                        {doc.icon}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#555", textAlign: "center" }}>{doc.label}</p>
                      <span style={{ fontSize: 11, padding: "2px 8px", background: "#FEF2F2", color: "#EF4444", borderRadius: 10, fontWeight: 600 }}>✗ No cargado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#F8F9FA", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Documentos completos</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>2 / 5</span>
                </div>
                <div style={{ height: 6, background: "#e8eaed", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: "40%", background: "#10B981", borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", background: "#FAFAFA", display: "flex", alignItems: "flex-start", gap: 16 }}>
          {/* Notes */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Notas de revisión</label>
            <textarea
              placeholder="Escribe aquí las observaciones o motivo de decisión..."
              style={{
                width: "100%", padding: "10px 14px",
                background: "#fff", border: "1.5px solid #e8eaed",
                borderRadius: 10, fontSize: 13, color: "#555",
                resize: "none", height: 64, outline: "none",
                fontFamily: "'Inter', sans-serif", boxSizing: "border-box"
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", paddingBottom: 2, paddingTop: 22, flexShrink: 0 }}>
            <button onClick={onClose} style={{
              padding: "11px 22px", background: "#fff",
              border: `2px solid ${WINE}`, borderRadius: 10,
              color: WINE, fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <XCircle size={16} /> Rechazar Documentos
            </button>
            <button style={{
              padding: "11px 22px", background: "#10B981",
              border: "none", borderRadius: 10,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <CheckCircle size={16} /> Aprobar Arrendatario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
