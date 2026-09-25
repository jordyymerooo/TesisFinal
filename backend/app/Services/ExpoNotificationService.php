<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ExpoNotificationService
 *
 * Envía notificaciones push a través de la API de Expo Push Notifications.
 * Documentación oficial: https://docs.expo.dev/push-notifications/sending-notifications/
 */
class ExpoNotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Envía una notificación push a un dispositivo vía token de Expo.
     *
     * @param  string  $token   El ExpoPushToken del destinatario (ej: ExponentPushToken[xxxx])
     * @param  string  $title   Título visible de la notificación
     * @param  string  $body    Cuerpo del mensaje notificación
     * @param  array   $data    Payload oculto (para navegación en app: ['screen' => 'ChatRoom', 'userId' => 5])
     * @return bool
     */
    public static function send(string $token, string $title, string $body, array $data = []): bool
    {
        // Validar formato del token de Expo
        if (!str_starts_with($token, 'ExponentPushToken[') && !str_starts_with($token, 'ExpoPushToken[')) {
            Log::warning('[ExpoNotificationService] Token inválido: ' . $token);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(10)->post(self::EXPO_PUSH_URL, [
                'to'       => $token,
                'title'    => $title,
                'body'     => $body,
                'sound'    => 'default',
                'priority' => 'high',
                'data'     => $data,
            ]);

            if (!$response->successful()) {
                Log::warning('[ExpoNotificationService] Respuesta no exitosa de Expo', [
                    'status'  => $response->status(),
                    'body'    => $response->body(),
                    'token'   => $token,
                ]);
                return false;
            }

            $result = $response->json();
            // Verificar si Expo reportó un error en el payload
            if (isset($result['data']['status']) && $result['data']['status'] === 'error') {
                Log::warning('[ExpoNotificationService] Error de Expo en push', [
                    'message' => $result['data']['message'] ?? 'Error desconocido',
                    'token'   => $token,
                ]);
                return false;
            }

            return true;

        } catch (\Throwable $e) {
            Log::error('[ExpoNotificationService] Excepción al enviar push: ' . $e->getMessage(), [
                'token' => $token,
            ]);
            return false;
        }
    }

    /**
     * Envía notificaciones a múltiples tokens en un solo batch.
     * Expo acepta hasta 100 notificaciones por request.
     *
     * @param  array  $tokens  Lista de ExpoPushTokens
     * @param  string $title
     * @param  string $body
     * @param  array  $data
     * @return int Número de notificaciones enviadas exitosamente
     */
    public static function sendBatch(array $tokens, string $title, string $body, array $data = []): int
    {
        $validTokens = array_filter($tokens, function ($t) {
            return str_starts_with($t, 'ExponentPushToken[') || str_starts_with($t, 'ExpoPushToken[');
        });

        if (empty($validTokens)) {
            return 0;
        }

        $messages = array_map(fn ($token) => [
            'to'       => $token,
            'title'    => $title,
            'body'     => $body,
            'sound'    => 'default',
            'priority' => 'high',
            'data'     => $data,
        ], array_values($validTokens));

        try {
            $response = Http::withHeaders([
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(15)->post(self::EXPO_PUSH_URL, $messages);

            if ($response->successful()) {
                return count($validTokens);
            }
        } catch (\Throwable $e) {
            Log::error('[ExpoNotificationService] Excepción en sendBatch: ' . $e->getMessage());
        }

        return 0;
    }
}
