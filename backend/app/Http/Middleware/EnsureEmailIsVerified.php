<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail())) {
            return response()->json([
                'status'         => 'error',
                'message'        => 'Email no verificado. Por favor, revisa tu bandeja de entrada o SPAM y haz clic en el enlace para activar tu cuenta.',
                'error_code'     => 'EMAIL_NOT_VERIFIED',
                'email_verified' => false,
                'correo'         => $user?->correo,
            ], 403);
        }

        return $next($request);
    }
}
