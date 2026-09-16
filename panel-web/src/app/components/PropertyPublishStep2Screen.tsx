import { useState } from "react";
import { ArrowLeft, Camera, Plus, X, Wifi, Zap, Droplets, UtensilsCrossed, Sofa, Check, Rocket, Star } from "lucide-react";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

const MOCK_PHOTOS = [
  {
    id: "p1",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    label: "Sala principal",
    detail: "Amplia y luminosa",
  },
  {
    id: "p2",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    label: "Habitación",
    detail: "Cama 2 plazas",
  },
  {
    id: "p3",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    label: "Baño",
    detail: "Completo",
  },
];

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const SERVICES: Service[] = [
  { id: "agua", label: "Agua", icon: <Droplets size={14} />, color: "#3B82F6", bg: "#EFF6FF" },
  { id: "luz", label: "Luz", icon: <Zap size={14} />, color: "#F59E0B", bg: "#FFFBEB" },
  { id: "internet", label: "Internet", icon: <Wifi size={14} />, color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "amoblado", label: "Amoblado", icon: <Sofa size={14} />, color: "#10B981", bg: "#ECFDF5" },
  { id: "cocina", label: "Cocina", icon: <UtensilsCrossed size={14} />, color: "#EC4899", bg: "#FDF2F8" },
];

