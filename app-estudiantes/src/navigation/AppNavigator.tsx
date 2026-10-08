
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import {
  Compass,
  Heart,
  MessageCircle,
  User,
  ArrowLeft,
  Plus,
  Building2,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/theme';
// ── Pantallas de Estudiante ──
import { StudentMapModule } from '../screens/student/StudentMapModule';
import { MobileDetailScreen } from '../screens/student/MobileDetailScreen';
import { FavoritesScreen } from '../screens/student/FavoritesScreen';
import { StudentRequestsScreen } from '../screens/student/StudentRequestsScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { ExploreScreen } from '../screens/student/ExploreScreen';

// ── Pantallas de Arrendador ──
import { PublishPropertyScreen } from '../screens/landlord/PublishPropertyScreen';
import { IdentityVerificationScreen } from '../screens/landlord/IdentityVerificationScreen';
import { WaitingApprovalScreen } from '../screens/landlord/WaitingApprovalScreen';
import { MyPropertiesScreen } from '../screens/landlord/MyPropertiesScreen';

// ── Pantallas de Autenticación & Onboarding ──
import { AuthModule } from '../screens/auth/AuthModule';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingSuccessScreen } from '../screens/auth/OnboardingSuccessScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// ── Pantallas Compartidas (Shared) ──
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { ChatRoomScreen } from '../screens/shared/ChatRoomScreen';
import { AvisosScreen } from '../screens/shared/AvisosScreen';

import { useAuth } from '../context/AuthContext';
export { IdentityVerificationScreen as KYCScreen } from '../screens/landlord/IdentityVerificationScreen';
import type { UserRole } from '../screens/auth/RoleSelectionScreen';
import {
  getCurrentUser,
  setCurrentUser,
  getCurrentUserIdRol,
  getCurrentUserRole,
  onUserRoleChange,
  onAuthStateChange,
  getAuthToken,
  restoreSessionFromStorage,
  clearSession,
  authService,
  chatService,
} from '../../services/api';

// ── Definición de Parámetros de Rutas ──
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Home: undefined;
  MisPropiedades: undefined;
  Solicitudes: undefined;
  PropertyDetail: { id: number };
  PublishProperty?: { editMode?: boolean; propertyData?: any };
  IdentityVerification: undefined;
  KycUploadScreen?: { reason?: string; userId?: number; email?: string };
  Favoritos: undefined;
  StudentRequests: undefined;
  Notifications: undefined;
  VerifyEmail: { email?: string };
  EmailVerificationScreen: { email?: string };
  ForgotPassword: undefined;
  ChatRoom: {
    userId: number;
    userName?: string;
    userPhoto?: string;
    userRole?: string;
    propertyTitle?: string;
    inmuebleId?: number;
  };
  Avisos: undefined;
};

// ── Onboarding Stack ──
export type OnboardingStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RoleSelection: undefined;
  Register: { role: UserRole };
  IdentityVerification: { userId?: number; email?: string };
  KycUploadScreen: { userId?: number; email?: string };
  OnboardingSuccess: { role: UserRole };
  VerifyEmail: { email?: string };
  EmailVerificationScreen: { email?: string };
  ForgotPassword: undefined;
};

// ── Root Navigator (Onboarding → Main) ──
export type RootNavigatorParamList = {
  Onboarding: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Explorar: undefined;
  Favoritos: undefined;
  MisPropiedades: undefined;
  Mensajes: undefined;
  Perfil: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabCompositeProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

// ── Pantallas Temporales Elegantes para Tabs en Construcción ──
function PlaceholderScreen({
  title,
  subtitle,
  icon: Icon,
  actionButton,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  actionButton?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.placeholderContainer}>
      <View style={styles.placeholderCard}>
        <View style={styles.iconCircle}>
          <Icon size={36} color={Colors.WinePrimary} />
        </View>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
        {actionButton}
      </View>
    </SafeAreaView>
  );
}

function FavoritosTab({ navigation }: MainTabCompositeProps<'Favoritos'>) {
  return <FavoritesScreen navigation={navigation} />;
}

function MensajesTab({ navigation }: MainTabCompositeProps<'Mensajes'>) {
  return <MessagesScreen navigation={navigation} />;
}

function PerfilTab({
  navigation,
  onLogout,
}: MainTabCompositeProps<'Perfil'> & { onLogout?: () => void }) {
  return <ProfileScreen navigation={navigation} onLogout={onLogout} />;
}

