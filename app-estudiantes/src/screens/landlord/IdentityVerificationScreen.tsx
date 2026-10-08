/**
 * IdentityVerificationScreen.tsx
 * Pantalla de Verificacion de Identidad para Arrendadores
 * Permite subir 4 documentos requeridos antes de publicar propiedades.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  CreditCard,
  User,
  Zap,
  CheckCircle,
  AlertCircle,
  Upload,
  Shield,
  Clock,
  ShieldCheck,
} from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import apiClient, { setCurrentUser } from "../../../services/api";

// Types
export type DocumentKey = "cedulaFrontal" | "cedulaPosterior" | "selfie" | "reciboLuz";

interface DocumentState {
  uri: string | null;
  status: "pending" | "uploaded" | "approved" | "rejected";
}

interface DocumentConfig {
  key: DocumentKey;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}

const DOCUMENTS: DocumentConfig[] = [
  { key: "cedulaFrontal", title: "Cedula Frontal", subtitle: "Foto nitida de la parte delantera", Icon: CreditCard },
  { key: "cedulaPosterior", title: "Cedula Posterior", subtitle: "Foto nitida de la parte trasera", Icon: CreditCard },
  { key: "selfie", title: "Selfie con Cedula", subtitle: "Sosteniendo tu cedula visible", Icon: User },
  { key: "reciboLuz", title: "Recibo de Luz", subtitle: "Comprobante de domicilio reciente", Icon: Zap },
];

interface IdentityVerificationScreenProps {
  route?: any;
  navigation?: any;
  onBack?: () => void;
  onSubmit?: (documents?: Record<DocumentKey, string>) => void;
}

export function IdentityVerificationScreen({ route, navigation, onBack, onSubmit }: IdentityVerificationScreenProps) {
  const { user, setUser } = useAuth();
  const [documents, setDocuments] = useState<Record<DocumentKey, DocumentState>>({
    cedulaFrontal:   { uri: null, status: "pending" },
    cedulaPosterior: { uri: null, status: "pending" },
    selfie:          { uri: null, status: "pending" },
    reciboLuz:       { uri: null, status: "pending" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState<DocumentKey | null>(null);

  const uploadedCount = Object.values(documents).filter((d) => d.uri !== null).length;
  const allUploaded = uploadedCount === 4;

  const pickDocument = useCallback(async (docKey: DocumentKey) => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galeria para subir los documentos.");
        return;
      }
    }
    setLoadingDoc(docKey);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: docKey === "selfie" ? [3, 4] : [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setDocuments((prev) => ({ ...prev, [docKey]: { uri, status: "uploaded" } }));
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    } finally {
      setLoadingDoc(null);
    }
  }, []);

  const takePhoto = useCallback(async (docKey: DocumentKey) => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu camara.");
        return;
      }
    }
    setLoadingDoc(docKey);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: docKey === "selfie" ? [3, 4] : [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setDocuments((prev) => ({ ...prev, [docKey]: { uri, status: "uploaded" } }));
      }
    } catch {
      Alert.alert("Error", "No se pudo tomar la foto.");
    } finally {
      setLoadingDoc(null);
    }
  }, []);

  const handleDocumentPress = useCallback((docKey: DocumentKey) => {
    const config = DOCUMENTS.find((d) => d.key === docKey)!;
    const hasImage = documents[docKey].uri !== null;
    Alert.alert(
      config.title,
      hasImage ? "Selecciona una opcion:" : "Como deseas subir el documento?",
      [
        { text: "Tomar foto", onPress: () => takePhoto(docKey) },
        { text: "Elegir de galeria", onPress: () => pickDocument(docKey) },
        ...(hasImage ? [{ text: "Eliminar", style: "destructive" as const, onPress: () => setDocuments((prev) => ({ ...prev, [docKey]: { uri: null, status: "pending" } })) }] : []),
        { text: "Cancelar", style: "cancel" as const },
      ]
    );
  }, [documents, pickDocument, takePhoto]);

  const handleSubmit = useCallback(async () => {
    if (!allUploaded) return;
    Alert.alert(
      "Enviar documentos",
      "Los 4 documentos serán enviados al equipo de ULEAM para revisión (24-48h hábiles).",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const formData = new FormData();

              const keySnakeMap: Record<string, string> = {
                cedulaFrontal: 'cedula_frontal',
                cedulaPosterior: 'cedula_posterior',
                selfie: 'selfie',
                reciboLuz: 'recibo_luz',
              };

              for (const [key, doc] of Object.entries(documents)) {
                if (doc.uri) {
                  const filename = doc.uri.split('/').pop() || `${key}.jpg`;
                  const match = /\.(\w+)$/.exec(filename);
                  const type = match ? `image/${match[1]}` : 'image/jpeg';
                  const filePayload = {
                    uri: Platform.OS === 'ios' ? doc.uri.replace('file://', '') : doc.uri,
                    name: filename,
                    type: type || 'image/jpeg',
                  } as any;

                  // Enviar tanto snake_case como camelCase para soporte total backend
                  formData.append(key, filePayload);
                  const snakeKey = keySnakeMap[key];
                  if (snakeKey && snakeKey !== key) {
                    formData.append(snakeKey, filePayload);
                  }
                }
              }

              // Si venimos del registro, adjuntar id_usuario o correo para identificar al arrendador
              const targetUserId = route?.params?.userId || user?.id_usuario;
              const targetEmail = route?.params?.email || user?.correo;
              if (targetUserId) {
                formData.append('id_usuario', String(targetUserId));
              }
              if (targetEmail) {
                formData.append('correo', String(targetEmail));
              }

              // Endpoint de Laravel KYC que NO requiere email verificado
              const res = await apiClient.post('/kyc/documentos', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

              // Paso 3: Actualizar el usuario en el contexto con estado_kyc = 'en_revision'
              const updatedUser = res.data?.user || { ...user, estado_kyc: 'en_revision' };
              const freshUser = { ...updatedUser, estado_kyc: 'en_revision' };
              setUser(freshUser);
              setCurrentUser(freshUser);

              const uris = Object.fromEntries(
                Object.entries(documents).map(([k, v]) => [k, v.uri!])
              ) as Record<DocumentKey, string>;

              Alert.alert(
                "Enviado exitosamente",
                "Tus documentos fueron subidos con éxito y están en revisión. Te notificaremos cuando tu perfil sea aprobado.",
                [
                  {
                    text: "Entendido",
                    onPress: () => {
                      if (onSubmit) {
                        onSubmit(uris);
                      }
                      // Redirigir a KycPendingScreen / VerificationStatusScreen
                      if (navigation?.replace) {
                        try {
                          navigation.replace('KycPendingScreen');
                          return;
                        } catch {
                          try {
                            navigation.replace('WaitingApproval');
                            return;
                          } catch {}
                        }
                      }
                      if (navigation?.navigate) {
                        try {
                          navigation.navigate('KycPendingScreen');
                          return;
                        } catch {
                          try {
                            navigation.navigate('WaitingApproval');
                            return;
                          } catch {}
                        }
                      }
                      // Fallback si no tiene correo verificado
                      if (!user?.email_verified_at && navigation?.replace) {
                        try {
                          navigation.replace('EmailVerificationScreen', { email: targetEmail });
                        } catch {}
                      }
                    },
                  },
                ]
              );
            } catch (err: any) {
              console.warn('[IdentityVerificationScreen] Error al subir KYC:', err);
              Alert.alert(
                "Error al subir",
                err.response?.data?.message || err.message || "No se pudieron enviar los documentos. Verifica tu conexión e intenta de nuevo."
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [allUploaded, documents, onBack, onSubmit, user, setUser, route, navigation]);

  const renderDocumentCard = (config: DocumentConfig) => {
    const doc = documents[config.key];
    const isLoading = loadingDoc === config.key;
    const hasImage = doc.uri !== null;
    const IconComponent = config.Icon;

    return (
      <TouchableOpacity
        key={config.key}
        style={[styles.docCard, hasImage && styles.docCardUploaded]}
        onPress={() => handleDocumentPress(config.key)}
        activeOpacity={0.8}
        disabled={isLoading}
        accessibilityLabel={`Subir ${config.title}`}
        accessibilityRole="button"
      >
        {isLoading ? (
          <View style={styles.docCardInner}>
            <ActivityIndicator size="large" color={Colors.WinePrimary} />
            <Text style={styles.docLoadingText}>Procesando...</Text>
          </View>
        ) : hasImage ? (
          <View style={styles.docCardInner}>
            <Image source={{ uri: doc.uri! }} style={styles.docPreviewImage} />
            <View style={styles.docOverlay}>
              <View style={styles.docCheckBadge}>
                <CheckCircle size={16} color={Colors.White} />
              </View>
            </View>
            <View style={styles.docUploadedLabel}>
              <CheckCircle size={12} color={Colors.Success} />
              <Text style={styles.docUploadedText}>Subido</Text>
            </View>
          </View>
        ) : (
          <View style={styles.docCardInner}>
            <View style={styles.docIconContainer}>
              <IconComponent size={28} color={Colors.WinePrimary} />
            </View>
            <Text style={styles.docTitle} numberOfLines={1}>{config.title}</Text>
            <Text style={styles.docSubtitle} numberOfLines={2}>{config.subtitle}</Text>
            <View style={styles.docPendingBadge}>
              <Clock size={10} color={Colors.Warning} />
              <Text style={styles.docPendingText}>Pendiente</Text>
            </View>
            <View style={styles.docUploadHint}>
              <Upload size={12} color={Colors.Gray400} />
              <Text style={styles.docUploadHintText}>Toca para subir</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.Gray800} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verificar Cuenta</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{uploadedCount}/4 documentos</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Barra de progreso */}
      {user?.estado_kyc !== 'aprobado' && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(uploadedCount / 4) * 100}%` }]} />
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {user?.estado_kyc === 'aprobado' ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <ShieldCheck size={40} color={Colors.Success} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.Gray900, marginBottom: 12, textAlign: 'center' }}>
              ¡Verificación Completada!
            </Text>
            <Text style={{ fontSize: 15, color: Colors.Gray600, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }}>
              Tu identidad ya ha sido verificada por la ULEAM. Ya puedes publicar propiedades libremente.
            </Text>
          </View>
        ) : (
          <>
            {/* Banner de Rechazo si existe motivo */}
            {(route?.params?.reason || user?.kyc_observacion) && (
              <View style={{
                backgroundColor: '#FEF2F2',
                borderWidth: 1.5,
                borderColor: '#FECACA',
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                marginBottom: Spacing.md,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#B91C1C' }}>
                    Documentos Rechazados - Motivo
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#991B1B', lineHeight: 18 }}>
                  {route?.params?.reason || user?.kyc_observacion}
                </Text>
              </View>
            )}

            {/* Tarjeta Informativa */}
            <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <Camera size={24} color={Colors.WinePrimary} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoTitle}>Verificacion Requerida</Text>
            <Text style={styles.infoBody}>
              Para publicar propiedades, necesitas verificar tu identidad con los 4 documentos requeridos. El proceso toma{" "}
              <Text style={styles.infoBodyBold}>24-48 horas habiles</Text>.
            </Text>
          </View>
        </View>

        {/* Chips de beneficios */}
        <View style={styles.benefitsRow}>
          {[{ icon: Shield, label: "Cuenta Verificada" }, { icon: CheckCircle, label: "Mayor Confianza" }, { icon: Upload, label: "Publicacion Activa" }].map(({ icon: Icon, label }) => (
            <View key={label} style={styles.benefitChip}>
              <Icon size={14} color={Colors.WinePrimary} />
              <Text style={styles.benefitChipText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Titulo seccion */}
        <Text style={styles.sectionTitle}>Documentos Requeridos</Text>
        <Text style={styles.sectionSubtitle}>Asegurate de que las fotos sean nitidas y legibles</Text>

        {/* Grid 2x2 */}
        <View style={styles.docGrid}>
          {DOCUMENTS.map(renderDocumentCard)}
        </View>

        {/* Nota privacidad */}
        <View style={styles.privacyNote}>
          <AlertCircle size={14} color={Colors.Gray400} />
          <Text style={styles.privacyNoteText}>
            Tus documentos son almacenados de forma segura y solo son revisados por el equipo autorizado de ULEAM.
          </Text>
        </View>
          </>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Boton fijo inferior */}
      {user?.estado_kyc !== 'aprobado' && (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.submitButton, !allUploaded && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={allUploaded ? 0.85 : 1}
          disabled={!allUploaded || isSubmitting}
          accessibilityLabel="Enviar documentos a revision"
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.White} />
          ) : (
            <>
              {allUploaded ? <CheckCircle size={18} color={Colors.White} /> : <Upload size={18} color={Colors.Gray400} />}
              <Text style={[styles.submitButtonText, !allUploaded && styles.submitButtonTextDisabled]}>
                {allUploaded ? "Enviar a Revision" : `Faltan ${4 - uploadedCount} documento${4 - uploadedCount !== 1 ? "s" : ""}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.LightBG },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderBottomWidth: 1, borderBottomColor: Colors.Gray100 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.Gray100, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.Gray900, letterSpacing: -0.3 },
  progressBadge: { backgroundColor: Colors.WineLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 99, borderWidth: 1, borderColor: Colors.WineBorder },
  progressBadgeText: { fontSize: 11, fontWeight: "600", color: Colors.WinePrimary },
  headerRight: { width: 40 },
  progressBarContainer: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: Colors.White, borderBottomWidth: 1, borderBottomColor: Colors.Gray100 },
  progressBarTrack: { height: 4, backgroundColor: Colors.Gray200, borderRadius: 99, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: Colors.WinePrimary, borderRadius: 99 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.base },
  infoCard: { flexDirection: "row", backgroundColor: Colors.ErrorLight, borderRadius: 14, borderWidth: 1, borderColor: Colors.ErrorBorder, padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.md, alignItems: "flex-start" },
  infoIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.WineLight, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.WineBorder, flexShrink: 0 },
  infoTextWrapper: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: "700", color: Colors.WinePrimary, marginBottom: 4 },
  infoBody: { fontSize: 12.5, color: Colors.Gray700, lineHeight: 18 },
  infoBodyBold: { fontWeight: "700", color: Colors.Gray800 },
  benefitsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.xl, flexWrap: "wrap" },
  benefitChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.WineLight, paddingHorizontal: Spacing.sm + 2, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: Colors.WineBorder },
  benefitChipText: { fontSize: 11, fontWeight: "600", color: Colors.WinePrimary },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.Gray900, marginBottom: 4 },
  sectionSubtitle: { fontSize: 12.5, color: Colors.Gray500, marginBottom: Spacing.base },
  docGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.md },
  docCard: { width: "47.5%", aspectRatio: 1, borderRadius: 14, borderWidth: 2, borderColor: Colors.Gray300, borderStyle: "dashed", backgroundColor: Colors.White, overflow: "hidden" },
  docCardUploaded: { borderStyle: "solid", borderColor: Colors.Success, shadowColor: Colors.Success, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  docCardInner: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.md, gap: 5 },
  docIconContainer: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.WineLight, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  docTitle: { fontSize: 12.5, fontWeight: "700", color: Colors.Gray800, textAlign: "center" },
  docSubtitle: { fontSize: 10.5, color: Colors.Gray500, textAlign: "center", lineHeight: 14 },
  docPendingBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: Colors.WarningLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99, borderWidth: 1, borderColor: Colors.WarningBorder, marginTop: 2 },
  docPendingText: { fontSize: 10, fontWeight: "600", color: Colors.Warning },
  docUploadHint: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  docUploadHintText: { fontSize: 10, color: Colors.Gray400 },
  docPreviewImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", resizeMode: "cover" },
  docOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "flex-start", alignItems: "flex-end", padding: Spacing.sm },
  docCheckBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.Success, justifyContent: "center", alignItems: "center" },
  docUploadedLabel: { position: "absolute", bottom: 8, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.92)", paddingVertical: 4 },
  docUploadedText: { fontSize: 11, fontWeight: "700", color: Colors.Success },
  docLoadingText: { fontSize: 11, color: Colors.Gray500, marginTop: 6 },
  privacyNote: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, backgroundColor: Colors.Gray50, borderRadius: 10, padding: Spacing.md, borderWidth: 1, borderColor: Colors.Gray200 },
  privacyNoteText: { flex: 1, fontSize: 11.5, color: Colors.Gray500, lineHeight: 16 },
  footerContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderTopWidth: 1, borderTopColor: Colors.Gray100, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 6 },
  submitButton: { backgroundColor: Colors.WinePrimary, borderRadius: 99, paddingVertical: Spacing.base, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: Colors.WinePrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  submitButtonDisabled: { backgroundColor: Colors.Gray200, shadowOpacity: 0, elevation: 0 },
  submitButtonText: { fontSize: 15, fontWeight: "700", color: Colors.White, letterSpacing: 0.2 },
  submitButtonTextDisabled: { color: Colors.Gray400 },
});

export { IdentityVerificationScreen as KycUploadScreen };
export default IdentityVerificationScreen;
