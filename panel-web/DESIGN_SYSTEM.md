# Sistema de Diseño ULEAM Rental System

## 🎨 Identidad Visual

### Marca
**ULEAM Rental System** - Plataforma de alquiler estudiantil oficial de la Universidad Laica Eloy Alfaro de Manabí

### Objetivo
Diseño moderno, profesional y accesible que inspira confianza tanto a estudiantes como a administradores universitarios.

---

## 🎨 Paleta de Colores

### Colores Primarios

```css
--color-wine-primary: #8C1515;     /* Rojo vino institucional ULEAM */
--color-wine-hover: #6B0F0F;       /* Hover state */
--color-wine-light: #8C151525;     /* Background 15% */
--color-wine-border: #8C151550;    /* Border 30% */
```

**Uso:**
- Botones primarios (CTA principal)
- Badges de rol administrativo
- Headers y títulos importantes
- Estados activos en navegación
- Logo y branding

### Colores Semánticos

```css
/* Success / Verificado / Disponible */
--color-success: #10B981;
--color-success-light: #ECFDF5;
--color-success-border: #A7F3D0;

/* Warning / Pendiente / En revisión */
--color-warning: #F59E0B;
--color-warning-light: #FFFBEB;
--color-warning-border: #FDE68A;

/* Info / Información general */
--color-info: #3B82F6;
--color-info-light: #EFF6FF;
--color-info-border: #BFDBFE;

/* Error / Rechazado / Crítico */
--color-error: #EF4444;
--color-error-light: #FEF2F2;
--color-error-border: #FECACA;
```

### Colores Neutrales

```css
/* Backgrounds */
--bg-dark: #0F1117;                /* Canvas principal oscuro */
--bg-card: #1E1E2E;                /* Cards y sidebar */
--bg-elevated: #2D2D3E;            /* Modals, dropdowns */
--bg-light: #FAFAFA;               /* Fondos claros */
--bg-white: #FFFFFF;               /* Superficie principal clara */

/* Borders */
--border-subtle: rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.08);
--border-strong: rgba(255,255,255,0.12);

/* Text */
--text-primary: #FFFFFF;           /* Texto principal en oscuro */
--text-secondary: rgba(255,255,255,0.65);
--text-tertiary: rgba(255,255,255,0.35);
--text-dark: #1F2937;              /* Texto en fondos claros */
--text-muted: #6B7280;
```

---

## ✍️ Tipografía

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-secondary: 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Uso:**
- **Inter**: UI general, botones, labels, navegación
- **Roboto**: Contenido largo, descripciones, chat
- **Mono**: Códigos, IDs, datos técnicos

### Type Scale

```css
/* Display - Títulos principales */
--text-display-lg: 32px / 40px / 800;    /* H1 desktop */
--text-display-md: 24px / 32px / 800;    /* H1 mobile */
--text-display-sm: 20px / 28px / 700;    /* H2 */

/* Headings */
--text-heading-lg: 18px / 24px / 700;    /* H3 */
--text-heading-md: 16px / 22px / 700;    /* H4 */
--text-heading-sm: 14px / 20px / 600;    /* H5 */

/* Body */
--text-body-lg: 16px / 24px / 400;       /* Párrafos principales */
--text-body-md: 14px / 20px / 400;       /* Texto estándar */
--text-body-sm: 13px / 18px / 400;       /* Texto secundario */
--text-body-xs: 12px / 16px / 400;       /* Captions */

/* UI Elements */
--text-button-lg: 15px / 1 / 700;        /* Botones grandes */
--text-button-md: 14px / 1 / 600;        /* Botones estándar */
--text-button-sm: 12px / 1 / 600;        /* Botones pequeños */
--text-label: 12px / 1 / 500;            /* Labels de formularios */
--text-caption: 11px / 14px / 400;       /* Metadatos, timestamps */
```

---

## 📐 Spacing System

Basado en escala de **4px**:

```css
--spacing-xs: 4px;      /* Gaps mínimos */
--spacing-sm: 8px;      /* Elementos relacionados */
--spacing-md: 12px;     /* Padding interno de componentes */
--spacing-lg: 16px;     /* Separación entre componentes */
--spacing-xl: 24px;     /* Secciones dentro de una pantalla */
--spacing-2xl: 32px;    /* Entre bloques principales */
--spacing-3xl: 48px;    /* Separación de módulos */
--spacing-4xl: 64px;    /* Margen de página */
```

