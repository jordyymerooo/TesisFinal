<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comunicado;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComunicadoController extends Controller
{
    /**
     * Listar comunicados oficiales registrados.
     * GET /api/v1/admin/comunicados o GET /api/v1/comunicados
     */
    public function index(Request $request): JsonResponse
    {
        $comunicados = Comunicado::with('admin:id_usuario,nombres,correo')
            ->orderBy('created_at', 'desc')
            ->get();

        // Enriquecer los comunicados de tipo 'especificos' con los datos reales de los destinatarios
        $comunicados->transform(function ($comunicado) {
            if ($comunicado->destinatarios === 'especificos' && is_array($comunicado->usuarios_ids) && count($comunicado->usuarios_ids) > 0) {
                $comunicado->usuarios_especificos = User::whereIn('id_usuario', $comunicado->usuarios_ids)
                    ->select('id_usuario', 'nombres', 'correo')
                    ->orderBy('nombres')
                    ->get();
            } else {
                $comunicado->usuarios_especificos = [];
            }
            return $comunicado;
        });

        return response()->json([
            'success' => true,
            'data'    => $comunicados,
        ]);
    }

    /**
     * Obtener lista de usuarios verificados para selección en comunicados.
     * GET /api/v1/admin/usuarios-verificados
     */
    public function getUsuariosVerificados(): JsonResponse
    {
        $usuarios = User::where(function ($query) {
                $query->where('estado_kyc', 'aprobado')
                      ->orWhere('id_rol', 1) // Estudiantes
                      ->orWhereHas('perfil', function ($q) {
                          $q->where('documento_verificado', true);
                      });
            })
            ->select('id_usuario', 'nombres', 'correo', 'id_rol')
            ->orderBy('nombres', 'asc')
            ->get()
            ->map(function ($u) {
                return [
                    'id_usuario' => $u->id_usuario,
                    'nombres'    => $u->nombres,
                    'apellidos'  => '',
                    'email'      => $u->correo,
                    'id_rol'     => $u->id_rol,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $usuarios,
        ]);
    }

    /**
     * Guardar y emitir un nuevo comunicado oficial.
     * POST /api/v1/admin/comunicados
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'titulo'        => 'required|string|max:255',
            'mensaje'       => 'required|string',
            'destinatarios' => 'required|in:todos_verificados,estudiantes_verificados,arrendadores_verificados,especificos',
            'usuarios_ids'  => 'required_if:destinatarios,especificos|array',
        ]);

        $adminId = $request->user()?->id_usuario ?? $request->user()?->id ?? 1;

        $comunicado = Comunicado::create([
            'titulo'        => $request->titulo,
            'mensaje'       => $request->mensaje,
            'destinatarios' => $request->destinatarios,
            'usuarios_ids'  => $request->destinatarios === 'especificos' ? $request->usuarios_ids : null,
            'id_admin'      => $adminId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comunicado enviado exitosamente.',
            'data'    => $comunicado->load('admin:id_usuario,nombres,correo'),
        ], 201);
    }

    /**
     * Obtener los comunicados oficiales dirigidos al usuario autenticado (móvil).
     * GET /api/v1/comunicados/mis-comunicados
     */
    public function misComunicados(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado.',
            ], 401);
        }

        // Determinar grupo del usuario según su rol (1: estudiante, 2: arrendador)
        $grupoVerificado = $user->id_rol == 1 ? 'estudiantes_verificados' : 'arrendadores_verificados';

        $comunicados = Comunicado::with('admin:id_usuario,nombres,correo')
            ->where(function ($query) use ($grupoVerificado, $user) {
                $query->where('destinatarios', 'todos_verificados')
                      ->orWhere('destinatarios', $grupoVerificado)
                      ->orWhere(function ($subQuery) use ($user) {
                          $subQuery->where('destinatarios', 'especificos')
                                   ->whereJsonContains('usuarios_ids', (int) $user->id_usuario);
                      });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $comunicados,
        ]);
    }
}
