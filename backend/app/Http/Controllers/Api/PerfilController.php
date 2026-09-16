<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use Illuminate\Http\Request;

class PerfilController extends Controller
{
    /**
     * GET /api/v1/perfil
     * Devuelve el perfil del usuario autenticado.
     */
    public function show(Request $request)
    {
        $user   = $request->user();
        $perfil = $user->perfil;

        if (! $perfil) {
            // Crear perfil vacío si aún no existe
            $perfil = Perfil::create(['id_usuario' => $user->id_usuario]);
        }

        return response()->json([
            'user'   => $user->only(['id_usuario', 'nombres', 'correo', 'estado', 'id_rol']),
            'perfil' => $perfil,
            'rol'    => $user->rol->nombre,
        ]);
    }

    /**
     * PUT /api/v1/perfil
     * Actualiza el perfil del usuario autenticado.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'telefono'      => ['nullable', 'string', 'max:20'],
            'ciudad_origen' => ['nullable', 'string', 'max:100'],
            'documento_tipo' => ['nullable', 'string', 'max:30'],
            // foto_perfil_url y documento_url se manejan con subida de archivo
        ]);

        $perfil = $user->perfil ?? Perfil::create(['id_usuario' => $user->id_usuario]);
        $perfil->update($data);

        // Actualizar nombres si se envían
        if ($request->has('nombres') && $request->nombres) {
            $user->update(['nombres' => $request->validate([
                'nombres' => ['string', 'max:150'],
            ])['nombres']]);
        }

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'perfil'  => $perfil->fresh(),
            'user'    => $user->fresh()->only(['id_usuario', 'nombres', 'correo', 'estado']),
        ]);
    }

    /**
     * POST /api/v1/perfil/foto
     * Subir foto de perfil (imagen).
     */
    public function uploadFoto(Request $request)
    {
        $request->validate([
            'foto' => ['required', 'image', 'max:5120', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = $request->user();
        $path = $request->file('foto')->store(
            "perfiles/{$user->id_usuario}",
            'public'
        );

        $url = asset("storage/{$path}");

        $perfil = $user->perfil ?? Perfil::create(['id_usuario' => $user->id_usuario]);
        $perfil->update(['foto_perfil_url' => $url]);

        return response()->json([
            'message'        => 'Foto de perfil actualizada.',
            'foto_perfil_url' => $url,
        ]);
    }
}
