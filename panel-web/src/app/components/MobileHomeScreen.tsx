import { useState, useEffect } from "react";
import { Search, Heart, MapPin, Home, Star, Wifi, Coffee, ChevronRight, Bell, MessageCircle, User, Compass, Database } from "lucide-react";
import { inmuebleService, authService } from "../api/services";

const WINE = "#8C1515";
const PROPERTIES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1674162406360-df5ec5eb97e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcm9vbSUyMGFwYXJ0bWVudCUyMHJlbnRhbCUyMGZ1cm5pc2hlZHxlbnwxfHx8fDE3Nzc4MzQ5Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Cuarto Amoblado cerca ULEAM",
    price: "$130 / mes",
    location: "Av. Universitaria, 200m",
    verified: true,
    stars: 4.8,
    tag: "Cuarto",
    isLiveApi: false,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1737305473724-896a66064a68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzc3ODM0OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Mini Depa con Internet y Baño",
    price: "$180 / mes",
    location: "Calle Olmedo, 350m",
    verified: true,
    stars: 4.6,
    tag: "Mini Depa",
    isLiveApi: false,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1742094561291-069d8f61a34a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGFwYXJ0bWVudCUyMGJlZHJvb20lMjB1bml2ZXJzaXR5fGVufDF8fHx8MTc3NzgzNDk0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Habitación Individual + Cocina",
    price: "$150 / mes",
    location: "Barrio La Paz, 450m",
    verified: false,
    stars: 4.2,
    tag: "Cuarto",
    isLiveApi: false,
  },
];

const FILTERS = ["Todos", "Cuartos", "Mini Depas", "Con Internet", "Amoblado", "Económico"];

export function MobileHomeScreen() {
  const [items, setItems] = useState<any[]>(PROPERTIES);
  const [currentUser, setCurrentUser] = useState<any>(authService.getCurrentUser());
  const [isFromDb, setIsFromDb] = useState(false);

  useEffect(() => {
    inmuebleService.getInmuebles()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          const liveProps = res.data.map((item) => ({
            id: item.id_inmueble,
            image: item.fotografias?.[0]?.url || PROPERTIES[0].image,
            title: item.titulo,
            price: `$${parseFloat(String(item.precio)).toFixed(0)} / mes`,
            location: item.ubicacion?.sector
              ? `${item.ubicacion.sector}, ${item.ubicacion.distancia_uleam_km || '0.5'}km`
              : (item.ubicacion?.direccion_referencial || "Manta, cerca ULEAM"),
            verified: true,
            stars: 4.9,
            tag: item.tipo === "suite" ? "Suite" : (item.tipo === "mini_departamento" ? "Mini Depa" : "Cuarto"),
            isLiveApi: true,
          }));
          setItems(liveProps);
          setIsFromDb(true);
        }
      })
      .catch(() => {
        // Fallback a prototipo estático si el backend no está disponible
      });
  }, []);

  const userName = currentUser?.nombres ? currentUser.nombres.split(" ")[0] : "Andrea";
  const userPhoto = currentUser?.perfil?.foto_perfil_url || "https://images.unsplash.com/photo-1740512380326-12ea7fc64c53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 390,
        height: 844,
        background: "#F8F9FA",
        fontFamily: "'Inter', sans-serif",
        borderRadius: 44,
        boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px #e5e7eb inset",
        display: "flex",
        flexDirection: "column",
        border: "10px solid #1a1a1a",
      }}
    >
      {/* Status Bar */}
      <div style={{ background: "#fff", padding: "14px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 16, height: 8, border: "1.5px solid #111", borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", top: 1, left: 1, right: 3, bottom: 1, background: "#111", borderRadius: 1 }} />
            <div style={{ position: "absolute", top: 2, right: -4, width: 2, height: 4, background: "#111", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Buenos días 👋</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: "2px 0 0" }}>Hola, {userName}</h1>
        </div>
        <div style={{ position: "relative" }}>
          <img
            src={userPhoto}
            alt="avatar"
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2.5px solid ${WINE}` }}
          />
          <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, background: "#10B981", borderRadius: "50%", border: "2px solid #fff" }} />
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "8px 20px 12px", background: "#fff" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#F8F9FA", borderRadius: 14,
          padding: "12px 16px", border: "1.5px solid #e8eaed"
        }}>
          <Search size={18} color="#888" />
          <span style={{ fontSize: 14, color: "#aaa" }}>Buscar cerca de la ULEAM...</span>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ padding: "4px 0 12px", background: "#fff", overflowX: "auto", display: "flex", gap: 8, paddingLeft: 20, paddingRight: 20 }}>
        {FILTERS.map((f, i) => (
          <button
            key={f}
            style={{
              flexShrink: 0, padding: "7px 16px", borderRadius: 20,
              border: i === 0 ? "none" : "1.5px solid #e0e0e0",
              background: i === 0 ? WINE : "#fff",
              color: i === 0 ? "#fff" : "#555",
              fontSize: 13, fontWeight: i === 0 ? 600 : 400, cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Cerca de ti</h2>
          {isFromDb && (
            <span style={{ fontSize: 10, background: "#ECFDF5", color: "#059669", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
              ● BD PostgreSQL
            </span>
          )}
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 2, color: WINE, fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
          Ver todo <ChevronRight size={15} />
        </button>
      </div>

      {/* Property Cards List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 80 }}>
        {items.map((prop) => (
          <div key={prop.id} style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            overflow: "hidden", cursor: "pointer"
          }}>
            {/* Image Section */}
            <div style={{ position: "relative", height: 160 }}>
              <img src={prop.image} alt={prop.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Gradient overlay bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, rgba(0,0,0,0.3))" }} />
              {/* Heart */}
              <button style={{
                position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.92)",
                border: "none", borderRadius: "50%", width: 34, height: 34,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                <Heart size={16} color={WINE} />
              </button>
              {/* Verified Badge */}
              {prop.verified && (
                <div style={{
                  position: "absolute", bottom: 10, left: 10,
                  background: "#10B981", borderRadius: 20,
                  padding: "3px 10px", display: "flex", alignItems: "center", gap: 4
                }}>
                  <div style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%" }} />
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Arrendatario Verificado</span>
                </div>
              )}
              {/* Tag Pill */}
              <div style={{
                position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.55)",
                borderRadius: 20, padding: "3px 10px"
              }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>{prop.tag}</span>
              </div>
            </div>
            {/* Card Info */}
            <div style={{ padding: "12px 14px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a1a", flex: 1, paddingRight: 8 }}>{prop.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{prop.stars}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: WINE }}>{prop.price}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} color="#888" />
                  <span style={{ fontSize: 12, color: "#888" }}>{prop.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #f0f0f0",
        padding: "10px 0 24px", display: "flex", justifyContent: "space-around", alignItems: "center"
      }}>
        {[
          { icon: <Compass size={22} color={WINE} />, label: "Explorar", active: true },
          { icon: <Heart size={22} color="#bbb" />, label: "Favoritos", active: false },
          { icon: <MessageCircle size={22} color="#bbb" />, label: "Mensajes", active: false },
          { icon: <User size={22} color="#bbb" />, label: "Perfil", active: false },
        ].map((item) => (
          <button key={item.label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "4px 16px"
          }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: item.active ? 600 : 400, color: item.active ? WINE : "#bbb" }}>{item.label}</span>
            {item.active && <div style={{ width: 4, height: 4, background: WINE, borderRadius: "50%" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
