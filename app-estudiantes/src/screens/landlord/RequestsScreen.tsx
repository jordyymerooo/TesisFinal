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
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  User,
  GraduationCap,
  Building2,
  Calendar,
  MessageSquare,
  ChevronRight,
  Check,
  X,
  Phone,
  Mail,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import {
  getLandlordRequests,
  updateLandlordRequestStatus,
  LandlordRequest,
} from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

type RequestTab = 'pendiente' | 'aceptada' | 'rechazada';

interface TabItem {
  key: RequestTab;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aceptada', label: 'Aceptadas' },
  { key: 'rechazada', label: 'Rechazadas' },
];

function RequestCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton.Circle size={48} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton height={16} width="55%" />
            <Skeleton height={12} width={50} />
          </View>
          <Skeleton height={12} width="40%" />
        </View>
      </View>

      <View style={[styles.propertySnippet, { backgroundColor: Colors.Gray50 }]}>
        <Skeleton height={44} width={44} borderRadius={BorderRadius.md} />
        <View style={{ flex: 1, gap: 4 }}>
          <Skeleton height={10} width={80} />
          <Skeleton height={14} width="70%" />
          <Skeleton height={12} width={60} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <Skeleton height={38} width="48%" borderRadius={BorderRadius.pill} />
        <Skeleton height={38} width="48%" borderRadius={BorderRadius.pill} />
      </View>
    </View>
  );
}

interface RequestsScreenProps {
  navigation?: any;
}

// Formateador de tiempo relativo amigable (ej: "Hace 2h", "Hace 3 días")
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Reciente';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  } catch {
    return 'Reciente';
  }
}

// Extraer carrera/año si está disponible en perfil o en el mensaje inicial
function resolveCareerYear(req: LandlordRequest): string {
  if (req.estudiante?.perfil?.carrera) {
    return req.estudiante.perfil.carrera;
  }
  const msg = req.mensaje_inicial || '';
  if (msg.includes('Software')) return 'Ing. en Software • 6to Semestre';
  if (msg.includes('Medicina')) return 'Medicina • 4to Año';
  if (msg.includes('Arquitectura')) return 'Arquitectura • 5to Semestre';
  if (msg.includes('Administración')) return 'Administración • 3er Semestre';
  return 'Estudiante ULEAM • Verificado';
}

