import {
  LayoutDashboard, Users, ShieldCheck, Building2, BarChart3,
  Search, Bell, ChevronDown, TrendingUp, Clock, CheckCircle,
  AlertTriangle, MoreHorizontal, Eye
} from "lucide-react";

const WINE = "#8C1515";

const STATS = [
  { label: "Usuarios Activos", value: "1,284", icon: <Users size={22} color="#3B82F6" />, bg: "#EFF6FF", trend: "+12%", trendUp: true },
  { label: "Propiedades Publicadas", value: "342", icon: <Building2 size={22} color="#10B981" />, bg: "#ECFDF5", trend: "+8%", trendUp: true },
  { label: "Reservas Activas", value: "97", icon: <CheckCircle size={22} color="#F59E0B" />, bg: "#FFFBEB", trend: "+5%", trendUp: true },
  { label: "Reportes Pendientes", value: "14", icon: <AlertTriangle size={22} color="#EF4444" />, bg: "#FEF2F2", trend: "-3%", trendUp: false },
];

const PENDING_USERS = [
  { id: 1, name: "María González Torres", cedula: "1308456789", fecha: "02 May 2026", avatar: "MG", tipo: "Arrendatario" },
  { id: 2, name: "Juan Carlos Mendoza", cedula: "1305678912", fecha: "01 May 2026", avatar: "JM", tipo: "Arrendador" },
  { id: 3, name: "Sofía Palma Reyes", cedula: "1302345678", fecha: "30 Abr 2026", avatar: "SP", tipo: "Arrendatario" },
  { id: 4, name: "Luis Armando Vera", cedula: "1309876543", fecha: "29 Abr 2026", avatar: "LV", tipo: "Arrendador" },
  { id: 5, name: "Camila Intriago Soto", cedula: "1304567891", fecha: "28 Abr 2026", avatar: "CI", tipo: "Arrendatario" },
];

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: true },
  { icon: <Users size={18} />, label: "Usuarios" },
  { icon: <ShieldCheck size={18} />, label: "Verificación" },
  { icon: <Building2 size={18} />, label: "Propiedades" },
  { icon: <BarChart3 size={18} />, label: "Reportes" },
];

interface AdminDashboardProps {
  onOpenModal: () => void;
}

export function AdminDashboard({ onOpenModal }: AdminDashboardProps) {
  return (
    <div style={{
      width: 1440, height: 900, display: "flex",
      fontFamily: "'Inter', sans-serif",
      background: "#F8F9FA", borderRadius: 12,
      boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      overflow: "hidden"
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: "#1E1E2E", display: "flex", flexDirection: "column",
        padding: "0", flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: WINE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>ULEAM Rental</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Panel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p style={{ margin: "0 0 8px 8px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>MENÚ PRINCIPAL</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "10px 12px", borderRadius: 10,
                background: item.active ? `${WINE}22` : "transparent",
                border: item.active ? `1px solid ${WINE}44` : "1px solid transparent",
                color: item.active ? "#fff" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: item.active ? 600 : 400, cursor: "pointer",
                marginBottom: 2, textAlign: "left"
              }}
            >
              <span style={{ color: item.active ? "#ff6b6b" : "rgba(255,255,255,0.4)" }}>{item.icon}</span>
              {item.label}
              {item.active && <div style={{ marginLeft: "auto", width: 6, height: 6, background: WINE, borderRadius: "50%" }} />}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
            <div style={{ width: 34, height: 34, background: WINE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>AD</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff" }}>Admin ULEAM</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header */}
        <div style={{ background: "#fff", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>Dashboard</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Bienvenido, Admin ULEAM · Sábado, 3 Mayo 2026</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8F9FA", border: "1.5px solid #e8eaed", borderRadius: 10, padding: "8px 14px", width: 240 }}>
              <Search size={15} color="#aaa" />
              <input placeholder="Buscar en el sistema..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#555", width: "100%" }} />
            </div>
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button style={{ background: "#F8F9FA", border: "1.5px solid #e8eaed", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Bell size={18} color="#555" />
              </button>
              <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: WINE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>3</span>
              </div>
            </div>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, background: WINE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>AD</span>
              </div>
              <ChevronDown size={14} color="#888" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
            {STATS.map((stat) => (
              <div key={stat.label} style={{
                background: "#fff", borderRadius: 14, padding: "20px 22px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, background: stat.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {stat.icon}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: stat.trendUp ? "#ECFDF5" : "#FEF2F2", borderRadius: 20 }}>
                    <TrendingUp size={11} color={stat.trendUp ? "#10B981" : "#EF4444"} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: stat.trendUp ? "#10B981" : "#EF4444" }}>{stat.trend}</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
            {/* Table Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>Arrendatarios en espera de verificación</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{PENDING_USERS.length} usuarios pendientes de revisión</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ padding: "8px 16px", background: "#F8F9FA", border: "1.5px solid #e8eaed", borderRadius: 8, fontSize: 13, color: "#555", cursor: "pointer" }}>
                  Filtrar
                </button>
                <button style={{ padding: "8px 16px", background: WINE, border: "none", borderRadius: 8, fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  + Exportar
                </button>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  {["Nombre del Usuario", "Cédula", "Tipo", "Fecha de Solicitud", "Estado", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.5, borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PENDING_USERS.map((user, idx) => (
                  <tr key={user.id} style={{ borderBottom: idx < PENDING_USERS.length - 1 ? "1px solid #f8f8f8" : "none", transition: "background 0.15s" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: `${WINE}22`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: WINE }}>{user.avatar}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 13, color: "#555", fontFamily: "monospace" }}>{user.cedula}</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: user.tipo === "Arrendatario" ? "#EFF6FF" : "#F5F3FF", color: user.tipo === "Arrendatario" ? "#3B82F6" : "#8B5CF6" }}>{user.tipo}</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={13} color="#aaa" />
                        <span style={{ fontSize: 13, color: "#888" }}>{user.fecha}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#FFFBEB", color: "#F59E0B" }}>● Pendiente</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <button
                        onClick={onOpenModal}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", background: WINE, border: "none",
                          borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <Eye size={14} /> Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
