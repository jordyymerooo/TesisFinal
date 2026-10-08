/**
 * OnboardingSuccessScreen.tsx
 * Pantalla final del Onboarding - Todo listo!
 * Muestra checklist de proximos pasos y boton de acceso al mapa.
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle,
  Camera,
  CreditCard,
  Mail,
  ArrowRight,
  MapPin,
} from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";
import type { UserRole } from "./RoleSelectionScreen";

const { width } = Dimensions.get("window");

interface OnboardingSuccessScreenProps {
  role: UserRole;
  onExplore: () => void;
}

interface ChecklistItem {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  optional?: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { icon: Camera,     title: "Subir foto de perfil",  subtitle: "Ayuda a generar confianza", optional: true },
  { icon: CreditCard, title: "Verificar cedula",       subtitle: "Necesaria para arrendadores" },
  { icon: Mail,       title: "Confirmar correo",       subtitle: "Revisa tu bandeja institucional" },
];

export function OnboardingSuccessScreen({ role, onExplore }: OnboardingSuccessScreenProps) {
  const circleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim  = useRef(new Animated.Value(0)).current;
  const listAnim   = useRef(new Animated.Value(0)).current;
  const btnAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleAnim, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 80 }),
      Animated.delay(100),
      Animated.spring(checkAnim,  { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 100 }),
      Animated.delay(150),
      Animated.spring(listAnim,   { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 90 }),
      Animated.delay(80),
      Animated.spring(btnAnim,    { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 90 }),
    ]).start();
  }, []);

  const isArrendador = role === "arrendador";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Fondo decorativo superior */}
      <View style={styles.topDecor}>
        <View style={styles.decorBubble1} />
        <View style={styles.decorBubble2} />
      </View>

      <View style={styles.content}>
        {/* ─── Ícono animado de éxito ─── */}
        <Animated.View
          style={[
            styles.successRing,
            {
              opacity: circleAnim,
              transform: [{ scale: circleAnim }],
            },
          ]}
        >
          <View style={styles.successRingInner}>
            <Animated.View style={{ transform: [{ scale: checkAnim }], opacity: checkAnim }}>
              <CheckCircle size={56} color={Colors.Success} strokeWidth={1.8} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* ─── Texto principal ─── */}
        <Animated.View style={[styles.textBlock, { opacity: circleAnim }]}>
          <Text style={styles.title}>Todo listo!</Text>
          <Text style={styles.subtitle}>
            Tu cuenta de{" "}
            <Text style={styles.roleHighlight}>
              {isArrendador ? "Arrendador" : "Estudiante"}
            </Text>{" "}
            ha sido configurada correctamente.
          </Text>
        </Animated.View>

        {/* ─── Checklist ─── */}
        <Animated.View
          style={[
            styles.checklistCard,
            {
              opacity: listAnim,
              transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          <Text style={styles.checklistTitle}>Proximos pasos recomendados</Text>

          {CHECKLIST_ITEMS.map((item, index) => {
            const IconComp = item.icon;
            return (
              <View key={item.title} style={[styles.checklistRow, index < CHECKLIST_ITEMS.length - 1 && styles.checklistRowBorder]}>
                <View style={styles.checklistIconWrap}>
                  <IconComp size={18} color={Colors.WinePrimary} strokeWidth={2} />
                </View>
                <View style={styles.checklistText}>
                  <View style={styles.checklistTitleRow}>
                    <Text style={styles.checklistItemTitle}>{item.title}</Text>
                    {item.optional && (
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalBadgeText}>Opcional</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.checklistItemSub}>{item.subtitle}</Text>
                </View>
                <View style={styles.checklistStatus}>
                  <View style={styles.pendingDot} />
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* ─── Mensaje de confirmacion ─── */}
        <Animated.View style={[styles.confirmationChip, { opacity: listAnim }]}>
          <CheckCircle size={14} color={Colors.Success} />
          <Text style={styles.confirmationText}>
            Cuenta creada y verificada por el sistema ULEAM
          </Text>
        </Animated.View>
      </View>

      {/* ─── Botón fijo ─── */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: btnAnim,
            transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={onExplore}
          activeOpacity={0.85}
          accessibilityLabel="Explorar propiedades"
          accessibilityRole="button"
        >
          <MapPin size={18} color={Colors.White} strokeWidth={2} />
          <Text style={styles.exploreBtnText}>Explorar propiedades</Text>
          <ArrowRight size={18} color={Colors.White} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Puedes completar los pasos pendientes desde tu perfil en cualquier momento
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.LightBG },

  topDecor: { position: "absolute", top: 0, left: 0, right: 0, height: 220, overflow: "hidden" },
  decorBubble1: { position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: Colors.SuccessLight },
  decorBubble2: { position: "absolute", top: 20, left: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(16,185,129,0.06)" },

  content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, gap: Spacing.xl, justifyContent: "center" },

  // Icono éxito
  successRing: { alignSelf: "center", width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.SuccessLight, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: Colors.SuccessBorder },
  successRingInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.White, justifyContent: "center", alignItems: "center", ...Shadows.card },

  // Texto
  textBlock: { alignItems: "center", gap: 8 },
  title: { fontSize: 36, fontWeight: "900", color: Colors.Gray900, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: Colors.Gray500, textAlign: "center", lineHeight: 22 },
  roleHighlight: { fontWeight: "800", color: Colors.WinePrimary },

  // Checklist
  checklistCard: { backgroundColor: Colors.White, borderRadius: 18, borderWidth: 1, borderColor: Colors.Gray200, overflow: "hidden", ...Shadows.soft },
  checklistTitle: { fontSize: 12, fontWeight: "700", color: Colors.Gray500, letterSpacing: 0.8, textTransform: "uppercase", paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  checklistRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md },
  checklistRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.Gray100 },
  checklistIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.WineLight, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  checklistText: { flex: 1 },
  checklistTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  checklistItemTitle: { fontSize: 13.5, fontWeight: "700", color: Colors.Gray800 },
  optionalBadge: { backgroundColor: Colors.Gray100, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 },
  optionalBadgeText: { fontSize: 9, fontWeight: "700", color: Colors.Gray400, textTransform: "uppercase" },
  checklistItemSub: { fontSize: 12, color: Colors.Gray500 },
  checklistStatus: { alignItems: "center", justifyContent: "center" },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.Warning },

  // Chip confirmacion
  confirmationChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", backgroundColor: Colors.SuccessLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: 99, borderWidth: 1, borderColor: Colors.SuccessBorder },
  confirmationText: { fontSize: 11.5, fontWeight: "600", color: Colors.Success },

  // Footer
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  exploreBtn: { backgroundColor: Colors.WinePrimary, borderRadius: BorderRadius.pill, paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...Shadows.primary },
  exploreBtnText: { fontSize: 15, fontWeight: "700", color: Colors.White, letterSpacing: 0.2 },
  footerNote: { fontSize: 11.5, color: Colors.Gray400, textAlign: "center", lineHeight: 16 },
});

export default OnboardingSuccessScreen;
