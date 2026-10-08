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
        // Se valida el rol antes para usarlo en la regla condicional (1 = estudiante, 2 = arrendador)
        $idRol = (int) $request->input('id_rol', 1);

        // Normalización de parámetros (cedula <-> identificacion, password <-> clave)
        if ($request->filled('identificacion') && !$request->filled('cedula')) {
            $request->merge(['cedula' => $request->input('identificacion')]);
        } elseif ($request->filled('cedula') && !$request->filled('identificacion')) {
            $request->merge(['identificacion' => $request->input('cedula')]);
        }

        if ($request->filled('clave') && !$request->filled('password')) {
            $request->merge([
                'password' => $request->input('clave'),
                'password_confirmation' => $request->input('clave_confirmation') ?? $request->input('confirmar'),
            ]);
        } elseif ($request->filled('password') && !$request->filled('clave')) {
            $request->merge([
                'clave' => $request->input('password'),
                'clave_confirmation' => $request->input('password_confirmation'),
            ]);
        }

        $correoValidation = [
            'required',
            'email',
            'max:150',
            'unique:users,correo',
            function ($attribute, $value, $fail) use ($idRol) {
                // Validación de dominio institucional exclusivo para estudiantes
                if ($idRol === 1 && !preg_match('/@(uleam\.edu\.ec|live\.uleam\.edu\.ec|dn\.uleam\.edu\.ec)$/i', $value)) {
                    $fail('El correo debe ser institucional de la ULEAM (@uleam.edu.ec, @live.uleam.edu.ec o @dn.uleam.edu.ec).');
                }
            },
        ];

        $data = $request->validate([
            'nombres'  => ['required', 'string', 'min:3', 'max:50', 'regex:/^[\pL\s\-]+$/u'], // Solo letras y espacios
            'cedula'   => ['required', 'string', 'size:10', 'regex:/^[0-9]+$/', 'unique:perfiles,identificacion'], 
            'telefono' => ['required', 'string', 'size:10', 'regex:/^09[0-9]{8}$/'],
            'correo'   => $correoValidation,
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'id_rol'   => ['required', 'integer', 'in:1,2'],
        ], [
            'nombres.required' => 'El nombre completo es obligatorio.',
            'nombres.min' => 'El nombre debe tener al menos 3 caracteres.',
            'nombres.max' => 'El nombre no puede tener más de 50 caracteres.',
            'nombres.regex' => 'El nombre no puede contener números ni caracteres especiales.',
            'cedula.required' => 'La cédula es obligatoria.',
            'cedula.size' => 'La cédula debe tener exactamente 10 dígitos.',
            'cedula.regex' => 'La cédula solo puede contener números.',
            'cedula.unique' => 'Esta cédula ya se encuentra registrada.',
            'telefono.required' => 'El número de teléfono es obligatorio.',
            'telefono.size' => 'El teléfono debe tener exactamente 10 dígitos.',
            'telefono.regex' => 'El teléfono debe tener 10 dígitos y empezar por 09 (ej. 0991234567).',
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'El correo electrónico no es válido.',
            'correo.unique' => 'Este correo ya se encuentra registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La contraseña y la confirmación no coinciden.',
        ]);

        $cedula = $data['cedula'];
        $telefono = $data['telefono'];
        $password = $data['password'];

        $isArrendador = ((int) $data['id_rol'] === 2);

        $user = User::create([
            'nombres'    => $data['nombres'],
            'correo'     => $data['correo'],
            'clave_hash' => Hash::make($password),
            'id_rol'     => $data['id_rol'],
            'estado'     => 'pendiente',
            'estado_kyc' => $isArrendador ? 'pendiente' : null,
            'telefono'   => $telefono,
        ]);

        // Crear perfil automáticamente con identificación y teléfono reales
        $perfilData = [
            'id_usuario'     => $user->id_usuario,
            'identificacion' => $cedula,
            'telefono'       => $telefono,
        ];

        if ($isArrendador) {
            // Arrendadores inician con documento_verificado = false (requiere aprobación admin)
            $perfilData['documento_verificado'] = false;
        }

        $user->perfil()->create($perfilData);

        // Disparar únicamente el evento estándar de Laravel para enviar un solo correo de verificación
        event(new \Illuminate\Auth\Events\Registered($user));

        return response()->json([
            'message'        => 'Registro exitoso, por favor verifica tu correo.',
            'id_usuario'     => $user->id_usuario,
            'correo'         => $user->correo,
            'user'           => $user->load('rol', 'perfil'),
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
     * POST /api/v1/auth/profile/photo
     * Actualiza la foto de perfil del usuario logueado.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto' => ['required', 'image', 'max:5120'], // Max 5MB
        ]);

        $user = $request->user();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('avatars', 'public');
            // En Laravel 11, puedes guardar la ruta o la URL completa
            $user->foto = url('storage/' . $path);
            $user->save();
        }

        return response()->json([
            'message' => 'Foto actualizada',
            'user'    => $user->load('rol', 'perfil')
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

    /**
     * PUT /api/v1/auth/update-email
     * Actualiza el correo del usuario autenticado.
     * Requiere confirmación con la contraseña actual.
     */
    public function updateEmail(Request $request)
    {
        $request->validate([
            'nuevo_email' => ['required', 'email', 'max:150', 'unique:users,correo'],
            'clave'       => ['required', 'string'],
        ], [
            'nuevo_email.unique' => 'Este correo ya está registrado en el sistema.',
            'nuevo_email.email'  => 'Por favor, ingresa un correo electrónico válido.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('clave'), $user->clave_hash)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'La contraseña ingresada es incorrecta.',
            ], 422);
        }

        $nuevoCorreo = strtolower(trim($request->input('nuevo_email')));

        // Actualizar correo y resetear verificación
        $user->correo             = $nuevoCorreo;
        $user->email_verified_at  = null;
        $user->save();

        // Reenviar correo de verificación al nuevo correo
        event(new \Illuminate\Auth\Events\Registered($user));

        return response()->json([
            'status'  => 'success',
            'message' => 'Correo actualizado. Por favor, verifica tu nuevo correo electrónico.',
            'correo'  => $nuevoCorreo,
            'user'    => $user->fresh(['rol', 'perfil']),
        ]);
    }

    /**
     * DELETE /api/v1/perfil/eliminar-cuenta o /api/perfil/eliminar-cuenta
     * Permite al usuario autenticado eliminar su cuenta y todos sus datos personales (requisito Google Play).
     */
    public function eliminarMiCuenta(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);
        }

        $idUsuario = $user->id_usuario;

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $idUsuario) {
            // 1. Revocar todos los tokens de Sanctum
            $user->tokens()->delete();

            // 2. Eliminar registros de auditoría si actuó como administrador
            if (\Illuminate\Support\Facades\Schema::hasTable('registro_auditoria')) {
                \Illuminate\Support\Facades\DB::table('registro_auditoria')
                    ->where('id_administrador', $idUsuario)
                    ->delete();
            }

            // 3. Eliminar verificaciones donde participó
            if (\Illuminate\Support\Facades\Schema::hasTable('verificaciones')) {
                \Illuminate\Support\Facades\DB::table('verificaciones')
                    ->where('id_admin', $idUsuario)
                    ->orWhere('id_usuario_verificado', $idUsuario)
                    ->delete();
            }

            // 4. Eliminar notificaciones
            if (\Illuminate\Support\Facades\Schema::hasTable('notificaciones')) {
                \Illuminate\Support\Facades\DB::table('notificaciones')
                    ->where('id_usuario', $idUsuario)
                    ->orWhere('user_id', $idUsuario)
                    ->delete();
            }

            // 5. Eliminar favoritos
            if (\Illuminate\Support\Facades\Schema::hasTable('favoritos')) {
                \Illuminate\Support\Facades\DB::table('favoritos')
                    ->where('id_usuario', $idUsuario)
                    ->delete();
            }

            // 6. Eliminar solicitudes de reserva donde fue estudiante
            if (\Illuminate\Support\Facades\Schema::hasTable('solicitudes_reserva')) {
                \Illuminate\Support\Facades\DB::table('solicitudes_reserva')
                    ->where('id_estudiante', $idUsuario)
                    ->delete();
            }

            // 7. Eliminar mensajes donde fue remitente o destinatario
            if (\Illuminate\Support\Facades\Schema::hasTable('mensajes')) {
                \Illuminate\Support\Facades\DB::table('mensajes')
                    ->where('id_remitente', $idUsuario)
                    ->orWhere('id_destinatario', $idUsuario)
                    ->delete();
            }

            // 8. Eliminar chats donde participó
            if (\Illuminate\Support\Facades\Schema::hasTable('chats')) {
                \Illuminate\Support\Facades\DB::table('chats')
                    ->where('id_estudiante', $idUsuario)
                    ->orWhere('id_arrendador', $idUsuario)
                    ->delete();
            }

            // 9. Si es arrendador y tiene inmuebles, eliminar sus fotos, ubicaciones, etc.
            if (\Illuminate\Support\Facades\Schema::hasTable('inmuebles')) {
                $inmueblesIds = \Illuminate\Support\Facades\DB::table('inmuebles')
                    ->where('id_arrendador', $idUsuario)
                    ->pluck('id_inmueble')
                    ->toArray();

                if (!empty($inmueblesIds)) {
                    if (\Illuminate\Support\Facades\Schema::hasTable('fotografias')) {
                        \Illuminate\Support\Facades\DB::table('fotografias')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('ubicaciones')) {
                        \Illuminate\Support\Facades\DB::table('ubicaciones')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('inmueble_servicio')) {
                        \Illuminate\Support\Facades\DB::table('inmueble_servicio')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('solicitudes_reserva')) {
                        \Illuminate\Support\Facades\DB::table('solicitudes_reserva')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('mensajes')) {
                        \Illuminate\Support\Facades\DB::table('mensajes')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('chats')) {
                        \Illuminate\Support\Facades\DB::table('chats')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('favoritos')) {
                        \Illuminate\Support\Facades\DB::table('favoritos')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    if (\Illuminate\Support\Facades\Schema::hasTable('verificaciones')) {
                        \Illuminate\Support\Facades\DB::table('verificaciones')->whereIn('id_inmueble', $inmueblesIds)->delete();
                    }
                    \Illuminate\Support\Facades\DB::table('inmuebles')->where('id_arrendador', $idUsuario)->delete();
                }
            }

            // 10. Eliminar perfil
            if (\Illuminate\Support\Facades\Schema::hasTable('perfiles')) {
                \Illuminate\Support\Facades\DB::table('perfiles')->where('id_usuario', $idUsuario)->delete();
            }

            // 11. Eliminar físicamente al usuario
            $user->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Tu cuenta y todos tus datos han sido eliminados correctamente.'
        ]);
    }
}
