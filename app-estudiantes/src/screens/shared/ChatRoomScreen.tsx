import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Building2,
  ShieldCheck,
  CheckCheck,
  Check,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import {
  getChatHistory,
  sendMessage,
  getCurrentUser,
  authService,
  ChatMessage,
  ChatUser,
} from '../../services/api';

interface ChatRoomScreenProps {
  route: {
    params: {
      userId: number;
      userName?: string;
      userPhoto?: string;
      userRole?: string;
      propertyTitle?: string;
      inmuebleId?: number;
    };
  };
  navigation: any;
}

function formatBubbleTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

export function ChatRoomScreen({ route, navigation }: ChatRoomScreenProps) {
  const { userId, userName, userPhoto, userRole, propertyTitle, inmuebleId } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    return getCurrentUser()?.id_usuario ?? null;
  });
  const [otherUserData, setOtherUserData] = useState<ChatUser | null>(null);
  const appState = useRef(AppState.currentState);

  // 1. Obtener usuario autenticado si no estaba en caché
  useEffect(() => {
    if (!currentUserId) {
      authService.getMe().then((u) => {
        if (u?.id_usuario) {
          setCurrentUserId(u.id_usuario);
        }
      }).catch(() => { });
    }
  }, [currentUserId]);

  // 2. Función de carga inicial del historial
  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);

    try {
      const data = await getChatHistory(userId);
      if (data) {
        setOtherUserData(data.otro_usuario);
        // Para FlatList inverted={true}, invertimos para que el último esté al inicio del arreglo
        const reversed = [...(data.mensajes || [])].reverse();
        setMessages(reversed);
      }
    } catch (err: any) {
      console.warn('[ChatRoomScreen] Error cargando historial:', err.message || err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [userId]);

  // 3. Smart Polling optimizado con AppState (cada 5s en primer plano, pausado en segundo plano)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // 1. Cargar mensajes iniciales (con spinner si es primera carga)
    fetchHistory(false);

    // 2. Iniciar el sondeo periódico cada 5 segundos de forma silenciosa
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        fetchHistory(true);
      }, 5000);
    };

    // 3. Detener el sondeo
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();

    // 4. Pausar peticiones si la app se minimiza para ahorrar batería y red
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        fetchHistory(true);
        startPolling();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopPolling();
      }
      appState.current = nextAppState;
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [userId, fetchHistory]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setInputText('');
    setSending(true);

    // Actualización optimista inmediata
    const tempId = Date.now();
    const optimisticMsg: ChatMessage = {
      id_mensaje: tempId,
      id_remitente: currentUserId || 0,
      id_destinatario: userId,
      id_inmueble: inmuebleId ?? null,
      contenido: trimmed,
      leido: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      const sent = await sendMessage(userId, trimmed, inmuebleId);
      if (sent) {
        setMessages((prev) =>
          prev.map((m) => (m.id_mensaje === tempId ? sent : m))
        );
      }
    } catch (err) {
      console.warn('[ChatRoomScreen] Error enviando mensaje:', err);
    } finally {
      setSending(false);
    }
  };

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isMine = currentUserId ? item.id_remitente === currentUserId : false;
    const time = formatBubbleTime(item.created_at || item.fecha);

    return (
      <View
        style={[
          styles.bubbleRow,
          isMine ? styles.bubbleRowRight : styles.bubbleRowLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
            {item.contenido}
          </Text>

          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMine ? styles.bubbleTimeMine : styles.bubbleTimeOther]}>
              {time}
            </Text>
            {isMine && (
              item.leido ? (
                <CheckCheck size={13} color="rgba(255, 255, 255, 0.9)" />
              ) : (
                <Check size={13} color="rgba(255, 255, 255, 0.6)" />
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  const displayName = otherUserData?.nombres || userName || 'Usuario';
  const displayPhoto = otherUserData?.foto_perfil_url || userPhoto;
  const displayRole = otherUserData?.rol || userRole;
  const isVerified = otherUserData?.documento_verificado;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      {/* Header Superior del Chat */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.Gray800} />
        </TouchableOpacity>

        {/* Avatar del otro usuario */}
        <View style={styles.headerAvatarContainer}>
          {displayPhoto ? (
            <Image source={{ uri: displayPhoto }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarText}>{getInitials(displayName)}</Text>
            </View>
          )}
          {isVerified && (
            <View style={styles.headerVerifiedDot}>
              <ShieldCheck size={10} color={Colors.White} strokeWidth={3} />
            </View>
          )}
        </View>

        {/* Info del usuario y contexto */}
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            {displayRole && (
              <View style={styles.headerRoleBadge}>
                <Text style={styles.headerRoleBadgeText}>
                  {displayRole === 'arrendador' ? 'Arrendador' : 'Estudiante'}
                </Text>
              </View>
            )}
          </View>

          {propertyTitle ? (
            <View style={styles.headerPropertyContext}>
              <Building2 size={11} color={Colors.WinePrimary} />
              <Text style={styles.headerPropertyContextText} numberOfLines={1}>
                {propertyTitle}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerStatusOnline}>En línea</Text>
          )}
        </View>
      </View>

      {/* Cuerpo del Chat con KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={Colors.WinePrimary} />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id_mensaje.toString()}
            renderItem={renderBubble}
            inverted={true}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <Text style={styles.emptyMessagesTitle}>Inicia la conversación</Text>
                <Text style={styles.emptyMessagesSubtitle}>
                  Escribe un mensaje para consultar sobre disponibilidad, visitas o detalles del alquiler.
                </Text>
              </View>
            }
          />
        )}

        {/* Barra Inferior de Entrada */}
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={Colors.Gray400}
              value={inputText}
              onChangeText={setInputText}
              multiline={true}
              maxLength={2000}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.White} />
              ) : (
                <Send size={18} color={Colors.White} strokeWidth={2.4} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.White,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    ...Shadows.soft,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: Spacing.sm + 2,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.Gray200,
  },
  headerAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  headerVerifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.Success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.White,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  headerRoleBadge: {
    backgroundColor: Colors.Gray100,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  headerRoleBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weight.medium,
    color: Colors.Gray600,
  },
  headerPropertyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  headerPropertyContextText: {
    fontSize: 11,
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.medium,
  },
  headerStatusOnline: {
    fontSize: 11,
    color: Colors.Success,
    fontWeight: Typography.weight.medium,
    marginTop: 1,
  },
  // Mensajes y Burbujas
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
  },
  messagesList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  bubbleRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.WinePrimary,
    borderBottomRightRadius: 3,
  },
  bubbleOther: {
    backgroundColor: Colors.White,
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  bubbleText: {
    fontSize: Typography.size.sm + 1,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: Colors.White,
  },
  bubbleTextOther: {
    color: Colors.Gray900,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 3,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeMine: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bubbleTimeOther: {
    color: Colors.Gray400,
  },
  // Empty Messages
  emptyMessagesContainer: {
    transform: [{ scaleY: -1 }], // Compensa el inverted={true}
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessagesTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray700,
    marginBottom: Spacing.xs,
  },
  emptyMessagesSubtitle: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Barra Inferior
  inputSafeArea: {
    backgroundColor: Colors.White,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.Gray100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm + 2 : Spacing.sm,
    fontSize: Typography.size.sm + 1,
    color: Colors.Gray900,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.WinePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.primary,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.Gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatRoomScreen;