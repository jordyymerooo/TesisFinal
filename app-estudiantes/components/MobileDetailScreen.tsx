import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
  Linking,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Wifi,
  Zap,
  Droplets,
  Sofa,
  Check,
  X,
  XCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home,
  Clock,
  User,
  Wind,
  Edit3,
  AlertTriangle,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/theme/theme';
import { PrimaryButton } from './ui/PrimaryButton';
import { ReportModal } from '../src/components/ReportModal';
import {
  getPropertyDetails,
  toggleFavorite,
  getFavorites,
  getCurrentUser,
  getCurrentUserRole,
  getCurrentUserIdRol,
  updatePropertyStatus,
} from '../services/api';
import { formatPrice } from '../src/utils/formatters';

const SERVICE_CONFIG: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  agua: { label: 'Agua Potable', icon: Droplets, bg: '#EFF6FF', color: '#3B82F6' },
  luz: { label: 'Electricidad', icon: Zap, bg: '#FFFBEB', color: '#F59E0B' },
  internet: { label: 'Internet Fibra', icon: Wifi, bg: '#F5F3FF', color: '#8B5CF6' },
  amoblado: { label: 'Amoblado', icon: Sofa, bg: '#ECFDF5', color: '#10B981' },
  bano_privado: { label: 'Baño Privado', icon: Sparkles, bg: '#FEF3C7', color: '#D97706' },
  ac: { label: 'Aire Acond.', icon: Wind, bg: '#E0F2FE', color: '#0284C7' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WINE = '#8C1515';

// Imagen de respaldo si no hay fotos cargadas
const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

interface MobileDetailScreenProps {
  route?: { params?: { id?: number } };
  navigation?: any;
  onBack?: () => void;
}

export function MobileDetailScreen({ route, navigation, onBack }: MobileDetailScreenProps) {
  const propertyId = route?.params?.id;

  // ── Estado del Inmueble desde PostgreSQL ──
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [modalReporteVisible, setModalReporteVisible] = useState<boolean>(false);

  // ── Usuario actual y permisos ──
  const user = getCurrentUser();
  const userRole = getCurrentUserRole();
  const userIdRol = getCurrentUserIdRol();

  const isOwner = Boolean(
    user &&
    property?.id_arrendador &&
    (Number(user.id_usuario ?? user.id) === Number(property.id_arrendador))
  );

  const isStudent = userIdRol === 1 || userRole?.toLowerCase() === 'estudiante';

  // ── Servicios incluidos dinámicos ──
  const parsedServices = useMemo(() => {
    if (property?.servicios && Array.isArray(property.servicios) && property.servicios.length > 0) {
      return property.servicios.map((s: any) => {
        if (typeof s === 'string') return s.toLowerCase();
        return (s.clave || s.nombre || '').toLowerCase();
      });
    }
    if (property?.servicios_incluidos) {
      return ['agua', 'luz', 'internet', 'amoblado'];
    }
    return [];
  }, [property?.servicios, property?.servicios_incluidos]);

  // ── Cargar datos completos con useFocusEffect ──
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [data, favs] = await Promise.all([
          getPropertyDetails(propertyId),
          getFavorites().catch(() => []),
        ]);
        if (isMounted && data) {
          setProperty(data);
          const st = (data.estado || '').toLowerCase();
          setIsAvailable(st === 'disponible' || st === 'publicado' || st === 'activa');
          const isFav =
            Array.isArray(favs) &&
            favs.some((f: any) => f.id_inmueble === propertyId || f.id === propertyId);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.warn('[MobileDetailScreen] Error al cargar inmueble:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [propertyId])
);

  // Alternar favorito con persistencia en backend
  const handleToggleFavorite = async () => {
    const nextStatus = !isFavorite;
    setIsFavorite(nextStatus);
    try {
      const res = await toggleFavorite(propertyId);
      if (res && typeof res.is_favorite === 'boolean') {
        setIsFavorite(res.is_favorite);
      }
    } catch (err: any) {
      setIsFavorite(!nextStatus);
      Alert.alert('Error', 'No se pudo actualizar tu lista de favoritos.');
    }
  };

  // Alternar disponibilidad (Switch del arrendador)
  const handleSwitchAvailability = async (newValue: boolean) => {
    setIsAvailable(newValue);
    const newStatus = newValue ? 'disponible' : 'ocupada';

    // Actualización local inmediata
    setProperty((prev: any) => (prev ? { ...prev, estado: newStatus } : prev));

    try {
      const id = property?.id_inmueble || property?.id || propertyId;
      await updatePropertyStatus(id, newStatus);
    } catch (err: any) {
      console.error('[handleSwitchAvailability] Error:', err);
      // Revertir si falla
      setIsAvailable(!newValue);
      setProperty((prev: any) =>
        prev ? { ...prev, estado: !newValue ? 'disponible' : 'ocupada' } : prev
      );
      Alert.alert('Error', err?.message || 'No se pudo actualizar la visibilidad del inmueble.');
    }
  };

  // Manejador de retroceso
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  // Arreglo de fotografías reales desde backend
  const photosList: string[] =
    property?.fotografias && property.fotografias.length > 0
      ? property.fotografias.map((f: any) => f.url)
      : [FALLBACK_PHOTO];

  // Datos del Arrendador
  const arrendador = property?.arrendador;
  const perfil = arrendador?.perfil;
  const isVerifiedLandlord =
    Boolean(perfil?.documento_verificado) ||
    Boolean(arrendador?.correo?.includes('@uleam.edu.ec'));
  const landlordName = arrendador?.nombres || (arrendador?.nombre) || null;
  const landlordPhone = perfil?.telefono || arrendador?.telefono || null;
  const landlordAvatar = perfil?.foto_perfil_url || arrendador?.foto || null;

  // Ubicación y distancia
  const ubicacion = property?.ubicacion;
  const direccionCompleta = ubicacion
    ? `${ubicacion.sector ? ubicacion.sector + ', ' : ''}${ubicacion.direccion_referencial || 'Manta'}`
    : 'Sector Barbasquillo, Manta';
  const distanciaText = ubicacion?.distancia_uleam_km
    ? `${Math.round(ubicacion.distancia_uleam_km * 1000)}m de la entrada ULEAM`
    : 'A pocos minutos del campus ULEAM';

  // Normas del alojamiento (parseadas dinámicamente desde string con saltos de línea de la BD)
  const parsedNormas: string[] = useMemo(() => {
    if (property?.normas && typeof property.normas === 'string' && property.normas.trim().length > 0) {
      return property.normas
        .split('\n')
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0);
    }
    return [];
  }, [property?.normas]);

  // Contactar Arrendador
  const handleContactLandlord = () => {
    Alert.alert(
      'Contactar Arrendador',
      `¿Cómo deseas comunicarte con ${landlordName}?`,
      [
        {
          text: 'Chat en la App',
          onPress: () => {
            if (property?.id_arrendador && navigation?.navigate) {
              navigation.navigate('ChatRoom', {
                userId: property.id_arrendador,
                userName: landlordName,
                userPhoto: property?.arrendador?.perfil?.foto_url,
                userRole: 'Arrendador',
                propertyTitle: property?.titulo,
                inmuebleId: property?.id,
              });
            }
          },
        },
        {
          text: 'Enviar WhatsApp',
          onPress: () => {
            const cleanPhone = landlordPhone.replace(/\D/g, '');
            const msg = encodeURIComponent(
              `Hola ${landlordName}, vi tu anuncio "${property?.titulo}" en ULEAM Rental y me gustaría consultar disponibilidad.`
            );
            Linking.openURL(`https://wa.me/593${cleanPhone.replace(/^0/, '')}?text=${msg}`).catch(() =>
              Alert.alert('WhatsApp', `Mensaje a: ${landlordPhone}`)
            );
          },
        },
        {
          text: 'Llamar por Teléfono',
          onPress: () => {
            Linking.openURL(`tel:${landlordPhone}`).catch(() =>
              Alert.alert('Teléfono', `Número: ${landlordPhone}`)
            );
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.WinePrimary} />
        <Text style={styles.loadingText}>Cargando información del alojamiento...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Carrusel Horizontal Superior con Fotografías Reales ── */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(slide);
            }}
            style={styles.carouselScroll}
          >
            {photosList.map((photoUrl, index) => (
              <View key={index} style={styles.carouselSlide}>
                <Image source={{ uri: photoUrl }} style={styles.carouselImage} />
              </View>
            ))}
          </ScrollView>

          {/* Botones de Navegación Superpuestos (Atrás, Compartir, Favorito) */}
          <View style={styles.topNavigationRow}>
            <TouchableOpacity style={styles.navIconButton} onPress={handleBack} activeOpacity={0.85}>
              <ArrowLeft size={20} color={Colors.Gray900} />
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              <TouchableOpacity
                style={styles.navIconButton}
                onPress={handleToggleFavorite}
                activeOpacity={0.85}
                accessibilityLabel="Guardar en favoritos"
              >
                <Heart
                  size={19}
                  color={isFavorite ? Colors.WinePrimary : Colors.Gray700}
                  fill={isFavorite ? Colors.WinePrimary : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contador de Fotos Flotante (ej. 1 / 4) */}
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>
              {currentImageIndex + 1} / {photosList.length}
            </Text>
          </View>

          {/* Puntos Indicadores del Carrusel */}
          {photosList.length > 1 && (
            <View style={styles.dotsContainer}>
              {photosList.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dotIndicator,
                    idx === currentImageIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Cuerpo del Detalle ── */}
        <View style={styles.bodyContainer}>
          {/* Badges de Estado */}
          <View style={styles.badgesHeaderRow}>
            <View
              style={[
                styles.statusBadge,
                isAvailable ? styles.statusBadgeAvailable : styles.statusBadgeOccupied,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isAvailable ? styles.statusBadgeTextAvailable : styles.statusBadgeTextOccupied,
                ]}
              >
                ● {isAvailable ? 'Disponible' : 'Ocupada'}
              </Text>
            </View>
          </View>

          {/* Título de la Propiedad */}
          <Text style={styles.propertyTitle}>
            {property?.titulo || 'Alojamiento Universitario ULEAM'}
          </Text>

          {/* Dirección y Distancia al Campus */}
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.WinePrimary} style={{ marginRight: 6, flexShrink: 0 }} />
            <Text style={styles.locationAddressText} numberOfLines={2}>
              {direccionCompleta}
            </Text>
          </View>

          <View style={styles.distanceBadgeRow}>
            <Clock size={13} color={Colors.Gray600} style={{ marginRight: 4 }} />
            <Text style={styles.distanceBadgeText}>{distanciaText}</Text>
          </View>

          {/* Precio Mensual Destacado */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              ${formatPrice(property?.precio_mensual ?? property?.precio ?? 180)}
            </Text>
            <Text style={styles.pricePeriod}>
              / mes
            </Text>
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Panel de Control de Visibilidad para el Arrendador Propietario ── */}
          {isOwner && (
            <View style={styles.landlordControlCard}>
              <View style={styles.controlCardHeader}>
                <View style={styles.controlCardTextContainer}>
                  <Text style={styles.controlCardTitle}>Visibilidad del Alojamiento</Text>
                  <Text style={styles.controlCardSubtitle}>
                    {isAvailable
                      ? 'Disponible (Visible en el mapa)'
                      : 'Ocupada (Oculta para estudiantes)'}
                  </Text>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={handleSwitchAvailability}
                  trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                  thumbColor={isAvailable ? '#059669' : '#94A3B8'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            </View>
          )}

          {/* ── Tarjeta del Arrendador con Verificación ── */}
          <Text style={styles.sectionTitle}>Propietario del Alojamiento</Text>
          <View style={styles.landlordCard}>
            {landlordAvatar ? (
              <Image source={{ uri: landlordAvatar }} style={styles.landlordAvatar} />
            ) : (
              <View style={[styles.landlordAvatar, { backgroundColor: Colors.WinePrimary, alignItems: 'center', justifyContent: 'center' }]}>
                <User size={24} color="#fff" />
              </View>
            )}

            <View style={styles.landlordDetails}>
              <View style={styles.landlordNameRow}>
                <Text style={styles.landlordName}>{property?.arrendador?.nombres || landlordName}</Text>
                {isVerifiedLandlord && (
                  <ShieldCheck size={16} color={Colors.Success} style={{ marginLeft: 6 }} />
                )}
              </View>

              {/* Badge de Verificación Verde */}
              {isVerifiedLandlord ? (
                <View style={styles.verifiedLandlordBadge}>
                  <ShieldCheck size={12} color={Colors.Success} style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedLandlordText}>Arrendador Verificado ULEAM</Text>
                </View>
              ) : (
                <Text style={styles.landlordSubtitle}>{property?.arrendador?.nombres ? `En verificación` : 'Usuario en proceso de verificación'}</Text>
              )}
            </View>

            {/* Accesos Rápidos de Contacto */}
            <View style={styles.landlordQuickActions}>
              {landlordPhone && (
                <TouchableOpacity
                  style={[styles.contactCircleBtn, { backgroundColor: Colors.InfoLight }]}
                  onPress={() => Linking.openURL(`tel:${landlordPhone}`)}
                  activeOpacity={0.8}
                >
                  <Phone size={16} color={Colors.Info} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.contactCircleBtn, { backgroundColor: Colors.SuccessLight }]}
                onPress={handleContactLandlord}
                activeOpacity={0.8}
              >
                <MessageCircle size={16} color={Colors.Success} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Servicios y Comodidades */}
          <Text style={styles.sectionTitle}>Servicios Incluidos</Text>
          {parsedServices.length > 0 ? (
            <View style={styles.servicesGrid}>
              {parsedServices.map((srvKey: string, idx: number) => {
                const conf = SERVICE_CONFIG[srvKey] || {
                  label: srvKey.charAt(0).toUpperCase() + srvKey.slice(1).replace('_', ' '),
                  icon: Sparkles,
                  bg: '#F1F5F9',
                  color: '#475569',
                };
                const IconComponent = conf.icon;
                return (
                  <View key={idx} style={[styles.serviceItem, { backgroundColor: conf.bg }]}>
                    <IconComponent size={20} color={conf.color} />
                    <Text style={styles.serviceItemText}>{conf.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyNormasMessage}>
              Este alojamiento no tiene servicios adicionales incluidos.
            </Text>
          )}

          <View style={styles.sectionDivider} />

          {/* Descripción del Inmueble */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionContent}>
            {property?.descripcion ||
              'Alojamiento cómodo y seguro ideal para la vida estudiantil en Manta. Cuenta con excelente iluminación natural, baño independiente, área de estudio y fácil acceso al campus de la ULEAM.'}
          </Text>

          <View style={styles.sectionDivider} />

          {/* Reglas de Convivencia / Normas del Alojamiento */}
          <Text style={styles.sectionTitle}>Normas del Alojamiento</Text>
          <View style={styles.rulesList}>
            {parsedNormas.length > 0 ? (
              parsedNormas.map((norma: string, idx: number) => {
                const trimmedNorma = norma.replace(/^[•\-\*]\s*/, '').trim();
                if (!trimmedNorma) return null;

                const isRestrictive =
                  trimmedNorma.toLowerCase().startsWith('no ') ||
                  trimmedNorma.toLowerCase().includes('prohibido');

                return (
                  <View key={idx} style={styles.ruleItem}>
                    {isRestrictive ? (
                      <XCircle color="#EF4444" size={20} />
                    ) : (
                      <CheckCircle2 color="#10B981" size={20} />
                    )}
                    <Text style={styles.ruleLabel}>{trimmedNorma}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyNormasMessage}>
                El arrendador no ha especificado normas adicionales.
              </Text>
            )}
          </View>

          {/* Botón Discreto para Reportar Inmueble */}
          {!isOwner && (
            <TouchableOpacity
              onPress={() => setModalReporteVisible(true)}
              style={styles.reportPropertyButton}
              activeOpacity={0.7}
            >
              <AlertTriangle size={15} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.reportPropertyButtonText}>Reportar este inmueble</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Barra Fija Inferior con Botón Contactar Arrendador ── */}
      <View style={styles.bottomFixedBar}>
        <View style={styles.bottomPriceGroup}>
          <Text style={styles.bottomPriceLabel}>Tarifa mensual</Text>
          <Text style={styles.bottomPriceValue}>
            ${formatPrice(property?.precio_mensual ?? property?.precio ?? 180)}
          </Text>
        </View>

        {/* Solo mostrar botón si el usuario NO es el dueño de este inmueble */}
        {!isOwner && (isStudent || !userRole || userRole === 'estudiante') && (
          <PrimaryButton
            title="Contactar Arrendador"
            style={styles.contactPrimaryButton}
            onPress={handleContactLandlord}
            icon={<MessageCircle size={18} color={Colors.White} />}
          />
        )}

        {/* Si es el dueño, mostrar botón de edición directa */}
        {isOwner && (
          <TouchableOpacity
            style={styles.ownerEditButton}
            onPress={() => {
              if (navigation?.navigate) {
                navigation.navigate('PublishProperty', { editMode: true, propertyData: property });
              }
            }}
            activeOpacity={0.8}
          >
            <Edit3 size={16} color={Colors.White} style={{ marginRight: 6 }} />
            <Text style={styles.ownerEditButtonText}>Editar mi Propiedad</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de Denuncia / Reporte */}
      <ReportModal
        visible={modalReporteVisible}
        onClose={() => setModalReporteVisible(false)}
        propertyId={property?.id_inmueble || property?.id || propertyId}
        landlordId={property?.id_arrendador || property?.arrendador_id || property?.arrendador?.id_usuario}
        propertyTitle={property?.titulo}
      />
    </SafeAreaView>
  );
}

export { MobileDetailScreen as PropertyDetailScreen, MobileDetailScreen as AlojamientoDetalleScreen };
export default MobileDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.Gray600,
    fontWeight: Typography.weight.semibold,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  carouselWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#000000',
    position: 'relative',
  },
  carouselScroll: {
    width: '100%',
    height: '100%',
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topNavigationRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: Spacing.base,
    right: Spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  photoCountText: {
    color: Colors.White,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dotIndicator: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.White,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bodyContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  badgesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeOccupied: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  statusBadgeTextAvailable: {
    color: '#059669',
  },
  statusBadgeTextOccupied: {
    color: '#4B5563',
  },
  landlordControlCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  controlCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlCardTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  controlCardTitle: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 2,
  },
  controlCardSubtitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    color: Colors.Gray600,
  },
  typeBadge: {
    backgroundColor: Colors.Gray100,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    color: Colors.Gray700,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  propertyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.Gray900,
    lineHeight: 28,
    marginBottom: Spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationAddressText: {
    fontSize: Typography.size.sm,
    color: Colors.Gray600,
    flex: 1,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray50,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  distanceBadgeText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray600,
    fontWeight: Typography.weight.semibold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  priceValue: {
    fontSize: 30,
    fontWeight: Typography.weight.black,
    color: Colors.WinePrimary,
  },
  pricePeriod: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    fontWeight: Typography.weight.medium,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.Gray200,
    marginVertical: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.md,
  },
  landlordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray50,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.Gray200,
  },
  landlordAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.WinePrimary,
  },
  landlordDetails: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landlordName: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  verifiedLandlordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedLandlordText: {
    fontSize: Typography.size.xs,
    color: Colors.Success,
    fontWeight: Typography.weight.bold,
  },
  landlordSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginTop: 2,
  },
  landlordQuickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  serviceItem: {
    minWidth: '28%',
    flexGrow: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  serviceItemText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray800,
    textAlign: 'center',
  },
  descriptionContent: {
    fontSize: Typography.size.sm,
    color: Colors.Gray600,
    lineHeight: 22,
  },
  rulesList: {
    gap: Spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ruleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleLabel: {
    fontSize: Typography.size.sm,
    color: Colors.Gray700,
    flex: 1,
  },
  emptyNormasMessage: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    fontStyle: 'italic',
    paddingVertical: Spacing.xs,
  },
  bottomFixedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.White,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray200,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  bottomPriceGroup: {
    marginRight: Spacing.base,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: Colors.Gray500,
    fontWeight: Typography.weight.medium,
  },
  bottomPriceValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.black,
    color: Colors.WinePrimary,
  },
  contactPrimaryButton: {
    flex: 1,
    height: 48,
  },
  ownerEditButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.WinePrimary,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  ownerEditButtonText: {
    color: Colors.White,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  reportPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'center',
  },
  reportPropertyButtonText: {
    fontSize: Typography.size.sm,
    color: '#EF4444',
    fontWeight: Typography.weight.semibold,
  },
});
