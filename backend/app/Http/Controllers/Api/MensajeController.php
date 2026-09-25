<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\User;
use App\Services\ExpoNotificationService;
use Illuminate\Http\Request;

class MensajeController extends Controller
{
    /**
     * GET /api/v1/mensajes/conversaciones
     * Lista de usuarios con los que el usuario autenticado tiene mensajes,
     * incluyendo el último mensaje y la fecha.
     */
    public function conversaciones(Request $request)
    {
        $userId = $request->user()->id_usuario;

        // Obtener todos los mensajes donde participa el usuario
        $mensajes = Mensaje::where('id_remitente', $userId)
            ->orWhere('id_destinatario', $userId)
            ->with([
                'remitente.perfil',
                'remitente.rol',
                'destinatario.perfil',
                'destinatario.rol',
                'inmueble:id_inmueble,titulo',
            ])
            ->latest('created_at')
            ->get();

        $agrupados = [];

        foreach ($mensajes as $m) {
            $esRemitente = ((int) $m->id_remitente === (int) $userId);
            $otroUsuario = $esRemitente ? $m->destinatario : $m->remitente;

            if (!$otroUsuario) {
                continue;
            }

            $otroId = $otroUsuario->id_usuario;

            if (!isset($agrupados[$otroId])) {
                $agrupados[$otroId] = [
                    'id_conversacion' => $otroId,
                    'otro_usuario'    => [
                        'id_usuario'       => $otroUsuario->id_usuario,
                        'nombres'          => $otroUsuario->nombres,
                        'correo'           => $otroUsuario->correo,
                        'id_rol'           => $otroUsuario->id_rol,
                        'rol'              => $otroUsuario->rol?->nombre ?? ($otroUsuario->id_rol === 2 ? 'arrendador' : 'estudiante'),
                        'foto_perfil_url'  => $otroUsuario->perfil?->foto_perfil_url ?? null,
                        'telefono'         => $otroUsuario->perfil?->telefono ?? null,
                        'ciudad_origen'    => $otroUsuario->perfil?->ciudad_origen ?? null,
                        'carrera'          => $otroUsuario->perfil?->carrera ?? null,
                        'documento_verificado' => (bool) ($otroUsuario->perfil?->documento_verificado ?? false),
                    ],
                    'ultimo_mensaje'  => [
                        'id_mensaje'      => $m->id_mensaje,
                        'contenido'       => $m->contenido,
                        'fecha'           => $m->fecha ?? $m->created_at,
                        'created_at'      => $m->created_at,
                        'leido'           => (bool) $m->leido,
                        'id_remitente'    => $m->id_remitente,
                        'id_destinatario' => $m->id_destinatario,
                        'inmueble'        => $m->inmueble,
                    ],
                    'unread_count'    => 0,
                ];
            }

            if ((int) $m->id_destinatario === (int) $userId && !$m->leido) {
                $agrupados[$otroId]['unread_count']++;
            }
        }

        return response()->json(array_values($agrupados));
    }

    /**
     * GET /api/v1/mensajes/{otro_usuario_id}
     * Devuelve el historial de mensajes ordenados cronológicamente
     * entre el usuario autenticado y el ID proporcionado.
     */
    public function chatConUsuario(Request $request, string $otroUsuarioId)
    {
        $userId = $request->user()->id_usuario;
        $otroId = (int) $otroUsuarioId;

        // Validar que el otro usuario exista
        $otroUsuario = User::with(['perfil', 'rol'])->find($otroId);
        if (!$otroUsuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $mensajes = Mensaje::where(function ($q) use ($userId, $otroId) {
                $q->where('id_remitente', $userId)->where('id_destinatario', $otroId);
            })
            ->orWhere(function ($q) use ($userId, $otroId) {
                $q->where('id_remitente', $otroId)->where('id_destinatario', $userId);
            })
            ->with([
                'remitente.perfil',
                'destinatario.perfil',
                'inmueble:id_inmueble,titulo',
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Marcar como leídos los recibidos de este usuario
        Mensaje::where('id_remitente', $otroId)
            ->where('id_destinatario', $userId)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json([
            'otro_usuario' => [
                'id_usuario'           => $otroUsuario->id_usuario,
                'nombres'              => $otroUsuario->nombres,
                'correo'               => $otroUsuario->correo,
                'id_rol'               => $otroUsuario->id_rol,
                'rol'                  => $otroUsuario->rol?->nombre ?? ($otroUsuario->id_rol === 2 ? 'arrendador' : 'estudiante'),
                'foto_perfil_url'      => $otroUsuario->perfil?->foto_perfil_url ?? null,
                'documento_verificado' => (bool) ($otroUsuario->perfil?->documento_verificado ?? false),
            ],
            'mensajes'     => $mensajes,
        ]);
    }

    /**
     * POST /api/v1/mensajes
     * Recibe receptor_id y contenido, y guarda el registro en la tabla mensajes.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Soportar 'receptor_id' o 'id_destinatario'
        $destinatarioId = $request->input('receptor_id') ?? $request->input('id_destinatario');
        $request->merge(['id_destinatario' => $destinatarioId]);

        $data = $request->validate([
            'id_destinatario' => ['required', 'integer', 'exists:users,id_usuario'],
            'contenido'       => ['required', 'string', 'max:5000'],
            'id_inmueble'     => ['nullable', 'integer', 'exists:inmuebles,id_inmueble'],
        ]);

        // No puede enviarse mensajes a sí mismo
        if ((int) $data['id_destinatario'] === (int) $user->id_usuario) {
            return response()->json(['message' => 'No puedes enviarte mensajes a ti mismo.'], 422);
        }

        $mensaje = Mensaje::create([
            'id_remitente'    => $user->id_usuario,
            'id_destinatario' => $data['id_destinatario'],
            'id_inmueble'     => $data['id_inmueble'] ?? null,
            'contenido'       => $data['contenido'],
            'leido'           => false,
            'fecha'           => now(),
        ]);

        // ── Notificación Push al Destinatario ──────────────────────────────
        try {
            $destinatario = User::find($data['id_destinatario']);
            if ($destinatario && !empty($destinatario->expo_push_token)) {
                $senderName  = $user->nombres ?? 'Alguien';
                $msgPreview  = mb_strlen($data['contenido']) > 80
                    ? mb_substr($data['contenido'], 0, 77) . '...'
                    : $data['contenido'];

                ExpoNotificationService::send(
                    $destinatario->expo_push_token,
                    "💬 {$senderName}",
                    $msgPreview,
                    [
                        'screen'    => 'ChatRoom',
                        'userId'    => $user->id_usuario,
                        'userName'  => $senderName,
                        'inmuebleId'=> $data['id_inmueble'] ?? null,
                    ]
                );
            }
        } catch (\Throwable $e) {
            // Tolerancia a fallos: el mensaje ya fue guardado, la notificación es best-effort
            \Log::warning('[MensajeController] Error enviando push: ' . $e->getMessage());
        }
        // ─────────────────────────────────────────────────────────────────

        return response()->json([
            'message' => 'Mensaje enviado.',
            'data'    => $mensaje->load([
                'remitente.perfil',
                'destinatario.perfil',
                'inmueble:id_inmueble,titulo',
            ]),
        ], 201);
    }

    /**
     * GET /api/v1/mensajes
     * Lista general paginada.
     */
    public function index(Request $request)
    {
        return $this->conversaciones($request);
    }

    /**
     * GET /api/v1/mensajes/hilo/{id_inmueble}/{id_usuario}
     */
    public function hilo(Request $request, string $idInmueble, string $idUsuario)
    {
        return $this->chatConUsuario($request, $idUsuario);
    }
}
