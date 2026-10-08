import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageSquare,
  MessageCircle,
  User,
  ShieldCheck,
  Building2,
  ChevronRight,
  Search,
  Megaphone,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { getConversations, ChatConversation } from '../../services/api';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import { useAuth } from '../../context/AuthContext';

interface MessagesScreenProps {
  navigation?: any;
}

function formatChatTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
}

function ConversationSkeleton() {
  return (
    <View style={styles.conversationItem}>
      <Skeleton.Circle size={52} />
      <View style={{ flex: 1, marginLeft: Spacing.md, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton height={16} width="45%" />
          <Skeleton height={12} width={40} />
        </View>
        <Skeleton height={14} width="80%" />
      </View>
    </View>
  );
}

export function MessagesScreen({ navigation }: MessagesScreenProps) {
  const { fetchUnreadCount } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [unreadComunicados, setUnreadComunicados] = useState(0);
  const [latestComunicadoId, setLatestComunicadoId] = useState<number>(0);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data || []);
      fetchUnreadCount();
    } catch (err) {
      console.warn('[MessagesScreen] Error cargando conversaciones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Badge de comunicados no leídos ──────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const checkUnreadComunicados = async () => {
        try {
          const response = await api.get('/comunicados/mis-comunicados');
          const comunicados = response.data?.data;

          if (comunicados && comunicados.length > 0) {
            const newest: number = comunicados[0].id_comunicado;
            setLatestComunicadoId(newest);

            const lastReadIdStr = await AsyncStorage.getItem('last_read_comunicado_id');
            const lastReadId = lastReadIdStr ? parseInt(lastReadIdStr, 10) : 0;

            const unreadCount = comunicados.filter(
              (c: any) => c.id_comunicado > lastReadId
            ).length;
            setUnreadComunicados(unreadCount);
          }
        } catch (error) {
          console.error('[MessagesScreen] Error verificando comunicados:', error);
        }
      };
      checkUnreadComunicados();
    }, [])
  );

  const handleOpenComunicados = useCallback(async () => {
    if (latestComunicadoId > 0) {
      await AsyncStorage.setItem('last_read_comunicado_id', latestComunicadoId.toString());
    }
    setUnreadComunicados(0);
    navigation?.navigate?.('Avisos' as any);
  }, [latestComunicadoId, navigation]);

  // Recargar al regresar a la pantalla
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchConversations();
      fetchUnreadCount();
    });
    return unsubscribe;
  }, [navigation, fetchConversations, fetchUnreadCount]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleOpenChat = (conversation: ChatConversation) => {
    const otherUser = conversation.otro_usuario;
    navigation?.navigate?.('ChatRoom', {
      userId: otherUser.id_usuario,
      userName: otherUser.nombres,
      userPhoto: otherUser.foto_perfil_url,
      userRole: otherUser.rol,
      propertyTitle: conversation.ultimo_mensaje?.inmueble?.titulo,
    });
  };

  const renderConversationItem = ({ item }: { item: ChatConversation }) => {
    const user = item.otro_usuario;
    const lastMsg = item.ultimo_mensaje;
    const timeFormatted = formatChatTime(lastMsg?.fecha || lastMsg?.created_at);
    const unread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, unread && styles.conversationItemUnread]}
        activeOpacity={0.78}
        onPress={() => handleOpenChat(item)}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {user.foto_perfil_url ? (
            <Image source={{ uri: user.foto_perfil_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{getInitials(user.nombres)}</Text>
            </View>
          )}
          {user.documento_verificado && (
            <View style={styles.verifiedDot}>
              <ShieldCheck size={10} color={Colors.White} strokeWidth={3} />
            </View>
          )}
        </View>

        {/* Contenido Central */}
        <View style={styles.contentWrapper}>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text style={[styles.userName, unread && styles.userNameUnread]} numberOfLines={1}>
                {user.nombres}
              </Text>
              {user.rol && (
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>
                    {user.rol === 'arrendador' ? 'Arrendador' : 'Estudiante'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.timeText, unread && styles.timeTextUnread]}>
              {timeFormatted}
            </Text>
          </View>

          {/* Inmueble de contexto si existe */}
          {lastMsg?.inmueble?.titulo && (
            <View style={styles.propertyContext}>
              <Building2 size={11} color={Colors.WinePrimary} />
              <Text style={styles.propertyContextText} numberOfLines={1}>
                {lastMsg.inmueble.titulo}
              </Text>
            </View>
          )}

          {/* Último mensaje y badge de no leídos */}
          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMessageText, unread && styles.lastMessageTextUnread]}
              numberOfLines={1}
            >
              {lastMsg?.contenido || 'Sin mensajes aún'}
            </Text>

            {unread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unread_count > 9 ? '9+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.headerSubtitle}>Mensajería Instantánea</Text>
        <Text style={styles.headerTitle}>Mensajes</Text>
      </View>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFF1F2',
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          marginTop: Spacing.sm,
          borderWidth: 1,
          borderColor: '#FECDD3',
        }}
        onPress={handleOpenComunicados}
        activeOpacity={0.7}
      >
        {/* Ícono del megáfono con badge de no leídos */}
        <View style={{ position: 'relative', marginRight: Spacing.md }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.WinePrimary, justifyContent: 'center', alignItems: 'center' }}>
            <Megaphone size={20} color="#FFF" />
          </View>
          {unreadComunicados > 0 && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#FF0000',
              borderRadius: 12,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#FFF',
              paddingHorizontal: 4,
            }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                {unreadComunicados > 99 ? '99+' : unreadComunicados}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.Gray900 }}>
            Comunicados Oficiales
          </Text>
          <Text style={{ fontSize: Typography.size.sm, color: Colors.Gray600, marginTop: 2 }}>
            Soporte ULEAM Rental
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.Gray400} />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon={MessageSquare}
        title="Sin conversaciones activas"
        description="Cuando te comuniques con un arrendador o recibas consultas de estudiantes sobre tus alquileres, tus chats aparecerán aquí."
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.listContainer}>
            {renderHeader()}
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id_conversacion.toString()}
            renderItem={renderConversationItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContainer}
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    marginBottom: Spacing.xs,
  },
  headerTop: {
    marginBottom: Spacing.xs,
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
  listContainer: {
    paddingBottom: 120,
  },
  // Fila de Conversación
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.White,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
  },
  conversationItemUnread: {
    backgroundColor: '#FFFDFD',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.Gray200,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.Success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.White,
  },
  contentWrapper: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    marginRight: Spacing.sm,
  },
  userName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray900,
  },
  userNameUnread: {
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  roleTag: {
    backgroundColor: Colors.Gray100,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: Typography.weight.medium,
    color: Colors.Gray600,
  },
  timeText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray400,
    fontWeight: Typography.weight.medium,
  },
  timeTextUnread: {
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.bold,
  },
  propertyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  propertyContextText: {
    fontSize: 11,
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray500,
    flex: 1,
    marginRight: Spacing.sm,
  },
  lastMessageTextUnread: {
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray900,
  },
  unreadBadge: {
    backgroundColor: Colors.WinePrimary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: Colors.White,
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
});

export default MessagesScreen;
