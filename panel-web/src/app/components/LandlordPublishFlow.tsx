import { useState } from "react";
import {
  Building2, ChevronRight, Upload, Check, MapPin, Wifi, Zap, Droplets, Sofa,
  Coffee, Car, Thermometer, ArrowLeft, X, Plus, AlertCircle, CheckCircle2, Eye,
  DollarSign, FileText, Camera, Home
} from "lucide-react";

const WINE = "#8C1515";

const STEPS = [
  { id: 1, label: "Información básica", icon: <FileText size={16} /> },
  { id: 2, label: "Fotos y multimedia", icon: <Camera size={16} /> },
  { id: 3, label: "Servicios y reglas", icon: <Home size={16} /> },
  { id: 4, label: "Publicado", icon: <CheckCircle2 size={16} /> },
];

interface Props { initialStep?: number }

export function LandlordPublishFlow({ initialStep = 1 }: Props) {
  const [step, setStep] = useState(initialStep);

  return (
    <div style={{
      width: 1100, background: "#F8F9FA",
      fontFamily: "'Inter', sans-serif",
      borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      overflow: "hidden", border: "1px solid #e8eaed"
    }}>
      {/* Top Header */}
      <div style={{ background: "#fff", padding: "0 36px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, background: WINE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Publicar Propiedad</p>
            <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Panel del Arrendador · ULEAM Rental</p>
          </div>
        </div>

        {/* Step Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => s.id <= step && setStep(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 14px", borderRadius: 10, border: "none",
                  background: step === s.id ? `${WINE}15` : "transparent",
                  cursor: s.id <= step ? "pointer" : "default"
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: step > s.id ? "#10B981" : step === s.id ? WINE : "#e8eaed",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {step > s.id ? <Check size={13} color="#fff" strokeWidth={3} /> : <span style={{ color: step === s.id ? "#fff" : "#aaa", fontSize: 12, fontWeight: 700 }}>{s.id}</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === s.id ? 600 : 400, color: step === s.id ? WINE : step > s.id ? "#10B981" : "#aaa", whiteSpace: "nowrap" }}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{ width: 32, height: 1, background: step > s.id ? "#10B981" : "#e8eaed", margin: "0 4px" }} />
              )}
            </div>
          ))}
        </div>

        <button style={{ background: "#F8F9FA", border: "1.5px solid #eee", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#555", cursor: "pointer" }}>
          Guardar borrador
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 36px", minHeight: 560 }}>
        {step === 1 && <Step1 onNext={() => setStep(2)} />}
        {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4 onRestart={() => setStep(1)} />}
      </div>

      {/* Step Footer Navigation */}
      {step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 36px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", align: "center", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s < step ? "#10B981" : s === step ? WINE : "#e0e0e0", transition: "all 0.25s" }} />
            ))}
            <span style={{ fontSize: 12, color: "#aaa", marginLeft: 8 }}>Paso {step} de 3</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} style={{ padding: "10px 20px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowLeft size={15} /> Atrás
              </button>
            )}
            <button onClick={() => setStep(step + 1)} style={{ padding: "10px 28px", background: WINE, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {step === 3 ? "Publicar anuncio" : "Siguiente paso"} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── STEP 1: Basic Info ─── */
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: "flex", gap: 36 }}>
      {/* Left Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionTitle>Información del inmueble</SectionTitle>

        <FormField label="Título del anuncio" required hint="Máximo 60 caracteres">
          <input
            defaultValue="Mini Depa Amoblado cerca ULEAM con Internet"
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <FormField label="Tipo de propiedad" required>
            <select style={inputStyle}>
              <option>Cuarto individual</option>
              <option selected>Mini Departamento</option>
              <option>Departamento</option>
              <option>Habitación compartida</option>
            </select>
          </FormField>
          <FormField label="Precio mensual (USD)" required>
            <div style={{ position: "relative" }}>
              <DollarSign size={16} color="#aaa" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input defaultValue="180" style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
          </FormField>
        </div>

        <FormField label="Descripción" required hint="Describe los espacios, ventajas y entorno">
          <textarea
            defaultValue="Acogedor mini departamento completamente amoblado a solo 350m de la ULEAM. Incluye baño privado, cocina equipada, internet de fibra óptica 100Mbps y agua caliente. Ambiente tranquilo, ideal para estudiantes. Edificio con acceso seguro las 24h."
            style={{ ...inputStyle, height: 100, resize: "none" }}
          />
        </FormField>

        <FormField label="Descripción breve (para la card)" required hint="Máximo 80 caracteres">
          <input defaultValue="Mini depa amoblado · Baño privado · Internet incluido" style={inputStyle} />
        </FormField>
      </div>

      {/* Right Column */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionTitle>Ubicación</SectionTitle>

        <FormField label="Dirección exacta" required>
          <div style={{ position: "relative" }}>
            <MapPin size={16} color="#aaa" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input defaultValue="Calle Olmedo 245 y Av. Universitaria" style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
        </FormField>

        <FormField label="Barrio / Sector">
          <input defaultValue="Centro, Manta" style={inputStyle} />
        </FormField>

        <FormField label="Distancia a la ULEAM">
          <select style={inputStyle}>
            <option>Menos de 200m</option>
            <option selected>200m – 500m</option>
            <option>500m – 1km</option>
            <option>Más de 1km</option>
          </select>
        </FormField>

        {/* Map Placeholder */}
        <div style={{ height: 160, background: "#e8eaed", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "2px dashed #d0d0d0" }}>
          <MapPin size={28} color="#bbb" />
          <span style={{ fontSize: 13, color: "#bbb", fontWeight: 500 }}>Vista del mapa</span>
          <button style={{ padding: "6px 14px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 12, color: "#555", cursor: "pointer" }}>
            Seleccionar en mapa
          </button>
        </div>

        {/* Info Box */}
        <div style={{ padding: "12px 14px", background: "#FFFBEB", borderRadius: 12, border: "1.5px solid #FDE68A", display: "flex", gap: 10 }}>
          <AlertCircle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
            La dirección exacta solo será visible para estudiantes verificados que soliciten información.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step1Footer({ onNext }: { onNext: () => void }) {
  return null;
}

/* ─── STEP 2: Photos ─── */
function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const uploadedImgs = [
    "https://images.unsplash.com/photo-1737305473724-896a66064a68?w=400&q=80",
    "https://images.unsplash.com/photo-1680492260834-11e9edc1c59a?w=400&q=80",
    "https://images.unsplash.com/photo-1744195138059-b9d65f353867?w=400&q=80",
  ];

  return (
    <div style={{ display: "flex", gap: 36 }}>
      <div style={{ flex: 1 }}>
        <SectionTitle>Fotos del inmueble</SectionTitle>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>
          Añade mínimo <strong>3 fotos</strong>. La primera imagen será la foto principal de tu anuncio.
        </p>

        {/* Upload Zone */}
        <div style={{
          border: "2px dashed #d0d0d0", borderRadius: 14, padding: "36px", textAlign: "center",
          background: "#FAFAFA", cursor: "pointer", marginBottom: 20,
          transition: "all 0.2s"
        }}>
          <div style={{ width: 52, height: 52, background: `${WINE}10`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Upload size={24} color={WINE} />
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#333" }}>Arrastra fotos aquí o haz clic para subir</p>
          <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>JPG, PNG · Máx. 10MB por imagen · Mínimo 800×600px</p>
        </div>

        {/* Uploaded Photos Grid */}
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#555" }}>Fotos subidas ({uploadedImgs.length}/8)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {uploadedImgs.map((img, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", border: i === 0 ? `2.5px solid ${WINE}` : "2.5px solid transparent" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <div style={{ position: "absolute", top: 6, left: 6, background: WINE, borderRadius: 6, padding: "2px 8px" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>Principal</span>
                </div>
              )}
              <button style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}
          {/* Add more slot */}
          <div style={{ aspectRatio: "4/3", border: "2px dashed #e0e0e0", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", background: "#FAFAFA" }}>
            <Plus size={20} color="#bbb" />
            <span style={{ fontSize: 10, color: "#bbb" }}>Añadir</span>
          </div>
        </div>

        {/* Photo Tips */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "#EFF6FF", borderRadius: 12, border: "1.5px solid #BFDBFE" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>📸 Consejos para mejores fotos</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Buena iluminación natural", "Mostrar todos los espacios", "Sin objetos personales visibles"].map(tip => (
              <div key={tip} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={12} color="#3B82F6" strokeWidth={3} />
                <span style={{ fontSize: 11, color: "#3B82F6" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <SectionTitle>Vista previa del anuncio</SectionTitle>
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <div style={{ position: "relative", height: 140 }}>
            <img src={uploadedImgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 8, left: 8, background: "#10B981", borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, background: "#fff", borderRadius: "50%" }} />
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>Arrendatario Verificado</span>
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Mini Depa Amoblado cerca ULEAM</p>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} /> Calle Olmedo · 350m
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: WINE }}>$180 <span style={{ fontSize: 11, fontWeight: 400, color: "#888" }}>/mes</span></p>
          </div>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "#aaa", textAlign: "center" }}>Así verán los estudiantes tu anuncio</p>
      </div>
    </div>
  );
}

/* ─── STEP 3: Services & Rules ─── */
const ALL_SERVICES = [
  { id: "agua", icon: <Droplets size={18} />, label: "Agua", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "luz", icon: <Zap size={18} />, label: "Luz", color: "#F59E0B", bg: "#FFFBEB" },
  { id: "internet", icon: <Wifi size={18} />, label: "Internet", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "amoblado", icon: <Sofa size={18} />, label: "Amoblado", color: "#10B981", bg: "#ECFDF5" },
  { id: "cocina", icon: <Coffee size={18} />, label: "Cocina", color: "#F97316", bg: "#FFF7ED" },
  { id: "parking", icon: <Car size={18} />, label: "Parqueadero", color: "#64748B", bg: "#F8FAFC" },
  { id: "ac", icon: <Thermometer size={18} />, label: "Aire acond.", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "tv", icon: <Building2 size={18} />, label: "TV Cable", color: "#EC4899", bg: "#FDF2F8" },
];

const DEFAULT_RULES = [
  { id: 1, text: "Solo para estudiantes ULEAM", type: "allow" },
  { id: 2, text: "No se permiten fiestas o reuniones ruidosas", type: "deny" },
  { id: 3, text: "No fumar en interiores", type: "deny" },
  { id: 4, text: "Se permite cocinar", type: "allow" },
  { id: 5, text: "Mascotas pequeñas permitidas con depósito", type: "allow" },
];

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selectedServices, setSelectedServices] = useState<string[]>(["agua", "luz", "internet", "amoblado", "cocina"]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div style={{ display: "flex", gap: 36 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Services */}
        <div>
          <SectionTitle>Servicios incluidos en el precio</SectionTitle>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>Selecciona todos los servicios que están incluidos en el precio mensual.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {ALL_SERVICES.map((service) => {
              const active = selectedServices.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  style={{
                    padding: "14px 10px", borderRadius: 12,
                    background: active ? service.bg : "#fff",
                    border: active ? `2px solid ${service.color}55` : "2px solid #f0f0f0",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    position: "relative", transition: "all 0.15s"
                  }}
                >
                  <span style={{ color: active ? service.color : "#ccc" }}>{service.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? service.color : "#aaa" }}>{service.label}</span>
                  {active && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, background: service.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rules */}
        <div>
          <SectionTitle>Reglas del inmueble</SectionTitle>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>Define claramente las reglas para evitar malentendidos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEFAULT_RULES.map((rule) => (
              <div key={rule.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: "#fff", borderRadius: 10,
                border: "1px solid #f0f0f0"
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: rule.type === "allow" ? "#ECFDF5" : "#FEF2F2",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {rule.type === "allow" ? <Check size={13} color="#10B981" strokeWidth={3} /> : <X size={13} color="#EF4444" strokeWidth={3} />}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: "#444" }}>{rule.text}</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}><X size={14} /></button>
              </div>
            ))}
            {/* Add rule */}
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F8F9FA", borderRadius: 10, border: "2px dashed #e0e0e0", cursor: "pointer", color: "#888", fontSize: 13 }}>
              <Plus size={16} /> Añadir regla personalizada
            </button>
          </div>
        </div>
      </div>

      {/* Right: Pricing summary */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <SectionTitle>Resumen de publicación</SectionTitle>
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Tipo", value: "Mini Departamento" },
              { label: "Precio", value: "$180/mes" },
              { label: "Ubicación", value: "Calle Olmedo · 350m" },
              { label: "Fotos", value: "3 imágenes" },
              { label: "Servicios", value: `${selectedServices.length} incluidos` },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#888" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />
          <div style={{ padding: "10px 12px", background: "#ECFDF5", borderRadius: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 11, color: "#065F46", lineHeight: 1.5 }}>
              Tu anuncio será revisado por el equipo ULEAM antes de publicarse (24–48h).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 4: Success ─── */
function Step4({ onRestart }: { onRestart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", textAlign: "center" }}>
      {/* Success Icon */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={32} color="#fff" strokeWidth={3} />
          </div>
        </div>
        {[0, 72, 144, 216, 288].map((deg) => (
          <div key={deg} style={{ position: "absolute", width: 8, height: 8, background: deg % 144 === 0 ? "#10B981" : "#ECFDF5", borderRadius: "50%", top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-60px)` }} />
        ))}
      </div>

      <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>¡Propiedad enviada!</h2>
      <p style={{ margin: "0 0 36px", fontSize: 15, color: "#888", maxWidth: 480, lineHeight: 1.7 }}>
        Tu anuncio <strong>"Mini Depa Amoblado cerca ULEAM"</strong> ha sido enviado para revisión. El equipo de ULEAM lo verificará en las próximas 24–48 horas.
      </p>

      {/* Status Timeline */}
      <div style={{ display: "flex", gap: 0, marginBottom: 40, alignItems: "flex-start" }}>
        {[
          { label: "Publicación enviada", sub: "Ahora", done: true, active: false },
          { label: "En revisión", sub: "24–48h", done: false, active: true },
          { label: "Verificado", sub: "Pendiente", done: false, active: false },
          { label: "Publicado", sub: "Pendiente", done: false, active: false },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", border: "2px solid",
                borderColor: s.done ? "#10B981" : s.active ? "#F59E0B" : "#e0e0e0",
                background: s.done ? "#10B981" : s.active ? "#FFFBEB" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {s.done ? <Check size={14} color="#fff" strokeWidth={3} /> : s.active ? <div style={{ width: 10, height: 10, background: "#F59E0B", borderRadius: "50%" }} /> : <div style={{ width: 8, height: 8, background: "#e0e0e0", borderRadius: "50%" }} />}
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: s.done ? "#10B981" : s.active ? "#F59E0B" : "#bbb", whiteSpace: "nowrap" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#bbb" }}>{s.sub}</p>
              </div>
            </div>
            {i < 3 && <div style={{ width: 60, height: 2, background: s.done ? "#10B981" : "#e0e0e0", marginTop: 15, flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ padding: "12px 24px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={16} /> Ver mi anuncio
        </button>
        <button onClick={onRestart} style={{ padding: "12px 24px", background: WINE, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> Publicar otra propiedad
        </button>
      </div>
    </div>
  );
}

/* ─── SHARED COMPONENTS ─── */

/* ─── Micro Components ─── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "#fff", border: "1.5px solid #e8eaed",
  borderRadius: 10, fontSize: 13, color: "#333",
  outline: "none", fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box"
};

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
          {label} {required && <span style={{ color: WINE }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: "#aaa" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{children}</h3>
      <div style={{ width: 32, height: 3, background: WINE, borderRadius: 2 }} />
    </div>
  );
}