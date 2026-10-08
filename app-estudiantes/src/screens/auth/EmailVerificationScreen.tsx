/**
 * EmailVerificationScreen.tsx
 * Pantalla para usuarios no verificados en la app de Estudiantes.
 * Muestra las instrucciones de confirmación por correo institucional
 * y permite comprobar el estado de activación en el backend.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Pencil,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';

import { Colors, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { authService, apiClient } from '../../../services/api';

export interface EmailVerificationScreenProps {
  route?: any;
  navigation?: any;
  email?: string;
  onBack?: () => void;
  onVerified?: () => void;
}

export function EmailVerificationScreen(props: EmailVerificationScreenProps) {
  let nav: any = null;
  let currentRoute: any = null;
  try {
    nav = useNavigation();
  } catch {}
  try {
    currentRoute = useRoute();
  } catch {}

  const navigation = props.navigation || nav;
  const route = props.route || currentRoute;

  // Recibir el email a través de los parámetros de navegación (route.params?.email) o props
  const initialEmail = route?.params?.email || props.email || '';
  const [email, setEmail] = useState<string>(initialEmail);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // ── Estado para edición de correo ──
  const [showEditForm, setShowEditForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (route?.params?.email && route.params.email !== email) {
      setEmail(route.params.email);
    }
  }, [route?.params?.email]);

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
    } else if (typeof navigation?.goBack === 'function') {
      navigation.goBack();
    } else if (typeof navigation?.navigate === 'function') {
      navigation.navigate('Login');
    }
  };

  const handleResend = async () => {
    const targetEmail = (email || route?.params?.email || '').trim().toLowerCase();
    if (!targetEmail) {
      Alert.alert('Aviso', 'No se ha detectado el correo a verificar. Por favor ingresa nuevamente desde el login.');
      return;
    }

    setResending(true);
    setFeedback(null);
    try {
      const res = await authService.resendEmailVerification(targetEmail);
      setFeedback({
        text: res.message || '✓ Correo de confirmación reenviado. Revisa tu bandeja de entrada y la carpeta de SPAM.',
        type: 'success',
      });
    } catch (error: any) {
      setFeedback({
        text: error.message || 'Hubo un error al reenviar el correo. Intenta de nuevo en unos minutos.',
        type: 'error',
      });
    } finally {
      setResending(false);
    }
  };

  /**
   * Fase 2: Comprobación de estado de verificación.
   * Se ejecuta al presionar el botón 'Ya verifiqué mi correo'.
   */
  const handleCheckVerification = async () => {
    const targetEmail = (email || route?.params?.email || '').trim().toLowerCase();
    if (!targetEmail) {
      Alert.alert('Aviso', 'No se ha detectado el correo a verificar. Por favor ingresa nuevamente desde el login.');
      return;
    }

    setChecking(true);
    setFeedback(null);
    try {
      // Petición GET usando Axios al endpoint que creamos
      const res = await apiClient.get(`/check-verification/${encodeURIComponent(targetEmail)}`);

      if (res.data && res.data.verified === true) {
        Alert.alert(
          '¡Cuenta Activada!',
          'Tu correo ha sido verificado con éxito. Ya puedes iniciar sesión con tus credenciales.',
          [
            {
              text: 'Iniciar Sesión',
              onPress: () => {
                if (typeof navigation?.replace === 'function') {
                  navigation.replace('Login');
                } else if (typeof navigation?.navigate === 'function') {
                  navigation.navigate('Login');
                } else if (props.onVerified) {
                  props.onVerified();
                } else if (props.onBack) {
                  props.onBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Aviso',
          'Aún no hemos detectado la confirmación. Por favor, revisa tu bandeja y haz clic en el enlace.'
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Aviso',
        'Aún no hemos detectado la confirmación. Por favor, revisa tu bandeja y haz clic en el enlace.'
      );
    } finally {
      setChecking(false);
    }
  };

  // ── Guardar nuevo correo ──
  const handleSaveEmail = async () => {
    const trimmedNew = newEmail.trim().toLowerCase();
    if (!trimmedNew) {
      setEditFeedback({ text: 'Por favor ingresa el nuevo correo.', type: 'error' });
      return;
    }
    if (!editPassword) {
      setEditFeedback({ text: 'Por favor ingresa tu contraseña actual.', type: 'error' });
      return;
    }

    setSavingEmail(true);
    setEditFeedback(null);
    try {
      const res = await apiClient.put(
        '/auth/update-email',
        { nuevo_email: trimmedNew, clave: editPassword }
      );
      const data = res.data;
      setEmail(data.correo || trimmedNew);
      setNewEmail('');
      setEditPassword('');
      setShowEditForm(false);
      setEditFeedback(null);
      setFeedback({
        text: '✓ Correo actualizado. Revisa tu nueva bandeja de entrada para verificarlo.',
        type: 'success',
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.nuevo_email?.[0] ||
        err?.message ||
        'No se pudo actualizar el correo. Intenta de nuevo.';
      setEditFeedback({ text: msg, type: 'error' });
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.Gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación de Correo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Badge Icon */}
        <View style={styles.iconBadge}>
          <View style={styles.iconInner}>
            <Mail size={40} color={Colors.WinePrimary} />
          </View>
        </View>

        {/* Textos Principales */}
        <Text style={styles.title}>Verifica tu Correo Electrónico</Text>
        <Text style={styles.subtitle}>
          Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada o SPAM y haz clic en el enlace para activar tu cuenta.
        </Text>

        {/* Email Pill con botón de edición */}
        {Boolean(email) && (
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Correo registrado:</Text>
            <View style={styles.emailPillRow}>
              <View style={styles.emailPill}>
                <Mail size={14} color={Colors.WinePrimary} />
                <Text style={styles.emailText}>{email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => {
                  setShowEditForm(!showEditForm);
                  setEditFeedback(null);
                }}
                activeOpacity={0.75}
              >
                {showEditForm
                  ? <X size={14} color={Colors.Gray600} />
                  : <Pencil size={14} color={Colors.WinePrimary} />}
              </TouchableOpacity>
            </View>

            {/* Formulario inline de edición de correo */}
            {showEditForm && (
              <View style={styles.editFormCard}>
                <Text style={styles.editFormTitle}>✏️ Cambiar correo electrónico</Text>

                {/* Nuevo correo */}
                <View style={styles.inputWrapper}>
                  <Mail size={15} color={Colors.Gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Nuevo correo"
                    placeholderTextColor={Colors.Gray400}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={newEmail}
                    onChangeText={setNewEmail}
                  />
                </View>

                {/* Contraseña actual */}
                <View style={styles.inputWrapper}>
                  <Lock size={15} color={Colors.Gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { flex: 1 }]}
                    placeholder="Contraseña actual"
                    placeholderTextColor={Colors.Gray400}
                    secureTextEntry={!showEditPassword}
                    autoCapitalize="none"
                    value={editPassword}
                    onChangeText={setEditPassword}
                  />
                  <TouchableOpacity onPress={() => setShowEditPassword(!showEditPassword)} activeOpacity={0.7}>
                    {showEditPassword
                      ? <EyeOff size={15} color={Colors.Gray400} />
                      : <Eye size={15} color={Colors.Gray400} />}
                  </TouchableOpacity>
                </View>

                {/* Feedback de edición */}
                {editFeedback && (
                  <View style={[
                    styles.editFeedback,
                    editFeedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
                  ]}>
                    <Text style={[
                      styles.feedbackText,
                      { color: editFeedback.type === 'error' ? '#991B1B' : '#065F46' },
                    ]}>{editFeedback.text}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveEmailBtn, savingEmail && styles.btnDisabled]}
                  onPress={handleSaveEmail}
                  disabled={savingEmail}
                  activeOpacity={0.85}
                >
                  {savingEmail
                    ? <ActivityIndicator color={Colors.White} size="small" />
                    : <Text style={styles.saveEmailBtnText}>Guardar nuevo correo</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Feedback Alert Box */}
        {feedback && (
          <View
            style={[
              styles.feedbackBox,
              feedback.type === 'success' && styles.feedbackSuccess,
              feedback.type === 'info' && styles.feedbackInfo,
              feedback.type === 'error' && styles.feedbackError,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              {feedback.type === 'success' && <CheckCircle2 size={16} color={Colors.Success} />}
              {feedback.type === 'info' && <AlertCircle size={16} color="#2563EB" />}
              {feedback.type === 'error' && <AlertCircle size={16} color={Colors.Error} />}
              <Text
                style={[
                  styles.feedbackText,
                  feedback.type === 'success' && { color: '#065F46' },
                  feedback.type === 'info' && { color: '#1E40AF' },
                  feedback.type === 'error' && { color: '#991B1B' },
                ]}
              >
                {feedback.text}
              </Text>
            </View>
          </View>
        )}

        {/* Security Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <ShieldCheck size={18} color={Colors.WinePrimary} />
            <Text style={styles.infoCardTitle}>¿Por qué es necesario este paso?</Text>
          </View>
          <Text style={styles.infoCardBody}>
            Para proteger a toda la comunidad universitaria y garantizar que los alojamientos y reservas sean gestionados por estudiantes y arrendadores con identidad institucional legítima.
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Revisa la carpeta de <Text style={{ fontWeight: '700' }}>SPAM</Text> o Correo no deseado.</Text>
            <Text style={styles.tipItem}>• El enlace de activación tiene una validez de <Text style={{ fontWeight: '700' }}>60 minutos</Text>.</Text>
            <Text style={styles.tipItem}>• Una vez pulses el botón en tu correo, regresa a la app.</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Botón 1: Comprobar activación (Botón rojo institucional) */}
          <TouchableOpacity
            style={[styles.primaryBtn, checking && styles.btnDisabled]}
            onPress={handleCheckVerification}
            disabled={checking}
            activeOpacity={0.85}
          >
            {checking ? (
              <ActivityIndicator color={Colors.White} size="small" />
            ) : (
              <>
                <CheckCircle2 size={18} color={Colors.White} />
                <Text style={styles.primaryBtnText}>Ya verifiqué mi correo</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón 2: Reenviar enlace */}
          <TouchableOpacity
            style={[styles.secondaryBtn, resending && styles.btnDisabled]}
            onPress={handleResend}
            disabled={resending}
            activeOpacity={0.8}
          >
            {resending ? (
              <ActivityIndicator color={Colors.WinePrimary} size="small" />
            ) : (
              <>
                <Send size={16} color={Colors.WinePrimary} />
                <Text style={styles.secondaryBtnText}>Reenviar correo de confirmación</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón 3: Volver */}
          <TouchableOpacity style={styles.textBtn} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.textBtnText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.White,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.Gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.Gray900,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 13.5,
    color: Colors.Gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  emailLabel: {
    fontSize: 12,
    color: Colors.Gray500,
    marginBottom: 6,
  },
  emailPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.White,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.WinePrimary,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  editFormCard: {
    width: '100%',
    marginTop: 12,
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
    gap: 10,
  },
  editFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.Gray800,
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.LightBG,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    gap: 8,
  },
  inputIcon: {
    // just spacing
  },
  inputField: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.Gray900,
    paddingVertical: 0,
  },
  editFeedback: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
  },
  saveEmailBtn: {
    backgroundColor: Colors.WinePrimary,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveEmailBtnText: {
    color: Colors.White,
    fontSize: 13.5,
    fontWeight: '700',
  },
  feedbackBox: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feedbackInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.Gray800,
  },
  infoCardBody: {
    fontSize: 12,
    color: Colors.Gray600,
    lineHeight: 18,
    marginBottom: 10,
  },
  tipsList: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    paddingTop: 8,
  },
  tipItem: {
    fontSize: 11.5,
    color: Colors.Gray500,
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.WinePrimary,
    paddingVertical: 15,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.primary,
  },
  secondaryBtn: {
    backgroundColor: Colors.White,
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.WinePrimary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: Colors.White,
    fontSize: 14.5,
    fontWeight: '700',
  },
  secondaryBtnText: {
    color: Colors.WinePrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  textBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBtnText: {
    color: Colors.Gray600,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;
