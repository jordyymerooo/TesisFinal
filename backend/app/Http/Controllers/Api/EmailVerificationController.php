<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailVerificationController extends Controller
{
    /**
     * Verificar correo electrónico a través del enlace firmado.
     * GET /api/v1/email/verify/{id}/{hash}
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Validar hash sha1 del correo
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'El enlace de verificación es inválido.',
                ], 400);
            }
            return response()->view('auth.verify_result', [
                'success' => false,
                'message' => 'El enlace de verificación es inválido o ha sido alterado.',
            ], 400);
        }

        // Validar firma temporal de la URL si aplica
        if (! $request->hasValidSignature()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'El enlace de verificación ha expirado. Solicita uno nuevo desde la app móvil.',
                ], 403);
            }
            return response()->view('auth.verify_result', [
                'success' => false,
                'message' => 'El enlace de verificación ha expirado. Solicita un nuevo enlace desde la aplicación móvil.',
            ], 403);
        }

        $alreadyVerified = $user->hasVerifiedEmail();

        if (! $alreadyVerified) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status'   => 'success',
                'message'  => '¡Correo electrónico verificado exitosamente! Ya puedes iniciar sesión en la app.',
                'verified' => true,
            ]);
        }

        // Respuesta HTML elegante para visualización en navegador móvil/escritorio
        $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Correo Verificado - ULEAM Rental</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #F9FAFB;
            margin: 0;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .card {
            background: #FFFFFF;
            border-radius: 20px;
            padding: 36px 28px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #E5E7EB;
        }
        .badge-icon {
            width: 72px;
            height: 72px;
            background: #ECFDF5;
            border: 2px solid #A7F3D0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: #059669;
            font-size: 34px;
        }
        h1 {
            color: #111827;
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 10px;
        }
        p {
            color: #4B5563;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 24px;
        }
        .email-pill {
            display: inline-block;
            background: #F3F4F6;
            color: #8C1515;
            font-weight: 700;
            font-size: 13px;
            padding: 6px 14px;
            border-radius: 9999px;
            margin-bottom: 24px;
            word-break: break-all;
        }
        .btn-app {
            display: block;
            background: #8C1515;
            color: #FFFFFF;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 20px;
            border-radius: 12px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(140, 21, 21, 0.3);
            transition: background 0.15s ease;
        }
        .btn-app:hover {
            background: #701111;
        }
        .footer {
            margin-top: 24px;
            font-size: 12px;
            color: #9CA3AF;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge-icon">✓</div>
        <h1>¡Correo Verificado!</h1>
        <div class="email-pill">{$user->correo}</div>
        <p>Tu dirección de correo institucional ha sido validada exitosamente. Tu cuenta de <strong>ULEAM Rental</strong> ahora está activa y lista para usar.</p>
        <a href="exp://" class="btn-app">Abrir App ULEAM Rental</a>
        <div class="footer">Universidad Laica Eloy Alfaro de Manabí · Tesis de Grado</div>
    </div>
</body>
</html>
HTML;

        return response($html, 200)->header('Content-Type', 'text/html');
    }

    /**
     * Reenviar correo de verificación.
     * POST /api/v1/email/verification-notification
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user && $request->filled('correo')) {
            $user = User::where('correo', strtolower(trim($request->input('correo'))))->first();
        }

        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No se encontró ningún usuario con el correo proporcionado.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status'   => 'already_verified',
                'message'  => 'El correo electrónico ya ha sido verificado anteriormente.',
                'verified' => true,
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'status'  => 'success',
            'message' => 'Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada o SPAM y haz clic en el enlace para activar tu cuenta.',
            'correo'  => $user->correo,
        ]);
    }

    /**
     * Consultar si el correo del usuario ya fue verificado.
     * POST /api/v1/email/verify-status
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user && $request->filled('correo')) {
            $user = User::where('correo', strtolower(trim($request->input('correo'))))->first();
        }

        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        $verified = $user->hasVerifiedEmail();

        return response()->json([
            'status'   => 'success',
            'verified' => (bool) $verified,
            'correo'   => $user->correo,
            'message'  => $verified ? 'El correo está verificado.' : 'El correo aún no ha sido verificado.',
        ]);
    }
}
