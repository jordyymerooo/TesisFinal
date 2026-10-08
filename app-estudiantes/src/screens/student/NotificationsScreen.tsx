import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Info,
  Calendar,
  Sparkles,
  ShieldCheck,
  Megaphone,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import {
  getNotifications,
  markNotificationsRead,
  SystemNotification,
} from '../../services/api';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export function NotificationsScreen({ navigation }: { navigation?: any }) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unread || 0);
    } catch (error) {
      console.warn('[NotificationsScreen] Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, leido_en: n.leido_en || new Date().toISOString() }))
      );
      setUnreadCount(0);
      await markNotificationsRead();
    } catch (error) {
      console.warn('[NotificationsScreen] Error al marcar leídas:', error);
      fetchNotifications();
    }
  };

  const handleNotificationPress = async (item: SystemNotification) => {
    if (!item.leido_en) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notificacion === item.id_notificacion
            ? { ...n, leido_en: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationsRead(item.id_notificacion);
      } catch (error) {
        console.warn('[NotificationsScreen] Error al marcar leída:', error);
      }
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'oficial':
        return <Megaphone size={18} color={Colors.WinePrimary} />;
      case 'solicitud':
        return <Calendar size={18} color={Colors.WinePrimary} />;
      case 'verificacion':
        return <ShieldCheck size={18} color={Colors.Success} />;
      case 'sistema':
      default:
        return <Sparkles size={18} color={Colors.WinePrimary} />;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation?.goBack()}
        activeOpacity={0.8}
      >
        <ArrowLeft size={20} color={Colors.Gray800} />
      </TouchableOpacity>

      <View style={styles.headerTitleCol}>
        <Text style={styles.headerSubtitle}>Centro de Mensajes</Text>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={handleMarkAllRead}
          activeOpacity={0.8}
        >
          <CheckCheck size={16} color={Colors.WinePrimary} />
          <Text style={styles.markAllText}>Leídas</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.notificationCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={42} height={42} borderRadius={21} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="70%" height={16} borderRadius={BorderRadius.xs} />
          <Skeleton width="95%" height={14} borderRadius={BorderRadius.xs} />
          <Skeleton width="40%" height={12} borderRadius={BorderRadius.xs} />
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: SystemNotification }) => {
    const isUnread = !item.leido_en;
    const isOficial = item.tipo === 'oficial' || item.datos?.oficial;
    const remitente = isOficial ? 'Soporte ULEAM Rental' : 'Aviso del Sistema';
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString('es-EC', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Reciente';

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isOficial ? styles.notificationCardOficial : styles.notificationCardSistema,
          isUnread && styles.notificationCardUnread,
        ]}
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconCircle, isOficial && styles.iconCircleOficial]}>
          {getNotificationIcon(item.tipo)}
        </View>

        <View style={styles.cardContent}>
          {/* Fila del Remitente Oficial */}
          <View style={styles.senderRow}>
            <View style={[styles.senderBadge, isOficial ? styles.senderBadgeOficial : styles.senderBadgeSistema]}>
              {isOficial ? (
                <Megaphone size={10} color={Colors.WinePrimary} />
              ) : (
                <Sparkles size={10} color={Colors.Gray600} />
              )}
              <Text style={[styles.senderText, isOficial ? styles.senderTextOficial : styles.senderTextSistema]}>
                {remitente}
              </Text>
            </View>
            <Text style={styles.cardDate}>{dateStr}</Text>
          </View>

          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} numberOfLines={2}>
              {item.titulo}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.cardMessage}>{item.mensaje}</Text>
        </View>
      </TouchableOpacity>
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
            data={notifications}
            keyExtractor={(item) =>
              item.id_notificacion?.toString() || Math.random().toString()
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <EmptyState
                icon={Bell}
                title="Sin notificaciones"
                description="Te avisaremos cuando haya actualizaciones sobre tus solicitudes de reserva o alojamientos favoritos."
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
  headerTitleCol: {
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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.WineLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  markAllText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  notificationCardUnread: {
    backgroundColor: '#FFFDFD',
    borderColor: Colors.WineBorder,
    borderLeftWidth: 4,
    borderLeftColor: Colors.WinePrimary,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.WinePrimary,
    marginLeft: Spacing.xs,
  },
  cardMessage: {
    fontSize: Typography.size.xs,
    color: Colors.Gray600,
    lineHeight: 18,
    marginVertical: 4,
  },
  cardDate: {
    fontSize: Typography.size.xs - 2,
    color: Colors.Gray400,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  notificationCardOficial: {
    backgroundColor: '#FFF8F8',
    borderColor: '#FECACA',
    borderLeftWidth: 4,
    borderLeftColor: Colors.WinePrimary,
  },
  notificationCardSistema: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.Gray200,
  },
  iconCircleOficial: {
    backgroundColor: '#FEE2E2',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  senderBadgeOficial: {
    backgroundColor: '#FEE2E2',
  },
  senderBadgeSistema: {
    backgroundColor: Colors.Gray200,
  },
  senderText: {
    fontSize: 10,
    fontWeight: '700',
  },
  senderTextOficial: {
    color: Colors.WinePrimary,
  },
  senderTextSistema: {
    color: Colors.Gray700,
  },
});

export default NotificationsScreen;
