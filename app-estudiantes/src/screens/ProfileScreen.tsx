import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Plus,
  Home,
  Heart,
  Bell,
  Clock,
  MessageCircle,
  Sparkles,
  Award,
  RefreshCw,
  Camera,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/theme';
import apiClient, { getProfile, logout, getCurrentUserIdRol, getStudentRequests } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  navigation?: any;
  onLogout?: () => void;
}

export function ProfileScreen({ navigation, onLogout }: ProfileScreenProps) {
  const { user: authUser, setUser } = useAuth();

  // ── Estados de React para los datos del usuario ──
  const [name, setName] = useState<string>(authUser?.nombres || 'Andrea Soledispa');
  const [email, setEmail] = useState<string>(authUser?.correo || 'andrea.soledispa@live.uleam.edu.ec');
  const [role, setRole] = useState<string>(authUser?.rol?.nombre || 'Estudiante');
  const [idRol, setIdRol] = useState<number | null>(() => authUser?.id_rol || getCurrentUserIdRol());
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    authUser?.perfil?.foto_perfil_url || authUser?.foto_url || authUser?.foto_perfil || null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [currentRental, setCurrentRental] = useState<any | null>(null);

  // ── Llamada a la API al montar el componente ──
  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data) {
        const user = data.user || data;
        if (user.nombres) {
          setName(user.nombres);
        }
        if (user.correo) {
          setEmail(user.correo);
          // Verificación: Simulado mediante correo @live.uleam.edu.ec o @uleam.edu.ec o perfil verificado
          const verified =
            user.correo.includes('@live.uleam.edu.ec') ||
            user.correo.includes('@uleam.edu.ec') ||
            Boolean(user.perfil?.documento_verificado);
          setIsVerified(verified);
        }
        const userRolId = user.id_rol ?? user.rol?.id_rol;
        if (userRolId) {
          setIdRol(userRolId);
        }
        if (user.rol?.nombre) {
          const rName = user.rol.nombre.toLowerCase();
          setRole(rName.charAt(0).toUpperCase() + rName.slice(1));
        }
        const fetchedAvatar = user.perfil?.foto_perfil_url || user.foto_url || user.foto_perfil || null;
        if (fetchedAvatar) {
          setAvatarUrl(fetchedAvatar);
        }

        // Si es estudiante, buscar si tiene un alquiler aceptado (activo)
        const isStudent =
          (userRolId ? userRolId === 1 : idRol === 1) ||
          user.rol?.nombre?.toLowerCase() === 'estudiante';
        if (isStudent) {
          try {
            const requests = await getStudentRequests();
            const accepted = Array.isArray(requests)
              ? requests.find((r: any) => (r.estado || '').toLowerCase() === 'aceptada')
              : null;
            setCurrentRental(accepted || null);
          } catch (reqErr) {
            console.warn('[ProfileScreen] Error al obtener solicitudes del estudiante:', reqErr);
          }
        }
      }
    } catch (error) {
      console.warn('[ProfileScreen] Error al obtener perfil:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ── Selección y cambio de foto de perfil ──
  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se requiere acceso a la galería para cambiar tu foto.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingPhoto(true);

        const formData = new FormData();
        const filename = asset.uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

        formData.append('foto', {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: filename,
          type: type === 'image/jpg' ? 'image/jpeg' : type,
        } as any);

        const res = await apiClient.post('/user/foto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newUrl =
          res.data?.url ||
          res.data?.foto_perfil_url ||
          res.data?.user?.foto_url ||
          res.data?.user?.foto_perfil;

        if (newUrl) {
          setAvatarUrl(newUrl);
          const updatedUser = {
            ...(authUser || {}),
            foto_perfil: newUrl,
            foto_url: newUrl,
            perfil: {
              ...(authUser?.perfil || {}),
              foto_perfil_url: newUrl,
            },
          };
          setUser(updatedUser);
        }

        Alert.alert('¡Foto Actualizada!', 'Tu nueva foto de perfil se guardó correctamente.');
      }
    } catch (err: any) {
      console.error('[ProfileScreen] Error al subir foto de perfil:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo subir la foto de perfil.';
      Alert.alert('Error', errMsg);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Lógica de Cerrar Sesión ──
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar tu sesión en este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.warn('[ProfileScreen] Error en logout:', err);
            }

            if (onLogout) {
              onLogout();
            } else if (navigation) {
              // Redirigir a Login o Welcome
              try {
                navigation.navigate('Login');
              } catch {
                try {
                  navigation.navigate('Welcome');
                } catch {
                  try {
                    navigation.navigate('Onboarding');
                  } catch {
                    navigation.goBack();
                  }
                }
              }
            }
          },
        },
      ]
    );
  };

  // Iniciales del usuario para el avatar si no hay foto
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || '')
      .join('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera superior */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Mi Perfil ULEAM</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => {
              setRefreshing(true);
              fetchUserProfile();
            }}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.WinePrimary} />
            ) : (
              <RefreshCw size={18} color={Colors.Gray600} />
            )}
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Perfil Principal */}
        <View style={styles.profileCard}>
          {loading && !refreshing ? (
            <View style={{ alignItems: 'center', width: '100%', paddingVertical: Spacing.sm }}>
              {/* Skeleton circular para el avatar */}
              <Skeleton.Circle size={88} style={{ marginBottom: Spacing.md }} />
              {/* Dos barras de texto para nombre y correo */}
              <Skeleton height={20} width="55%" style={{ marginBottom: Spacing.sm }} />
              <Skeleton height={14} width="72%" style={{ marginBottom: Spacing.md }} />
              {/* Badges placeholder */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Skeleton height={24} width={80} borderRadius={BorderRadius.pill} />
                <Skeleton height={24} width={90} borderRadius={BorderRadius.pill} />
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={uploadingPhoto}
                style={styles.avatarWrapper}
                accessibilityLabel="Cambiar foto de perfil"
                accessibilityRole="button"
              >
                {uploadingPhoto ? (
                  <View style={[styles.avatarFallback, { backgroundColor: Colors.WineLight }]}>
                    <ActivityIndicator size="small" color={Colors.WinePrimary} />
                  </View>
                ) : avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
                  </View>
                )}

                {/* Badge Flotante de Verificado */}
                {isVerified && (
                  <View style={styles.avatarCheckBadge}>
                    <ShieldCheck size={12} color={Colors.White} />
                  </View>
                )}

                {/* Badge de Cámara para Cambiar Foto */}
                <View style={styles.avatarCameraBadge}>
                  <Camera size={13} color={Colors.White} />
                </View>
              </TouchableOpacity>

              {/* Nombre & Correo Dinámicos */}
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>

              {/* Badges de Estado & Rol */}
              <View style={styles.badgesRow}>
                {/* Badge de Rol */}
                <View style={styles.roleBadge}>
                  <Award size={12} color={Colors.WinePrimary} style={{ marginRight: 4 }} />
                  <Text style={styles.roleBadgeText}>{role}</Text>
                </View>

                {/* Badge Verde de Verificada */}
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color={Colors.Success} style={{ marginRight: 4 }} />
                    <Text style={styles.verifiedBadgeText}>Verificada</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pendiente Verificación</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* MI ALOJAMIENTO ACTUAL (Tarjeta VIP Destacada debajo del Avatar) */}
        {currentRental && (
          <View style={styles.vipContainer}>
            <View style={styles.rentalSectionHeader}>
              <View style={styles.vipTitleBadge}>
                <Sparkles size={14} color="#D97706" />
                <Text style={styles.vipBadgeText}>MI ALOJAMIENTO ACTUAL</Text>
              </View>
              <View style={styles.activePill}>
                <View style={styles.activePillDot} />
                <Text style={styles.activePillText}>Alquiler Activo</Text>
              </View>
            </View>

            <View style={styles.rentalCard}>
              <Image
                source={{
                  uri:
                    currentRental.inmueble?.fotografias?.[0]?.url ||
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.rentalImage}
                resizeMode="cover"
              />

              <View style={styles.rentalCardBody}>
                <Text style={styles.rentalTitle} numberOfLines={1}>
                  {currentRental.inmueble?.titulo || 'Mi Alojamiento Universitario'}
                </Text>

                <View style={styles.rentalPriceRow}>
                  <Text style={styles.rentalPrice}>
                    ${currentRental.inmueble?.precio || '0'}
                    <Text style={styles.rentalPeriod}> / mes</Text>
                  </Text>
                  <Text style={styles.rentalType}>
                    {(currentRental.inmueble?.tipo || 'alojamiento').replace('_', ' ')}
                  </Text>
                </View>

                {currentRental.inmueble?.arrendador && (
                  <Text style={styles.rentalLandlord} numberOfLines={1}>
                    Arrendador: {currentRental.inmueble.arrendador.nombres}
                  </Text>
                )}

                <View style={styles.rentalButtonsRow}>
                  <TouchableOpacity
                    style={styles.rentalDetailBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (currentRental.id_inmueble && navigation?.navigate) {
                        navigation.navigate('PropertyDetail', { id: currentRental.id_inmueble });
                      }
                    }}
                  >
                    <Text style={styles.rentalDetailBtnText}>Ver detalle</Text>
                    <ChevronRight size={14} color={Colors.WinePrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rentalContactBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      const arr = currentRental.inmueble?.arrendador;
                      if (arr?.id_usuario && navigation?.navigate) {
                        navigation.navigate('ChatRoom', {
                          userId: arr.id_usuario,
                          userName: arr.nombres,
                          userPhoto: arr.perfil?.foto_perfil_url,
                          userRole: 'Arrendador',
                          propertyTitle: currentRental.inmueble?.titulo,
                          inmuebleId: currentRental.id_inmueble,
                        });
                      }
                    }}
                  >
                    <MessageCircle size={13} color={Colors.White} style={{ marginRight: 4 }} />
                    <Text style={styles.rentalContactBtnText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Acciones Rápidas para el Arrendador (Solo visible si id_rol === 2 o role === 'arrendador') */}
        {(idRol === 2 || role.toLowerCase() === 'arrendador') && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Gestión de Alojamiento</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation?.navigate?.('MisPropiedades')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: Colors.WineLight }]}>
                <Home size={20} color={Colors.WinePrimary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Mis Propiedades</Text>
                <Text style={styles.actionSubtitle}>
                  Gestiona tus alojamientos publicados, precios y disponibilidad
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.Gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation?.navigate?.('Solicitudes')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={20} color={Colors.Success} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Solicitudes de Reserva</Text>
                <Text style={styles.actionSubtitle}>
                  Revisa y acepta solicitudes de estudiantes universitarios
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.Gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation?.navigate?.('PublishProperty')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: Colors.WineLight }]}>
                <Plus size={20} color={Colors.WinePrimary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Publicar Nueva Propiedad</Text>
                <Text style={styles.actionSubtitle}>
                  Registra cuartos o departamentos cerca de la ULEAM
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.Gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, isVerified && { opacity: 0.6 }]}
              onPress={() => !isVerified && navigation?.navigate?.('IdentityVerification')}
              activeOpacity={isVerified ? 1 : 0.85}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: isVerified ? '#ECFDF5' : Colors.InfoLight }]}>
                <ShieldCheck size={20} color={isVerified ? Colors.Success : Colors.Info} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>
                  {isVerified ? 'Identidad Verificada' : 'Verificar Identidad'}
                </Text>
                <Text style={styles.actionSubtitle}>
                  {isVerified 
                    ? 'Tu identidad ya ha sido aprobada por la ULEAM' 
                    : 'Valida cédula y selfie para obtener insignia oficial'}
                </Text>
              </View>
              {!isVerified && <ChevronRight size={18} color={Colors.Gray400} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Opciones de la Cuenta */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Preferencias y Cuenta</Text>

          <View style={styles.settingsGroup}>
            {/* 1. Alojamientos Favoritos */}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate?.('Favoritos')}
            >
              <View style={styles.settingItemLeft}>
                <Heart size={18} color={Colors.WinePrimary} />
                <Text style={styles.settingItemLabel}>Alojamientos Favoritos</Text>
              </View>
              <ChevronRight size={16} color={Colors.Gray400} />
            </TouchableOpacity>

            {/* 2. Mis Solicitudes */}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate?.('StudentRequests')}
            >
              <View style={styles.settingItemLeft}>
                <Clock size={18} color={Colors.WinePrimary} />
                <Text style={styles.settingItemLabel}>Mis Solicitudes</Text>
              </View>
              <ChevronRight size={16} color={Colors.Gray400} />
            </TouchableOpacity>

            {/* 3. Notificaciones y Alertas */}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate?.('Notifications')}
            >
              <View style={styles.settingItemLeft}>
                <Bell size={18} color={Colors.WinePrimary} />
                <Text style={styles.settingItemLabel}>Notificaciones y Alertas</Text>
              </View>
              <ChevronRight size={16} color={Colors.Gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={18} color={Colors.Error} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Versión de la Aplicación */}
        <Text style={styles.versionFooter}>
          ULEAM Rental v1.0.0 · Tesis de Grado 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Alias de exportación para compatibilidad
