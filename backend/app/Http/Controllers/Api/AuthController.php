<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BienvenidaUsuario;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     * Registro público (sin autenticación previa).
     */
    public function register(Request $request)
    {
        // Se valida el rol antes para usarlo en la regla condicional
        $idRol = (int) $request->input('id_rol');

        $correoRules = ['required', 'email', 'max:150', 'unique:users,correo'];
        if ($idRol === 1) {
            $correoRules[] = 'regex:/^[a-zA-Z0-9._%+-]+@(live\.uleam\.edu\.ec|dn\.uleam\.edu\.ec|uleam\.edu\.ec)$/i';
        }

        $data = $request->validate([
            'nombres'        => ['required', 'string', 'max:150'],
            'correo'         => $correoRules,
            'clave'          => ['required', 'confirmed', Password::min(8)],
            'id_rol'         => ['required', 'integer', 'in:1,2'], // solo estudiante o arrendador
            'identificacion' => ['nullable', 'string', 'max:20'],
            'telefono'       => ['nullable', 'string', 'max:15'],
        ], [
            'correo.regex' => 'Debes utilizar un correo institucional de la ULEAM.'
        ]);

        $user = User::create([
            'nombres'    => $data['nombres'],
            'correo'     => $data['correo'],
            'clave_hash' => Hash::make($data['clave']),
            'id_rol'     => $data['id_rol'],
            'estado'     => 'pendiente',
            'telefono'   => $data['telefono'] ?? null,
        ]);

        // Crear perfil automáticamente
        $perfilData = [
            'id_usuario'     => $user->id_usuario,
            'identificacion' => $request->input('identificacion'),
        ];

        if ((int) $data['id_rol'] === 2) {
            // Arrendadores inician con documento_verificado = false (requiere aprobación admin)
            $perfilData['documento_verificado'] = false;
        }

        $user->perfil()->create($perfilData);

        // ── Correo de bienvenida personalizado ────────────────────────────────
        // Se envía de forma tolerante a fallos: si el mailer falla, el registro
        // no se interrumpe. En desarrollo se registra en storage/logs/laravel.log
        try {
            Mail::to($user->correo)->send(new BienvenidaUsuario($user));
        } catch (\Throwable $e) {
            \Log::warning('[AuthController] No se pudo enviar correo de bienvenida: ' . $e->getMessage());
        }
        // ───────────────────────────────────────────────────────────────

        // Disparar evento estándar de Laravel para enviar correo de verificación
        event(new \Illuminate\Auth\Events\Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'        => 'Usuario registrado exitosamente. Te hemos enviado un correo de confirmación para verificar tu cuenta.',
            'user'           => $user->load('rol', 'perfil'),
            'token'          => $token,
            'token_type'     => 'Bearer',
            'email_verified' => false,
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     * Login con correo y clave. Devuelve token Sanctum.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'correo' => ['required', 'email'],
            'clave'  => ['required', 'string'],
        ]);

        $user = User::where('correo', $data['correo'])->first();

        if (! $user || ! Hash::check($data['clave'], $user->clave_hash)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales no son válidas.'],
            ]);
        }

        if ($user->estado === 'suspendido') {
            return response()->json([
                'message' => 'Tu cuenta está suspendida. Contacta al administrador.',
            ], 403);
        }

        // Si el usuario no ha verificado su correo, responder 403 para activar VerifyEmailScreen en la app
        if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'status'         => 'error',
                'message'        => 'Email no verificado. Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada o SPAM y haz clic en el enlace para activar tu cuenta.',
                'error_code'     => 'EMAIL_NOT_VERIFIED',
                'email_verified' => false,
                'correo'         => $user->correo,
                'user'           => [
                    'id_usuario' => $user->id_usuario,
                    'nombres'    => $user->nombres,
                    'correo'     => $user->correo,
                    'id_rol'     => $user->id_rol,
                ],
            ], 403);
        }

        // Revocar tokens anteriores (single session por defecto)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'user'    => $user->load('rol', 'perfil'),
            'token'   => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Revoca el token actual. Requiere auth:sanctum.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * GET /api/v1/auth/me
     * Devuelve el perfil del usuario autenticado. Requiere auth:sanctum.
     */
    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load('rol', 'perfil')
        );
    }
}
