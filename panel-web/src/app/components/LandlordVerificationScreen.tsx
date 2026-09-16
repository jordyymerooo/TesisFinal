import { useState } from "react";
import { ArrowLeft, Camera, CreditCard, User, Zap, CheckCircle, Upload, Compass, Heart, MessageCircle } from "lucide-react";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

type DocStatus = "pending" | "uploaded";

interface DocCard {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
}

const DOCS: DocCard[] = [
  {
    id: "cedula-front",
    label: "Cédula Frontal",
    sublabel: "Parte delantera visible",
    icon: <CreditCard size={28} />,
    accentColor: "#3B82F6",
    accentBg: "#EFF6FF",
  },
  {
    id: "cedula-back",
    label: "Cédula Posterior",
    sublabel: "Parte trasera visible",
    icon: <CreditCard size={28} style={{ transform: "scaleX(-1)" }} />,
    accentColor: "#8B5CF6",
    accentBg: "#F5F3FF",
  },
  {
    id: "selfie",
    label: "Selfie con Cédula",
    sublabel: "Rostro y cédula juntos",
    icon: <User size={28} />,
    accentColor: "#F59E0B",
    accentBg: "#FFFBEB",
  },
  {
    id: "utility",
    label: "Recibo de Luz/Agua",
    sublabel: "Máx. 3 meses de antigüedad",
    icon: <Zap size={28} />,
    accentColor: "#10B981",
    accentBg: "#ECFDF5",
  },
];

