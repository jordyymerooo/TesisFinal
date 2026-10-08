import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MapPin,
  Star,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { getFavorites, toggleFavorite } from '../../services/api';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

export function FavoritesScreen({ navigation }: { navigation?: any }) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.warn('[FavoritesScreen] Error cargando favoritos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();

    // Recargar cuando la pantalla reciba foco
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (item: any) => {
    const id = item.id_inmueble;
    try {
      // Optimistic update: remover de la lista
      setFavorites((prev) => prev.filter((fav) => fav.id_inmueble !== id));
      await toggleFavorite(id);
    } catch (error) {
      console.warn('[FavoritesScreen] Error al alternar favorito:', error);
      // Revertir en caso de error
      fetchFavorites();
    }
  };

  const handleCardPress = (item: any) => {
    if (navigation?.navigate) {
      navigation.navigate('PropertyDetail', { id: item.id_inmueble });
    }
  };

  const renderSkeletonCard = () => (
    <View style={styles.card}>
      <Skeleton width="100%" height={160} borderRadius={BorderRadius.lg} />
      <View style={styles.cardBody}>
        <Skeleton width="70%" height={18} borderRadius={BorderRadius.xs} />
        <Skeleton width="50%" height={14} borderRadius={BorderRadius.xs} style={{ marginVertical: 6 }} />
        <View style={styles.cardFooter}>
          <Skeleton width="30%" height={22} borderRadius={BorderRadius.xs} />
          <Skeleton width="25%" height={20} borderRadius={BorderRadius.pill} />
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={styles.titleRow}>
          <Text style={styles.headerSubtitle}>Alojamientos Guardados</Text>
          <Sparkles size={16} color={Colors.WinePrimary} />
        </View>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const foto =
      item.fotografias?.[0]?.url ??
      item.portada_url ??
      FALLBACK_IMAGE;

    const direccion =
      item.ubicacion?.direccion_referencial ||
      item.ubicacion?.sector ||
      'Cerca del campus ULEAM';


    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleCardPress(item)}
      >
        {/* Portada */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: foto }} style={styles.propertyImage} resizeMode="cover" />
          
          {/* Badge de tipo */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {(item.tipo || 'Alojamiento').replace('_', ' ')}
            </Text>
          </View>

          {/* Botón de corazón para desmarcar */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleToggleFavorite(item)}
            activeOpacity={0.8}
            accessibilityLabel="Eliminar de favoritos"
          >
            <Heart size={20} color={Colors.WinePrimary} fill={Colors.WinePrimary} />
          </TouchableOpacity>
        </View>

        {/* Cuerpo de la tarjeta */}
        <View style={styles.cardBody}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {item.titulo}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={13} color={Colors.Gray500} style={{ marginRight: 4 }} />
            <Text style={styles.locationText} numberOfLines={1}>
              {direccion}
            </Text>
          </View>

            <View style={styles.cardFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>${formatPrice(item.precio_mensual ?? item.precio)}</Text>
                <Text style={styles.pricePeriod}> / mes</Text>
              </View>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.listContent}>
            {renderHeader()}
            {renderSkeletonCard()}
            {renderSkeletonCard()}
            {renderSkeletonCard()}
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id_inmueble.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                icon={Heart}
                title="Aún no tienes favoritos"
                description="Toca el ícono de corazón en los alojamientos que más te gusten"
                actionText="Explorar Alojamientos"
                onAction={() => navigation?.navigate?.('Explorar')}
              />
            }
            contentContainerStyle={styles.listContent}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  listContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    backgroundColor: Colors.White,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    marginBottom: Spacing.base,
  },
  headerTop: {
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  },
  card: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
    backgroundColor: Colors.Gray100,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    ...Shadows.soft,
  },
  typeBadgeText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
    textTransform: 'capitalize',
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  cardBody: {
    padding: Spacing.md,
  },
  propertyTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    paddingTop: Spacing.sm,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.WinePrimary,
  },
  pricePeriod: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
  },
});

export default FavoritesScreen;
