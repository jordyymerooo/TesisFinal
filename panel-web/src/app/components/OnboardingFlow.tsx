import { useState } from "react";
import { ArrowRight, GraduationCap, Home, ChevronRight, Check, Building2, Shield, Star } from "lucide-react";

const WINE = "#8C1515";

const SLIDES = [
  {
    id: 0,
    type: "splash",
  },
  {
    id: 1,
    type: "feature",
    badge: "Paso 1 de 3",
    title: "Encuentra tu hogar\ncerca de la ULEAM",
    subtitle: "Más de 300 propiedades verificadas a minutos de tu universidad, seguras y asequibles.",
    image: "https://images.unsplash.com/photo-1767449181027-dbca7575f91b?w=600&q=80",
    features: ["Propiedades verificadas y seguras", "Búsqueda por distancia a ULEAM", "Chat directo con arrendadores"],
    color: "#EFF6FF",
    accent: "#3B82F6",
  },
  {
    id: 2,
    type: "role",
    badge: "Paso 2 de 3",
    title: "¿Cómo usarás\nla plataforma?",
    subtitle: "Selecciona tu rol para personalizar tu experiencia en el sistema.",
  },
  {
    id: 3,
    type: "ready",
    badge: "Paso 3 de 3",
    title: "¡Todo listo,\nBienvenido/a!",
    subtitle: "Tu cuenta ha sido creada. Completa tu perfil para acceder a todas las funciones.",
  },
];

interface Props { startAt?: number }