export function LandlordVerificationScreen() {
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>({
    "cedula-front": "pending",
    "cedula-back": "pending",
    selfie: "pending",
    utility: "pending",
  });
  const [submitted, setSubmitted] = useState(false);

  const uploadedCount = Object.values(docStatus).filter((s) => s === "uploaded").length;
  const allUploaded = uploadedCount === DOCS.length;

  const toggleDoc = (id: string) => {
    if (submitted) return;
    setDocStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "pending" ? "uploaded" : "pending",
    }));
  };

  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: "#F5F5F7",
        fontFamily: "'Inter', sans-serif",
        borderRadius: 44,
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        display: "flex",
        flexDirection: "column",
        border: "10px solid #1a1a1a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Status bar ── */}
      <div
        style={{
          background: "#fff",
          padding: "14px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[3, 2.5, 2, 1.5].map((h, i) => (
              <div
                key={i}
                style={{ width: 3, height: h * 3, background: i < 3 ? "#111" : "#ccc", borderRadius: 1, alignSelf: "flex-end" }}
              />
            ))}
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3 0.5 8 0.5C5.7 0.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z" fill="#111" />
            <path d="M8 5.5C9 5.5 9.9 5.9 10.6 6.6L12 5.2C10.9 4.1 9.5 3.5 8 3.5C6.5 3.5 5.1 4.1 4 5.2L5.4 6.6C6.1 5.9 7 5.5 8 5.5Z" fill="#111" />
            <circle cx="8" cy="9.5" r="1.5" fill="#111" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity="0.35" />
            <rect x="2" y="2" width="16" height="8" rx="2" fill="#111" />
            <path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6C24.5 5.6 23.8 4.8 23 4.5Z" fill="#111" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          padding: "12px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #F0F0F2",
        }}
      >
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "#F5F5F7",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color="#111" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>
            Verificar Cuenta
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#8E8E93" }}>Arrendador · Paso 1 de 1</p>
        </div>
        {/* Progress pill */}
        <div
          style={{
            padding: "4px 10px",
            background: uploadedCount === 0 ? "#F5F5F7" : allUploaded ? "#ECFDF5" : "#FFFBEB",
            borderRadius: 20,
            border: `1px solid ${uploadedCount === 0 ? "#E5E5EA" : allUploaded ? "#A7F3D0" : "#FDE68A"}`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: uploadedCount === 0 ? "#8E8E93" : allUploaded ? "#059669" : "#D97706",
            }}
          >
            {uploadedCount}/{DOCS.length}
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px" }}>

        {/* Banner informativo */}
        <div
          style={{
            background: `linear-gradient(135deg, ${WINE}10 0%, ${WINE}05 100%)`,
            border: `1px solid ${WINE}25`,
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: `${WINE}15`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <Camera size={18} color={WINE} />
          </div>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "-0.2px" }}>
              Verificación de identidad
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
              Para publicar propiedades, necesitamos verificar tu identidad y la dirección del inmueble.
            </p>
          </div>
        </div>

        {/* Sección título */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>Documentos requeridos</p>
          <div style={{ flex: 1, height: 1, background: "#E5E5EA" }} />
          <span style={{ fontSize: 11, color: "#8E8E93" }}>Toca para subir</span>
        </div>

        {/* Grid de tarjetas de documentos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {DOCS.map((doc) => {
            const isUploaded = docStatus[doc.id] === "uploaded";
            return (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                style={{
                  background: isUploaded ? "#ECFDF5" : "#fff",
                  border: isUploaded
                    ? "2px solid #A7F3D0"
                    : "2px dashed #D1D1D6",
                  borderRadius: 16,
                  padding: "20px 12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  cursor: submitted ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  minHeight: 130,
                  textAlign: "center",
                }}
              >
                {/* Check overlay when uploaded */}
                {isUploaded && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 20,
                      height: 20,
                      background: "#10B981",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle size={14} color="#fff" />
                  </div>
                )}

                {/* Icono */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: isUploaded ? "#D1FAE5" : doc.accentBg,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isUploaded ? "#059669" : doc.accentColor,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isUploaded ? <CheckCircle size={26} color="#059669" /> : doc.icon}
                </div>

                {/* Texto */}
                <div>
                  <p
                    style={{
                      margin: "0 0 3px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: isUploaded ? "#065F46" : "#111",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {doc.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: isUploaded ? "#059669" : "#8E8E93", lineHeight: 1.4 }}>
                    {doc.sublabel}
                  </p>
                </div>

                {/* Badge estado */}
                <div
                  style={{
                    padding: "3px 10px",
                    background: isUploaded ? "#D1FAE5" : "#F5F5F7",
                    borderRadius: 20,
                    border: `1px solid ${isUploaded ? "#A7F3D0" : "#E5E5EA"}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isUploaded ? "#059669" : "#8E8E93",
                    }}
                  >
                    {isUploaded ? "✓ Cargado" : "● Pendiente"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nota de seguridad */}
        <div
          style={{
            background: "#F5F5F7",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 14, marginTop: 1 }}>🔒</span>
          <p style={{ margin: 0, fontSize: 11, color: "#555", lineHeight: 1.6 }}>
            Tus documentos son almacenados con cifrado SSL y solo serán revisados por el equipo ULEAM.
            Tu información no se comparte con terceros.
          </p>
        </div>

        {/* Mensaje de éxito tras envío */}
        {submitted && (
          <div
            style={{
              marginTop: 16,
              background: "#ECFDF5",
              border: "1.5px solid #A7F3D0",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <CheckCircle size={20} color="#059669" />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                ¡Documentos enviados!
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#059669" }}>
                Revisión en 24-48 horas hábiles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA fijo al fondo ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 20px 20px",
          background: "linear-gradient(to top, #F5F5F7 70%, transparent)",
        }}
      >
        <button
          onClick={() => {
            if (!submitted) setSubmitted(true);
          }}
          disabled={submitted}
          style={{
            width: "100%",
            padding: "15px 24px",
            background: submitted
              ? "#10B981"
              : allUploaded
              ? WINE_DARK
              : `linear-gradient(135deg, ${WINE} 0%, ${WINE_DARK} 100%)`,
            borderRadius: 16,
            border: "none",
            cursor: submitted ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: submitted
              ? "0 4px 16px rgba(16,185,129,0.35)"
              : `0 4px 20px ${WINE}50`,
            transition: "all 0.3s ease",
          }}
        >
          {submitted ? (
            <CheckCircle size={18} color="#fff" />
          ) : (
            <Upload size={18} color="#fff" />
          )}
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.2px",
            }}
          >
            {submitted ? "Enviado a revisión ✓" : "Enviar a revisión"}
          </span>
        </button>

        {/* Nota de estado */}
        {!submitted && !allUploaded && (
          <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 11, color: "#8E8E93" }}>
            {uploadedCount === 0
              ? "Sube los 4 documentos para continuar"
              : `Faltan ${DOCS.length - uploadedCount} documento${DOCS.length - uploadedCount > 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{ height: 68 }} />
      <div
        style={{
          position: "absolute",
          bottom: 68,
          left: 0,
          right: 0,
          height: 58,
          background: "#fff",
          borderTop: "1px solid #F0F0F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 10px",
        }}
      >
        {[
          { icon: <Compass size={22} />, label: "Explorar" },
          { icon: <Heart size={22} />, label: "Favoritos" },
          { icon: <MessageCircle size={22} />, label: "Mensajes" },
          { icon: <User size={22} />, label: "Perfil", active: true },
        ].map((item) => (
          <button
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: item.active ? WINE : "#8E8E93",
              padding: "6px 12px",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
