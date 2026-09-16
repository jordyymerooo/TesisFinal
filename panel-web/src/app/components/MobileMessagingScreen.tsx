import { Search, ArrowLeft, MoreVertical, Phone, Video, Send, Smile, Paperclip, Check, CheckCheck, MessageCircle, Heart, User, Compass } from "lucide-react";
import { useState } from "react";

const WINE = "#8C1515";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Carlos Mendoza",
    role: "Arrendador",
    lastMsg: "Claro, puedes pasar mañana a las 10am 👍",
    time: "10:42",
    unread: 2,
    avatar: "CM",
    avatarBg: "#EFF6FF",
    avatarColor: "#3B82F6",
    online: true,
    property: "Mini Depa Olmedo",
  },
  {
    id: 2,
    name: "Rosa Intriago",
    role: "Arrendadora",
    lastMsg: "El precio incluye agua y luz",
    time: "Ayer",
    unread: 0,
    avatar: "RI",
    avatarBg: "#F5F3FF",
    avatarColor: "#8B5CF6",
    online: false,
    property: "Cuarto Amoblado",
  },
  {
    id: 3,
    name: "Sistema ULEAM",
    role: "Notificación",
    lastMsg: "Tu solicitud de alquiler fue aprobada ✅",
    time: "Lun",
    unread: 1,
    avatar: "U",
    avatarBg: `${WINE}15`,
    avatarColor: WINE,
    online: true,
    property: "",
  },
  {
    id: 4,
    name: "Marco Loor",
    role: "Arrendador",
    lastMsg: "Ya no hay disponibilidad para ese mes",
    time: "Dom",
    unread: 0,
    avatar: "ML",
    avatarBg: "#ECFDF5",
    avatarColor: "#10B981",
    online: false,
    property: "Habitación La Paz",
  },
];

const CHAT_MESSAGES = [
  { id: 1, from: "them", text: "Hola! Vi que solicitaste información sobre el mini depa", time: "10:10", read: true },
  { id: 2, from: "me", text: "Sí! Me interesa mucho. ¿Sigue disponible para junio?", time: "10:12", read: true },
  { id: 3, from: "them", text: "Sí, está disponible. ¿Cuándo podrías venir a verlo?", time: "10:15", read: true },
  { id: 4, from: "me", text: "¿Podría ser este fin de semana? El sábado por la tarde", time: "10:18", read: true },
  { id: 5, from: "them", text: "El sábado no puedo, pero el domingo a las 11am estaría bien 👍", time: "10:30", read: true },
  { id: 6, from: "them", text: "Claro, puedes pasar mañana a las 10am 👍", time: "10:42", read: false },
];

interface Props { showChat?: boolean; }