export function OnboardingFlow({ startAt = 0 }: Props) {
  const [current, setCurrent] = useState(startAt);
  const slide = SLIDES[current];

  return (
    <div style={{
      width: 390, height: 844, background: "#fff",
      fontFamily: "'Inter', sans-serif", borderRadius: 44,
      boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      display: "flex", flexDirection: "column",
      border: "10px solid #1a1a1a", overflow: "hidden", position: "relative"
    }}>
      {slide.type === "splash" && <SplashScreen onNext={() => setCurrent(1)} />}
      {slide.type === "feature" && <FeatureScreen slide={slide} onNext={() => setCurrent(current + 1)} onSkip={() => setCurrent(3)} current={current} total={SLIDES.length} />}
      {slide.type === "role" && <RoleScreen onNext={() => setCurrent(current + 1)} current={current} total={SLIDES.length} />}
      {slide.type === "ready" && <ReadyScreen onRestart={() => setCurrent(0)} />}

      {/* Dot Indicators (not on splash) */}
      {slide.type !== "splash" && (
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              width: current === i ? 20 : 6, height: 6,
              borderRadius: 3, background: current === i ? WINE : "#e0e0e0",
              transition: "width 0.25s"
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${WINE} 0%, #5c0d0d 100%)`,
      position: "relative", overflow: "hidden", padding: 32
    }}>
      {/* Grid pattern */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Glow */}
      <div style={{ position: "absolute", width: 280, height: 280, background: "rgba(255,255,255,0.04)", borderRadius: "50%", top: -80, right: -80 }} />
      <div style={{ position: "absolute", width: 200, height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "50%", bottom: 40, left: -60 }} />

      {/* Logo */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ width: 90, height: 90, background: "rgba(255,255,255,0.12)", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)" }}>
          <Building2 size={44} color="#fff" />
        </div>
        <div style={{ position: "absolute", bottom: -8, right: -8, width: 28, height: 28, background: "#10B981", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </div>
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#fff", textAlign: "center" }}>ULEAM Rental</h1>
      <p style={{ margin: "0 0 48px", fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.6 }}>
        El sistema oficial de alquiler estudiantil de la Universidad ULEAM
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        {[
          { value: "300+", label: "Propiedades" },
          { value: "1.2k", label: "Estudiantes" },
          { value: "4.9", label: "Calificación" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center", padding: "12px 16px", background: "rgba(255,255,255,0.08)", borderRadius: 14, minWidth: 70 }}>
            <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 800, color: "#fff" }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        style={{ width: "100%", padding: "16px", background: "#fff", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, color: WINE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        Comenzar <ArrowRight size={18} />
      </button>
      <button style={{ marginTop: 12, background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>
        Ya tengo una cuenta
      </button>
    </div>
  );
}

function FeatureScreen({ slide, onNext, onSkip, current, total }: { slide: any; onNext: () => void; onSkip: () => void; current: number; total: number }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* Image Area */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, #fff 100%)" }} />
        {/* Skip */}
        <button onClick={onSkip} style={{ position: "absolute", top: 52, right: 20, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 20, padding: "6px 14px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
          Omitir
        </button>
        <div style={{ position: "absolute", top: 52, left: 20, background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "6px 12px" }}>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{slide.badge}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "8px 24px 24px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2, whiteSpace: "pre-line" }}>{slide.title}</h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>{slide.subtitle}</p>

        {slide.features && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {slide.features.map((f: string) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, background: "#ECFDF5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={13} color="#10B981" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13, color: "#555" }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          <button onClick={onNext} style={{
            width: "100%", padding: "15px", background: WINE, border: "none",
            borderRadius: 14, fontSize: 15, fontWeight: 700, color: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            Siguiente <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleScreen({ onNext, current, total }: { onNext: () => void; current: number; total: number }) {
  const [selected, setSelected] = useState<"student" | "landlord" | null>(null);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", padding: "60px 24px 32px" }}>
      {/* Badge */}
      <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "4px 12px", background: `${WINE}15`, color: WINE, borderRadius: 20, marginBottom: 20 }}>Paso 2 de 3</span>

      <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>¿Cómo usarás{"\n"}la plataforma?</h2>
      <p style={{ margin: "0 0 32px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>Selecciona tu rol para personalizar tu experiencia en el sistema.</p>

      {/* Role Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {[
          {
            key: "student" as const,
            icon: <GraduationCap size={28} color={selected === "student" ? "#fff" : "#3B82F6"} />,
            title: "Soy Estudiante",
            subtitle: "Busco un lugar para vivir cerca de la ULEAM",
            bg: "#EFF6FF",
            selectedBg: "#3B82F6",
          },
          {
            key: "landlord" as const,
            icon: <Home size={28} color={selected === "landlord" ? "#fff" : WINE} />,
            title: "Soy Arrendador",
            subtitle: "Tengo una propiedad que quiero publicar",
            bg: `${WINE}10`,
            selectedBg: WINE,
          },
        ].map((role) => (
          <button
            key={role.key}
            onClick={() => setSelected(role.key)}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
              background: selected === role.key ? role.selectedBg : role.bg,
              borderRadius: 16, border: selected === role.key ? "2px solid transparent" : "2px solid transparent",
              cursor: "pointer", textAlign: "left",
              boxShadow: selected === role.key ? `0 8px 24px ${role.selectedBg}44` : "none",
              transition: "all 0.2s"
            }}
          >
            <div style={{ width: 52, height: 52, background: selected === role.key ? "rgba(255,255,255,0.2)" : "#fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {role.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: selected === role.key ? "#fff" : "#1a1a1a" }}>{role.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: selected === role.key ? "rgba(255,255,255,0.7)" : "#888" }}>{role.subtitle}</p>
            </div>
            {selected === role.key && <Check size={20} color="#fff" strokeWidth={3} />}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        style={{
          width: "100%", padding: "15px", background: selected ? WINE : "#e8eaed",
          border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
          color: selected ? "#fff" : "#bbb", cursor: selected ? "pointer" : "not-allowed",
          marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}
      >
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  );
}

function ReadyScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", background: "#fff", textAlign: "center" }}>
      {/* Success animation circle */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={36} color="#fff" strokeWidth={3} />
          </div>
        </div>
        {/* Decorative dots */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div key={deg} style={{ position: "absolute", width: 8, height: 8, background: deg % 120 === 0 ? "#10B981" : "#ECFDF5", borderRadius: "50%", top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-68px)` }} />
        ))}
      </div>

      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", background: "#ECFDF5", color: "#10B981", borderRadius: 20, marginBottom: 16 }}>Paso 3 de 3</span>
      <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>¡Todo listo,{"\n"}Bienvenida Andrea!</h2>
      <p style={{ margin: "0 0 36px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
        Tu cuenta ha sido creada. Completa tu perfil para acceder a todas las funciones.
      </p>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginBottom: 36 }}>
        {[
          { label: "Subir foto de perfil", done: false },
          { label: "Verificar cédula de identidad", done: false },
          { label: "Confirmar correo institucional", done: true },
        ].map((step) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: step.done ? "#ECFDF5" : "#F8F9FA", borderRadius: 12, border: step.done ? "1.5px solid #A7F3D0" : "1.5px solid #eee" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "#10B981" : "#e8eaed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {step.done ? <Check size={12} color="#fff" strokeWidth={3} /> : <span style={{ fontSize: 11, color: "#bbb" }}>—</span>}
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: step.done ? "#065F46" : "#555", textAlign: "left" }}>{step.label}</span>
            {!step.done && <ChevronRight size={16} color="#ccc" />}
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        style={{ width: "100%", padding: "15px", background: WINE, border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer" }}
      >
        Explorar propiedades
      </button>
      <button onClick={onRestart} style={{ marginTop: 10, background: "none", border: "none", color: "#aaa", fontSize: 12, cursor: "pointer" }}>
        Completar perfil más tarde
      </button>
    </div>
  );
}
