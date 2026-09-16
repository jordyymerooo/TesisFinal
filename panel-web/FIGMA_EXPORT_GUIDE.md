# Guía de Exportación a Figma

## 📋 Resumen

Este documento detalla cómo transferir el **ULEAM Rental System Design System** desde el código actual hacia Figma para crear una librería de componentes reutilizable.

---

## 🎯 Objetivos

- ✅ Crear design tokens (variables) en Figma
- ✅ Construir componentes base con Auto Layout
- ✅ Organizar las 15 pantallas en frames
- ✅ Establecer biblioteca compartida para el equipo

---

## 📦 Estructura del Archivo Figma

```
📁 ULEAM Rental System
├── 🎨 Design Tokens (Cover page)
├── 🧩 Components Library
│   ├── 🔘 Buttons
│   ├── 🏷️ Badges
│   ├── 🖼️ Cards
│   ├── ✍️ Inputs & Forms
│   ├── 👤 Avatars
│   ├── 🔔 Notifications & Toasts
│   └── ⏳ Loading States
├── 📱 Mobile Screens (390 × 844px)
│   ├── M1 - Auth Module
│   ├── M2 - Student Flow
│   ├── M3 - Landlord Panel
│   └── Onboarding & Empty States
└── 🖥️ Desktop Screens (1440px mínimo)
    ├── M4 - Admin Dashboard
    └── Admin Extended
```

---

## 🎨 PASO 1: Crear Variables de Figma (Design Tokens)

### A. Color Tokens

**Crear colección "ULEAM Colors":**

#### Primarios
```
wine/primary     → #8C1515
wine/hover       → #6B0F0F
wine/light       → #8C151525 (15% opacity)
wine/border      → #8C151550 (30% opacity)
```

#### Semánticos
```
success          → #10B981
success/light    → #ECFDF5
warning          → #F59E0B
warning/light    → #FFFBEB
info             → #3B82F6
info/light       → #EFF6FF
error            → #EF4444
error/light      → #FEF2F2
```

#### Neutrales
```
bg/dark          → #0F1117
bg/card-dark     → #1E1E2E
bg/white         → #FFFFFF
bg/light         → #FAFAFA
text/primary     → #1F2937
text/secondary   → #6B7280
text/tertiary    → #9CA3AF
border/subtle    → #E5E7EB
border/default   → #D1D5DB
```

**Cómo crear:**
1. En Figma: Menu → Variables → Create collection
2. Nombrar "ULEAM Colors"
3. Agregar cada token con el formato `grupo/nombre`
4. Usar estos tokens en todos los componentes

---

### B. Spacing Tokens

**Crear colección "ULEAM Spacing":**

```
xs    → 4px
sm    → 8px
md    → 12px
lg    → 16px
xl    → 24px
2xl   → 32px
3xl   → 48px
4xl   → 64px
```

**Aplicación:**
- Gap entre elementos: `sm` o `md`
- Padding de cards: `lg` (mobile), `xl` (desktop)
- Margen de sección: `xl` o `2xl`

---

### C. Radius Tokens

**Crear colección "ULEAM Radius":**

```
sm    → 8px   (badges, pills)
md    → 12px  (cards, buttons) ← ESTÁNDAR
lg    → 16px  (modals)
xl    → 20px  (bottom sheets)
full  → 9999px (avatares)
```

---

### D. Typography Tokens

**Crear Text Styles:**

#### Display
```
Display/Large    → Inter 32px / Bold (800) / 40px line
Display/Medium   → Inter 24px / Bold (800) / 32px line
Display/Small    → Inter 20px / Bold (700) / 28px line
```

#### Headings
```
Heading/Large    → Inter 18px / Bold (700) / 24px line
Heading/Medium   → Inter 16px / Bold (700) / 22px line
Heading/Small    → Inter 14px / Semibold (600) / 20px line
```

#### Body
```
Body/Large       → Inter 16px / Regular / 24px line
Body/Medium      → Inter 14px / Regular / 20px line
Body/Small       → Inter 13px / Regular / 18px line
Caption          → Inter 11px / Regular / 14px line
```

#### UI
```
Button/Large     → Inter 15px / Semibold (600)
Button/Medium    → Inter 14px / Semibold (600)
Label            → Inter 12px / Medium (500)
```

---

## 🧩 PASO 2: Componentes Base

### 🔘 Component 1: Button

**Crear componente "Button" con variantes:**

#### Propiedades
- **Type:** Primary, Secondary, Ghost
- **Size:** Small, Medium, Large
- **State:** Default, Hover, Active, Disabled

#### Primary Button (Default/Medium)
```
Auto Layout: Horizontal
Padding: 12px horizontal, 24px vertical
Gap: 8px
Fill: {wine/primary}
Corner radius: {radius/md} = 12px
Text: {Button/Medium} color white
```

#### Secondary Button
```
Fill: transparent
Stroke: 1.5px {wine/primary}
Text color: {wine/primary}
```

