<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para verificar el rol del usuario autenticado.
 *
 * Uso en rutas:
 *   ->middleware('role:arrendador')
 *   ->middleware('role:administrador')
 *   ->middleware('role:estudiante')
 *   ->middleware('role:arrendador,administrador')  // múltiples roles
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $nombreRol = optional($user->rol)->nombre;

        if (! in_array($nombreRol, $roles)) {
            return response()->json([
                'message' => 'No tienes permiso para realizar esta acción.',
                'rol_requerido' => $roles,
                'rol_actual'    => $nombreRol,
            ], 403);
        }

        return $next($request);
    }
}