// ── Tab: Explorar (StudentMapModule / ExploreScreen con Infinite Scroll) ──
function ExplorarTab({ navigation }: MainTabCompositeProps<'Explorar'>) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <View style={{ flex: 1 }}>
      {viewMode === 'map' ? (
        <StudentMapModule
          navigation={navigation}
          onSelectProperty={(id) => navigation.navigate('PropertyDetail', { id })}
          onToggleView={() => setViewMode('list')}
        />
      ) : (
        <ExploreScreen
          navigation={navigation}
          onSelectProperty={(id) => navigation.navigate('PropertyDetail', { id })}
          onToggleView={() => setViewMode('map')}
        />
      )}
    </View>
  );
}

// ── Tab: Mis Propiedades (Panel Arrendador) ──
function MyPropertiesTab({ navigation }: MainTabCompositeProps<'MisPropiedades'>) {
  return <MyPropertiesScreen navigation={navigation} />;
}

// ── BottomTabNavigator con Adaptación Dinámica según Rol ──
export function MainTabsNavigator({ onLogout }: { onLogout?: () => void } = {}) {
  const { unreadCount: contextUnreadCount, fetchUnreadCount, setUnreadCount: setContextUnreadCount } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(contextUnreadCount || 0);
  const [roleInfo, setRoleInfo] = useState<{ idRol: number | null; role: string | null }>(() => ({
    idRol: getCurrentUserIdRol(),
    role: getCurrentUserRole(),
  }));

  const isLandlord = roleInfo.idRol === 2 || roleInfo.role === 'arrendador';

  // Sincronizar contador de no leídos cada vez que el usuario interactúa o cambia de pantalla
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchUnread = async () => {
        try {
          const count = await chatService.getUnreadCount();
          if (isActive) {
            setUnreadCount(count);
            setContextUnreadCount?.(count);
          }
        } catch (error) {
          console.log('Error fetching unread count', error);
        }
      };
      fetchUnread();

      return () => {
        isActive = false;
      };
    }, [setContextUnreadCount])
  );

  // Mantener sincronizado si el contexto global cambia (ej. al abrir un chat)
  useEffect(() => {
    setUnreadCount(contextUnreadCount);
  }, [contextUnreadCount]);

  useEffect(() => {
    // Escuchar cambios de rol en tiempo real (login / register / logout)
    const unsubscribe = onUserRoleChange((role, idRol) => {
      setRoleInfo({ idRol, role });
      fetchUnreadCount();
    });

    // Auto-detección si hay token activo en backend
    if (getAuthToken()) {
      authService
        .getMe()
        .then((user) => {
          if (user) {
            setRoleInfo({
              idRol: user.id_rol ?? (user.rol?.id_rol ?? null),
              role: user.rol?.nombre?.toLowerCase() ?? (user.id_rol === 2 ? 'arrendador' : 'estudiante'),
            });
            fetchUnreadCount();
          }
        })
        .catch(() => { });
    }

    return unsubscribe;
  }, [fetchUnreadCount]);

  return (
    <Tab.Navigator
      key={isLandlord ? 'landlord-tabs' : 'student-tabs'}
      initialRouteName={isLandlord ? 'MisPropiedades' : 'Explorar'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.WinePrimary,
        tabBarInactiveTintColor: Colors.Gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {isLandlord ? (
        <Tab.Screen
          name="MisPropiedades"
          component={MyPropertiesTab}
          options={{
            tabBarLabel: 'Mis Propiedades',
            tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
          }}
        />
      ) : (
        <>
          <Tab.Screen
            name="Explorar"
            component={ExplorarTab}
            options={{
              tabBarLabel: 'Explorar',
              tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Favoritos"
            component={FavoritosTab}
            options={{
              tabBarLabel: 'Favoritos',
              tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
            }}
          />
        </>
      )}

      <Tab.Screen
        name="Mensajes"
        component={MensajesTab}
        options={{
          tabBarLabel: 'Mensajes',
          // Mostrar el badge solo si es mayor a 0, caso contrario undefined para ocultarlo
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#8B0000', // Rojo ULEAM
            color: 'white',
            fontSize: 10,
            minWidth: 16,
            maxHeight: 16,
            lineHeight: 16,
          },
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      >
        {(props) => <PerfilTab {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Wrappers para Stack Screens ──
function LoginScreenWrapper({
  navigation,
  onLoginSuccess,
}: RootStackScreenProps<'Login'> & { onLoginSuccess?: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.White }}>
      <SafeAreaView style={styles.loginHeaderNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={Colors.Gray800} />
          <Text style={styles.backButtonText}>Volver a Explorar</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {/* onLoginSuccess: navega a MainTabs Y activa la puerta raíz */}
      <AuthModule
        onLoginSuccess={() => {
          onLoginSuccess?.();
          navigation.navigate('MainTabs');
        }}
      />
    </View>
  );
}

function PropertyDetailWrapper({ route, navigation }: RootStackScreenProps<'PropertyDetail'>) {
  return <MobileDetailScreen route={route} navigation={navigation} onBack={() => navigation.goBack()} />;
}

function PublishPropertyWrapper({ route, navigation }: RootStackScreenProps<'PublishProperty'>) {
  return <PublishPropertyScreen route={route} navigation={navigation} onBack={() => navigation.goBack()} />;
}

function IdentityVerificationWrapper({ navigation }: RootStackScreenProps<'IdentityVerification'>) {
  return (
    <IdentityVerificationScreen
      onBack={() => navigation.goBack()}
      onSubmit={() => navigation.navigate('MainTabs')}
    />
  );
}

// ── Stack principal de la app (despues del Onboarding y con sesion) ──
function MainAppNavigator({
  onLoginSuccess,
  onLogout,
}: {
  onLoginSuccess: () => void;
  onLogout: () => void;
}) {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs">
        {() => <MainTabsNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Home">
        {() => <MainTabsNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="MisPropiedades">
        {() => <MainTabsNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Solicitudes">
        {() => <MainTabsNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {(props) => <LoginScreenWrapper {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="PropertyDetail" component={PropertyDetailWrapper} />
      <Stack.Screen name="PublishProperty" component={PublishPropertyWrapper} />
      <Stack.Screen name="IdentityVerification" component={IdentityVerificationWrapper} />
      <Stack.Screen name="KycUploadScreen" component={IdentityVerificationWrapper as any} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Avisos" component={AvisosScreen} />
      <Stack.Screen name="StudentRequests" component={StudentRequestsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="VerifyEmail">
        {({ route, navigation }: any) => (
          <VerifyEmailScreen
            email={route.params?.email}
            onBack={() => navigation.goBack()}
            onVerified={() => navigation.navigate('MainTabs')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Favoritos">
        {() => <MainTabsNavigator onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ── Onboarding Navigator (Welcome → Login o RoleSelection → Register → Success) ──
function OnboardingNavigator({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('estudiante');

  return (
    <OnboardingStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Paso 1: Bienvenida */}
      <OnboardingStack.Screen name="Welcome">
        {({ navigation }) => (
          <WelcomeScreen
            onStart={() => navigation.navigate('RoleSelection')}
            onLogin={() => navigation.navigate('Login')}
          />
        )}
      </OnboardingStack.Screen>

      {/* Ruta de Login dentro de Onboarding para 'Ya tengo una cuenta' */}
      <OnboardingStack.Screen name="Login">
        {({ navigation }) => (
          <View style={{ flex: 1, backgroundColor: Colors.White }}>
            <SafeAreaView style={styles.loginHeaderNav}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <ArrowLeft size={20} color={Colors.Gray800} />
                <Text style={styles.backButtonText}>Volver a Inicio</Text>
              </TouchableOpacity>
            </SafeAreaView>
            <AuthModule
              navigation={navigation}
              onLoginSuccess={() => {
                onComplete();
              }}
            />
          </View>
        )}
      </OnboardingStack.Screen>

      {/* Pantalla de Recuperación de Contraseña con PIN */}
      <OnboardingStack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            navigation={navigation}
            onBack={() => navigation.navigate('Login')}
            onSuccess={() => navigation.navigate('Login')}
          />
        )}
      </OnboardingStack.Screen>

      {/* Paso 2: Seleccion de Rol */}
      <OnboardingStack.Screen name="RoleSelection">
        {({ navigation }) => (
          <RoleSelectionScreen
            onContinue={(role) => {
              setSelectedRole(role);
              navigation.navigate('Register', { role });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </OnboardingStack.Screen>

      {/* Paso 2.5: Formulario de Registro → Llama a Laravel */}
      <OnboardingStack.Screen name="Register">
        {({ route, navigation }) => (
          <RegisterScreen
            role={route.params?.role ?? selectedRole}
            onSuccess={(_authData) => {
              navigation.navigate('OnboardingSuccess', { role: route.params?.role ?? selectedRole });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </OnboardingStack.Screen>

      {/* Paso 3: Exito */}
      <OnboardingStack.Screen name="OnboardingSuccess">
        {({ route }) => (
          <OnboardingSuccessScreen
            role={route.params?.role ?? selectedRole}
            onExplore={onComplete}
          />
        )}
      </OnboardingStack.Screen>

      {/* Pantalla KYC para Arrendadores durante Onboarding */}
      <OnboardingStack.Screen name="IdentityVerification">
        {({ route, navigation }: any) => (
          <IdentityVerificationScreen
            route={route}
            navigation={navigation}
            onBack={() => navigation.goBack()}
            onSubmit={() => {
              navigation.replace('EmailVerificationScreen', { email: route.params?.email });
            }}
          />
        )}
      </OnboardingStack.Screen>

      <OnboardingStack.Screen name="KycUploadScreen">
        {({ route, navigation }: any) => (
          <IdentityVerificationScreen
            route={route}
            navigation={navigation}
            onBack={() => navigation.goBack()}
            onSubmit={() => {
              navigation.replace('EmailVerificationScreen', { email: route.params?.email });
            }}
          />
        )}
      </OnboardingStack.Screen>

      {/* Pantalla de Verificación de Correo */}
      <OnboardingStack.Screen name="VerifyEmail">
        {({ route, navigation }: any) => (
          <VerifyEmailScreen
            email={route.params?.email}
            onBack={() => navigation.navigate('Login')}
            onVerified={onComplete}
          />
        )}
      </OnboardingStack.Screen>

      <OnboardingStack.Screen name="EmailVerificationScreen">
        {({ route, navigation }: any) => (
          <VerifyEmailScreen
            email={route.params?.email}
            onBack={() => navigation.navigate('Login')}
            onVerified={onComplete}
          />
        )}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

// ── Stack Navigator dedicado para el flujo KYC del Arrendador ──
const LandlordKycStack = createNativeStackNavigator();

function LandlordKycNavigator({
  initialRoute,
  onLogout,
  onApproved,
  recheckStatus,
}: {
  initialRoute: 'KycUploadScreen' | 'KycPendingScreen';
  onLogout: () => void;
  onApproved: () => void;
  recheckStatus: () => void;
}) {
  const { user, setUser } = useAuth();

  return (
    <LandlordKycStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <LandlordKycStack.Screen name="KycPendingScreen">
        {(props) => (
          <WaitingApprovalScreen
            {...props}
            onLogout={onLogout}
            onApproved={onApproved}
            onReupload={() => {
              if (user) {
                const updated = { ...user, estado_kyc: 'pendiente_documentos' };
                setUser(updated);
                setCurrentUser(updated);
              }
            }}
          />
        )}
      </LandlordKycStack.Screen>

      <LandlordKycStack.Screen name="WaitingApproval">
        {(props) => (
          <WaitingApprovalScreen
            {...props}
            onLogout={onLogout}
            onApproved={onApproved}
            onReupload={() => {
              if (user) {
                const updated = { ...user, estado_kyc: 'pendiente_documentos' };
                setUser(updated);
                setCurrentUser(updated);
              }
            }}
          />
        )}
      </LandlordKycStack.Screen>

      <LandlordKycStack.Screen name="KycUploadScreen">
        {(props) => (
          <IdentityVerificationScreen
            {...props}
            onBack={onLogout}
            onSubmit={() => {
              recheckStatus();
            }}
          />
        )}
      </LandlordKycStack.Screen>

      <LandlordKycStack.Screen name="IdentityVerification">
        {(props) => (
          <IdentityVerificationScreen
            {...props}
            onBack={onLogout}
            onSubmit={() => {
              recheckStatus();
            }}
          />
        )}
      </LandlordKycStack.Screen>
    </LandlordKycStack.Navigator>
  );
}

// ── Estado del arrendador para gatekeeper de navegación ──
type LandlordGateStatus = 'loading' | 'needs_documents' | 'waiting_approval' | 'approved' | 'not_landlord';

function useLandlordGatekeeper(isAuthenticated: boolean) {
  const evaluateInitialStatus = (): LandlordGateStatus => {
    if (!isAuthenticated || !getAuthToken()) {
      return 'not_landlord';
    }
    const user = getCurrentUser();
    if (!user) return 'loading';
    const idRol = user.id_rol ?? user.rol?.id_rol;
    const rolName = typeof user.rol === 'string' ? user.rol : user.rol?.nombre;
    if (idRol !== 2 && rolName !== 'arrendador') return 'not_landlord';
    if (user.estado_kyc === 'pendiente_documentos') return 'needs_documents';
    const perfil = user.perfil;
    if (perfil?.documento_verificado) return 'approved';
    if (perfil?.documento_url || perfil?.documento_tipo) return 'waiting_approval';
    return 'needs_documents';
  };

  const [status, setStatus] = useState<LandlordGateStatus>(evaluateInitialStatus);

  const checkStatus = async () => {
    if (!isAuthenticated || !getAuthToken()) {
      setStatus('not_landlord');
      return;
    }

    const cachedUser = getCurrentUser();
    if (cachedUser) {
      const idRol = cachedUser.id_rol ?? cachedUser.rol?.id_rol;
      const rolName = typeof cachedUser.rol === 'string' ? cachedUser.rol : cachedUser.rol?.nombre;
      if (idRol !== 2 && rolName !== 'arrendador') {
        setStatus('not_landlord');
        return;
      }
      if (cachedUser.estado_kyc === 'pendiente_documentos') {
        setStatus('needs_documents');
        return;
      }
      const perfil = cachedUser.perfil;
      if (perfil?.documento_verificado) {
        setStatus('approved');
        return;
      } else if (perfil?.documento_url || perfil?.documento_tipo) {
        setStatus('waiting_approval');
        return;
      } else {
        setStatus('needs_documents');
        return;
      }
    }

    setStatus('loading');
    try {
      const user = await authService.getMe();
      if (!user) {
        setStatus('not_landlord');
        return;
      }

      const idRol = user.id_rol ?? user.rol?.id_rol;
      const rolName = typeof user.rol === 'string' ? user.rol : user.rol?.nombre;

      // Estudiantes y admins pasan directo
      if (idRol !== 2 && rolName !== 'arrendador') {
        setStatus('not_landlord');
        return;
      }

      if (user.estado_kyc === 'pendiente_documentos') {
        setStatus('needs_documents');
        return;
      }

      // Es arrendador — verificar estado de documentos
      const perfil = user.perfil;

      if (perfil?.documento_verificado) {
        setStatus('approved');
      } else if (perfil?.documento_url || perfil?.documento_tipo) {
        setStatus('waiting_approval');
      } else {
        setStatus('needs_documents');
      }
    } catch {
      const cached = getCurrentUser();
      const idRol = cached?.id_rol ?? cached?.rol?.id_rol;
      const rolName = typeof cached?.rol === 'string' ? cached?.rol : cached?.rol?.nombre;
      if (idRol === 2 || rolName === 'arrendador') {
        if (cached?.perfil?.documento_verificado) {
          setStatus('approved');
        } else if (cached?.perfil?.documento_url || cached?.perfil?.documento_tipo) {
          setStatus('waiting_approval');
        } else {
          setStatus('needs_documents');
        }
      } else {
        setStatus('not_landlord');
      }
    }
  };

  useEffect(() => {
    checkStatus();
  }, [isAuthenticated]);

  return { status, recheckStatus: checkStatus };
}

// ── AppNavigator Raiz: Onboarding primero (con Login obligatorio si no hay token), MainApp despues ──
export function AppNavigator() {
  // 1. TODOS los hooks van primero, sin excepción (Reglas de Hooks de React)
  const { user, setUser } = useAuth();
  const [authToken, setAuthTokenState] = useState<string | null>(() => getAuthToken());
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => Boolean(getAuthToken()));
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Solo mostramos la app principal si hay token y el onboarding/login fue completado
  const showMainApp = Boolean(authToken && onboardingDone);

  // ── Referencia de navegación para que el hook de push pueda redirigir ──
  const navigationRef = useRef<any>(null);
  // Hook de notificaciones push — se activa automáticamente cuando hay sesión activa
  usePushNotifications(navigationRef);

  // Gatekeeper para arrendadores (declarado incondicionalmente al inicio con los demás hooks)
  const { status: landlordStatus, recheckStatus } = useLandlordGatekeeper(showMainApp);

  useEffect(() => {
    let isMounted = true;
    restoreSessionFromStorage().then((token) => {
      if (isMounted) {
        if (token) {
          setAuthTokenState(token);
          setOnboardingDone(true);
        }
        setIsInitializing(false);
      }
    });

    // Escuchar cambios de autenticación en tiempo real
    const unsubscribe = onAuthStateChange((token) => {
      setAuthTokenState(token);
      if (!token) {
        setOnboardingDone(false);
      } else {
        setOnboardingDone(true);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setAuthTokenState(null);
    setOnboardingDone(false);
  };

  const handleAuthSuccess = () => {
    setOnboardingDone(true);
    setAuthTokenState(getAuthToken());
  };

  // 2. Condicionales de renderizado y retornos tempranos (DESPUÉS de todos los hooks)
  // Indicador de carga inicial mientras se recupera la sesión desde AsyncStorage
  if (isInitializing) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.LightBG }}>
        <ActivityIndicator size="large" color={Colors.WinePrimary} />
      </SafeAreaView>
    );
  }

  // Paso 2: Interceptar al arrendador si no ha subido sus fotos
  const isLandlord =
    user?.rol === 'arrendador' ||
    user?.rol?.nombre === 'arrendador' ||
    user?.id_rol === 2;

  const kycNeedsDocuments =
    user?.estado_kyc === 'pendiente_documentos' ||
    landlordStatus === 'needs_documents' ||
    (!user?.estado_kyc && !user?.perfil?.documento_url && !user?.perfil?.documento_verificado);

  const isPendingOrRejected =
    landlordStatus === 'waiting_approval' ||
    user?.estado_kyc === 'rechazado' ||
    user?.estado_kyc === 'en_revision' ||
    user?.estado_kyc === 'pendiente';

  // Pantalla de carga mientras se verifica el estado del arrendador
  if (showMainApp && isLandlord && landlordStatus === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.LightBG }}>
        <ActivityIndicator size="large" color={Colors.WinePrimary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: Colors.Gray500, fontWeight: '600' }}>Verificando tu cuenta...</Text>
      </SafeAreaView>
    );
  }

  // Gatekeeper: Arrendador en flujo KYC (subir documentos o esperando aprobación)
  if (showMainApp && isLandlord && (kycNeedsDocuments || isPendingOrRejected)) {
    const initialRoute = kycNeedsDocuments ? 'KycUploadScreen' : 'KycPendingScreen';
    return (
      <LandlordKycNavigator
        initialRoute={initialRoute}
        onLogout={handleLogout}
        onApproved={() => recheckStatus()}
        recheckStatus={recheckStatus}
      />
    );
  }

  // Gatekeeper: Correo no verificado
  const currentUser = getCurrentUser();
  const isEmailUnverified =
    showMainApp &&
    currentUser &&
    currentUser.id_rol !== 3 &&
    (currentUser.email_verified_at === null || (currentUser as any).email_verified === false);

  if (isEmailUnverified) {
    return (
      <VerifyEmailScreen
        email={currentUser.correo}
        onBack={handleLogout}
        onVerified={async () => {
          try {
            const me = await authService.getMe();
            if (me?.email_verified_at) {
              setAuthTokenState(getAuthToken());
            }
          } catch {}
        }}
      />
    );
  }

  return (
    <RootStack.Navigator
      key={showMainApp ? 'main-app-root' : 'auth-onboarding-root'}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {!showMainApp ? (
        <RootStack.Screen name="Onboarding">
          {() => <OnboardingNavigator onComplete={handleAuthSuccess} />}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="MainApp">
          {() => (
            <MainAppNavigator
              onLoginSuccess={handleAuthSuccess}
              onLogout={handleLogout}
            />
          )}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}

// ── Estilos Nativos ──
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.White,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    ...Shadows.soft,
  },
  tabBarLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.LightBG,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  placeholderCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  placeholderTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  perfilButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  publishShortcutBtn: {
    backgroundColor: Colors.WinePrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    ...Shadows.primary,
  },
  loginShortcutBtn: {
    backgroundColor: Colors.DarkCanvas,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    width: '100%',
    alignItems: 'center',
    ...Shadows.soft,
  },
  loginShortcutText: {
    color: Colors.White,
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
  },
  loginHeaderNav: {
    backgroundColor: Colors.White,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
  },
});

export default AppNavigator;
