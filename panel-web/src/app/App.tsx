export { default } from "../App";

import { MobileDetailScreen } from "./components/MobileDetailScreen";
import { MobileMessagingScreen } from "./components/MobileMessagingScreen";
import { MobileProfileScreen } from "./components/MobileProfileScreen";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { EmptyStateScreen } from "./components/EmptyStates";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminVerificationModal } from "./components/AdminVerificationModal";
import { LandlordPublishFlow } from "./components/LandlordPublishFlow";
import { LandlordVerificationScreen } from "./components/LandlordVerificationScreen";
import { PropertyPublishStep1Screen } from "./components/PropertyPublishStep1Screen";
import { PropertyPublishStep2Screen } from "./components/PropertyPublishStep2Screen";
import { AuthModule } from "./components/AuthModule";
import { StudentMapModule } from "./components/StudentMapModule";
import { LandlordMobileModule } from "./components/LandlordMobileModule";
import { AdminExtendedModule } from "./components/AdminExtendedModule";
import { UIStatesModule } from "./components/UIStatesModule";
import { DesignSystemShowcase } from "./components/DesignSystemShowcase";

const WINE = "#8C1515";

// Navigation tabs
const NAV_TABS = [
  { id: "design-system", label: "🎨 Design System" },
  { id: "mobile", label: "App Móvil · Estudiante" },
  { id: "onboarding", label: "Onboarding + Estados vacíos" },
  { id: "admin", label: "Panel Admin Web" },
  { id: "publish", label: "Publicación Arrendador" },
  { id: "auth", label: "M1 · Auth" },
  { id: "student-map", label: "M2 · Mapa" },
  { id: "landlord-mobile", label: "M3 · Arrendador" },
  { id: "admin-extended", label: "M4 · Admin+" },
  { id: "ui-states", label: "M5 · UI States" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("mobile");
  const [showModal, setShowModal] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    authService.ping()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    const interval = setInterval(() => {
      authService.ping()
        .then(() => setApiOnline(true))
        .catch(() => setApiOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0F1117", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ── Global Header ── */}
      <div style={{
        background: "#0F1117", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 48px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: WINE, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>U</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>ULEAM Rental System</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Design System · UI/UX Prototype · v2.0</p>
          </div>
        </div>

        {/* Section Tabs */}
        <nav style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", maxWidth: 700, scrollbarWidth: "none" }}>
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: activeTab === tab.id ? WINE : "transparent",
                color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Backend API Connection Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: apiOnline === true ? "rgba(16,185,129,0.12)" : (apiOnline === false ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)"),
            border: `1px solid ${apiOnline === true ? "rgba(16,185,129,0.3)" : (apiOnline === false ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)")}`,
            padding: "6px 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            color: apiOnline === true ? "#34D399" : (apiOnline === false ? "#F87171" : "#9CA3AF")
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: apiOnline === true ? "#10B981" : (apiOnline === false ? "#EF4444" : "#9CA3AF"),
              boxShadow: apiOnline === true ? "0 0 8px #10B981" : "none"
            }} />
            {apiOnline === true ? "API Backend: Conectado (PostgreSQL)" : (apiOnline === false ? "API Backend: Desconectado" : "Verificando API...")}
          </div>

          {/* Design Tokens */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 8 }}>
            {[
              { color: "#8C1515", label: "Primary" },
              { color: "#10B981", label: "Success" },
              { color: "#F59E0B", label: "Warning" },
              { color: "#3B82F6", label: "Info" },
            ].map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: t.color, borderRadius: 3 }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{t.color}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Canvas Content ── */}
      <div style={{ padding: "48px 48px 80px" }}>

        {/* ════ TAB 0: Design System ════ */}
        {activeTab === "design-system" && <DesignSystemShowcase />}

        {/* ════ TAB 1: Mobile App ════ */}
        {activeTab === "mobile" && (
          <div>
            <SectionHeader
              number="01"
              title="App Móvil para Estudiantes"
              subtitle="iPhone 14/15 · 390 × 844px · React Native · 4 pantallas del flujo principal"
            />

            <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
              <PhoneFrame label="PANTALLA 1" desc="Home · Explorar" color="#3B82F6"
                annotations={["Header con saludo + avatar", "Búsqueda y filtros píldora", "Cards con badge verificado", "Bottom nav activa"]}>
                <MobileHomeScreen />
              </PhoneFrame>

              <PhoneFrame label="PANTALLA 2" desc="Detalle de Propiedad" color="#10B981"
                annotations={["Hero carrusel + overlay", "Badge Disponible", "Perfil arrendador + stars", "Servicios en grid", "CTA fijo rojo vino"]}>
                <MobileDetailScreen />
              </PhoneFrame>

              <PhoneFrame label="PANTALLA 3" desc="Mensajería · Lista + Chat" color="#8B5CF6"
                annotations={["Lista de conversaciones", "Estado online", "Tap para chat individual", "Input + botón enviar"]}>
                <MobileMessagingScreen />
              </PhoneFrame>

              <PhoneFrame label="PANTALLA 4" desc="Chat Activo" color="#F59E0B"
                annotations={["Header con contacto", "Banner propiedad activa", "Burbujas de chat", "Estado de lectura ✓✓"]}>
                <MobileMessagingScreen showChat={true} />
              </PhoneFrame>

              <PhoneFrame label="PANTALLA 5" desc="Perfil del Estudiante" color="#EC4899"
                annotations={["Hero degradado vino", "Stats: solicitudes/favs", "Alquiler activo", "Menú de cuenta", "Botón cerrar sesión"]}>
                <MobileProfileScreen />
              </PhoneFrame>
            </div>
          </div>
        )}

        {/* ════ TAB 2: Onboarding + Empty States ════ */}
        {activeTab === "onboarding" && (
          <div>
            <SectionHeader
              number="02"
              title="Onboarding & Estados Vacíos"
              subtitle="Flujo de incorporación de nuevos usuarios + pantallas de estado vacío"
            />

            {/* Onboarding */}
            <div style={{ marginBottom: 64 }}>
              <SubSectionLabel label="Flujo de Onboarding" desc="4 pantallas · Splash → Feature → Rol → Completado" />
              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                <PhoneFrame label="ONBOARDING 1" desc="Splash · Bienvenida" color={WINE}
                  annotations={["Logo institucional", "Estadísticas de la plataforma", "CTA primario", "Link ingreso existente"]}>
                  <OnboardingFlow startAt={0} />
                </PhoneFrame>
                <PhoneFrame label="ONBOARDING 2" desc="Feature Highlight" color="#3B82F6"
                  annotations={["Hero image con overlay", "Progreso paso 1/3", "Lista de beneficios", "Botón Siguiente"]}>
                  <OnboardingFlow startAt={1} />
                </PhoneFrame>
                <PhoneFrame label="ONBOARDING 3" desc="Selección de Rol" color="#8B5CF6"
                  annotations={["Cards interactivas", "Estudiante vs Arrendador", "Estado deshabilitado", "Se activa al seleccionar"]}>
                  <OnboardingFlow startAt={2} />
                </PhoneFrame>
                <PhoneFrame label="ONBOARDING 4" desc="¡Todo Listo!" color="#10B981"
                  annotations={["Ícono éxito animado", "Pasos de perfil pendientes", "Paso completado (email)", "CTA explorar propiedades"]}>
                  <OnboardingFlow startAt={3} />
                </PhoneFrame>
              </div>
            </div>

            {/* Empty States */}
            <div>
              <SubSectionLabel label="Estados Vacíos" desc="3 variantes · Favoritos · Mensajes · Sin resultados" />
              <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                <PhoneFrame label="VACÍO 1" desc="Sin Favoritos" color="#EF4444"
                  annotations={["Ilustración con corazón", "Mensaje empático", "CTA explorar", "Tip contextual"]}>
                  <EmptyStateScreen type="favorites" />
                </PhoneFrame>
                <PhoneFrame label="VACÍO 2" desc="Sin Mensajes" color="#3B82F6"
                  annotations={["Ilustración con burbuja", "Copy orientativo", "Dirección a buscar propiedades", "Tip de uso"]}>
                  <EmptyStateScreen type="messages" />
                </PhoneFrame>
                <PhoneFrame label="VACÍO 3" desc="Sin Resultados de Búsqueda" color="#888"
                  annotations={["Filtros activos visibles", "Ilustración búsqueda vacía", "Limpiar filtros", "Ajustar búsqueda"]}>
                  <EmptyStateScreen type="search" />
                </PhoneFrame>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 3: Admin Web ════ */}
        {activeTab === "admin" && (
          <div>
            <SectionHeader
              number="03"
              title="Panel Administrativo Web"
              subtitle="Desktop · 1440px · React + Vite · Dashboard + Modal de Verificación"
            />

            {/* Dashboard */}
            <div style={{ marginBottom: 48 }}>
              <SubSectionLabel label="Dashboard Principal" desc="Sidebar + estadísticas + tabla de verificaciones pendientes" />
              <DesktopAnnotations items={[
                "Sidebar oscuro (#1E1E2E) con logo y navegación activa",
                "Header con buscador, badge notificaciones y avatar",
                "4 stat cards con trend indicators",
                "Tabla con avatares, cédulas y botón Revisar → abre modal",
              ]} />
              <div style={{ marginTop: 16 }}>
                <AdminDashboard onOpenModal={() => setShowModal(true)} />
              </div>
            </div>

            {/* Modal Preview */}
            <div>
              <SubSectionLabel label="Modal de Verificación" desc="Overlay centrado · Columna usuario + grid documentos" />
              <DesktopAnnotations items={[
                "Backdrop blur semitransparente",
                "Col. izquierda 30%: datos del arrendatario + alerta",
                "Col. derecha 70%: 5 placeholders de documentos con estado",
                "Footer: textarea de notas + Rechazar (outline) / Aprobar (verde)",
              ]} />
              <ModalStaticPreview onOpen={() => setShowModal(true)} />
            </div>
          </div>
        )}

        {/* ════ TAB 4: Landlord Publish Flow ════ */}
        {activeTab === "publish" && (
          <div>
            <SectionHeader
              number="04"
              title="Flujo de Publicación · Arrendador"
              subtitle="Web Desktop · 3 pasos + confirmación · Auto Layout · React + Vite"
            />

            {/* Steps overview */}
            <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
              {[
                { step: "01", title: "Información básica", desc: "Título, tipo, precio, dirección y descripción del inmueble", color: "#3B82F6" },
                { step: "02", title: "Fotos y multimedia", desc: "Subida drag & drop, vista previa del anuncio publicado", color: "#8B5CF6" },
                { step: "03", title: "Servicios y reglas", desc: "Toggle de servicios incluidos y reglas personalizables", color: "#10B981" },
                { step: "04", title: "¡Publicado!", desc: "Confirmación con timeline de revisión ULEAM", color: "#F59E0B" },
              ].map((s) => (
                <div key={s.step} style={{ flex: 1, padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", items: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: s.color }}>{s.step}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <LandlordPublishFlow initialStep={1} />

            {/* ── Verificación de Identidad ── */}
            <div style={{ marginTop: 56 }}>
              <SubSectionLabel label="Verificación de Identidad del Arrendador" desc="Pantalla de subida de documentos · Estado interactivo" />
              <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
                <PhoneFrame label="PASO 1/3" desc="Información del Inmueble" color="#3B82F6"
                annotations={[
                  "Barra de progreso 3 pasos con etiquetas",
                  "Input título con contador de caracteres",
                  "Dropdown tipo de propiedad con check activo",
                  "Input precio con prefijo $ y sufijo / mes",
                  "Placeholder de mapa interactivo con pin",
                  "Botón 'Fijar ubicación' superpuesto al mapa",
                  "CTA 'Siguiente paso' deshabilitado hasta completar",
                ]}>
                <PropertyPublishStep1Screen />
              </PhoneFrame>

              <PhoneFrame label="PASO 2/3" desc="Fotos y Servicios" color="#8B5CF6"
                annotations={[
                  "Barra de progreso: paso 1 completado, paso 2 activo",
                  "Zona de carga con esquinas decorativas y hover",
                  "Carrusel de miniaturas con badge PORTADA y botón eliminar",
                  "Tip de portada en amarillo",
                  "Chips de servicios seleccionables con íconos y check",
                  "Card de resumen de servicios confirmados",
                  "CTA 'Finalizar y Publicar' → estado publicado en verde",
                ]}>
                <PropertyPublishStep2Screen />
              </PhoneFrame>

              <PhoneFrame label="VERIFICACIÓN" desc="Subida de Documentos" color={WINE}
                  annotations={[
                    "Header con botón atrás + contador progreso",
                    "Banner informativo con ícono y descripción",
                    "Grid 2×2 de tarjetas con estado Pendiente (borde punteado)",
                    "Toca cada tarjeta → estado Cargado (verde)",
                    "CTA rojo vino anclado al fondo",
                    "Nota de privacidad y seguridad SSL",
                  ]}>
                  <LandlordVerificationScreen />
                </PhoneFrame>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 5: Auth Module ════ */}
        {activeTab === "auth" && (
          <div>
            <SectionHeader number="05" title="Módulo 1 · Autenticación" subtitle="Login · Recuperación de contraseña · Ajustes de cuenta · App Móvil" />
            <AuthModule />
          </div>
        )}

        {/* ════ TAB 6: Student Map Module ════ */}
        {activeTab === "student-map" && (
          <div>
            <SectionHeader number="06" title="Módulo 2 · Flujo del Estudiante" subtitle="Mapa fullscreen · Bottom sheet · Filtros · Reseña · App Móvil" />
            <StudentMapModule />
          </div>
        )}

        {/* ════ TAB 7: Landlord Mobile Module ════ */}
        {activeTab === "landlord-mobile" && (
          <div>
            <SectionHeader number="07" title="Módulo 3 · Panel del Arrendador" subtitle="Mis propiedades · Bandeja de solicitudes · Revisión de solicitud · App Móvil" />
            <LandlordMobileModule />
          </div>
        )}

        {/* ════ TAB 8: Admin Extended Module ════ */}
        {activeTab === "admin-extended" && (
          <div>
            <SectionHeader number="08" title="Módulo 4 · Panel Administrativo Extendido" subtitle="Aprobación de propiedades · Gestión de usuarios · Centro de reportes · Web Desktop 1440px" />
            <AdminExtendedModule />
          </div>
        )}

        {/* ════ TAB 9: UI States Module ════ */}
        {activeTab === "ui-states" && (
          <div>
            <SectionHeader number="09" title="Módulo 5 · Estados de UI" subtitle="Skeleton loader · Toast alerts · Ambas plataformas" />
            <UIStatesModule />
          </div>
        )}

      </div>

      {/* ── Verification Modal Overlay ── */}
      {showModal && <AdminVerificationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ════ Layout Helper Components ════ */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 36, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 50, height: 50, background: `${WINE}25`, border: `2px solid ${WINE}50`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#ff8080", fontSize: 14, fontWeight: 800, fontFamily: "monospace" }}>{number}</span>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>{title}</h2>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{subtitle}</p>
      </div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", marginLeft: 16 }} />
    </div>
  );
}

function SubSectionLabel({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{ width: 4, height: 20, background: WINE, borderRadius: 2 }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{label}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>· {desc}</span>
    </div>
  );
}

function PhoneFrame({
  label, desc, color, children, annotations
}: {
  label: string; desc: string; color: string;
  children: React.ReactNode; annotations: string[]
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 20, color, fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{desc}</span>
      </div>
      {/* Phone notch */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 100, height: 22, background: "#1a1a1a", borderRadius: "0 0 14px 14px", zIndex: 10 }} />
        {children}
      </div>
      {/* Annotations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 390 }}>
        {annotations.map((note, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <div style={{ width: 5, height: 5, background: color, borderRadius: "50%", marginTop: 5, flexShrink: 0, opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopAnnotations({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ width: 6, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function ModalStaticPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        width: 1440, height: 440, background: "rgba(0,0,0,0.7)",
        borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1E1E2E 0%, #2d2d3e 50%, #1a1a2e 100%)", opacity: 0.95 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Static Modal Preview */}
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, width: 860, boxShadow: "0 32px 80px rgba(0,0,0,0.5)", zIndex: 1, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", background: "#FAFAFA", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, background: `${WINE}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: WINE, fontSize: 18 }}>✓</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Verificación de Arrendatario</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Revisión de documentos e información personal</p>
            </div>
          </div>
          <div style={{ width: 34, height: 34, background: "#f0f0f0", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#555", fontWeight: 700 }}>✕</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", gap: 0 }}>
          {/* Left */}
          <div style={{ width: "28%", background: "#FAFAFA", padding: "20px", borderRight: "1px solid #f0f0f0" }}>
            <div style={{ width: 60, height: 60, background: `${WINE}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: WINE }}>MG</span>
            </div>
            <p style={{ textAlign: "center", margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>María González Torres</p>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, padding: "3px 10px", background: "#FFFBEB", color: "#F59E0B", borderRadius: 20, fontWeight: 600 }}>● Pendiente</span>
            </div>
            {["1308456789", "Arrendatario", "Ing. en Sistemas"].map(t => (
              <div key={t} style={{ padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 11, color: "#888" }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Right */}
          <div style={{ flex: 1, padding: "20px 24px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700 }}>Documentos adjuntos (2/5)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "Cédula Frontal", bg: "#EFF6FF", border: "#BFDBFE", ok: false },
                { l: "Cédula Posterior", bg: "#F5F3FF", border: "#DDD6FE", ok: false },
                { l: "Selfie con Cédula", bg: "#FFFBEB", border: "#FDE68A", ok: false },
                { l: "Exterior Inmueble", bg: "#ECFDF5", border: "#A7F3D0", ok: true },
              ].map(d => (
                <div key={d.l} style={{ height: 70, borderRadius: 10, border: `2px dashed ${d.border}`, background: d.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{d.l}</span>
                  <span style={{ fontSize: 10, padding: "1px 6px", background: d.ok ? "#ECFDF5" : "#FEF2F2", color: d.ok ? "#10B981" : "#EF4444", borderRadius: 8, fontWeight: 600 }}>{d.ok ? "✓ Cargado" : "✗ Pendiente"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Click hint */}
        <div style={{ padding: "12px 24px", background: "#F8F9FA", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "#aaa", background: "#fff", padding: "5px 14px", borderRadius: 20, border: "1px solid #eee" }}>
            👆 Clic para abrir el modal interactivo completo
          </span>
        </div>
      </div>
    </div>
  );
}
