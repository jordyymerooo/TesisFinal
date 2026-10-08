import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  KeyRound,
  Shield,
  ChevronRight,
  Trash2,
  LogOut,
} from 'lucide-react-native';
import { authService, setCurrentUser, setAuthToken } from '../../../services/api';
// import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/** Intenta leer el Expo Push Token ya generado (si existe). No lanza error. */
async function getSavedExpoPushToken(): Promise<string | null> {
  return null;
  /*
  if (Constants.appOwnership === 'expo') {
    console.log('Registro de notificaciones remotas omitido en Expo Go.');
    return null;
  }
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'c5fc6a41-459f-4dfc-9fd5-59a7704f9d58',
    });
    return tokenData.data ?? null;
  } catch {
    return null;
  }
  */
}
import { ProfileScreen as AccountSettings } from '../shared/ProfileScreen';
import { VerifyEmailScreen } from './VerifyEmailScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

export { AccountSettings };

const WINE = '#8C1515';
const WINE_DARK = '#6B1010';

export function AuthModule({
  navigation,
  onLoginSuccess,
}: {
  navigation?: any;
  onLoginSuccess?: () => void;
} = {}) {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'forgot' | 'security' | 'verifyEmail'>('login');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');

  const handleNavigateForgot = () => {
    if (navigation?.navigate) {
      try {
        navigation.navigate('ForgotPassword');
        return;
      } catch {}
    }
    setCurrentScreen('forgot');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {currentScreen === 'login' && (
        <LoginScreen
          onNavigateForgot={handleNavigateForgot}
          onNavigateSecurity={() => setCurrentScreen('security')}
          onNavigateVerifyEmail={(email) => {
            setUnverifiedEmail(email);
            setCurrentScreen('verifyEmail');
          }}
          onLoginSuccess={onLoginSuccess}
          onNavigateRegister={() => {
            if (navigation?.navigate) {
              navigation.navigate('RoleSelection');
            }
          }}
        />
      )}
      {currentScreen === 'forgot' && (
        <ForgotPasswordScreen
          navigation={navigation}
          onBack={() => setCurrentScreen('login')}
          onSuccess={() => setCurrentScreen('login')}
        />
      )}
      {currentScreen === 'security' && (
        <SecuritySettingsScreen onBack={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'verifyEmail' && (
        <VerifyEmailScreen
          email={unverifiedEmail}
          onBack={() => setCurrentScreen('login')}
          onVerified={() => {
            setCurrentScreen('login');
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ── Screen 1: Login Screen ──
function LoginScreen({
  onNavigateForgot,
  onNavigateSecurity,
  onNavigateVerifyEmail,
  onLoginSuccess,
  onNavigateRegister,
}: {
  onNavigateForgot: () => void;
  onNavigateSecurity: () => void;
  onNavigateVerifyEmail?: (email: string) => void;
  onLoginSuccess?: () => void;
  onNavigateRegister: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async (overrideEmail?: string, overridePwd?: string) => {
    const targetEmail = overrideEmail || email;
    const targetPwd = overridePwd || password;
    if (!targetEmail || !targetPwd) return;

    setLoading(true);
    setFeedback(null);
    try {
      // Intentar obtener el push token para enviarlo junto con las credenciales
      const pushToken = await getSavedExpoPushToken();
      const res = await authService.login(targetEmail, targetPwd, pushToken);
      if (res?.token) {
        setAuthToken(res.token);
      }
      if (res?.user) {
        setCurrentUser(res.user);
      }
      setFeedback({
        text: `✓ ¡Bienvenido ${res.user?.nombres || 'Usuario'}!\nRol: ${res.user?.rol?.nombre || (res.user?.id_rol === 2 ? 'arrendador' : 'estudiante')}`,
        type: 'success',
      });
      // ¡Esto es lo que hace que la app pase del login al mapa/panel!
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const isUnverified =
        err.status === 403 &&
        (err.data?.error_code === 'EMAIL_NOT_VERIFIED' ||
          err.message?.toLowerCase().includes('email no verificado') ||
          (err.message?.toLowerCase().includes('correo') && err.message?.toLowerCase().includes('verific')));

      if (isUnverified && onNavigateVerifyEmail) {
        onNavigateVerifyEmail(targetEmail);
        return;
      }

      Alert.alert('Error de Login', err.message || 'No se pudo conectar');
      setFeedback({
        text: err.message || 'Error al iniciar sesión',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header Branding */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>U</Text>
        </View>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta ULEAM Rental</Text>
      </View>


      {/* Feedback Banner */}
      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
            ]}
          >
            {feedback.text}
          </Text>
          {feedback.text.toLowerCase().includes('suspendida') && (
            <TouchableOpacity
              onPress={async () => {
                const url = 'mailto:alojamientos.uleam@gmail.com?subject=Solicitud de Revisión - Cuenta Suspendida ULEAM Rental&body=Hola equipo de administración,%0D%0A%0D%0AMi cuenta ha sido suspendida y me gustaría solicitar una revisión de mi caso.%0D%0A%0D%0AGracias.';
                try {
                  const canOpen = await Linking.canOpenURL(url);
                  if (canOpen) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Aviso', 'No pudimos abrir la app de correo automáticamente. Envía tu mensaje a alojamientos.uleam@gmail.com');
                  }
                } catch (e) {
                  Alert.alert('Aviso', 'No pudimos abrir la app de correo automáticamente. Envía tu mensaje a alojamientos.uleam@gmail.com');
                }
              }}
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: WINE_DARK, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                📧 Contactar al Administrador
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo institucional / personal</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="tu.correo@uleam.edu.ec"
              placeholderTextColor="#AEAEB2"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email.length > 0 && <Check size={16} color="#10B981" style={styles.trailingIcon} />}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#AEAEB2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? <EyeOff size={18} color="#8E8E93" /> : <Eye size={18} color="#8E8E93" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={onNavigateForgot} style={styles.forgotBtn} activeOpacity={0.7}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Primary Submit Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, (!isValid || loading) && styles.primaryBtnDisabled]}
          onPress={() => handleLogin()}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.primaryBtnText, (!isValid || loading) && styles.primaryBtnTextDisabled]}>
              Iniciar Sesión
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Settings Nav Shortcut */}
        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 10, borderColor: '#E5E7EB' }]}
          onPress={onNavigateSecurity}
          activeOpacity={0.8}
        >
          <Shield size={16} color={WINE} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryBtnText, { color: '#374151', fontSize: 13 }]}>
            Configuración de Seguridad
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Register Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={onNavigateRegister} activeOpacity={0.7}>
          <Text style={[styles.footerLink, { color: WINE, fontWeight: 'bold' }]}>Regístrate gratis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Screen 3: Security Settings Screen ──
function SecuritySettingsScreen({ onBack }: { onBack: () => void }) {
  const [biometrics, setBiometrics] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <ArrowLeft size={20} color="#374151" />
        <Text style={styles.backBtnText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Seguridad de la Cuenta</Text>
      <Text style={styles.subtitle}>Gestiona tus credenciales y accesos protegidos.</Text>

      <View style={styles.cardList}>
        <TouchableOpacity
          style={styles.cardItem}
          onPress={() => setBiometrics(!biometrics)}
          activeOpacity={0.7}
        >
          <View style={styles.cardItemLeft}>
            <View style={[styles.iconBg, { backgroundColor: '#EFF6FF' }]}>
              <Shield size={18} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.cardItemTitle}>Acceso Biométrico / Huella</Text>
              <Text style={styles.cardItemSubtitle}>{biometrics ? 'Activado' : 'Desactivado'}</Text>
            </View>
          </View>
          <View style={[styles.togglePill, biometrics ? styles.toggleOn : styles.toggleOff]}>
            <View style={[styles.toggleCircle, biometrics ? styles.toggleCircleOn : styles.toggleCircleOff]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardItem} activeOpacity={0.7}>
          <View style={styles.cardItemLeft}>
            <View style={[styles.iconBg, { backgroundColor: '#FFFBEB' }]}>
              <KeyRound size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.cardItemTitle}>Cambiar Contraseña</Text>
              <Text style={styles.cardItemSubtitle}>Última actualización hace 1 mes</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardItem, { borderBottomWidth: 0 }]}
          onPress={async () => {
            try {
              await authService.logout();
            } catch (e) {
              console.warn('Error en logout:', e);
            }
            Alert.alert('Sesión Cerrada', 'Has cerrado sesión exitosamente.');
            onBack();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardItemLeft}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF2F2' }]}>
              <LogOut size={18} color="#EF4444" />
            </View>
            <View>
              <Text style={[styles.cardItemTitle, { color: '#EF4444' }]}>Cerrar Sesión Activa</Text>
              <Text style={styles.cardItemSubtitle}>Revocar token Bearer de este dispositivo</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Estilos Nativos Estrictos (StyleSheet) ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: WINE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: WINE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  demoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  feedbackTextSuccess: {
    color: '#065F46',
  },
  feedbackTextError: {
    color: '#991B1B',
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 8,
  },
  trailingIcon: {
    marginLeft: 6,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: WINE,
  },
  primaryBtn: {
    backgroundColor: WINE,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: WINE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtnTextDisabled: {
    color: '#9CA3AF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 46,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: WINE,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardItemSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  togglePill: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: WINE,
  },
  toggleOff: {
    backgroundColor: '#D1D5DB',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleOn: {
    alignSelf: 'flex-end',
  },
  toggleCircleOff: {
    alignSelf: 'flex-start',
  },
});
