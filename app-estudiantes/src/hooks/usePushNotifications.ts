/**
 * usePushNotifications.ts
 *
 * Hook centralizado para gestionar notificaciones push con Expo.
 * - Solicita permisos al dispositivo
 * - Obtiene el ExpoPushToken y lo registra en el backend
 * - Escucha notificaciones en primer plano (foreground)
 * - Escucha interacciones del usuario con la notificación (tap → navegación)
 *
 * Uso en AppNavigator (o _layout raíz):
 *   const { expoPushToken } = usePushNotifications(navigationRef);
 */

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { registerExpoPushToken } from '../../services/api';
import { getAuthToken } from '../../services/api';

/*
// ── Comportamiento de notificaciones en primer plano ───────────────────────
if (Constants.appOwnership !== 'expo') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
*/

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface PushNotificationData {
  screen?: string;
  userId?: number;
  userName?: string;
  inmuebleId?: number;
  [key: string]: any;
}

export interface UsePushNotificationsResult {
  expoPushToken: string | null;
  lastNotification: Notifications.Notification | null;
}

// ── Registrar canal de Android ─────────────────────────────────────────────
async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('mensajes', {
      name: 'Mensajes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8C1515',
      sound: 'default',
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#8C1515',
      sound: 'default',
    });
  }
}

// ── Solicitar permisos y obtener token ────────────────────────────────────
async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[PushNotifications] Las notificaciones push requieren un dispositivo físico.');
    return null;
  }

  if (Constants.appOwnership === 'expo') {
    console.log('Registro de notificaciones remotas omitido en Expo Go.');
    return null;
  }

  await setupAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PushNotifications] Permisos de notificaciones no concedidos.');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return tokenData.data;
  } catch (err) {
    console.warn('[PushNotifications] Error obteniendo token:', err);
    return null;
  }
}

// ── Hook Principal ─────────────────────────────────────────────────────────
export function usePushNotifications(
  navigationRef?: React.MutableRefObject<any>
): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Solo registrar si el usuario está autenticado
    const token = getAuthToken();
    if (!token) return;

    // Obtener y registrar el token del dispositivo
    registerForPushNotificationsAsync().then((pushToken) => {
      if (pushToken) {
        setExpoPushToken(pushToken);
        // Guardar en el backend (fire-and-forget)
        registerExpoPushToken(pushToken);
      }
    });

    // ── Listeners: Solo si no estamos en Expo Go ─────────────────────────
    /*
    if (Constants.appOwnership !== 'expo') {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          setLastNotification(notification);
          console.log('[PushNotifications] Notificación recibida:', notification.request.content.title);
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as PushNotificationData;
          console.log('[PushNotifications] Usuario abrió notificación:', data);

          if (navigationRef?.current) {
            if (data.screen === 'ChatRoom' && data.userId) {
              navigationRef.current.navigate('ChatRoom', {
                userId: data.userId,
                userName: data.userName ?? 'Usuario',
                inmuebleId: data.inmuebleId ?? undefined,
              });
            } else if (data.screen === 'Messages') {
              navigationRef.current.navigate('Messages');
            } else if (data.screen === 'Notificaciones') {
              navigationRef.current.navigate('Notificaciones');
            }
          }
        }
      );
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
    */
  }, []); // Solo se monta una vez

  return { expoPushToken, lastNotification };
}

export default usePushNotifications;
