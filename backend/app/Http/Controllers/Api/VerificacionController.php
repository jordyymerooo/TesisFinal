<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RegistroAuditoria;
use App\Models\Verificacion;
use Illuminate\Http\Request;

class VerificacionController extends Controller
{
    /**
     * GET /api/v1/verificaciones
     * Solo administrador: lista todas las verificaciones pendientes.
     */
    public function index(Request $request)
    {
        $verificaciones = Verificacion::with([
            'admin:id_usuario,nombres',
            'inmueble:id_inmueble,titulo,estado',
            'usuarioVerificado:id_usuario,nombres,correo',
        ])
        ->when($request->estado, fn ($q, $estado) => $q->where('estado', $estado))
        ->latest()
        ->paginate(20);

        return response()->json($verificaciones);
    }

    /**
     * POST /api/v1/verificaciones
     * Administrador crea una verificación (inicia el proceso).
     */
    public function store(Request $request)
    {
        $admin = $request->user();

        $data = $request->validate([
            'id_inmueble'          => ['nullable', 'integer', 'exists:inmuebles,id_inmueble'],
            'id_usuario_verificado' => ['nullable', 'integer', 'exists:users,id_usuario'],
            'observaciones'        => ['nullable', 'string'],
        ]);

        // Al menos uno debe estar presente
        if (empty($data['id_inmueble']) && empty($data['id_usuario_verificado'])) {
            return response()->json([
                'message' => 'Debe especificar un inmueble o un usuario a verificar.',
            ], 422);
        }

        $verificacion = Verificacion::create([
            ...$data,
            'id_admin' => $admin->id_usuario,
            'estado'   => 'pendiente',
        ]);

        return response()->json([
            'message'      => 'Verificación iniciada.',
            'verificacion' => $verificacion->load(['inmueble', 'usuarioVerificado']),
        ], 201);
    }

    /**
     * GET /api/v1/verificaciones/{id}
     * Ver detalle de una verificación.
     */
    public function show(string $id)
    {
        $verificacion = Verificacion::with([
            'admin:id_usuario,nombres',
            'inmueble',
            'usuarioVerificado:id_usuario,nombres,correo',
        ])->findOrFail($id);

        return response()->json($verificacion);
    }