**Uso:**
- Cards padding: `16px` (mobile), `20px` (desktop)
- Gaps entre items: `12px`
- Margen de sección: `24px-32px`
- Padding de pantalla: `16px` (mobile), `48px` (desktop)

---

## 🔘 Border Radius

```css
--radius-sm: 8px;       /* Badges, pills */
--radius-md: 12px;      /* Cards, botones */
--radius-lg: 16px;      /* Modals, sheets */
--radius-xl: 20px;      /* Bottom sheets destacadas */
--radius-full: 9999px;  /* Avatares, pills circulares */
```

**Estándar:** Cards usan `12px` universalmente

---

## 🎭 Shadows

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.18);
--shadow-xl: 0 16px 40px rgba(0,0,0,0.25);
--shadow-modal: 0 24px 80px rgba(0,0,0,0.4);
```

**Uso:**
- Cards flotantes: `shadow-md`
- Dropdowns: `shadow-lg`
- Modals: `shadow-modal`
- Bottom sheets: `shadow-xl`

---

## 🧩 Componentes Base

### Buttons

#### Primary Button (CTA principal)
```tsx
background: #8C1515
color: #FFFFFF
padding: 12px 24px
border-radius: 12px
font: 14px/1 Inter 600
hover: #6B0F0F
active: scale(0.98)
```

#### Secondary Button (Outline)
```tsx
background: transparent
border: 1.5px solid #8C1515
color: #8C1515
padding: 12px 24px
border-radius: 12px
hover: background #8C151510
```

#### Ghost Button
```tsx
background: transparent
color: rgba(255,255,255,0.65)
padding: 12px 24px
hover: background rgba(255,255,255,0.04)
```

### Badges

#### Verificado / Disponible
```tsx
background: #ECFDF5
color: #10B981
padding: 4px 12px
border-radius: 20px
font: 11px/1 Inter 600
icon: ✓ o ●
```

#### Pendiente / En Revisión
```tsx
background: #FFFBEB
color: #F59E0B
border: 1px solid #FDE68A
```

#### Error / Rechazado
```tsx
background: #FEF2F2
color: #EF4444
border: 1px solid #FECACA
```

### Cards

#### Property Card (Lista)
```tsx
width: 100%
height: auto
background: #FFFFFF
border-radius: 12px
padding: 12px
shadow: 0 2px 8px rgba(0,0,0,0.08)