#### Configurar Auto Layout
1. Seleccionar frame
2. Shift + A (Auto Layout)
3. Configurar: Horizontal, Hug contents
4. Padding: 12px 24px
5. Gap: 8px (si tiene ícono)

---

### 🏷️ Component 2: Badge

**Variantes:**
- **Type:** Success, Warning, Info, Error
- **Size:** Small, Medium

#### Success Badge
```
Auto Layout: Horizontal
Padding: 4px 12px
Gap: 4px
Fill: {success/light}
Border radius: 20px (pill)
Text: 11px/Semibold color {success}
Prefijo opcional: ● o ✓ (como ícono)
```

---

### 🖼️ Component 3: Property Card

#### Estructura
```
Frame "PropertyCard" (Auto Layout Vertical)
├── Image Container (Auto Layout)
│   ├── Cover Image (4:3 ratio)
│   └── Badge Overlay (position: absolute top-right)
├── Content (Auto Layout Vertical, padding 12px)
│   ├── Title (Heading/Small)
│   ├── Location (Body/Small with icon)
│   ├── Price (Display/Small color wine)
│   └── Metadata Row (Auto Layout Horizontal, gap 12px)
│       ├── 🛏️ Rooms
│       ├── 🚿 Bathrooms
│       └── 📏 Size
```

#### Configuración
- Width: Fill container o 320px fixed
- Fill: white
- Border radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)

---

### ✍️ Component 4: Input

**Variantes:**
- **Type:** Text, Search, Email, Password
- **State:** Default, Focus, Error, Disabled

#### Text Input (Default)
```
Auto Layout: Vertical
├── Label (optional)
│   Text: {Label} color {text/secondary}
│   Margin bottom: 6px
└── Input Container
    Auto Layout: Horizontal
    Height: 48px
    Padding: 12px 16px
    Fill: white
    Stroke: 1.5px {border/default}
    Corner radius: 12px
    Text: {Body/Medium}
```

#### Focus State
```
Stroke: {wine/primary}
Shadow: 0 0 0 3px {wine/light}
```

---

### 👤 Component 5: Avatar

**Variantes:**
- **Size:** Small (32px), Medium (40px), Large (60px), XLarge (80px)
- **Status:** None, Online, Offline, Busy

#### Medium Avatar
```
Circle: 40 × 40px
Fill: {wine/light}
Stroke: 2px {wine/primary}
Initials: {Heading/Small} color {wine/primary}

Status indicator (if enabled):
  Circle: 10 × 10px
  Position: absolute bottom-right
  Fill: {success} (online), gray (offline)
  Stroke: 2px white
```

---

## 📱 PASO 3: Pantallas Mobile (390 × 844px)

### Template Base Mobile

1. Crear frame iPhone 14/15 (390 × 844px)
2. Configurar Auto Layout Vertical
3. Estructura estándar:

```
iPhone Frame
├── Status Bar (simulado)
├── Header (Auto Layout, height 56px)
├── Content (Auto Layout Vertical, fill remaining)
└── Bottom Nav (Auto Layout, height 72px)
```

### Pantallas a Crear

#### M1 - Autenticación (3 screens)
1. **Login**
   - Logo centrado
   - Formulario (email + password)
   - CTA primario "Iniciar sesión"
   - Link "¿Olvidaste tu contraseña?"

2. **Recuperar Contraseña**
   - Ilustración
   - Input email
   - CTA "Enviar enlace"

3. **Ajustes de Cuenta**
   - Avatar header con degradado wine
   - Lista de opciones (Auto Layout)
   - Toggle switches
   - Botón "Cerrar sesión"

#### M2 - Flujo Estudiante (5 screens)

1. **Home/Explorar**
   - Header con búsqueda
   - Filter chips (Auto Layout Horizontal, wrap)
   - Grid de PropertyCards (2 columnas)
   - Bottom navigation activa

2. **Detalle de Propiedad**
   - Carrusel de imágenes (usar carousel component)
   - Badge "Disponible" overlay
   - Info del arrendador (avatar + nombre + rating)
   - Servicios grid (iconos)
   - CTA fijo "Solicitar visita"

3. **Mapa Fullscreen**
   - Placeholder mapa con markers
   - Bottom sheet con preview de propiedad
   - Filtros floating button

4. **Filtros Avanzados**
   - Sheet modal desde bottom
   - Sliders de precio
   - Checkboxes de servicios
   - CTA "Aplicar filtros"

5. **Reseñas**
   - Lista de review cards
   - Rating stars component
   - Input "Escribir reseña"

---

## 🖥️ PASO 4: Pantallas Desktop (1440px min)

### Template Base Desktop

```
Desktop Frame (1440 × 1024px)
├── Sidebar (240px fixed, Auto Layout Vertical)
│   ├── Logo
│   ├── Nav items (Auto Layout Vertical)
│   └── User profile (bottom)
└── Main Content (fill container)
    ├── Header (height 72px)
    └── Content Area (Auto Layout Vertical, padding 32px 48px)
```

### M4 - Admin Dashboard