export function PropertyPublishStep2Screen() {
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [selectedServices, setSelectedServices] = useState<string[]>(["agua", "internet"]);
  const [published, setPublished] = useState(false);
  const [uploadHover, setUploadHover] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: "#fff",
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
      <div style={{ background: "#fff", padding: "14px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[3, 2.5, 2, 1.5].map((h, i) => (
              <div key={i} style={{ width: 3, height: h * 3, background: i < 3 ? "#111" : "#ccc", borderRadius: 1, alignSelf: "flex-end" }} />
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
      <div style={{ background: "#fff", padding: "12px 20px 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button style={{ width: 38, height: 38, borderRadius: 12, background: "#F5F5F7", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} color="#111" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>Publicar Propiedad</p>
        </div>
        <div style={{ padding: "4px 12px", background: `${WINE}10`, border: `1px solid ${WINE}30`, borderRadius: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: WINE }}>Paso 2 de 3</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: step <= 2 ? (step === 2 ? WINE : `${WINE}60`) : "#E5E5EA",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["Información", "Fotos", "Detalles"].map((label, i) => (
            <span key={label} style={{ fontSize: 10, fontWeight: i === 1 ? 700 : 400, color: i <= 1 ? (i === 1 ? WINE : `${WINE}80`) : "#C7C7CC" }}>
              {i <= 1 ? "✓ " : ""}{label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 110px" }}>

        {/* Section label */}
        <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#3C3C43", letterSpacing: "0.3px", textTransform: "uppercase" }}>
          Fotos del inmueble
        </p>

        {/* ── Upload area ── */}
        <button
          onMouseEnter={() => setUploadHover(true)}
          onMouseLeave={() => setUploadHover(false)}
          style={{
            width: "100%",
            height: 158,
            borderRadius: 18,
            border: `2px dashed ${uploadHover ? WINE : "#C7C7CC"}`,
            background: uploadHover ? `${WINE}06` : "#F9F9FB",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            transition: "all 0.25s ease",
            marginBottom: 14,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner accents */}
          {[
            { top: 10, left: 10 },
            { top: 10, right: 10 },
            { bottom: 10, left: 10 },
            { bottom: 10, right: 10 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                borderColor: uploadHover ? WINE : "#D1D1D6",
                borderStyle: "solid",
                borderWidth: 0,
                borderTopWidth: i < 2 ? 2 : 0,
                borderBottomWidth: i >= 2 ? 2 : 0,
                borderLeftWidth: i % 2 === 0 ? 2 : 0,
                borderRightWidth: i % 2 !== 0 ? 2 : 0,
                borderRadius: i === 0 ? "4px 0 0 0" : i === 1 ? "0 4px 0 0" : i === 2 ? "0 0 0 4px" : "0 0 4px 0",
                transition: "border-color 0.25s",
                ...pos,
              }}
            />
          ))}

          {/* Camera icon ring */}
          <div
            style={{
              width: 52,
              height: 52,
              background: uploadHover ? `${WINE}15` : "#EFEFEF",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s",
            }}
          >
            <Camera size={24} color={uploadHover ? WINE : "#8E8E93"} />
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: uploadHover ? WINE : "#3C3C43" }}>
              Toca para subir fotos
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#8E8E93" }}>
              Máx. 10 fotos · JPG, PNG · Hasta 10 MB c/u
            </p>
          </div>

          {/* Photo count badge */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "3px 9px",
              background: photos.length > 0 ? `${WINE}15` : "#EFEFEF",
              borderRadius: 20,
              border: `1px solid ${photos.length > 0 ? `${WINE}30` : "#E0E0E0"}`,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: photos.length > 0 ? WINE : "#8E8E93" }}>
              {photos.length}/10
            </span>
          </div>
        </button>

        {/* ── Photo thumbnails carousel ── */}
        {photos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#555" }}>
                {photos.length} foto{photos.length > 1 ? "s" : ""} subida{photos.length > 1 ? "s" : ""}
              </p>
              <span style={{ fontSize: 11, color: "#8E8E93" }}>Desliza →</span>
            </div>

            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
              {/* Add more button */}
              <button
                style={{
                  width: 88,
                  height: 100,
                  borderRadius: 14,
                  border: "2px dashed #D1D1D6",
                  background: "#F9F9FB",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 28, height: 28, background: "#EFEFEF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={14} color="#8E8E93" />
                </div>
                <span style={{ fontSize: 10, color: "#8E8E93", fontWeight: 600 }}>Agregar</span>
              </button>

              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  style={{
                    width: 88,
                    height: 100,
                    borderRadius: 14,
                    background: photo.gradient,
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                  }}
                >
                  {/* Simulated room content */}
                  <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "rgba(0,0,0,0.15)" }} />
                    <div style={{ position: "absolute", top: "20%", left: "15%", width: "35%", height: "30%", background: "rgba(255,255,255,0.12)", borderRadius: 4 }} />
                    <div style={{ position: "absolute", top: "20%", right: "15%", width: "25%", height: "25%", background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
                  </div>

                  {/* Overlay gradient */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }} />

                  {/* Badge principal */}
                  {idx === 0 && (
                    <div style={{ position: "absolute", top: 7, left: 7, padding: "2px 7px", background: WINE, borderRadius: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>PORTADA</span>
                    </div>
                  )}

                  {/* Remove btn */}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 20,
                      height: 20,
                      background: "rgba(0,0,0,0.5)",
                      border: "none",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={10} color="#fff" />
                  </button>

                  {/* Label */}
                  <div style={{ position: "absolute", bottom: 7, left: 7, right: 7 }}>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{photo.label}</p>
                    <p style={{ margin: 0, fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{photo.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "7px 10px", background: "#FFFBEB", borderRadius: 10, border: "1px solid #FDE68A" }}>
              <Star size={12} color="#F59E0B" />
              <p style={{ margin: 0, fontSize: 11, color: "#92400E" }}>
                <strong>Tip:</strong> La primera foto será la portada de tu anuncio
              </p>
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div style={{ width: "100%", height: 1, background: "#F0F0F2", marginBottom: 20 }} />

        {/* ── Servicios incluidos ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3C3C43", letterSpacing: "0.3px", textTransform: "uppercase" }}>
              Servicios incluidos
            </p>
            <span style={{ fontSize: 11, color: "#8E8E93" }}>
              {selectedServices.length} seleccionado{selectedServices.length !== 1 ? "s" : ""}
            </span>
          </div>

          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#8E8E93", lineHeight: 1.5 }}>
            Selecciona los servicios que están incluidos en el precio del alquiler.
          </p>

          {/* Chips grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {SERVICES.map((service) => {
              const active = selectedServices.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 16px",
                    borderRadius: 50,
                    border: `1.5px solid ${active ? service.color : "#E5E5EA"}`,
                    background: active ? service.bg : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active ? `0 2px 10px ${service.color}20` : "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ color: active ? service.color : "#8E8E93", display: "flex", alignItems: "center", transition: "color 0.2s" }}>
                    {service.icon}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? service.color : "#555", transition: "all 0.2s", letterSpacing: "-0.1px" }}>
                    {service.label}
                  </span>
                  {active && (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        background: service.color,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 2,
                      }}
                    >
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Summary card ── */}
        {selectedServices.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #F9F9FB 0%, #F5F5F7 100%)",
              borderRadius: 14,
              padding: "13px 14px",
              border: "1px solid #EFEFEF",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div style={{ width: 32, height: 32, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
              <Check size={16} color="#10B981" />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "#111" }}>
                Servicios confirmados
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#555", lineHeight: 1.5 }}>
                Tu anuncio mostrará: {SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => s.label).join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA fijo ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 20px 22px", background: "linear-gradient(to top, #fff 75%, transparent)" }}>
        <button
          onClick={() => setPublished(true)}
          style={{
            width: "100%",
            padding: "15px 24px",
            background: published
              ? "#10B981"
              : `linear-gradient(135deg, ${WINE} 0%, ${WINE_DARK} 100%)`,
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            boxShadow: published ? "0 4px 20px rgba(16,185,129,0.4)" : `0 4px 20px ${WINE}45`,
            transition: "all 0.35s ease",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {published ? (
            <Check size={18} color="#fff" strokeWidth={2.5} />
          ) : (
            <Rocket size={17} color="#fff" />
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>
            {published ? "¡Publicado exitosamente!" : "Finalizar y Publicar"}
          </span>
        </button>

        {!published && (
          <p style={{ margin: "7px 0 0", textAlign: "center", fontSize: 11, color: "#AEAEB2" }}>
            Tu anuncio será revisado por el equipo ULEAM en 24 h
          </p>
        )}
      </div>
    </div>
  );
}
