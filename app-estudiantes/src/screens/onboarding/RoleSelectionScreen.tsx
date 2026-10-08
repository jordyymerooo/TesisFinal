/**
 * RoleSelectionScreen.tsx
 * Pantalla de seleccion de rol en el flujo Onboarding
 * Dos tarjetas grandes: Estudiante / Arrendador
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GraduationCap, Building2, Check, ChevronRight, ArrowLeft } from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";

export type UserRole = "estudiante" | "arrendador";

interface RoleSelectionScreenProps {
  onContinue: (role: UserRole) => void;
  onBack: () => void;
}

interface RoleOption {
  key: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  perks: string[];
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const ROLES: RoleOption[] = [
  {
    key: "estudiante",
    title: "Soy Estudiante",
    subtitle: "Busco alojamiento",
    description: "Explora departamentos, cuartos y pensiones cerca del campus ULEAM verificados.",
    icon: GraduationCap,
    perks: ["Mapa interactivo de propiedades", "Filtros por precio y distancia", "Chat directo con arrendadores"],
    accentColor: Colors.Info,
    bgColor: Colors.InfoLight,
    borderColor: Colors.InfoBorder,
  },
  {
    key: "arrendador",
    title: "Soy Arrendador",
    subtitle: "Publico propiedades",
    description: "Publica tus inmuebles y conecta con estudiantes de la ULEAM verificados.",
    icon: Building2,
    perks: ["Publicacion gratuita de propiedades", "Solicitudes de estudiantes verificados", "Panel de administracion"],
    accentColor: Colors.WinePrimary,
    bgColor: Colors.WineLight,
    borderColor: Colors.WineBorder,
  },
];

export function RoleSelectionScreen({ onContinue, onBack }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const scaleAnims = useRef({ estudiante: new Animated.Value(1), arrendador: new Animated.Value(1) }).current;

  const handleSelect = (role: UserRole) => {
    setSelectedRole(role);
    Animated.sequence([
      Animated.spring(scaleAnims[role], { toValue: 0.97, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnims[role], { toValue: 1,    useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.Gray800} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerProgress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.stepLabel}>Paso 1 de 3</Text>
          <Text style={styles.title}>Como usaras{"\n"}la plataforma?</Text>
          <Text style={styles.subtitle}>Selecciona tu rol para personalizar tu experiencia</Text>
        </View>

        {/* Tarjetas de rol */}
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.key;
          const IconComp = role.icon;

          return (
            <Animated.View
              key={role.key}
              style={[styles.roleCardWrap, { transform: [{ scale: scaleAnims[role.key] }] }]}
            >
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  isSelected && { borderColor: role.accentColor, backgroundColor: role.bgColor, ...Shadows.card },
                ]}
                onPress={() => handleSelect(role.key)}
                activeOpacity={0.85}
                accessibilityLabel={role.title}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Checkmark de seleccion */}
                <View style={[styles.checkCircle, isSelected && { backgroundColor: role.accentColor, borderColor: role.accentColor }]}>
                  {isSelected && <Check size={12} color={Colors.White} strokeWidth={3} />}
                </View>

                {/* Ícono */}
                <View style={[styles.roleIconWrap, isSelected && { backgroundColor: role.accentColor }]}>
                  <IconComp size={32} color={isSelected ? Colors.White : Colors.Gray500} strokeWidth={1.8} />
                </View>

                {/* Texto */}
                <View style={styles.roleTextBlock}>
                  <Text style={[styles.roleTitle, isSelected && { color: role.accentColor }]}>{role.title}</Text>
                  <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                  <Text style={styles.roleDesc}>{role.description}</Text>

                  {/* Perks */}
                  {isSelected && (
                    <View style={styles.perksContainer}>
                      {role.perks.map((perk) => (
                        <View key={perk} style={styles.perkRow}>
                          <View style={[styles.perkDot, { backgroundColor: role.accentColor }]} />
                          <Text style={styles.perkText}>{perk}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Boton continuar fijo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedRole && styles.continueBtnDisabled]}
          onPress={() => selectedRole && onContinue(selectedRole)}
          activeOpacity={selectedRole ? 0.85 : 1}
          disabled={!selectedRole}
          accessibilityLabel="Continuar con el rol seleccionado"
          accessibilityRole="button"
        >
          <Text style={[styles.continueBtnText, !selectedRole && styles.continueBtnTextDisabled]}>
            {selectedRole ? `Continuar como ${selectedRole === "estudiante" ? "Estudiante" : "Arrendador"}` : "Selecciona un rol"}
          </Text>
          {selectedRole && <ChevronRight size={18} color={Colors.White} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.LightBG },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderBottomWidth: 1, borderBottomColor: Colors.Gray100 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.Gray100, justifyContent: "center", alignItems: "center" },
  headerProgress: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.Gray300 },
  progressDotActive: { backgroundColor: Colors.WinePrimary, width: 24, borderRadius: 4 },
  progressLine: { height: 2, width: 24, backgroundColor: Colors.Gray200 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingTop: Spacing.xl },
  titleSection: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xs },
  stepLabel: { fontSize: 11, fontWeight: "700", color: Colors.WinePrimary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 30, fontWeight: "900", color: Colors.Gray900, letterSpacing: -0.8, lineHeight: 36, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, color: Colors.Gray500, lineHeight: 20 },

  roleCardWrap: { marginBottom: Spacing.md },
  roleCard: { backgroundColor: Colors.White, borderRadius: 18, borderWidth: 2, borderColor: Colors.Gray200, padding: Spacing.lg, ...Shadows.soft },
  checkCircle: { position: "absolute", top: Spacing.md, right: Spacing.md, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.Gray300, justifyContent: "center", alignItems: "center" },
  roleIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.Gray100, justifyContent: "center", alignItems: "center", marginBottom: Spacing.md },
  roleTextBlock: {},
  roleTitle: { fontSize: 20, fontWeight: "800", color: Colors.Gray900, marginBottom: 2 },
  roleSubtitle: { fontSize: 13, color: Colors.Gray500, fontWeight: "600", marginBottom: Spacing.sm },
  roleDesc: { fontSize: 13.5, color: Colors.Gray600, lineHeight: 20 },
  perksContainer: { marginTop: Spacing.md, gap: 7 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkDot: { width: 6, height: 6, borderRadius: 3 },
  perkText: { fontSize: 12.5, color: Colors.Gray700, fontWeight: "500" },

  footer: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderTopWidth: 1, borderTopColor: Colors.Gray100 },
  continueBtn: { backgroundColor: Colors.WinePrimary, borderRadius: BorderRadius.pill, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, ...Shadows.primary },
  continueBtnDisabled: { backgroundColor: Colors.Gray200, shadowOpacity: 0, elevation: 0 },
  continueBtnText: { fontSize: 15, fontWeight: "700", color: Colors.White },
  continueBtnTextDisabled: { color: Colors.Gray400 },
});

export default RoleSelectionScreen;