    /**
     * PATCH /api/v1/verificaciones/{id}
     * Administrador aprueba o rechaza una verificación.
     */
    public function update(Request $request, string $id)
    {
        $admin        = $request->user();
        $verificacion = Verificacion::findOrFail($id);

        $data = $request->validate([
            'estado'        => ['required', 'in:aprobado,rechazado'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $verificacion->update([
            ...$data,
            'id_admin'       => $admin->id_usuario,
            'fecha_revision' => now(),
        ]);

        // Registrar en auditoría
        RegistroAuditoria::create([
            'id_administrador' => $admin->id_usuario,
            'accion'           => 'verificacion_' . $data['estado'],
            'entidad'          => 'verificaciones',
            'id_entidad'       => $verificacion->id_verificacion,
            'detalle'          => "Verificación #{$verificacion->id_verificacion} marcada como {$data['estado']}.",
        ]);

        return response()->json([
            'message'      => "Verificación {$data['estado']} correctamente.",
            'verificacion' => $verificacion->fresh(['inmueble', 'usuarioVerificado']),
        ]);
    }

    /**
     * POST o PATCH /admin/verificaciones/{id}/aprobar
     * Aprueba la verificación KYC del arrendador y envía el correo de confirmación.
     */
    public function aprobar(Request $request, string $id)
    {
        $usuario = \App\Models\User::where('id_usuario', $id)->firstOrFail();

        $perfil = \App\Models\Perfil::firstOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            ['documento_verificado' => true]
        );
        $perfil->documento_verificado = true;
        $perfil->save();

        $adminId = \Illuminate\Support\Facades\Auth::id() ?? 1;

        $usuario->update([
            'estado'       => 'activo',
            'estado_kyc'   => 'aprobado',
            'kyc_intentos' => 0,
            'verified_by'  => $adminId,
            'verified_at'  => now(),
        ]);

        \App\Models\KycHistory::create([
            'id_arrendador'     => $usuario->id_usuario,
            'id_admin'          => $adminId,
            'accion'            => 'aprobado',
            'observaciones'     => 'Documentación validada',
            'arrendador_nombre' => $usuario->nombres,
            'arrendador_cedula' => $usuario->cedula ?: $perfil->identificacion,
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($usuario->correo)->send(new \App\Mail\ArrendadorAprobadoMail($usuario));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("No se pudo enviar correo a {$usuario->correo}: " . $e->getMessage());
        }

        return response()->json([
            'status'   => 'success',
            'message'  => 'Arrendador aprobado exitosamente. Se ha enviado el correo de notificación.',
            'usuario'  => $usuario->fresh(['rol', 'perfil']),
        ]);
    }

    /**
     * POST o PATCH /admin/verificaciones/{id}/rechazar
     * Rechaza la documentación KYC del arrendador, registra la observación y envía el correo.
     */
    public function rechazar(Request $request, string $id)
    {
        $request->validate([
            'observacion' => ['required', 'string', 'min:3'],
        ]);

        $usuario = \App\Models\User::where('id_usuario', $id)->firstOrFail();
        $adminId = \Illuminate\Support\Facades\Auth::id() ?? 1;

        $arrendadorNombre = $usuario->nombres;
        $arrendadorCedula = $usuario->cedula ?: ($usuario->perfil?->identificacion ?? null);

        // Registrar en el historial KYC inmutable
        \App\Models\KycHistory::create([
            'id_arrendador'     => $usuario->id_usuario,
            'id_admin'          => $adminId,
            'accion'            => 'rechazado',
            'observaciones'     => $request->observacion,
            'arrendador_nombre' => $arrendadorNombre,
            'arrendador_cedula' => $arrendadorCedula,
        ]);

        $usuario->increment('kyc_intentos');

        if ($usuario->kyc_intentos >= 3) {
            // Eliminar cuenta por fallar 3 veces
            $usuario->tokens()->delete();
            $usuario->delete();
            return response()->json([
                'status'  => 'deleted',
                'message' => 'Cuenta eliminada por exceder límite de rechazos.',
            ], 200);
        } else {
            // Rechazo normal, dar oportunidad de subir de nuevo
            $usuario->update([
                'estado_kyc'      => 'rechazado',
                'kyc_observacion' => $request->observacion,
                'verified_by'     => $adminId,
                'verified_at'     => now(),
            ]);

            if ($usuario->perfil) {
                $usuario->perfil->update([
                    'documento_verificado' => false,
                    'kyc_observacion'      => $request->observacion,
                ]);
            }

            $emailDestino = $usuario->correo ?: $usuario->email;
            try {
                \Illuminate\Support\Facades\Mail::to($emailDestino)->send(
                    new \App\Mail\ArrendadorRechazadoMail($usuario, $request->observacion)
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("No se pudo enviar correo de rechazo a {$emailDestino}: " . $e->getMessage());
            }

            return response()->json([
                'status'   => 'success',
                'message'  => 'Documentos rechazados.',
                'usuario'  => $usuario->fresh(['rol', 'perfil']),
            ]);
        }
    }

    /**
     * DELETE — las verificaciones no se eliminan, quedan como registro histórico.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Las verificaciones son registros permanentes.'], 405);
    }

    /**
     * Retorna el historial de verificaciones KYC (Aprobadas o Rechazadas)
     * GET /api/v1/admin/verificaciones/historial
     */
    public function getVerificationHistory()
    {
        $historial = \App\Models\KycHistory::with([
            'arrendador:id_usuario,nombres,correo',
            'arrendador.perfil',
            'admin:id_usuario,nombres'
        ])
        ->latest()
        ->get();

        $data = $historial->map(function ($item) {
            $nombreArrendador = $item->arrendador?->nombres ?: ($item->arrendador_nombre ?: "Usuario #{$item->id_arrendador}");
            $cedulaArrendador = $item->arrendador?->perfil?->identificacion ?: ($item->arrendador?->cedula ?: ($item->arrendador_cedula ?: 'N/A'));
            $nombreAdmin = $item->admin?->nombres ?: 'Administrador (Sistema)';
            $fecha = $item->created_at ? $item->created_at->toIso8601String() : now()->toIso8601String();

            return [
                'id'                => $item->id,
                'id_usuario'        => $item->id_arrendador,
                'id_arrendador'     => $item->id_arrendador,
                'id_admin'          => $item->id_admin,
                'accion'            => $item->accion,
                'estado_kyc'        => $item->accion,
                'observaciones'     => $item->observaciones,
                'nombres'           => $nombreArrendador,
                'cedula'            => $cedulaArrendador,
                'identificacion'    => $cedulaArrendador,
                'created_at'        => $fecha,
                'verified_at'       => $fecha,
                'arrendador'        => [
                    'id_usuario' => $item->id_arrendador,
                    'nombres'    => $nombreArrendador,
                    'cedula'     => $cedulaArrendador,
                ],
                'admin'             => [
                    'id_usuario' => $item->id_admin,
                    'nombres'    => $nombreAdmin,
                ],
                'verified_by_admin' => [
                    'id_usuario' => $item->id_admin,
                    'nombres'    => $nombreAdmin,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
