<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inmueble;
use App\Models\SolicitudReserva;
use Illuminate\Http\Request;

class SolicitudReservaController extends Controller
{
    /**
     * GET /api/v1/solicitudes
     * Estudiante: sus propias solicitudes.
     * Arrendador: solicitudes de sus inmuebles.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->esEstudiante()) {
            $solicitudes = SolicitudReserva::where('id_estudiante', $user->id_usuario)
                ->with(['inmueble:id_inmueble,titulo,precio'])
                ->latest()
                ->paginate(15);

            return response()->json($solicitudes);
        }

        if ($user->esArrendador()) {
            $idsMisInmuebles = Inmueble::where('id_arrendador', $user->id_usuario)
                ->pluck('id_inmueble');

            $solicitudes = SolicitudReserva::whereIn('id_inmueble', $idsMisInmuebles)
                ->with([
                    'inmueble:id_inmueble,titulo',
                    'estudiante:id_usuario,nombres,correo',
                ])
                ->latest()
                ->paginate(15);

            return response()->json($solicitudes);
        }

        return response()->json(['message' => 'Acceso no autorizado.'], 403);
    }

    /**
     * POST /api/v1/solicitudes
     * Estudiante crea una solicitud de reserva.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'id_inmueble'            => ['required', 'integer', 'exists:inmuebles,id_inmueble'],
            'fecha_deseada_ingreso'  => ['nullable', 'date', 'after_or_equal:today'],
            'mensaje_inicial'        => ['nullable', 'string', 'max:1000'],
        ]);

        // Verificar que el inmueble esté publicado
        $inmueble = Inmueble::where('id_inmueble', $data['id_inmueble'])
            ->where('estado', 'publicado')
            ->firstOrFail();

        // Verificar que no tenga una solicitud pendiente/aceptada para el mismo inmueble
        $yaExiste = SolicitudReserva::where('id_estudiante', $user->id_usuario)
            ->where('id_inmueble', $data['id_inmueble'])
            ->whereIn('estado', ['pendiente', 'aceptada'])
            ->exists();

        if ($yaExiste) {
            return response()->json([
                'message' => 'Ya tienes una solicitud activa para este inmueble.',
            ], 422);
        }

        $solicitud = SolicitudReserva::create([
            ...$data,
            'id_estudiante' => $user->id_usuario,
            'estado'        => 'pendiente',
        ]);

        return response()->json([
            'message'   => 'Solicitud enviada exitosamente.',
            'solicitud' => $solicitud->load('inmueble:id_inmueble,titulo,precio'),
        ], 201);
    }

    /**
     * GET /api/v1/solicitudes/{id}
     * Ver detalle de una solicitud.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $solicitud = SolicitudReserva::with([
            'inmueble', 'estudiante:id_usuario,nombres,correo',
        ])->findOrFail($id);

        // Solo el estudiante o el arrendador del inmueble pueden verla
        $esDelEstudiante = $solicitud->id_estudiante === $user->id_usuario;
        $esDelArrendador = $solicitud->inmueble->id_arrendador === $user->id_usuario;

        if (! $esDelEstudiante && ! $esDelArrendador && ! $user->esAdministrador()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return response()->json($solicitud);
    }

    /**
     * PATCH /api/v1/solicitudes/{id}/estado
     * Arrendador: cambiar estado (aceptada / rechazada).
     * Estudiante: cancelar (cancelada).
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $solicitud = SolicitudReserva::with('inmueble')->findOrFail($id);

        if ($user->esArrendador()) {
            // Solo puede gestionar solicitudes de sus inmuebles
            if ($solicitud->inmueble->id_arrendador !== $user->id_usuario) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }

            $data = $request->validate([
                'estado' => ['required', 'in:aceptada,rechazada'],
            ]);
        } elseif ($user->esEstudiante()) {
            // Solo puede cancelar sus propias solicitudes
            if ($solicitud->id_estudiante !== $user->id_usuario) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }

            $data = $request->validate([
                'estado' => ['required', 'in:cancelada'],
            ]);
        } else {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $solicitud->update($data);

        return response()->json([
            'message'   => 'Estado de la solicitud actualizado.',
            'solicitud' => $solicitud->fresh(),
        ]);
    }

    /**
     * DELETE — no aplica para solicitudes (se cancelan, no se eliminan).
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Operación no permitida. Usa PATCH /estado para cancelar.'], 405);
    }

    /**
     * GET /api/v1/estudiante/solicitudes
     * Todas las solicitudes del estudiante autenticado con inmueble, fotos y arrendador.
     */
    public function estudianteIndex(Request $request)
    {
        $user = $request->user();

        $solicitudes = SolicitudReserva::where('id_estudiante', $user->id_usuario)
            ->with([
                'inmueble.fotografias',
                'inmueble.arrendador.perfil',
                'inmueble.ubicacion',
            ])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $solicitudes,
        ]);
    }

    /**
     * Alias para misSolicitudes
     */
    public function misSolicitudes(Request $request)
    {
        return $this->estudianteIndex($request);
    }
}
