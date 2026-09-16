import { ArrowLeft, Heart, Share2, Star, MapPin, Wifi, Zap, Droplets, Sofa, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const WINE = "#8C1515";

const IMAGES = [
  "https://images.unsplash.com/photo-1737305473724-896a66064a68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzc3ODM0OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1680492260834-11e9edc1c59a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwcm9vbSUyMHJlbnRhbCUyMGZ1cm5pc2hlZCUyMGtpdGNoZW58ZW58MXx8fHwxNzc3ODM0OTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const SERVICES = [
  { icon: <Droplets size={20} color="#3B82F6" />, label: "Agua", bg: "#EFF6FF" },
  { icon: <Zap size={20} color="#F59E0B" />, label: "Luz", bg: "#FFFBEB" },
  { icon: <Wifi size={20} color="#8B5CF6" />, label: "Internet", bg: "#F5F3FF" },
  { icon: <Sofa size={20} color="#10B981" />, label: "Amoblado", bg: "#ECFDF5" },
];

const RULES = [
  { ok: true, text: "Solo para estudiantes ULEAM" },
  { ok: true, text: "Se permite cocinar" },
  { ok: true, text: "Mascotas pequeñas permitidas" },
  { ok: false, text: "No se permiten fiestas" },
  { ok: false, text: "No fumar en interiores" },
];

export function MobileDetailScreen() {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div
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
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Hero Image Carousel */}
      <div style={{ position: "relative", height: 260, flexShrink: 0 }}>
        <img
          src={IMAGES[imgIdx]}
          alt="property"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Top gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(rgba(0,0,0,0.45), transparent)" }} />
        {/* Bottom gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.25))" }} />

        {/* Status bar */}
        <div style={{ position: "absolute", top: 14, left: 28, right: 28, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>9:41</span>
        </div>

        {/* Header Buttons */}
        <div style={{ position: "absolute", top: 40, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
            <ArrowLeft size={18} color="#1a1a1a" />
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
              <Share2 size={16} color="#1a1a1a" />
            </button>
            <button style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
              <Heart size={16} color={WINE} />
            </button>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.55)", border: "none", cursor: "pointer", transition: "width 0.2s", padding: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
        {/* Main Info Card */}
        <div style={{ background: "#fff", margin: "0", padding: "18px 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a1a", flex: 1, paddingRight: 12 }}>Mini Depa con Internet y Baño Privado</h1>
            <div style={{ background: "#ECFDF5", borderRadius: 20, padding: "4px 12px", flexShrink: 0 }}>
              <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>● Disponible</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <MapPin size={14} color="#888" />
            <span style={{ fontSize: 13, color: "#888" }}>Calle Olmedo 245, cerca ULEAM · 350m</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: WINE }}>$180</span>
            <span style={{ fontSize: 15, color: "#888", fontWeight: 400 }}> / mes</span>
          </div>
        </div>

        {/* Landlord Profile */}
        <div style={{ background: "#fff", margin: "8px 0 0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
          <img
            src="https://images.unsplash.com/photo-1668903678359-e810dd966016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
            alt="landlord"
            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${WINE}` }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Carlos Mendoza</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>Arrendador · Miembro desde 2021</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={15} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>4.8</span>
            <span style={{ fontSize: 12, color: "#888" }}>(23)</span>
          </div>
        </div>

        {/* Services Grid */}
        <div style={{ background: "#fff", margin: "8px 0 0", padding: "16px 20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Servicios incluidos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            {SERVICES.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", background: s.bg, borderRadius: 12 }}>
                {s.icon}
                <span style={{ fontSize: 11, fontWeight: 500, color: "#444", textAlign: "center" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div style={{ background: "#fff", margin: "8px 0 0", padding: "16px 20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Reglas del inmueble</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RULES.map((r) => (
              <div key={r.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: r.ok ? "#ECFDF5" : "#FEF2F2",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {r.ok ? <Check size={12} color="#10B981" strokeWidth={3} /> : <X size={12} color="#EF4444" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 13, color: "#444" }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #f0f0f0",
        padding: "14px 20px 28px",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 22, fontWeight: 800, color: WINE }}>$180</span>
            <span style={{ fontSize: 13, color: "#888" }}>/mes</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=5 ? "#F59E0B" : "#ddd"} color={s<=5 ? "#F59E0B" : "#ddd"} />)}
          </div>
        </div>
        <button style={{
          width: "100%", padding: "15px", background: WINE, color: "#fff",
          border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
          cursor: "pointer", letterSpacing: 0.3
        }}>
          Solicitar Alquiler
        </button>
      </div>
    </div>
  );
}
