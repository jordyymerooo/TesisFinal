# Guía para Desarrolladores - ULEAM Rental System

## 🚀 Quick Start

Este proyecto contiene un **sistema de diseño completo** con 15 pantallas funcionales organizadas en 5 módulos.

### Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx                          # Navegación principal + showcase
│   ├── components/
│   │   ├── ui/                          # Componentes UI base (shadcn/ui)
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx    # Wrapper para imágenes
│   │   ├── DesignSystemShowcase.tsx     # 🎨 Showcase de tokens
│   │   ├── AuthModule.tsx               # M1 - Autenticación
│   │   ├── StudentMapModule.tsx         # M2 - Flujo estudiante
│   │   ├── LandlordMobileModule.tsx     # M3 - Panel arrendador
│   │   ├── AdminExtendedModule.tsx      # M4 - Admin extendido
│   │   ├── UIStatesModule.tsx           # M5 - Estados UI
│   │   └── [otros componentes...]       # Pantallas individuales
│   └── styles/
│       ├── theme.css                    # Design tokens CSS
│       └── fonts.css                    # Font imports
└── imports/                             # Assets de Figma (si aplica)
```

---

## 🎨 Design System

### Color Palette

```typescript
// Primarios
const WINE_PRIMARY = "#8C1515";      // Rojo vino ULEAM
const WINE_HOVER = "#6B0F0F";
const WINE_LIGHT = "#8C151525";      // 15% opacity

// Semánticos
const SUCCESS = "#10B981";            // Verificado / Disponible
const WARNING = "#F59E0B";            // Pendiente / En revisión
const INFO = "#3B82F6";
const ERROR = "#EF4444";              // Rechazado / Error
```

**Uso:**
```tsx
// ✅ DO
<button style={{ background: "#8C1515", color: "#FFF" }}>CTA Principal</button>
<span style={{ background: "#ECFDF5", color: "#10B981" }}>✓ Verificado</span>

// ❌ DON'T
<button style={{ background: "#FF0000" }}>Usar colores fuera de paleta</button>
```

### Typography

```typescript
// Familias
const FONT_PRIMARY = "'Inter', sans-serif";
const FONT_SECONDARY = "'Roboto', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// Scale
const TEXT_DISPLAY_LG = "32px / 800";    // H1 Desktop
const TEXT_HEADING_LG = "18px / 700";    // H3
const TEXT_BODY_MD = "14px / 400";       // Estándar
const TEXT_CAPTION = "11px / 400";       // Metadatos
```

### Spacing

Basado en escala de **4px**:

```typescript
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,   // Padding interno estándar
  lg: 16,   // Separación entre componentes
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};
```

**Uso en componentes:**
```tsx
<div style={{ padding: 16, gap: 12 }}>  {/* lg y md */}
  <Card style={{ borderRadius: 12 }} /> {/* Estándar = 12px */}
</div>
```

---

## 🧩 Componentes Principales

### Button

```tsx
// Primary CTA
<button style={{
  padding: "12px 24px",
  borderRadius: 12,
  background: "#8C1515",
  color: "#FFF",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif"
}}>
  Solicitar Visita
</button>

// Secondary
<button style={{
  padding: "12px 24px",
  borderRadius: 12,
  background: "transparent",
  border: "1.5px solid #8C1515",
  color: "#8C1515",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer"
}}>
  Ver Detalles
</button>
```

### Badge

```tsx
// Verificado / Disponible
<span style={{
  padding: "4px 12px",
  background: "#ECFDF5",
  color: "#10B981",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  display: "inline-block"
}}>
  ✓ Verificado
</span>

// Pendiente
<span style={{
  padding: "4px 12px",
  background: "#FFFBEB",
  color: "#F59E0B",
  border: "1px solid #FDE68A",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600
}}>
  ● Pendiente
</span>
```

### Card

```tsx
<div style={{
  background: "#FFF",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
}}>
  {/* Contenido */}
</div>
```

### Input

```tsx
<input
  type="text"
  placeholder="Ingresa tu nombre"
  style={{
    width: "100%",
    height: 48,
    padding: "12px 16px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box"
  }}
/>

// Focus state (agregar con :focus-visible)
// border: "1.5px solid #8C1515"
// boxShadow: "0 0 0 3px #8C151520"
```

### Avatar

```tsx
<div style={{
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#8C151520",
  border: "2px solid #8C1515",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  fontWeight: 800,
  color: "#8C1515",
  position: "relative"
}}>
  MG
  {/* Status indicator */}
  <div style={{
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    background: "#10B981",
    borderRadius: "50%",
    border: "2px solid #FFF"
  }} />
</div>
```

---

## 📱 Layouts

### Mobile (390 × 844px)

```tsx
// Bottom Navigation
<nav style={{
  height: 72,
  background: "#FFF",
  borderTop: "1px solid #F0F0F0",
  boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "8px 0"
}}>
  {navItems.map(item => (
    <button key={item.id} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      color: item.active ? "#8C1515" : "#9CA3AF",
      fontSize: 11,
      fontWeight: item.active ? 600 : 400
    }}>
      <span style={{ fontSize: 24 }}>{item.icon}</span>
      {item.label}
    </button>
  ))}
