import { ArrowLeft, Settings, Star, MapPin, Edit3, Bell, Shield, HelpCircle, LogOut, ChevronRight, Heart, MessageCircle, Compass, User, CheckCircle, Clock, Home } from "lucide-react";

const WINE = "#8C1515";

const STATS = [
  { label: "Solicitudes", value: "3" },
  { label: "Favoritos", value: "12" },
  { label: "Reseñas", value: "1" },
];

const ACTIVE_RENTAL = {
  title: "Mini Depa Calle Olmedo",
  price: "$180/mes",
  landlord: "Carlos Mendoza",
  since: "01 Abril 2026",
  ends: "30 Junio 2026",
  status: "Activo",
  img: "https://images.unsplash.com/photo-1737305473724-896a66064a68?w=400&q=80",
};

const MENU_SECTIONS = [
  {
    title: "Mi Cuenta",
    items: [
      { icon: <Edit3 size={18} color="#3B82F6" />, label: "Editar perfil", bg: "#EFF6FF" },
      { icon: <Bell size={18} color="#F59E0B" />, label: "Notificaciones", bg: "#FFFBEB", badge: "3" },
      { icon: <Shield size={18} color="#10B981" />, label: "Privacidad y seguridad", bg: "#ECFDF5" },
    ],
  },
  {
    title: "Soporte",
    items: [
      { icon: <HelpCircle size={18} color="#8B5CF6" />, label: "Centro de ayuda", bg: "#F5F3FF" },
      { icon: <Star size={18} color="#F59E0B" />, label: "Calificar la app", bg: "#FFFBEB" },
    ],
  },
];

export function MobileProfileScreen() {
  return (
    <div style={{
      width: 390, height: 844, background: "#F8F9FA",
      fontFamily: "'Inter', sans-serif", borderRadius: 44,
      boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      display: "flex", flexDirection: "column",
      border: "10px solid #1a1a1a", overflow: "hidden", position: "relative"
    }}>
      {/* Hero Header with Gradient */}
      <div style={{
        background: `linear-gradient(160deg, ${WINE} 0%, #5c0d0d 100%)`,
        padding: "14px 20px 28px", position: "relative", overflow: "hidden"
      }}>
        {/* Pattern overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>9:41</span>
          <button style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Settings size={16} color="#fff" />
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1740512380326-12ea7fc64c53?w=200&q=80"
              alt="profile"
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.8)" }}
            />
            <button style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, background: "#10B981", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Edit3 size={10} color="#fff" />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: "#fff" }}>Andrea Soledispa</h1>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>andrea.soledispa@live.uleam.edu.ec</p>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(255,255,255,0.15)", borderRadius: 20, color: "#fff", fontWeight: 500 }}>Estudiante</span>
              <span style={{ fontSize: 11, padding: "3px 10px", background: "#10B98130", borderRadius: 20, color: "#6EE7B7", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle size={10} />Verificada
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", marginTop: 20, background: "rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", position: "relative" }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{stat.value}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* Active Rental Card */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Alquiler activo</h3>
            <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600, padding: "3px 10px", background: "#ECFDF5", borderRadius: 20 }}>● Activo</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <div style={{ position: "relative", height: 100 }}>
              <img src={ACTIVE_RENTAL.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.5))" }} />
              <div style={{ position: "absolute", bottom: 8, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>{ACTIVE_RENTAL.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Arrendador: {ACTIVE_RENTAL.landlord}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ACTIVE_RENTAL.price}</span>
              </div>
            </div>
            <div style={{ padding: "10px 14px", display: "flex", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={12} color="#888" />
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "#aaa" }}>Desde</p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#555" }}>{ACTIVE_RENTAL.since}</p>
                </div>
              </div>
              <div style={{ width: 1, background: "#f0f0f0" }} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={12} color="#F59E0B" />
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "#aaa" }}>Vence</p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#F59E0B" }}>{ACTIVE_RENTAL.ends}</p>
                </div>
              </div>
              <button style={{ padding: "6px 12px", background: WINE, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div style={{ margin: "0 16px 8px" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12, border: "1.5px solid #A7F3D0" }}>
            <div style={{ width: 40, height: 40, background: "#ECFDF5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color="#10B981" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#065F46" }}>Cuenta verificada</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6EE7B7" }}>Arrendatario confiable · Cédula validada</p>
            </div>
            <CheckCircle size={20} color="#10B981" />
          </div>
        </div>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} style={{ margin: "8px 16px 0" }}>
            <p style={{ margin: "0 0 8px 2px", fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: 0.5 }}>{section.title.toUpperCase()}</p>
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #f0f0f0" }}>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%",
                    padding: "13px 16px", background: "none", border: "none",
                    borderBottom: i < section.items.length - 1 ? "1px solid #f8f8f8" : "none",
                    cursor: "pointer", textAlign: "left"
                  }}
                >
                  <div style={{ width: 34, height: 34, background: item.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#333" }}>{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: WINE, color: "#fff", padding: "2px 7px", borderRadius: 20 }}>{item.badge}</span>
                  )}
                  <ChevronRight size={16} color="#ccc" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div style={{ margin: "12px 16px 0" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "13px 16px", background: "#FEF2F2", borderRadius: 14,
            border: "1.5px solid #FECACA", cursor: "pointer"
          }}>
            <LogOut size={18} color="#EF4444" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Cerrar sesión</span>
          </button>
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
          const isActive = item.label === "Perfil";
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
