<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /**
     * GET /api/v1/notificaciones
     * Listar notificaciones del usuario autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Si el usuario no tiene ninguna notificación registrada, crear una de bienvenida
        $count = Notificacion::where('id_usuario', $user->id_usuario)->count();
        if ($count === 0) {
            Notificacion::create([
                'id_usuario' => $user->id_usuario,
                'titulo'     => '¡Bienvenido a ULEAM Rental!',
                'mensaje'    => 'Tu cuenta institucional está lista. Ahora puedes explorar alojamientos cercanos al campus y guardar tus favoritos.',
                'tipo'       => 'sistema',
                'leido_en'   => null,
            ]);
        }

        $notificaciones = Notificacion::where('id_usuario', $user->id_usuario)
            ->latest()
            ->get();

        $noLeidas = Notificacion::where('id_usuario', $user->id_usuario)
            ->whereNull('leido_en')
            ->count();

        return response()->json([
            'status'     => 'success',
            'unread'     => $noLeidas,
            'data'       => $notificaciones,
        ]);
    }

    /**
     * PATCH /api/v1/notificaciones
     * Marcar notificación específica o todas como leídas.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $idNotificacion = $request->input('id_notificacion');

        if ($idNotificacion) {
            Notificacion::where('id_usuario', $user->id_usuario)
                ->where('id_notificacion', $idNotificacion)
                ->update(['leido_en' => now()]);
        } else {
            // Marcar todas como leídas
            Notificacion::where('id_usuario', $user->id_usuario)
                ->whereNull('leido_en')
                ->update(['leido_en' => now()]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Notificaciones marcadas como leídas',
        ]);
    }
}