export function RequestsScreen({ navigation }: RequestsScreenProps) {
  const [requests, setRequests] = useState<LandlordRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<RequestTab>('pendiente');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getLandlordRequests();
      setRequests(data || []);
    } catch (err) {
      console.warn('[RequestsScreen] Error al obtener solicitudes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  // Filtrado por pestaña
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => (r.estado || 'pendiente').toLowerCase() === activeTab);
  }, [requests, activeTab]);

  // Contadores por estado
  const counts = useMemo(() => {
    return {
      pendiente: requests.filter((r) => (r.estado || 'pendiente').toLowerCase() === 'pendiente').length,
      aceptada: requests.filter((r) => (r.estado || '').toLowerCase() === 'aceptada').length,
      rechazada: requests.filter((r) => (r.estado || '').toLowerCase() === 'rechazada').length,
    };
  }, [requests]);

  const handleUpdateStatus = async (idSolicitud: number, nuevoEstado: 'aceptada' | 'rechazada') => {
    const actionLabel = nuevoEstado === 'aceptada' ? 'Aceptar' : 'Rechazar';
    Alert.alert(
      `${actionLabel} Solicitud`,
      `¿Confirmas que deseas ${actionLabel.toLowerCase()} la solicitud de reserva para este estudiante?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: actionLabel,
          style: nuevoEstado === 'rechazada' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessingId(idSolicitud);
            try {
              await updateLandlordRequestStatus(idSolicitud, nuevoEstado);
              // Actualizar estado local inmediatamente
              setRequests((prev) =>
                prev.map((r) =>
                  r.id_solicitud === idSolicitud ? { ...r, estado: nuevoEstado } : r
                )
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo actualizar la solicitud.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderRequestCard = ({ item }: { item: LandlordRequest }) => {
    const student = item.estudiante;
    const studentName = student?.nombres || 'Estudiante ULEAM';
    const avatarUrl = student?.perfil?.foto_perfil_url;
    const career = resolveCareerYear(item);
    const propertyTitle = item.inmueble?.titulo || 'Inmueble de alquiler';
    const propertyFoto =
      item.inmueble?.fotografias?.[0]?.url || null;
    const timeAgo = formatTimeAgo(item.created_at);
    const isProcessing = processingId === item.id_solicitud;

    return (
      <View style={styles.card}>
        {/* Encabezado: Avatar + Nombre + Carrera + Tiempo transcurrido */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <User size={22} color={Colors.WinePrimary} />
              </View>
            )}
            <View style={styles.verifiedDot} />
          </View>

          <View style={styles.studentInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {studentName}
              </Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>

            <View style={styles.careerRow}>
              <GraduationCap size={13} color={Colors.WinePrimary} />
              <Text style={styles.careerText} numberOfLines={1}>
                {career}
              </Text>
            </View>
          </View>
        </View>

        {/* Inmueble de interés */}
        <TouchableOpacity
          style={styles.propertySnippet}
          activeOpacity={0.8}
          onPress={() => {
            if (item.id_inmueble && navigation?.navigate) {
              navigation.navigate('PropertyDetail', { id: item.id_inmueble });
            }
          }}
        >
          {propertyFoto ? (
            <Image source={{ uri: propertyFoto }} style={styles.propertyThumb} />
          ) : (
            <View style={styles.propertyThumbPlaceholder}>
              <Building2 size={16} color={Colors.Gray500} />
            </View>
          )}

          <View style={styles.propertySnippetBody}>
            <Text style={styles.propertyInterestLabel}>Inmueble solicitado:</Text>
            <Text style={styles.propertyInterestTitle} numberOfLines={1}>
              {propertyTitle}
            </Text>
            {item.inmueble?.precio ? (
              <Text style={styles.propertyInterestPrice}>
                ${item.inmueble.precio}/mes
              </Text>
            ) : null}
          </View>

          <ChevronRight size={16} color={Colors.Gray400} />
        </TouchableOpacity>

        {/* Mensaje o comentario del estudiante */}
        {item.mensaje_inicial ? (
          <View style={styles.messageBox}>
            <MessageSquare size={14} color={Colors.Gray500} style={{ marginTop: 2 }} />
            <Text style={styles.messageText} numberOfLines={3}>
              "{item.mensaje_inicial}"
            </Text>
          </View>
        ) : null}

        {/* Acciones para solicitudes pendientes */}
        {item.estado === 'pendiente' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus(item.id_solicitud, 'rechazada')}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <X size={16} color={Colors.Error} strokeWidth={2.4} />
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleUpdateStatus(item.id_solicitud, 'aceptada')}
              disabled={isProcessing}
              activeOpacity={0.85}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.White} />
              ) : (
                <>
                  <Check size={16} color={Colors.White} strokeWidth={2.4} />
                  <Text style={styles.acceptBtnText}>Aceptar Reserva</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Estado para Aceptadas o Rechazadas */}
        {item.estado === 'aceptada' && (
          <View style={[styles.statusBanner, styles.statusBannerAccepted]}>
            <CheckCircle2 size={15} color="#059669" />
            <Text style={styles.statusBannerTextAccepted}>
              Solicitud aceptada · Contacta al estudiante para concretar la firma
            </Text>
          </View>
        )}

        {item.estado === 'rechazada' && (
          <View style={[styles.statusBanner, styles.statusBannerRejected]}>
            <XCircle size={15} color="#DC2626" />
            <Text style={styles.statusBannerTextRejected}>
              Solicitud rechazada
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.headerSubtitle}>Gestión de Alquileres</Text>
        <Text style={styles.headerTitle}>Solicitudes de Reserva</Text>
      </View>

      {/* Tabs */}
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
  );

  const renderEmpty = () => {
    if (loading) return null;

    if (activeTab === 'pendiente') {
      return (
        <EmptyState
          icon={Inbox}
          title="No hay solicitudes pendientes"
          description="Cuando un estudiante universitario solicite reservar uno de tus alojamientos, podrás revisarlo y aceptarlo aquí."
        />
      );
    }

    if (activeTab === 'aceptada') {
      return (
        <EmptyState
          icon={CheckCircle2}
          title="Sin solicitudes aceptadas"
          description="Aquí aparecerán los estudiantes que hayas admitido para coordinar el contrato y la entrega de llaves."
        />
      );
    }

    return (
      <EmptyState
        icon={XCircle}
        title="Sin solicitudes rechazadas"
        description="No tienes solicitudes declinadas o canceladas en tu historial."
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      {loading && !refreshing ? (
        <View style={styles.listContent}>
          {renderHeader()}
          <RequestCardSkeleton />
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id_solicitud.toString()}
          renderItem={renderRequestCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
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
    backgroundColor: Colors.LightBG,
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
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
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
  // Card de Solicitud
  card: {
    backgroundColor: Colors.White,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.Gray100,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.Success,
    borderWidth: 2,
    borderColor: Colors.White,
  },
  studentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  studentName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeAgo: {
    fontSize: Typography.size.xs,
    color: Colors.Gray400,
    fontWeight: Typography.weight.medium,
  },
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  careerText: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray600,
    fontWeight: Typography.weight.medium,
  },
  // Inmueble Solicitado
  propertySnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    marginBottom: Spacing.sm + 2,
  },
  propertyThumb: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray200,
  },
  propertyThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertySnippetBody: {
    flex: 1,
  },
  propertyInterestLabel: {
    fontSize: 10,
    color: Colors.Gray400,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.bold,
  },
  propertyInterestTitle: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
    marginTop: 1,
  },
  propertyInterestPrice: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
    marginTop: 1,
  },
  // Mensaje
  messageBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.WinePrimary,
  },
  messageText: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray700,
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
  // Botones de acción
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.pill,
  },
  rejectBtn: {
    backgroundColor: Colors.White,
    borderWidth: 1.5,
    borderColor: Colors.ErrorBorder,
  },
  rejectBtnText: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Error,
  },
  acceptBtn: {
    backgroundColor: Colors.WinePrimary,
    ...Shadows.primary,
  },
  acceptBtnText: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.White,
  },
  // Banners de estado final
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginTop: Spacing.xs,
  },
  statusBannerAccepted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  statusBannerTextAccepted: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: '#065F46',
    flex: 1,
  },
  statusBannerRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  statusBannerTextRejected: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: '#991B1B',
  },
  // Empty
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
  },
});
