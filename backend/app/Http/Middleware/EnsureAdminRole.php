<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Primero verifica si está autenticado
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado. Token faltante o inválido.'
            ], 401);
        }

        // Luego verifica el rol (id_rol == 3 o rol == 'Administrador')
        $user = $request->user();
        $idRol = (int) ($user->id_rol ?? 0);
        $rolNombre = strtolower(optional($user->rol)->nombre ?? '');

        if ($idRol !== 3 && $rolNombre !== 'administrador' && $rolNombre !== 'admin') { 
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Privilegios de administrador requeridos.'
            ], 403);
        }

        return $next($request);
    }
}
