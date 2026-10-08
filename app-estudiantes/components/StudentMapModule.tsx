import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, UrlTile } from 'react-native-maps';
import { SharedOSMMap } from './SharedOSMMap';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Navigation,
  ChevronRight,
  GraduationCap,
  MapPin,
  WifiOff,
  RefreshCw,
  List,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../src/theme/theme';
import { PrimaryButton } from './ui/PrimaryButton';
import api, { inmuebleService, getInmuebles, type MapInmueblePin } from '../services/api';
import { FilterModal, type FilterState, DEFAULT_FILTERS } from '../src/components/ui/FilterModal';
import { formatPrice } from '../src/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PointOfInterest {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_INITIAL_REGION: Region = {
  latitude: -0.9555,
  longitude: -80.7380,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

// Imagen de respaldo cuando el inmueble no tiene portada
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

const FILTER_PILLS = ['Todos', 'Económico <$150', 'Suites', 'Mini Depas', '<500m'];

export function StudentMapModule({
  onSelectProperty,
  navigation,
  onToggleView,
}: {
  onSelectProperty?: (id: number) => void;
  navigation?: any;
  onToggleView?: () => void;
}) {
  const mapRef        = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);

  // ── Estado de datos reales ──────────────────────────────────────
  const [properties, setProperties] = useState<MapInmueblePin[]>([]);
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [campusLocation, setCampusLocation] = useState<{lat: number, lng: number} | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region>(DEFAULT_INITIAL_REGION);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const [selectedProperty, setSelectedProperty] = useState<MapInmueblePin | null>(null);
  const [activeFilter, setActiveFilter]         = useState('Todos');
  const [searchQuery, setSearchQuery]           = useState('');

  // ── Filtros unificados del Modal ────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);

  const snapPoints = useMemo(() => ['22%', '50%', '85%'], []);

  // ── Paginación e Infinite Scroll ───────────────────────────────
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // ── Carga inicial desde Laravel ─────────────────────────────────
  const fetchProperties = useCallback(async () => {
    setLoadingMap(true);
    setErrorMsg(null);
    try {
      const [pins, poiRes, campusSettingsRes] = await Promise.all([
        inmuebleService.getInmueblesMapa(),
        api.get('/points-of-interest'),
        api.get('/settings/campus-location')
      ]);
      
      setProperties(pins);
      setPage(1);
      setHasMore(pins.length >= 10);
      
      let foundCampus = false;

      if (poiRes.data?.data) {
        const points = poiRes.data.data;
        setPois(points);
        const mainCampus = points.find((p: PointOfInterest) => p.type === 'campus_main');
        if (mainCampus) {
          foundCampus = true;
          setCampusLocation({ lat: Number(mainCampus.latitude), lng: Number(mainCampus.longitude) });
          setInitialRegion({
            latitude: Number(mainCampus.latitude),
            longitude: Number(mainCampus.longitude),
            latitudeDelta: 0.018,
            longitudeDelta: 0.018,
          });
        }
      }

      if (!foundCampus && campusSettingsRes.data?.status === 'success') {
        const cLat = campusSettingsRes.data.lat;
        const cLng = campusSettingsRes.data.lng;
        setCampusLocation({ lat: cLat, lng: cLng });
        setInitialRegion({
          latitude: cLat,
          longitude: cLng,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo cargar el mapa. Verifica tu conexión.');
    } finally {
      setLoadingMap(false);
    }
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        const nextPage = page + 1;
        const res = await getInmuebles(nextPage);
        const newItems = res?.data ?? [];
        if (newItems.length > 0) {
          const adapted: MapInmueblePin[] = newItems.map((i: any) => ({
            id: i.id_inmueble ?? i.id,
            titulo: i.titulo,
            precio: '$' + Number(i.precio).toFixed(2),
            precio_mensual: Number(i.precio),
            precio_numero: Number(i.precio),
            tipo: (i.tipo || '').replace(/_/g, ' '),
            tipo_raw: i.tipo,
            capacidad: i.capacidad ?? 1,
            calificacion: i.calificacion_promedio ?? 4.8,
            latitud: Number(i.ubicacion?.latitud ?? -0.9555),
            longitud: Number(i.ubicacion?.longitud ?? -80.7380),
            distancia: i.ubicacion?.distancia_uleam_km
              ? `${i.ubicacion.distancia_uleam_km} km de ULEAM`
              : 'Cerca de ULEAM',
            direccion: i.ubicacion?.direccion_referencial ?? i.ubicacion?.sector ?? '',
            portada_url: i.fotografias?.[0]?.url ?? null,
          }));
          setProperties((prev) => {
            const combined = [...prev, ...adapted];
            return combined.reduce((acc: MapInmueblePin[], current: MapInmueblePin) => {
              const x = acc.find((item) => item.id === current.id);
              if (!x) {
                return acc.concat([current]);
              }
              return acc;
            }, []);
          });
          setPage(nextPage);
          setHasMore((res.current_page ?? nextPage) < (res.last_page ?? 1));
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.warn('[StudentMapModule] Error cargando más inmuebles:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ── Filtro local sobre datos cargados ──────────────────────────
  const filteredProperties = useMemo(() => {
    let base = properties;

    // 1. Filtro por barra de búsqueda
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.direccion.toLowerCase().includes(q) ||
          p.tipo.toLowerCase().includes(q)
      );
    }

    // 2. Filtros del Modal Unificado (activeFilters)
    // A) Tipo de Alojamiento
    if (activeFilters.tipo && activeFilters.tipo !== 'Todos') {
      const t = activeFilters.tipo.toLowerCase();
      base = base.filter((p) => {
        const pType = (p.tipo_raw || p.tipo).toLowerCase();
        if (t === 'habitación' || t === 'habitacion') {
          return pType.includes('cuarto') || pType.includes('habitac');
        }
        if (t === 'departamento') {
          return pType.includes('depa') || pType.includes('departamento');
        }
        if (t === 'casa') {
          return pType.includes('casa');
        }
        if (t === 'suite') {
          return pType.includes('suite');
        }
        return pType.includes(t);
      });
    }

    // B) Rango de Precio Mínimo
    if (activeFilters.minPrice) {
      const min = parseFloat(activeFilters.minPrice);
      if (!isNaN(min)) {
        base = base.filter((p) => p.precio_numero >= min);
      }
    }

    // C) Rango de Precio Máximo
    if (activeFilters.maxPrice) {
      const max = parseFloat(activeFilters.maxPrice);
      if (!isNaN(max)) {
        base = base.filter((p) => p.precio_numero <= max);
      }
    }

    // D) Habitaciones / Capacidad
    if (activeFilters.rooms && activeFilters.rooms !== 'Cualquiera') {
      if (activeFilters.rooms === '3+') {
        base = base.filter((p) => (p.capacidad ?? 1) >= 3);
      } else {
        const targetRooms = parseInt(activeFilters.rooms, 10);
        if (!isNaN(targetRooms)) {
          base = base.filter((p) => (p.capacidad ?? 1) === targetRooms);
        }
      }
    }

    // 3. Píldoras rápidas horizontales
    switch (activeFilter) {
      case 'Económico <$150': return base.filter((p) => p.precio_numero < 150);
      case 'Suites':         return base.filter((p) => p.tipo.toLowerCase().includes('suite'));
      case 'Mini Depas':     return base.filter((p) => p.tipo.toLowerCase().includes('mini'));
      case '<500m':          return base.filter((p) => {
        const m = parseFloat(p.distancia);
        return p.distancia.includes('m de') && m < 500;
      });
      default: return base;
    }
  }, [properties, searchQuery, activeFilter, activeFilters]);

  // ── Selección de pin ────────────────────────────────────────────
  const handleSelectPin = useCallback((property: MapInmueblePin) => {
    setSelectedProperty(property);
    bottomSheetRef.current?.snapToIndex(1);
    mapRef.current?.animateToRegion(
      {
        latitude:  property.latitud  - 0.002,
        longitude: property.longitud,
        latitudeDelta:  0.012,
        longitudeDelta: 0.012,
      },
      600
    );
  }, []);

  const handleRecenter = () => {
    mapRef.current?.animateToRegion(initialRegion, 800);
  };

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      {/* ── 1. MapView Real ocupando toda la pantalla ── */}
      <SharedOSMMap
        ref={mapRef}
        style={styles.fullMap}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {/* Marcador del Campus Fallback (si no hay POI campus_main pero hay Settings) */}
        {campusLocation && !pois.some(p => p.type === 'campus_main') && (
          <Marker
            coordinate={{ latitude: campusLocation.lat, longitude: campusLocation.lng }}
            title="Campus ULEAM"
            description="Centro Educativo"
          >
            <View style={styles.uleamMarker}>
              <GraduationCap size={16} color={Colors.White} />
              <Text style={styles.uleamMarkerText}>Campus ULEAM</Text>
            </View>
          </Marker>
        )}
        {/* Puntos de interés desde Laravel */}
        {pois.map(poi => (
          <Marker
            key={`poi-${poi.id}`}
            coordinate={{ latitude: Number(poi.latitude), longitude: Number(poi.longitude) }}
            title={poi.name}
            description={poi.type === 'campus_main' ? 'Campus Central' : 'Acceso ULEAM'}
          >
            {poi.type === 'campus_main' ? (
              <View style={styles.uleamMarker}>
                <GraduationCap size={16} color={Colors.White} />
                <Text style={styles.uleamMarkerText}>{poi.name}</Text>
              </View>
            ) : (
              <View style={[styles.uleamMarker, { backgroundColor: '#F97316' }]}>
                <MapPin size={16} color={Colors.White} />
                <Text style={styles.uleamMarkerText}>{poi.name}</Text>
              </View>
            )}
          </Marker>
        ))}

        {/* Marcadores dinámicos desde Laravel */}
        {filteredProperties.map((prop, index) => {
          const isSelected = selectedProperty?.id === prop.id;
          return (
            <Marker
              key={`${prop.id}-${index}`}
              coordinate={{ latitude: prop.latitud, longitude: prop.longitud }}
              onPress={() => handleSelectPin(prop)}
              tracksViewChanges={false}
            >
              <View style={styles.pinWrapper}>
                <View
                  style={[
                    styles.pinBubble,
                    isSelected ? styles.pinBubbleActive : styles.pinBubbleInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pinText,
                      isSelected ? styles.pinTextActive : styles.pinTextInactive,
                    ]}
                  >
                    ${formatPrice(prop.precio_mensual ?? prop.precio_numero ?? prop.precio)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pinTriangle,
                    isSelected ? styles.pinTriangleActive : styles.pinTriangleInactive,
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </SharedOSMMap>

      {/* ── 2. Header Flotante: Barra de Búsqueda y Filtros ── */}
      <View style={styles.floatingHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.Gray500} style={{ marginRight: Spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alojamiento cerca ULEAM..."
              placeholderTextColor={Colors.Gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={Colors.Gray400} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
            activeOpacity={0.85}
            accessibilityLabel="Abrir filtros de búsqueda"
          >
            <SlidersHorizontal size={18} color={Colors.White} />
            {(activeFilters.tipo !== 'Todos' ||
              activeFilters.minPrice !== '' ||
              activeFilters.maxPrice !== '' ||
              activeFilters.rooms !== 'Cualquiera') && (
              <View style={styles.filterActiveDot} />
            )}
          </TouchableOpacity>

          {onToggleView && (
            <TouchableOpacity
              style={styles.toggleViewBtn}
              onPress={onToggleView}
              activeOpacity={0.85}
              accessibilityLabel="Ver listado con infinite scroll"
            >
              <List size={18} color={Colors.WinePrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Píldoras horizontales de filtrado */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill;
            return (
              <TouchableOpacity
                key={pill}
                style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
                onPress={() => setActiveFilter(pill)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    isActive ? styles.pillTextActive : styles.pillTextInactive,
                  ]}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 3. Botón Flotante para Recentrar en ULEAM ── */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.85}
      >
        <Navigation size={20} color={Colors.WinePrimary} />
      </TouchableOpacity>

      {/* ── Overlay: Cargando mapa ── */}
      {loadingMap && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.WinePrimary} />
            <Text style={styles.loadingText}>Cargando propiedades...</Text>
          </View>
        </View>
      )}

      {/* ── Banner de error con reintentar ── */}
      {errorMsg && !loadingMap && (
        <View style={styles.errorBanner}>
          <WifiOff size={16} color={Colors.Error} />
          <Text style={styles.errorBannerText} numberOfLines={2}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProperties} activeOpacity={0.8}>
            <RefreshCw size={14} color={Colors.White} />
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── 4. Gorhom Bottom Sheet para la Tarjeta o Lista de Propiedades ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
      >
        {selectedProperty ? (
          <BottomSheetView style={styles.sheetContent}>
            <View style={styles.cardContainer}>
              {/* Botón para volver a la lista general */}
              <TouchableOpacity
                style={styles.backToListBtn}
                onPress={() => {
                  setSelectedProperty(null);
                  bottomSheetRef.current?.snapToIndex(1);
                }}
                activeOpacity={0.7}
              >
                <ChevronRight size={13} color={Colors.WinePrimary} style={{ transform: [{ rotate: '180deg' }], marginRight: 4 }} />
                <Text style={styles.backToListText}>Ver todas las propiedades</Text>
              </TouchableOpacity>

              {/* Imagen y badges */}
              <View style={styles.cardTopRow}>
                <Image
                  source={{ uri: selectedProperty.portada_url ?? FALLBACK_IMAGE }}
                  style={styles.cardImage}
                  defaultSource={{ uri: FALLBACK_IMAGE }}
                />

                <View style={styles.cardInfo}>
                  <View style={styles.cardBadgesRow}>
                    {/* El badge de tipo de propiedad fue eliminado */}
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {selectedProperty.titulo}
                  </Text>

                  <View style={styles.cardLocationRow}>
                    <MapPin size={12} color={Colors.Gray500} style={{ marginRight: 4 }} />
                    <Text style={styles.cardDistance} numberOfLines={1}>
                      {selectedProperty.distancia}
                    </Text>
                  </View>

                  <Text style={styles.cardPrice}>
                    ${formatPrice(selectedProperty.precio_mensual ?? selectedProperty.precio_numero ?? selectedProperty.precio)}
                    <Text style={styles.cardPeriod}> / mes</Text>
                  </Text>
                </View>
              </View>

              {/* Dirección secundaria */}
              {selectedProperty.direccion.length > 0 && (
                <Text style={styles.cardAddress} numberOfLines={1}>
                  📍 {selectedProperty.direccion}
                </Text>
              )}

              {/* Botón CTA para ver detalles completos */}
              <PrimaryButton
                title="Ver detalles"
                style={styles.cardDetailBtn}
                onPress={() => {
                  if (onSelectProperty) {
                    onSelectProperty(selectedProperty.id);
                  } else if (navigation?.navigate) {
                    navigation.navigate('MobileDetailScreen', { id: selectedProperty.id });
                  }
                }}
                icon={<ChevronRight size={16} color={Colors.White} />}
              />
            </View>
          </BottomSheetView>
        ) : (
          <View style={styles.sheetListWrapper}>
            <View style={styles.listHeaderContainer}>
              <View style={styles.listHeaderTop}>
                <Text style={styles.listHeaderTitle}>Propiedades disponibles</Text>
                <View style={styles.listCountPill}>
                  <Text style={styles.listCountPillText}>{filteredProperties.length}</Text>
                </View>
              </View>
              <Text style={styles.listHeaderSubtitle}>
                Toca cualquier alojamiento para enfocarlo en el mapa
              </Text>
            </View>

            <BottomSheetFlatList
              data={filteredProperties}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.horizontalCard}
                  onPress={() => handleSelectPin(item)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.portada_url ?? FALLBACK_IMAGE }}
                    style={styles.horizontalCardImage}
                    defaultSource={{ uri: FALLBACK_IMAGE }}
                  />
                  <View style={styles.horizontalCardInfo}>
                    <View style={styles.horizontalCardBadges}>
                      <View style={styles.horizontalDistanceRow}>
                        <MapPin size={10} color={Colors.Gray500} style={{ marginRight: 2 }} />
                        <Text style={styles.horizontalDistanceText}>{item.distancia}</Text>
                      </View>
                    </View>

                    <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                      {item.titulo}
                    </Text>

                    <View style={styles.horizontalCardBottom}>
                      <Text style={styles.horizontalCardPrice}>
                        ${formatPrice(item.precio_mensual ?? item.precio_numero ?? item.precio)}
                        <Text style={styles.horizontalCardPeriod}> / mes</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                loadingMap ? (
                  <View style={styles.emptyCardState}>
                    <ActivityIndicator color={Colors.WinePrimary} />
                    <Text style={styles.emptyCardText}>Cargando propiedades...</Text>
                  </View>
                ) : (
                  <View style={styles.emptyCardState}>
                    <Text style={styles.emptyCardText}>No hay propiedades con este filtro.</Text>
                  </View>
                )
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={Colors.WinePrimary} />
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </BottomSheet>

      {/* ── 5. Modal de Filtros Unificado ── */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => setActiveFilters(newFilters)}
        initialFilters={activeFilters}
      />
    </GestureHandlerRootView>
  );
}

// ── Estilos Nativos Estrictos ──
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  fullMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  uleamMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.White,
    ...Shadows.card,
  },
  uleamMarkerText: {
    color: Colors.White,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.extrabold,
  },
  pinWrapper: {
    alignItems: 'center',
  },
  pinBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  pinBubbleActive: {
    backgroundColor: Colors.WinePrimary,
    borderWidth: 2,
    borderColor: Colors.White,
    transform: [{ scale: 1.12 }],
  },
  pinBubbleInactive: {
    backgroundColor: Colors.White,
    borderWidth: 1.5,
    borderColor: Colors.Gray300,
  },
  pinText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.extrabold,
  },
  pinTextActive: {
    color: Colors.White,
  },
  pinTextInactive: {
    color: Colors.Gray900,
  },
  pinTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pinTriangleActive: {
    borderTopColor: Colors.WinePrimary,
  },
  pinTriangleInactive: {
    borderTopColor: Colors.White,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: 10,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.Gray900,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.WinePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.primary,
  },
  toggleViewBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: Colors.White,
  },
  pillsScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    ...Shadows.soft,
  },
  pillActive: {
    backgroundColor: Colors.WinePrimary,
  },
  pillInactive: {
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Gray200,
  },
  pillText: {
    fontSize: Typography.size.xs,
  },
  pillTextActive: {
    color: Colors.White,
    fontWeight: Typography.weight.bold,
  },
  pillTextInactive: {
    color: Colors.Gray700,
    fontWeight: Typography.weight.medium,
  },
  recenterButton: {
    position: 'absolute',
    right: Spacing.base,
    bottom: '43%',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Shadows.card,
  },
  sheetBackground: {
    backgroundColor: Colors.White,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  sheetHandle: {
    backgroundColor: Colors.Gray300,
    width: 44,
    height: 4,
  },
  sheetContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  cardContainer: {
    gap: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Ajustado para cuando solo hay distancia u otro badge a la derecha
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDistance: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
  },
  cardPrice: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.black,
    color: Colors.WinePrimary,
  },
  cardPeriod: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    color: Colors.Gray500,
  },
  cardAddress: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginTop: -4,
    paddingHorizontal: Spacing.xs,
  },
  cardDetailBtn: {
    height: 44,
    marginTop: Spacing.xs,
  },
  emptyCardState: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  emptyCardText: {
    color: Colors.Gray500,
    fontSize: Typography.size.sm,
  },

  // ── Loading overlay ──────────────────────────────────────────────
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.card,
  },
  loadingText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray600,
  },

  // ── Error banner ─────────────────────────────────────────────────
  errorBanner: {
    position: 'absolute',
    bottom: '43%',
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.ErrorLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.ErrorBorder,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 15,
    ...Shadows.card,
  },
  errorBannerText: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.Error,
    fontWeight: Typography.weight.medium,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.Error,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.White,
  },

  // ── Volver a lista ────────────────────────────────────────────────
  backToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.WineLight,
    marginBottom: Spacing.xs,
  },
  backToListText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },

  // ── BottomSheet Lista de Propiedades ─────────────────────────────
  sheetListWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  listHeaderContainer: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
    marginBottom: Spacing.xs,
  },
  listHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeaderTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  listCountPill: {
    backgroundColor: Colors.WineLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  listCountPillText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  listHeaderSubtitle: {
    fontSize: Typography.size.xs - 1,
    color: Colors.Gray500,
    marginTop: 2,
  },
  flatListContent: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    paddingBottom: 40,
  },
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  horizontalCardImage: {
    width: 84,
    height: 84,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray100,
  },
  horizontalCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  horizontalCardBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalDistanceText: {
    fontSize: Typography.size.xs - 1,
    color: Colors.Gray500,
  },
  horizontalCardTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginVertical: 2,
  },
  horizontalCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalCardPrice: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.extrabold,
    color: Colors.WinePrimary,
  },
  horizontalCardPeriod: {
    fontSize: Typography.size.xs - 2,
    fontWeight: Typography.weight.regular,
    color: Colors.Gray500,
  },
});