export function MobileMessagingScreen({ showChat = false }: Props) {
  const [activeTab, setActiveTab] = useState<"list" | "chat">(showChat ? "chat" : "list");

  return (
    <div style={{
      width: 390, height: 844,
      background: "#F8F9FA", fontFamily: "'Inter', sans-serif",
      borderRadius: 44, boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      display: "flex", flexDirection: "column",
      border: "10px solid #1a1a1a", overflow: "hidden",
    }}>
      {activeTab === "list" ? (
        <>
          {/* Status Bar */}
          <div style={{ background: "#fff", padding: "14px 28px 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>9:41</span>
          </div>

          {/* Header */}
          <div style={{ background: "#fff", padding: "14px 20px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>Mensajes</h1>
              <button style={{ background: `${WINE}15`, border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <MoreVertical size={18} color={WINE} />
              </button>
            </div>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8F9FA", borderRadius: 14, padding: "10px 14px", border: "1.5px solid #eee" }}>
              <Search size={16} color="#aaa" />
              <span style={{ fontSize: 13, color: "#bbb" }}>Buscar conversación...</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ background: "#fff", padding: "8px 20px 12px", display: "flex", gap: 8, borderBottom: "1px solid #f5f5f5" }}>
            {["Todos", "Arrendadores", "Sistema"].map((tab, i) => (
              <button key={tab} style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: i === 0 ? 600 : 400,
                background: i === 0 ? WINE : "#F8F9FA",
                color: i === 0 ? "#fff" : "#888",
                border: i === 0 ? "none" : "1.5px solid #eee",
                cursor: "pointer"
              }}>{tab}</button>
            ))}
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
            {CONVERSATIONS.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => setActiveTab("chat")}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 20px", background: "#fff",
                  borderBottom: "1px solid #f8f8f8", width: "100%",
                  textAlign: "left", cursor: "pointer", border: "none",
                  borderTop: idx === 0 ? "none" : undefined
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%",
                    background: conv.avatarBg, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${conv.avatarColor}33`
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: conv.avatarColor }}>{conv.avatar}</span>
                  </div>
                  {conv.online && (
                    <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, background: "#10B981", borderRadius: "50%", border: "2px solid #fff" }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{conv.name}</span>
                    <span style={{ fontSize: 11, color: conv.unread > 0 ? WINE : "#bbb", fontWeight: conv.unread > 0 ? 600 : 400 }}>{conv.time}</span>
                  </div>
                  {conv.property && (
                    <span style={{ fontSize: 10, color: "#888", background: "#f5f5f5", padding: "1px 7px", borderRadius: 8, display: "inline-block", marginBottom: 2 }}>{conv.property}</span>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: 8 }}>{conv.lastMsg}</p>
                    {conv.unread > 0 && (
                      <div style={{ width: 20, height: 20, background: WINE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Nav */}
          <BottomNav active="Mensajes" />
        </>
      ) : (
        /* ── Chat View ── */
        <>
          {/* Chat Header */}
          <div style={{ background: "#fff", padding: "14px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>9:41</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setActiveTab("list")} style={{ background: "#F8F9FA", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ArrowLeft size={18} color="#333" />
              </button>
              <div style={{ position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #BFDBFE" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#3B82F6" }}>CM</span>
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: "#10B981", borderRadius: "50%", border: "1.5px solid #fff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Carlos Mendoza</p>
                <p style={{ margin: 0, fontSize: 11, color: "#10B981", fontWeight: 500 }}>En línea · Mini Depa Olmedo</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ background: "#F8F9FA", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Phone size={16} color="#555" />
                </button>
                <button style={{ background: "#F8F9FA", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Video size={16} color="#555" />
                </button>
              </div>
            </div>
          </div>

          {/* Property Card Banner */}
          <div style={{ background: "#fff", padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, border: "1px solid #eee" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1737305473724-896a66064a68?w=100&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>Mini Depa Calle Olmedo</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888" }}>$180/mes · Consulta activa</p>
              </div>
              <span style={{ fontSize: 10, padding: "2px 8px", background: "#FFFBEB", color: "#F59E0B", borderRadius: 8, fontWeight: 600 }}>Pendiente</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: "#F8F9FA" }}>
            {/* Date divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e8eaed" }} />
              <span style={{ fontSize: 10, color: "#bbb", padding: "2px 8px", background: "#fff", borderRadius: 20, border: "1px solid #eee" }}>Hoy</span>
              <div style={{ flex: 1, height: 1, background: "#e8eaed" }} />
            </div>

            {CHAT_MESSAGES.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "10px 14px", borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.from === "me" ? WINE : "#fff",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: msg.from === "me" ? "#fff" : "#1a1a1a", lineHeight: 1.5 }}>{msg.text}</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: msg.from === "me" ? "rgba(255,255,255,0.6)" : "#bbb" }}>{msg.time}</span>
                    {msg.from === "me" && <CheckCheck size={12} color={msg.read ? "#93C5FD" : "rgba(255,255,255,0.5)"} />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ background: "#fff", padding: "12px 16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Paperclip size={20} color="#aaa" /></button>
            <div style={{ flex: 1, background: "#F8F9FA", borderRadius: 22, padding: "10px 14px", border: "1.5px solid #eee", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#bbb", flex: 1 }}>Escribe un mensaje...</span>
              <Smile size={18} color="#aaa" />
            </div>
            <button style={{ width: 42, height: 42, background: WINE, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Send size={18} color="#fff" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const WINE = "#8C1515";
  const items = [
    { icon: <Compass size={22} />, label: "Explorar" },
    { icon: <Heart size={22} />, label: "Favoritos" },
    { icon: <MessageCircle size={22} />, label: "Mensajes" },
    { icon: <User size={22} />, label: "Perfil" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 10, right: 10,
      background: "#fff", borderTop: "1px solid #f0f0f0",
      padding: "10px 0 24px", display: "flex", justifyContent: "space-around"
    }}>
      {items.map((item) => {
        const isActive = item.label === active;
        return (
          <button key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 16px" }}>
            <span style={{ color: isActive ? WINE : "#bbb" }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? WINE : "#bbb" }}>{item.label}</span>
            {isActive && <div style={{ width: 4, height: 4, background: WINE, borderRadius: "50%" }} />}
          </button>
        );
      })}
    </div>
  );
}
