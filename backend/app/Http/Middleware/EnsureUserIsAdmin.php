<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $rolNombre = strtolower(optional($user->rol)->nombre ?? '');
        $idRol = (int) ($user->id_rol ?? 0);

        if ($idRol !== 3 && $rolNombre !== 'administrador' && $rolNombre !== 'admin') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Acceso restringido a administradores.',
            ], 403);
        }

        return $next($request);
    }
}
