/**
 * ULEAM Design System Theme
 * Tokens visuales para la aplicación móvil de Estudiantes
 */

export const Colors = {
  // Primarios Institucionales
  WinePrimary: '#8C1515',
  WineDark: '#6B1010',
  WineHover: '#6B0F0F',
  WineLight: 'rgba(140, 21, 21, 0.12)',
  WineBorder: 'rgba(140, 21, 21, 0.3)',

  // Canvas y Fondos
  DarkCanvas: '#0F1117',
  DarkCard: '#1E1E2E',
  LightBG: '#FAFAFA',
  White: '#FFFFFF',
  CardBorder: '#E5E7EB',

  // Semánticos
  Success: '#10B981',
  SuccessLight: '#ECFDF5',
  SuccessBorder: '#A7F3D0',

  Warning: '#F59E0B',
  WarningLight: '#FFFBEB',
  WarningBorder: '#FDE68A',

  Info: '#3B82F6',
  InfoLight: '#EFF6FF',
  InfoBorder: '#BFDBFE',

  Error: '#EF4444',
  ErrorLight: '#FEF2F2',
  ErrorBorder: '#FECACA',

  // Escala Neutral / Grises
  Gray50: '#F9FAFB',
  Gray100: '#F3F4F6',
  Gray200: '#E5E7EB',
  Gray300: '#D1D5DB',
  Gray400: '#9CA3AF',
  Gray500: '#6B7280',
  Gray600: '#4B5563',
  Gray700: '#374151',
  Gray800: '#1F2937',
  Gray900: '#111827',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

export const Typography = {
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  primary: {
    shadowColor: Colors.WinePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
};