Estructura:
- Image (carrusel si > 1 foto)
- Badge status (top-right overlay)
- Título (14px/700)
- Ubicación (12px/400 con ícono)
- Precio destacado (18px/800 color wine)
- Metadata row (habitaciones, baños)
```

#### Profile Card
```tsx
background: linear-gradient(135deg, #8C1515, #6B0F0F)
border-radius: 16px
padding: 24px
color: white
```

### Inputs

#### Text Input
```tsx
height: 48px
padding: 12px 16px
border: 1.5px solid rgba(0,0,0,0.1)
border-radius: 12px
font: 14px/1 Inter 400
focus: border #8C1515, shadow 0 0 0 3px #8C151520
```

#### Search Input
```tsx
height: 44px
background: rgba(255,255,255,0.08)
border: 1px solid rgba(255,255,255,0.12)
padding-left: 40px (para ícono)
placeholder: rgba(255,255,255,0.35)
```

### Avatars

```tsx
Small: 32px × 32px
Medium: 40px × 40px
Large: 60px × 60px
XLarge: 80px × 80px

border-radius: 50%
Fallback: Iniciales en background wine
Status indicator: 10px dot absolute bottom-right
```

---

## 📱 Mobile Navigation

### Bottom Tab Bar
```tsx
height: 72px (safe-area-inset-bottom incluido)
background: #FFFFFF
border-top: 1px solid #F0F0F0
shadow: 0 -2px 12px rgba(0,0,0,0.08)

Items:
- Icon + Label
- Active state: color #8C1515, font-weight 600
- Inactive: color #9CA3AF
- Icon size: 24px
```

### Top Header (Mobile)
```tsx
height: 56px
padding: 12px 16px
background: #FFFFFF
border-bottom: 1px solid #F0F0F0

Variantes:
- Con back button (left)
- Título centrado o left-aligned
- Acción secundaria (right): ⋮ o ✓
```

---

## 🖥️ Desktop Layout

### Sidebar
```tsx
width: 240px
background: #1E1E2E
height: 100vh
padding: 24px 16px

Logo: top 24px
Nav items: gap 4px
Active item: background #8C151520, border-left 3px #8C1515
```

### Content Area
```tsx
padding: 32px 48px
background: #FAFAFA
min-height: 100vh
```

### Header Desktop
```tsx
height: 72px
background: #FFFFFF
border-bottom: 1px solid #E5E7EB
padding: 0 48px
display: search + notifications + avatar
```

---

## 🎯 Componentes Específicos

### Property Image Carousel
- Aspect ratio: 4:3
- Indicators: dots 6px, active wine
- Nav arrows: overlay con blur background
- Badge overlay: top-right 12px margin

### Chat Bubble
```tsx
Outgoing (user):
  background: #8C1515
  color: white
  border-radius: 16px 16px 4px 16px
  max-width: 75%
  align-self: flex-end

Incoming:
  background: #F3F4F6
  color: #1F2937
  border-radius: 16px 16px 16px 4px
  align-self: flex-start
```

### Skeleton Loader
```tsx
background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)
animation: shimmer 1.5s infinite
border-radius: heredado del componente
```

### Empty State
```tsx
Centrado vertical y horizontal
Ilustración: 120px × 120px opacity 0.7
Título: 16px/700 color muted
Descripción: 13px/400 max-width 280px
CTA: primary button
```

---

## ♿ Accesibilidad

### Contraste
- Texto sobre wine (#8C1515): Solo blanco (#FFFFFF)
- Texto sobre fondos claros: Mínimo #4B5563
- Badges: Contraste 4.5:1 mínimo

### Focus States
```tsx
outline: 2px solid #8C1515
outline-offset: 2px
```

### Touch Targets (Mobile)
- Mínimo: 44px × 44px
- Recomendado: 48px × 48px
- Separación mínima: 8px

### Screen Readers
- Todos los íconos: `aria-label`
- Formularios: asociar `<label>` con `htmlFor`
- Modals: `role="dialog"` + `aria-modal="true"`
- Imágenes decorativas: `aria-hidden="true"`

---

## 📦 Módulos del Sistema

### M1 - Autenticación
- Login, Recuperar contraseña, Ajustes
- Formularios centrados en canvas
- Validación inline con iconos

### M2 - Exploración Estudiante
- Cards grid 2 columnas (mobile) / 3-4 (desktop)
- Filtros como chips desmontables
- Mapa fullscreen con bottom sheet

### M3 - Panel Arrendador
- Lista de propiedades con edición inline
- Stepper de publicación (3 pasos)
- Upload zone con preview

### M4 - Admin Desktop
- Sidebar + content layout
- Tablas con acciones por fila
- Modals para revisión detallada

### M5 - Estados UI
- Skeleton 1:1 con componente real
- Toast top-right, auto-dismiss 4s
- Empty states con ilustración + CTA

---

## 🚀 Guidelines de Uso

### ✅ DO
- Usar wine (#8C1515) SOLO para acciones primarias críticas
- Mantener border-radius 12px en todos los cards
- Espaciado múltiplo de 4px
- Badges con íconos para mejor escaneo
- Toast notifications para feedback temporal
- Skeleton loader mientras carga contenido

### ❌ DON'T
- No usar más de 1 CTA primario por pantalla
- No mezclar border-radius diferentes
- No usar colores fuera de la paleta
- No poner texto directamente sobre fotos sin overlay
- No apilar más de 2 modals
- No badges sin contexto (siempre con label)

---

## 📐 Breakpoints

```css
/* Mobile first */
--mobile: 390px;        /* iPhone 14/15 */
--tablet: 768px;
--desktop: 1440px;      /* Admin panel mínimo */
--wide: 1920px;
```

---

## 🎨 Recursos Figma

### Auto Layout
Todos los componentes usan Auto Layout con:
- Direction: Vertical/Horizontal según contexto
- Spacing: Basado en spacing system
- Padding: Múltiplo de 4px
- Resizing: Hug content o Fill container

### Component Variants
- State: default, hover, active, disabled
- Size: sm, md, lg
- Type: primary, secondary, ghost

### Design Tokens (Variables Figma)
Todos los colores, espaciados y radii como variables reutilizables

---

## 📝 Changelog

**v2.0** (Junio 2026)
- Sistema completo de 15 pantallas
- 5 módulos funcionales
- Design tokens documentados
- Componentes reutilizables
- Soporte mobile + desktop

---

**Desarrollado para ULEAM Rental System**  
Universidad Laica Eloy Alfaro de Manabí  
© 2026
