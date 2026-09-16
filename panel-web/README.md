# 🎓 ULEAM Rental System - Design System v2.0

Sistema de diseño completo para la plataforma de alquiler estudiantil de la **Universidad Laica Eloy Alfaro de Manabí (ULEAM)**.

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-8C1515)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)

</div>

---

## 📋 Descripción

Plataforma dual que incluye:
- 📱 **App Móvil** para estudiantes/arrendatarios (React Native compatible)
- 🖥️ **Panel Web Administrativo** de escritorio (React + Vite)

**15 pantallas funcionales** organizadas en **5 módulos** con componentes reutilizables y design tokens documentados.

---

## ✨ Características

- ✅ **Design System completo** con tokens, componentes y patrones
- ✅ **15 pantallas interactivas** con navegación funcional
- ✅ **Componentes reutilizables** (Buttons, Cards, Badges, Inputs, Avatars)
- ✅ **Responsive design** (Mobile 390px + Desktop 1440px)
- ✅ **Paleta de colores** institucional ULEAM (#8C1515)
- ✅ **Documentación exhaustiva** para diseñadores y desarrolladores
- ✅ **Guía de exportación a Figma** paso a paso
- ✅ **Accesibilidad** WCAG AA

---

## 🚀 Quick Start

### Ver el Proyecto

```bash
# El proyecto ya está renderizado en tu navegador
# Navega entre pestañas para explorar:
```

**Tabs disponibles:**
1. **🎨 Design System** - Showcase de tokens, colores, tipografía, componentes
2. **App Móvil · Estudiante** - 5 pantallas del flujo principal
3. **Onboarding + Estados vacíos** - Flujo de incorporación + empty states
4. **Panel Admin Web** - Dashboard + modal de verificación
5. **Publicación Arrendador** - Flujo completo de publicación (3 pasos)
6. **M1 · Auth** - Módulo de autenticación
7. **M2 · Mapa** - Flujo del estudiante con mapa
8. **M3 · Arrendador** - Panel móvil del arrendador
9. **M4 · Admin+** - Panel administrativo extendido
10. **M5 · UI States** - Skeleton loaders, toasts, alerts

---

## 📚 Documentación

### Para Diseñadores

📖 **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**
- Paleta de colores completa
- Tipografía (scale + font families)
- Spacing system (4px base)
- Border radius tokens
- Shadows
- Componentes base
- Guidelines de uso

📖 **[FIGMA_EXPORT_GUIDE.md](./FIGMA_EXPORT_GUIDE.md)**
- Cómo crear variables de Figma
- Construir componentes con Auto Layout
- Organizar 15 pantallas
- Workflow Figma ↔ Código
- Plugins recomendados
- Checklist completo

### Para Desarrolladores

📖 **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**
- Quick start
- Componentes principales (código)
- Layouts mobile + desktop
- Patrones comunes
- Utilidades (Auto Layout, shadows)
- Accesibilidad
- Testing
- Errores comunes a evitar

---

## 🎨 Design Tokens

### Colores Principales

| Token | Hex | Uso |
|-------|-----|-----|
| **Wine Primary** | `#8C1515` | CTA, botones primarios, branding |
| **Wine Hover** | `#6B0F0F` | Hover state |
| **Success** | `#10B981` | Verificado, disponible |
| **Warning** | `#F59E0B` | Pendiente, en revisión |
| **Info** | `#3B82F6` | Información general |
| **Error** | `#EF4444` | Rechazado, errores |

### Tipografía

| Familia | Uso |
|---------|-----|
| **Inter** | UI general, botones, navegación |
| **Roboto** | Contenido largo, chat, descripciones |
| **JetBrains Mono** | Códigos, IDs, datos técnicos |

### Spacing

Escala basada en **4px**: `4, 8, 12, 16, 24, 32, 48, 64`

### Border Radius

Cards estándar: **12px** (consistente en todo el sistema)

---

## 📦 Estructura de Módulos

### M1 - Autenticación (3 pantallas)
- Login con validación
- Recuperar contraseña
- Ajustes de cuenta

### M2 - Flujo Estudiante (5 pantallas)
- Home/Explorar propiedades
- Detalle de propiedad con carrusel
- Mapa fullscreen + bottom sheet
- Filtros avanzados
- Sistema de reseñas

### M3 - Panel Arrendador Móvil (4 pantallas)
- Mis propiedades
- Bandeja de solicitudes
- Publicar propiedad (pasos 1-2)
- Verificación de identidad

### M4 - Admin Desktop (4 pantallas)
- Dashboard con sidebar
- Modal de verificación
- Gestión de usuarios
- Centro de reportes

### M5 - Estados UI (3 variantes)
- Skeleton loaders
- Toast notifications (success, error, info)
- Empty states (favoritos, mensajes, búsqueda)

**Adicionales:**
- Onboarding flow (4 pasos)
- Chat/Mensajería (lista + activo)
- Perfil de estudiante

**Total: 15+ pantallas únicas**

---

## 🧩 Componentes Disponibles

### Base Components
- **Buttons** (Primary, Secondary, Ghost, Icon)
- **Badges** (Success, Warning, Info, Error)
- **Cards** (Property, Profile, Stat)
- **Inputs** (Text, Search, Email, Password, Textarea)
- **Avatars** (4 tamaños + status indicator)
- **Navigation** (Bottom tabs mobile, Sidebar desktop)

### UI Components (shadcn/ui)
- Alert, AlertDialog, Accordion
- Avatar, Badge, Button
- Calendar, Card, Carousel
- Checkbox, Collapsible, Command
- Context Menu, Dialog, Drawer
- Dropdown Menu, Form, Hover Card
- Input, Label, Menubar
- Navigation Menu, Popover, Progress
- Radio Group, Scroll Area, Select
- Separator, Sheet, Skeleton
- Slider, Switch, Table
- Tabs, Textarea, Toast
- Toggle, Toggle Group, Tooltip

---

## 🛠️ Tech Stack

- **React** 18.3.1
- **Vite** 6.3.5
- **Tailwind CSS** v4.1.12
- **Motion** 12.23.24 (animaciones)
- **Radix UI** (componentes primitivos)
- **Sonner** 2.0.3 (toast notifications)
- **Lucide React** 0.487.0 (iconos)
- **React Hook Form** 7.55.0
- **Recharts** 2.15.2 (gráficas)
- **React Slick** 0.31.0 (carruseles)

---

## 📂 Archivos Clave

```
/
├── README.md                      # Este archivo
├── DESIGN_SYSTEM.md               # Tokens, componentes, guidelines
├── DEVELOPER_GUIDE.md             # Guía para desarrolladores
├── FIGMA_EXPORT_GUIDE.md          # Cómo exportar a Figma
│
├── package.json                   # Dependencias
├── src/
│   ├── app/
│   │   ├── App.tsx                # Navegación principal
│   │   ├── components/
│   │   │   ├── DesignSystemShowcase.tsx  # 🎨 Showcase visual
│   │   │   ├── AuthModule.tsx
│   │   │   ├── StudentMapModule.tsx
│   │   │   ├── LandlordMobileModule.tsx
│   │   │   ├── AdminExtendedModule.tsx
│   │   │   ├── UIStatesModule.tsx
│   │   │   └── ui/                # shadcn/ui components
│   │   └── styles/
│   │       ├── theme.css          # Design tokens
│   │       └── fonts.css
│   └── imports/                   # Assets de Figma (si aplica)
│
└── node_modules/
```

---

## 🎯 Próximos Pasos Recomendados

### 1. Exportar a Figma ⭐
Sigue la guía en `FIGMA_EXPORT_GUIDE.md` para:
- Crear variables de diseño (colores, spacing, radius)
- Construir componentes con Auto Layout
- Organizar las 15 pantallas en frames
- Publicar biblioteca compartida

### 2. Integración Backend (Supabase)
- Autenticación real (email/password, OAuth)
- Base de datos para propiedades, usuarios, mensajes
- Storage para fotos
- Real-time para chat
- Edge Functions para verificaciones

### 3. Mejoras de UX
- Animaciones con Motion (transiciones, feedback)
- Dark mode con `next-themes`
- Notificaciones push
- Offline support

### 4. Funcionalidades Adicionales
- Sistema de pagos (Stripe/PayPal)
- Calendario de visitas
- Mapa interactivo real (Google Maps/Mapbox)
- Filtros avanzados mejorados
- Sistema de reseñas expandido

### 5. Optimización
- Code splitting por módulo
- Lazy loading de componentes
- Optimización de imágenes
- Service Worker

---

## ♿ Accesibilidad

- ✅ Contraste de color WCAG AA (mínimo 4.5:1)
- ✅ Focus states visibles en elementos interactivos
- ✅ ARIA labels en iconos y acciones
- ✅ Navegación por teclado (Tab, Enter, Esc)
- ✅ Touch targets mínimo 44×44px (mobile)
- ✅ Screen reader friendly
- ✅ Formularios con labels asociados

---

## 🤝 Contribución

### Guidelines

1. Sigue el design system documentado en `DESIGN_SYSTEM.md`
2. Usa solo colores de la paleta oficial
3. Border radius = **12px** en todos los cards
4. Spacing múltiplo de **4px**
5. Máximo **1 CTA primario** por pantalla
6. Agrega ARIA labels a elementos interactivos
7. Verifica contraste de color antes de PR

### Errores a Evitar

❌ Border radius inconsistente  
❌ Colores fuera de paleta  
❌ Spacing no múltiplo de 4px  
❌ Más de 1 botón primario  
❌ Texto sin suficiente contraste  
❌ Elementos interactivos sin focus state  

---

## 📄 Licencia

© 2026 Universidad Laica Eloy Alfaro de Manabí (ULEAM)

---

## 👥 Créditos

**Diseñado para:**  
Universidad Laica Eloy Alfaro de Manabí  
Sistema de Alquiler Estudiantil

**Tech Stack:**  
React + Vite + Tailwind CSS v4

**Versión:** 2.0  
**Última actualización:** Junio 2026

---

## 📞 Soporte

Para preguntas o problemas:
1. Consulta la documentación en `/docs`
2. Revisa el showcase visual en la tab "🎨 Design System"
3. Sigue los ejemplos en `DEVELOPER_GUIDE.md`

---

<div align="center">

**[🎨 Ver Showcase](./src/app/components/DesignSystemShowcase.tsx)** · **[📖 Design System](./DESIGN_SYSTEM.md)** · **[👨‍💻 Dev Guide](./DEVELOPER_GUIDE.md)** · **[🎨 Figma Export](./FIGMA_EXPORT_GUIDE.md)**

Hecho con ❤️ para la comunidad estudiantil ULEAM

</div>
