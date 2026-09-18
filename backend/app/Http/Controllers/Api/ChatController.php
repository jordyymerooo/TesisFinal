<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Inmueble;
use App\Models\Mensaje;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Sincronizar tabla de chats a partir de los mensajes registrados en la base de datos.
     */
    private static function syncChatsFromMensajes(): void
    {
        $mensajes = Mensaje::with(['remitente', 'destinatario'])->get();

        foreach ($mensajes as $m) {
            if (!$m->remitente || !$m->destinatario) {
                continue;
            }

            $u1 = $m->remitente;
            $u2 = $m->destinatario;

            // Determinar estudiante y arrendador por id_rol (1 = estudiante, 2 = arrendador)
            if ($u1->id_rol === 1) {
                $estudianteId = $u1->id_usuario;
                $arrendadorId = $u2->id_usuario;
            } elseif ($u2->id_rol === 1) {
                $estudianteId = $u2->id_usuario;
                $arrendadorId = $u1->id_usuario;
            } else {
                $estudianteId = min($u1->id_usuario, $u2->id_usuario);
                $arrendadorId = max($u1->id_usuario, $u2->id_usuario);
            }

            $chat = Chat::firstOrCreate([
                'id_estudiante' => $estudianteId,
                'id_arrendador' => $arrendadorId,
            ]);

            // Asignar inmueble si el mensaje lo tiene
            if ($m->id_inmueble && !$chat->id_inmueble) {
                $chat->id_inmueble = $m->id_inmueble;
            }

            // Si aún no tiene inmueble, asociar el primer inmueble del arrendador
            if (!$chat->id_inmueble) {
                $primInm = Inmueble::where('id_arrendador', $arrendadorId)->first();
                if ($primInm) {
                    $chat->id_inmueble = $primInm->id_inmueble;
                }
            }

            // Actualizar último mensaje
            if (!$chat->ultimo_mensaje_at || $m->created_at >= $chat->ultimo_mensaje_at) {
                $chat->ultimo_mensaje_texto = $m->contenido;
                $chat->ultimo_mensaje_at = $m->created_at;
            }

            $chat->save();
        }
    }

    /**
     * GET /api/v1/admin/chats
     * Listar todas las conversaciones de auditoría para el administrador.
     */
    public function adminIndex(): JsonResponse
    {
        self::syncChatsFromMensajes();

        $chats = Chat::with(['estudiante.perfil', 'arrendador.perfil', 'inmueble'])
            ->orderByDesc('ultimo_mensaje_at')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($chats);
    }

    /**
     * GET /api/v1/admin/chats/{chat_id}/mensajes
     * Ver los mensajes de un chat específico con fines de auditoría.
     */
    public function adminMessages($chat_id): JsonResponse
    {
        // Buscar el chat por ID
        $chat = Chat::find($chat_id);

        if (!$chat) {
            // Intentar buscar por formato 'estudianteId-arrendadorId'
            if (str_contains((string) $chat_id, '-')) {
                [$eId, $aId] = explode('-', (string) $chat_id);
                $chat = Chat::where('id_estudiante', $eId)->where('id_arrendador', $aId)->first();
            }
        }

        if (!$chat) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Conversación no encontrada.',
                'data'    => [],
            ], 404);
        }

        // Obtener historial completo de mensajes entre el estudiante y el arrendador
        $mensajes = Mensaje::where(function ($q) use ($chat) {
            $q->where('id_remitente', $chat->id_estudiante)
              ->where('id_destinatario', $chat->id_arrendador);
        })->orWhere(function ($q) use ($chat) {
            $q->where('id_remitente', $chat->id_arrendador)
              ->where('id_destinatario', $chat->id_estudiante);
        })
        ->with(['remitente.perfil', 'destinatario.perfil'])
        ->orderBy('created_at', 'asc')
        ->orderBy('id_mensaje', 'asc')
        ->get();

        // Mapear campos consistentes incluyendo sender_id para la lógica en React
        $formatted = $mensajes->map(function ($m) {
            return [
                'id'              => $m->id_mensaje,
                'id_mensaje'      => $m->id_mensaje,
                'sender_id'       => $m->id_remitente,
                'receiver_id'     => $m->id_destinatario,
                'id_remitente'    => $m->id_remitente,
                'id_destinatario' => $m->id_destinatario,
                'contenido'       => $m->contenido,
                'leido'           => (bool) $m->leido,
                'fecha'           => $m->fecha ? $m->fecha->toISOString() : ($m->created_at ? $m->created_at->toISOString() : null),
                'created_at'      => $m->created_at ? $m->created_at->toISOString() : null,
                'remitente'       => $m->remitente,
                'destinatario'    => $m->destinatario,
            ];
        });

        return response()->json($formatted);
    }
}