1. **Dashboard Principal**
   - Sidebar oscuro (#1E1E2E)
   - Grid 4 columnas stats cards
   - Tabla de verificaciones pendientes
   - Botón "Revisar" → abre modal

2. **Modal de Verificación**
   - Overlay blur
   - Modal centrado (860px width)
   - 2 columnas:
     - Left 30%: Datos del arrendatario
     - Right 70%: Grid documentos
   - Footer: Textarea + botones Rechazar/Aprobar

---

## 🎨 PASO 5: Componentes Avanzados

### Empty State Component

```
Frame "EmptyState"
├── Illustration (120 × 120px, opacity 70%)
├── Title (Heading/Large, color muted)
├── Description (Body/Small, max-width 280px, centered)
└── CTA Button (optional)
```

**Variantes:**
- Type: NoFavorites, NoMessages, NoSearchResults

### Skeleton Loader

```
Frame matching real component
Replace content with:
  Rectangle fills: {border/subtle}
  Border radius: 6px
  Widths: 100%, 80%, 60% para simular texto
```

### Toast Notification

```
Auto Layout Horizontal
Gap: 12px
Padding: 12px 16px
Fill: white
Corner radius: 12px
Shadow: 0 8px 24px rgba(0,0,0,0.15)

├── Icon (circle 36px, background {success/light})
└── Content
    ├── Title (Body/Small Semibold)
    └── Message (Caption)
```

---

## ✅ PASO 6: Organización Final

### 1. Páginas del Archivo

```
📄 Cover & Index
📄 Design Tokens (showcase visual)
📄 Components Library
📄 Mobile - Module 1 (Auth)
📄 Mobile - Module 2 (Student)
📄 Mobile - Module 3 (Landlord)
📄 Desktop - Module 4 (Admin)
📄 UI States
```

### 2. Naming Convention

```
Frames:       M1/Login, M2/Home, M4/Dashboard
Components:   Button, Badge, PropertyCard
Variants:     Type=Primary, Size=Medium, State=Default
```

### 3. Crear Biblioteca Compartida

1. File → Publish library
2. Nombrar: "ULEAM Design System v2.0"
3. Descripción: Componentes para app mobile + panel web
4. Compartir con equipo

---

## 🚀 PASO 7: Workflow Figma ↔ Código

### Sincronización Continua

1. **Diseñadores** actualizan componentes en Figma
2. **Developers** consumen design tokens vía:
   - Figma Tokens plugin (JSON export)
   - Figma API
   - Manual copy/paste de valores

### Plugins Recomendados

- **Figma Tokens**: Exportar variables a CSS/JSON
- **Component Inspector**: Verificar Auto Layout
- **Stark**: Validar contraste de colores
- **Iconify**: Biblioteca de íconos Lucide React

---

## 📊 Checklist de Exportación

### Variables/Tokens
- [ ] Colores primarios (4)
- [ ] Colores semánticos (4 × 2 = 8)
- [ ] Neutrales (10+)
- [ ] Spacing (8 niveles)
- [ ] Radius (5 niveles)
- [ ] Text styles (15+)

### Componentes Base
- [ ] Button (12 variantes = 3 types × 4 states)
- [ ] Badge (4 types)
- [ ] Input (12 variantes = 3 types × 4 states)
- [ ] Avatar (4 sizes × 2 status)
- [ ] Card (Property, Profile)
- [ ] Toast/Alert
- [ ] Skeleton
- [ ] Empty State (3 types)

### Pantallas Mobile (15)
- [ ] M1: Login, Recuperar, Ajustes (3)
- [ ] M2: Home, Detalle, Mapa, Filtros, Reseñas (5)
- [ ] M3: Propiedades, Solicitudes, Publicar 1-2, Verificación (4)
- [ ] Onboarding: 4 pasos (4)
- [ ] Empty: 3 tipos (counted in M2)

### Pantallas Desktop (4+)
- [ ] M4: Dashboard, Modal Verificación (2)
- [ ] Admin Extended: Gestión usuarios, Reportes (2)

### Organización
- [ ] Páginas nombradas
- [ ] Cover page con branding
- [ ] Biblioteca publicada
- [ ] Team compartido
- [ ] Documentación inline (notas)

---

## 🎓 Recursos Adicionales

### Tutoriales
- [Figma Auto Layout Guide](https://www.figma.com/best-practices/creating-dynamic-designs-with-auto-layout/)
- [Variables and Tokens](https://www.figma.com/best-practices/component-architecture-and-variants/)

### Shortcuts Útiles
- `Shift + A` → Auto Layout
- `Cmd + G` → Group
- `Cmd + D` → Duplicate
- `Alt + drag` → Constraint distances
- `Cmd + Option + K` → Create Component

---

## 📞 Soporte

Si encuentras dificultades durante la exportación, consulta:
- `DESIGN_SYSTEM.md` para especificaciones exactas
- Componente `DesignSystemShowcase.tsx` para referencia visual
- Las 15 pantallas renderizadas en el proyecto para tomar screenshots

---

**Versión:** 2.0  
**Última actualización:** Junio 2026  
**Mantenedor:** Equipo ULEAM Rental System
