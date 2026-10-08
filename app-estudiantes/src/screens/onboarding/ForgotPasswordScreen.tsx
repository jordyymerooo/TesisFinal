import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import apiClient from '../../../services/api';

interface ForgotPasswordScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordScreen({ navigation, onBack, onSuccess }: ForgotPasswordScreenProps) {
  // Manejo de las 3 fases del flujo
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Estados de formulario
  const [email, setEmail] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Estados de carga
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else {
      if (onBack) {
        onBack();
      } else if (navigation?.goBack) {
        navigation.goBack();
      }
    }
  };

  // ── Step 1: Enviar PIN al Correo ──
  const handleSendPin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/password/email', { email: cleanEmail });
      Alert.alert(
        'Código Enviado',
        res.data?.message || 'Hemos enviado un código PIN de 6 dígitos a tu correo electrónico.'
      );
      setStep(2);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo enviar el código. Verifica que el correo esté registrado.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Reenviar PIN ──
  const handleResendPin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setResending(true);
    try {
      const res = await apiClient.post('/password/email', { email: cleanEmail });
      Alert.alert('Código Reenviado', res.data?.message || 'Se ha enviado un nuevo código PIN a tu correo.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'No se pudo reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  // ── Step 2: Verificar PIN de 6 dígitos ──
  const handleVerifyPin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (cleanPin.length !== 6) {
      Alert.alert('PIN Inválido', 'El código PIN de seguridad debe tener exactamente 6 dígitos numéricos.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/password/verify-pin', {
        email: cleanEmail,
        pin: cleanPin,
      });

      const token = res.data?.reset_token;
      if (!token) {
        throw new Error('Respuesta inválida del servidor. Falta token de seguridad.');
      }

      setResetToken(token);
      setStep(3);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'El código PIN ingresado es incorrecto o ha expirado.';
      Alert.alert('Error de Verificación', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Guardar Nueva Contraseña ──
  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Contraseña Corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'La confirmación de la contraseña no coincide.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/password/reset', {
        email: cleanEmail,
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      Alert.alert(
        'Contraseña actualizada',
        res.data?.message || 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              } else if (navigation) {
                try {
                  navigation.navigate('Login');
                } catch {
                  navigation.goBack();
                }
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Hubo un problema al actualizar la contraseña.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Barra Superior con botón Volver */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={20} color={Colors.Gray800} />
              <Text style={styles.backBtnText}>
                {step === 1 ? 'Volver' : 'Atrás'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de Pasos (1 - 2 - 3) */}
          <View style={styles.stepsContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>2</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 3 && styles.stepDotTextActive]}>3</Text>
            </View>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 1: Pedir Correo Electrónico */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <KeyRound size={32} color={Colors.WinePrimary} />
              </View>

              <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitle}>
                Ingresa tu correo electrónico registrado y te enviaremos un código PIN numérico de 6 dígitos para restablecer tu acceso.
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Correo Electrónico</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={Colors.Gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="ejemplo@live.uleam.edu.ec"
                    placeholderTextColor={Colors.Gray400}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (!email.trim() || loading) && styles.primaryBtnDisabled]}
                onPress={handleSendPin}
                disabled={!email.trim() || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.White} size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Enviar Código PIN</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 2: Ingresar y Verificar Código PIN de 6 dígitos */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.WineLight }]}>
                <ShieldCheck size={32} color={Colors.WinePrimary} />
              </View>

              <Text style={styles.title}>Verificar Código PIN</Text>
              <Text style={styles.subtitle}>
                Ingresa el código numérico de 6 dígitos enviado a:{'\n'}
                <Text style={{ fontWeight: Typography.weight.bold, color: Colors.Gray900 }}>{email}</Text>
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Código de Seguridad (6 dígitos)</Text>
                <View style={[styles.inputWrapper, { paddingHorizontal: Spacing.md }]}>
                  <TextInput
                    style={[styles.textInput, styles.pinInput]}
                    placeholder="123456"
                    placeholderTextColor={Colors.Gray300}
                    value={pin}
                    onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!loading}
                    autoFocus
                  />
                </View>
                <Text style={styles.helperText}>
                  ⏱️ El código expira en 15 minutos. Revisa tu bandeja de entrada o spam.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (pin.trim().length !== 6 || loading) && styles.primaryBtnDisabled]}
                onPress={handleVerifyPin}
                disabled={pin.trim().length !== 6 || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.White} size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verificar Código</Text>
                )}
              </TouchableOpacity>

              {/* Botón Reenviar Código */}
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendPin}
                disabled={resending || loading}
                activeOpacity={0.7}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={Colors.WinePrimary} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <RotateCcw size={14} color={Colors.WinePrimary} />
                    <Text style={styles.resendBtnText}>¿No recibiste el código? Reenviar</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 3: Ingresar Nueva Contraseña */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle2 size={32} color="#059669" />
              </View>

              <Text style={styles.title}>Nueva Contraseña</Text>
              <Text style={styles.subtitle}>
                Tu identidad ha sido confirmada. Ingresa tu nueva contraseña para acceder a la aplicación.
              </Text>

              {/* Campo: Nueva Contraseña */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Nueva Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.Gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.Gray400}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    {showPassword ? <EyeOff size={18} color={Colors.Gray500} /> : <Eye size={18} color={Colors.Gray500} />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campo: Confirmar Contraseña */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirmar Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.Gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Repite tu nueva contraseña"
                    placeholderTextColor={Colors.Gray400}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    {showConfirmPassword ? <EyeOff size={18} color={Colors.Gray500} /> : <Eye size={18} color={Colors.Gray500} />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!newPassword || !confirmPassword || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmPassword || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.White} size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Guardar Nueva Contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  topBar: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.Gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.WinePrimary,
    ...Shadows.primary,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray600,
  },
  stepDotTextActive: {
    color: Colors.White,
  },
  stepLine: {
    width: 44,
    height: 3,
    backgroundColor: Colors.Gray200,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: Colors.WinePrimary,
  },
  card: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.WineLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray700,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray50,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.Gray900,
    height: '100%',
  },
  pinInput: {
    fontSize: 24,
    fontWeight: Typography.weight.bold,
    letterSpacing: 10,
    textAlign: 'center',
    color: Colors.WinePrimary,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginTop: 6,
    lineHeight: 16,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.WinePrimary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.primary,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.Gray400,
  },
  primaryBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.White,
  },
  resendBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  resendBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.WinePrimary,
  },
});