</nav>
```

### Desktop (1440px+)

```tsx
// Sidebar + Main Layout
<div style={{ display: "flex", height: "100vh" }}>
  {/* Sidebar */}
  <aside style={{
    width: 240,
    background: "#1E1E2E",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column"
  }}>
    {/* Logo */}
    <div style={{ marginBottom: 32 }}>Logo</div>
    
    {/* Nav items */}
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map(item => (
        <a key={item.id} style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: item.active ? "#8C151520" : "transparent",
          borderLeft: item.active ? "3px solid #8C1515" : "none",
          color: item.active ? "#FFF" : "rgba(255,255,255,0.65)",
          fontSize: 14,
          fontWeight: item.active ? 600 : 400,
          textDecoration: "none"
        }}>
          {item.icon} {item.label}
        </a>
      ))}
    </nav>
  </aside>

  {/* Main Content */}
  <main style={{
    flex: 1,
    background: "#FAFAFA",
    padding: "32px 48px",
    overflowY: "auto"
  }}>
    {/* Content */}
  </main>
</div>
```

---

## 🎯 Patrones Comunes

### Empty State

```tsx
<div style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 48,
  textAlign: "center"
}}>
  <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }}>
    ❤️
  </div>
  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#4B5563" }}>
    Sin favoritos aún
  </h3>
  <p style={{ margin: "8px 0 24px", fontSize: 13, color: "#9CA3AF", maxWidth: 280 }}>
    Explora propiedades y guarda tus favoritas para encontrarlas fácilmente
  </p>
  <button style={/* primary button */}>
    Explorar Propiedades
  </button>
</div>
```

### Skeleton Loader

```tsx
<div style={{
  display: "flex",
  flexDirection: "column",
  gap: 8
}}>
  <div style={{
    height: 12,
    background: "#E5E7EB",
    borderRadius: 6,
    width: "100%"
  }} />
  <div style={{
    height: 12,
    background: "#E5E7EB",
    borderRadius: 6,
    width: "80%"
  }} />
  <div style={{
    height: 12,
    background: "#E5E7EB",
    borderRadius: 6,
    width: "60%"
  }} />
</div>
```

### Toast Notification (usando Sonner)

```tsx
import { toast } from "sonner";

// Success
toast.success("¡Propiedad publicada!", {
  description: "Tu anuncio está en revisión y será visible pronto"
});

// Error
toast.error("Error al publicar", {
  description: "Revisa los campos obligatorios"
});

// Info
toast.info("Nuevo mensaje", {
  description: "Carlos respondió a tu solicitud"
});
```

---

## 📐 Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 390,    // iPhone 14/15
  tablet: 768,
  desktop: 1440,  // Admin panel mínimo
  wide: 1920
};

// Media queries
const isMobile = window.innerWidth < 768;
const isDesktop = window.innerWidth >= 1440;
```

---

## 🛠️ Utilidades

### Auto Layout Pattern (Flexbox)

```tsx
// Vertical stack con gap
<div style={{
  display: "flex",
  flexDirection: "column",
  gap: 12
}}>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>

// Horizontal row con spacing
<div style={{
  display: "flex",
  alignItems: "center",
  gap: 16,
  justifyContent: "space-between"
}}>
  <Left />
  <Right />
</div>

// Grid responsivo
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 20
}}>
  {cards.map(card => <Card key={card.id} {...card} />)}
</div>
```

### Shadow Utilities

```typescript
const SHADOWS = {
  sm: "0 1px 3px rgba(0,0,0,0.12)",
  md: "0 4px 12px rgba(0,0,0,0.15)",
  lg: "0 8px 24px rgba(0,0,0,0.18)",
  xl: "0 16px 40px rgba(0,0,0,0.25)",
  modal: "0 24px 80px rgba(0,0,0,0.4)"
};
```

---

## ♿ Accesibilidad

### Contraste de Color

```tsx
// ✅ DO
<span style={{ background: "#8C1515", color: "#FFFFFF" }}>
  Contraste 7.8:1
</span>

// ❌ DON'T
<span style={{ background: "#8C1515", color: "#FFB6C1" }}>
  Contraste bajo < 4.5:1
</span>
```

### ARIA Labels

```tsx
<button aria-label="Agregar a favoritos">
  <Heart size={20} />
</button>

<input
  type="search"
  placeholder="Buscar propiedades"
  aria-label="Buscar propiedades por nombre o ubicación"
/>

<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Verificación de Arrendatario</h2>
</div>
```

### Focus States

```tsx
button:focus-visible {
  outline: 2px solid #8C1515;
  outline-offset: 2px;
}
```

### Keyboard Navigation

