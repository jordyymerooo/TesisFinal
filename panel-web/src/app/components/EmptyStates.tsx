import { Heart, MessageCircle, Search, MapPin, ArrowLeft, Compass, User, Plus, RefreshCw, SlidersHorizontal } from "lucide-react";

const WINE = "#8C1515";

/* ─── Single Empty State Phone ─── */
interface EmptyStateConfig {
  type: "favorites" | "messages" | "search";
}

export function EmptyStateScreen({ type }: EmptyStateConfig) {
  const configs = {
    favorites: {
      activeNav: "Favoritos",
      illustration: <FavoritesIllustration />,
      title: "Sin favoritos aún",
      subtitle: "Guarda las propiedades que más te gusten tocando el ❤️ en cada anuncio.",
      actionLabel: "Explorar propiedades",
      actionIcon: <Compass size={16} />,
      secondaryLabel: null,
    },
    messages: {
      activeNav: "Mensajes",
      illustration: <MessagesIllustration />,
      title: "Sin conversaciones",
      subtitle: "Cuando contactes a un arrendador, tus conversaciones aparecerán aquí.",
      actionLabel: "Buscar propiedades",
      actionIcon: <Search size={16} />,
      secondaryLabel: null,
    },
    search: {
      activeNav: "Explorar",
      illustration: <SearchIllustration />,
      title: "Sin resultados",
      subtitle: "No encontramos propiedades con esos filtros. Intenta con una búsqueda diferente.",
      actionLabel: "Limpiar filtros",
      actionIcon: <RefreshCw size={16} />,
      secondaryLabel: "Ajustar búsqueda",
    },
  };

  const cfg = configs[type];

  return (
    <div style={{
      width: 390, height: 844, background: "#F8F9FA",
      fontFamily: "'Inter', sans-serif", borderRadius: 44,
      boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      display: "flex", flexDirection: "column",
      border: "10px solid #1a1a1a", overflow: "hidden", position: "relative"
    }}>
      {/* Status bar */}
      <div style={{ background: "#fff", padding: "14px 28px 12px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>9:41</span>
      </div>

      {/* Header */}
      {type === "search" ? (
        <SearchHeader />
      ) : (
        <div style={{ background: "#fff", padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>
            {type === "favorites" ? "Mis Favoritos" : "Mensajes"}
          </h1>
        </div>
      )}

      {/* Empty State Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 36px", textAlign: "center" }}>
        {/* Illustration */}
        <div style={{ marginBottom: 28 }}>{cfg.illustration}</div>

        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>{cfg.title}</h2>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: "#888", lineHeight: 1.7, maxWidth: 260 }}>{cfg.subtitle}</p>

        {/* CTA Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{
            width: "100%", padding: "14px", background: WINE, border: "none",
            borderRadius: 14, fontSize: 14, fontWeight: 700, color: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {cfg.actionIcon} {cfg.actionLabel}
          </button>
          {cfg.secondaryLabel && (
            <button style={{
              width: "100%", padding: "14px", background: "#fff", border: "1.5px solid #e8eaed",
              borderRadius: 14, fontSize: 14, fontWeight: 600, color: "#555",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <SlidersHorizontal size={16} /> {cfg.secondaryLabel}
            </button>
          )}
        </div>

        {/* Tip Card */}
        <div style={{ marginTop: 24, padding: "12px 16px", background: "#fff", borderRadius: 14, border: "1.5px solid #f0f0f0", width: "100%", textAlign: "left", display: "flex", gap: 10 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            {type === "favorites" && "Puedes filtrar por precio, tipo de habitación y distancia para encontrar la opción ideal."}
            {type === "messages" && "Puedes enviar mensajes directamente desde la página de detalle de cada propiedad."}
            {type === "search" && "Prueba buscar por nombre de calle, barrio o amplía el rango de distancia a la ULEAM."}
          </p>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #f0f0f0",
        padding: "10px 0 24px", display: "flex", justifyContent: "space-around"
      }}>
        {[
          { icon: <Compass size={22} />, label: "Explorar" },
          { icon: <Heart size={22} />, label: "Favoritos" },
          { icon: <MessageCircle size={22} />, label: "Mensajes" },
          { icon: <User size={22} />, label: "Perfil" },
        ].map((item) => {
          const isActive = item.label === cfg.activeNav;
          return (
            <button key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 16px" }}>
              <span style={{ color: isActive ? WINE : "#bbb" }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? WINE : "#bbb" }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, background: WINE, borderRadius: "50%" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Illustrations ─── */
function FavoritesIllustration() {
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      {/* Background circle */}
      <div style={{ width: 160, height: 160, background: "#FEF2F2", borderRadius: "50%" }} />
      {/* Big heart */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Heart size={64} color="#FECACA" fill="#FECACA" />
      </div>
      {/* Floating hearts */}
      {[
        { size: 22, top: 14, left: 50, color: WINE, fill: WINE, opacity: 0.8 },
        { size: 16, top: 30, right: 20, color: "#FECACA", fill: "#FECACA", opacity: 1 },
        { size: 12, bottom: 25, left: 22, color: "#FCA5A5", fill: "#FCA5A5", opacity: 0.7 },
      ].map((h, i) => (
        <div key={i} style={{ position: "absolute", top: h.top, left: h.left, right: h.right, bottom: h.bottom, opacity: h.opacity }}>
          <Heart size={h.size} color={h.color} fill={h.fill} />
        </div>
      ))}
    </div>
  );
}

function MessagesIllustration() {
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <div style={{ width: 160, height: 160, background: "#F0F9FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={64} color="#BFDBFE" fill="#BFDBFE" />
      </div>
      {/* Dots indicating empty */}
      <div style={{ position: "absolute", top: 52, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
        {[1,2,3].map(d => <div key={d} style={{ width: 8, height: 8, background: "#93C5FD", borderRadius: "50%", opacity: 0.6 }} />)}
      </div>
      {/* Plus */}
      <div style={{ position: "absolute", top: 14, right: 22, width: 28, height: 28, background: "#3B82F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={14} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );
}

function SearchIllustration() {
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <div style={{ width: 160, height: 160, background: "#F8F9FA", borderRadius: "50%", border: "2px dashed #e0e0e0" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Search size={56} color="#d0d0d0" />
      </div>
      {/* X mark */}
      <div style={{ position: "absolute", top: 18, right: 22, width: 28, height: 28, background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FECACA" }}>
        <span style={{ fontSize: 14, color: "#EF4444", fontWeight: 800, lineHeight: 1 }}>✕</span>
      </div>
      {/* MapPin */}
      <div style={{ position: "absolute", bottom: 20, left: 22 }}>
        <MapPin size={20} color="#d0d0d0" />
      </div>
    </div>
  );
}

function SearchHeader() {
  return (
    <div style={{ background: "#fff", padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <button style={{ background: "#F8F9FA", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={18} color="#333" />
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#F8F9FA", borderRadius: 12, padding: "10px 14px", border: "1.5px solid #eee" }}>
          <Search size={15} color="#aaa" />
          <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>Cuartos amoblados ULEAM</span>
        </div>
      </div>
      {/* Active filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["$100–$200", "Con Internet", "< 500m"].map(f => (
          <span key={f} style={{ fontSize: 11, padding: "3px 10px", background: `${WINE}10`, color: WINE, borderRadius: 20, fontWeight: 500, border: `1px solid ${WINE}30` }}>{f} ✕</span>
        ))}
      </div>
    </div>
  );
}
