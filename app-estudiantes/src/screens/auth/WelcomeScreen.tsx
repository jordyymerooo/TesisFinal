/**
 * WelcomeScreen.tsx
 * Pantalla de bienvenida del flujo Onboarding - ULEAM Rental
 * Fondo WinePrimary, estadísticas semitransparentes, botón Comenzar.
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Home, ShieldCheck, MapPin, MessageCircle, ArrowRight } from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";

const { width } = Dimensions.get("window");

// Tipos de navegación pasados desde OnboardingStack
interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onStart, onLogin }: WelcomeScreenProps) {
  // Animaciones de entrada
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const btnAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 90 }),
      Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 90 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 90 }),
    ]).start();
  }, []);

  const FEATURES = [
    { icon: ShieldCheck, title: "Alojamientos Seguros", desc: "Propiedades verificadas." },
    { icon: MapPin, title: "Ubicación Estratégica", desc: "Encuentra opciones a pasos de la ULEAM." },
    { icon: MessageCircle, title: "Chat Directo", desc: "Coordina visitas sin intermediarios." },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.WinePrimary} />

      {/* Gradiente de fondo */}
      <LinearGradient
        colors={[Colors.WinePrimary, Colors.WineDark, "#3B0000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
      />

      {/* Círculos decorativos */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* ─── Sección Logo / Hero ─── */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: logoAnim,
              transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          {/* Logo container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Home size={38} color={Colors.WinePrimary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.brandName}>ULEAM Rental</Text>
          <Text style={styles.brandTagline}>
            Encuentra tu hogar ideal{"\n"}cerca del campus
          </Text>
        </Animated.View>

        {/* ─── Tarjeta de Características ─── */}
        <Animated.View
          style={[
            styles.statsCard,
            {
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <React.Fragment key={title}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Icon size={18} color={Colors.White} strokeWidth={2} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureDesc}>{desc}</Text>
                </View>
              </View>
              {i < FEATURES.length - 1 && <View style={styles.featureDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* ─── Botones ─── */}
        <Animated.View
          style={[
            styles.btnsSection,
            {
              opacity: btnAnim,
              transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onStart}
            activeOpacity={0.88}
            accessibilityLabel="Comenzar registro"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Comenzar</Text>
            <ArrowRight size={18} color={Colors.WinePrimary} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={onLogin}
            activeOpacity={0.7}
            accessibilityLabel="Iniciar sesion"
            accessibilityRole="button"
          >
            <Text style={styles.loginLinkText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: "space-between", paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },

  // Círculos decorativos
  decorCircle: { position: "absolute", borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.06)" },
  decorCircle1: { width: 320, height: 320, top: -120, right: -100 },
  decorCircle2: { width: 200, height: 200, bottom: 80, left: -80 },
  decorCircle3: { width: 100, height: 100, top: "45%", right: -20, backgroundColor: "rgba(255,255,255,0.04)" },

  // Hero
  heroSection: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: Spacing.xxl },
  logoContainer: { marginBottom: Spacing.xl },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.White, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
  brandName: { fontSize: 36, fontWeight: "900", color: Colors.White, letterSpacing: -1, marginBottom: Spacing.sm },
  brandTagline: { fontSize: 16, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 24, fontWeight: "400" },

  // Features card
  statsCard: { backgroundColor: "rgba(255,255,255,0.13)", borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  featureItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  featureIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: "700", color: Colors.White, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 18 },
  featureDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: Spacing.md },

  // Botones
  btnsSection: { gap: Spacing.base },
  primaryBtn: { backgroundColor: Colors.White, borderRadius: BorderRadius.pill, paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: Colors.WinePrimary, letterSpacing: 0.2 },
  loginLink: { alignItems: "center", paddingVertical: Spacing.sm },
  loginLinkText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600", textDecorationLine: "underline" },
});

export default WelcomeScreen;