```tsx
// Asegurar tab order lógico
<button tabIndex={0}>Primero</button>
<button tabIndex={0}>Segundo</button>

// Escape para cerrar modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, [onClose]);
```

---

## 🚨 Errores Comunes

### ❌ Border Radius Inconsistente

```tsx
// MAL
<div style={{ borderRadius: 8 }}>Card 1</div>
<div style={{ borderRadius: 15 }}>Card 2</div>

// BIEN - Siempre 12px
<div style={{ borderRadius: 12 }}>Card 1</div>
<div style={{ borderRadius: 12 }}>Card 2</div>
```

### ❌ Colores Fuera de Paleta

```tsx
// MAL
<button style={{ background: "#DC143C" }}>Button</button>

// BIEN
const WINE = "#8C1515";
<button style={{ background: WINE }}>Button</button>
```

### ❌ Spacing No Múltiplo de 4px

```tsx
// MAL
<div style={{ padding: "15px", gap: 10 }}>Content</div>

// BIEN
<div style={{ padding: 16, gap: 12 }}>Content</div>
```

### ❌ Más de 1 CTA Primario

```tsx
// MAL - Competencia visual
<div>
  <button style={{ background: WINE }}>Acción 1</button>
  <button style={{ background: WINE }}>Acción 2</button>
</div>

// BIEN - Jerarquía clara
<div>
  <button style={{ background: WINE }}>Acción Principal</button>
  <button style={{ border: `1.5px solid ${WINE}`, background: "transparent" }}>
    Acción Secundaria
  </button>
</div>
```

---

## 📦 Componentes UI (shadcn/ui)

Este proyecto incluye componentes de `shadcn/ui` en `src/app/components/ui/`:

```tsx
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Avatar } from "./components/ui/avatar";
import { toast } from "sonner";

// Usar directamente o wrapper con estilos custom
<Button className="bg-wine-primary">CTA</Button>
```

---

## 🔄 Estado y Datos

### Mock Data Pattern

```typescript
const MOCK_PROPERTIES = [
  {
    id: "1",
    title: "Departamento cerca del campus",
    location: "Centro, Manta",
    price: 280,
    images: ["url1", "url2"],
    rooms: 2,
    bathrooms: 1,
    size: 45,
    available: true,
    verified: true,
    landlord: {
      name: "Carlos Pérez",
      avatar: "url",
      rating: 4.8
    }
  },
  // ...
];

// Uso
{MOCK_PROPERTIES.map(property => (
  <PropertyCard key={property.id} {...property} />
))}
```

### Estado con useState

```tsx
const [selectedTab, setSelectedTab] = useState("home");
const [filters, setFilters] = useState({
  minPrice: 0,
  maxPrice: 1000,
  rooms: [],
  services: []
});

// Toggle
const toggleFavorite = (id: string) => {
  setFavorites(prev =>
    prev.includes(id)
      ? prev.filter(fid => fid !== id)
      : [...prev, id]
  );
};
```

---

## 🎬 Animaciones (Motion)

```tsx
import { motion } from "motion/react";

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide up (para bottom sheets)
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  transition={{ type: "spring", damping: 25 }}
>
  Sheet content
</motion.div>

// Scale (para modals)
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
>
  Modal
</motion.div>
```

---

## 🧪 Testing

### Component Testing Pattern

```tsx
// Verificar renderizado
const button = screen.getByRole("button", { name: /solicitar/i });
expect(button).toBeInTheDocument();

// Verificar estilos críticos
expect(button).toHaveStyle({
  background: "#8C1515",
  borderRadius: "12px"
});

// Verificar accesibilidad
expect(button).toHaveAttribute("aria-label");
```

---

## 📚 Recursos

- **Design System Completo:** `DESIGN_SYSTEM.md`
- **Guía de Figma:** `FIGMA_EXPORT_GUIDE.md`
- **Showcase Visual:** Tab "🎨 Design System" en la app
- **Componentes UI:** `src/app/components/ui/`
- **Módulos:** `src/app/components/*Module.tsx`

---

## 🚀 Deployment

### Build

```bash
# NO uses `vite build` directamente
# Este proyecto usa un entrypoint custom
```

### Assets

```tsx
// Imágenes de Figma (si existen)
import img from "figma:asset/hash.png";

// Imágenes locales
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
<ImageWithFallback src={img} alt="Descripción" />
```

---

## 🤝 Contribución

### Antes de crear un PR:

1. ✅ Verificar que sigue el design system
2. ✅ Border radius = 12px en cards
3. ✅ Colores solo de la paleta oficial
4. ✅ Spacing múltiplo de 4px
5. ✅ Contraste de color WCAG AA mínimo
6. ✅ ARIA labels en elementos interactivos
7. ✅ Focus states visibles

---

**Versión:** 2.0  
**Stack:** React 18.3 + Vite 6.3 + Tailwind CSS v4  
**Última actualización:** Junio 2026
