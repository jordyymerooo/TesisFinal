/**
 * ExploreScreen.tsx
 * Pantalla principal de exploración de alojamientos para estudiantes
 * con paginación infinita (Infinite Scroll) y FlatList optimizado.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Sparkles, Building2, AlertCircle, Map } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import { PropertyCard } from '../../../components/ui/PropertyCard';
import { getInmuebles } from '../../../services/api';

export interface ExploreScreenProps {
  navigation?: any;
  onSelectProperty?: (id: number) => void;
  onToggleView?: () => void;
}

export function ExploreScreen({ navigation, onSelectProperty, onToggleView }: ExploreScreenProps) {
  // ── Paso 1: Estados de Paginación ──
  const [inmuebles, setInmuebles] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // ── Paso 2: Función de carga unificada ──
  const fetchInmueblesData = async (pageNumber: number, isRefresh = false) => {
    if (loadingMore && !isRefresh) return;

    try {
      if (!isRefresh) setLoadingMore(true);
      const data = await getInmuebles(pageNumber);

      // data.data contiene el array real de inmuebles que manda Laravel
      const items = Array.isArray(data) ? data : (data.data ?? []);
      const currentPage = data.current_page ?? pageNumber;
      const lastPage = data.last_page ?? 1;

      if (data.total !== undefined) {
        setTotalCount(data.total);
      }

      if (pageNumber === 1 || isRefresh) {
        setInmuebles(items);
        setPage(1);
      } else {
        // Concatenamos los nuevos al final eliminando duplicados por ID
        setInmuebles((prev) => {
          const combined = [...prev, ...items];
          return combined.reduce((acc: any[], current: any) => {
            const currentId = current.id ?? current.id_inmueble;
            const exists = acc.find(
              (item: any) => (item.id ?? item.id_inmueble) === currentId
            );
            if (!exists) {
              return acc.concat([current]);
            }
            return acc;
          }, []);
        });
      }

      // Verificamos si hay más páginas según los metadatos de Laravel
      setHasMore(currentPage < lastPage);
    } catch (error) {
      console.error('[ExploreScreen] Error al cargar inmuebles paginados:', error);
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // ── Paso 3: Efecto Inicial y Función LoadMore ──
  useFocusEffect(
    useCallback(() => {
      fetchInmueblesData(1);
    }, [])
  );

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInmueblesData(nextPage);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    fetchInmueblesData(1, true);
  }, []);

  const handlePropertyPress = (item: any) => {
    const id = item.id ?? item.id_inmueble;
    if (onSelectProperty) {
      onSelectProperty(id);
    } else if (navigation?.navigate) {
      navigation.navigate('PropertyDetail', { id });
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.badgeContainer}>
          <Sparkles size={14} color={Colors.WinePrimary} />
          <Text style={styles.badgeText}>ULEAM Rental</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {totalCount > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{totalCount} disponibles</Text>
            </View>
          )}
          {onToggleView && (
            <TouchableOpacity
              style={styles.toggleMapBtn}
              onPress={onToggleView}
              activeOpacity={0.8}
            >
              <Map size={14} color={Colors.WinePrimary} style={{ marginRight: 4 }} />
              <Text style={styles.toggleMapText}>Ver Mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.title}>Explorar Alojamientos</Text>
      <Text style={styles.subtitle}>
        Habitaciones y departamentos verificados cerca del campus universitario
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loadingMore && page === 1) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.WinePrimary} />
          <Text style={styles.emptyText}>Cargando alojamientos...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Building2 size={48} color={Colors.Gray400} />
        <Text style={styles.emptyTitle}>No hay alojamientos disponibles</Text>
        <Text style={styles.emptyText}>
          Desliza hacia abajo para actualizar la lista.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Paso 4: FlatList con Infinite Scroll ── */}
      <FlatList
        data={inmuebles}
        keyExtractor={(item, index) => `${item.id ?? item.id_inmueble ?? 'item'}-${index}`}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={handlePropertyPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Lógica de Paginación
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Dispara la carga cuando falte el 50% de la lista para llegar al final
        ListFooterComponent={
          loadingMore && page > 1 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#8C1515" style={{ marginVertical: 20 }} />
              <Text style={styles.loadingMoreText}>Cargando más alojamientos...</Text>
            </View>
          ) : hasMore && inmuebles.length > 0 ? (
            <View style={{ height: 40 }} />
          ) : inmuebles.length > 0 ? (
            <View style={styles.endOfListContainer}>
              <Text style={styles.endOfListText}>Has visto todos los alojamientos disponibles</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.WinePrimary]}
            tintColor={Colors.WinePrimary}
          />
        }
      />
    </SafeAreaView>
  );
}

export const HomeScreen = ExploreScreen;
export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: Spacing.base,
    marginBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.WineLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.WinePrimary,
  },
  countPill: {
    backgroundColor: Colors.Gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.Gray600,
  },
  toggleMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WineLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.WineBorder,
  },
  toggleMapText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.WinePrimary,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.black,
    color: Colors.Gray900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    marginTop: 4,
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  loadingMoreText: {
    fontSize: 12,
    color: Colors.Gray500,
    fontWeight: '500',
  },
  endOfListContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  endOfListText: {
    fontSize: 12,
    color: Colors.Gray400,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.Gray800,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.Gray500,
    marginTop: 4,
    textAlign: 'center',
  },
});