export const AccountSettings = ProfileScreen;
export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: 120,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.Gray900,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  profileCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.Gray200,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.WinePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.primary,
  },
  avatarInitials: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.White,
    letterSpacing: 1,
  },
  avatarCheckBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.Success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.White,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.WinePrimary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.White,
    ...Shadows.soft,
  },
  userName: {
    fontSize: Typography.size.lg + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WineLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.WineBorder,
  },
  roleBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SuccessLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.SuccessBorder,
  },
  verifiedBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.Success,
  },
  pendingBadge: {
    backgroundColor: Colors.WarningLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.WarningBorder,
  },
  pendingBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.Warning,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  actionCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
  },
  settingsGroup: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingItemLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ErrorLight,
    borderWidth: 1,
    borderColor: Colors.ErrorBorder,
    borderRadius: BorderRadius.pill,
    height: 50,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutButtonText: {
    color: Colors.Error,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: Typography.size.xs,
    color: Colors.Gray400,
  },

  // ── Mi Alojamiento Actual (VIP) ──────────────────────────────────
  vipContainer: {
    marginBottom: Spacing.lg,
    padding: 2,
    borderRadius: BorderRadius.xl + 2,
    backgroundColor: 'transparent',
  },
  vipTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  vipBadgeText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.extrabold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  rentalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  activePillText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: '#059669',
  },
  rentalCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  rentalImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.Gray100,
  },
  rentalCardBody: {
    padding: Spacing.md,
  },
  rentalTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 4,
  },
  rentalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rentalPrice: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    color: Colors.WinePrimary,
  },
  rentalPeriod: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.regular,
    color: Colors.Gray500,
  },
  rentalType: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray600,
    textTransform: 'capitalize',
  },
  rentalLandlord: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginBottom: Spacing.md,
  },
  rentalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    paddingTop: Spacing.sm,
  },
  rentalDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rentalDetailBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  rentalContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WinePrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  rentalContactBtnText: {
    color: Colors.White,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
});
