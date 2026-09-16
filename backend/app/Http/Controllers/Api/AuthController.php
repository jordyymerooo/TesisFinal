<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
        $data = $request->validate([
            'nombres'  => ['required', 'string', 'max:150'],
            'correo'   => ['required', 'email', 'max:150', 'unique:users,correo'],
            'clave'    => ['required', 'confirmed', Password::min(8)],
            'id_rol'   => ['required', 'integer', 'in:1,2'], // solo estudiante o arrendador
        ]);

        // Validación de dominio institucional para estudiantes
        if ((int) $data['id_rol'] === 1) {
            $correo = strtolower($data['correo']);
            $dominioValido = str_ends_with($correo, '@uleam.edu.ec')
                          || str_ends_with($correo, '@live.uleam.edu.ec');

            if (!$dominioValido) {
                throw ValidationException::withMessages([
                    'correo' => ['Los estudiantes deben usar su correo institucional de la ULEAM (@uleam.edu.ec o @live.uleam.edu.ec).'],
                ]);
            }
        }

        $user = User::create([
            'nombres'   => $data['nombres'],
            'correo'    => $data['correo'],
            'clave_hash' => Hash::make($data['clave']),
            'id_rol'    => $data['id_rol'],
            'estado'    => 'pendiente',
        ]);

        // Crear perfil automáticamente
        $perfilData = ['id_usuario' => $user->id_usuario];

        if ((int) $data['id_rol'] === 2) {
            // Arrendadores inician con documento_verificado = false (requiere aprobación admin)
            $perfilData['documento_verificado'] = false;
        }

        $user->perfil()->create($perfilData);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente.',
            'user'    => $user->load('rol', 'perfil'),
            'token'   => $token,
            'token_type' => 'Bearer',
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
