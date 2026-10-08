import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  ChevronRight,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Edit3,
  Trash2,
  Search,
  X,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { getMyProperties, deleteProperty, updatePropertyStatus, LandlordProperty } from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/formatters';

type TabKey = 'todas' | 'activas' | 'en_revision' | 'ocupadas';

interface TabItem {
  key: TabKey;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'en_revision', label: 'En revisión' },
  { key: 'ocupadas', label: 'Ocupadas' },
];

function PropertyCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={168} borderRadius={0} />
      <View style={styles.cardBody}>
        <Skeleton height={20} width="85%" style={{ marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Skeleton height={14} width={14} borderRadius={7} />
          <Skeleton height={14} width="60%" />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: Spacing.sm + 2,
            borderTopWidth: 1,
            borderTopColor: Colors.Gray100,
          }}
        >
          <Skeleton height={22} width={70} />
          <Skeleton height={16} width={80} />
        </View>
      </View>
    </View>
  );
}

interface MyPropertiesScreenProps {
  navigation?: any;
}

export function MyPropertiesScreen({ navigation }: MyPropertiesScreenProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('todas');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyProperties();
      setProperties(data || []);
    } catch (err: any) {
      console.warn('[MyPropertiesScreen] Error cargando inmuebles:', err);
      setError(err.message || 'Error al cargar tus propiedades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email_verified_at) {
      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [fetchProperties, user?.email_verified_at]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  // Filtrado según la pestaña seleccionada y búsqueda local ultra segura
  const listadoFiltrado = useMemo(() => {
    // 1. Filtrar por estado (pestaña activa)
    const propiedadesLocales = properties.filter((item) => {
      const st = (item.estado || '').toLowerCase();
      if (activeTab === 'todas') return true;
      if (activeTab === 'activas') {
        return st === 'publicado' || st === 'activa' || st === 'activo' || st === 'disponible';
      }
      if (activeTab === 'en_revision') {
        return st === 'en_revision' || st === 'pendiente' || st === 'borrador';
      }
      if (activeTab === 'ocupadas') {
        return st === 'ocupado' || st === 'ocupada';
      }
      return true;
    });

    // 2. Lógica de búsqueda segura:
    if (!searchQuery) return propiedadesLocales; // Si no hay búsqueda, pasa el filtro

    const query = searchQuery.toLowerCase().trim();
    return propiedadesLocales.filter((prop) => {
      const matchTitulo = (prop.titulo?.toLowerCase() || '').includes(query);
      const matchDireccion = ((prop as any).direccion?.toLowerCase() || '').includes(query);
      const ubicacionStr =
        typeof prop.ubicacion === 'string'
          ? prop.ubicacion
          : [prop.ubicacion?.direccion_referencial, prop.ubicacion?.sector].filter(Boolean).join(' ');
      const matchUbicacion = (ubicacionStr?.toLowerCase() || '').includes(query);

      return matchTitulo || matchDireccion || matchUbicacion;
    });
  }, [properties, activeTab, searchQuery]);

  // Contadores por tab
  const counts = useMemo(() => {
    return {
      todas: properties.length,
      activas: properties.filter((i) => {
        const s = (i.estado || '').toLowerCase();
        return s === 'publicado' || s === 'activa' || s === 'activo' || s === 'disponible';
      }).length,
      en_revision: properties.filter((i) => {
        const s = (i.estado || '').toLowerCase();
        return s === 'en_revision' || s === 'pendiente' || s === 'borrador';
      }).length,
      ocupadas: properties.filter((i) => {
        const s = (i.estado || '').toLowerCase();
        return s === 'ocupado' || s === 'ocupada';
      }).length,
    };
  }, [properties]);

  const getStatusBadge = (estado: string) => {
    const st = (estado || '').toLowerCase();
    if (st === 'disponible' || st === 'publicado' || st === 'activa' || st === 'activo') {
      return {
        label: 'Disponible',
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        icon: CheckCircle2,
      };
    }
    if (st === 'ocupada' || st === 'ocupado') {
      return {
        label: 'Ocupada',
        bg: '#F3F4F6',
        color: '#4B5563',
        border: '#E5E7EB',
        icon: EyeOff,
      };
    }
    if (st === 'en_revision' || st === 'pendiente' || st === 'borrador') {
      return {
        label: 'En revisión',
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        icon: Clock,
      };
    }
    return {
      label: estado || 'Desconocido',
      bg: '#F3F4F6',
      color: '#4B5563',
      border: '#E5E7EB',
      icon: AlertCircle,
    };
  };

  const handleEdit = (property: LandlordProperty) => {
    if (navigation?.navigate) {
      navigation.navigate('PublishProperty', {
        editMode: true,
        propertyData: property,
      });
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(id);
              setProperties((prev) => prev.filter((item) => item.id_inmueble !== id));
              Alert.alert('Éxito', 'El inmueble ha sido eliminado correctamente.');
            } catch (err: any) {
              console.error('[MyPropertiesScreen] Error al eliminar:', err);
              Alert.alert('Error', err?.message || 'No se pudo eliminar el inmueble.');
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (property: LandlordProperty) => {
    if (navigation?.navigate) {
      navigation.navigate('PropertyDetail', { id: property.id_inmueble });
    }
  };

  const handleCreatePress = () => {
    if (navigation?.navigate) {
      navigation.navigate('PublishProperty');
    }
  };

  const renderPropertyCard = ({ item }: { item: LandlordProperty }) => {
    const badge = getStatusBadge(item.estado);
    const BadgeIcon = badge.icon;

    // Foto de portada o primera disponible
    const foto =
      item.fotografias?.find((f) => f.es_portada)?.url ||
      item.fotografias?.[0]?.url ||
      null;

    const direccion =
      item.ubicacion?.direccion_referencial ||
      item.ubicacion?.sector ||
      'Manta, Manabí (cerca de ULEAM)';


    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => handleCardPress(item)}
      >
        {/* Imagen de la propiedad */}
        <View style={styles.imageContainer}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.propertyImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Building2 size={32} color={Colors.Gray400} />
            </View>
          )}

          {/* Badge de Estado flotante */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <BadgeIcon size={12} color={badge.color} strokeWidth={2.4} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Información del Inmueble */}
        <View style={styles.cardBody}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {item.titulo}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.WinePrimary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {direccion}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>${formatPrice(item.precio_mensual ?? item.precio)}</Text>
              <Text style={styles.pricePeriod}>/mes</Text>
            </View>

            {/* Botones de Acción del Arrendador: Editar y Eliminar */}
            <View style={styles.cardActionsGroup}>
              <TouchableOpacity
                style={styles.editCardBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleEdit(item);
                }}
                activeOpacity={0.8}
                accessibilityLabel="Editar inmueble"
              >
                <Edit3 size={14} color={Colors.WinePrimary} />
                <Text style={styles.editCardBtnText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteCardBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleDelete(item.id_inmueble);
                }}
                activeOpacity={0.8}
                accessibilityLabel="Eliminar inmueble"
              >
                <Trash2 size={14} color={Colors.Error} />
                <Text style={styles.deleteCardBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (searchQuery.trim().length > 0) {
      return (
        <EmptyState
          icon={Search}
          title="Sin resultados de búsqueda"
          description={`No encontramos ninguna propiedad que coincida con "${searchQuery}". Intenta con otro término o limpia el buscador.`}
          actionText="Limpiar búsqueda"
          onAction={() => setSearchQuery('')}
        />
      );
    }

    const tabLabel = TABS.find((t) => t.key === activeTab)?.label || '';

    if (activeTab === 'todas') {
      return (
        <EmptyState
          icon={Building2}
          title="No tienes propiedades publicadas"
          description="Toca el botón + para empezar a registrar departamentos o habitaciones para la comunidad estudiantil de la ULEAM."
          actionText="Publicar mi primer inmueble"
          onAction={handleCreatePress}
          actionIcon={Plus}
        />
      );
    }

    return (
      <EmptyState
        icon={Building2}
        title={`Sin propiedades en "${tabLabel}"`}
        description={`Actualmente no tienes ningún inmueble bajo el estado "${tabLabel}". Las propiedades que cambien a este estado se mostrarán aquí.`}
        actionText="Publicar nueva propiedad"
        onAction={handleCreatePress}
        actionIcon={Plus}
      />
    );
  };

  if (!user?.email_verified_at) {
    return (
      <SafeAreaView style={styles.unverifiedContainer} edges={['top', 'left', 'right']}>
        <View style={styles.unverifiedCard}>
          <View style={styles.unverifiedIconCircle}>
            <AlertCircle size={36} color={Colors.WinePrimary} />
          </View>
          <Text style={styles.unverifiedTitle}>
            ¡Casi listo!
          </Text>
          <Text style={styles.unverifiedText}>
            Revisa tu correo y haz clic en el enlace de verificación para empezar a publicar inmuebles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      <View style={styles.contentContainer}>
        {/* Header Superior y Buscador directo en el return principal (evita pérdida de foco) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSubtitle}>Panel del Arrendador</Text>
              <Text style={styles.headerTitle}>Mis Propiedades</Text>
            </View>

            {/* Botón de búsqueda en la esquina superior derecha */}
            <TouchableOpacity
              style={styles.searchHeaderButton}
              onPress={() => {
                setIsSearchActive((prev) => {
                  if (prev) setSearchQuery('');
                  return !prev;
                });
              }}
              activeOpacity={0.8}
              accessibilityLabel={isSearchActive ? 'Cerrar búsqueda' : 'Buscar inmuebles'}
            >
              {isSearchActive ? (
                <X size={22} color={Colors.WinePrimary} />
              ) : (
                <Search size={22} color={Colors.WinePrimary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Barra de Búsqueda Condicional directa en el JSX */}
          {isSearchActive && (
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputWrapper}>
                <Search size={18} color={Colors.Gray400} style={{ marginRight: Spacing.sm }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por título o ubicación..."
                  placeholderTextColor={Colors.Gray400}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color={Colors.Gray500} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Tabs Superiores */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsContainer}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const count = counts[tab.key];
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                    <View
                      style={[
                        styles.tabBadge,
                        isActive ? styles.tabBadgeActive : styles.tabBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          isActive ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Listado de Inmuebles o Skeletons */}
        {loading && !refreshing ? (
          <View style={styles.listContent}>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={listadoFiltrado}
            keyExtractor={(item) => item.id_inmueble.toString()}
            renderItem={renderPropertyCard}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.WinePrimary]}
                tintColor={Colors.WinePrimary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Botón Flotante (FAB) rojo vino con ícono '+' */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleCreatePress}
          activeOpacity={0.88}
          accessibilityLabel="Publicar nueva propiedad"
        >
          <Plus size={26} color={Colors.White} strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.LightBG,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    fontWeight: Typography.weight.medium,
  },
  listContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    backgroundColor: Colors.White,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    marginBottom: Spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  searchHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.WineBorder,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.Gray200,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.Gray900,
    paddingVertical: 0,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs + 1,
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginTop: 2,
  },
  tabsWrapper: {
    paddingHorizontal: Spacing.base,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.Gray100,
    borderRadius: BorderRadius.lg,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: Colors.White,
    ...Shadows.soft,
  },
  tabLabel: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray500,
  },
  tabLabelActive: {
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.pill,
  },
  tabBadgeActive: {
    backgroundColor: Colors.WineLight,
  },
  tabBadgeInactive: {
    backgroundColor: Colors.Gray200,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
  tabBadgeTextActive: {
    color: Colors.WinePrimary,
  },
  tabBadgeTextInactive: {
    color: Colors.Gray600,
  },
  // Card de Propiedad
  card: {
    backgroundColor: Colors.White,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 168,
    backgroundColor: Colors.Gray100,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Gray100,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    ...Shadows.soft,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  cardBody: {
    padding: Spacing.base,
  },
  propertyTitle: {
    fontSize: Typography.size.base + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.xs + 2,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray500,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: Typography.size.lg + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  pricePeriod: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginLeft: 2,
  },
  cardActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.WineLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.WineBorder,
  },
  editCardBtnText: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  deleteCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteCardBtnText: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Error,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.semibold,
    color: Colors.WinePrimary,
  },
  // Floating Action Button (FAB)
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.WinePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Shadows.primary,
    elevation: 6,
  },
  // Estado Vacío
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.WinePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    ...Shadows.primary,
  },
  emptyButtonText: {
    color: Colors.White,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  // Bloqueo visual por correo no verificado
  unverifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.LightBG,
  },
  unverifiedCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...Shadows.card,
  },
  unverifiedIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  unverifiedTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    textAlign: 'center',
  },
  unverifiedText: {
    fontSize: Typography.size.sm,
    color: Colors.Gray600,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});
