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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MessageCircle,
  ChevronRight,
  Inbox,
  User,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { getStudentRequests } from '../../services/api';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';

export function StudentRequestsScreen({ navigation }: { navigation?: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRequests = async () => {
    try {
      const data = await getStudentRequests();
      setRequests(data || []);
    } catch (error) {
      console.warn('[StudentRequestsScreen] Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, []);

  const getStatusBadge = (estado: string) => {
    const st = (estado || '').toLowerCase();
    if (st === 'aceptada') {
      return {
        label: 'Aceptada',
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        icon: CheckCircle2,
      };
    }
    if (st === 'rechazada') {
      return {
        label: 'Rechazada',
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        icon: XCircle,
      };
    }
    return {
      label: 'Pendiente',
      bg: '#FFFBEB',
      color: '#D97706',
      border: '#FDE68A',
      icon: Clock,
    };
  };

  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Skeleton width={70} height={70} borderRadius={BorderRadius.md} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="80%" height={16} borderRadius={BorderRadius.xs} />
          <Skeleton width="40%" height={14} borderRadius={BorderRadius.xs} />
          <Skeleton width="60%" height={12} borderRadius={BorderRadius.xs} />
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation?.goBack()}
        activeOpacity={0.8}
      >
        <ArrowLeft size={20} color={Colors.Gray800} />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerSubtitle}>Historial de Reservas</Text>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const inmueble = item.inmueble;
    const foto =
      inmueble?.fotografias?.[0]?.url ||
      FALLBACK_PHOTO;

    const badge = getStatusBadge(item.estado);
    const BadgeIcon = badge.icon;
    const arrendador = inmueble?.arrendador;

    const fechaStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('es-EC', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Reciente';

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Image source={{ uri: foto }} style={styles.cardImage} resizeMode="cover" />

          <View style={styles.cardInfo}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: badge.bg, borderColor: badge.border },
                ]}
              >
                <BadgeIcon size={12} color={badge.color} strokeWidth={2.4} />
                <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
              </View>
              <Text style={styles.dateText}>{fechaStr}</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={1}>
              {inmueble?.titulo || 'Inmueble de alquiler'}
            </Text>

            <Text style={styles.cardPrice}>
              ${formatPrice(inmueble?.precio_mensual ?? inmueble?.precio ?? 0)}
              <Text style={styles.cardPricePeriod}> / mes</Text>
            </Text>

            {arrendador && (
              <View style={styles.landlordRow}>
                <User size={12} color={Colors.Gray500} style={{ marginRight: 4 }} />
                <Text style={styles.landlordName} numberOfLines={1}>
                  {arrendador.nombres}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => {
              if (item.id_inmueble && navigation?.navigate) {
                navigation.navigate('PropertyDetail', { id: item.id_inmueble });
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.detailBtnText}>Ver Inmueble</Text>
            <ChevronRight size={14} color={Colors.WinePrimary} />
          </TouchableOpacity>

          {badge.label === 'Aceptada' && arrendador && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => {
                if (arrendador.id_usuario && navigation?.navigate) {
                  navigation.navigate('ChatRoom', {
                    userId: arrendador.id_usuario,
                    userName: arrendador.nombres,
                    userPhoto: arrendador.perfil?.foto_perfil_url,
                    userRole: 'Arrendador',
                    propertyTitle: inmueble?.titulo,
                    inmuebleId: item.id_inmueble,
                  });
                }
              }}
              activeOpacity={0.85}
            >
              <MessageCircle size={14} color={Colors.White} />
              <Text style={styles.chatBtnText}>Chatear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      <View style={styles.container}>
        {renderHeader()}

        {loading && !refreshing ? (
          <View style={styles.listContent}>
            {renderSkeleton()}
            {renderSkeleton()}
            {renderSkeleton()}
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id_solicitud?.toString() || Math.random().toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <EmptyState
                icon={Inbox}
                title="Sin solicitudes realizadas"
                description="Explora los alojamientos disponibles y solicita tu reserva directamente a los arrendadores."
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
  headerContainer: {
    backgroundColor: Colors.White,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.Gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray100,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
  },
  dateText: {
    fontSize: Typography.size.xs - 1,
    color: Colors.Gray500,
  },
  cardTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.extrabold,
    color: Colors.WinePrimary,
  },
  cardPricePeriod: {
    fontSize: Typography.size.xs - 2,
    fontWeight: Typography.weight.regular,
    color: Colors.Gray500,
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landlordName: {
    fontSize: Typography.size.xs - 1,
    color: Colors.Gray600,
    fontWeight: Typography.weight.medium,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.WinePrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  chatBtnText: {
    color: Colors.White,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
});

export default StudentRequestsScreen;
