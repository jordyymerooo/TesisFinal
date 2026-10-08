/**
 * WaitingApprovalScreen.tsx
 * (También exportado como KycPendingScreen y VerificationStatusScreen)
 * Pantalla de espera para arrendadores cuya documentación
 * fue enviada y está en revisión, o fue rechazada con observaciones por el admin.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Shield,
  Clock,
  LogOut,
  RefreshCw,
  CheckCircle,
  FileText,
  AlertTriangle,
  AlertCircle,
  Upload,
  XCircle,
} from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";
import { authService, apiClient, getCurrentUser, setCurrentUser } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";

interface WaitingApprovalScreenProps {
  onLogout: () => void;
  onApproved?: () => void;
  onReupload?: () => void;
}

export function WaitingApprovalScreen({ onLogout, onApproved, onReupload }: WaitingApprovalScreenProps) {
  const navigation = useNavigation<any>();
  const { user, setUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estado local para estadoKyc y observación de rechazo
  const [estadoKyc, setEstadoKyc] = useState<string>(
    user?.estado_kyc || (user?.perfil as any)?.estado_kyc || "pendiente"
  );
  const [observacion, setObservacion] = useState<string>(
    user?.kyc_observacion || (user?.perfil as any)?.kyc_observacion || ""
  );

  // Sincronizar estado local si el contexto user cambia
  useEffect(() => {
    if (user?.estado_kyc) {
      setEstadoKyc(user.estado_kyc);
    }
    if (user?.kyc_observacion !== undefined) {
      setObservacion(user.kyc_observacion || "");
    }
  }, [user?.estado_kyc, user?.kyc_observacion]);

  // Consultar automáticamente el estado más reciente al montar
  useEffect(() => {
    handleRefreshStatus();
  }, []);

  // Animación de pulso para el icono principal
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Refresco de estado: consulta /api/v1/auth/me y actualiza estadoKyc y observacion
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.get('/auth/me');
      const freshUser = res.data;

      if (freshUser) {
        const nuevoEstado = freshUser.estado_kyc || freshUser.perfil?.estado_kyc || "pendiente";
        const nuevaObservacion = freshUser.kyc_observacion || freshUser.perfil?.kyc_observacion || "";

        setEstadoKyc(nuevoEstado);
        setObservacion(nuevaObservacion);

        const mergedUser = {
          ...freshUser,
          estado_kyc: nuevoEstado,
          kyc_observacion: nuevaObservacion,
        };
        setUser(mergedUser);
        setCurrentUser(mergedUser);

        if (nuevoEstado === "aprobado" || freshUser.perfil?.documento_verificado) {
          setStatusMessage("¡Tu cuenta ha sido aprobada!");
          setTimeout(() => {
            onApproved?.();
          }, 1200);
          return;
        }

        if (nuevoEstado === "rechazado") {
          setStatusMessage(null);
          return;
        }
      }

      setStatusMessage("Tu solicitud aún está en revisión. Intenta más tarde.");
    } catch (error: any) {
      console.warn("[WaitingApprovalScreen] Error al refrescar estado:", error);
      if (!error?.response && (error?.message?.includes("Network") || error?.code === "ECONNABORTED")) {
        setStatusMessage("Error de conexión. Verifica tu internet.");
      } else {
        setStatusMessage("Tu solicitud aún está en revisión.");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleReuploadDocuments = () => {
    const reason = observacion || "Tus documentos no cumplen con los requisitos. Por favor, súbelos nuevamente.";
    if (onReupload) {
      onReupload();
    }
    if (user) {
      const updated = { ...user, estado_kyc: "pendiente_documentos" };
      setUser(updated);
      setCurrentUser(updated);
    }
    if (navigation?.replace) {
      try {
        navigation.replace("KycUploadScreen", { reason });
        return;
      } catch {
        try {
          navigation.replace("IdentityVerification", { reason });
          return;
        } catch {}
      }
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate("KycUploadScreen", { reason });
        return;
      } catch {
        try {
          navigation.navigate("IdentityVerification", { reason });
          return;
        } catch (e) {
          console.warn("[WaitingApprovalScreen] Error de navegación:", e);
        }
      }
    }
  };

  // Condición lógica para rechazo
  const isRejected = estadoKyc === "rechazado" || user?.estado_kyc === "rechazado";
  const observacionMotivo =
    observacion ||
    user?.kyc_observacion ||
    (user?.perfil as any)?.kyc_observacion ||
    "Tus documentos no cumplen con los requisitos. Por favor, súbelos nuevamente.";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Encabezado: Ícono condicional con animación de pulso */}
          <Animated.View
            style={[
              isRejected ? styles.iconOuterCircleRejected : styles.iconOuterCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={isRejected ? styles.iconInnerCircleRejected : styles.iconInnerCircle}>
              {isRejected ? (
                <XCircle size={48} color="#DC2626" />
              ) : (
                <Shield size={48} color={Colors.WinePrimary} />
              )}
            </View>
          </Animated.View>

          {/* Encabezado: Título y descripción condicional */}
          <Text style={[styles.title, isRejected && { color: "#DC2626" }]}>
            {isRejected ? "Corrección Requerida" : "Cuenta en Revisión"}
          </Text>
          <Text style={styles.description}>
            {isRejected
              ? "La administración de la ULEAM ha solicitado corregir tu documentación. Por favor revisa el motivo y vuelve a subir los documentos."
              : "Tus documentos han sido recibidos. Un administrador de la ULEAM aprobará tu perfil en breve para que puedas empezar a publicar alojamientos."}
          </Text>

          {/* Feedback del Admin: Recuadro rojo claro con el motivo exacto */}
          {isRejected ? (
            <View style={styles.rejectionCard}>
              <View style={styles.rejectionHeader}>
                <XCircle size={18} color="#DC2626" />
                <Text style={styles.rejectionTitle}>Motivo del Rechazo</Text>
              </View>
              <Text style={styles.rejectionText}>{observacionMotivo}</Text>
            </View>
          ) : (
            statusMessage && (
              <View
                style={[
                  styles.statusBox,
                  statusMessage.includes("aprobada")
                    ? styles.statusBoxSuccess
                    : styles.statusBoxInfo,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusMessage.includes("aprobada")
                      ? styles.statusTextSuccess
                      : styles.statusTextInfo,
                  ]}
                >
                  {statusMessage}
                </Text>
              </View>
            )
          )}

          {/* Stepper: Solo se muestra si NO está rechazado */}
          {!isRejected && (
            <View style={styles.timelineCard}>
              {/* Paso 1 */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]}>
                  <CheckCircle size={14} color={Colors.White} />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text style={styles.timelineLabel}>Cuenta creada</Text>
                  <Text style={styles.timelineSub}>Registro completado</Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              {/* Paso 2 */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]}>
                  <FileText size={14} color={Colors.White} />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text style={styles.timelineLabel}>Documentos enviados</Text>
                  <Text style={styles.timelineSub}>Cédula y planilla de servicios</Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              {/* Paso 3: Aprobación pendiente */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotPending]}>
                  <Clock size={14} color={Colors.WinePrimary} />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text style={[styles.timelineLabel, { color: Colors.WinePrimary }]}>
                    Aprobación pendiente
                  </Text>
                  <Text style={styles.timelineSub}>24–48 horas hábiles</Text>
                </View>
              </View>
            </View>
          )}

          {/* Botones de Acción */}
          <View style={styles.buttonsGroup}>
            {isRejected ? (
              <>
                <TouchableOpacity
                  style={styles.reuploadBtn}
                  onPress={handleReuploadDocuments}
                  activeOpacity={0.85}
                >
                  <Upload size={18} color={Colors.White} />
                  <Text style={styles.reuploadBtnText}>Volver a subir documentos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryRefreshBtn}
                  onPress={handleRefreshStatus}
                  disabled={refreshing}
                  activeOpacity={0.85}
                >
                  {refreshing ? (
                    <ActivityIndicator color={Colors.WinePrimary} size="small" />
                  ) : (
                    <>
                      <RefreshCw size={16} color={Colors.WinePrimary} />
                      <Text style={styles.secondaryRefreshBtnText}>Refrescar estado</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleRefreshStatus}
                disabled={refreshing}
                activeOpacity={0.85}
              >
                {refreshing ? (
                  <ActivityIndicator color={Colors.White} size="small" />
                ) : (
                  <>
                    <RefreshCw size={18} color={Colors.White} />
                    <Text style={styles.refreshBtnText}>Refrescar estado</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Cerrar sesión */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.85}
            >
              <LogOut size={16} color={Colors.Gray600} />
              <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Icono principal (Normal)
  iconOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.WineLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconInnerCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.White,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.soft,
  },

  // Icono principal (Rechazado)
  iconOuterCircleRejected: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconInnerCircleRejected: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.White,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.soft,
  },

  // Textos
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.Gray900,
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: Colors.Gray500,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },

  // Tarjeta de Rechazo (Feedback del Admin - Fondo rojo claro / border rojo suave)
  rejectionCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FEF2F2",
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.soft,
  },
  rejectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#B91C1C",
  },
  rejectionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "#991B1B",
    fontWeight: "500" as const,
  },

  // Stepper / Timeline
  timelineCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  timelineDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotDone: {
    backgroundColor: "#059669",
  },
  timelineDotPending: {
    backgroundColor: Colors.WineLight,
    borderWidth: 2,
    borderColor: Colors.WineBorder,
  },
  timelineDotRejected: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.Gray200,
    marginLeft: 14,
  },
  timelineTextGroup: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13.5,
    fontWeight: "700" as const,
    color: Colors.Gray800,
  },
  timelineSub: {
    fontSize: 11.5,
    color: Colors.Gray400,
    marginTop: 1,
  },

  // Status message
  statusBox: {
    width: "100%",
    maxWidth: 340,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  statusBoxSuccess: {
    backgroundColor: "#D1FAE5",
    borderColor: "#6EE7B7",
  },
  statusBoxInfo: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  statusTextSuccess: {
    color: "#065F46",
  },
  statusTextInfo: {
    color: "#92400E",
  },

  // Botones
  buttonsGroup: {
    width: "100%",
    maxWidth: 340,
    gap: Spacing.sm,
    alignItems: "center",
  },
  reuploadBtn: {
    backgroundColor: "#DC2626",
    borderRadius: BorderRadius.pill,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    ...Shadows.primary,
  },
  reuploadBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.White,
  },
  secondaryRefreshBtn: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.pill,
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.Gray200,
  },
  secondaryRefreshBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.Gray700,
  },
  refreshBtn: {
    backgroundColor: Colors.WinePrimary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    ...Shadows.primary,
  },
  refreshBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.White,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: "600" as const,
    color: Colors.Gray600,
  },
});

export { WaitingApprovalScreen as KycPendingScreen, WaitingApprovalScreen as VerificationStatusScreen };
export default WaitingApprovalScreen;
