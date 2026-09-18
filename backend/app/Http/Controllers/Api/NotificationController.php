<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * POST /api/v1/admin/usuarios/{id}/notificar
     * Enviar comunicado o notificación oficial del administrador a un usuario específico.
     */
    public function sendToUser(Request $request, $id): JsonResponse
    {
        $titulo = $request->input('titulo') ?: $request->json('titulo');
        $mensaje = $request->input('mensaje') ?: $request->json('mensaje');

        if (!$titulo || !$mensaje) {
            $raw = json_decode($request->getContent(), true);
            if (is_array($raw)) {
                $titulo = $titulo ?: ($raw['titulo'] ?? null);
                $mensaje = $mensaje ?: ($raw['mensaje'] ?? null);
            }
        }

        if (!$titulo || !$mensaje) {
            return response()->json([
                'status'  => 'error',
                'message' => 'El título y el mensaje son requeridos.',
                'errors'  => [
                    'titulo'  => !$titulo ? ['El título es obligatorio.'] : [],
                    'mensaje' => !$mensaje ? ['El mensaje es obligatorio.'] : [],
                ],
            ], 422);
        }

        $usuario = User::find($id);
        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        $notificacion = Notificacion::create([
            'id_usuario' => $usuario->id_usuario,
            'user_id'    => $usuario->id_usuario,
            'titulo'     => (string) $titulo,
            'mensaje'    => (string) $mensaje,
            'tipo'       => 'oficial',
            'leido'      => false,
            'leido_en'   => null,
            'datos'      => [
                'remitente' => 'Soporte ULEAM Rental',
                'oficial'   => true,
            ],
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => "Notificación enviada exitosamente a {$usuario->nombres}.",
            'data'    => $notificacion,
        ], 201);
    }

    /**
     * GET /api/v1/mis-notificaciones
     * Obtener el listado de notificaciones oficiales y del sistema del usuario actual.
     */
    public function misNotificaciones(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id_usuario : ($request->query('user_id') ?: 3);

        $notificaciones = Notificacion::where(function ($q) use ($userId) {
                $q->where('id_usuario', $userId)
                  ->orWhere('user_id', $userId);
            })
            ->orderByDesc('created_at')
            ->get();

        $unreadCount = Notificacion::where(function ($q) use ($userId) {
                $q->where('id_usuario', $userId)
                  ->orWhere('user_id', $userId);
            })
            ->where('leido', false)
            ->whereNull('leido_en')
            ->count();

        return response()->json([
            'status' => 'success',
            'unread' => $unreadCount,
            'data'   => $notificaciones,
        ]);
    }
}
