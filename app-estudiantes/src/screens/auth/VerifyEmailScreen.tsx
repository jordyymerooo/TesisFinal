/**
 * VerifyEmailScreen.tsx
 * Pantalla para usuarios no verificados.
 * Muestra las instrucciones de confirmación por correo institucional
 * y permite reenviar el correo o comprobar el estado de activación.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Send,
} from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme/theme';
import { authService, apiClient } from '../../../services/api';

interface VerifyEmailScreenProps {
  route?: any;
  navigation?: any;
  email?: string;
  onBack?: () => void;
  onVerified?: () => void;
}

export function VerifyEmailScreen(props: VerifyEmailScreenProps) {
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

  const initialEmail = props.email || route?.params?.email || '';
  const [email, setEmail] = useState<string>(initialEmail);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

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
   * Comprobar si el usuario ya verificó su correo en el backend.
   * Ejecutado al presionar 'Ya verifiqué mi correo'.
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
      // Petición GET usando Axios al endpoint público de comprobación
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

        {/* Email Pill */}
        {Boolean(email) && (
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Correo registrado:</Text>
            <View style={styles.emailPill}>
              <Mail size={14} color={Colors.WinePrimary} />
              <Text style={styles.emailText}>{email}</Text>
            </View>
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
          {/* Botón 1: Comprobar activación */}
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.soft,
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.WineBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.Gray600,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.base,
    paddingHorizontal: 8,
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  emailLabel: {
    fontSize: 11,
    color: Colors.Gray500,
    marginBottom: 4,
    fontWeight: '600',
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

export default VerifyEmailScreen;
