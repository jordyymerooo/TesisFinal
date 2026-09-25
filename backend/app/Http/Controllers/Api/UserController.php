<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inmueble;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Crear un nuevo usuario (estudiante o arrendador) desde el panel de administración.
     * POST /api/v1/admin/usuarios
     */
    public function storeAsAdmin(Request $request): JsonResponse
    {
        $nombres = $request->input('nombre_completo', $request->input('nombres'));
        $correo = $request->input('email', $request->input('correo'));
        $password = $request->input('password', $request->input('clave'));

        $request->merge([
            'nombres' => $nombres,
            'correo' => $correo,
            'password' => $password,
        ]);

        $request->validate([
            'nombres'        => 'required|string|max:150',
            'correo'         => 'required|email|max:150|unique:users,correo',
            'password'       => 'required|string|min:6',
            'identificacion' => 'nullable|string|max:30',
            'cedula'         => 'nullable|string|max:30',
            'telefono'       => 'nullable|string|max:30',
            'ciudad_origen'  => 'nullable|string|max:100',
            'rol'            => 'nullable',
            'id_rol'         => 'nullable',
        ], [
            'correo.unique' => 'El correo electrónico ya se encuentra registrado en el sistema.',
            'correo.email'  => 'Ingresa un correo electrónico válido.',
            'nombres.required' => 'El nombre completo es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        // Determinar id_rol según lo que envíe el front
        $rolInput = $request->input('rol', $request->input('id_rol', 'estudiante'));
        $idRol = 1; // Default: 1 = estudiante

        if (is_numeric($rolInput)) {
            $num = (int) $rolInput;
            if ($num === 2) {
                $idRol = 2; // arrendador
            } elseif ($num === 3) {
                $idRol = 3; // administrador
            } else {
                $idRol = 1; // estudiante
            }
        } else {
            $rolStr = strtolower(trim((string) $rolInput));
            if ($rolStr === 'arrendador') {
                $idRol = 2;
            } elseif ($rolStr === 'administrador') {
                $idRol = 3;
            } else {
                $idRol = 1; // estudiante
            }
        }

        // Crear usuario con clave encriptada mediante Hash::make
        $usuario = User::create([
            'nombres'    => $nombres,
            'correo'     => $correo,
            'clave_hash' => Hash::make($password),
            'id_rol'     => $idRol,
            'estado'     => 'activo', // Activo para que pueda iniciar sesión de inmediato
        ]);

        // Crear perfil asociado
        $telefono = $request->input('telefono');
        $ciudadOrigen = $request->input('ciudad_origen', 'Manta');
        $cedula = $request->input('identificacion', $request->input('cedula'));

        $perfil = Perfil::create([
            'id_usuario'           => $usuario->id_usuario,
            'telefono'             => $telefono,
            'ciudad_origen'        => $ciudadOrigen,
            'documento_verificado' => ($idRol === 1), // Estudiantes verificados por defecto
        ]);

        $usuario->load(['rol', 'perfil']);

        $rolNombre = strtolower($usuario->rol?->nombre ?? ($idRol === 2 ? 'arrendador' : 'estudiante'));
        $avatar = "https://ui-avatars.com/api/?name=" . urlencode($usuario->nombres) . "&background=8C1515&color=fff&size=128";
        $cedulaFinal = $cedula ?: ($perfil->telefono ? '13' . substr(preg_replace('/\D/', '', $perfil->telefono) . '00000000', 0, 8) : '13' . str_pad((string) $usuario->id_usuario, 8, '0', STR_PAD_LEFT));

        $userData = [
            'id_usuario'           => $usuario->id_usuario,
            'id'                   => $usuario->id_usuario,
            'nombres'              => $usuario->nombres,
            'correo'               => $usuario->correo,
            'cedula'               => $cedulaFinal,
            'rol'                  => $rolNombre,
            'estado'               => $usuario->estado,
            'avatar'               => $avatar,
            'telefono'             => $perfil->telefono,
            'ciudad_origen'        => $perfil->ciudad_origen,
            'documento_verificado' => (bool) $perfil->documento_verificado,
            'created_at'           => $usuario->created_at ? $usuario->created_at->format('d M Y') : 'Hoy',
        ];

        return response()->json([
            'status'  => 'success',
            'message' => 'Usuario creado correctamente.',
            'user'    => $userData,
            'data'    => $userData,
        ], 201);
    }

    /**
     * Alternar estado de un usuario entre 'activo' y 'suspendido'.
     * PATCH /api/v1/admin/usuarios/{id}/estado
     */
    public function toggleStatus($id): JsonResponse
    {
        $usuario = User::with('rol')->findOrFail($id);

        $estadoActual = strtolower($usuario->estado ?? 'activo');
        $nuevoEstado = ($estadoActual === 'activo') ? 'suspendido' : 'activo';

        $usuario->estado = $nuevoEstado;
        $usuario->save();

        $inmueblesAfectados = 0;

        // Lógica vital: Si el usuario que se acaba de suspender tiene el rol de 'arrendador',
        // ejecuta una consulta masiva para ocultar sus inmuebles
        if ($nuevoEstado === 'suspendido' && ($usuario->esArrendador() || $usuario->id_rol === 2)) {
            $inmueblesAfectados = Inmueble::where('id_arrendador', $usuario->id_usuario)
                ->update(['estado' => 'oculto_por_admin']);
        } elseif ($nuevoEstado === 'activo' && ($usuario->esArrendador() || $usuario->id_rol === 2)) {
            // Si se reactiva, devolver a 'disponible' los que fueron ocultados por el admin
            $inmueblesAfectados = Inmueble::where('id_arrendador', $usuario->id_usuario)
                ->where('estado', 'oculto_por_admin')
                ->update(['estado' => 'disponible']);
        }

        return response()->json([
            'status'              => 'success',
            'message'             => "El usuario {$usuario->nombres} ahora está {$nuevoEstado}.",
            'estado'              => $nuevoEstado,
            'id_usuario'          => $usuario->id_usuario,
            'inmuebles_afectados' => $inmueblesAfectados,
            'data'                => [
                'id_usuario'          => $usuario->id_usuario,
                'id'                  => $usuario->id_usuario,
                'estado'              => $nuevoEstado,
                'nombres'             => $usuario->nombres,
                'inmuebles_afectados' => $inmueblesAfectados,
            ],
        ]);
    }

    /**
     * Actualizar datos de un usuario desde el panel de administración.
     * PUT /api/v1/admin/usuarios/{id}
     */
    public function updateAsAdmin(Request $request, $id): JsonResponse
    {
        $usuario = User::with(['rol', 'perfil'])->findOrFail($id);

        $request->validate([
            'nombres'         => 'sometimes|string|max:150',
            'nombre_completo' => 'sometimes|string|max:150',
            'correo'          => 'sometimes|email|max:150|unique:users,correo,' . $usuario->id_usuario . ',id_usuario',
            'telefono'        => 'nullable|string|max:30',
            'ciudad_origen'   => 'nullable|string|max:100',
            'estado'          => 'sometimes|string|in:activo,suspendido,pendiente',
        ]);

        if ($request->filled('nombres')) {
            $usuario->nombres = $request->input('nombres');
        } elseif ($request->filled('nombre_completo')) {
            $usuario->nombres = $request->input('nombre_completo');
        }

        if ($request->filled('correo')) {
            $usuario->correo = $request->input('correo');
        }

        if ($request->filled('estado')) {
            $usuario->estado = $request->input('estado');
        }

        $usuario->save();

        // Actualizar datos del perfil
        $perfil = $usuario->perfil;
        if (!$perfil) {
            $perfil = new \App\Models\Perfil();
            $perfil->id_usuario = $usuario->id_usuario;
        }

        if ($request->has('telefono')) {
            $perfil->telefono = $request->input('telefono');
        }

        if ($request->has('ciudad_origen')) {
            $perfil->ciudad_origen = $request->input('ciudad_origen');
        }

        $perfil->save();

        $usuario->load(['rol', 'perfil']);

        return response()->json([
            'status'  => 'success',
            'message' => "Usuario {$usuario->nombres} actualizado exitosamente.",
            'data'    => [
                'id_usuario'      => $usuario->id_usuario,
                'id'              => $usuario->id_usuario,
                'nombres'         => $usuario->nombres,
                'correo'          => $usuario->correo,
                'cedula'          => $perfil->telefono ? '13' . substr(preg_replace('/\D/', '', $perfil->telefono) . '00000000', 0, 8) : '13' . str_pad((string)$usuario->id_usuario, 8, '0', STR_PAD_LEFT),
                'rol'             => strtolower($usuario->rol?->nombre ?? 'estudiante'),
                'estado'          => $usuario->estado,
                'telefono'        => $perfil->telefono,
                'ciudad_origen'   => $perfil->ciudad_origen,
            ],
        ]);
    }

    /**
     * Eliminar físicamente un usuario y todas sus dependencias desde el panel.
     * DELETE /api/v1/admin/usuarios/{id} o /api/admin/usuarios/{id}
     */
    public function destroy($id): JsonResponse
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'El usuario no fue encontrado en el sistema.',
            ], 404);
        }

        $nombre = $usuario->nombres;
        $idUsuario = $usuario->id_usuario;

        \Illuminate\Support\Facades\DB::transaction(function () use ($usuario, $idUsuario) {
            // 1. Eliminar tokens de Sanctum
            $usuario->tokens()->delete();

            // 2. Eliminar registros de auditoría si actuó como administrador
            if (\Illuminate\Support\Facades\Schema::hasTable('registro_auditoria')) {
                \Illuminate\Support\Facades\DB::table('registro_auditoria')
                    ->where('id_administrador', $idUsuario)
                    ->delete();
            }

            // 3. Eliminar verificaciones donde participó como admin o verificado
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

            // 8. Eliminar chats donde fue estudiante o arrendador
            if (\Illuminate\Support\Facades\Schema::hasTable('chats')) {
                \Illuminate\Support\Facades\DB::table('chats')
                    ->where('id_estudiante', $idUsuario)
                    ->orWhere('id_arrendador', $idUsuario)
                    ->delete();
            }

            // 9. Si tiene inmuebles publicados o en revisión, eliminar sus relaciones hijas y los inmuebles
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

            // 11. Eliminar físicamente el usuario
            $usuario->delete();
        });

        return response()->json([
            'status'  => 'success',
            'message' => "Usuario {$nombre} y todos sus datos relacionados fueron eliminados exitosamente.",
        ], 200);
    }

    /**
     * POST /api/user/foto
     * Actualiza la foto de perfil del usuario autenticado.
     */
    public function updateFoto(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'max:10240'], // hasta 10MB
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        // Eliminar foto anterior si existe en disco público
        if ($user->foto_perfil && Storage::disk('public')->exists($user->foto_perfil)) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        $path = $request->file('foto')->store('avatars', 'public');
        $url  = asset("storage/{$path}");

        $user->update(['foto_perfil' => $path]);

        // Sincronizar también con la relación perfil
        if ($user->perfil) {
            $user->perfil->update(['foto_perfil_url' => $url]);
        } else {
            Perfil::create([
                'id_usuario'      => $user->id_usuario,
                'foto_perfil_url' => $url,
            ]);
        }

        return response()->json([
            'status'          => 'success',
            'message'         => 'Foto de perfil actualizada exitosamente.',
            'url'             => $url,
            'foto_perfil_url' => $url,
            'foto_perfil'     => $path,
            'user'            => $user->fresh(['perfil', 'rol']),
        ]);
    }

    /**
     * DELETE /api/admin/usuarios/{id}/foto
     * Elimina la foto de perfil del usuario especificado (moderación admin).
     */
    public function removeFotoAsAdmin($id): JsonResponse
    {
        $usuario = User::find($id);
        if (!$usuario) {
            return response()->json(['status' => 'error', 'message' => 'Usuario no encontrado.'], 404);
        }

        if ($usuario->foto_perfil) {
            Storage::disk('public')->delete($usuario->foto_perfil);
        }

        if ($usuario->perfil) {
            if ($usuario->perfil->foto_perfil_url) {
                $rawPath = str_replace(asset('storage/'), '', $usuario->perfil->foto_perfil_url);
                $rawPath = ltrim(str_replace('/storage/', '', $rawPath), '/');
                if ($rawPath && Storage::disk('public')->exists($rawPath)) {
                    Storage::disk('public')->delete($rawPath);
                }
            }
            $usuario->perfil->update(['foto_perfil_url' => null]);
        }

        $usuario->update(['foto_perfil' => null]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Foto de perfil eliminada exitosamente.',
        ], 200);
    }

    /**
     * POST /api/v1/user/push-token
     * Guarda o actualiza el Expo Push Token del usuario autenticado.
     * Se llama desde la app al iniciar sesión o al obtener un nuevo token.
     */
    public function registerPushToken(Request $request): JsonResponse
    {
        $request->validate([
            'expo_push_token' => ['required', 'string', 'max:200'],
        ]);

        $user = $request->user();
        $user->update(['expo_push_token' => $request->input('expo_push_token')]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Token de notificaciones registrado correctamente.',
        ], 200);
    }
}



