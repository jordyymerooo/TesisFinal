const WINE = "#8C1515";

export function DesignSystemShowcase() {
  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", padding: "48px" }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#1F2937" }}>ULEAM Design System</h1>
        <p style={{ margin: "8px 0 0", fontSize: 16, color: "#6B7280" }}>
          Componentes, tokens y patrones del Sistema de Alquiler Estudiantil
        </p>
      </div>

      {/* ═══ COLORES ═══ */}
      <Section title="01 · Paleta de Colores">
        <ColorGroup title="Primarios" colors={[
          { name: "Wine Primary", hex: "#8C1515", usage: "CTA, activos, branding" },
          { name: "Wine Hover", hex: "#6B0F0F", usage: "Hover state" },
          { name: "Wine Light", hex: "#8C151525", usage: "Background 15%" },
        ]} />

        <ColorGroup title="Semánticos" colors={[
          { name: "Success", hex: "#10B981", usage: "Verificado, disponible" },
          { name: "Warning", hex: "#F59E0B", usage: "Pendiente, en revisión" },
          { name: "Info", hex: "#3B82F6", usage: "Información general" },
          { name: "Error", hex: "#EF4444", usage: "Rechazado, error" },
        ]} />

        <ColorGroup title="Neutrales" colors={[
          { name: "Dark Canvas", hex: "#0F1117", usage: "Background oscuro" },
          { name: "Card Dark", hex: "#1E1E2E", usage: "Sidebar, cards" },
          { name: "White", hex: "#FFFFFF", usage: "Superficie clara" },
          { name: "Light BG", hex: "#FAFAFA", usage: "Canvas claro" },
        ]} />
      </Section>

      {/* ═══ TIPOGRAFÍA ═══ */}
      <Section title="02 · Tipografía">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <TypeSample text="Display Large" size={32} weight={800} usage="H1 Desktop" />
          <TypeSample text="Display Medium" size={24} weight={800} usage="H1 Mobile" />
          <TypeSample text="Heading Large" size={18} weight={700} usage="H3" />
          <TypeSample text="Body Large" size={16} weight={400} usage="Párrafos" />
          <TypeSample text="Body Medium" size={14} weight={400} usage="Texto estándar" />
          <TypeSample text="Caption" size={11} weight={400} usage="Metadatos" />
        </div>

        <div style={{ marginTop: 24, padding: 20, background: "#FFF", borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280", marginBottom: 12 }}>Familias tipográficas:</p>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "Inter", fontSize: 16, fontWeight: 600 }}>Inter</p>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>UI, botones, navegación</p>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "Roboto", fontSize: 16, fontWeight: 600 }}>Roboto</p>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Contenido largo, chat</p>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 16, fontWeight: 600 }}>JetBrains Mono</p>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Códigos, IDs técnicos</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SPACING ═══ */}
      <Section title="03 · Espaciado">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {[
            { label: "XS", px: 4 },
            { label: "SM", px: 8 },
            { label: "MD", px: 12 },
            { label: "LG", px: 16 },
            { label: "XL", px: 24 },
            { label: "2XL", px: 32 },
            { label: "3XL", px: 48 },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#FFF", borderRadius: 12 }}>
              <div style={{ width: s.px, height: 40, background: WINE, borderRadius: 4 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontFamily: "monospace" }}>{s.px}px</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ BORDER RADIUS ═══ */}
      <Section title="04 · Border Radius">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "SM · Badges", radius: 8 },
            { label: "MD · Cards", radius: 12 },
            { label: "LG · Modals", radius: 16 },
            { label: "XL · Sheets", radius: 20 },
            { label: "Full · Avatares", radius: 9999 },
          ].map(r => (
            <div key={r.label} style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, background: `${WINE}20`,
                borderRadius: r.radius, border: `2px solid ${WINE}`,
                marginBottom: 8
              }} />
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{r.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>{r.radius}px</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ BOTONES ═══ */}
      <Section title="05 · Botones">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* Primary */}
          <button style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: WINE, color: "#FFF", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "Inter"
          }}>
            Primary Button
          </button>

          {/* Secondary */}
          <button style={{
            padding: "12px 24px", borderRadius: 12,
            border: `1.5px solid ${WINE}`, background: "transparent",
            color: WINE, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "Inter"
          }}>
            Secondary Button
          </button>

          {/* Ghost */}
          <button style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: "rgba(0,0,0,0.04)", color: "#4B5563",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter"
          }}>
            Ghost Button
          </button>

          {/* Disabled */}
          <button disabled style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: "#E5E7EB", color: "#9CA3AF",
            fontSize: 14, fontWeight: 600, cursor: "not-allowed", fontFamily: "Inter"
          }}>
            Disabled Button
          </button>

          {/* Icon Button */}
          <button style={{
            width: 44, height: 44, borderRadius: 12, border: "none",
            background: WINE, color: "#FFF", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            ❤
          </button>
        </div>
      </Section>

      {/* ═══ BADGES ═══ */}
      <Section title="06 · Badges">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Badge color="#10B981" bg="#ECFDF5" label="✓ Verificado" />
          <Badge color="#10B981" bg="#ECFDF5" label="● Disponible" />
          <Badge color="#F59E0B" bg="#FFFBEB" label="● Pendiente" border="#FDE68A" />
          <Badge color="#3B82F6" bg="#EFF6FF" label="ⓘ En Revisión" border="#BFDBFE" />
          <Badge color="#EF4444" bg="#FEF2F2" label="✗ Rechazado" border="#FECACA" />
          <Badge color={WINE} bg={`${WINE}15`} label="Admin" border={`${WINE}50`} />
        </div>
      </Section>

      {/* ═══ INPUTS ═══ */}
      <Section title="07 · Inputs">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 800 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#4B5563" }}>
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              style={{
                width: "100%", height: 48, padding: "12px 16px",
                border: "1.5px solid #E5E7EB", borderRadius: 12,
                fontSize: 14, fontFamily: "Inter", boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#4B5563" }}>
              Email institucional
            </label>
            <input
              type="email"
              placeholder="ejemplo@uleam.edu.ec"
              style={{
                width: "100%", height: 48, padding: "12px 16px",
                border: `1.5px solid ${WINE}`, borderRadius: 12,
                fontSize: 14, fontFamily: "Inter", boxSizing: "border-box",
                boxShadow: `0 0 0 3px ${WINE}20`
              }}
            />
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B7280" }}>Estado: focus</p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#4B5563" }}>
              Búsqueda
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF" }}>🔍</span>
              <input
                type="search"
                placeholder="Buscar propiedades..."
                style={{
                  width: "100%", height: 44, paddingLeft: 44, paddingRight: 16,
                  border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12,
                  fontSize: 14, fontFamily: "Inter", boxSizing: "border-box",
                  background: "rgba(0,0,0,0.02)"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#4B5563" }}>
              Mensaje
            </label>
            <textarea
              placeholder="Escribe tu mensaje..."
              style={{
                width: "100%", height: 80, padding: "12px 16px",
                border: "1.5px solid #E5E7EB", borderRadius: 12,
                fontSize: 14, fontFamily: "Inter", boxSizing: "border-box",
                resize: "none"
              }}
            />
          </div>
        </div>
      </Section>

      {/* ═══ AVATARES ═══ */}
      <Section title="08 · Avatares">
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {[
            { size: 32, label: "Small" },
            { size: 40, label: "Medium" },
            { size: 60, label: "Large" },
            { size: 80, label: "XLarge" },
          ].map(a => (
            <div key={a.size} style={{ textAlign: "center" }}>
              <div style={{
                width: a.size, height: a.size, borderRadius: "50%",
                background: `${WINE}20`, border: `2px solid ${WINE}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: a.size * 0.4, fontWeight: 800, color: WINE,
                marginBottom: 8, position: "relative"
              }}>
                MG
                {a.size >= 40 && (
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: a.size * 0.25, height: a.size * 0.25,
                    background: "#10B981", borderRadius: "50%",
                    border: "2px solid #FFF"
                  }} />
                )}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{a.label}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{a.size}px</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ CARDS ═══ */}
      <Section title="09 · Cards">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {/* Property Card */}
          <div style={{
            background: "#FFF", borderRadius: 12, overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{
              height: 180, background: "linear-gradient(135deg, #E5E7EB, #F3F4F6)",
              position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 48, opacity: 0.3 }}>🏠</span>
              <div style={{
                position: "absolute", top: 12, right: 12,
                padding: "4px 12px", background: "#ECFDF5",
                color: "#10B981", fontSize: 11, fontWeight: 600,
                borderRadius: 20
              }}>
                ● Disponible
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Departamento cerca del campus</h3>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6B7280" }}>📍 Centro, Manta</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: WINE }}>$280<span style={{ fontSize: 12, fontWeight: 400, color: "#9CA3AF" }}>/mes</span></p>
              <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 11, color: "#6B7280" }}>🛏️ 2 hab.</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>🚿 1 baño</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>📏 45m²</span>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div style={{
            background: `linear-gradient(135deg, ${WINE}, #6B0F0F)`,
            borderRadius: 16, padding: 24, color: "#FFF"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800
              }}>
                MG
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>María González</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.8 }}>Estudiante · Ing. Sistemas</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>3</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.8 }}>Solicitudes</p>
              </div>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>8</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.8 }}>Favoritos</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ ESTADOS ═══ */}
      <Section title="10 · Estados de UI">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {/* Skeleton */}
          <div style={{ background: "#FFF", padding: 16, borderRadius: 12 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Skeleton Loader</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 12, background: "#E5E7EB", borderRadius: 6, width: "100%" }} />
              <div style={{ height: 12, background: "#E5E7EB", borderRadius: 6, width: "80%" }} />
              <div style={{ height: 12, background: "#E5E7EB", borderRadius: 6, width: "60%" }} />
            </div>
          </div>

          {/* Toast */}
          <div style={{
            background: "#FFF", padding: "12px 16px", borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{ width: 36, height: 36, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✓</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Éxito</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>Propiedad publicada correctamente</p>
            </div>
          </div>

          {/* Empty State */}
          <div style={{ background: "#FFF", padding: 24, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 8 }}>❤️</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#4B5563" }}>Sin favoritos aún</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>Explora y guarda tus propiedades favoritas</p>
          </div>
        </div>
      </Section>

      {/* ═══ ICONOS ═══ */}
      <Section title="11 · Iconografía">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
          {[
            { icon: "🏠", label: "Propiedad" },
            { icon: "🔍", label: "Buscar" },
            { icon: "❤️", label: "Favorito" },
            { icon: "💬", label: "Mensajes" },
            { icon: "👤", label: "Perfil" },
            { icon: "📍", label: "Ubicación" },
            { icon: "📷", label: "Fotos" },
            { icon: "✓", label: "Verificado" },
            { icon: "⚙️", label: "Ajustes" },
            { icon: "📊", label: "Estadísticas" },
          ].map(i => (
            <div key={i.label} style={{ textAlign: "center", padding: 12, background: "#FFF", borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{i.icon}</div>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{i.label}</p>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}

// ═══ HELPER COMPONENTS ═══

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 12 }}>
        {title}
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </h2>
      {children}
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: Array<{ name: string; hex: string; usage: string }> }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#4B5563" }}>{title}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {colors.map(c => (
          <div key={c.hex} style={{ width: 160 }}>
            <div style={{
              height: 80, background: c.hex, borderRadius: 12,
              border: c.hex.includes("FFF") ? "1px solid #E5E7EB" : "none",
              marginBottom: 8
            }} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{c.name}</p>
            <p style={{ margin: "2px 0", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{c.hex}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>{c.usage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeSample({ text, size, weight, usage }: { text: string; size: number; weight: number; usage: string }) {
  return (
    <div style={{ padding: 16, background: "#FFF", borderRadius: 12 }}>
      <p style={{ margin: "0 0 8px", fontSize: size, fontWeight: weight, lineHeight: 1.4 }}>{text}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>{usage}</p>
        <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{size}px / {weight}</p>
      </div>
    </div>
  );
}

function Badge({ color, bg, label, border }: { color: string; bg: string; label: string; border?: string }) {
  return (
    <span style={{
      padding: "4px 12px", background: bg, color, fontSize: 11,
      fontWeight: 600, borderRadius: 20, display: "inline-block",
      border: border ? `1px solid ${border}` : "none"
    }}>
      {label}
    </span>
  );
}
