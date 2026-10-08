/**
 * RegisterScreen.tsx
 * Paso 2.5 del Onboarding: Datos de registro + llamada real a Laravel
 * Recibe el rol ya seleccionado y ejecuta authService.register()
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Building2,
  CreditCard,
  Phone,
} from "lucide-react-native";

import { Colors, Spacing, Typography, BorderRadius, Shadows } from "../../theme/theme";
import { authService, setAuthToken } from "../../../services/api";
import { PrivacyModal } from "../../components/PrivacyModal";
import type { UserRole } from "./RoleSelectionScreen";

// id_rol en DB: 1 = estudiante, 2 = arrendador
const ROLE_ID_MAP: Record<UserRole, number> = { estudiante: 1, arrendador: 2 };

interface RegisterScreenProps {
  role: UserRole;
  onSuccess: (userData: { token: string; user: any }) => void;
  onBack: () => void;
}

interface FieldError {
  nombres?: string;
  identificacion?: string;
  correo?: string;
  clave?: string;
  confirmar?: string;
  telefono?: string;
}

// Validacion de correo estándar general
const isValidEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);

/**
 * Algoritmo oficial de validación de Cédula Ecuatoriana (Módulo 10).
 */
export function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!cedula || typeof cedula !== 'string') return false;
  const clean = cedula.trim().replace(/\D/g, '');
  if (clean.length !== 10) return false;

  const provincia = parseInt(clean.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

  const tercerDigito = parseInt(clean.charAt(2), 10);
  if (tercerDigito < 0 || tercerDigito > 5) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(clean.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(clean.charAt(9), 10);
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  return resultado === digitoVerificador;
}

export function RegisterScreen({ role, onSuccess, onBack }: RegisterScreenProps) {
  const navigation = useNavigation<any>();
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const email = correo;
  const setEmail = setCorreo;
  const identificacion = cedula;
  const setIdentificacion = setCedula;
  const [clave, setClave] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showClave, setShowClave] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const cedulaRef = useRef<TextInput>(null);
  const correoRef = useRef<TextInput>(null);
  const telefonoRef = useRef<TextInput>(null);
  const claveRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const isArrendador = role === "arrendador";
  const RoleIcon = isArrendador ? Building2 : GraduationCap;
  const roleLabel = isArrendador ? "Arrendador" : "Estudiante";
  const roleColor = isArrendador ? Colors.WinePrimary : Colors.Info;

  // ── Validacion local ─────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FieldError = {};
    if (nombres.trim().length < 3) errors.nombres = "Ingresa tu nombre completo (min. 3 caracteres).";

    const cleanCedula = cedula.replace(/[^0-9]/g, '');
    if (cleanCedula.length !== 10) {
      errors.identificacion = "La cédula debe tener exactamente 10 dígitos.";
    } else if (!validarCedulaEcuatoriana(cleanCedula)) {
      errors.identificacion = "Cédula ecuatoriana inválida (debe contener 10 dígitos válidos).";
    }

    const trimmedCorreo = correo.trim().toLowerCase();
    const uleamEmailRegex = /^[a-zA-Z0-9._%+-]+@(uleam\.edu\.ec|live\.uleam\.edu\.ec|dn\.uleam\.edu\.ec)$/i;
    if (!isValidEmail(trimmedCorreo)) {
      errors.correo = "Correo electrónico inválido.";
    } else if (role === "estudiante") {
      if (!uleamEmailRegex.test(trimmedCorreo)) {
        errors.correo = "El correo debe terminar en @uleam.edu.ec, @live.uleam.edu.ec o @dn.uleam.edu.ec.";
      }
    }

    const cleanTelefono = telefono.replace(/[^0-9]/g, '');
    if (!/^09[0-9]{8}$/.test(cleanTelefono)) {
      errors.telefono = "El teléfono debe tener 10 dígitos y empezar por 09.";
    }

    if (clave.length < 8) errors.clave = "La contraseña debe tener al menos 8 caracteres.";
    if (clave !== confirmar) errors.confirmar = "Las contraseñas no coinciden.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Registro contra Laravel (handleSubmit) ───────────────────────
  const handleRegister = async () => {
    setApiError(null);

    // 1. El nombre debe tener al menos 3 caracteres
    if (nombres.trim().length < 3) {
      Alert.alert('Nombre Inválido', 'El nombre completo debe tener al menos 3 caracteres.');
      return;
    }

    // 2. La cédula debe tener exactamente 10 dígitos
    const cleanCedula = cedula.replace(/[^0-9]/g, '');
    if (cleanCedula.length !== 10) {
      Alert.alert('Cédula Inválida', 'La cédula debe tener exactamente 10 dígitos.');
      return;
    }
    if (!validarCedulaEcuatoriana(cleanCedula)) {
      Alert.alert('Cédula Inválida', 'Por favor ingresa un número de cédula ecuatoriana válido.');
      return;
    }

    // 3. El teléfono debe tener exactamente 10 dígitos y empezar por '09'
    const cleanTelefono = telefono.replace(/[^0-9]/g, '');
    const telefonoRegex = /^09[0-9]{8}$/;
    if (!telefonoRegex.test(cleanTelefono)) {
      Alert.alert(
        'Teléfono Inválido',
        'El teléfono debe tener exactamente 10 dígitos y empezar por 09 (ej. 0991234567).'
      );
      return;
    }

    // 4. El correo debe terminar estrictamente en @uleam.edu.ec, @live.uleam.edu.ec o @dn.uleam.edu.ec para estudiantes
    const emailLower = correo.trim().toLowerCase();
    const uleamEmailRegex = /^[a-zA-Z0-9._%+-]+@(uleam\.edu\.ec|live\.uleam\.edu\.ec|dn\.uleam\.edu\.ec)$/i;
    if (!isArrendador) {
      if (!uleamEmailRegex.test(emailLower)) {
        Alert.alert(
          'Correo Institucional Requerido',
          'El correo debe terminar estrictamente en @uleam.edu.ec, @live.uleam.edu.ec o @dn.uleam.edu.ec.'
        );
        return;
      }
    } else {
      if (!isValidEmail(emailLower)) {
        Alert.alert('Correo Inválido', 'Por favor ingresa un correo electrónico válido.');
        return;
      }
    }

    // 5. La contraseña debe tener mínimo 8 caracteres
    if (clave.length < 8) {
      Alert.alert('Contraseña Inválida', 'La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    // 6. La contraseña y la confirmación deben ser exactamente iguales
    if (clave !== confirmar) {
      Alert.alert('Contraseñas No Coinciden', 'La contraseña y la confirmación deben ser exactamente iguales.');
      return;
    }

    // 7. El switch de términos y condiciones debe estar en true
    if (!aceptaTerminos) {
      Alert.alert(
        'Consentimiento Requerido',
        'Debes aceptar los Términos de Servicio y la Política de Privacidad y Tratamiento de Datos (LOPDP) para continuar.'
      );
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.register({
        nombres: nombres.trim(),
        correo: emailLower,
        clave,
        clave_confirmation: confirmar,
        password: clave,
        password_confirmation: confirmar,
        id_rol: ROLE_ID_MAP[role],
        identificacion: cleanCedula,
        cedula: cleanCedula,
        telefono: cleanTelefono,
      });

      const registeredUser = response?.user || response;
      const targetEmail = emailLower;
      const targetUserId = registeredUser?.id_usuario || registeredUser?.id;

      if (isArrendador) {
        // El arrendador primero debe subir sus documentos KYC para revisión
        navigation.navigate('IdentityVerification', {
          userId: targetUserId,
          email: targetEmail,
        });
      } else {
        // El estudiante pasa directamente a la verificación de correo
        navigation.replace('EmailVerificationScreen', { email: targetEmail });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join('\n')
          : null) ||
        err.message ||
        "No se pudo completar el registro. Verifica tu conexión.";
      setApiError(errorMsg);
      Alert.alert('Error de Registro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = handleRegister;

  // ── Helpers de UI ────────────────────────────────────────────────
  const renderField = ({
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    error,
    secure,
    onToggleSecure,
    keyboardType = "default",
    returnKeyType = "next",
    onSubmitEditing,
    ref: fieldRef,
    autoCapitalize = "none",
    maxLength,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    error?: string;
    secure?: boolean;
    onToggleSecure?: () => void;
    keyboardType?: any;
    returnKeyType?: any;
    onSubmitEditing?: () => void;
    ref?: any;
    autoCapitalize?: any;
    maxLength?: number;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : value.length > 0 ? styles.inputFilled : styles.inputIdle]}>
        <Icon size={17} color={error ? Colors.Error : value.length > 0 ? Colors.WinePrimary : Colors.Gray400} />
        <TextInput
          ref={fieldRef}
          style={styles.textInput}
          value={value}
          onChangeText={(t) => { onChange(t); if (fieldErrors) setFieldErrors((p) => ({ ...p, [label]: undefined, identificacion: undefined })); }}
          placeholder={placeholder}
          placeholderTextColor={Colors.Gray300}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {onToggleSecure && (
          <TouchableOpacity onPress={onToggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {secure ? <EyeOff size={17} color={Colors.Gray400} /> : <Eye size={17} color={Colors.Gray400} />}
          </TouchableOpacity>
        )}
        {!secure && !error && value.length > 2 && (
          <CheckCircle size={15} color={Colors.Success} />
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={Colors.Error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.Gray700} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={[styles.roleBadge, { backgroundColor: isArrendador ? Colors.WineLight : Colors.InfoLight, borderColor: isArrendador ? Colors.WineBorder : Colors.InfoBorder }]}>
            <RoleIcon size={11} color={roleColor} />
            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Barra progreso: paso 2 de 3 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>
        <Text style={styles.progressLabel}>Paso 2 de 3</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Error global de API */}
          {apiError && (
            <View style={styles.apiErrorBox}>
              <AlertCircle size={16} color={Colors.Error} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          )}

          {/* Campos */}
          {renderField({
            label: "Nombre completo",
            value: nombres,
            onChange: (text) => setNombres(text.replace(/[0-9]/g, '')),
            placeholder: "Ej: Juan Carlos Perez",
            icon: User,
            error: fieldErrors.nombres,
            maxLength: 50,
            returnKeyType: "next",
            onSubmitEditing: () => cedulaRef.current?.focus(),
            autoCapitalize: "words",
          })}

          {/* Cédula de Identidad (10 dígitos) */}
          {renderField({
            label: "Cédula de Identidad",
            value: cedula,
            onChange: (text) => setCedula(text.replace(/[^0-9]/g, '')),
            placeholder: "Número de Cédula (10 dígitos)",
            icon: CreditCard,
            error: fieldErrors.identificacion,
            keyboardType: "numeric",
            maxLength: 10,
            returnKeyType: "next",
            onSubmitEditing: () => correoRef.current?.focus(),
            ref: cedulaRef,
          })}

          {/* Bloque de Advertencia UX para Estudiantes */}
          {!isArrendador && (
            <View style={styles.studentWarningBox}>
              <Text style={styles.studentWarningText}>
                ⚠️ Registro exclusivo para estudiantes de la ULEAM. Debes ingresar tu número de cédula real y tu correo institucional (@uleam.edu.ec | @live.uleam.edu.ec | @dn.uleam.edu.ec) para poder activar tu cuenta.
              </Text>
            </View>
          )}

          {renderField({
            label: "Correo electronico",
            value: correo,
            onChange: setCorreo,
            placeholder: isArrendador ? "tu.correo@ejemplo.com" : "tu.correo@uleam.edu.ec",
            icon: Mail,
            error: fieldErrors.correo,
            keyboardType: "email-address",
            returnKeyType: "next",
            onSubmitEditing: () => telefonoRef.current?.focus(),
            ref: correoRef,
          })}

          {/* Número de Teléfono (10 dígitos empezando por 09) */}
          {renderField({
            label: "Número de Teléfono",
            value: telefono,
            onChange: (text) => setTelefono(text.replace(/[^0-9]/g, '')),
            placeholder: "Ej: 0991234567",
            icon: Phone,
            error: fieldErrors.telefono,
            keyboardType: "phone-pad",
            maxLength: 10,
            returnKeyType: "next",
            onSubmitEditing: () => claveRef.current?.focus(),
            ref: telefonoRef,
          })}

          {renderField({
            label: "Contrasena",
            value: clave,
            onChange: setClave,
            placeholder: "Minimo 8 caracteres",
            icon: Lock,
            error: fieldErrors.clave,
            secure: !showClave,
            onToggleSecure: () => setShowClave((p) => !p),
            returnKeyType: "next",
            onSubmitEditing: () => confirmarRef.current?.focus(),
            ref: claveRef,
          })}

          {renderField({
            label: "Confirmar contrasena",
            value: confirmar,
            onChange: setConfirmar,
            placeholder: "Repite tu contrasena",
            icon: Lock,
            error: fieldErrors.confirmar,
            secure: !showConfirmar,
            onToggleSecure: () => setShowConfirmar((p) => !p),
            returnKeyType: "done",
            onSubmitEditing: handleRegister,
            ref: confirmarRef,
          })}

          {/* Consentimiento LOPDP y Términos */}
          <View style={styles.termsContainer}>
            <Switch
              value={aceptaTerminos}
              onValueChange={setAceptaTerminos}
              trackColor={{ false: '#cbd5e1', true: '#8b0000' }} // Rojo ULEAM
              thumbColor={Platform.OS === 'android' ? (aceptaTerminos ? '#8b0000' : '#f4f3f4') : undefined}
            />
            <Text style={styles.termsLabel}>
              He leído y acepto los <Text style={styles.termsBoldLink} onPress={() => setModalVisible(true)}>Términos de Servicio</Text> y la <Text style={styles.termsBoldLink} onPress={() => setModalVisible(true)}>Política de Privacidad y Tratamiento de Datos (LOPDP)</Text>.
            </Text>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Boton fijo inferior */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (loading || !aceptaTerminos) && styles.submitBtnDisabled]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading || !aceptaTerminos}
          accessibilityLabel="Crear cuenta y continuar"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={Colors.White} />
          ) : (
            <>
              <CheckCircle size={18} color={Colors.White} />
              <Text style={styles.submitBtnText}>Crear cuenta y continuar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Legal LOPDP */}
      <PrivacyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAccept={() => setAceptaTerminos(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.LightBG },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderBottomWidth: 1, borderBottomColor: Colors.Gray100 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.Gray100, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.Gray900, letterSpacing: -0.3 },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 1 },
  roleBadgeText: { fontSize: 10.5, fontWeight: "700" },

  progressContainer: { backgroundColor: Colors.White, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.Gray100, gap: 4 },
  progressTrack: { height: 4, backgroundColor: Colors.Gray200, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.WinePrimary, borderRadius: 99 },
  progressLabel: { fontSize: 11, fontWeight: "600", color: Colors.Gray500, textAlign: "right" },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.md },

  apiErrorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: Colors.ErrorLight, borderRadius: 12, borderWidth: 1, borderColor: Colors.ErrorBorder, padding: Spacing.md },
  apiErrorText: { flex: 1, fontSize: 13, color: Colors.Error, fontWeight: "600", lineHeight: 18 },

  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 12.5, fontWeight: "700", color: Colors.Gray700, marginLeft: 2 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, backgroundColor: Colors.White, paddingHorizontal: 14, height: 50, gap: 10 },
  inputIdle: { borderColor: Colors.Gray200 },
  inputFilled: { borderColor: Colors.WineBorder },
  inputError: { borderColor: Colors.Error, backgroundColor: Colors.ErrorLight },
  textInput: { flex: 1, fontSize: 14, color: Colors.Gray900, paddingVertical: 0 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginLeft: 2 },
  errorText: { fontSize: 11.5, color: Colors.Error, fontWeight: "500" },

  termsText: { fontSize: 11.5, color: Colors.Gray500, textAlign: "center", lineHeight: 17, marginTop: 4 },
  termsLink: { color: Colors.WinePrimary, fontWeight: "700" },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  termsLabel: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 12,
    color: Colors.Gray600,
    lineHeight: 18,
  },
  termsBoldLink: {
    fontWeight: '700',
    color: Colors.Gray800,
    textDecorationLine: 'underline',
  },

  studentWarningBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  studentWarningText: {
    color: "#1E40AF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },

  footer: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.White, borderTopWidth: 1, borderTopColor: Colors.Gray100 },
  submitBtn: { backgroundColor: Colors.WinePrimary, borderRadius: BorderRadius.pill, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...Shadows.primary },
  submitBtnDisabled: { backgroundColor: Colors.Gray300, shadowOpacity: 0, elevation: 0 },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: Colors.White },
});

export { RegisterScreen as StudentRegisterScreen };
export default RegisterScreen;
