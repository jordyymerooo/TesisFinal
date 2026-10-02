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
            // Activar automáticamente el estado general de la cuenta
            $user->estado = 'activo';
            $user->save();
            
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
        return view('verificacion-exitosa');
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

    /**
     * Comprobar si el correo del usuario ya fue verificado por su email.
     * GET /api/v1/check-verification/{email}
     */
    public function checkVerificationByEmail(string $email): JsonResponse
    {
        $normalizedEmail = strtolower(trim($email));

        $user = User::where('correo', $normalizedEmail)->first();

        if ($user && ($user->hasVerifiedEmail() || (!empty($user->email_verified_at) && $user->estado === 'activo'))) {
            if ($user->estado !== 'activo') {
                $user->estado = 'activo';
                $user->save();
            }

            return response()->json([
                'verified' => true,
                'message'  => 'Verificado',
            ]);
        }

        return response()->json([
            'verified' => false,
        ]);
    }
}
