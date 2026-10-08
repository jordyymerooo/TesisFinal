import React, { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';

// 1. Importar librerías de notificaciones
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/*
// 2. Configurar cómo se comportan las notificaciones cuando la app está en pantalla
if (Constants.appOwnership !== 'expo') {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}
*/

// 3. Función para pedir permisos y obtener el Token único del celular
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    if (Constants.appOwnership === 'expo') {
      console.log('Registro de notificaciones remotas omitido en Expo Go.');
      return;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('¡Permisos de notificación denegados!');
      return;
    }

    // Obtenemos el token usando el Project ID de tu app.json
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: "c5fc6a41-459f-4dfc-9fd5-59a7704f9d58"
    })).data;

    console.log("===========================================");
    console.log("TU EXPO PUSH TOKEN ES:", token);
    console.log("===========================================");
  } else {
    console.log('Debes usar un dispositivo físico para las notificaciones Push');
  }

  return token;
}

export default function App() {

  // 4. Ejecutar la función apenas la app se inicia
  useEffect(() => {
    /*
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log("Token listo para usarse:", token);
      }
    });
    */
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
